import React, { useEffect, useRef } from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';

import sr from '@utils/sr';
import { srConfig, github } from '@config';
import { theme, mixins, media, Section, Heading } from '@styles';
import { usePrefersReducedMotion } from '@hooks';
import ExternalLink from '../externalLink';

// ------------------------------ CONSTANTS --------------------------------

const { colors, fontSizes, fonts } = theme;

// ------------------------------ STYLED COMPONENTS --------------------------------

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

const StyledPic = styled(ExternalLink)`
  position: relative;
  max-width: 300px;

  @media (max-width: 768px) {
    margin: 50px auto 0;
    width: 70%;
  }

  .wrapper {
    ${mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: ${theme.borderRadius};
    background-color: ${colors.green};

    &:hover,
    &:focus {
      background: transparent;
      outline: 0;
      &:after {
        top: 15px;
        left: 15px;
      }
      .img {
        filter: none;
        mix-blend-mode: normal;
      }
    }

    .img {
      position: relative;
      border-radius: ${theme.borderRadius};
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1);
      transition: ${theme.transition};
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
      background-color: ${colors.navy};
      mix-blend-mode: screen;
    }

    &:after {
      border: 2px solid ${colors.green};
      top: 20px;
      left: 20px;
      z-index: -1;
    }
  }
`;

// ------------------------------ COMPONENT --------------------------------

const About = () => {
  const data = useStaticQuery(graphql`
    {
      about: allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/about/" } }) {
        edges {
          node {
            frontmatter {
              title
              skills
            }
            html
          }
        }
      }
    }
  `);

  const { about } = data;
  const { frontmatter, html } = about.edges[0].node;
  const { title, skills } = frontmatter;
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

        <StyledPic url={github} eventType="Github">
          <div className="wrapper">
            <StaticImage
              className="img"
              src="../../../content/about/ayush.jpg"
              width={500}
              quality={95}
              alt="Headshot"
            />
          </div>
        </StyledPic>
      </FlexContainer>
    </AboutContainer>
  );
};

export default About;
