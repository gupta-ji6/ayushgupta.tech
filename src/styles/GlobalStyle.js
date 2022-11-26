import { createGlobalStyle } from 'styled-components';
import theme from './theme';
import media from './media';
import mixins from './mixins';
import PrismStyles from './PrismStyles';
import * as fontFamilies from './fonts';
const { colors, fontSizes, fonts } = theme;

const GlobalStyle = createGlobalStyle`
  ${PrismStyles};
  
  @font-face {
    font-family: 'Calibre';
    src: url(${fontFamilies.CalibreLightWOFF2}) format('woff2'),
    url(${fontFamilies.CalibreLightWOFF}) format('woff'),
    url(${fontFamilies.CalibreLightTTF}) format('truetype');
    font-weight: 300;
    font-style: normal;
  }
  @font-face {
    font-family: 'Calibre';
    src: url(${fontFamilies.CalibreLightItalicWOFF2}) format('woff2'),
    url(${fontFamilies.CalibreLightItalicWOFF}) format('woff'),
    url(${fontFamilies.CalibreLightItalicTTF}) format('truetype');
    font-weight: 300;
    font-style: italic;
  }
  @font-face {
    font-family: 'Calibre';
    src: url(${fontFamilies.CalibreRegularWOFF2}) format('woff2'),
    url(${fontFamilies.CalibreRegularWOFF}) format('woff'),
    url(${fontFamilies.CalibreRegularTTF}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Calibre';
    src: url(${fontFamilies.CalibreRegularItalicWOFF2}) format('woff2'),
    url(${fontFamilies.CalibreRegularItalicWOFF}) format('woff'),
    url(${fontFamilies.CalibreRegularItalicTTF}) format('truetype');
    font-weight: normal;
    font-style: italic;
  }
  @font-face {
    font-family: 'Calibre';
    src: url(${fontFamilies.CalibreMediumWOFF2}) format('woff2'),
    url(${fontFamilies.CalibreMediumWOFF}) format('woff'),
    url(${fontFamilies.CalibreMediumTTF}) format('truetype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Calibre';
    src: url(${fontFamilies.CalibreMediumItalicWOFF2}) format('woff2'),
    url(${fontFamilies.CalibreMediumItalicWOFF}) format('woff'),
    url(${fontFamilies.CalibreMediumItalicTTF}) format('truetype');
    font-weight: 500;
    font-style: italic;
  }
  @font-face {
    font-family: 'Calibre';
    src: url(${fontFamilies.CalibreSemiboldWOFF2}) format('woff2'),
    url(${fontFamilies.CalibreSemiboldWOFF}) format('woff'),
    url(${fontFamilies.CalibreSemiboldTTF}) format('truetype');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'Calibre';
    src: url(${fontFamilies.CalibreSemiboldItalicWOFF2}) format('woff2'),
    url(${fontFamilies.CalibreSemiboldItalicWOFF}) format('woff'),
    url(${fontFamilies.CalibreSemiboldItalicTTF}) format('truetype');
    font-weight: 600;
    font-style: italic;
  }
  @font-face {
    font-family: 'SF Mono';
    src: url(${fontFamilies.SFMonoRegularWOFF2}) format('woff2'),
    url(${fontFamilies.SFMonoRegularWOFF}) format('woff'),
    url(${fontFamilies.SFMonoRegularTTF}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'SF Mono';
    src: url(${fontFamilies.SFMonoRegularItalicWOFF2}) format('woff2'),
    url(${fontFamilies.SFMonoRegularItalicWOFF}) format('woff'),
    url(${fontFamilies.SFMonoRegularItalicTTF}) format('truetype');
    font-weight: normal;
    font-style: italic;
  }
  @font-face {
    font-family: 'SF Mono';
    src: url(${fontFamilies.SFMonoMediumWOFF2}) format('woff2'),
    url(${fontFamilies.SFMonoMediumWOFF}) format('woff'),
    url(${fontFamilies.SFMonoMediumTTF}) format('truetype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'SF Mono';
    src: url(${fontFamilies.SFMonoMediumItalicWOFF2}) format('woff2'),
    url(${fontFamilies.SFMonoMediumItalicWOFF}) format('woff'),
    url(${fontFamilies.SFMonoMediumItalicTTF}) format('truetype');
    font-weight: 500;
    font-style: italic;
  }
  @font-face {
    font-family: 'SF Mono';
    src: url(${fontFamilies.SFMonoSemiboldWOFF2}) format('woff2'),
    url(${fontFamilies.SFMonoSemiboldWOFF}) format('woff'),
    url(${fontFamilies.SFMonoSemiboldTTF}) format('truetype');
    font-weight: 600;
    font-style: normal;
  }
  @font-face {
    font-family: 'SF Mono';
    src: url(${fontFamilies.SFMonoSemiboldItalicWOFF2}) format('woff2'),
    url(${fontFamilies.SFMonoSemiboldItalicWOFF}) format('woff'),
    url(${fontFamilies.SFMonoSemiboldItalicTTF}) format('truetype');
    font-weight: 600;
    font-style: italic;
  }

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
    background-color: ${colors.lightestNavy};
    color: ${colors.lightestSlate};
  }
  
  :focus {
    outline: 2px dashed ${colors.green};
    outline-offset: 3px;
  }

  :focus:not(:focus-visible) {
    outline: none;
    outline-offset: 0px;
  }

  :focus-visible {
    outline: 2px dashed ${colors.green};
    outline-offset: 3px;
  }

  /* Scrollbar Styles */
  html {
    scrollbar-width: thin;
    scrollbar-color: ${colors.darkSlate} ${colors.navy};
  }
  body::-webkit-scrollbar {
    width: 12px;
  }
  body::-webkit-scrollbar-track {
    background: ${colors.navy};
  }
  body::-webkit-scrollbar-thumb {
    background-color: ${colors.darkSlate};
    border: 3px solid ${colors.navy};
    border-radius: 10px;
  }

  body {
    margin: 0;
    width: 100%;
    min-height: 100%;
    overflow-x: hidden;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: ${colors.navy};
    color: ${colors.slate};
    line-height: 1.3;
    font-family: ${fonts.Calibre};
    font-size: ${fontSizes.xlarge};
    ${media.phablet`font-size: ${fontSizes.large};`}

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
        transition: ${theme.transition};
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
    color: ${colors.white};
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
    transition: ${theme.transition};
    cursor: pointer;

    &:hover,
    &:focus {
      color: ${colors.green};
    }
  }

  button {
    cursor: pointer;
    border: 0;
    border-radius: 0;

    &:focus,
    &:active {
      outline-color: ${colors.blue};
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
    transition: opacity 300ms ${theme.easing}, transform 300ms ${theme.easing};
  }

  .fadeup-enter-active {
    opacity: 1;
    transform: translateY(0px);
    transition: opacity 300ms ${theme.easing}, transform 300ms ${theme.easing};
  }

  .fadedown-enter {
    opacity: 0.01;
    transform: translateY(-20px);
    transition: opacity 300ms ${theme.easing}, transform 300ms ${theme.easing};
  }

  .fadedown-enter-active {
    opacity: 1;
    transform: translateY(0px);
    transition: opacity 300ms ${theme.easing}, transform 300ms ${theme.easing};
  }

  .fade-enter {
    opacity: 0.01;
    transition: opacity 1000ms ${theme.easing};
  }

  .fade-enter-active {
    opacity: 1;
    transition: opacity 1000ms ${theme.easing};
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
    color: ${colors.green};
    font-family: ${fonts.SFMono};
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    margin: 0 0 20px 0;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    margin-bottom: 50px;
    color: ${colors.green};
    .arrow {
      display: block;
      margin-right: 10px;
      padding-top: 4px;
    }
    a {
      ${mixins.inlineLink};
      font-family: ${fonts.SFMono};
      font-size: ${fontSizes.small};
      font-weight: 600;
      line-height: 1.5;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  }

  /* ==========================================================================
  Animation System by Neale Van Fleet from Rogue Amoeba - https://css-tricks.com/a-handy-little-system-for-animated-entrances-in-css/
  ========================================================================== */
  .animate {
    @media (prefers-reduced-motion: no-preference) {
      animation-duration: 0.75s;
      animation-delay: 0.5s;
      animation-name: animate-fade;
      animation-timing-function: cubic-bezier(.26, .53, .74, 1.48);
      animation-fill-mode: backwards;
    }
  }

  /* Fade In */
  .animate.fade {
    animation-name: animate-fade;
    animation-timing-function: ease;
  }

  @keyframes animate-fade {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  /* Pop In */
  .animate.pop { animation-name: animate-pop; }

  @keyframes animate-pop {
    0% {
      opacity: 0;
      transform: scale(0.5, 0.5);
    }
    100% {
      opacity: 1;
      transform: scale(1, 1);
    }
  }

  /* Blur In */
  .animate.blur {
    animation-name: animate-blur;
    animation-timing-function: ease;
  }

  @keyframes animate-blur {
    0% {
      opacity: 0;
      filter: blur(15px);
    }
    100% {
      opacity: 1;
      filter: blur(0px);
    }
  }

  /* Glow In */
  .animate.glow {
    animation-name: animate-glow;
    animation-timing-function: ease;
  }

  @keyframes animate-glow {
    0% {
      opacity: 0;
      filter: brightness(3) saturate(3);
      transform: scale(0.8, 0.8);
    }
    100% {
      opacity: 1;
      filter: brightness(1) saturate(1);
      transform: scale(1, 1);
    }
  }

  /* Grow In */
  .animate.grow { animation-name: animate-grow; }

  @keyframes animate-grow {
    0% {
      opacity: 0;
      transform: scale(1, 0);
      visibility: hidden;
    }
    100% {
      opacity: 1;
      transform: scale(1, 1);
    }
  }

  /* Splat In */
  .animate.splat { animation-name: animate-splat; }

  @keyframes animate-splat {
    0% {
      opacity: 0;
      transform: scale(0, 0) rotate(20deg) translate(0, -30px);
      }
    70% {
      opacity: 1;
      transform: scale(1.1, 1.1) rotate(15deg);
    }
    85% {
      opacity: 1;
      transform: scale(1.1, 1.1) rotate(15deg) translate(0, -10px);
    }

    100% {
      opacity: 1;
      transform: scale(1, 1) rotate(0) translate(0, 0);
    }
  }

  /* Roll In */
  .animate.roll { animation-name: animate-roll; }

  @keyframes animate-roll {
    0% {
      opacity: 0;
      transform: scale(0, 0) rotate(360deg);
    }
    100% {
      opacity: 1;
      transform: scale(1, 1) rotate(0deg);
    }
  }

  /* Flip In */
  .animate.flip {
    animation-name: animate-flip;
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  @keyframes animate-flip {
    0% {
      opacity: 0;
      transform: rotateX(-120deg) scale(0.9, 0.9);
    }
    100% {
      opacity: 1;
      transform: rotateX(0deg) scale(1, 1);
    }
  }

  /* Spin In */
  .animate.spin {
    animation-name: animate-spin;
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  @keyframes animate-spin {
    0% {
      opacity: 0;
      transform: rotateY(-120deg) scale(0.9, .9);
    }
    100% {
      opacity: 1;
      transform: rotateY(0deg) scale(1, 1);
    }
  }

  /* Slide In */
  .animate.slide { animation-name: animate-slide; }

  @keyframes animate-slide {
    0% {
      opacity: 0;
      transform: translate(0, 20px);
    }
    100% {
      opacity: 1;
      transform: translate(0, 0);
    }
  }

  /* Drop In */
  .animate.drop { 
    animation-name: animate-drop; 
    animation-timing-function: cubic-bezier(.77, .14, .91, 1.25);
  }

  @keyframes animate-drop {
  0% {
    opacity: 0;
    transform: translate(0,-300px) scale(0.9, 1.1);
  }
  95% {
    opacity: 1;
    transform: translate(0, 0) scale(0.9, 1.1);
  }
  96% {
    opacity: 1;
    transform: translate(10px, 0) scale(1.2, 0.9);
  }
  97% {
    opacity: 1;
    transform: translate(-10px, 0) scale(1.2, 0.9);
  }
  98% {
    opacity: 1;
    transform: translate(5px, 0) scale(1.1, 0.9);
  }
  99% {
    opacity: 1;
    transform: translate(-5px, 0) scale(1.1, 0.9);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) scale(1, 1);
    }
  }

  /* Animation Delays */
  .delay-1 {
    animation-delay: 0.6s;
  }
  .delay-2 {
    animation-delay: 0.7s;
  }
  .delay-3 {
    animation-delay: 0.8s;
  }
  .delay-4 {
    animation-delay: 0.9s;
  }
  .delay-5 {
    animation-delay: 1s;
  }
  .delay-6 {
    animation-delay: 1.1s;
  }
  .delay-7 {
    animation-delay: 1.2s;
  }
  .delay-8 {
    animation-delay: 1.3s;
  }
  .delay-9 {
    animation-delay: 1.4s;
  }
  .delay-10 {
    animation-delay: 1.5s;
  }
  .delay-11 {
    animation-delay: 1.6s;
  }
  .delay-12 {
    animation-delay: 1.7s;
  }
  .delay-13 {
    animation-delay: 1.8s;
  }
  .delay-14 {
    animation-delay: 1.9s;
  }
  .delay-15 {
    animation-delay: 2s;
  }
`;

export default GlobalStyle;
