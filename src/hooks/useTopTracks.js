import { useEffect, useState } from 'react';
import { fetchCurrentUsersTopArtistsOrTracks } from '../utils/spotify';

/**
 * Get the current user’s top artists or tracks based on calculated affinity.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-top-artists-and-tracks}
 * @param {string} [type='tracks'] - The type of entity to return. Valid values: artists or tracks.
 * @param {string} [time_range='short_term'] - Over what time frame the affinities are computed. Valid values: long_term (calculated from several years of data and including all new data as it becomes available), medium_term (approximately last 6 months), short_term (approximately last 4 weeks). Default: medium_term
 * @param {number} [limit=20] - The number of entities to return. Default: 20. Minimum: 1. Maximum: 50.
 * @return {Object} contains a paging object of Artists or Tracks.
 */
function useTopTracks(type = 'tracks', time_range = 'short_term', limit = 20) {
  const [topTracks, setTopTracks] = useState([]);
  const [topTracksError, setTopTracksError] = useState(null);
  const [topTracksLoading, setTopTracksLoading] = useState(false);

  async function fetchData() {
    setTopTracksLoading(true);
    const tracks = await fetchCurrentUsersTopArtistsOrTracks(type, time_range, limit);
    //   console.log(tracks);
    if (tracks !== undefined) {
      setTopTracks(tracks?.items);
      setTopTracksLoading(false);
      setTopTracksError(null);
    } else {
      setTopTracks([]);
      setTopTracksLoading(false);
      setTopTracksError(`Couldn't fetch Ayush's top tracks.`);
    }
  }

  useEffect(() => {
    let unsubscribe = false;
    if (!unsubscribe) {
      fetchData();
    }
    return () => {
      unsubscribe = true;
    };
  }, [time_range, type, limit]);

  return {
    topTracks,
    topTracksError,
    topTracksLoading,
    refetchTopTracks: fetchData,
  };
}

export default useTopTracks;
