import { z } from 'zod';

import { HttpResponseError, isAbortError, request } from './http.ts';

export const SPOTIFY_PROXY = '/.netlify/functions/spotify';
const SPOTIFY_FAILURE_BACKOFF_MS = 10_000;

let spotifyBackoffUntil = 0;

export type SpotifyResult<T> =
  | { kind: 'success'; data: T }
  | { kind: 'empty' }
  | { kind: 'unavailable' };

function spotifySuccess<T>(data: T): SpotifyResult<T> {
  return { kind: 'success', data };
}

function spotifyEmpty<T>(): SpotifyResult<T> {
  return { kind: 'empty' };
}

function spotifyUnavailable<T>(): SpotifyResult<T> {
  return { kind: 'unavailable' };
}

function startSpotifyBackoff(): boolean {
  const now = Date.now();
  const shouldLog = now >= spotifyBackoffUntil;

  spotifyBackoffUntil = now + SPOTIFY_FAILURE_BACKOFF_MS;
  return shouldLog;
}

function hasSpotifyErrorCode(value: unknown, code: string): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    value.error === code
  );
}

function logSpotifyResponseFailure(error: HttpResponseError) {
  if (hasSpotifyErrorCode(error.body, 'reauthorization_required')) {
    console.warn(
      '[spotify] Authorization needs renewal. Update SPOTIFY_REFRESH_TOKEN and redeploy.',
    );
    return;
  }

  console.warn(`[spotify] Request failed with HTTP ${error.status}.`);
}

const spotifyExternalUrlsSchema = z.object({
  spotify: z.url().optional(),
});

const spotifyOwnerSchema = z.object({
  display_name: z.string().optional(),
});

export const spotifyImageSchema = z.object({
  url: z.url(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
});

export const spotifyArtistSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  external_urls: spotifyExternalUrlsSchema.optional(),
  genres: z.array(z.string()).optional(),
  images: z.array(spotifyImageSchema).optional(),
});

export const spotifyAlbumSchema = z.object({
  name: z.string().optional(),
  images: z.array(spotifyImageSchema).optional(),
});

export const spotifyTrackSchema = z.object({
  id: z.string().optional(),
  album: spotifyAlbumSchema.optional(),
  artists: z.array(spotifyArtistSchema).optional(),
  external_urls: spotifyExternalUrlsSchema.optional(),
  name: z.string().min(1),
  preview_url: z.url().nullable().optional(),
});

export const spotifyRecentlyPlayedItemSchema = z.object({
  track: spotifyTrackSchema.nullable().optional(),
});

export const spotifySavedTrackItemSchema = z.object({
  track: spotifyTrackSchema.nullable().optional(),
});

export const spotifyPlaylistSchema = z.object({
  id: z.string().optional(),
  external_urls: spotifyExternalUrlsSchema.optional(),
  images: z.array(spotifyImageSchema).optional(),
  items: z
    .object({ total: z.number().int().nonnegative().optional() })
    .optional(),
  name: z.string().min(1),
  owner: spotifyOwnerSchema.optional(),
  tracks: z
    .object({ total: z.number().int().nonnegative().optional() })
    .optional(),
});

function spotifyPagingResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema).optional(),
    href: z.url().optional(),
    next: z.url().nullable().optional(),
    total: z.number().int().nonnegative().optional(),
  });
}

const spotifyCurrentTrackResponseSchema = z.object({
  currently_playing_type: z.string().optional(),
  item: spotifyTrackSchema.optional(),
});

const spotifyPlaylistPageSchema = spotifyPagingResponseSchema(
  spotifyPlaylistSchema,
);
const spotifyRecentlyPlayedPageSchema = spotifyPagingResponseSchema(
  spotifyRecentlyPlayedItemSchema,
);
const spotifySavedTrackPageSchema = spotifyPagingResponseSchema(
  spotifySavedTrackItemSchema,
);
const spotifyArtistPageSchema =
  spotifyPagingResponseSchema(spotifyArtistSchema);
const spotifyTrackPageSchema = spotifyPagingResponseSchema(spotifyTrackSchema);

type SpotifyTopItemType = 'artists' | 'tracks';

type SpotifyTopItem<T extends SpotifyTopItemType> = T extends 'artists'
  ? SpotifyArtist
  : SpotifyTrack;

export type SpotifyImage = z.infer<typeof spotifyImageSchema>;
export type SpotifyArtist = z.infer<typeof spotifyArtistSchema>;
export type SpotifyAlbum = z.infer<typeof spotifyAlbumSchema>;
export type SpotifyTrack = z.infer<typeof spotifyTrackSchema>;
export type SpotifyRecentlyPlayedItem = z.infer<
  typeof spotifyRecentlyPlayedItemSchema
