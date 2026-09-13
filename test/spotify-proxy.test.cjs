const { afterEach, test } = require('node:test');
const assert = require('node:assert/strict');

const functionPath = require.resolve('../netlify/functions/spotify.cjs');
const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const environmentNames = [
  'SPOTIFY_LOCAL_DEV_BYPASS',
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'SPOTIFY_REFRESH_TOKEN',
  'SPOTIFY_ORIGIN_KEY_CURRENT',
  'SPOTIFY_ORIGIN_KEY_NEXT',
];
const originalEnvironment = Object.fromEntries(
  environmentNames.map((name) => [name, process.env[name]]),
);

function restoreEnvironment() {
  for (const [name, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
}

function spotifyTrack(id = 'track-1') {
  return {
    id,
    name: `Track ${id}`,
    album: {
      name: `Album ${id}`,
      href: 'https://api.spotify.com/v1/albums/private',
      images: [
        { url: 'https://i.scdn.co/large.jpg', width: 640, height: 640 },
        { url: 'https://i.scdn.co/medium.jpg', width: 300, height: 300 },
      ],
    },
    artists: [
      {
        id: 'artist-1',
        name: 'Artist One',
        href: 'https://api.spotify.com/v1/artists/private',
      },
    ],
    external_urls: { spotify: `https://open.spotify.com/track/${id}` },
    href: `https://api.spotify.com/v1/tracks/${id}`,
    preview_url: 'https://audio.example/preview.mp3',
    uri: `spotify:track:${id}`,
  };
}

function spotifyArtist(id = 'artist-1') {
  return {
    id,
    name: `Artist ${id}`,
    external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
    genres: ['indie', 'folk'],
    href: `https://api.spotify.com/v1/artists/${id}`,
    images: [{ url: 'https://i.scdn.co/artist.jpg', width: 320, height: 320 }],
    popularity: 99,
    uri: `spotify:artist:${id}`,
  };
}

function spotifyPlaylist(id = 'playlist-1') {
  return {
    id,
    name: `Playlist ${id}`,
    external_urls: { spotify: `https://open.spotify.com/playlist/${id}` },
    href: `https://api.spotify.com/v1/playlists/${id}`,
    images: [
      { url: 'https://mosaic.scdn.co/large.jpg', width: 640, height: 640 },
      { url: 'https://mosaic.scdn.co/medium.jpg', width: 300, height: 300 },
    ],
    owner: { display_name: 'Ayush', id: 'private-owner-id' },
    tracks: { total: 42, href: 'https://api.spotify.com/private-tracks' },
    collaborative: false,
    public: false,
  };
}

function payloadFor(resource) {
  switch (resource) {
    case 'now-playing':
      return {
        currently_playing_type: 'track',
        item: spotifyTrack(),
        progress_ms: 12345,
        device: { id: 'private-device' },
      };
    case 'top-tracks':
      return {
        items: [spotifyTrack()],
        href: 'https://api.spotify.com/private-page',
        next: 'https://api.spotify.com/private-next',
        total: 500,
      };
    case 'top-artists':
      return { items: [spotifyArtist()], total: 500 };
    case 'favourite-playlist':
      return spotifyPlaylist('3qWhbV6ul3Bfl2iHrN4TYn');
    case 'recently-played':
      return {
        items: [{ track: spotifyTrack(), played_at: '2026-08-08T00:00:00Z' }],
        cursors: { after: 'private-cursor' },
      };
    case 'saved-tracks':
      return {
        items: [{ track: spotifyTrack(), added_at: '2026-08-08T00:00:00Z' }],
        next: 'https://api.spotify.com/private-next',
      };
    case 'saved-playlists':
      return { items: [spotifyPlaylist()], total: 100 };
    default:
      throw new Error(`No fixture for ${resource}`);
  }
}

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

function loadSpotifyFunction({
  apiResponse,
  local = true,
  originCurrent,
  originNext,
  tokenResponse,
} = {}) {
  restoreEnvironment();
  process.env.SPOTIFY_CLIENT_ID = 'client-id';
  process.env.SPOTIFY_CLIENT_SECRET = 'client-secret';
  process.env.SPOTIFY_REFRESH_TOKEN = 'refresh-token';

  if (local) process.env.SPOTIFY_LOCAL_DEV_BYPASS = 'true';
  else delete process.env.SPOTIFY_LOCAL_DEV_BYPASS;
  if (originCurrent) process.env.SPOTIFY_ORIGIN_KEY_CURRENT = originCurrent;
  else delete process.env.SPOTIFY_ORIGIN_KEY_CURRENT;
  if (originNext) process.env.SPOTIFY_ORIGIN_KEY_NEXT = originNext;
  else delete process.env.SPOTIFY_ORIGIN_KEY_NEXT;

  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });

    if (String(url) === 'https://accounts.spotify.com/api/token') {
      if (typeof tokenResponse === 'function') {
        return tokenResponse(
          calls.filter((call) => call.url.includes('/api/token')).length,
        );
      }
      return (
        tokenResponse ??
        jsonResponse({ access_token: 'access-token', expires_in: 3600 })
      );
    }

    if (typeof apiResponse === 'function') {
      return apiResponse(url, options);
    }
    return (
      apiResponse ??
      jsonResponse(payloadFor('top-tracks'), 200, {
        'Cache-Control': 'public, max-age=600',
      })
    );
  };
  console.error = () => {};
  delete require.cache[functionPath];

  const spotifyFunction = require(functionPath);

  return {
    config: spotifyFunction.config,
    defaultHandler: spotifyFunction.default,
    handler: spotifyFunction.testHandler,
    reservedHandler: spotifyFunction.handler,
    calls,
  };
}

