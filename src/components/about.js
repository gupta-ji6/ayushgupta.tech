import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Img from 'gatsby-image';
import styled from 'styled-components';

import sr from '@utils/sr';
import { srConfig, github } from '@config';
import { theme, mixins, media, Section, Heading } from '@styles';
import { usePrefersReducedMotion } from '@hooks';
import ExternalLink from './externalLink';

const { colors, fontSizes, fonts } = theme;

const AboutContainer = styled(Section)`
  position: relative;
`;
const FlexContainer = styled.div`
  ${mixins.flexBetween};
  align-items: flex-start;
  ${media.tablet`display: block;`};
`;
const ContentContainer = styled.div`
  width: 60%;
  max-width: 480px;
  ${media.tablet`width: 100%;`};
  a {
    ${mixins.inlineLink};
  }
`;
const SkillsContainer = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 200px));
  overflow: hidden;
  margin-top: 20px;
`;
const Skill = styled.li`
  position: relative;
  margin-bottom: 10px;
  padding-left: 20px;
  font-family: ${fonts.SFMono};
  font-size: ${fontSizes.smallish};
  color: ${colors.slate};
  &:before {
    content: '▹';
    position: absolute;
    left: 0;
    color: ${colors.green};
    font-size: ${fontSizes.small};
    line-height: 12px;
  }
`;
const PicContainer = styled.div`
  position: relative;
  width: 40%;
  max-width: 300px;
  margin-left: 60px;
  ${media.tablet`margin: 60px auto 0;`};
  ${media.phablet`width: 70%;`};
`;
const Avatar = styled(Img)`
  position: relative;
  mix-blend-mode: screen;
  filter: grayscale(100%) contrast(1);
  ${media.tablet`
    mix-blend-mode: normal; 
    filter:grayscale(100%) contrast(1);
    &:hover,
    &:focus {
      background: transparent;
      filter: none;
      mix-blend-mode: normal;
      &:after {
        top: 15px;
        left: 15px;
        background: transparent;
        filter: none;
    }`};
  ${media.phablet`
    mix-blend-mode: normal; 
    filter:grayscale(100%) contrast(1);
    &:hover,
    &:focus {
      background: transparent;
      filter: none;
      mix-blend-mode: normal;
      &:after {
        top: 15px;
        left: 15px;
        background: transparent;
        filter: none;
      }
    `};
  border-radius: ${theme.borderRadius};
  transition: ${theme.transition};
`;
const AvatarContainer = styled(ExternalLink)`
  ${mixins.boxShadow};
  width: 100%;
  position: relative;
  border-radius: ${theme.borderRadius};
  background-color: ${colors.green};
  margin-left: -20px;
  ${Avatar} {
    border-radius: ${theme.borderRadius};
  }
  &:hover,
  &:focus {
    background: transparent;
    filter: none;
    mix-blend-mode: nomral;
    &:after {
      top: 15px;
      left: 15px;
      background: transparent;
      filter: none;
    }
    ${Avatar} {
      border-radius: ${theme.borderRadius};
      filter: none;
      mix-blend-mode: normal;
    }
  }
  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: ${theme.borderRadius};
    transition: ${theme.transition};
  }
  &:before {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${colors.navy};
    mix-blend-mode: normal;
  }
  &:after {
    border: 2px solid ${colors.green};
    top: 20px;
    left: 20px;
    z-index: -1;
  }
`;

const About = ({ data }) => {
  const { frontmatter, html } = data[0].node;
  const { title, skills, avatar } = frontmatter;
  const revealContainer = useRef(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  return (
    <AboutContainer id="about" ref={revealContainer}>
      <Heading>{title}</Heading>
      <FlexContainer>
        <ContentContainer>
          <div dangerouslySetInnerHTML={{ __html: html }} />
          <SkillsContainer>
            {skills && skills.map((skill, i) => <Skill key={i}>{skill}</Skill>)}
          </SkillsContainer>
        </ContentContainer>
        <PicContainer>
          <AvatarContainer url={github} eventType="Github">
            <Avatar fluid={avatar.childImageSharp.fluid} alt="Avatar" />
          </AvatarContainer>
        </PicContainer>
      </FlexContainer>
    </AboutContainer>
  );
};

About.propTypes = {
  data: PropTypes.array.isRequired,
};

export default About;
