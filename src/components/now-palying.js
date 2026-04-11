import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';

import { theme, mixins } from '@styles';
import sr from '@utils/sr';
import { srConfig } from '@config';
import { IconSpotify, IconPlay, IconPause, IconMusic } from '@components/icons';
import { usePrefersReducedMotion, useNowPlayingTrack } from '@hooks';
import ExternalLink from './externalLink';

// ========================= CONSTANTS ===========================

const { colors } = theme;

const SPOTIFY_PROFILE = 'https://open.spotify.com/user/31yuvamoxkbmkpvhpunh6xwoshii';

export const NowPlayingContext = {
  playing: [
    {
      emoji: '💫',
      copy: 'Vibing to',
    },
    {
      emoji: '🎵',
      copy: 'Listening to',
    },
    {
      emoji: '😇',
      copy: 'Tripping on',
    },
    {
      emoji: '🥰',
      copy: 'Mushing over',
    },
    {
      emoji: '🙈',
      copy: 'Gushing over',
    },
    {
      emoji: '🗣',
      copy: 'Lip syncing to',
    },
    {
      emoji: '👻',
      copy: 'Quietly murmuring',
    },
  ],
  notPlaying: [
    {
      emoji: '🤷🏻‍♀️',
      copy: `maybe I'm bored of my playlist`,
    },
    {
      emoji: '💤',
      copy: `there's a high chance I'm sleeping`,
    },
    {
      emoji: '🎧',
      copy: 'probably my headphones died',
    },
    {
      emoji: '📺',
      copy: 'chilling on Netflix, maybe?',
    },
    {
      emoji: '🥂',
      copy: `maybe today's the day to socialize`,
    },
    {
      emoji: '📸',
      copy: `probably I'm out with my camera`,
    },
    {
      emoji: '🤝🏻',
      copy: `maybe I had to stop music to attend a meeting`,
    },
  ],
};

// ========================= UTILITY FUNCTIONS ===========================

const randomArrayIndex = arr => Math.floor(Math.random() * arr.length);

// ========================= STYLED COMPONENTS ===========================

const TrackContext = styled.div`
  font-size: smaller;
  margin-bottom: 10px;
  text-transform: lowercase;

  span {
    font-size: small;
  }
`;

const NowPlayingWidget = styled.div`
  border: 1px solid ${colors.green};
  border-radius: 3px;
  padding: 9px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease-in-out;
  box-shadow: ${mixins.boxShadow};

  &:hover {
    @media (prefers-reduced-motion: no-preference) {
      transform: scale3d(0.95, 0.95, 0.95);
    }
  }
`;

const AlbumImage = styled.img`
  width: 3rem;
  height: 3rem;
  background-color: ${colors.lightNavy};
  border-radius: 3px;
  object-fit: cover;
`;

const AlbumArtFallback = styled.div`
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.slate};

  /* GlobalStyle sets svg { width/height: 100% } — size ~80% of Spotify column (2.5rem) */
  svg {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    max-width: 2rem;
    max-height: 2rem;
  }
`;

const TrackInfo = styled.div`
  min-width: 200px;
  max-width: 270px;
  padding: 0 9px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const TrackName = styled.div`
  color: ${colors.lightestSlate};
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover {
    color: ${colors.green};
  }
`;

const AlbumName = styled.div`
  color: ${colors.slate};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SpotifyIcon = styled.div`
  width: ${props => (props.playing ? '3rem' : '2.5rem')};
  height: ${props => (props.playing ? '3rem' : '2.5rem')};
  display: flex;
  justify-content: flex-end;
  background-color: ${colors.navy};

  button {
    background-color: ${colors.navy};
    margin: 0;
    border: 0;
    outline: 0;
  }
`;

// ========================= COMPONENT ===========================

