import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { StaticQuery, graphql } from 'gatsby';

import { Email, Footer, Head, Nav, Social, Notifications } from '@components';
import { GlobalStyle, theme, mixins } from '@styles';

// ---------------------------- CONSTANTS ----------------------------

const { colors } = theme;

// ---------------------------- STYLED COMPONENTS ----------------------------

const SkipToContent = styled.a`
  ${mixins.button};
  position: absolute;
  top: auto;
  left: -999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: -99;
  &:focus,
  &:active {
    background-color: ${colors.green};
    color: ${colors.navy};
    top: 0;
    left: 0;
    width: auto;
    height: auto;
    overflow: auto;
    z-index: 99;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

// ---------------------------- COMPONENT ----------------------------

const Layout = ({ children, location }) => {
  const isHome = location.pathname === '/';
  const isMusicPage = ['/music', '/music/'].includes(location.pathname);
  const [isLoading] = useState(isHome);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (location.hash) {
      const id = location.hash.substring(1); // location.hash without the '#'
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView();
          el.focus();
        }
      }, 0);
    }
  }, [isLoading]);

  return (
    <StaticQuery
      query={graphql`
        query LayoutQuery {
          site {
            siteMetadata {
              title
              siteUrl
              description
            }
          }
        }
      `}
      render={({ site }) => (
        <Fragment>
          <Head metadata={site.siteMetadata} />

          <div id="root">
            <GlobalStyle />

            <SkipToContent href="#content">Skip to Content</SkipToContent>

            <Notifications />

            {/* {isLoading ? (
            <Loader finishLoading={() => setIsLoading(false)} />
          ) : ( */}
            <StyledContent>
              <Nav isHome={isHome} />
              <Social isHome={isHome} />
              <Email isHome={isHome} />
              <div id="content">{children}</div>
              <Footer isMusicPage={isMusicPage} />
            </StyledContent>
            {/*  )} */}
          </div>
        </Fragment>
      )}
    />
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
};

export default Layout;
