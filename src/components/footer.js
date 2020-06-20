import React from 'react';
import PropTypes from 'prop-types';
import {
  IconGithub,
  IconLinkedin,
  IconMedium,
  IconInstagram,
  IconTwitter,
  IconFacebook,
  // IconStar,
  // IconFork,
} from '@components/icons';
import { socialMedia } from '@config';
import styled from 'styled-components';
import { theme, mixins, media } from '@styles';
const { colors, fontSizes, fonts } = theme;

const FooterContainer = styled.footer`
  ${mixins.flexCenter};
  flex-direction: column;
  padding: 5px;
  background-color: ${colors.darkNavy};
  color: ${colors.slate};
  text-align: center;
  height: auto;
  min-height: 70px;
`;
const SocialContainer = styled.div`
  color: ${colors.lightSlate};
  width: 100%;
  max-width: 270px;
  margin: 0 auto 10px;
  display: none;
  ${media.tablet`display: block;`};
`;
const SocialItemList = styled.ul`
  ${mixins.flexBetween};
`;
const SocialLink = styled.a`
  padding: 10px;
  svg {
    width: 20px;
    height: 20px;
  }
`;
const Copy = styled.div`
  ${mixins.flexCenter};
  flex-direction: column;
  margin: 5px 0;
  font-family: ${fonts.SFMono};
  font-size: ${fontSizes.xsmall};
  line-height: 1;
`;
const GithubLink = styled.a`
  color: ${colors.slate};
  margin-bottom: 5px;
`;
// const GithubInfo = styled.div`
//   margin-top: 10px;

//   & > span {
//     display: inline-flex;
//     align-items: center;
//     margin: 0 7px;
//   }
//   svg {
//     display: inline-block;
//     height: 15px;
//     width: auto;
//     margin-right: 5px;
//   }
// `;

const Footer = () => (
  <FooterContainer>
    <SocialContainer>
      <SocialItemList>
        {socialMedia &&
          socialMedia.map(({ name, url }, i) => (
            <li key={i}>
              <SocialLink
                href={url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                aria-label={name}>
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
      <GithubLink
        href="https://github.com/gupta-ji6"
        target="_blank"
        rel="nofollow noopener noreferrer">
        <div>
          Customized with{' '}
          <span role="img" aria-label="Coffee">
            ☕
          </span>{' '}
          and{' '}
          <span role="img" aria-label="Heart">
            ♥
          </span>{' '}
          by Ayush Gupta
        </div>
        {/* <div>Template by Brittany Chiang</div> */}
      </GithubLink>
      <GithubLink
        href="https://github.com/bchiang7"
        target="_blank"
        rel="nofollow noopener noreferrer">
        <div>Template by Brittany Chiang</div>
      </GithubLink>
    </Copy>
  </FooterContainer>
);

Footer.propTypes = {
  githubInfo: PropTypes.object,
};

export default Footer;
