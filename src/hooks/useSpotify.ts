import { useCallback, useEffect, useState } from 'react';

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

function useSpotifyResource<T>(
  fetcher: () => Promise<SpotifyResult<T>>,
): SpotifyResourceState<T> {
  const [state, setState] = useState<SpotifyResourceState<T>>({
    kind: 'loading',
  });

  const run = useCallback(async () => {
    setState({ kind: 'loading' });
    setState(await fetcher());
  }, [fetcher]);

  useEffect(() => {
    void run();
  }, [run]);

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
  const fetcher = useCallback(() => fetchCurrentTrack(), []);

  return useSpotifyResource(fetcher);
}

export function useTopSpotifyItems<T extends SpotifyTopItemType>(
  type: T,
  timeRange: SpotifyTimeRange,
  limit = 20,
): SpotifyResourceState<SpotifyTopItem<T>[]> {
  const fetcher = useCallback(async (): Promise<
    SpotifyResult<SpotifyTopItem<T>[]>
  > => {
    const response = await fetchCurrentUsersTopItems(type, timeRange, limit);

    if (response.kind !== 'success') {
      return response;
    }

    return { kind: 'success', data: response.data.items ?? [] };
  }, [limit, timeRange, type]);

  return useSpotifyResource(fetcher);
}

export function useFavouritePlaylist(
  playlistId = '3qWhbV6ul3Bfl2iHrN4TYn',
): SpotifyResourceState<SpotifyPlaylist> {
  const fetcher = useCallback(
    () => fetchPlaylistById(playlistId),
    [playlistId],
  );

  return useSpotifyResource(fetcher);
}

export function useRecentlyPlayedTracks(
  limit = 20,
): SpotifyResourceState<SpotifyRecentlyPlayedItem[]> {
  const fetcher = useCallback(async (): Promise<
    SpotifyResult<SpotifyRecentlyPlayedItem[]>
  > => {
    const response = await fetchCurrentUsersRecentlyPlayed(limit);

    if (response.kind !== 'success') {
      return response;
    }

    const items = getUniqueRecentlyPlayedTracks(response.data.items ?? []);
    return items.length > 0
      ? { kind: 'success', data: items }
      : { kind: 'empty' };
  }, [limit]);

  return useSpotifyResource(fetcher);
}

export function useSavedTracks(
  limit = 20,
): SpotifyResourceState<SpotifySavedTrackItem[]> {
  const fetcher = useCallback(async (): Promise<
    SpotifyResult<SpotifySavedTrackItem[]>
  > => {
    const response = await fetchCurrentUsersSavedTracks(limit);

    if (response.kind !== 'success') {
      return response;
    }

    return { kind: 'success', data: response.data.items ?? [] };
  }, [limit]);

  return useSpotifyResource(fetcher);
}

export function useUserPlaylists(
  limit = 20,
): SpotifyResourceState<SpotifyPlaylist[]> {
  const fetcher = useCallback(async (): Promise<
    SpotifyResult<SpotifyPlaylist[]>
  > => {
    const response = await fetchCurrentUserPlaylists(limit);

    if (response.kind !== 'success') {
      return response;
    }

    return { kind: 'success', data: response.data.items ?? [] };
  }, [limit]);

  return useSpotifyResource(fetcher);
}