function eventFor(query, { headers = {}, method = 'GET', raw = true } = {}) {
  const search = new URLSearchParams(query);
  const event = {
    httpMethod: method,
    headers,
    queryStringParameters: Object.fromEntries(search),
  };
  if (raw) {
    event.rawUrl = `https://ayushgupta.tech/api/spotify?${search}`;
  }
  return event;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
  restoreEnvironment();
  delete require.cache[functionPath];
});

test('exports a v2 function with a path-scoped Netlify rate limit', () => {
  const { config, defaultHandler, reservedHandler } = loadSpotifyFunction();

  assert.equal(typeof defaultHandler, 'function');
  assert.equal(reservedHandler, undefined);
  assert.deepEqual(config, {
    path: '/api/spotify',
    rateLimit: {
      action: 'rate_limit',
      aggregateBy: ['ip', 'domain'],
      windowLimit: 30,
      windowSize: 60,
    },
  });
});

test('maps every public resource to one fixed Spotify request', async () => {
  const cases = [
    ['now-playing', undefined, '/me/player/currently-playing'],
    [
      'top-tracks',
      'short_term',
      '/me/top/tracks?time_range=short_term&limit=10',
    ],
    [
      'top-artists',
      'long_term',
      '/me/top/artists?time_range=long_term&limit=10',
    ],
    ['favourite-playlist', undefined, '/playlists/3qWhbV6ul3Bfl2iHrN4TYn'],
    ['recently-played', undefined, '/me/player/recently-played?limit=10'],
    ['saved-tracks', undefined, '/me/tracks?limit=10'],
    ['saved-playlists', undefined, '/me/playlists?limit=10'],
  ];

  for (const [resource, range, expectedPath] of cases) {
    const { handler, calls } = loadSpotifyFunction({
      apiResponse: jsonResponse(payloadFor(resource), 200, {
        'Cache-Control': 'public, max-age=600',
      }),
    });
    const query = range ? { resource, range } : { resource };
    const response = await handler(eventFor(query));

    assert.equal(response.statusCode, 200, resource);
    assert.equal(calls.length, 2, resource);
    assert.equal(calls[1].url, `https://api.spotify.com/v1${expectedPath}`);
    assert.equal(calls[1].options.headers.Authorization, 'Bearer access-token');
  }
});