const NowPlaying = ({ isMusicPage = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { nowPlayingTrack, nowPlayingAudio, isAyushListeningToAnything } = useNowPlayingTrack();

  useEffect(() => {
    if (!prefersReducedMotion) {
      sr.reveal(revealContainer.current, srConfig());
    }
  }, []);

  useEffect(() => {
    if (nowPlayingAudio !== null) {
      isPlaying ? nowPlayingAudio.play() : nowPlayingAudio.pause();
    }
  }, [isPlaying]);

  const toggleAudio = () => setIsPlaying(!isPlaying);

  useEffect(() => {
    if (nowPlayingAudio !== null) {
      nowPlayingAudio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        nowPlayingAudio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [isPlaying, toggleAudio]);

  // Random intro line once per listening state; avoids Math.random() on every render while the
  // Spotify hook re-renders (loading, track updates, etc.).
  const nowPlayingIntro = useMemo(() => {
    if (isAyushListeningToAnything) {
      const index = randomArrayIndex(NowPlayingContext.playing);
      return (
        <Fragment>
          <div>
            <span role="img" aria-label="music-emoji">
              {NowPlayingContext.playing[index].emoji}
            </span>
          </div>
          <div>{NowPlayingContext.playing[index].copy}</div>
        </Fragment>
      );
    }
    const index = randomArrayIndex(NowPlayingContext.notPlaying);
    return (
      <Fragment>
        <div>
          <span role="img" aria-label="music-emoji">
            {NowPlayingContext.notPlaying[index]?.emoji}
          </span>
        </div>
        <div>{NowPlayingContext.notPlaying[index]?.copy}</div>
      </Fragment>
    );
  }, [isAyushListeningToAnything]);

  const albumArtUrl = nowPlayingTrack?.album?.images?.[0]?.url;

  const renderTrackImageAndName = () => {
    if (isMusicPage) {
      return (
        <React.Fragment>
          <ExternalLink
            url={nowPlayingTrack?.external_urls?.spotify || SPOTIFY_PROFILE}
            eventName="Spotify"
            eventType={
              nowPlayingTrack?.name ? `Widget - ${nowPlayingTrack.name}` : 'Open Spotify Profile'
            }
            aria-label={
              nowPlayingTrack?.name
                ? `Open ${nowPlayingTrack.name} on Spotify`
                : 'Open Spotify profile'
            }>
            {albumArtUrl ? (
              <AlbumImage
                src={albumArtUrl}
                width="48"
                height="48"
                loading="lazy"
                alt=""
              />
            ) : (
              <AlbumArtFallback aria-hidden="true">
                <IconMusic fill="currentColor" />
              </AlbumArtFallback>
            )}
          </ExternalLink>
          <ExternalLink
            url={nowPlayingTrack?.external_urls?.spotify || SPOTIFY_PROFILE}
            eventName="Spotify"
            eventType={
              nowPlayingTrack?.name ? `Widget - ${nowPlayingTrack.name}` : 'Open Spotify Profile'
            }>
            <TrackInfo>
              <TrackName>{nowPlayingTrack?.name || 'Not Playing'}</TrackName>
              <AlbumName>{nowPlayingTrack?.album?.name || 'View Spotify Profile'}</AlbumName>
            </TrackInfo>
          </ExternalLink>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <Link to="/music" aria-label="music page">
            {albumArtUrl ? (
              <AlbumImage
                src={albumArtUrl}
                width="48"
                height="48"
                loading="lazy"
                alt=""
              />
            ) : (
              <AlbumArtFallback aria-hidden="true">
                <IconMusic fill="currentColor" />
              </AlbumArtFallback>
            )}
          </Link>
          <Link to="/music" aria-label="music page">
            <TrackInfo>
              <TrackName>{nowPlayingTrack?.name || 'Not Playing'}</TrackName>
              <AlbumName>Explore Music Page</AlbumName>
            </TrackInfo>
          </Link>
        </React.Fragment>
      );
    }
  };

  return (
    <div>
      <TrackContext>{nowPlayingIntro}</TrackContext>
      <NowPlayingWidget>
        {renderTrackImageAndName()}
        <SpotifyIcon playing={isAyushListeningToAnything}>
          <button
            onClick={toggleAudio}
            disabled={!isAyushListeningToAnything}
            data-splitbee-event="Spotify"
            data-splitbee-event-type={`Play Song Preview - ${nowPlayingTrack.name}`}>
            {isAyushListeningToAnything && nowPlayingTrack?.preview_url !== null ? (
              isPlaying ? (
                <IconPause />
              ) : (
                <IconPlay />
              )
            ) : (
              <IconSpotify />
            )}
          </button>
        </SpotifyIcon>
      </NowPlayingWidget>
    </div>
  );
};

export default NowPlaying;
