import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

const originalFetch = globalThis.fetch;
const originalConsoleWarn = console.warn;
const originalDateNow = Date.now;
let moduleVersion = 0;

const track = {
  id: 'track-1',
  name: 'Track One',
  albumName: 'Album One',
  image: { url: 'https://i.scdn.co/track.jpg', width: 300, height: 300 },
  artists: ['Artist One'],
  spotifyUrl: 'https://open.spotify.com/track/track-1',
};

const artist = {
  id: 'artist-1',
  name: 'Artist One',
  image: { url: 'https://i.scdn.co/artist.jpg', width: 300, height: 300 },
  genres: ['indie'],
  spotifyUrl: 'https://open.spotify.com/artist/artist-1',
};

const playlist = {
  id: 'playlist-1',
  name: 'Playlist One',
  image: { url: 'https://i.scdn.co/playlist.jpg', width: 300, height: 300 },
  ownerName: 'Ayush',
  trackCount: 10,
  spotifyUrl: 'https://open.spotify.com/playlist/playlist-1',
};

async function loadSpotifyClient() {
  moduleVersion += 1;
  return import(`../src/utils/spotify.ts?test=${moduleVersion}`);
}

function spotifyResponse(body, status = 200, headers = {}) {
  return new Response(body == null ? null : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.warn = originalConsoleWarn;
  Date.now = originalDateNow;
});

test('requests only fixed presentation resources without an origin secret', async () => {
  const spotify = await loadSpotifyClient();
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    const resource = new URL(
      String(url),
      'https://ayushgupta.tech',
    ).searchParams.get('resource');

    if (resource === 'now-playing') return spotifyResponse(track);
    if (resource === 'favourite-playlist') return spotifyResponse(playlist);
    if (resource === 'top-artists') return spotifyResponse([artist]);
    if (resource === 'saved-playlists') return spotifyResponse([playlist]);
    return spotifyResponse([track]);
  };

  await spotify.fetchCurrentTrack();
  await spotify.fetchTopTracks('short_term');
  await spotify.fetchTopArtists('long_term');
  await spotify.fetchFavouritePlaylist();
  await spotify.fetchRecentlyPlayedTracks();
  await spotify.fetchSavedTracks();
  await spotify.fetchSavedPlaylists();

  assert.deepEqual(
    calls.map(({ url }) => url),
    [
      '/api/spotify?resource=now-playing',
      '/api/spotify?resource=top-tracks&range=short_term',
      '/api/spotify?resource=top-artists&range=long_term',
      '/api/spotify?resource=favourite-playlist',
      '/api/spotify?resource=recently-played',
      '/api/spotify?resource=saved-tracks',
      '/api/spotify?resource=saved-playlists',
    ],
  );
  assert.ok(
    calls.every(({ options }) =>
      Object.keys(options.headers).every(
        (header) => header.toLowerCase() !== 'x-spotify-origin-key',
      ),
    ),
  );
});

test('keeps Spotify empty, successful, and unavailable results distinct', async (t) => {
  await t.test(
    'treats a no-content now-playing response as empty',
    async () => {
      const spotify = await loadSpotifyClient();
      globalThis.fetch = async () => spotifyResponse(null, 204);

      assert.deepEqual(await spotify.fetchCurrentTrack(), { kind: 'empty' });
    },
  );

  await t.test('treats a valid empty collection as empty', async () => {
    const spotify = await loadSpotifyClient();
    globalThis.fetch = async () => spotifyResponse([]);

    assert.deepEqual(await spotify.fetchTopTracks('short_term'), {
      kind: 'empty',
    });
  });

  await t.test('keeps populated collections successful', async () => {
    const spotify = await loadSpotifyClient();
    globalThis.fetch = async () => spotifyResponse([track]);

    assert.deepEqual(await spotify.fetchTopTracks('medium_term'), {
      kind: 'success',
      data: [track],
    });
  });

  await t.test(
    'treats a malformed successful collection as unavailable',
    async () => {
      const spotify = await loadSpotifyClient();
      globalThis.fetch = async () => spotifyResponse({ items: [track] });
      console.warn = () => {};

      assert.deepEqual(await spotify.fetchTopTracks('short_term'), {
        kind: 'unavailable',
      });
    },
  );

  await t.test(
    'treats generic and reauthorization failures as unavailable',
    async () => {
      for (const [status, body] of [
        [502, { error: 'upstream_failure' }],
        [503, { error: 'reauthorization_required' }],
      ]) {
        const spotify = await loadSpotifyClient();
        globalThis.fetch = async () => spotifyResponse(body, status);
        console.warn = () => {};

        assert.deepEqual(await spotify.fetchCurrentTrack(), {
          kind: 'unavailable',
        });
      }
    },
  );
});

