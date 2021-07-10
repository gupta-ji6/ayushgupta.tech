import React, { useEffect, Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import { Layout, ExternalLink, NowPlaying, DetailsAndSummary } from '@components';
import useRecentlyPlayedTracks from '../hooks/useRecentlyPlayedTracks';
import useTopTracks from '../hooks/useTopTracks';
import { theme, mixins, media } from '@styles';
import { siteUrl, srConfig } from '@config';
import sr from '@utils/sr';
import ogImage from '@images/og-uses.png';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

// =================================== CONSTANTS ==========================================

const { colors, fontSizes } = theme;

const metaConfig = {
  title: 'Music - Ayush Gupta',
  description: 'A living document of setup with apps Ayush Gupta uses daily.',
  url: 'https://ayushgupta.tech/music',
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

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    font-size: ${fontSizes.xlarge};
    li {
      background-color: ${colors.lightNavy};
      border-radius: ${theme.borderRadius};
      position: relative;
      padding: 10px;
      margin-bottom: 10px;
    }
  }
`;

const MoreQuestionsSection = styled.section`
  ${mixins.flexCenter};
  flex-direction: column;
  padding-top: 60px;

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

const StyledRefetchBtn = styled.button`
  ${mixins.bigButton};
  margin-left: 10px;
  margin-top: 10px;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 0 10px 10px 10px;

  &:hover {
    img {
      border-radius: 50%;
      border: 2px solid ${colors.green};
      @media (prefers-reduced-motion: no-preference) {
        animation: rotation 6s infinite linear;
      }
    }
  }
`;

const StyledAlbumCover = styled.img`
  width: auto;
  height: 8rem;
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius};
  z-index: 1;

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
`;

// ======================================= COMPONENT ================================

const MusicPage = ({ location }) => {
  const revealTitle = useRef(null);
  const revealMusicContent = useRef(null);

  const {
    recentlyPlayedTracks,
    recentTracksLoading,
    recentTracksError,
    refetchRecentTracks,
  } = useRecentlyPlayedTracks(10);

  const { topTracks, topTracksLoading, topTracksError, refetchTopTracks } = useTopTracks(
    'tracks',
    'short_term',
    10,
  );

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealMusicContent.current, srConfig(200, 0));
  }, []);

  const renderRecentlyPlayedTracks = () => {
    if (recentTracksLoading) {
      return <div>Loading recently played tracks...</div>;
    } else if (recentTracksError !== null) {
      return (
        <Fragment>
          <div>{recentTracksError}</div>
          <StyledRefetchBtn
            type="button"
            data-splitbee-event="Re-fetch Recently Played"
            onClick={() => refetchRecentTracks()}>
            Re-fetch Tracks
          </StyledRefetchBtn>
        </Fragment>
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

  const renderTopTracks = () => {
    if (topTracksLoading) {
      return <div>Loading Ayush's top tracks...</div>;
    } else if (topTracksError !== null) {
      return (
        <Fragment>
          <div>{topTracksError}</div>
          <StyledRefetchBtn
            type="button"
            data-splitbee-event="Re-fetch Recently Played"
            onClick={() => refetchTopTracks()}>
            Re-fetch Tracks
          </StyledRefetchBtn>
        </Fragment>
      );
    } else if (topTracks !== undefined) {
      // console.log(topTracks);
      return (
        <ul>
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
        </ul>
      );
    }
  };

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
      <StyledMainContainer id="content">
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
            subtitle="Top tracks I jammed to this month. Some put me to sleep while some made me dance.">
            {renderTopTracks()}
          </DetailsAndSummary>
          <DetailsAndSummary
            title="Recently Played"
            subtitle="Recent tracks I played while discovering new music, or maybe listening to same old shiz nth time">
            {renderRecentlyPlayedTracks()}
          </DetailsAndSummary>
        </section>

        <MoreQuestionsSection>
          <h2>Have similar music taste?</h2>
          <p>
            Feel free to recommend me your favorite songs on{' '}
            <ExternalLink url="https://twitter.com/_guptaji_" eventType="Twitter">
              twitter
            </ExternalLink>
            {' or '}
            <ExternalLink url="https://www.instagram.com/_.guptaji._/" eventType="Instagram">
              instagram
            </ExternalLink>
            .
          </p>
        </MoreQuestionsSection>
      </StyledMainContainer>
    </Layout>
  );
};

MusicPage.propTypes = {
  // data: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default MusicPage;

// export const pageQuery = graphql`
//   {
//     uses: allMarkdownRemark(
//       filter: { fileAbsolutePath: { regex: "/uses/" } }
//       sort: { fields: [frontmatter___order], order: ASC }
//     ) {
//       edges {
//         node {
//           frontmatter {
//             title
//             subtitle
//             order
//           }
//           html
//         }
//       }
//     }
//   }
// `;
