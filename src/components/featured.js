import { Heading, Section, media, mixins, theme } from '@styles';
import { IconAppStore, IconExternal, IconGithub, IconGooglePlay } from '@components/icons';
import React, { useEffect, useRef } from 'react';

import Img from 'gatsby-image';
import PropTypes from 'prop-types';
import sr from '@utils/sr';
import { srConfig } from '@config';
import styled from 'styled-components';
import ExternalLink from '@components/externalLink';

const { colors, fontSizes, fonts } = theme;

const FeaturedContainer = styled(Section)`
  ${mixins.flexCenter};
  flex-direction: column;
  align-items: flex-start;
`;
const ContentContainer = styled.div`
  position: relative;
  z-index: 2;
  grid-column: 1 / 7;
  grid-row: 1 / -1;
  ${media.thone`
    grid-column: 1 / -1;
    padding: 40px 40px 30px;
  `};
  ${media.phablet`padding: 30px 25px 20px;`};
`;
const FeaturedLabel = styled.h4`
  font-size: ${fontSizes.smallish};
  font-weight: normal;
  color: ${colors.green};
  font-family: ${fonts.SFMono};
  margin-top: 10px;
  padding-top: 0;
`;
const ProjectName = styled.h5`
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 20px;
  color: ${colors.lightestSlate};
  ${media.tablet`font-size: 24px;`};
  a {
    ${media.tablet`display: block;`};
  }
`;
const ProjectDescription = styled.div`
  ${mixins.boxShadow};
  background-color: ${colors.lightNavy};
  color: ${colors.lightSlate};
  text-align: left;
  padding: 25px;
  border-radius: ${theme.borderRadius};
  font-size: ${fontSizes.large};
  ${media.thone`
    background-color: transparent;
    padding: 20px 0;
  `};
  p {
    margin: 0;
  }
  a {
    ${mixins.inlineLink};
    color: ${colors.white};
  }
`;
const TechList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin: 25px 0 10px;
  li {
    font-family: ${fonts.SFMono};
    font-size: ${fontSizes.smallish};
    color: ${colors.lightSlate};
    margin-right: ${theme.margin};
    margin-bottom: 7px;
    white-space: nowrap;
    &:last-of-type {
      margin-right: 0;
    }
    ${media.thone`
      color: ${colors.lightestSlate};
      margin-right: 10px;
    `};
  }
`;
const Links = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin-top: 10px;
  margin-left: -10px;
  a {
    padding: 10px;
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;
const FeaturedImg = styled(Img)`
  width: 100%;
  max-width: 100%;
  vertical-align: middle;
  border-radius: ${theme.borderRadius};
  position: relative;
  mix-blend-mode: multiply;
  filter: grayscale(100%) contrast(1) brightness(90%);
  ${media.tablet`
    object-fit: cover;
    width: auto;
    height: 100%;
    mix-blend-mode: normal;
    filter: grayscale(100%) contrast(1) brightness(80%);
  `};
  ${media.phablet`
    object-fit: cover;
    width: auto;
    height: 100%;
    mix-blend-mode: normal;
    filter: grayscale(100%) contrast(1) brightness(80%);
  `};
`;
const ImgContainer = styled(ExternalLink)`
  ${mixins.boxShadow};
  grid-column: 6 / -1;
  grid-row: 1 / -1;
  position: relative;
  z-index: 1;
  background-color: ${colors.green};
  border-radius: ${theme.radius + 1}px;
  transition: ${theme.transition};
  ${media.tablet`
    height: 100%;
    filter:grayscale(100%) contrast(1) brightness(80%);
    &:hover,
  &:focus {
    background: transparent;
    &:before,
    ${FeaturedImg} {
      background: transparent;
      filter: grayscale(100%) contrast(1) brightness(80%);
    }
  }
  `};
  ${media.phablet`
    height: 100%;
    filter:grayscale(100%) contrast(1) brightness(80%);
    &:hover,
  &:focus {
    background: transparent;
    &:before,
    ${FeaturedImg} {
      background: transparent;
      filter: grayscale(100%) contrast(1) brightness(80%);
    }
  }
  `};
  ${media.thone`
    grid-column: 1 / -1;
    opacity: 0.25;
  `};
  &:hover,
  &:focus {
    background: transparent;
    &:before,
    ${FeaturedImg} {
      background: transparent;
      filter: none;
    }
  }
  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    transition: ${theme.transition};
    background-color: ${colors.navy};
    mix-blend-mode: screen;
  }
