import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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

export const PLAYING_INTROS: WidgetContextLine[] = [
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

export function itemFromSeed<T>(items: T[], seed: number) {
  const index = Math.floor(seed * items.length) % items.length;
  return items[index] ?? items[0]!;
}

export function getSpotifyHref(track: SpotifyTrack | null) {
  return track?.external_urls?.spotify ?? SPOTIFY_PROFILE;
}

function getWidgetSubtitle(track: SpotifyTrack | null, mode: WidgetMode) {
  if (mode === 'page') {
    return track?.album?.name ?? 'View Spotify Profile';
  }

  return 'Explore Music Page';
}

function getWidgetTitle(
  track: SpotifyTrack | null,
  isUnavailable: boolean,
): string {
  if (isUnavailable) {
    return 'Now playing is unavailable right now.';
  }

  return track?.name ?? 'Not Playing';
}

interface TrackArtworkProps {
  albumArt: ReturnType<typeof pickSpotifyCoverImage>;
}

function TrackArtwork({ albumArt }: TrackArtworkProps) {
  if (albumArt) {
    return (
      <img
        src={albumArt.url}
        width={albumArt.width ?? 48}
        height={albumArt.height ?? 48}
        loading="lazy"
        alt=""
      />
    );
  }

  return (
    <span className="music-now-playing-fallback" aria-hidden="true">
      <MusicNoteIcon />
    </span>
  );
}

interface NowPlayingActionProps {
  isListening: boolean;
  isPreviewPlaying: boolean;
  onTogglePreview: () => void;
  previewUrl: string | null;
  spotifyHref: string;
  trackName?: string;
}

function NowPlayingAction({
  isListening,
  isPreviewPlaying,
  onTogglePreview,
  previewUrl,
  spotifyHref,
  trackName,
}: NowPlayingActionProps) {
  if (previewUrl) {
    return (
      <button
        type="button"
        className="music-now-playing-action"
        aria-label={
          isPreviewPlaying ? 'Pause track preview' : 'Play track preview'
        }
        aria-pressed={isPreviewPlaying}
        onClick={onTogglePreview}
      >
        {isPreviewPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
    );
  }

  return (
    <a
      href={spotifyHref}
      className="music-now-playing-action music-now-playing-action-link"
      target="_blank"
      rel="noreferrer noopener"
      aria-label={
        isListening
          ? `Open ${trackName} on Spotify`
          : 'Open Spotify profile'
      }
    >
      <SpotifyIcon />
    </a>
  );
}

function useTrackPreview(previewUrl: string | null) {
  const [playingPreviewUrl, setPlayingPreviewUrl] = useState<string | null>(
    null,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPreviewPlaying =
    previewUrl !== null && playingPreviewUrl === previewUrl;

  useEffect(() => {
    const previousAudio = audioRef.current;

    if (previousAudio) {
      previousAudio.pause();
    }

    if (!previewUrl) {
      audioRef.current = null;
      return;
    }

    const audio = new Audio(previewUrl);
    // Don't download the 30s preview MP3 until the user actually plays it.
    audio.preload = 'none';
    const handleEnded = () => setPlayingPreviewUrl(null);
    audio.addEventListener('ended', handleEnded);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
    };
  }, [previewUrl]);

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

    audio.play().catch(() => setPlayingPreviewUrl(null));
  }, [isPreviewPlaying]);

  const togglePreview = useCallback(() => {
    if (!previewUrl) {
      return;
    }

    setPlayingPreviewUrl((value) =>
      value === previewUrl ? null : previewUrl,
    );
  }, [previewUrl]);

  return { isPreviewPlaying, togglePreview };
}

export default function NowPlayingWidget({
  mode = 'footer',
  introSeed = 0,
}: NowPlayingWidgetProps) {
  const query = useNowPlayingTrack();

  const track = query.kind === 'success' ? query.data : null;
  const isUnavailable = query.kind === 'unavailable';
  const isListening = Boolean(track?.name);
  const spotifyHref = getSpotifyHref(track);
  const albumArt = pickSpotifyCoverImage(track?.album?.images);
  const previewUrl = track?.preview_url ?? null;
  const { isPreviewPlaying, togglePreview } = useTrackPreview(previewUrl);
  const title = getWidgetTitle(track, isUnavailable);
  const subtitle = getWidgetSubtitle(track, mode);

  const introLine = useMemo<WidgetContextLine>(
    () =>
      isUnavailable
        ? { emoji: '🎧', copy: 'music is temporarily unavailable' }
        : isListening
          ? itemFromSeed(PLAYING_INTROS, introSeed)
          : itemFromSeed(NOT_PLAYING_INTROS, introSeed),
    [isListening, introSeed, isUnavailable],
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
            <TrackArtwork albumArt={albumArt} />
          </span>

          <span className="music-now-playing-copy">
            <span className="music-now-playing-title">{title}</span>
            <span className="music-now-playing-subtitle">{subtitle}</span>
          </span>
        </a>

        <NowPlayingAction
          isListening={isListening}
          isPreviewPlaying={isPreviewPlaying}
          onTogglePreview={togglePreview}
          previewUrl={previewUrl}
          spotifyHref={spotifyHref}
          trackName={track?.name}
        />
      </div>
    </div>
  );
}
