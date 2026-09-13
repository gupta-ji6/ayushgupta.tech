const crypto = require('node:crypto');

const fetch = globalThis.fetch || require('node-fetch');

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const FAVOURITE_PLAYLIST_ID = '3qWhbV6ul3Bfl2iHrN4TYn';
const ORIGIN_KEY_HEADER = 'x-spotify-origin-key';
const ORIGIN_KEY_MINIMUM_LENGTH = 32;
const CACHE_VARY = 'query,header=X-Spotify-Origin-Key';
const TIME_RANGES = new Set(['short_term', 'medium_term', 'long_term']);

const RESOURCES = {
  'now-playing': {
    path: '/me/player/currently-playing',
    maximumCacheSeconds: 30,
    requiresRange: false,
  },
  'top-tracks': {
    path: '/me/top/tracks',
    maximumCacheSeconds: 300,
    requiresRange: true,
  },
  'top-artists': {
    path: '/me/top/artists',
    maximumCacheSeconds: 300,
    requiresRange: true,
  },
  'favourite-playlist': {
    path: `/playlists/${FAVOURITE_PLAYLIST_ID}`,
    maximumCacheSeconds: 300,
    requiresRange: false,
  },
  'recently-played': {
    path: '/me/player/recently-played',
    maximumCacheSeconds: 300,
    requiresRange: false,
  },
  'saved-tracks': {
    path: '/me/tracks',
    maximumCacheSeconds: 300,
    requiresRange: false,
  },
  'saved-playlists': {
    path: '/me/playlists',
    maximumCacheSeconds: 300,
    requiresRange: false,
  },
};

let cachedToken = { value: null, expiresAt: 0 };
let replacementRefreshToken = null;

class SpotifyAuthorizationError extends Error {}
class SpotifyRateLimitError extends Error {
  constructor(retryAfter) {
    super('Spotify rate limit reached');
    this.retryAfter = retryAfter;
  }
}
class SpotifyUpstreamError extends Error {}

function baseHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
    'Netlify-Vary': CACHE_VARY,
  };
}

function jsonResponse(statusCode, error, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...baseHeaders(), ...extraHeaders },
    body: JSON.stringify({ error }),
  };
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new SpotifyUpstreamError(`Malformed Spotify ${field}`);
  }

  return value;
}

function optionalNonNegativeInteger(value, field) {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new SpotifyUpstreamError(`Malformed Spotify ${field}`);
  }

  return value;
}

function spotifyUrl(value, field) {
  const rawUrl = requiredString(value, field);

  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com') {
      throw new Error('Unexpected Spotify URL');
    }
  } catch {
    throw new SpotifyUpstreamError(`Malformed Spotify ${field}`);
  }

  return rawUrl;
}

function artworkImage(images, field) {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const source = images[1] ?? images[0];
  if (!isRecord(source)) {
    throw new SpotifyUpstreamError(`Malformed Spotify ${field}`);
  }

  const rawUrl = requiredString(source.url, `${field} URL`);
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:') {
      throw new Error('Artwork URL must use HTTPS');
    }
  } catch {
    throw new SpotifyUpstreamError(`Malformed Spotify ${field} URL`);
  }

  const image = { url: rawUrl };
  const width = optionalNonNegativeInteger(source.width, `${field} width`);
  const height = optionalNonNegativeInteger(source.height, `${field} height`);

  if (width !== null) image.width = width;
  if (height !== null) image.height = height;

  return image;
}

function mapTrack(value) {
  if (!isRecord(value) || !isRecord(value.album)) {
    throw new SpotifyUpstreamError('Malformed Spotify track');
  }
  if (!Array.isArray(value.artists) || value.artists.length === 0) {
    throw new SpotifyUpstreamError('Malformed Spotify track artists');
  }
  if (!isRecord(value.external_urls)) {
    throw new SpotifyUpstreamError('Malformed Spotify track URL');
  }

  const artists = value.artists.map((artist) => {
    if (!isRecord(artist)) {
      throw new SpotifyUpstreamError('Malformed Spotify track artist');
    }
    return requiredString(artist.name, 'track artist name');
  });

  return {
    id: requiredString(value.id, 'track ID'),
    name: requiredString(value.name, 'track name'),
    albumName: requiredString(value.album.name, 'album name'),
    image: artworkImage(value.album.images, 'album artwork'),
    artists,
    spotifyUrl: spotifyUrl(value.external_urls.spotify, 'track URL'),
  };
}

