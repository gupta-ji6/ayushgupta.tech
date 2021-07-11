import { useEffect, useState } from 'react';
import { fetchCurrentUsersSavedTracks } from '../utils/spotify';

/**
 * Custom react hook to get a list of the songs saved in the current Spotify user’s ‘Your Music’ library.
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-saved-tracks}
 *
 * @param {number} [limit=20] The maximum number of tracks to return. Default: 20. Minimum: 1. Maximum: 50.
 * @return {Object} an object containing tracks, loading, error, refetch
 */
function useSavedTracks(limit = 20) {
  const [recentlySavedTracks, setRecentlySavedTracks] = useState([]);
  const [savedTracksError, setSavedTracksError] = useState(null);
  const [savedTracksLoading, setSavedTracksLoading] = useState(false);

  async function fetchData() {
    setSavedTracksLoading(true);
    const tracks = await fetchCurrentUsersSavedTracks(limit);
    //   console.log(tracks);
    if (tracks !== undefined) {
      setRecentlySavedTracks(tracks?.items);
      setSavedTracksLoading(false);
      setSavedTracksError(null);
    } else {
      setRecentlySavedTracks([]);
      setSavedTracksLoading(false);
      setSavedTracksError(`Couldn't fetch recently saved tracks.`);
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
  }, []);

  return {
    recentlySavedTracks,
    savedTracksError,
    savedTracksLoading,
    refetchSavedTracks: fetchData,
  };
}

export default useSavedTracks;
