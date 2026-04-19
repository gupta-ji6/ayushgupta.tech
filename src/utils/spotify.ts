export const SPOTIFY_PROXY = '/.netlify/functions/spotify';
const SPOTIFY_FAILURE_BACKOFF_MS = 10_000;

let spotifyBackoffUntil = 0;

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

async function spotifyGet<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T | undefined> {
  if (spotifyBackoffUntil > Date.now()) {
    return undefined;
  }

  const qs = new URLSearchParams({
    path,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ),
  });

  try {
    const response = await fetch(`${SPOTIFY_PROXY}?${qs.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      spotifyBackoffUntil = Date.now() + SPOTIFY_FAILURE_BACKOFF_MS;
      return undefined;
    }

    if (response.status === 204 || response.status === 202) {
      return undefined;
    }

    spotifyBackoffUntil = 0;
    return (await response.json()) as T;
  } catch (error) {
    spotifyBackoffUntil = Date.now() + SPOTIFY_FAILURE_BACKOFF_MS;
    console.error('[spotify]', error);
    return undefined;
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
