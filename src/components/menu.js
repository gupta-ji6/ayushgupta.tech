import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'gatsby';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';

import ExternalLink from './externalLink';
import { useOnClickOutside } from '@hooks';
import { KEY_CODES } from '@utils';
import { navLinks } from '@config';
import { mixins, theme } from '@styles';
import { navLinkRedirection } from './nav';

// --------------------------- CONSTANTS ------------------------------------------

const { colors, fontSizes, fonts } = theme;

// --------------------------- STYLED COMPONENTS ------------------------------------------

const StyledMenu = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const StyledHamburgerButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    ${mixins.flexCenter};
    position: relative;
    z-index: 10;
    margin-right: -15px;
    padding: 15px;
    border: 0;
    background-color: transparent;
    color: inherit;
    text-transform: none;
    transition-timing-function: linear;
    transition-duration: 0.15s;
    transition-property: opacity, filter;
  }

  .ham-box {
    display: inline-block;
    position: relative;
    width: ${theme.hamburgerWidth};
    height: 24px;
  }

  .ham-box-inner {
    position: absolute;
    top: 50%;
    right: 0;
    width: ${theme.hamburgerWidth};
    height: 2px;
    border-radius: ${theme.borderRadius};
    background-color: ${colors.green};
    transition-duration: 0.22s;
    transition-property: transform;
    transition-delay: ${props => (props.menuOpen ? `0.12s` : `0s`)};
    transform: rotate(${props => (props.menuOpen ? `225deg` : `0deg`)});
    transition-timing-function: cubic-bezier(
      ${props => (props.menuOpen ? `0.215, 0.61, 0.355, 1` : `0.55, 0.055, 0.675, 0.19`)}
    );

    &:before,
    &:after {
      content: '';
      display: block;
      position: absolute;
      left: auto;
      right: 0;
      width: ${theme.hamburgerWidth};
      height: 2px;
      border-radius: 4px;
      background-color: ${colors.green};
      transition-timing-function: ease;
      transition-duration: 0.15s;
      transition-property: transform;
    }

    &:before {
      width: ${props => (props.menuOpen ? `100%` : `120%`)};
      top: ${props => (props.menuOpen ? `0` : `-10px`)};
      opacity: ${props => (props.menuOpen ? 0 : 1)};
      transition: ${({ menuOpen }) => (menuOpen ? 'theme.hamBeforeActive' : 'theme.hamBefore')};
    }
    &:after {
      width: ${props => (props.menuOpen ? `100%` : `80%`)};
      bottom: ${props => (props.menuOpen ? `0` : `-10px`)};
      transform: rotate(${props => (props.menuOpen ? `-90deg` : `0`)});
      transition: ${({ menuOpen }) => (menuOpen ? 'theme.hamAfterActive' : 'theme.hamAfter')};
    }
  }
`;

const StyledSidebar = styled.aside`
  display: none;

  @media (max-width: 768px) {
    ${mixins.flexCenter};
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    padding: 50px 10px;
    width: min(75vw, 400px);
    height: 100vh;
    outline: 0;
    background-color: ${colors.lightNavy};
    box-shadow: -10px 0px 30px -15px ${colors.shadowNavy};
    z-index: 9;
    transform: translateX(${props => (props.menuOpen ? 0 : 100)}vw);
    visibility: ${props => (props.menuOpen ? 'visible' : 'hidden')};
    transition: ${theme.transition};
  }

  nav {
    ${mixins.flexBetween};
    width: 100%;
    flex-direction: column;
    color: ${colors.lightestSlate};
    font-family: ${fonts.SFMono};
    text-align: center;
  }

  ol {
    padding: 0;
    margin: 0;
    list-style: none;
    width: 100%;

    li {
      position: relative;
      margin: 0 auto 20px;
      counter-increment: item 1;
      font-size: clamp(${fontSizes.small}, 4vw, ${fontSizes.large});

      @media (max-width: 600px) {
        margin: 0 auto 10px;
      }

      &:before {
        content: '0' counter(item) '.';
        display: block;
        margin-bottom: 5px;
        color: ${colors.green};
        font-size: ${fontSizes.small};
      }
    }

    a {
      ${mixins.link};
      width: 100%;
      padding: 3px 20px 20px;
    }
  }

  .resume-link {
    ${mixins.bigButton};
    padding: 18px 50px;
    margin: 10% auto 0;
    width: max-content;
  }
`;

// --------------------------- COMPONENT ------------------------------------------

const Menu = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const buttonRef = useRef(null);
  const navRef = useRef(null);

  let menuFocusables;
  let firstFocusableEl;
  let lastFocusableEl;

  const setFocusables = () => {
    menuFocusables = [buttonRef.current, ...Array.from(navRef.current.querySelectorAll('a'))];
    firstFocusableEl = menuFocusables[0];
    lastFocusableEl = menuFocusables[menuFocusables.length - 1];
  };

  const handleBackwardTab = e => {
    if (document.activeElement === firstFocusableEl) {
      e.preventDefault();
      lastFocusableEl.focus();
    }
  };

  const handleForwardTab = e => {
    if (document.activeElement === lastFocusableEl) {
      e.preventDefault();
      firstFocusableEl.focus();
    }
  };

  const onKeyDown = e => {
    switch (e.key) {
      case KEY_CODES.ESCAPE:
      case KEY_CODES.ESCAPE_IE11: {
        setMenuOpen(false);
        break;
      }

      case KEY_CODES.TAB: {
        if (menuFocusables && menuFocusables.length === 1) {
          e.preventDefault();
          break;
        }
        if (e.shiftKey) {
          handleBackwardTab(e);
        } else {
          handleForwardTab(e);
        }
        break;
      }

      default: {
        break;
      }
    }
  };

  const onResize = e => {
    if (e.currentTarget.innerWidth > 768) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    setFocusables();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const wrapperRef = useRef();
  useOnClickOutside(wrapperRef, () => setMenuOpen(false));

  return (
    <StyledMenu>
      <Helmet>
        <body className={menuOpen ? 'blur' : ''} />
      </Helmet>

      <div ref={wrapperRef}>
        <StyledHamburgerButton
          onClick={toggleMenu}
          menuOpen={menuOpen}
          ref={buttonRef}
          aria-label="Menu">
          <div className="ham-box">
            <div className="ham-box-inner" />
          </div>
        </StyledHamburgerButton>

        <StyledSidebar menuOpen={menuOpen} aria-hidden={!menuOpen} tabIndex={menuOpen ? 1 : -1}>
          <nav ref={navRef}>
            {navLinks && (
              <ol>
                {navLinks.map(({ url, name }, i) => (
                  <li key={i}>
                    <Link to={navLinkRedirection(url, name)} onClick={() => setMenuOpen(false)}>
                      {name}
                    </Link>
                  </li>
                ))}
              </ol>
            )}

            <ExternalLink url="/resume" eventName="View Resume" className="resume-link">
              Resume
            </ExternalLink>
          </nav>
        </StyledSidebar>
      </div>
    </StyledMenu>
  );
};

export default Menu;
