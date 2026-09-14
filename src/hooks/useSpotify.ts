import { useCallback, useEffect, useReducer } from 'react';

import { isAbortError } from '@utils/http';
import {
  fetchCurrentTrack,
  fetchCurrentUserPlaylists,
  fetchCurrentUsersRecentlyPlayed,
  fetchCurrentUsersSavedTracks,
  fetchCurrentUsersTopItems,
  fetchPlaylistById,
  type SpotifyResult,
  type SpotifyArtist,
  type SpotifyPlaylist,
  type SpotifyRecentlyPlayedItem,
  type SpotifySavedTrackItem,
  type SpotifyTrack,
} from '@utils/spotify';

type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';
type SpotifyTopItemType = 'artists' | 'tracks';
type SpotifyTopItem<T extends SpotifyTopItemType> = T extends 'artists'
  ? SpotifyArtist
  : SpotifyTrack;

export type SpotifyResourceState<T> = { kind: 'loading' } | SpotifyResult<T>;

type SpotifyResourceAction<T> =
  | { kind: 'loading' }
  | { kind: 'resolved'; result: SpotifyResult<T> }
  | { kind: 'unavailable' };

const INITIAL_SPOTIFY_RESOURCE_STATE: { kind: 'loading' } = {
  kind: 'loading',
};

function reduceSpotifyResource<T>(
  _state: SpotifyResourceState<T>,
  action: SpotifyResourceAction<T>,
): SpotifyResourceState<T> {
  switch (action.kind) {
    case 'loading':
      return { kind: 'loading' };
    case 'resolved':
      return action.result;
    case 'unavailable':
      return { kind: 'unavailable' };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

function useSpotifyResource<T>(
  fetcher: (signal: AbortSignal) => Promise<SpotifyResult<T>>,
): SpotifyResourceState<T> {
  const [state, dispatch] = useReducer(
    reduceSpotifyResource<T>,
    INITIAL_SPOTIFY_RESOURCE_STATE,
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    dispatch({ kind: 'loading' });
    void fetcher(controller.signal)
      .then((result) => {
        if (active && !controller.signal.aborted) {
          dispatch({ kind: 'resolved', result });
        }
      })
      .catch((error: unknown) => {
        if (active && !isAbortError(error)) {
          dispatch({ kind: 'unavailable' });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetcher]);

  return state;
}

function getUniqueRecentlyPlayedTracks(
  items: SpotifyRecentlyPlayedItem[],
): SpotifyRecentlyPlayedItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const trackId = item.track?.id;

    if (!trackId || seen.has(trackId)) {
      return false;
    }

    seen.add(trackId);
    return true;
  });
}

export function useNowPlayingTrack(): SpotifyResourceState<SpotifyTrack> {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchCurrentTrack({ signal }),
    [],
  );

  return useSpotifyResource(fetcher);
}

export function useTopSpotifyItems<T extends SpotifyTopItemType>(
  type: T,
  timeRange: SpotifyTimeRange,
  limit = 20,
): SpotifyResourceState<SpotifyTopItem<T>[]> {
  const fetcher = useCallback(
    async (
      signal: AbortSignal,
    ): Promise<SpotifyResult<SpotifyTopItem<T>[]>> => {
      const response = await fetchCurrentUsersTopItems(type, timeRange, limit, {
        signal,
      });

      if (response.kind !== 'success') {
        return response;
      }

      return { kind: 'success', data: response.data.items ?? [] };
    },
    [limit, timeRange, type],
  );

  return useSpotifyResource(fetcher);
}

export function useFavouritePlaylist(
  playlistId = '3qWhbV6ul3Bfl2iHrN4TYn',
): SpotifyResourceState<SpotifyPlaylist> {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchPlaylistById(playlistId, { signal }),
    [playlistId],
  );

  return useSpotifyResource(fetcher);
}

export function useRecentlyPlayedTracks(
  limit = 20,
): SpotifyResourceState<SpotifyRecentlyPlayedItem[]> {
  const fetcher = useCallback(
    async (
      signal: AbortSignal,
    ): Promise<SpotifyResult<SpotifyRecentlyPlayedItem[]>> => {
      const response = await fetchCurrentUsersRecentlyPlayed(limit, { signal });

      if (response.kind !== 'success') {
        return response;
      }

      const items = getUniqueRecentlyPlayedTracks(response.data.items ?? []);
      return items.length > 0
        ? { kind: 'success', data: items }
        : { kind: 'empty' };
    },
    [limit],
  );

  return useSpotifyResource(fetcher);
}

export function useSavedTracks(
  limit = 20,
): SpotifyResourceState<SpotifySavedTrackItem[]> {
  const fetcher = useCallback(
    async (
      signal: AbortSignal,
    ): Promise<SpotifyResult<SpotifySavedTrackItem[]>> => {
      const response = await fetchCurrentUsersSavedTracks(limit, { signal });

      if (response.kind !== 'success') {
        return response;
      }

      return { kind: 'success', data: response.data.items ?? [] };
    },
    [limit],
  );

  return useSpotifyResource(fetcher);
}

export function useUserPlaylists(
  limit = 20,
): SpotifyResourceState<SpotifyPlaylist[]> {
  const fetcher = useCallback(
    async (signal: AbortSignal): Promise<SpotifyResult<SpotifyPlaylist[]>> => {
      const response = await fetchCurrentUserPlaylists(limit, { signal });

      if (response.kind !== 'success') {
        return response;
      }

      return { kind: 'success', data: response.data.items ?? [] };
    },
    [limit],
  );

  return useSpotifyResource(fetcher);
}
