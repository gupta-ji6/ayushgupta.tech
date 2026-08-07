export const SPOTIFY_PROXY = '/.netlify/functions/spotify';
const SPOTIFY_FAILURE_BACKOFF_MS = 10_000;

let spotifyBackoffUntil = 0;

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

async function logSpotifyResponseFailure(response: Response) {
  const body: unknown = await response.json().catch(() => null);

  if (hasSpotifyErrorCode(body, 'reauthorization_required')) {
    console.warn(
      '[spotify] Authorization needs renewal. Update SPOTIFY_REFRESH_TOKEN and redeploy.',
    );
    return;
  }

  console.warn(`[spotify] Request failed with HTTP ${response.status}.`);
}

interface SpotifyExternalUrls {
  spotify?: string;
}

interface SpotifyOwner {
  display_name?: string;
}

interface SpotifyPagingResponse<T> {
  items?: T[];
  href?: string;
  next?: string | null;
  total?: number;
}

interface SpotifyCurrentTrackResponse {
  currently_playing_type?: string;
  item?: SpotifyTrack;
}

export interface SpotifyImage {
  url: string;
  height?: number | null;
  width?: number | null;
}

export interface SpotifyArtist {
  id?: string;
  name: string;
  external_urls?: SpotifyExternalUrls;
  genres?: string[];
  images?: SpotifyImage[];
}

export interface SpotifyAlbum {
  name?: string;
  images?: SpotifyImage[];
}

export interface SpotifyTrack {
  id?: string;
  album?: SpotifyAlbum;
  artists?: SpotifyArtist[];
  external_urls?: SpotifyExternalUrls;
  name: string;
  preview_url?: string | null;
}

export interface SpotifyRecentlyPlayedItem {
  track?: SpotifyTrack | null;
}

export interface SpotifySavedTrackItem {
  track?: SpotifyTrack | null;
}

export interface SpotifyPlaylist {
  id?: string;
  external_urls?: SpotifyExternalUrls;
  images?: SpotifyImage[];
  items?: { total?: number };
  name: string;
  owner?: SpotifyOwner;
  tracks?: { total?: number };
}

// Module-level cache: survives island remounts and ClientRouter soft
// navigations, so widgets re-entering the page reuse recent data instead
// of re-hitting the serverless proxy. In-flight dedupe collapses
// concurrent identical requests (e.g. hero + footer now-playing).
const SPOTIFY_NOW_PLAYING_TTL_MS = 30_000;
const SPOTIFY_LIBRARY_TTL_MS = 5 * 60_000;

interface SpotifyCacheEntry {
  data: unknown;
  expiresAt: number;
}

const spotifyResponseCache = new Map<string, SpotifyCacheEntry>();
const spotifyInflightRequests = new Map<string, Promise<unknown>>();

function cacheTtlForPath(path: string): number {
  return path === '/me/player/currently-playing'
    ? SPOTIFY_NOW_PLAYING_TTL_MS
    : SPOTIFY_LIBRARY_TTL_MS;
}

async function spotifyGet<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T | undefined> {
  const qs = new URLSearchParams({
    path,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ),
  });
  const cacheKey = qs.toString();

  const cached = spotifyResponseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T | undefined;
  }

  const inflight = spotifyInflightRequests.get(cacheKey);
  if (inflight) {
    return (await inflight) as T | undefined;
  }

  if (spotifyBackoffUntil > Date.now()) {
    return undefined;
  }

  const request = (async (): Promise<T | undefined> => {
    try {
      const response = await fetch(`${SPOTIFY_PROXY}?${qs.toString()}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        if (startSpotifyBackoff()) {
          await logSpotifyResponseFailure(response);
        }
        return undefined;
      }

      const data =
        response.status === 204 || response.status === 202
          ? undefined
          : ((await response.json()) as T);

      spotifyBackoffUntil = 0;
      // Cache 204s too ("nothing playing" is a valid, reusable answer).
      spotifyResponseCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + cacheTtlForPath(path),
      });

      return data;
    } catch (error) {
      if (startSpotifyBackoff()) {
        console.warn(
          '[spotify] Request failed before Spotify responded.',
          error,
        );
      }
      return undefined;
    }
  })();

  spotifyInflightRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    spotifyInflightRequests.delete(cacheKey);
  }
}

export async function fetchCurrentTrack(): Promise<SpotifyTrack | undefined> {
  const data = await spotifyGet<SpotifyCurrentTrackResponse>(
    '/me/player/currently-playing',
  );

  if (data?.currently_playing_type === 'track' && data.item) {
    return data.item;
  }

  return undefined;
}

export async function fetchPlaylistById(
  playlistId: string,
): Promise<SpotifyPlaylist | undefined> {
  return spotifyGet<SpotifyPlaylist>(`/playlists/${playlistId}`);
}

export async function fetchCurrentUserPlaylists(
  limit = 20,
): Promise<SpotifyPagingResponse<SpotifyPlaylist> | undefined> {
  const data = await spotifyGet<SpotifyPagingResponse<SpotifyPlaylist>>(
    '/me/playlists',
    { limit },
  );

  if (data?.items?.length) {
    return data;
  }

  return undefined;
}

export async function fetchCurrentUsersRecentlyPlayed(
  limit = 20,
): Promise<SpotifyPagingResponse<SpotifyRecentlyPlayedItem> | undefined> {
  const data = await spotifyGet<
    SpotifyPagingResponse<SpotifyRecentlyPlayedItem>
  >('/me/player/recently-played', { limit });

  if (data?.items?.length) {
    return data;
  }

  return undefined;
}

export async function fetchCurrentUsersSavedTracks(
  limit = 20,
): Promise<SpotifyPagingResponse<SpotifySavedTrackItem> | undefined> {
  const data = await spotifyGet<SpotifyPagingResponse<SpotifySavedTrackItem>>(
    '/me/tracks',
    { limit },
  );

  if (data?.items?.length) {
    return data;
  }

  return undefined;
}

export async function fetchCurrentUsersTopItems(
  type: 'artists' | 'tracks' = 'tracks',
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'short_term',
  limit = 20,
): Promise<SpotifyPagingResponse<SpotifyArtist | SpotifyTrack> | undefined> {
  const data = await spotifyGet<
    SpotifyPagingResponse<SpotifyArtist | SpotifyTrack>
  >(`/me/top/${type}`, { time_range: timeRange, limit });

  if (data?.items?.length) {
    return data;
  }

  return undefined;
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