function mapArtist(value) {
  if (!isRecord(value) || !isRecord(value.external_urls)) {
    throw new SpotifyUpstreamError('Malformed Spotify artist');
  }
  if (
    !Array.isArray(value.genres) ||
    !value.genres.every((genre) => typeof genre === 'string')
  ) {
    throw new SpotifyUpstreamError('Malformed Spotify artist genres');
  }

  return {
    id: requiredString(value.id, 'artist ID'),
    name: requiredString(value.name, 'artist name'),
    image: artworkImage(value.images, 'artist artwork'),
    genres: value.genres,
    spotifyUrl: spotifyUrl(value.external_urls.spotify, 'artist URL'),
  };
}

function mapPlaylist(value) {
  if (!isRecord(value) || !isRecord(value.external_urls)) {
    throw new SpotifyUpstreamError('Malformed Spotify playlist');
  }

  const ownerName =
    isRecord(value.owner) && typeof value.owner.display_name === 'string'
      ? value.owner.display_name
      : null;
  const rawTrackCount =
    isRecord(value.items) && value.items.total !== undefined
      ? value.items.total
      : isRecord(value.tracks)
        ? value.tracks.total
        : undefined;

  return {
    id: requiredString(value.id, 'playlist ID'),
    name: requiredString(value.name, 'playlist name'),
    image: artworkImage(value.images, 'playlist artwork'),
    ownerName,
    trackCount: optionalNonNegativeInteger(
      rawTrackCount,
      'playlist track count',
    ),
    spotifyUrl: spotifyUrl(value.external_urls.spotify, 'playlist URL'),
  };
}

function mapCollection(value, itemMapper, itemSelector = (item) => item) {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new SpotifyUpstreamError('Malformed Spotify collection');
  }

  return value.items.slice(0, 10).map((item) => itemMapper(itemSelector(item)));
}

function mapSpotifyPayload(resource, payload) {
  switch (resource) {
    case 'now-playing':
      if (!isRecord(payload)) {
        throw new SpotifyUpstreamError('Malformed Spotify playback state');
      }
      if (payload.item === null || payload.item === undefined) {
        return null;
      }
      if (payload.currently_playing_type !== 'track') {
        return null;
      }
      return mapTrack(payload.item);
    case 'top-tracks':
      return mapCollection(payload, mapTrack);
    case 'top-artists':
      return mapCollection(payload, mapArtist);
    case 'favourite-playlist':
      return mapPlaylist(payload);
    case 'recently-played':
    case 'saved-tracks':
      return mapCollection(payload, mapTrack, (item) => {
        if (!isRecord(item)) {
          throw new SpotifyUpstreamError('Malformed Spotify track item');
        }
        return item.track;
      });
    case 'saved-playlists':
      return mapCollection(payload, mapPlaylist);
    default:
      throw new SpotifyUpstreamError('Unknown Spotify resource');
  }
}

function getQueryEntries(event) {
  if (typeof event.rawUrl === 'string') {
    return [...new URL(event.rawUrl, 'https://local.invalid').searchParams];
  }
  if (typeof event.rawQuery === 'string') {
    return [...new URLSearchParams(event.rawQuery)];
  }
  if (isRecord(event.multiValueQueryStringParameters)) {
    return Object.entries(event.multiValueQueryStringParameters).flatMap(
      ([key, values]) =>
        Array.isArray(values) ? values.map((value) => [key, value]) : [],
    );
  }

  return Object.entries(event.queryStringParameters ?? {});
}

