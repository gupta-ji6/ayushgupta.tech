import { useEffect, useState } from 'react';
import { fetchPlaylistById } from '../utils/spotify';

/**
 * Custom react hook to get any playlist by Id.
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-playlist}
 *
 * @param {string} playlist_id The Spotify ID for the playlist.
 * @return {Object} an object containing playlist, loading, error, refetch
 */
function useAyushFavouritePlaylist(playlist_id = '3qWhbV6ul3Bfl2iHrN4TYn') {
  const [ayushFavouritePlaylist, setAyushFavouritePlaylist] = useState([]);
  const [ayushFavouritePlaylistError, setAyushFavouritePlaylistError] = useState(null);
  const [ayushFavouritePlaylistLoading, setAyushFavouritePlaylistLoading] = useState(false);

  async function fetchData() {
    setAyushFavouritePlaylistLoading(true);
    const playlist = await fetchPlaylistById(playlist_id);
    // console.log(playlist);
    if (playlist !== undefined) {
      setAyushFavouritePlaylist(playlist);
      setAyushFavouritePlaylistLoading(false);
      setAyushFavouritePlaylistError(null);
    } else {
      setAyushFavouritePlaylist([]);
      setAyushFavouritePlaylistLoading(false);
      setAyushFavouritePlaylistError(`Couldn't fetch Ayush's favourite playlist.`);
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
    ayushFavouritePlaylist,
    ayushFavouritePlaylistError,
    ayushFavouritePlaylistLoading,
    refetchAyushFavouritePlaylist: fetchData,
  };
}

export default useAyushFavouritePlaylist;
