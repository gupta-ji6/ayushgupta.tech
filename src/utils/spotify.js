const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
// const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player';

const basic = Buffer.from(
  `${process.env.GATSBY_SPOTIFY_CLIENT_ID}:${process.env.GATSBY_SPOTIFY_CLIENT_SECRET}`,
).toString('base64');

// get OAuth access token from Spotify Web API
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

// fetch the current playing track, if any
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