function parseResourceRequest(event) {
  let entries;
  try {
    entries = getQueryEntries(event);
  } catch {
    return null;
  }

  if (
    entries.some(
      ([key, value]) =>
        (key !== 'resource' && key !== 'range') || typeof value !== 'string',
    )
  ) {
    return null;
  }

  const resources = entries
    .filter(([key]) => key === 'resource')
    .map(([, value]) => value);
  const ranges = entries
    .filter(([key]) => key === 'range')
    .map(([, value]) => value);

  if (resources.length !== 1 || ranges.length > 1) {
    return null;
  }

  const resource = resources[0];
  const definition = RESOURCES[resource];
  if (!definition) {
    return null;
  }

  if (definition.requiresRange) {
    if (ranges.length !== 1 || !TIME_RANGES.has(ranges[0])) {
      return null;
    }
  } else if (ranges.length !== 0) {
    return null;
  }

  const query = new URLSearchParams();
  if (definition.requiresRange) {
    query.set('time_range', ranges[0]);
    query.set('limit', '10');
  } else if (
    resource === 'recently-played' ||
    resource === 'saved-tracks' ||
    resource === 'saved-playlists'
  ) {
    query.set('limit', '10');
  }

  return {
    resource,
    definition,
    url: `${SPOTIFY_API_BASE}${definition.path}${query.size ? `?${query}` : ''}`,
  };
}

function getRequestHeader(event, name) {
  const headers = event.headers ?? {};
  const match = Object.entries(headers).find(
    ([headerName]) => headerName.toLowerCase() === name,
  );
  return typeof match?.[1] === 'string' ? match[1] : null;
}

function constantTimeEqual(value, expected) {
  const valueDigest = crypto.createHash('sha256').update(value).digest();
  const expectedDigest = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(valueDigest, expectedDigest);
}

function authorizeOrigin(event, localDevelopment) {
  if (localDevelopment) {
    return 'authorized';
  }

  const validKeys = [
    process.env.SPOTIFY_ORIGIN_KEY_CURRENT,
    process.env.SPOTIFY_ORIGIN_KEY_NEXT,
  ].filter(
    (key) => typeof key === 'string' && key.length >= ORIGIN_KEY_MINIMUM_LENGTH,
  );

  if (validKeys.length === 0) {
    return 'misconfigured';
  }

  const suppliedKey = getRequestHeader(event, ORIGIN_KEY_HEADER);
  if (!suppliedKey) {
    return 'forbidden';
  }

  let authorized = false;
  for (const key of validKeys) {
    authorized = constantTimeEqual(suppliedKey, key) || authorized;
  }

  return authorized ? 'authorized' : 'forbidden';
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    throw new SpotifyUpstreamError('Spotify returned malformed JSON');
  }
}

async function getAccessToken() {
  if (cachedToken.value && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const configuredRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !configuredRefreshToken) {
    throw new SpotifyUpstreamError('Missing Spotify credentials');
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: replacementRefreshToken ?? configuredRefreshToken,
  });
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (response.status === 429) {
    throw new SpotifyRateLimitError(
      sanitizedRetryAfter(response.headers.get('retry-after')),
    );
  }
  const data = await readJson(response);
  if (!response.ok && isRecord(data) && data.error === 'invalid_grant') {
    throw new SpotifyAuthorizationError('Spotify authorization needs renewal');
  }
  if (!response.ok) {
    throw new SpotifyUpstreamError('Spotify token refresh failed');
  }
  if (!isRecord(data)) {
    throw new SpotifyUpstreamError('Malformed Spotify token response');
  }

  const accessToken = requiredString(data.access_token, 'access token');
  const expiresIn =
    typeof data.expires_in === 'number' && data.expires_in > 0
      ? data.expires_in
      : 3600;

  if (typeof data.refresh_token === 'string' && data.refresh_token.length > 0) {
    replacementRefreshToken = data.refresh_token;
  }

  cachedToken = {
    value: accessToken,
    expiresAt: Date.now() + Math.max(expiresIn - 60, 0) * 1000,
  };

  return accessToken;
}

function sanitizedRetryAfter(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const seconds = Number(value);
  return Number.isSafeInteger(seconds) ? String(seconds) : null;
}

function effectiveCacheSeconds(cacheControl, applicationMaximum) {
  if (typeof cacheControl !== 'string') {
    return 0;
  }

  const directives = cacheControl
    .toLowerCase()
    .split(',')
    .map((directive) => directive.trim());

  if (
    directives.includes('no-store') ||
    directives.includes('no-cache') ||
    directives.includes('private')
  ) {
    return 0;
  }

  const freshnessValues = directives
    .filter((directive) => /^(?:s-maxage|max-age)=\d+$/.test(directive))
    .map((directive) => Number(directive.slice(directive.indexOf('=') + 1)))
    .filter((value) => Number.isSafeInteger(value) && value > 0);

  if (freshnessValues.length === 0) {
    return 0;
  }

  return Math.min(...freshnessValues, applicationMaximum);
}