test('rejects malformed, duplicate, unknown, and incompatible parameters before Spotify', async () => {
  const invalidQueries = [
    '',
    'resource=unknown',
    'resource=top-tracks',
    'resource=top-tracks&range=invalid',
    'resource=top-tracks&range=short_term&range=long_term',
    'resource=now-playing&range=short_term',
    'resource=now-playing&limit=10',
    'resource=now-playing&path=%2Fme%2Ftracks',
    'resource=now-playing&resource=saved-tracks',
  ];

  for (const rawQuery of invalidQueries) {
    const { handler, calls } = loadSpotifyFunction();
    const response = await handler({
      httpMethod: 'GET',
      headers: {},
      rawUrl: `https://ayushgupta.tech/api/spotify?${rawQuery}`,
      queryStringParameters: Object.fromEntries(new URLSearchParams(rawQuery)),
    });

    assert.equal(response.statusCode, 400, rawQuery);
    assert.deepEqual(JSON.parse(response.body), { error: 'invalid_request' });
    assert.equal(calls.length, 0, rawQuery);
  }
});

test('allows only GET and returns defensive response headers', async () => {
  const { handler, calls } = loadSpotifyFunction({ local: false });
  const response = await handler(eventFor({}, { method: 'POST' }));

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET');
  assert.equal(response.headers['Content-Type'], 'application/json');
  assert.equal(response.headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(
    response.headers['Netlify-Vary'],
    'query,header=X-Spotify-Origin-Key',
  );
  assert.equal(calls.length, 0);
});

test('fails closed and accepts only current or next origin keys outside Netlify Dev', async () => {
  const currentKey = 'current-origin-key-12345678901234567890';
  const nextKey = 'next-origin-key-123456789012345678901234';
  const noConfig = loadSpotifyFunction({ local: false });
  const noConfigResponse = await noConfig.handler(
    eventFor({ resource: 'now-playing' }),
  );
  assert.equal(noConfigResponse.statusCode, 503);
  assert.deepEqual(JSON.parse(noConfigResponse.body), {
    error: 'configuration_error',
  });
  assert.equal(noConfig.calls.length, 0);

  for (const [label, suppliedKey, expectedStatus] of [
    ['missing', undefined, 403],
    ['incorrect', 'wrong-key', 403],
    ['current', currentKey, 200],
    ['next', nextKey, 200],
  ]) {
    const { handler, calls } = loadSpotifyFunction({
      local: false,
      originCurrent: currentKey,
      originNext: nextKey,
      apiResponse: jsonResponse(payloadFor('top-tracks'), 200, {
        'Cache-Control': 'public, max-age=60',
      }),
    });
    const headers = suppliedKey ? { 'X-Spotify-Origin-Key': suppliedKey } : {};
    const response = await handler(
      eventFor({ resource: 'top-tracks', range: 'short_term' }, { headers }),
    );

    assert.equal(response.statusCode, expectedStatus, label);
    assert.equal(calls.length, expectedStatus === 200 ? 2 : 0, label);
    assert.equal(response.body.includes(suppliedKey ?? currentKey), false);
  }
});

test('rejects short origin keys as unsafe configuration', async () => {
  const { handler, calls } = loadSpotifyFunction({
    local: false,
    originCurrent: 'too-short',
  });

  const response = await handler(
    eventFor(
      { resource: 'now-playing' },
      { headers: { 'X-Spotify-Origin-Key': 'too-short' } },
    ),
  );

  assert.equal(response.statusCode, 503);
  assert.deepEqual(JSON.parse(response.body), { error: 'configuration_error' });
  assert.equal(calls.length, 0);
});

test('local bypass requires the explicit local-only marker', async () => {
  const local = loadSpotifyFunction({
    apiResponse: jsonResponse(payloadFor('now-playing'), 200, {
      'Cache-Control': 'public, max-age=30',
    }),
  });

  const response = await local.handler(eventFor({ resource: 'now-playing' }));
  assert.equal(response.statusCode, 200);
});

test('v2 entrypoint accepts Netlify local context and returns a web Response', async () => {
  const { defaultHandler } = loadSpotifyFunction({
    local: false,
    apiResponse: jsonResponse(payloadFor('now-playing'), 200, {
      'Cache-Control': 'public, max-age=30',
    }),
  });
  const response = await defaultHandler(
    new Request('https://ayushgupta.tech/api/spotify?resource=now-playing'),
    { deploy: { context: 'dev' } },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(
    (await response.json()).spotifyUrl,
    'https://open.spotify.com/track/track-1',
  );
});

test('a deployed Netlify context cannot use the local bypass marker', async () => {
  const { defaultHandler, calls } = loadSpotifyFunction({ local: true });
  const response = await defaultHandler(
    new Request('https://ayushgupta.tech/api/spotify?resource=now-playing'),
    { deploy: { context: 'production' } },
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'configuration_error' });
  assert.equal(calls.length, 0);
});

test('returns purpose-built DTOs without private Spotify fields or preview audio', async (t) => {
  await t.test('track DTO', async () => {
    const { handler } = loadSpotifyFunction({
      apiResponse: jsonResponse(payloadFor('top-tracks'), 200, {
        'Cache-Control': 'public, max-age=60',
      }),
    });
    const response = await handler(
      eventFor({ resource: 'top-tracks', range: 'short_term' }),
    );

    assert.deepEqual(JSON.parse(response.body), [
      {
        id: 'track-1',
        name: 'Track track-1',
        albumName: 'Album track-1',
        image: {
          url: 'https://i.scdn.co/medium.jpg',
          width: 300,
          height: 300,
        },
        artists: ['Artist One'],
        spotifyUrl: 'https://open.spotify.com/track/track-1',
      },
    ]);
    assert.equal(response.body.includes('preview_url'), false);
    assert.equal(response.body.includes('played_at'), false);
    assert.equal(response.body.includes('api.spotify.com'), false);
  });

  await t.test('artist DTO', async () => {
    const { handler } = loadSpotifyFunction({
      apiResponse: jsonResponse(payloadFor('top-artists'), 200, {
        'Cache-Control': 'public, max-age=60',
      }),
    });
    const response = await handler(
      eventFor({ resource: 'top-artists', range: 'medium_term' }),
    );

    assert.deepEqual(JSON.parse(response.body), [
      {
        id: 'artist-1',
        name: 'Artist artist-1',
        image: {
          url: 'https://i.scdn.co/artist.jpg',
          width: 320,
          height: 320,
        },
        genres: ['indie', 'folk'],
        spotifyUrl: 'https://open.spotify.com/artist/artist-1',
      },
    ]);
  });

  await t.test('playlist DTO', async () => {
    const { handler } = loadSpotifyFunction({
      apiResponse: jsonResponse(payloadFor('favourite-playlist'), 200, {
        'Cache-Control': 'public, max-age=60',
      }),
    });
    const response = await handler(
      eventFor({ resource: 'favourite-playlist' }),
    );

    assert.deepEqual(JSON.parse(response.body), {
      id: '3qWhbV6ul3Bfl2iHrN4TYn',
      name: 'Playlist 3qWhbV6ul3Bfl2iHrN4TYn',
      image: {
        url: 'https://mosaic.scdn.co/medium.jpg',
        width: 300,
        height: 300,
      },
      ownerName: 'Ayush',
      trackCount: 42,
      spotifyUrl: 'https://open.spotify.com/playlist/3qWhbV6ul3Bfl2iHrN4TYn',
    });
  });
});

test('never returns more than the fixed ten-item collection slice', async () => {
  const { handler } = loadSpotifyFunction({
    apiResponse: jsonResponse(
      {
        items: Array.from({ length: 12 }, (_, index) =>
          spotifyTrack(`${index}`),
        ),
      },
      200,
      { 'Cache-Control': 'public, max-age=60' },
    ),
  });
  const response = await handler(
    eventFor({ resource: 'top-tracks', range: 'short_term' }),
  );

  assert.equal(response.statusCode, 200);
  assert.equal(JSON.parse(response.body).length, 10);
});

test('preserves genuine empty states and rejects malformed upstream data', async () => {
  const emptyNowPlaying = loadSpotifyFunction({
    apiResponse: jsonResponse(null, 204, {
      'Cache-Control': 'public, max-age=30',
    }),
  });
  const emptyNowPlayingResponse = await emptyNowPlaying.handler(
    eventFor({ resource: 'now-playing' }),
  );
  assert.equal(emptyNowPlayingResponse.statusCode, 204);
  assert.equal('body' in emptyNowPlayingResponse, false);

  const emptyCollection = loadSpotifyFunction({
    apiResponse: jsonResponse({ items: [] }, 200, {
      'Cache-Control': 'public, max-age=300',
    }),
  });
  const emptyCollectionResponse = await emptyCollection.handler(
    eventFor({ resource: 'saved-tracks' }),
  );
  assert.equal(emptyCollectionResponse.statusCode, 200);
  assert.deepEqual(JSON.parse(emptyCollectionResponse.body), []);

  const malformed = loadSpotifyFunction({
    apiResponse: jsonResponse({ items: [{ name: 'missing track wrapper' }] }),
  });
  const malformedResponse = await malformed.handler(
    eventFor({ resource: 'saved-tracks' }),
  );
  assert.equal(malformedResponse.statusCode, 502);
  assert.deepEqual(JSON.parse(malformedResponse.body), {
    error: 'upstream_failure',
  });
  assert.equal(malformedResponse.headers['Cache-Control'], 'no-store');
});

test('classifies Spotify rate limits and sanitizes Retry-After', async () => {
  for (const [retryAfter, expected] of [
    ['17', '17'],
    ['0', undefined],
    ['1.5', undefined],
    ['soon', undefined],
    ['9007199254740992', undefined],
  ]) {
    const { handler } = loadSpotifyFunction({
      apiResponse: jsonResponse(
        { error: { status: 429, message: 'upstream detail' } },
        429,
        { 'Retry-After': retryAfter },
      ),
    });
    const response = await handler(eventFor({ resource: 'now-playing' }));

    assert.equal(response.statusCode, 429, retryAfter);
    assert.deepEqual(JSON.parse(response.body), { error: 'rate_limited' });
    assert.equal(response.headers['Retry-After'], expected, retryAfter);
    assert.equal(response.headers['Cache-Control'], 'no-store');
    assert.equal(response.body.includes('upstream detail'), false);
  }
});

test('classifies token-endpoint rate limits without retrying', async () => {
  const { handler, calls } = loadSpotifyFunction({
    tokenResponse: jsonResponse({ error: 'rate_limited' }, 429, {
      'Retry-After': '23',
    }),
  });
  const response = await handler(eventFor({ resource: 'now-playing' }));

  assert.equal(response.statusCode, 429);
  assert.deepEqual(JSON.parse(response.body), { error: 'rate_limited' });
  assert.equal(response.headers['Retry-After'], '23');
  assert.equal(calls.length, 1);
});

test('uses the stricter Spotify or application cache lifetime and never stale-serves', async () => {
  const cases = [
    ['now-playing', 'public, max-age=120', 'public, max-age=30'],
    ['saved-tracks', 'public, max-age=120', 'public, max-age=120'],
    ['saved-tracks', 'public, max-age=900', 'public, max-age=300'],
    ['saved-tracks', 'public, max-age=300, s-maxage=45', 'public, max-age=45'],
    ['saved-tracks', 'private, max-age=300', 'no-store'],
    ['saved-tracks', 'no-cache, max-age=300', 'no-store'],
    ['saved-tracks', 'no-store', 'no-store'],
    ['saved-tracks', undefined, 'no-store'],
  ];

  for (const [resource, cacheControl, expected] of cases) {
    const headers = cacheControl ? { 'Cache-Control': cacheControl } : {};
    const { handler } = loadSpotifyFunction({
      apiResponse: jsonResponse(payloadFor(resource), 200, headers),
    });
    const query = resource === 'now-playing' ? { resource } : { resource };
    const response = await handler(eventFor(query));

    assert.equal(response.statusCode, 200, `${resource}: ${cacheControl}`);
    assert.equal(response.headers['Cache-Control'], expected);
    if (expected === 'no-store') {
      assert.equal(response.headers['Netlify-CDN-Cache-Control'], undefined);
    } else {
      assert.equal(
        response.headers['Netlify-CDN-Cache-Control'],
        expected.replace('public, ', 'public, durable, '),
      );
      assert.equal(
        response.headers['Netlify-CDN-Cache-Control'].includes(
          'stale-while-revalidate',
        ),
        false,
      );
    }
  }
});

test('reports a safe reauthorization error when Spotify revokes the refresh token', async () => {
  const { handler } = loadSpotifyFunction({
    tokenResponse: jsonResponse({ error: 'invalid_grant' }, 400),
  });
  const response = await handler(
    eventFor({ resource: 'top-tracks', range: 'short_term' }),
  );

  assert.equal(response.statusCode, 503);
  assert.deepEqual(JSON.parse(response.body), {
    error: 'reauthorization_required',
  });
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('keeps other token and Spotify API failures generic and non-cacheable', async () => {
  const tokenFailure = loadSpotifyFunction({
    tokenResponse: jsonResponse({ error: 'invalid_client' }, 400),
  });
  const tokenResponse = await tokenFailure.handler(
    eventFor({ resource: 'top-tracks', range: 'short_term' }),
  );
  assert.equal(tokenResponse.statusCode, 502);
  assert.deepEqual(JSON.parse(tokenResponse.body), {
    error: 'upstream_failure',
  });

  const apiFailure = loadSpotifyFunction({
    apiResponse: jsonResponse({ private: 'detail' }, 500),
  });
  const apiResponse = await apiFailure.handler(
    eventFor({ resource: 'now-playing' }),
  );
  assert.equal(apiResponse.statusCode, 502);
  assert.deepEqual(JSON.parse(apiResponse.body), {
    error: 'upstream_failure',
  });
  assert.equal(apiResponse.headers['Cache-Control'], 'no-store');
});

test('uses a replacement refresh token during the lifetime of a warm function', async () => {
  const refreshBodies = [];
  const { handler, calls } = loadSpotifyFunction({
    tokenResponse: (requestNumber) =>
      requestNumber === 1
        ? jsonResponse({
            access_token: 'first-access-token',
            expires_in: 1,
            refresh_token: 'replacement-refresh-token',
          })
        : jsonResponse({
            access_token: 'second-access-token',
            expires_in: 3600,
          }),
    apiResponse: (_url, options) => {
      refreshBodies.push(options.headers.Authorization);
      return jsonResponse(payloadFor('now-playing'), 200, {
        'Cache-Control': 'no-store',
      });
    },
  });

  await handler(eventFor({ resource: 'now-playing' }));
  await handler(eventFor({ resource: 'saved-tracks' }));

  const tokenCalls = calls.filter((call) => call.url.includes('/api/token'));
  assert.equal(tokenCalls.length, 2);
  assert.equal(
    new URLSearchParams(tokenCalls[1].options.body).get('refresh_token'),
    'replacement-refresh-token',
  );
  assert.deepEqual(refreshBodies, [
    'Bearer first-access-token',
    'Bearer second-access-token',
  ]);
});
