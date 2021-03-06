import React, { Fragment, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme, mixins } from '@styles';
import sr from '@utils/sr';
import { srConfig } from '@config';
import { IconSpotify, IconPlay, IconPause } from '@components/icons';
import { fetchCurrentTrack } from '../utils/spotify';
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
  margin: 0 16px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease-in-out;
  box-shadow: ${mixins.boxShadow};

  &:hover {
    transform: scale3d(0.95, 0.95, 0.95);
  }
`;

const AlbumImage = styled.img`
  width: 3rem;
  height: 3rem;
  background-color: ${colors.lightNavy};
  border-radius: 3px;
  object-fit: cover;
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

const NowPlaying = () => {
  const [track, setTrack] = useState({});
  const [isAyushListeningToAnything, setIsAyushListeningToAnything] = useState(false);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const revealContainer = useRef(null);

  const toggleAudio = () => setIsPlaying(!isPlaying);

  // fetch the current playing track, if any
  const fetchNowPlaying = async () => {
    const trackData = await fetchCurrentTrack();
    if (trackData !== undefined) {
      setTrack(trackData);
      if (trackData?.preview_url !== null) {
        setAudio(new Audio(trackData?.preview_url));
      }
      setIsAyushListeningToAnything(true);
    }
  };

  useEffect(() => {
    sr.reveal(revealContainer.current, srConfig());
    fetchNowPlaying();
  }, []);

  useEffect(() => {
    if (audio !== null) {
      isPlaying ? audio.play() : audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audio !== null) {
      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [isPlaying, toggleAudio]);

  // function which returns a custom copy to show above now playing widget
  const fetchNowPlayingCopy = () => {
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
    } else {
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
    }
  };

  return (
    <div>
      <TrackContext>{fetchNowPlayingCopy()}</TrackContext>
      <NowPlayingWidget>
        <ExternalLink
          url={track?.external_urls?.spotify || SPOTIFY_PROFILE}
          eventName="Spotify"
          eventType="Open Spotify Link">
          <AlbumImage
            src={track?.album?.images[0].url || 'https://source.unsplash.com/128x128/?music'}
            width="48"
            height="48"
            loading="lazy"
            alt="music"
          />
        </ExternalLink>
        <ExternalLink
          url={track?.external_urls?.spotify || SPOTIFY_PROFILE}
          eventName="Spotify"
          eventType="Open Spotify Link">
          <TrackInfo>
            <TrackName>{track?.name || 'Not Playing'}</TrackName>
            <AlbumName>{track?.album?.name || 'View Spotify Profile'}</AlbumName>
          </TrackInfo>
        </ExternalLink>
        <SpotifyIcon playing={isAyushListeningToAnything}>
          <button
            onClick={toggleAudio}
            disabled={!isAyushListeningToAnything}
            data-splitbee-event="Spotify"
            data-splitbee-event-type="Play Spotify Song Preview">
            {isAyushListeningToAnything && track?.preview_url !== null ? (
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
