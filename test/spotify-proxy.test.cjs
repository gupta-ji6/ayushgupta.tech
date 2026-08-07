const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');

const functionPath = require.resolve('../netlify/functions/spotify.cjs');
const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const originalEnvironment = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
};

function loadHandler(tokenError) {
  process.env.SPOTIFY_CLIENT_ID = 'client-id';
  process.env.SPOTIFY_CLIENT_SECRET = 'client-secret';
  process.env.SPOTIFY_REFRESH_TOKEN = 'refresh-token';
  globalThis.fetch = async () =>
    new Response(JSON.stringify(tokenError), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  console.error = () => {};
  delete require.cache[functionPath];

  return require(functionPath).handler;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
  for (const [key, value] of Object.entries({
    SPOTIFY_CLIENT_ID: originalEnvironment.clientId,
    SPOTIFY_CLIENT_SECRET: originalEnvironment.clientSecret,
    SPOTIFY_REFRESH_TOKEN: originalEnvironment.refreshToken,
  })) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  delete require.cache[functionPath];
});

test('reports a safe reauthorization error when Spotify revokes the refresh token', async () => {
  const handler = loadHandler({ error: 'invalid_grant' });

  const response = await handler({
    httpMethod: 'GET',
    queryStringParameters: { path: '/me/top/tracks' },
  });

  assert.equal(response.statusCode, 503);
  assert.deepEqual(JSON.parse(response.body), {
    error: 'reauthorization_required',
  });
});

test('keeps other token failures generic', async () => {
  const handler = loadHandler({ error: 'invalid_client' });

  const response = await handler({
    httpMethod: 'GET',
    queryStringParameters: { path: '/me/top/tracks' },
  });

  assert.equal(response.statusCode, 502);
  assert.deepEqual(JSON.parse(response.body), {
    error: 'Failed to proxy Spotify request',
  });
});
