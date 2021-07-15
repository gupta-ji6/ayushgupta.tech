// ================================ CONSTANTS ==========================================================

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const CURRENT_USER_PLAYLISTS_URL = 'https://api.spotify.com/v1/me/playlists';
const PLAYLISTS_URL = 'https://api.spotify.com/v1/playlists';
const CURRENT_USER_RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played';
const CURRENT_USER_SAVED_TRACKS_URL = 'https://api.spotify.com/v1/me/tracks';
const CURRENT_USER_TOP_ARTISTS_TRACKS_URL = 'https://api.spotify.com/v1/me/top';
const CURRENT_USER_PROFILE_URL = 'https://api.spotify.com/v1/me';

let basic;
if (typeof window !== 'undefined') {
  basic = btoa(
    `${process.env.GATSBY_SPOTIFY_CLIENT_ID}:${process.env.GATSBY_SPOTIFY_CLIENT_SECRET}`,
  );
} else {
  basic = Buffer.from(
    `${process.env.GATSBY_SPOTIFY_CLIENT_ID}:${process.env.GATSBY_SPOTIFY_CLIENT_SECRET}`,
  ).toString('base64');
}

// =============================== FUNCTIONS ===========================================================

/**
 * Get OAuth access token from Spotify Web API
 *
 * @see {@link https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow}
 */
export const getAccessToken = async () => {
  const urlencoded = new URLSearchParams();
  urlencoded.append('grant_type', 'refresh_token');
  urlencoded.append('refresh_token', process.env.GATSBY_SPOTIFY_REFRESH_TOKEN);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: urlencoded,
  });

  return response.json();
};

// ==========================================================================================

/**
 * Get the object currently being played on the user’s Spotify account.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-the-users-currently-playing-track}
 * @return {Promise}  A successful request will return a 200 OK response code with a json payload that contains information about the currently playing track or episode and its context.
 */
