import { createGlobalStyle } from 'styled-components';
import media from './media';
import PrismStyles from './PrismStyles';
import fonts from './fonts';

const GlobalStyle = createGlobalStyle`
  ${fonts};

  html {
    box-sizing: border-box;
    width: 100%;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  ::selection {
    background-color: ${({ theme }) => theme.colors.lightestNavy};
    color: ${({ theme }) => theme.colors.lightestSlate};
  }
  
  :focus {
    outline: 2px dashed ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }

  :focus:not(:focus-visible) {
    outline: none;
    outline-offset: 0px;
  }

  :focus-visible {
    outline: 2px dashed ${({ theme }) => theme.colors.green};
    outline-offset: 3px;
  }

  /* Scrollbar Styles */
  html {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.colors.darkSlate} ${({ theme }) => theme.colors.navy};
  }
  body::-webkit-scrollbar {
    width: 12px;
  }
  body::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.navy};
  }
  body::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.darkSlate};
    border: 3px solid ${({ theme }) => theme.colors.navy};
    border-radius: 10px;
  }

  body {
    margin: 0;
    width: 100%;
    min-height: 100%;
    overflow-x: hidden;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: ${({ theme }) => theme.colors.navy};
    color: ${({ theme }) => theme.colors.slate};
    line-height: 1.3;
    font-family: ${({ theme }) => theme.fonts.Calibre};
    font-size: ${({ theme }) => theme.fontSizes.xlarge};
    ${media.phablet`font-size: ${({ theme }) => theme.fontSizes.large};`}

    &.hidden {
      overflow: hidden;
    }
    
    &.blur {
      overflow: hidden;
      header {
        background-color: transparent;
      }
      #content > * {
        filter: blur(5px) brightness(0.7);
        transition: ${({ theme }) => theme.transition};
        pointer-events: none;
        user-select: none;
      }
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.white};
    margin: 0 0 10px 0;
  }

  #root {
    min-height: 100vh;
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 100%;
  }


  img {
    width: 100%;
    max-width: 100%;
    vertical-align: middle;
  }

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
    vertical-align: middle;
  }

  a {
    display: inline-block;
    text-decoration: none;
    text-decoration-skip-ink: auto;
    color: inherit;
    position: relative;
    transition: ${({ theme }) => theme.transition};
    cursor: pointer;

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.colors.green};
    }
  }

  button {
    cursor: pointer;
    border: 0;
    border-radius: 0;

    &:focus,
    &:active {
      outline-color: ${({ theme }) => theme.colors.blue};
    }
  }

  input, textarea {
    border-radius: 0;
    outline: 0;

    &:focus {
      outline: 0;
    }
    &::placeholder {
    }
    &:focus,
    &:active {
      &::placeholder {
        opacity: 0.5;
      }
    }
  }

  p {
    margin: 0 0 15px 0;
  }

  ul, ol {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .gatsby-image-outer-wrapper {
    height: 100%;
  }

  .fadeup-enter {
    opacity: 0.01;
    transform: translateY(20px);
    transition: opacity 300ms ${({ theme }) => theme.easing}, transform 300ms ${({ theme }) =>
  theme.easing};
  }

  .fadeup-enter-active {
    opacity: 1;
    transform: translateY(0px);
    transition: opacity 300ms ${({ theme }) => theme.easing}, transform 300ms ${({ theme }) =>
  theme.easing};
  }

  .fadedown-enter {
    opacity: 0.01;
    transform: translateY(-20px);
    transition: opacity 300ms ${({ theme }) => theme.easing}, transform 300ms ${({ theme }) =>
  theme.easing};
  }

  .fadedown-enter-active {
    opacity: 1;
    transform: translateY(0px);
    transition: opacity 300ms ${({ theme }) => theme.easing}, transform 300ms ${({ theme }) =>
  theme.easing};
  }

  .fade-enter {
    opacity: 0.01;
    transition: opacity 1000ms ${({ theme }) => theme.easing};
  }

  .fade-enter-active {
    opacity: 1;
    transition: opacity 1000ms ${({ theme }) => theme.easing};
  }
  
  .big-heading {
    margin: 0;
    font-size: clamp(40px, 8vw, 80px);
  }

  .medium-heading {
    margin: 0;
    font-size: clamp(40px, 8vw, 60px);
  }

  .subtitle {
    color: ${({ theme }) => theme.colors.green};
    font-family: ${({ theme }) => theme.fonts.SFMono};
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    margin: 0 0 20px 0;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    margin-bottom: 50px;
    color: ${({ theme }) => theme.colors.green};
    .arrow {
      display: block;
      margin-right: 10px;
      padding-top: 4px;
    }
    a {
      ${({ theme }) => theme.mixins.inlineLink};
      font-family: ${({ theme }) => theme.fonts.SFMono};
      font-size: ${({ theme }) => theme.fontSizes.small};
      font-weight: 600;
      line-height: 1.5;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  }

  ${PrismStyles};

`;

export default GlobalStyle;
