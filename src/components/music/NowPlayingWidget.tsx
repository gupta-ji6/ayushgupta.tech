import { useMemo } from 'react';

import { useNowPlayingTrack } from '@hooks/useSpotify';
import type { SpotifyTrack } from '@utils/spotify';

import { MusicNoteIcon, SpotifyIcon } from './icons';
import './music.css';
import {
  getSpotifyHref,
  itemFromSeed,
  PLAYING_INTROS,
  type WidgetContextLine,
} from './nowPlaying';

type WidgetMode = 'footer' | 'page';

interface NowPlayingWidgetProps {
  mode?: WidgetMode;
  introSeed?: number;
}

const NOT_PLAYING_INTROS: WidgetContextLine[] = [
  { emoji: '🤷🏻‍♀️', copy: "maybe i'm bored of my playlist" },
  { emoji: '💤', copy: "there's a high chance i'm sleeping" },
  { emoji: '🎧', copy: 'probably my headphones died' },
  { emoji: '📺', copy: 'chilling on netflix, maybe?' },
  { emoji: '🥂', copy: "maybe today's the day to socialize" },
  { emoji: '📸', copy: "probably i'm out with my camera" },
  { emoji: '🤝🏻', copy: 'maybe i had to stop music to attend a meeting' },
];

function getWidgetSubtitle(track: SpotifyTrack | null, mode: WidgetMode) {
  if (mode === 'page') {
    return track?.albumName ?? 'View Spotify Profile';
  }

  return 'Explore Music Page';
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
  const albumArt = track?.image ?? null;
  const title = isUnavailable
    ? 'Now playing is unavailable right now.'
    : (track?.name ?? 'Not Playing');
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
      </div>
    </div>
  );
}