test('uses the proxy cache lifetime for module caching', async (t) => {
  await t.test('reuses a response only inside its max-age', async () => {
    let now = 1_000_000;
    let fetchCount = 0;
    Date.now = () => now;
    const spotify = await loadSpotifyClient();
    globalThis.fetch = async () => {
      fetchCount += 1;
      return spotifyResponse([track], 200, {
        'Cache-Control': 'public, max-age=2',
      });
    };

    await spotify.fetchSavedTracks();
    now += 1_999;
    await spotify.fetchSavedTracks();
    assert.equal(fetchCount, 1);

    now += 2;
    await spotify.fetchSavedTracks();
    assert.equal(fetchCount, 2);
  });

  await t.test('does not module-cache a no-store response', async () => {
    let fetchCount = 0;
    const spotify = await loadSpotifyClient();
    globalThis.fetch = async () => {
      fetchCount += 1;
      return spotifyResponse([track]);
    };

    await spotify.fetchSavedTracks();
    await spotify.fetchSavedTracks();
    assert.equal(fetchCount, 2);
  });

  await t.test('can cache a genuine 204 empty response', async () => {
    let fetchCount = 0;
    const spotify = await loadSpotifyClient();
    globalThis.fetch = async () => {
      fetchCount += 1;
      return spotifyResponse(null, 204, {
        'Cache-Control': 'public, max-age=30',
      });
    };

    assert.deepEqual(await spotify.fetchCurrentTrack(), { kind: 'empty' });
    assert.deepEqual(await spotify.fetchCurrentTrack(), { kind: 'empty' });
    assert.equal(fetchCount, 1);
  });
});

test('honors Retry-After without automatically retrying', async () => {
  let now = 2_000_000;
  let fetchCount = 0;
  let warningCount = 0;
  Date.now = () => now;
  console.warn = () => {
    warningCount += 1;
  };
  const spotify = await loadSpotifyClient();
  globalThis.fetch = async () => {
    fetchCount += 1;
    if (fetchCount === 1) {
      return spotifyResponse({ error: 'rate_limited' }, 429, {
        'Retry-After': '30',
      });
    }
    return spotifyResponse([track]);
  };

  assert.deepEqual(await spotify.fetchSavedTracks(), { kind: 'unavailable' });
  assert.equal(fetchCount, 1);
  assert.equal(warningCount, 1);

  now += 29_999;
  assert.deepEqual(await spotify.fetchTopTracks('short_term'), {
    kind: 'unavailable',
  });
  assert.equal(fetchCount, 1);
  assert.equal(warningCount, 1);

  now += 1;
  assert.deepEqual(await spotify.fetchTopTracks('short_term'), {
    kind: 'success',
    data: [track],
  });
  assert.equal(fetchCount, 2);
});

test('uses the ten-second fallback backoff when Retry-After is absent', async () => {
  let now = 3_000_000;
  let fetchCount = 0;
  Date.now = () => now;
  console.warn = () => {};
  const spotify = await loadSpotifyClient();
  globalThis.fetch = async () => {
    fetchCount += 1;
    return fetchCount === 1
      ? spotifyResponse({ error: 'upstream_failure' }, 502)
      : spotifyResponse(track);
  };

  await spotify.fetchCurrentTrack();
  now += 9_999;
  await spotify.fetchCurrentTrack();
  assert.equal(fetchCount, 1);

  now += 1;
  assert.deepEqual(await spotify.fetchCurrentTrack(), {
    kind: 'success',
    data: track,
  });
  assert.equal(fetchCount, 2);
});

test('deduplicates identical in-flight requests', async () => {
  const spotify = await loadSpotifyClient();
  let resolveResponse;
  let fetchCount = 0;
  globalThis.fetch = () => {
    fetchCount += 1;
    return new Promise((resolve) => {
      resolveResponse = resolve;
    });
  };

  const first = spotify.fetchCurrentTrack();
  const second = spotify.fetchCurrentTrack();
  resolveResponse(
    spotifyResponse(track, 200, {
      'Cache-Control': 'public, max-age=30',
    }),
  );

  assert.deepEqual(await first, { kind: 'success', data: track });
  assert.deepEqual(await second, { kind: 'success', data: track });
  assert.equal(fetchCount, 1);
});