function successHeaders(spotifyResponse, applicationMaximum) {
  const freshness = effectiveCacheSeconds(
    spotifyResponse.headers.get('cache-control'),
    applicationMaximum,
  );

  if (freshness === 0) {
    return baseHeaders();
  }

  return {
    ...baseHeaders(),
    'Cache-Control': `public, max-age=${freshness}`,
    'Netlify-CDN-Cache-Control': `public, durable, max-age=${freshness}`,
  };
}

exports.config = {
  path: '/api/spotify',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: ['ip', 'domain'],
    windowLimit: 30,
    windowSize: 60,
  },
};

function isLocalDevelopment(context) {
  const deployContext = context?.deploy?.context;
  if (typeof deployContext === 'string') {
    return deployContext === 'dev';
  }

  // Astro's local Netlify emulator currently omits deploy context. The dev
  // script sets this process-only marker; an explicit deployed context always
  // takes precedence so the marker cannot bypass production enforcement.
  return process.env.SPOTIFY_LOCAL_DEV_BYPASS === 'true';
}

async function handleEvent(event, { localDevelopment = false } = {}) {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, 'method_not_allowed', { Allow: 'GET' });
  }

  const originAuthorization = authorizeOrigin(event, localDevelopment);
  if (originAuthorization === 'misconfigured') {
    return jsonResponse(503, 'configuration_error');
  }
  if (originAuthorization !== 'authorized') {
    return jsonResponse(403, 'forbidden');
  }

  const request = parseResourceRequest(event);
  if (!request) {
    return jsonResponse(400, 'invalid_request');
  }

  try {
    const accessToken = await getAccessToken();
    const spotifyResponse = await fetch(request.url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (spotifyResponse.status === 429) {
      throw new SpotifyRateLimitError(
        sanitizedRetryAfter(spotifyResponse.headers.get('retry-after')),
      );
    }
    if (spotifyResponse.status === 204 && request.resource === 'now-playing') {
      return {
        statusCode: 204,
        headers: successHeaders(
          spotifyResponse,
          request.definition.maximumCacheSeconds,
        ),
      };
    }
    if (!spotifyResponse.ok) {
      throw new SpotifyUpstreamError('Spotify API request failed');
    }

    const payload = mapSpotifyPayload(
      request.resource,
      await readJson(spotifyResponse),
    );
    const headers = successHeaders(
      spotifyResponse,
      request.definition.maximumCacheSeconds,
    );

    if (request.resource === 'now-playing' && payload === null) {
      return { statusCode: 204, headers };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(payload),
    };
  } catch (error) {
    console.error(
      '[spotify proxy]',
      error instanceof Error ? error.message : 'Unknown Spotify failure',
    );

    if (error instanceof SpotifyAuthorizationError) {
      return jsonResponse(503, 'reauthorization_required');
    }
    if (error instanceof SpotifyRateLimitError) {
      return jsonResponse(
        429,
        'rate_limited',
        error.retryAfter ? { 'Retry-After': error.retryAfter } : {},
      );
    }

    return jsonResponse(502, 'upstream_failure');
  }
}

exports.default = async (request, context) => {
  const url = new URL(request.url);
  const result = await handleEvent(
    {
      httpMethod: request.method,
      rawUrl: request.url,
      rawQuery: url.search.slice(1),
      headers: Object.fromEntries(request.headers),
      queryStringParameters: Object.fromEntries(url.searchParams),
    },
    { localDevelopment: isLocalDevelopment(context) },
  );

  return new Response(result.body ?? null, {
    status: result.statusCode,
    headers: result.headers,
  });
};

// Kept outside Netlify's reserved `handler` export so tests can exercise the
// event-level boundary without downgrading this function from the v2 runtime.
exports.testHandler = (event) =>
  handleEvent(event, {
    localDevelopment: process.env.SPOTIFY_LOCAL_DEV_BYPASS === 'true',
  });
