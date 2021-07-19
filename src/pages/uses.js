import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';

import { Layout, ExternalLink, DetailsAndSummary } from '@components';
import { theme, mixins, media } from '@styles';
import ogImage from '@images/og-uses.png';
import { siteUrl, srConfig } from '@config';
import sr from '@utils/sr';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

// ============================= CONSTANTS ============================================

const { colors, fontSizes } = theme;

const metaConfig = {
  title: 'Uses - Ayush Gupta',
  description: `A living document of Ayush Gupta's setup, with apps he uses daily.`,
  url: 'https://ayushgupta.tech/uses',
};

// ============================= STYLED COMPONENTS ============================================

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
`;

const MoreQuestionsSection = styled.section`
  ${mixins.flexCenter};
  flex-direction: column;
  padding-top: 60px;
`;

const UsesContent = styled.div`
  margin-left: 10px;
`;

// ============================= COMPONENT ============================================

const UsesPage = ({ data, location }) => {
  const usesData = data.uses.edges;

  const revealTitle = useRef(null);
  const revealUsesContent = useRef(null);
  const revealUsesItems = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealUsesContent.current, srConfig(200, 0));
    revealUsesItems.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 10)));
  }, []);

  return (
    <Layout location={location}>
      <Helmet>
        <title>Uses - Ayush Gupta</title>
        <link rel="canonical" href={metaConfig.url} />
        <meta name="description" content={metaConfig.description} />
        <meta property="og:title" content={metaConfig.title} />
        <meta property="og:description" content={metaConfig.description} />
        <meta property="og:image" content={`${siteUrl}${ogImage}?v=2`} />
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
          <h1 className="big-heading">Uses</h1>
          <p className="subtitle">a living document of my setup, with apps I use daily</p>
        </header>

        <section ref={revealUsesContent}>
          {usesData &&
            usesData.map(({ node }, i) => {
              const { frontmatter, html } = node;
              const { title, subtitle } = frontmatter;

              return (
                <DetailsAndSummary
                  key={i}
                  title={title}
                  subtitle={subtitle}
                  ref={el => (revealUsesItems.current[i] = el)}>
                  <UsesContent dangerouslySetInnerHTML={{ __html: html }} itemProp="usesContent" />
                </DetailsAndSummary>
              );
            })}
        </section>

        <MoreQuestionsSection>
          <h2>Have more questions?</h2>
          <p>
            Feel free to ask away on{' '}
            <ExternalLink url="https://twitter.com/_guptaji_" eventType="Twitter">
              twitter
            </ExternalLink>
            .
          </p>
          <small>Last Updated: February, 2021</small>
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
