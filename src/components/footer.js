import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {
  IconGithub,
  IconLinkedin,
  IconMedium,
  IconInstagram,
  IconTwitter,
  IconFacebook,
} from '@components/icons';
import { socialMedia } from '@config';
import { media } from '@styles';
import NowPlaying from './now-palying';
import ExternalLink from './externalLink';

// ------------------------- STYLED COMPONENTS ------------------------------

const FooterContainer = styled.footer`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  padding: 5px;
  background-color: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.slate};
  text-align: center;
  height: auto;
  min-height: 70px;

  .now_playing_container {
    max-width: 85vw;
  }
`;
const SocialContainer = styled.div`
  color: ${({ theme }) => theme.colors.lightSlate};
  width: 100%;
  max-width: 270px;
  margin: 0 auto 10px;
  display: none;
  ${media.tablet`display: block;`};
`;
const SocialItemList = styled.ul`
  ${({ theme }) => theme.mixins.flexBetween};
`;
const SocialLink = styled(ExternalLink)`
  padding: 10px;
  svg {
    width: 20px;
    height: 20px;
  }
`;
const Copy = styled.div`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  margin: 5px 0;
  font-family: ${({ theme }) => theme.fonts.SFMono};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  line-height: 1;
`;
const GithubLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.colors.slate};
  margin-bottom: 5px;
`;

// ------------------------- COMPONENT ------------------------------

const Footer = ({ isMusicPage }) => (
  <FooterContainer>
    <div className="now_playing_container">{isMusicPage ? null : <NowPlaying />}</div>
    <SocialContainer>
      <SocialItemList>
        {socialMedia &&
          socialMedia.map(({ name, url }, i) => (
            <li key={i}>
              <SocialLink url={url} aria-label={name} eventType={name}>
                {name === 'Github' ? (
                  <IconGithub />
                ) : name === 'Linkedin' ? (
                  <IconLinkedin />
                ) : name === 'Medium' ? (
                  <IconMedium />
                ) : name === 'Instagram' ? (
                  <IconInstagram />
                ) : name === 'Twitter' ? (
                  <IconTwitter />
                ) : name === 'Facebook' ? (
                  <IconFacebook />
                ) : (
                  <IconGithub />
                )}
              </SocialLink>
            </li>
          ))}
      </SocialItemList>
    </SocialContainer>
    <Copy>
      <GithubLink url="https://github.com/gupta-ji6" eventType="Github">
        <small>
          Customized with{' '}
          <span role="img" aria-label="Coffee">
            ☕
          </span>{' '}
          and{' '}
          <span role="img" aria-label="Heart">
            ❤
          </span>{' '}
          by Ayush Gupta
        </small>
        {/* <div>Template by Brittany Chiang</div> */}
      </GithubLink>
      <GithubLink url="https://github.com/bchiang7">
        <small>Template by Brittany Chiang</small>
      </GithubLink>
    </Copy>
  </FooterContainer>
);

Footer.propTypes = {
  isMusicPage: PropTypes.bool,
};

export default Footer;
