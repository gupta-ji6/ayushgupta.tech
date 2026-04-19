import { useEffect, useMemo, useRef, useState } from 'react';

import { useNowPlayingTrack } from '@hooks/useSpotify';
import { pickSpotifyCoverImage, type SpotifyTrack } from '@utils/spotify';

import { MusicNoteIcon, PauseIcon, PlayIcon, SpotifyIcon } from './icons';
import './music.css';

type WidgetMode = 'footer' | 'page';

interface NowPlayingWidgetProps {
  mode?: WidgetMode;
}

const SPOTIFY_PROFILE =
  'https://open.spotify.com/user/31yuvamoxkbmkpvhpunh6xwoshii';

const PLAYING_INTROS = [
  'Vibing to',
  'Listening to',
  'Tripping on',
  'Mushing over',
  'Gushing over',
];

const NOT_PLAYING_INTROS = [
  "Maybe I'm bored of my playlist",
  "There's a high chance I'm sleeping",
  'Probably my headphones died',
  'Maybe I had to stop music for a meeting',
  "I'm probably out with my camera",
];

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0] ?? '';
}

function getSpotifyHref(track: SpotifyTrack | null) {
  return track?.external_urls?.spotify ?? SPOTIFY_PROFILE;
}

function getWidgetSubtitle(track: SpotifyTrack | null, mode: WidgetMode) {
  if (mode === 'page') {
    return track?.album?.name ?? 'Open Spotify profile';
  }

  return track?.name ? 'Explore music page' : 'See the full music page';
}

export default function NowPlayingWidget({
  mode = 'footer',
}: NowPlayingWidgetProps) {
  const { data: track, error, loading, refetch } = useNowPlayingTrack();
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isListening = Boolean(track?.name);
  const spotifyHref = getSpotifyHref(track);
  const albumArt = pickSpotifyCoverImage(track?.album?.images);
  const title = track?.name ?? 'Not Playing';
  const subtitle = getWidgetSubtitle(track, mode);

  useEffect(() => {
    const previousAudio = audioRef.current;

    if (previousAudio) {
      previousAudio.pause();
    }

    setIsPreviewPlaying(false);

    if (!track?.preview_url) {
      audioRef.current = null;
      return;
    }

    const audio = new Audio(track.preview_url);
    const handleEnded = () => setIsPreviewPlaying(false);
    audio.addEventListener('ended', handleEnded);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track?.preview_url]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!isPreviewPlaying) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    audio.play().catch(() => setIsPreviewPlaying(false));
  }, [isPreviewPlaying]);

  const introCopy = useMemo(() => {
    if (loading) {
      return 'Fetching live track from Spotify';
    }

    if (error) {
      return 'Live Spotify status is unavailable right now';
    }

    return isListening
      ? randomItem(PLAYING_INTROS)
      : randomItem(NOT_PLAYING_INTROS);
  }, [error, isListening, loading]);

  const infoHref = mode === 'page' ? spotifyHref : '/music';

  return (
    <div className="music-now-playing" data-mode={mode}>
      <div className="music-now-playing-intro">
        <span>{introCopy}</span>
        {error && (
          <button
            type="button"
            className="music-inline-button"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        )}
      </div>

      <div className="music-now-playing-card">
        <a
          href={infoHref}
          className="music-now-playing-main"
          {...(mode === 'page'
            ? { target: '_blank', rel: 'noreferrer noopener' }
            : {})}
        >
          <span className="music-now-playing-art">
            {albumArt ? (
              <img
                src={albumArt.url}
                width={albumArt.width ?? 48}
                height={albumArt.height ?? 48}
                loading="lazy"
                alt=""
              />
            ) : (
              <span className="music-now-playing-fallback" aria-hidden="true">
                <MusicNoteIcon />
              </span>
            )}
          </span>

          <span className="music-now-playing-copy">
            <span className="music-now-playing-title">{title}</span>
            <span className="music-now-playing-subtitle">{subtitle}</span>
          </span>
        </a>

        {track?.preview_url ? (
          <button
            type="button"
            className="music-now-playing-action"
            aria-label={
              isPreviewPlaying ? 'Pause track preview' : 'Play track preview'
            }
            aria-pressed={isPreviewPlaying}
            onClick={() => setIsPreviewPlaying((value) => !value)}
          >
            {isPreviewPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        ) : (
          <a
            href={spotifyHref}
            className="music-now-playing-action music-now-playing-action-link"
            target="_blank"
            rel="noreferrer noopener"
            aria-label={
              isListening
                ? `Open ${track?.name} on Spotify`
                : 'Open Spotify profile'
            }
          >
            <SpotifyIcon />
          </a>
        )}
      </div>
    </div>
  );
}
