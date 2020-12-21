import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@styles';
import sr from '@utils/sr';
import { srConfig } from '@config';
import { IconSpotify } from '@components/icons';

const { colors } = theme;

const basic = Buffer.from(
  `${process.env.GATSBY_SPOTIFY_CLIENT_ID}:${process.env.GATSBY_SPOTIFY_CLIENT_SECRET}`,
).toString('base64');

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const SPOTIFY_PROFILE = 'https://open.spotify.com/user/31yuvamoxkbmkpvhpunh6xwoshii';

const TrackContainer = styled.div`
  border: 1px solid ${colors.green};
  border-radius: 3px;
  padding: 9px;
  margin: 0 16px 16px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AlbumImage = styled.img`
  width: 3rem;
  height: 3rem;
  background-color: ${colors.lightNavy};
  border-radius: 3px;
  object-fit: cover;
`;

const TrackInfo = styled.div`
  width: 270px;
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
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: flex-end;
`;

const NowPlaying = () => {
  const [track, setTrack] = useState({});
  const revealContainer = useRef(null);

  const getAccessToken = async () => {
    const urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', 'refresh_token');
    urlencoded.append('refresh_token', process.env.GATSBY_SPOTIFY_REFRESH_TOKEN);

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlencoded,
    });

    return response.json();
  };

  const fetchCurrentTrack = async () => {
    const { access_token } = await getAccessToken();

    try {
      const response = await fetch(NOW_PLAYING_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const jsonResponse = await response.json();
        setTrack(jsonResponse);
      }
    } catch (err) {
      console.error(err);
      console.error(err.response);
    }
  };

  useEffect(() => {
    sr.reveal(revealContainer.current, srConfig());
    fetchCurrentTrack();
  }, []);

  return (
    <TrackContainer>
      <a
        href={track?.item?.external_urls?.spotify || SPOTIFY_PROFILE}
        target="_blank"
        rel="nofollow noopener noreferrer">
        <AlbumImage
          src={track?.item?.album?.images[0].url || 'https://source.unsplash.com/128x128/?music'}
          loading="lazy"
        />
      </a>
      <a
        href={track?.item?.external_urls?.spotify || SPOTIFY_PROFILE}
        target="_blank"
        rel="nofollow noopener noreferrer">
        <TrackInfo>
          <TrackName>{track?.item?.name || 'Not Playing'}</TrackName>
          <AlbumName>{track?.item?.album?.name || 'Spotify'}</AlbumName>
        </TrackInfo>
      </a>
      <SpotifyIcon>
        <IconSpotify />
      </SpotifyIcon>
    </TrackContainer>
  );
};

export default NowPlaying;
