import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

const originalFetch = globalThis.fetch;
const originalConsoleWarn = console.warn;
let moduleVersion = 0;

async function loadSpotifyClient() {
  moduleVersion += 1;
  return import(`../src/utils/spotify.ts?test=${moduleVersion}`);
}

function mockSpotifyResponse(body, status = 200) {
  globalThis.fetch = async () =>
    new Response(body == null ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.warn = originalConsoleWarn;
});

test('keeps Spotify empty, successful, and unavailable results distinct', async (t) => {
  await t.test(
    'treats a no-content now-playing response as empty',
    async () => {
      const spotify = await loadSpotifyClient();
      mockSpotifyResponse(null, 204);

      assert.deepEqual(await spotify.fetchCurrentTrack(), { kind: 'empty' });
    },
  );

  await t.test('treats a valid empty collection as empty', async () => {
    const spotify = await loadSpotifyClient();
    mockSpotifyResponse({ items: [] });

    assert.deepEqual(await spotify.fetchCurrentUsersTopItems('tracks'), {
      kind: 'empty',
    });
  });

  await t.test('keeps populated collections successful', async () => {
    const spotify = await loadSpotifyClient();
    mockSpotifyResponse({ items: [{ name: 'A track' }] });

    assert.deepEqual(await spotify.fetchCurrentUsersTopItems('tracks'), {
      kind: 'success',
      data: { items: [{ name: 'A track' }] },
    });
  });

  await t.test(
    'treats generic and reauthorization failures as unavailable',
    async () => {
      for (const [status, body] of [
        [502, { error: 'Failed to proxy Spotify request' }],
        [503, { error: 'reauthorization_required' }],
      ]) {
        const spotify = await loadSpotifyClient();
        mockSpotifyResponse(body, status);
        console.warn = () => {};

        assert.deepEqual(await spotify.fetchCurrentTrack(), {
          kind: 'unavailable',
        });
      }
    },
  );
});