`;
const Project = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(12, 1fr);
  align-items: center;
  margin-bottom: 100px;
  ${media.thone`margin-bottom: 70px;`};
  &:last-of-type {
    margin-bottom: 0;
  }
  &:nth-of-type(odd) {
    ${ContentContainer} {
      grid-column: 7 / -1;
      text-align: right;
      ${media.thone`
        grid-column: 1 / -1;
        padding: 40px 40px 30px;
      `};
      ${media.phablet`padding: 30px 25px 20px;`};
    }
    ${TechList} {
      justify-content: flex-end;
      li {
        margin-left: ${theme.margin};
        margin-right: 0;
      }
    }
    ${Links} {
      justify-content: flex-end;
      margin-left: 0;
      margin-right: -10px;
    }
    ${ImgContainer} {
      grid-column: 1 / 8;
      ${media.tablet`height: 100%;`};
      ${media.thone`
        grid-column: 1 / -1;
        opacity: 0.25;
      `};
    }
  }
`;

const Featured = ({ data }) => {
  const revealTitle = useRef(null);
  const revealProjects = useRef([]);
  useEffect(() => {
    sr.reveal(revealTitle.current, srConfig());
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const featuredProjects = data.filter(({ node }) => node.frontmatter.show === 'true');

  return (
    <FeaturedContainer id="projects">
      <Heading ref={revealTitle}>Featured Projects</Heading>

      <div>
        {featuredProjects &&
          featuredProjects.map(({ node }, i) => {
            const { frontmatter, html } = node;
            const { external, title, tech, github, googleplay, appstore, cover } = frontmatter;

            return (
              <Project key={i} ref={el => (revealProjects.current[i] = el)}>
                <ContentContainer>
                  <FeaturedLabel>Featured Project</FeaturedLabel>
                  <ProjectName>
                    {external ? (
                      <ExternalLink url={external} aria-label="External Link">
                        {title}
                      </ExternalLink>
                    ) : (
                      title
                    )}
                  </ProjectName>
                  <ProjectDescription dangerouslySetInnerHTML={{ __html: html }} />
                  {tech && (
                    <TechList>
                      {tech.map((tech, i) => (
                        <li key={i}>{tech}</li>
                      ))}
                    </TechList>
                  )}
                  <Links>
                    {github && (
                      <ExternalLink url={github} aria-label="Github Link">
                        <IconGithub />
                      </ExternalLink>
                    )}
                    {googleplay && (
                      <ExternalLink url={googleplay} aria-label="Google Play Store Link">
                        <IconGooglePlay />
                      </ExternalLink>
                    )}
                    {appstore && (
                      <ExternalLink url={appstore} aria-label="Apple App Store Link">
                        <IconAppStore />
                      </ExternalLink>
                    )}
                    {external && (
                      <ExternalLink url={external} aria-label="External Link">
                        <IconExternal />
                      </ExternalLink>
                    )}
                  </Links>
                </ContentContainer>

                <ImgContainer url={external ? external : github ? github : '#'} aria-label={title}>
                  <FeaturedImg fluid={cover.childImageSharp.fluid} />
                </ImgContainer>
              </Project>
            );
          })}
      </div>
    </FeaturedContainer>
  );
};

Featured.propTypes = {
  data: PropTypes.array.isRequired,
};

export default Featured;