>;
export type SpotifySavedTrackItem = z.infer<typeof spotifySavedTrackItemSchema>;
export type SpotifyPlaylist = z.infer<typeof spotifyPlaylistSchema>;
type SpotifyCurrentTrackResponse = z.infer<
  typeof spotifyCurrentTrackResponseSchema
>;
type SpotifyPagingResponse<T> = {
  items?: T[];
  href?: string;
  next?: string | null;
  total?: number;
};

// Module-level cache: survives island remounts and ClientRouter soft
// navigations, so widgets re-entering the page reuse recent data instead
// of re-hitting the serverless proxy. In-flight dedupe collapses
// concurrent identical requests (e.g. hero + footer now-playing).
const SPOTIFY_NOW_PLAYING_TTL_MS = 30_000;
const SPOTIFY_LIBRARY_TTL_MS = 5 * 60_000;

interface SpotifyCacheEntry {
  result: SpotifyResult<unknown>;
  expiresAt: number;
}

interface SpotifyInflightEntry {
  controller: AbortController;
  consumers: number;
  promise: Promise<SpotifyResult<unknown>>;
}

const spotifyResponseCache = new Map<string, SpotifyCacheEntry>();
const spotifyInflightRequests = new Map<string, SpotifyInflightEntry>();

function cacheTtlForPath(path: string): number {
  return path === '/me/player/currently-playing'
    ? SPOTIFY_NOW_PLAYING_TTL_MS
    : SPOTIFY_LIBRARY_TTL_MS;
}

interface SpotifyRequestOptions {
  signal?: AbortSignal;
}

function materializeResult<T>(
  result: SpotifyResult<unknown>,
  schema: z.ZodType<T>,
): SpotifyResult<T> {
  switch (result.kind) {
    case 'success':
      return spotifySuccess(schema.parse(result.data));
    case 'empty':
      return spotifyEmpty();
    case 'unavailable':
      return spotifyUnavailable();
    default: {
      const _exhaustive: never = result;
      return _exhaustive;
    }
  }
}

function createAbortError(): DOMException {
  return new DOMException('The operation was aborted', 'AbortError');
}

function awaitWithSignal<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', onAbort);
    const onAbort = () => {
      cleanup();
      reject(signal.reason ?? createAbortError());
    };

    if (signal.aborted) {
      onAbort();
      return;
    }

    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error: unknown) => {
        cleanup();
        reject(error);
      },
    );
  });
}

async function waitForSpotifyResult<T>(
  key: string,
  entry: SpotifyInflightEntry,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<SpotifyResult<T>> {
  entry.consumers += 1;

  try {
    const result = signal
      ? await awaitWithSignal(entry.promise, signal)
      : await entry.promise;

    return materializeResult(result, schema);
  } finally {
    entry.consumers -= 1;
    if (entry.consumers === 0 && spotifyInflightRequests.get(key) === entry) {
      entry.controller.abort();
    }
  }
}

async function spotifyGet<T>(
  path: string,
  schema: z.ZodType<T>,
  params: Record<string, string | number> = {},
  { signal }: SpotifyRequestOptions = {},
): Promise<SpotifyResult<T>> {
  const qs = new URLSearchParams({
    path,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ),
  });
  const cacheKey = qs.toString();

  const cached = spotifyResponseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    if (signal?.aborted) {
      throw signal.reason ?? createAbortError();
    }
    return materializeResult(cached.result, schema);
  }

  if (signal?.aborted) {
    throw signal.reason ?? createAbortError();
  }

  if (spotifyBackoffUntil > Date.now()) {
    return spotifyUnavailable();
  }

  let inflight = spotifyInflightRequests.get(cacheKey);
  if (!inflight) {
    const controller = new AbortController();
    const promise = (async (): Promise<SpotifyResult<unknown>> => {
      try {
        const response = await request(`${SPOTIFY_PROXY}?${qs.toString()}`, {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        });

        if (response.status === 204 || response.status === 202) {
          spotifyBackoffUntil = 0;
          const result = spotifyEmpty();
          spotifyResponseCache.set(cacheKey, {
            result,
            expiresAt: Date.now() + cacheTtlForPath(path),
          });
          return result;
        }

        const body: unknown = await response.json();
        const result = spotifySuccess(schema.parse(body));

        spotifyBackoffUntil = 0;
        // Cache successful responses and empty answers for their normal TTL.
        spotifyResponseCache.set(cacheKey, {
          result,
          expiresAt: Date.now() + cacheTtlForPath(path),
        });

        return result;
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }

        if (startSpotifyBackoff()) {
          if (error instanceof HttpResponseError) {
            logSpotifyResponseFailure(error);
          } else {
            console.warn(
              '[spotify] Request failed before Spotify responded.',
              error,
            );
          }
        }
        return spotifyUnavailable();
      }
    })();

    inflight = { controller, consumers: 0, promise };
    spotifyInflightRequests.set(cacheKey, inflight);
    const cleanup = () => {
      if (spotifyInflightRequests.get(cacheKey) === inflight) {
        spotifyInflightRequests.delete(cacheKey);
      }
    };
    void promise.then(cleanup, cleanup);
  }

  return waitForSpotifyResult(cacheKey, inflight, schema, signal);
}

