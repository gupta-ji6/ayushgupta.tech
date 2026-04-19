const fetch = globalThis.fetch || require('node-fetch');

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify credentials in environment variables');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const body = new URLSearchParams();
  body.append('grant_type', 'refresh_token');
  body.append('refresh_token', refreshToken);

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return response.json();
}

const ALLOWED_PATHS = [
  '/me/player/currently-playing',
  '/me/player/recently-played',
  '/me/playlists',
  '/me/tracks',
  '/me/top/tracks',
  '/me/top/artists',
  '/me',
];

function isAllowedPath(path) {
  if (ALLOWED_PATHS.includes(path)) {
    return true;
  }
  // Allow /playlists/{id}
  return /^\/playlists\/[A-Za-z0-9]+$/.test(path);
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const params = event.queryStringParameters || {};
  const path = params.path;

  if (!path) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing ?path= parameter' }) };
  }

  if (!isAllowedPath(path)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Path not allowed' }) };
  }

  // Build upstream query string from all params except "path"
  const upstream = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key !== 'path') {
      upstream.set(key, value);
    }
  }
  const qs = upstream.toString();
  const url = `${SPOTIFY_API_BASE}${path}${qs ? `?${qs}` : ''}`;

  try {
    const { access_token } = await getAccessToken();

    const spotifyRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (spotifyRes.status === 204 || spotifyRes.status === 202) {
      return { statusCode: spotifyRes.status, headers, body: '' };
    }

    const body = await spotifyRes.text();

    return {
      statusCode: spotifyRes.status,
      headers,
      body,
    };
  } catch (err) {
    console.error('[spotify proxy]', err);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'Failed to proxy Spotify request' }),
    };
  }
};
