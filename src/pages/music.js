import React, { useEffect, Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { useComments } from 'use-comments';

import { Layout, ExternalLink, NowPlaying, DetailsAndSummary } from '@components';
import {
  useRecentlyPlayedTracks,
  useAyushFavouritePlaylist,
  usePrefersReducedMotion,
  useTopTracks,
  useSavedTracks,
  useUserPlaylists,
} from '@hooks';
import { theme, mixins, media } from '@styles';
import { siteUrl, srConfig, hasuraURL } from '@config';
import sr from '@utils/sr';
import ogImage from '@images/og-music.png';
import { IconCheck } from '@components/icons';

// =================================== CONSTANTS ==========================================

const { colors, fonts, fontSizes } = theme;

const metaConfig = {
  title: 'Music - Ayush Gupta',
  description: `Deep dive into my Ayush Gupta's music library. Explore anything from my current playing song or my top tracks this month.`,
  url: 'https://ayushgupta.tech/music',
};

const mapRangeToTime = range => {
  switch (range) {
    case 'short':
      return 'Last Month';
    case 'medium':
      return 'Last 6 Months';
    case 'long':
      return 'All Time';
    default:
      return 'Last Month';
  }
};

// =================================== STYLED COMPONENTS ==========================================

const StyledMainContainer = styled.main`
  padding: 200px 200px;
  ${media.desktop`padding: 200px 100px;`};
  ${media.tablet`padding: 150px 50px;`};
  ${media.phone`padding: 125px 25px;`};
  margin: 0px auto;
  width: 100%;
  max-width: 1600px;
  min-height: 100vh;

  & > header {
    margin-bottom: 75px;
    text-align: center;
  }
`;

const SimilarTasteSection = styled.section`
  ${mixins.flexCenter};
  flex-direction: column;
  padding-top: 60px;
  text-align: center;

  a {
    ${mixins.inlineLink};
  }
`;

const NowPlayingWidgetContainer = styled.div`
  ${mixins.flexCenter};
  flex-direction: column;
  padding: 5px;
  background-color: ${colors.navy};
  color: ${colors.slate};
  text-align: center;
  height: auto;
  min-height: 70px;
  margin-bottom: 40px;
`;

const RangeToggleButtonContainer = styled.div`
  padding: 10px 0;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  flex-direction: row;
  ${media.thone`flex-direction: column; align-items: flex-start`};
`;

const ToggleButton = styled.button`
  ${mixins.bigButton};
  ${media.thone`${mixins.smallButton};`};
  margin-right: 10px;
  margin-top: 10px;

  svg {
    width: 12px;
    height: 12px;
    margin-right: 6px;
    flex-grow: 0;
  }
`;

const StyledRefetchBtn = styled.button`
  ${mixins.bigButton};
  margin-top: 10px;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  margin: 10px;

  &:hover {
    img {
      @media (prefers-reduced-motion: no-preference) {
        border: 2px solid ${colors.green};
        border-radius: 50%;
        animation: rotation 6s infinite linear;
      }
    }
  }
`;

const StyledAlbumCover = styled.img`
  width: 8rem;
  height: 8rem;
  background-color: ${colors.navy};
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius};
  z-index: 1;
  object-fit: cover;

  @media (prefers-reduced-motion: no-preference) {
    transition: ${theme.transition};
  }

  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }
`;

const TrackInfoContainer = styled.div`
  border-radius: ${theme.borderRadius};
  background-color: ${colors.darkNavy};
  width: 100%;
  padding: 16px;
  margin-left: -36px;
  padding-left: 46px;

  a {
    ${mixins.inlineLink};
  }
`;

const Artists = styled.div`
  color: ${colors.slate};
  margin-left: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-transform: capitalize;
`;

const FetchLoader = styled.div`
  margin: 10px 10px 0;
`;

const RefetchContainer = styled.div`
  margin: 10px 10px 0;
`;

const StyledFieldset = styled.fieldset`
  ${mixins.boxShadow};
  margin-top: 5vh;
  background-color: ${colors.darkNavy};
  border: none;
  border-radius: ${theme.borderRadius};
  padding: 5vh;

  legend {
    background-color: ${colors.lightNavy};
    border-radius: ${theme.borderRadius};
    padding: 10px;
    color: ${colors.green};
    font-family: ${fonts.SFMono};
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  label {
    vertical-align: middle;
    margin-bottom: 10px;
    padding-right: 10px;
    font-size: ${fontSizes.xxlarge};
    flex-shrink: 0;
    flex: 0.3;
  }

  input {
    flex: 0.7;
    padding: 10px;
    margin-bottom: 10px;
    background-color: ${colors.lightNavy};
    border-radius: ${theme.borderRadius};
    border: 1px solid ${colors.transGreen};
    color: ${colors.white};
    font-size: ${fontSizes.large};
    width: 50vw;
    max-width: 500px;

    &:focus {
      border: 1px solid ${colors.green};
    }

    &::placeholder {
      color: ${colors.slate};
    }
  }

  button[type='submit'] {
    ${mixins.bigButton};
    margin-top: 5vh;
  }
`;

const SongCount = styled.div`
  margin-top: -3vh;
  margin-bottom: 5vh;
`;

// ======================================= COMPONENT ================================

const MusicPage = ({ location }) => {
  const revealTitle = useRef(null);
  const revealMusicContent = useRef(null);

  const [topTracksRange, setTopTracksRange] = useState('short_term');
  const [topArtistsRange, setTopArtistsRange] = useState('short_term');

  const { topTracks, topTracksLoading, topTracksError, refetchTopTracks } = useTopTracks(
    'tracks',
    topTracksRange,
    10,
  );

  const {
    ayushFavouritePlaylist,
    ayushFavouritePlaylistError,
    ayushFavouritePlaylistLoading,
    refetchAyushFavouritePlaylist,
  } = useAyushFavouritePlaylist();

  const {
    topTracks: topArtists,
    topTracksLoading: topArtistsLoading,
    topTracksError: topArtistsError,
    refetchTopTracks: refetchTopArtists,
  } = useTopTracks('artists', topArtistsRange, 10);

  const { recentlyPlayedTracks, recentTracksLoading, recentTracksError, refetchRecentTracks } =
    useRecentlyPlayedTracks(10);

  const { recentlySavedTracks, savedTracksLoading, savedTracksError, refetchSavedTracks } =
    useSavedTracks(10);

  const { userPlaylists, userPlaylistsError, userPlaylistsLoading, refetchUserPlaylists } =
    useUserPlaylists(10);

  const { addComment, count } = useComments(hasuraURL, '/music/');
  const [songRecommendationData, setSongRecommendationData] = useState({
    authorName: '',
    comment: '',
  });

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealMusicContent.current, srConfig(200, 0));
  }, []);

  const renderTopTracks = () => {
    if (topTracksLoading) {
      return <FetchLoader>Loading Ayush's top tracks...</FetchLoader>;
    } else if (topTracksError !== null) {
      return (
        <RefetchContainer>
          <div>{topTracksError}</div>
          <StyledRefetchBtn
            type="button"
            data-splitbee-event="Re-fetch Top Tracks"
            onClick={() => refetchTopTracks()}>
            Re-fetch Tracks
          </StyledRefetchBtn>
        </RefetchContainer>
      );
    } else if (topTracks !== undefined) {
      // console.log(topTracks);
      return (
        <Fragment>
          {topTracks.map(track => {
            const { album, artists, external_urls, name, id } = track;
            const trackArtists = artists.map(artist => artist.name);
            return (
              <TrackItem key={id}>
                <StyledAlbumCover
                  src={album.images[1].url}
                  height={album.images[1].height}
                  width={album.images[1].width}
                  alt={`${album.name}'s album cover`}
                  loading="lazy"
                />
                <TrackInfoContainer>
                  <ExternalLink url={external_urls.spotify} eventName="Spotify">
                    {name}
                  </ExternalLink>
                  <Artists>{trackArtists.join(', ')}</Artists>
                </TrackInfoContainer>
              </TrackItem>
            );
          })}
        </Fragment>
      );
    }
  };

  const renderAyushFavouritePlaylist = () => {
    if (ayushFavouritePlaylistLoading) {
      return <FetchLoader>Loading recently saved tracks...</FetchLoader>;
    } else if (ayushFavouritePlaylistError !== null) {
      return (
        <RefetchContainer>
          <div>{ayushFavouritePlaylistError}</div>
          <StyledRefetchBtn
            type="button"
            data-splitbee-event="Re-fetch Playlist"
            onClick={() => refetchAyushFavouritePlaylist()}>
            Re-fetch Tracks
          </StyledRefetchBtn>
        </RefetchContainer>
      );
    } else if (Object.keys(ayushFavouritePlaylist).length > 0) {
      // console.log(ayushFavouritePlaylist);
      const { name, images, id, owner, tracks, external_urls } = ayushFavouritePlaylist;
      return (
        <TrackItem key={id}>
          <StyledAlbumCover
            src={images?.[0]?.url}
            height={images?.[0]?.height}
            width={images?.[0]?.width}
            alt={`${name}'s playlist cover`}
            loading="lazy"
          />
          <TrackInfoContainer>
            <div>
              <ExternalLink url={external_urls?.spotify} eventName="Spotify">
                {name}
              </ExternalLink>
              <span> by {owner?.display_name}</span>
            </div>
            <Artists>{tracks?.total} tracks</Artists>
          </TrackInfoContainer>
        </TrackItem>
      );
    }
  };

  const renderTopArtists = () => {
    if (topArtistsLoading) {
      return <FetchLoader>Loading Ayush's top artists...</FetchLoader>;
    } else if (topArtistsError !== null) {
      return (
        <RefetchContainer>
          <div>{topArtistsError}</div>
          <StyledRefetchBtn
            type="button"
            data-splitbee-event="Re-fetch Top Artists"
            onClick={() => refetchTopArtists()}>
            Re-fetch Artists
          </StyledRefetchBtn>
        </RefetchContainer>
      );
    } else if (topArtists !== undefined) {
      // console.log(topArtists);
      return (
        <Fragment>
          {topArtists.map(artist => {
            const { external_urls, name, id, images, genres } = artist;
            return (
              <TrackItem key={id}>
                <StyledAlbumCover
                  src={images[1].url}
                  height={images[1].height}
                  width={images[1].width}
                  alt={`${name}'s picture`}
                  loading="lazy"
                />
                <TrackInfoContainer>
                  <ExternalLink url={external_urls.spotify} eventName="Spotify">
                    {name}
                  </ExternalLink>
                  <Artists>{genres.join(', ')}</Artists>
                </TrackInfoContainer>
              </TrackItem>
            );
          })}
        </Fragment>
      );
    }
  };

  const renderRecentlyPlayedTracks = () => {
    if (recentTracksLoading) {
      return <FetchLoader>Loading recently played tracks...</FetchLoader>;
    } else if (recentTracksError !== null) {
      return (
        <RefetchContainer>
          <div>{recentTracksError}</div>
          <StyledRefetchBtn
            type="button"
            data-splitbee-event="Re-fetch Recently Played"
            onClick={() => refetchRecentTracks()}>
            Re-fetch Tracks
          </StyledRefetchBtn>
        </RefetchContainer>
      );
    } else if (recentlyPlayedTracks !== undefined) {
      // console.log(recentlyPlayedTracks);
      return (
        <Fragment>
          {recentlyPlayedTracks.map(trackData => {
            const { track } = trackData;
            const { album, artists, external_urls, name, id } = track;
            const trackArtists = artists.map(artist => artist.name);
            return (
              <TrackItem key={id}>
                <StyledAlbumCover
                  src={album.images[1].url}
                  height={album.images[1].height}
                  width={album.images[1].width}
                  alt={`${album.name}'s album cover`}
                  loading="lazy"
                />
                <TrackInfoContainer>
                  <ExternalLink url={external_urls.spotify} eventName="Spotify">
                    {name}
                  </ExternalLink>
                  <Artists>{trackArtists.join(', ')}</Artists>
                </TrackInfoContainer>
              </TrackItem>
            );
          })}
        </Fragment>
      );
    }
  };

  const renderRecentlySavedTracks = () => {
    if (savedTracksLoading) {
      return <FetchLoader>Loading recently saved tracks...</FetchLoader>;
    } else if (savedTracksError !== null) {
      return (
        <RefetchContainer>
          <div>{savedTracksError}</div>
          <StyledRefetchBtn
            type="button"
            data-splitbee-event="Re-fetch Saved Tracks"
            onClick={() => refetchSavedTracks()}>
            Re-fetch Tracks
          </StyledRefetchBtn>
        </RefetchContainer>
      );
    } else if (recentlySavedTracks !== undefined) {
      // console.log(recentlySavedTracks);
      return (
        <Fragment>
          {recentlySavedTracks.map(trackData => {
            const { track } = trackData;
            const { album, artists, external_urls, name, id } = track;
            const trackArtists = artists.map(artist => artist.name);
            return (
              <TrackItem key={id}>
                <StyledAlbumCover
                  src={album.images[1].url}
                  height={album.images[1].height}
                  width={album.images[1].width}
                  alt={`${album.name}'s album cover`}
                  loading="lazy"
                />
                <TrackInfoContainer>
                  <ExternalLink url={external_urls.spotify} eventName="Spotify">
                    {name}
                  </ExternalLink>
                  <Artists>{trackArtists.join(', ')}</Artists>
                </TrackInfoContainer>
              </TrackItem>
            );
          })}
        </Fragment>
      );
    }
  };

  const renderUserPlaylists = () => {
    if (userPlaylistsLoading) {
      return <FetchLoader>Loading recently saved tracks...</FetchLoader>;
    } else if (userPlaylistsError !== null) {
      return (
        <RefetchContainer>
          <div>{userPlaylistsError}</div>
          <StyledRefetchBtn
            type="button"
            data-splitbee-event="Re-fetch Playlists"
            onClick={() => refetchUserPlaylists()}>
            Re-fetch Tracks
          </StyledRefetchBtn>
        </RefetchContainer>
      );
    } else if (userPlaylists !== undefined) {
      // console.log(userPlaylists);
      return (
        <Fragment>
          {userPlaylists.map(playlistData => {
            const {
              name,
              images,
              id,
              owner: { display_name },
              tracks: { total },
              external_urls,
            } = playlistData;
            return (
              <TrackItem key={id}>
                <StyledAlbumCover
                  src={images[0].url}
                  height={images[0].height}
                  width={images[0].width}
                  alt={`${name}'s playlist cover`}
                  loading="lazy"
                />
                <TrackInfoContainer>
                  <div>
                    <ExternalLink url={external_urls.spotify} eventName="Spotify">
                      {name}
                    </ExternalLink>
                    <span> by {display_name}</span>
                  </div>
                  <Artists>{total} tracks</Artists>
                </TrackInfoContainer>
              </TrackItem>
            );
          })}
        </Fragment>
      );
    }
  };

  /**
   *
   *
   * @param {*} {range = 'short', type = 'tracks'}
   * @return {*}
   */
  const RangeToggleButton = ({ range = 'short', type = 'tracks' }) => {
    if (type === 'tracks') {
      return (
        <ToggleButton onClick={() => setTopTracksRange(`${range}_term`)}>
          {`${range}_term` === topTracksRange ? <IconCheck /> : null}
          <span>{mapRangeToTime(range)}</span>
        </ToggleButton>
      );
    } else if (type === 'artists') {
      return (
        <ToggleButton onClick={() => setTopArtistsRange(`${range}_term`)}>
          {`${range}_term` === topArtistsRange ? <IconCheck /> : null}
          <span>{mapRangeToTime(range)}</span>
        </ToggleButton>
      );
    }
  };

  const onSongSubmit = event => {
    event.preventDefault();
    event.persist();
    addComment({
      content: songRecommendationData.comment,
      author: songRecommendationData.authorName,
    });
    toast.success('People who recommend songs are invaluable. You are my precious!', {
      duration: 5000,
    });
    setSongRecommendationData({
      authorName: '',
      comment: '',
    });
  };

  /* handle change in Name input */
  const onNameChange = event => {
    event.preventDefault();
    event.persist();
    setSongRecommendationData(oldCommentData => ({
      ...oldCommentData,
      authorName: event.target.value,
    }));
  };

  /* handle change in song input */
  const onCommentChange = event => {
    event.preventDefault();
    event.persist();
    setSongRecommendationData(oldCommentData => ({
      ...oldCommentData,
      comment: event.target.value,
    }));
  };

  const renderSongReceommendationForm = () => (
    <form onSubmit={onSongSubmit}>
      <StyledFieldset>
        <legend>recommend a song to ayush</legend>
        <SongCount>{count} people have suggested songs which ayush liked!</SongCount>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Your name or handle"
            onChange={onNameChange}
            value={songRecommendationData.authorName}
            required
          />
        </div>
        <div>
          <label htmlFor="song">Song</label>
          <input
            id="song"
            type="text"
            placeholder="Track name or link"
            onChange={onCommentChange}
            value={songRecommendationData.comment}
            required
          />
        </div>
        <button type="submit" data-splitbee-event="Send Song Recommendation">
          Send Recommendation
        </button>
      </StyledFieldset>
    </form>
  );

  return (
    <Layout location={location}>
      <Helmet>
        <title>{metaConfig.title}</title>
        <meta name="description" content={metaConfig.description} />
        <meta property="og:title" content={metaConfig.title} />
        <meta property="og:description" content={metaConfig.description} />
        <meta property="og:image" content={`${siteUrl}${ogImage}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={metaConfig.url} />
        <meta property="og:site_name" content={metaConfig.title} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={metaConfig.title} />
        <meta name="twitter:description" content={metaConfig.description} />
        <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
        <meta name="twitter:image:alt" content={metaConfig.title} />
      </Helmet>
      <StyledMainContainer>
        <header ref={revealTitle}>
          <h1 className="big-heading">Music</h1>
          <p className="subtitle">deep dive into my music library</p>
        </header>

        <section ref={revealMusicContent}>
          <NowPlayingWidgetContainer>
            <NowPlaying />
          </NowPlayingWidgetContainer>

          <DetailsAndSummary
            title="Top Tracks"
            subtitle="Top tracks I have jammed to. Some put me to sleep while some made me dance.">
            <Fragment>
              <RangeToggleButtonContainer>
                <RangeToggleButton range="short" type="tracks" />
                <RangeToggleButton range="medium" type="tracks" />
                <RangeToggleButton range="long" type="tracks" />
              </RangeToggleButtonContainer>
              {renderTopTracks()}
            </Fragment>
          </DetailsAndSummary>

          <DetailsAndSummary
            title="Favourite Playlist"
            subtitle="A playlist I wouldn't share with just anyone. I used to listen to this at night alone, which is now turning into a collection of feel-good & indie songs.">
            {renderAyushFavouritePlaylist()}
          </DetailsAndSummary>

          <DetailsAndSummary
            title="Recently Played"
            subtitle="Recent tracks I played while discovering new music, or maybe listening to the same old shiz nth time.">
            {renderRecentlyPlayedTracks()}
          </DetailsAndSummary>

          <DetailsAndSummary
            title="Recently Saved Tracks"
            subtitle="It's so sad that Spotify doesn't let us share our Liked Songs as a playlist :3">
            {renderRecentlySavedTracks()}
          </DetailsAndSummary>

          <DetailsAndSummary
            title="Top Artists"
            subtitle="Top artists I looped on. I am more of an indie guy but the list doesn't suggest so, sigh.">
            <Fragment>
              <RangeToggleButtonContainer>
                <RangeToggleButton range="short" type="artists" />
                <RangeToggleButton range="medium" type="artists" />
                <RangeToggleButton range="long" type="artists" />
              </RangeToggleButtonContainer>
              {renderTopArtists()}
            </Fragment>
          </DetailsAndSummary>

          <DetailsAndSummary
            title="Recently Saved Playlists"
            subtitle="Some playlists are too precious to not save, IYKYK.">
            {renderUserPlaylists()}
          </DetailsAndSummary>
        </section>

        <SimilarTasteSection>
          <h2>Have similar music taste?</h2>
          <p>
            Fill the form below or recommend me your favorite songs on{' '}
            <ExternalLink url="https://twitter.com/_guptaji_" eventType="Twitter">
              twitter
            </ExternalLink>
            {' or '}
            <ExternalLink url="https://www.instagram.com/_.guptaji._/" eventType="Instagram">
              instagram
            </ExternalLink>
            .
          </p>
          {renderSongReceommendationForm()}
        </SimilarTasteSection>
      </StyledMainContainer>
    </Layout>
  );
};

MusicPage.propTypes = {
  location: PropTypes.object.isRequired,
};

export default MusicPage;
