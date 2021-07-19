import React, { useEffect, useState, Fragment } from 'react';
import { Link } from 'gatsby';
import styled, { css } from 'styled-components';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';

import ExternalLink from './externalLink';
import { Menu } from '@components';
import { IconLogo } from '@components/icons';
import { useScrollDirection } from '@hooks';
import { navLinks } from '@config';
import { mixins, theme } from '@styles';

// --------------------------- CONSTANTS ------------------------------------------

const { colors, fontSizes, fonts, loaderDelay } = theme;

export const navLinkRedirection = (url, name) => {
  switch (name) {
    case 'Blog':
      return '/blog';
    case 'Uses':
      return '/uses';
    case 'Music':
      return '/music';
    default:
      return url;
  }
};

// --------------------------- STYLED COMPONENTS ------------------------------------------

const StyledHeader = styled.header`
  ${mixins.flexBetween};
  position: fixed;
  top: 0;
  padding: 0px 50px;
  transition: ${theme.transition};
  z-index: 11;
  width: 100%;
  height: ${theme.navHeight};
  background-color: rgba(10, 25, 47, 0.85);
  backdrop-filter: blur(10px);
  filter: none !important;
  pointer-events: auto !important;
  user-select: auto !important;

  @media (max-width: 1080px) {
    padding: 0 40px;
  }
  @media (max-width: 768px) {
    padding: 0 25px;
  }

  @media (prefers-reduced-motion: no-preference) {
    ${props =>
      props.scrollDirection === 'up' &&
      !props.scrolledToTop &&
      css`
        height: ${theme.navScrollHeight};
        transform: translateY(0px);
        background-color: rgba(10, 25, 47, 0.85);
        box-shadow: 0 10px 30px -10px ${colors.shadowNavy};
      `};
    ${props =>
      props.scrollDirection === 'down' &&
      !props.scrolledToTop &&
      css`
        height: ${theme.navScrollHeight};
        transform: translateY(calc(${theme.navScrollHeight} * -1));
        box-shadow: 0 10px 30px -10px ${colors.shadowNavy};
      `};
  }
`;

const StyledNav = styled.nav`
  ${mixins.flexBetween};
  position: relative;
  width: 100%;
  color: ${colors.lightestSlate};
  font-family: ${fonts.SFMono};
  counter-reset: item 0;
  z-index: 12;

  .logo {
    ${mixins.flexCenter};

    a {
      /* display: block; */
      color: ${colors.green};
      width: 50px;
      height: 50px;

      &:hover,
      &:focus {
        svg {
          fill: ${colors.transGreen};
        }
      }

      svg {
        fill: none;
        transition: ${theme.transition};
        user-select: none;
      }
    }
  }
`;

const StyledLinks = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }

  ol {
    ${mixins.flexBetween};
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      margin: 0 10px;
      position: relative;
      font-size: ${fontSizes.smallish};
      counter-increment: item 1;

      a {
        padding: 10px;

        &:before {
          content: '0' counter(item) '.';
          margin-right: 5px;
          text-align: right;
          color: ${colors.green};
          font-size: ${fontSizes.xsmall};
        }
      }
    }
  }

  .resume-button {
    ${mixins.smallButton};
    margin-left: 10px;
    font-size: ${fontSizes.smallish};
  }
`;

const StyledListLink = styled(Link)`
  padding: 12px 10px;
`;

// --------------------------- COMPONENT ------------------------------------------

const Nav = ({ isHome }) => {
  const [isMounted, setIsMounted] = useState(!isHome);
  const [scrolledToTop, setScrolledToTop] = useState(true);

  const scrollDirection = useScrollDirection('down');

  const handleScroll = () => {
    setScrolledToTop(window.pageYOffset < 50);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const timeout = isHome ? loaderDelay : 0;
  const fadeClass = isHome ? 'fade' : '';
  const fadeDownClass = isHome ? 'fadedown' : '';

  const Logo = () => (
    <div className="logo" tabIndex="-1">
      {isHome ? (
        <a href="/" aria-label="home">
          <IconLogo />
        </a>
      ) : (
        <Link to="/" aria-label="home">
          <IconLogo />
        </Link>
      )}
    </div>
  );

  const ResumeLink = () => (
    <ExternalLink className="resume-button" url="/resume" eventName="View Resume">
      Resume
    </ExternalLink>
  );

  return (
    <StyledHeader scrollDirection={scrollDirection} scrolledToTop={scrolledToTop}>
      <StyledNav>
        <Fragment>
          <TransitionGroup component={null}>
            {isMounted && (
              <CSSTransition classNames={fadeClass} timeout={timeout}>
                <Fragment>
                  <Logo />
                </Fragment>
              </CSSTransition>
            )}
          </TransitionGroup>

          <StyledLinks>
            <ol>
              <TransitionGroup component={null}>
                {isMounted &&
                  navLinks &&
                  navLinks.map(({ url, name }, i) => (
                    <CSSTransition key={i} classNames={fadeDownClass} timeout={timeout}>
                      <li key={i} style={{ transitionDelay: `${isHome ? i * 100 : 0}ms` }}>
                        <StyledListLink to={navLinkRedirection(url, name)}>{name}</StyledListLink>
                      </li>
                    </CSSTransition>
                  ))}
              </TransitionGroup>
            </ol>

            <TransitionGroup component={null}>
              {isMounted && (
                <CSSTransition classNames={fadeDownClass} timeout={timeout}>
                  <div style={{ transitionDelay: `${isHome ? navLinks.length * 100 : 0}ms` }}>
                    <ResumeLink />
                  </div>
                </CSSTransition>
              )}
            </TransitionGroup>
          </StyledLinks>

          <TransitionGroup component={null}>
            {isMounted && (
              <CSSTransition classNames={fadeClass} timeout={timeout}>
                <Menu />
              </CSSTransition>
            )}
          </TransitionGroup>
        </Fragment>
      </StyledNav>
    </StyledHeader>
  );
};

Nav.propTypes = {
  isHome: PropTypes.bool,
};

export default Nav;
