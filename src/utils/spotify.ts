export const SPOTIFY_PROXY = '/api/spotify';

const SPOTIFY_FAILURE_BACKOFF_MS = 10_000;

let spotifyBackoffUntil = 0;

export type SpotifyResult<T> =
  | { kind: 'success'; data: T }
  | { kind: 'empty' }
  | { kind: 'unavailable' };

export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpotifyImage {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  albumName: string;
  image: SpotifyImage | null;
  artists: string[];
  spotifyUrl: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  image: SpotifyImage | null;
  genres: string[];
  spotifyUrl: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  image: SpotifyImage | null;
  ownerName: string | null;
  trackCount: number | null;
  spotifyUrl: string;
}

type SpotifyResource =
  | 'now-playing'
  | 'top-tracks'
  | 'top-artists'
  | 'favourite-playlist'
  | 'recently-played'
  | 'saved-tracks'
  | 'saved-playlists';

interface SpotifyCacheEntry {
  result: SpotifyResult<unknown>;
  expiresAt: number;
}

const spotifyResponseCache = new Map<string, SpotifyCacheEntry>();
const spotifyInflightRequests = new Map<
  string,
  Promise<SpotifyResult<unknown>>
>();

function spotifySuccess<T>(data: T): SpotifyResult<T> {
  return { kind: 'success', data };
}

function spotifyEmpty<T>(): SpotifyResult<T> {
  return { kind: 'empty' };
}

function spotifyUnavailable<T>(): SpotifyResult<T> {
  return { kind: 'unavailable' };
}

function startSpotifyBackoff(durationMs: number): boolean {
  const now = Date.now();
  const shouldLog = now >= spotifyBackoffUntil;

  spotifyBackoffUntil = Math.max(spotifyBackoffUntil, now + durationMs);
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

function retryAfterMilliseconds(response: Response): number | null {
  const retryAfter = response.headers.get('retry-after');
  if (!retryAfter || !/^[1-9]\d*$/.test(retryAfter)) {
    return null;
  }

  const seconds = Number(retryAfter);
  if (!Number.isSafeInteger(seconds)) {
    return null;
  }

  return Math.min(seconds * 1000, Number.MAX_SAFE_INTEGER - Date.now());
}

async function logSpotifyResponseFailure(
  response: Response,
  retryAfterMs: number | null,
) {
  const body: unknown = await response.json().catch(() => null);

  if (hasSpotifyErrorCode(body, 'reauthorization_required')) {
    console.warn(
      '[spotify] Authorization needs renewal. Update SPOTIFY_REFRESH_TOKEN and redeploy.',
    );
    return;
  }

  if (hasSpotifyErrorCode(body, 'rate_limited')) {
    const retryMessage = retryAfterMs
      ? ` Retrying is paused for ${Math.ceil(retryAfterMs / 1000)} seconds.`
      : '';
    console.warn(`[spotify] Spotify rate limit reached.${retryMessage}`);
    return;
  }

  console.warn(`[spotify] Request failed with HTTP ${response.status}.`);
}

function responseCacheLifetimeMs(response: Response): number {
  const cacheControl = response.headers.get('cache-control');
  if (!cacheControl) {
    return 0;
  }

  const directives = cacheControl
    .toLowerCase()
    .split(',')
    .map((directive) => directive.trim());

  if (
    directives.includes('no-store') ||
    directives.includes('no-cache') ||
    directives.includes('private')
  ) {
    return 0;
  }

  const maxAgeDirective = directives.find((directive) =>
    /^max-age=\d+$/.test(directive),
  );
  if (!maxAgeDirective) {
    return 0;
  }

  const seconds = Number(maxAgeDirective.slice('max-age='.length));
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds * 1000 : 0;
}

async function spotifyGet<T>(
  resource: SpotifyResource,
  params: { range?: SpotifyTimeRange } = {},
): Promise<SpotifyResult<T>> {
  const query = new URLSearchParams({ resource });
  if (params.range) {
    query.set('range', params.range);
  }

  const cacheKey = query.toString();
  const cached = spotifyResponseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result as SpotifyResult<T>;
  }

  const inflight = spotifyInflightRequests.get(cacheKey);
  if (inflight) {
    return (await inflight) as SpotifyResult<T>;
  }

  if (spotifyBackoffUntil > Date.now()) {
    return spotifyUnavailable();
  }

  const request = (async (): Promise<SpotifyResult<T>> => {
    try {
      const response = await fetch(`${SPOTIFY_PROXY}?${query}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const retryAfterMs = retryAfterMilliseconds(response);
        const backoffMs = retryAfterMs ?? SPOTIFY_FAILURE_BACKOFF_MS;
        if (startSpotifyBackoff(backoffMs)) {
          await logSpotifyResponseFailure(response, retryAfterMs);
        }
        return spotifyUnavailable();
      }

      const result =
        response.status === 204
          ? spotifyEmpty<T>()
          : spotifySuccess((await response.json()) as T);

      spotifyBackoffUntil = 0;
      const cacheLifetime = responseCacheLifetimeMs(response);
      if (cacheLifetime > 0) {
        spotifyResponseCache.set(cacheKey, {
          result,
          expiresAt: Date.now() + cacheLifetime,
        });
      }

      return result;
    } catch (error) {
      if (startSpotifyBackoff(SPOTIFY_FAILURE_BACKOFF_MS)) {
        console.warn(
          '[spotify] Request failed before Spotify responded.',
          error,
        );
      }
      return spotifyUnavailable();
    }
  })();

  spotifyInflightRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    spotifyInflightRequests.delete(cacheKey);
  }
}

async function spotifyCollection<T>(
  resource: SpotifyResource,
  params: { range?: SpotifyTimeRange } = {},
): Promise<SpotifyResult<T[]>> {
  const result = await spotifyGet<T[]>(resource, params);

  if (result.kind !== 'success') {
    return result;
  }

  if (!Array.isArray(result.data)) {
    if (startSpotifyBackoff(SPOTIFY_FAILURE_BACKOFF_MS)) {
      console.warn('[spotify] Response shape was invalid.');
    }
    return spotifyUnavailable();
  }

  return result.data.length > 0 ? result : spotifyEmpty();
}

export function fetchCurrentTrack(): Promise<SpotifyResult<SpotifyTrack>> {
  return spotifyGet('now-playing');
}

export function fetchFavouritePlaylist(): Promise<
  SpotifyResult<SpotifyPlaylist>
> {
  return spotifyGet('favourite-playlist');
}

export function fetchTopTracks(
  range: SpotifyTimeRange,
): Promise<SpotifyResult<SpotifyTrack[]>> {
  return spotifyCollection('top-tracks', { range });
}

export function fetchTopArtists(
  range: SpotifyTimeRange,
): Promise<SpotifyResult<SpotifyArtist[]>> {
  return spotifyCollection('top-artists', { range });
}

export function fetchRecentlyPlayedTracks(): Promise<
  SpotifyResult<SpotifyTrack[]>
> {
  return spotifyCollection('recently-played');
}

export function fetchSavedTracks(): Promise<SpotifyResult<SpotifyTrack[]>> {
  return spotifyCollection('saved-tracks');
}

export function fetchSavedPlaylists(): Promise<
  SpotifyResult<SpotifyPlaylist[]>
> {
  return spotifyCollection('saved-playlists');
}
