import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { graphql, useStaticQuery } from 'gatsby';

import { Button, Section, media, mixins, theme } from '@styles';
import {
  IconExternal,
  IconFolder,
  IconGithub,
  IconGooglePlay,
  IconAppStore,
} from '@components/icons';
import sr from '@utils/sr';
import { srConfig } from '@config';
import { usePrefersReducedMotion } from '@hooks';
import ExternalLink from '../externalLink';

// ================================== CONSTANTS =====================================

const { colors, fontSizes, fonts } = theme;

// ================================== STYLED COMPONENTS =====================================

const ProjectsContainer = styled(Section)`
  ${mixins.flexCenter};
  flex-direction: column;
  align-items: stretch;
`;

const ProjectsTitle = styled.h4`
  margin: 0 auto 50px;
  font-size: ${fontSizes.h3};
  ${media.tablet`font-size: 24px;`};
  a {
    display: block;
  }
`;

const ProjectsGrid = styled.div`
  .projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    grid-gap: 15px;
    position: relative;
    ${media.desktop`grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));`};
  }
`;

const ProjectInner = styled.div`
  ${mixins.boxShadow};
  ${mixins.flexBetween};
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  padding: 2rem 1.75rem;
  height: 100%;
  border-radius: ${theme.borderRadius};
  transition: ${theme.transition};
  background-color: ${colors.lightNavy};
`;

const Project = styled.div`
  transition: ${theme.transition};
  cursor: default;
  &:hover,
  &:focus {
    outline: 0;
    ${ProjectInner} {
      transform: translateY(-5px);
    }
  }
`;

const ProjectHeader = styled.div`
  ${mixins.flexBetween};
  margin-bottom: 30px;
`;

const Folder = styled.div`
  color: ${colors.green};
  svg {
    width: 40px;
    height: 40px;
  }
`;

const Links = styled.div`
  margin-right: -10px;
  color: ${colors.lightSlate};
`;

const IconLink = styled(ExternalLink)`
  position: relative;
  top: -10px;
  padding: 10px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ProjectName = styled.h5`
  margin: 0 0 10px;
  font-size: ${fontSizes.xxlarge};
  color: ${colors.lightestSlate};
`;

const ProjectDescription = styled.div`
  font-size: 17px;
  a {
    ${mixins.inlineLink};
  }
`;

const TechList = styled.ul`
  flex-grow: 1;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-top: 20px;
  li {
    font-family: ${fonts.SFMono};
    font-size: ${fontSizes.xsmall};
    color: ${colors.lightSlate};
    line-height: 1.75;
    margin-right: 15px;
    &:last-of-type {
      margin-right: 0;
    }
  }
`;

const ShowMoreButton = styled(Button)`
  margin: 100px auto 0;
`;

// ================================== COMPONENT =====================================

const Projects = () => {
  const data = useStaticQuery(graphql`
    {
      projects: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/projects/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              image
              tech
              github
              external
              googleplay
              appstore
              show
            }
            html
          }
        }
      }
    }
  `);

  const [showMore, setShowMore] = useState(false);

  const revealTitle = useRef(null);
  const revealProjects = useRef([]);

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    revealProjects.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const GRID_LIMIT = 4;
  const projects = data.projects.edges.filter(({ node }) => node.frontmatter.show === 'true');
  const firstSix = projects.slice(0, GRID_LIMIT);
  const projectsToShow = showMore ? projects : firstSix;

  const onShowMoreClick = e => {
    e.preventDefault();
    setShowMore(!showMore);
  };

  return (
    <ProjectsContainer>
      <ProjectsTitle ref={revealTitle}>Other Noteworthy Projects</ProjectsTitle>
      <ProjectsGrid>
        <TransitionGroup className="projects">
          {projects &&
            projectsToShow.map(({ node }, i) => {
              const { frontmatter, html } = node;
              const { github, external, title, tech, googleplay, appstore } = frontmatter;
              return (
                <CSSTransition
                  key={i}
                  classNames="fadeup"
                  timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                  exit={false}>
                  <Project
                    key={i}
                    ref={el => (revealProjects.current[i] = el)}
                    tabIndex="0"
                    style={{
                      transitionDelay: `${i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0}ms`,
                    }}>
                    <ProjectInner>
                      <header>
                        <ProjectHeader>
                          <Folder>
                            <IconFolder />
                          </Folder>
                          <Links>
                            {github && (
                              <IconLink url={github} aria-label="Github Link">
                                <IconGithub />
                              </IconLink>
                            )}
                            {googleplay && (
                              <IconLink url={googleplay} aria-label="Google Play Store Link">
                                <IconGooglePlay />
                              </IconLink>
                            )}
                            {appstore && (
                              <IconLink url={appstore} aria-label="Apple App Store Link">
                                <IconAppStore />
                              </IconLink>
                            )}
                            {external && (
                              <IconLink url={external} aria-label="External Link">
                                <IconExternal />
                              </IconLink>
                            )}
                          </Links>
                        </ProjectHeader>
                        <ProjectName>{title}</ProjectName>
                        <ProjectDescription dangerouslySetInnerHTML={{ __html: html }} />
                      </header>
                      <footer>
                        <TechList>
                          {tech.map((tech, i) => (
                            <li key={i}>{tech}</li>
                          ))}
                        </TechList>
                      </footer>
                    </ProjectInner>
                  </Project>
                </CSSTransition>
              );
            })}
        </TransitionGroup>
      </ProjectsGrid>

      <ShowMoreButton
        onClick={e => onShowMoreClick(e)}
        data-splitbee-event="Show Projects"
        data-splitbee-event-type={showMore ? 'Fewer' : 'More'}>
        {`Show ${showMore ? 'Fewer' : 'More'} Projects`}
      </ShowMoreButton>
    </ProjectsContainer>
  );
};

export default Projects;