export async function fetchCurrentTrack({
  signal,
}: SpotifyRequestOptions = {}): Promise<SpotifyResult<SpotifyTrack>> {
  const result = await spotifyGet<SpotifyCurrentTrackResponse>(
    '/me/player/currently-playing',
    spotifyCurrentTrackResponseSchema,
    {},
    { signal },
  );

  if (result.kind !== 'success') {
    return result;
  }

  const { data } = result;

  if (data.currently_playing_type === 'track' && data.item) {
    return spotifySuccess(data.item);
  }

  return spotifyEmpty();
}

export async function fetchPlaylistById(
  playlistId: string,
  { signal }: SpotifyRequestOptions = {},
): Promise<SpotifyResult<SpotifyPlaylist>> {
  return spotifyGet(
    `/playlists/${playlistId}`,
    spotifyPlaylistSchema,
    {},
    { signal },
  );
}

export async function fetchCurrentUserPlaylists(
  limit = 20,
  { signal }: SpotifyRequestOptions = {},
): Promise<SpotifyResult<SpotifyPagingResponse<SpotifyPlaylist>>> {
  const result = await spotifyGet(
    '/me/playlists',
    spotifyPlaylistPageSchema,
    { limit },
    { signal },
  );

  if (result.kind !== 'success') {
    return result;
  }

  if (result.data.items?.length) {
    return result;
  }

  return spotifyEmpty();
}

export async function fetchCurrentUsersRecentlyPlayed(
  limit = 20,
  { signal }: SpotifyRequestOptions = {},
): Promise<SpotifyResult<SpotifyPagingResponse<SpotifyRecentlyPlayedItem>>> {
  const result = await spotifyGet(
    '/me/player/recently-played',
    spotifyRecentlyPlayedPageSchema,
    { limit },
    { signal },
  );

  if (result.kind !== 'success') {
    return result;
  }

  if (result.data.items?.length) {
    return result;
  }

  return spotifyEmpty();
}

export async function fetchCurrentUsersSavedTracks(
  limit = 20,
  { signal }: SpotifyRequestOptions = {},
): Promise<SpotifyResult<SpotifyPagingResponse<SpotifySavedTrackItem>>> {
  const result = await spotifyGet(
    '/me/tracks',
    spotifySavedTrackPageSchema,
    { limit },
    { signal },
  );

  if (result.kind !== 'success') {
    return result;
  }

  if (result.data.items?.length) {
    return result;
  }

  return spotifyEmpty();
}

export async function fetchCurrentUsersTopItems<T extends SpotifyTopItemType>(
  type: T,
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'short_term',
  limit = 20,
  { signal }: SpotifyRequestOptions = {},
): Promise<SpotifyResult<SpotifyPagingResponse<SpotifyTopItem<T>>>> {
  const schema =
    type === 'artists' ? spotifyArtistPageSchema : spotifyTrackPageSchema;
  const result = await spotifyGet(
    `/me/top/${type}`,
    schema,
    { time_range: timeRange, limit },
    { signal },
  );

  if (result.kind !== 'success') {
    return result;
  }

  if (result.data.items?.length) {
    return result;
  }

  return spotifyEmpty();
}

export function pickSpotifyCoverImage(
  images?: SpotifyImage[] | null,
): SpotifyImage | null {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return images[1] ?? images[0] ?? null;
}

export function getPlaylistTrackTotal(
  playlist?: Pick<SpotifyPlaylist, 'items' | 'tracks'> | null,
): number | null {
  const total = playlist?.items?.total ?? playlist?.tracks?.total;
  return typeof total === 'number' ? total : null;
}
