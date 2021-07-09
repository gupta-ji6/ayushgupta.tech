import React, { useEffect, Fragment } from 'react';
import { Layout } from '@components';
import { theme, mixins, media } from '@styles';
const { colors, fontSizes } = theme;
import ogImage from '@images/og-uses.png';

import PropTypes from 'prop-types';
import styled from 'styled-components';
import { siteUrl } from '@config';
import { Helmet } from 'react-helmet';
import ExternalLink from '../components/externalLink';
import NowPlaying from '../components/now-palying';
import useRecentlyPlayedTracks from '../hooks/useRecentlyPlayedTracks';
import DetailsAndSummary from '../components/detailsAndSummary';

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

  h4 {
    padding-left: 10px;
  }

  ul {
    padding: 0;
    padding-left: 10px;
    margin: 0;
    list-style: none;
    font-size: ${fontSizes.large};
    li {
      position: relative;
      padding-left: 30px;
      margin-bottom: 10px;
      &:before {
        content: '▹';
        position: absolute;
        left: 0;
        color: ${colors.green};
        line-height: ${fontSizes.xlarge};
      }
    }
  }

  ol {
    padding: 0;
    padding-left: 10px;
    margin: 0;
    list-style: none;
    font-size: ${fontSizes.large};
    li {
      position: relative;
      padding-left: 30px;
      margin-bottom: 10px;
      &:before {
        content: '+';
        position: absolute;
        left: 0;
        color: ${colors.green};
        line-height: ${fontSizes.xlarge};
      }
    }
  }

  /* a {
    ${mixins.inlineLink};
  } */

  details[open] {
    summary > span {
      color: ${colors.green};
    }
  }

  details[open] summary ~ * {
    animation: sweep 0.5s ease-in-out;
  }

  @keyframes sweep {
    0% {
      opacity: 0;
      margin-left: -10px;
    }
    100% {
      opacity: 1;
      margin-left: 10px;
    }
  }
`;

const MoreQuestionsSection = styled.section`
  ${mixins.flexCenter};
  flex-direction: column;
  padding-top: 60px;
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

const metaConfig = {
  title: 'Music - Ayush Gupta',
  description: 'A living document of setup with apps Ayush Gupta uses daily.',
  url: 'https://ayushgupta.tech/music',
};

const MusicPage = ({ location }) => {
  // const usesData = data.uses.edges;

  const { recentlyPlayedTracks, loading, error } = useRecentlyPlayedTracks(10);

  useEffect(() => {
    let unsusbscribe = false;

    if (!unsusbscribe) {
      // console.log(recentlyPlayedTracks);
    }
    return () => {
      unsusbscribe = true;
    };
  }, []);

  const renderRecentlyPlayedTracks = () => {
    if (loading) {
      return <div>Loading recently played tracks...</div>;
    } else if (error !== null) {
      return (
        <Fragment>
          <div>{Error}</div>
          <button>Re-fetch</button>
        </Fragment>
      );
    } else if (recentlyPlayedTracks !== undefined) {
      // console.log(recentlyPlayedTracks);
      return (
        <ul>
          {recentlyPlayedTracks.map(trackData => {
            const { track } = trackData;
            return (
              <li key={track.id}>
                <a href={track.external_urls.spotify}>{track.name}</a>
              </li>
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
        <header>
          <h1 className="big-heading">Music</h1>
          <p className="subtitle">intorducing to you, my up-to-date music library</p>
        </header>

        <section>
          <NowPlayingWidgetContainer>
            <NowPlaying />
          </NowPlayingWidgetContainer>
          <DetailsAndSummary title="Recently Played Tracks">
            {renderRecentlyPlayedTracks()}
          </DetailsAndSummary>
          {/* usesData &&
            usesData.map(({ node }, i) => {
              const { frontmatter, html } = node;
              const { title, subtitle } = frontmatter;

              return (
                <StyledDetails key={i}>
                  <StyledSummary>
                    <span className="medium-heading">{title}</span>
                    <p>{subtitle}</p>
                  </StyledSummary>
                  <div dangerouslySetInnerHTML={{ __html: html }} itemProp="usesContent" />
                </StyledDetails>
              );
            }) */}
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