export const fetchCurrentTrack = async () => {
  const { access_token } = await getAccessToken();

  try {
    const response = await fetch(NOW_PLAYING_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    // console.log(response);

    if (response.status === 200) {
      const jsonResponse = await response.json();
      //   console.log(jsonResponse);

      if (jsonResponse?.currently_playing_type === 'track' && jsonResponse?.item !== null) {
        const { album, artists, external_urls, name, preview_url } = jsonResponse?.item;

        return {
          album,
          artists,
          external_urls,
          name,
          preview_url,
        };
      } else if (
        jsonResponse?.currently_playing_type === 'episode' &&
        jsonResponse?.item !== null
      ) {
        // TODO: the item is always null in the response as of now.
        return undefined;
      }
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(error);
  }
};

// ==========================================================================================

/**
 * Get a playlist owned by a Spotify user.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-playlist}
 * @param {string} playlist_id The Spotify ID for the playlist.
 * @return {Promise}  a playlist object.
 */
export const fetchPlaylistById = async playlist_id => {
  const { access_token } = await getAccessToken();
  const PLAYLISTS_URL_BY_ID = `${PLAYLISTS_URL}/${playlist_id}`;

  try {
    const response = await fetch(PLAYLISTS_URL_BY_ID, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const jsonResponse = await response.json();
      // console.log(jsonResponse);

      if (jsonResponse !== null) {
        return jsonResponse;
      }
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(error);
  }
};

// ==========================================================================================

/**
 * Get a list of the playlists owned or followed by the current Spotify user.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-a-list-of-current-users-playlists}
 *
 * @param {number} [limit] - The maximum number of playlists to return. Default: 20. Minimum: 1. Maximum: 50.
 * @return {Promise} contains an array of simplified playlist objects.
 */
export const fetchCurrentUserPlaylists = async (limit = 20) => {
  const { access_token } = await getAccessToken();
  const url = new URL(CURRENT_USER_PLAYLISTS_URL);
  const params = { limit };

  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const jsonResponse = await response.json();
      // console.log(jsonResponse);

      if (jsonResponse?.total !== 0) {
        const { items, href, total } = jsonResponse;

        return {
          items,
          href,
          total,
        };
      }
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(error);
  }
};

// ==========================================================================================

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

/**
 * Get tracks from the current user’s recently played tracks. Note: Currently doesn’t support podcast episodes.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-recently-played}
 * @param {number} [limit] - The maximum number of playlists to return. Default: 20. Minimum: 1. Maximum: 50.
 * @param {number} [before] - A Unix timestamp in milliseconds. Returns all items before (but not including) this cursor position. If before is specified, after must not be specified.
 * @return {Promise} contains an array of play history objects (wrapped in a cursor-based paging object) in JSON format
 */
export const fetchCurrentUsersRecentlyPlayed = async (limit = 20) => {
  const { access_token } = await getAccessToken();
  const url = new URL(CURRENT_USER_RECENTLY_PLAYED_URL);
  const params = {
    limit,
    // after: Math.round(new Date(yesterday).getTime() / 1000),
    // before,
  };

  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const jsonResponse = await response.json();
      // console.log(jsonResponse);

      if (jsonResponse?.items.length !== 0) {
        const { items, href, next } = jsonResponse;

        return {
          items,
          href,
          next,
        };
      }
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(error);
  }
};

// ==========================================================================================

/**
 * Get a list of the songs saved in the current Spotify user’s ‘Your Music’ library.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-saved-tracks}
 * @param {number} [limit] - The maximum number of playlists to return. Default: 20. Minimum: 1. Maximum: 50.
 * @return {Promise}  contains an array of saved track objects (wrapped in a paging object) in JSON format.
 */
export const fetchCurrentUsersSavedTracks = async (limit = 20) => {
  const { access_token } = await getAccessToken();
  const url = new URL(CURRENT_USER_SAVED_TRACKS_URL);
  const params = { limit };

  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const jsonResponse = await response.json();
      // console.log(jsonResponse);

      if (jsonResponse?.items.length !== 0) {
        const { items, href, next, total } = jsonResponse;

        return {
          items,
          href,
          next,
          total,
        };
      }
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(error);
  }
};

// ==========================================================================================

/**
 * Get the current user’s top artists or tracks based on calculated affinity.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-top-artists-and-tracks}
 * @param {string} type - The type of entity to return. Valid values: artists or tracks.
 * @param {string} time_range - Over what time frame the affinities are computed. Valid values: long_term (calculated from several years of data and including all new data as it becomes available), medium_term (approximately last 6 months), short_term (approximately last 4 weeks). Default: medium_term
 * @param {number} limit - The number of entities to return. Default: 20. Minimum: 1. Maximum: 50.
 * @return {Promise} contains a paging object of Artists or Tracks.
 */
export const fetchCurrentUsersTopArtistsOrTracks = async (
  type = 'tracks',
  time_range = 'short_term',
  limit = 20,
) => {
  const { access_token } = await getAccessToken();
  const url = new URL(`${CURRENT_USER_TOP_ARTISTS_TRACKS_URL}/${type}`);
  const params = {
    time_range,
    limit,
  };

  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const jsonResponse = await response.json();
      // console.log(jsonResponse);

      if (jsonResponse?.items.length !== 0) {
        const { items, href, next, total } = jsonResponse;

        return {
          items,
          href,
          next,
          total,
        };
      }
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(error);
  }
};

// ==========================================================================================

/**
 * Get detailed profile information about the current user (including the current user’s username).
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-current-users-profile}
 * @return {Promise} contains a user object in JSON format.
 */
export const fetchCurrentUserProfile = async () => {
  const { access_token } = await getAccessToken();
  const url = new URL(CURRENT_USER_PROFILE_URL);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const jsonResponse = await response.json();
      // console.log(jsonResponse);
      return jsonResponse;
    }
  } catch (error) {
    console.error(error);
  }
};
