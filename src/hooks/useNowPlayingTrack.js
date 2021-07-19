import { useEffect, useState } from 'react';
import { fetchCurrentTrack } from '../utils/spotify';

/**
 * Get the object currently being played on the user’s Spotify account.
 *
 * @see {@link https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-users-top-artists-and-tracks}
 * @return {Object}  contains information about the currently playing track or episode and its context.
 */
function useNowPlayingTrack() {
  const [nowPlayingTrack, setNowPlayingTrack] = useState([]);
  const [nowPlayingError, setNowPlayingError] = useState(null);
  const [nowPlayingLoading, setNowPlayingLoading] = useState(false);
  const [isAyushListeningToAnything, setIsAyushListeningToAnything] = useState(false);
  const [audio, setAudio] = useState(null);

  async function fetchData() {
    setNowPlayingLoading(true);
    const track = await fetchCurrentTrack();
    // console.log(track);
    if (track !== undefined) {
      setNowPlayingTrack(track);
      setNowPlayingLoading(false);
      setNowPlayingError(null);
      setIsAyushListeningToAnything(true);
      if (track?.preview_url !== null) {
        setAudio(new Audio(track?.preview_url));
      }
    } else {
      setNowPlayingTrack([]);
      setNowPlayingLoading(false);
      setNowPlayingError(`Couldn't fetch Ayush's now playing track.`);
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
    nowPlayingTrack: nowPlayingTrack,
    nowPlayingError: nowPlayingError,
    nowPlayingLoading: nowPlayingLoading,
    refetchNowPlayingTrack: fetchData,
    nowPlayingAudio: audio,
    isAyushListeningToAnything,
  };
}

export default useNowPlayingTrack;
