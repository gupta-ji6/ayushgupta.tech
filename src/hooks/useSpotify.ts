import { useCallback, useEffect, useState } from 'react';

import {
  fetchCurrentTrack,
  fetchFavouritePlaylist,
  fetchRecentlyPlayedTracks,
  fetchSavedPlaylists,
  fetchSavedTracks,
  fetchTopArtists,
  fetchTopTracks,
  type SpotifyArtist,
  type SpotifyPlaylist,
  type SpotifyResult,
  type SpotifyTimeRange,
  type SpotifyTrack,
} from '@utils/spotify';

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

export function useNowPlayingTrack(): SpotifyResourceState<SpotifyTrack> {
  const fetcher = useCallback(() => fetchCurrentTrack(), []);

  return useSpotifyResource(fetcher);
}

export function useTopSpotifyTracks(
  timeRange: SpotifyTimeRange,
): SpotifyResourceState<SpotifyTrack[]> {
  const fetcher = useCallback(() => fetchTopTracks(timeRange), [timeRange]);

  return useSpotifyResource(fetcher);
}

export function useTopSpotifyArtists(
  timeRange: SpotifyTimeRange,
): SpotifyResourceState<SpotifyArtist[]> {
  const fetcher = useCallback(() => fetchTopArtists(timeRange), [timeRange]);

  return useSpotifyResource(fetcher);
}

export function useFavouritePlaylist(): SpotifyResourceState<SpotifyPlaylist> {
  const fetcher = useCallback(() => fetchFavouritePlaylist(), []);

  return useSpotifyResource(fetcher);
}

export function useRecentlyPlayedTracks(): SpotifyResourceState<
  SpotifyTrack[]
> {
  const fetcher = useCallback(async (): Promise<
    SpotifyResult<SpotifyTrack[]>
  > => {
    const result = await fetchRecentlyPlayedTracks();
    if (result.kind !== 'success') {
      return result;
    }

    const seen = new Set<string>();
    return {
      kind: 'success',
      data: result.data.filter((track) => {
        if (seen.has(track.id)) return false;
        seen.add(track.id);
        return true;
      }),
    };
  }, []);

  return useSpotifyResource(fetcher);
}

export function useSavedTracks(): SpotifyResourceState<SpotifyTrack[]> {
  const fetcher = useCallback(() => fetchSavedTracks(), []);

  return useSpotifyResource(fetcher);
}

export function useUserPlaylists(): SpotifyResourceState<SpotifyPlaylist[]> {
  const fetcher = useCallback(() => fetchSavedPlaylists(), []);

  return useSpotifyResource(fetcher);
}
