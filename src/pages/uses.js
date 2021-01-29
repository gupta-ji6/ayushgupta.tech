import React, { useEffect, useRef } from 'react';
import { Layout } from '@components';
import { theme, mixins, media } from '@styles';
const { colors, fontSizes } = theme;
import ogImage from '@images/og-uses.png';

import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import styled from 'styled-components';
import { srConfig, siteUrl } from '@config';
import sr from '@utils/sr';
import { Helmet } from 'react-helmet';
import ExternalLink from '../components/externalLink';

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
    margin-bottom: 100px;
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

  a {
    ${mixins.inlineLink};
  }

  details[open] {
    summary > span {
      color: ${colors.green};
    }
  }
`;

const StyledDetails = styled.details`
  summary::-webkit-details-marker {
    color: ${colors.green};
  }
  padding: 10px 0;
`;

const StyledSummary = styled.summary`
  display: block;
  cursor: pointer;
  padding: 10px;
  font-size: ${fontSizes.h3};
  ${theme.transition};
  user-select: none;
  line-height: 1.1;
  color: ${colors.slate};
  outline: none;

  &:focus-visible {
    outline: 1px solid ${colors.green};
  }

  span {
    color: ${colors.white};
    font-weight: 600;

    &:hover {
      color: ${colors.green};
    }
  }

  p {
    font-size: ${fontSizes.xxlarge};
  }
`;

const MoreQuestionsSection = styled.section`
  ${mixins.flexCenter};
  flex-direction: column;
  padding-top: 60px;
`;

const metaConfig = {
  title: 'Uses - Ayush Gupta',
  description: 'A living document of setup with apps Ayush Gupta uses daily.',
  url: 'https://ayushgupta.tech/uses',
};

const UsesPage = ({ data, location }) => {
  const revealTitle = useRef(null);
  const usesData = data.uses.edges;

  useEffect(() => {
    sr.reveal(revealTitle.current, srConfig());
  }, []);

  return (
    <Layout location={location}>
      <Helmet>
        <title>Uses - Ayush Gupta</title>
        <link rel="canonical" href={metaConfig.url} />
        <meta name="description" content={metaConfig.description} />
        <meta property="og:title" content={metaConfig.title} />
        <meta property="og:description" content={metaConfig.description} />
        <meta property="og:image" content={`${siteUrl}${ogImage}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={metaConfig.url} />
        <meta property="og:site_name" content={metaConfig.title} />
        <meta property="og:image" content={`${siteUrl}${ogImage}`} />
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
        <header>
          <h1 className="big-heading">Uses</h1>
          <p className="subtitle">a living document of my setup with apps I use daily</p>
        </header>

        <section>
          {usesData &&
            usesData.map(({ node }, i) => {
              const { frontmatter, html } = node;
              const { title, subtitle } = frontmatter;

              return (
                <StyledDetails key={i} ref={revealTitle}>
                  <StyledSummary>
                    <span className="medium-heading">{title}</span>
                    <p>{subtitle}</p>
                  </StyledSummary>
                  <div dangerouslySetInnerHTML={{ __html: html }} itemProp="usesContent" />
                </StyledDetails>
              );
            })}
        </section>

        <MoreQuestionsSection>
          <h2>Have more questions?</h2>
          <p>
            Feel free to ask away on{' '}
            <ExternalLink url="https://twitter.com/_guptaji_">twitter</ExternalLink>.
          </p>
          <small>Last Updated: November, 2020</small>
        </MoreQuestionsSection>
      </StyledMainContainer>
    </Layout>
  );
};

UsesPage.propTypes = {
  data: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default UsesPage;

export const pageQuery = graphql`
  {
    uses: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/uses/" } }
      sort: { fields: [frontmatter___order], order: ASC }
    ) {
      edges {
        node {
          frontmatter {
            title
            subtitle
            order
          }
          html
        }
      }
    }
  }
`;
