import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { commentsResponseSchema } from '../src/utils/comments.ts';
import {
  HttpResponseError,
  isAbortError,
  requestJson,
} from '../src/utils/http.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('requestJson exposes structured HTTP errors', async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: 'Unavailable' }), { status: 503 });

  await assert.rejects(
    requestJson('https://example.test/data', commentsResponseSchema),
    (error) => {
      assert.ok(error instanceof HttpResponseError);
      assert.equal(error.status, 503);
      assert.deepEqual(error.body, { error: 'Unavailable' });
      return true;
    },
  );
});

test('requestJson preserves silent AbortError cancellation', async () => {
  const controller = new AbortController();
  globalThis.fetch = (_input, init) =>
    new Promise((_, reject) => {
      init?.signal?.addEventListener(
        'abort',
        () => reject(new DOMException('Aborted', 'AbortError')),
        { once: true },
      );
    });

  const request = requestJson(
    'https://example.test/data',
    commentsResponseSchema,
    { signal: controller.signal },
  );
  controller.abort();

  await assert.rejects(request, (error) => isAbortError(error));
});
