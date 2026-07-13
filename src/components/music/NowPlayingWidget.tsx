import { useEffect, useMemo, useRef, useState } from 'react';

import { useNowPlayingTrack } from '@hooks/useSpotify';
import { pickSpotifyCoverImage, type SpotifyTrack } from '@utils/spotify';

import { MusicNoteIcon, PauseIcon, PlayIcon, SpotifyIcon } from './icons';
import './music.css';

type WidgetMode = 'footer' | 'page';

interface NowPlayingWidgetProps {
  mode?: WidgetMode;
  introSeed?: number;
}

interface WidgetContextLine {
  emoji: string;
  copy: string;
}

const SPOTIFY_PROFILE =
  'https://open.spotify.com/user/31yuvamoxkbmkpvhpunh6xwoshii';

const PLAYING_INTROS: WidgetContextLine[] = [
  { emoji: '💫', copy: 'vibing to' },
  { emoji: '🎵', copy: 'listening to' },
  { emoji: '😇', copy: 'tripping on' },
  { emoji: '🥰', copy: 'mushing over' },
  { emoji: '🙈', copy: 'gushing over' },
  { emoji: '🗣', copy: 'lip syncing to' },
  { emoji: '👻', copy: 'quietly murmuring' },
];

const NOT_PLAYING_INTROS: WidgetContextLine[] = [
  { emoji: '🤷🏻‍♀️', copy: "maybe i'm bored of my playlist" },
  { emoji: '💤', copy: "there's a high chance i'm sleeping" },
  { emoji: '🎧', copy: 'probably my headphones died' },
  { emoji: '📺', copy: 'chilling on netflix, maybe?' },
  { emoji: '🥂', copy: "maybe today's the day to socialize" },
  { emoji: '📸', copy: "probably i'm out with my camera" },
  { emoji: '🤝🏻', copy: 'maybe i had to stop music to attend a meeting' },
];

function itemFromSeed<T>(items: T[], seed: number) {
  const index = Math.floor(seed * items.length) % items.length;
  return items[index] ?? items[0]!;
}

function getSpotifyHref(track: SpotifyTrack | null) {
  return track?.external_urls?.spotify ?? SPOTIFY_PROFILE;
}

function getWidgetSubtitle(track: SpotifyTrack | null, mode: WidgetMode) {
  if (mode === 'page') {
    return track?.album?.name ?? 'View Spotify Profile';
  }

  return 'Explore Music Page';
}

export default function NowPlayingWidget({
  mode = 'footer',
  introSeed = 0,
}: NowPlayingWidgetProps) {
  const { data: track, error, refetch } = useNowPlayingTrack();
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

  const introLine = useMemo<WidgetContextLine>(
    () =>
      isListening
        ? itemFromSeed(PLAYING_INTROS, introSeed)
        : itemFromSeed(NOT_PLAYING_INTROS, introSeed),
    [isListening, introSeed],
  );

  const infoHref = mode === 'page' ? spotifyHref : '/music';

  return (
    <div
      className="music-now-playing"
      data-mode={mode}
      data-listening={isListening ? 'true' : 'false'}
    >
      <div className="music-now-playing-intro">
        <span
          className="music-now-playing-intro-emoji"
          role="img"
          aria-label="music context"
        >
          {introLine.emoji}
        </span>
        <span className="music-now-playing-intro-copy">{introLine.copy}</span>
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
