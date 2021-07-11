import { useEffect, useState } from 'react';
import { fetchCurrentUserPlaylists } from '../utils/spotify';

/**
 * Custom react hook to geta list of the playlists owned or followed by the current Spotify user.
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-a-list-of-current-users-playlists}
 *
 * @param {number} [limit=20] The maximum number of tracks to return. Default: 20. Minimum: 1. Maximum: 50.
 * @return {Object} an object containing playlists, loading, error, refetch
 */
function useUserPlaylists(limit = 20) {
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [userPlaylistsError, setUserPlaylistsError] = useState(null);
  const [userPlaylistsLoading, setUserPlaylistsLoading] = useState(false);

  async function fetchData() {
    setUserPlaylistsLoading(true);
    const playlists = await fetchCurrentUserPlaylists(limit);
    //   console.log(playlists);
    if (playlists !== undefined) {
      setUserPlaylists(playlists?.items);
      setUserPlaylistsLoading(false);
      setUserPlaylistsError(null);
    } else {
      setUserPlaylists([]);
      setUserPlaylistsLoading(false);
      setUserPlaylistsError(`Couldn't fetch Ayush's playlists.`);
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
    userPlaylists,
    userPlaylistsError,
    userPlaylistsLoading,
    refetchUserPlaylists: fetchData,
  };
}

export default useUserPlaylists;
