import { useCallback, useEffect, useRef, useState } from 'react';

import {
  fetchCurrentTrack,
  fetchCurrentUserPlaylists,
  fetchCurrentUsersRecentlyPlayed,
  fetchCurrentUsersSavedTracks,
  fetchCurrentUsersTopItems,
  fetchPlaylistById,
  type SpotifyArtist,
  type SpotifyPlaylist,
  type SpotifyRecentlyPlayedItem,
  type SpotifySavedTrackItem,
  type SpotifyTrack,
} from '@utils/spotify';

type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';

interface ResourceState<T> {
  data: T;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

function useSpotifyResource<T>(
  fetcher: () => Promise<T | undefined>,
  initialValue: T,
  errorMessage: string,
): ResourceState<T> {
  const initialValueRef = useRef(initialValue);
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);

    const nextData = await fetcher();

    if (nextData === undefined) {
      setData(initialValueRef.current);
      setError(errorMessage);
      setLoading(false);
      return;
    }

    setData(nextData);
    setError(null);
    setLoading(false);
  }, [errorMessage, fetcher]);

  useEffect(() => {
    void run();
  }, [run]);

  return {
    data,
    error,
    loading,
    refetch: run,
  };
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

export function useNowPlayingTrack(): ResourceState<SpotifyTrack | null> {
  const fetcher = useCallback(
    async () => (await fetchCurrentTrack()) ?? null,
    [],
  );

  return useSpotifyResource(
    fetcher,
    null,
    "Couldn't fetch Ayush's now playing track.",
  );
}

export function useTopSpotifyItems(
  type: 'artists' | 'tracks',
  timeRange: SpotifyTimeRange,
  limit = 20,
): ResourceState<SpotifyArtist[] | SpotifyTrack[]> {
  const fetcher = useCallback(async () => {
    const response = await fetchCurrentUsersTopItems(type, timeRange, limit);
    return response?.items ?? undefined;
  }, [limit, timeRange, type]);

  return useSpotifyResource(
    fetcher,
    [],
    type === 'artists'
      ? "Couldn't fetch Ayush's top artists."
      : "Couldn't fetch Ayush's top tracks.",
  );
}

export function useFavouritePlaylist(
  playlistId = '3qWhbV6ul3Bfl2iHrN4TYn',
): ResourceState<SpotifyPlaylist | null> {
  const fetcher = useCallback(
    async () => (await fetchPlaylistById(playlistId)) ?? null,
    [playlistId],
  );

  return useSpotifyResource(
    fetcher,
    null,
    "Couldn't fetch Ayush's favourite playlist.",
  );
}

export function useRecentlyPlayedTracks(
  limit = 20,
): ResourceState<SpotifyRecentlyPlayedItem[]> {
  const fetcher = useCallback(async () => {
    const response = await fetchCurrentUsersRecentlyPlayed(limit);
    const items = response?.items ?? [];
    return items.length ? getUniqueRecentlyPlayedTracks(items) : undefined;
  }, [limit]);

  return useSpotifyResource(
    fetcher,
    [],
    "Couldn't fetch recently played tracks.",
  );
}

export function useSavedTracks(
  limit = 20,
): ResourceState<SpotifySavedTrackItem[]> {
  const fetcher = useCallback(async () => {
    const response = await fetchCurrentUsersSavedTracks(limit);
    return response?.items ?? undefined;
  }, [limit]);

  return useSpotifyResource(
    fetcher,
    [],
    "Couldn't fetch recently saved tracks.",
  );
}

export function useUserPlaylists(limit = 20): ResourceState<SpotifyPlaylist[]> {
  const fetcher = useCallback(async () => {
    const response = await fetchCurrentUserPlaylists(limit);
    return response?.items ?? undefined;
  }, [limit]);

  return useSpotifyResource(fetcher, [], "Couldn't fetch Ayush's playlists.");
}
