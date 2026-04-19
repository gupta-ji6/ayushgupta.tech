// All Spotify API calls go through the Netlify Function at /.netlify/functions/spotify
// so that client_secret and refresh_token never leave the server.

const PROXY = '/.netlify/functions/spotify';

async function spotifyGet(path, params = {}) {
  const qs = new URLSearchParams({ path, ...params });
  try {
    const res = await fetch(`${PROXY}?${qs}`);
    if (res.status === 200) {
      return res.json();
    }
    return undefined;
  } catch (err) {
    console.error('[Spotify]', err);
    return undefined;
  }
}

// ================================ PUBLIC API =====================================================

/**
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-the-users-currently-playing-track}
 */
export const fetchCurrentTrack = async () => {
  const data = await spotifyGet('/me/player/currently-playing');
  if (!data) {
    return undefined;
  }
  if (data.currently_playing_type === 'track' && data.item) {
    const { album, artists, external_urls, name, preview_url } = data.item;
    return { album, artists, external_urls, name, preview_url };
  }
  return undefined;
};

/**
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-playlist}
 */
export const fetchPlaylistById = async playlist_id => {
  const data = await spotifyGet(`/playlists/${playlist_id}`);
  return data ?? undefined;
};

/**
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-a-list-of-current-users-playlists}
 */
export const fetchCurrentUserPlaylists = async (limit = 20) => {
  const data = await spotifyGet('/me/playlists', { limit });
  if (data && data.total !== 0) {
    const { items, href, total } = data;
    return { items, href, total };
  }
  return undefined;
};

/**
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-recently-played}
 */
export const fetchCurrentUsersRecentlyPlayed = async (limit = 20) => {
  const data = await spotifyGet('/me/player/recently-played', { limit });
  if (data && data.items?.length) {
    const { items, href, next } = data;
    return { items, href, next };
  }
  return undefined;
};

/**
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-saved-tracks}
 */
export const fetchCurrentUsersSavedTracks = async (limit = 20) => {
  const data = await spotifyGet('/me/tracks', { limit });
  if (data && data.items?.length) {
    const { items, href, next, total } = data;
    return { items, href, next, total };
  }
  return undefined;
};

/**
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-top-artists-and-tracks}
 */
export const fetchCurrentUsersTopArtistsOrTracks = async (
  type = 'tracks',
  time_range = 'short_term',
  limit = 20,
) => {
  const data = await spotifyGet(`/me/top/${type}`, { time_range, limit });
  if (data && data.items?.length) {
    const { items, href, next, total } = data;
    return { items, href, next, total };
  }
  return undefined;
};

/**
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-current-users-profile}
 */
export const fetchCurrentUserProfile = async () => {
  return spotifyGet('/me');
};

/**
 * Spotify returns 0–N images; index 1 is often "medium" but may be missing.
 * @param {Array<{ url: string; height?: number; width?: number }>|undefined} images
 * @returns {{ url: string; height?: number; width?: number }|null}
 */
export const pickSpotifyCoverImage = images => {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }
  return images[1] ?? images[0] ?? null;
};
