import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { graphql, useStaticQuery } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

import sr from '@utils/sr';
import { srConfig } from '@config';
import { IconAppStore, IconExternal, IconGithub, IconGooglePlay } from '@components/icons';
import ExternalLink from '@components/externalLink';
import { usePrefersReducedMotion } from '@hooks';
import { Heading, mixins, theme } from '@styles';

// ================================== CONSTANTS =====================================

const { colors, fontSizes, fonts } = theme;

// ================================== STYLED COMPONENTS =====================================

const StyledProjectsGrid = styled.ul`
  ${mixins.resetList};
  a {
    position: relative;
    z-index: 1;
  }
`;

const StyledProject = styled.li`
  position: relative;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(12, 1fr);
  align-items: center;
  @media (max-width: 768px) {
    ${mixins.boxShadow};
  }
  &:not(:last-of-type) {
    margin-bottom: 100px;
    @media (max-width: 768px) {
      margin-bottom: 70px;
    }
    @media (max-width: 480px) {
      margin-bottom: 30px;
    }
  }
  &:nth-of-type(odd) {
    .project-content {
      grid-column: 7 / -1;
      text-align: right;
      @media (max-width: 1080px) {
        grid-column: 5 / -1;
      }
      @media (max-width: 768px) {
        grid-column: 1 / -1;
        padding: 40px 40px 30px;
        text-align: left;
      }
      @media (max-width: 480px) {
        padding: 25px 25px 20px;
      }
    }
    .project-tech-list {
      justify-content: flex-end;
      @media (max-width: 768px) {
        justify-content: flex-start;
      }
      li {
        margin: 0 0 5px 20px;
        @media (max-width: 768px) {
          margin: 0 10px 5px 0;
        }
      }
    }
    .project-links {
      justify-content: flex-end;
      margin-left: 0;
      margin-right: -10px;
      @media (max-width: 768px) {
        justify-content: flex-start;
        margin-left: -10px;
        margin-right: 0;
      }
    }
    .project-image {
      grid-column: 1 / 8;
      @media (max-width: 768px) {
        grid-column: 1 / -1;
      }
    }
  }
  .project-content {
    position: relative;
    grid-column: 1 / 7;
    grid-row: 1 / -1;
    @media (max-width: 1080px) {
      grid-column: 1 / 9;
    }
    @media (max-width: 768px) {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      grid-column: 1 / -1;
      padding: 40px 40px 30px;
      z-index: 5;
    }
    @media (max-width: 480px) {
      padding: 30px 25px 20px;
    }
  }
  .project-overline {
    margin: 10px 0;
    color: ${colors.green};
    font-family: ${fonts.SFMono};
    font-size: ${fontSizes.xsmall};
    font-weight: 400;
  }
  .project-title {
    color: ${colors.lightestSlate};
    font-size: clamp(24px, 5vw, 28px);
    @media (min-width: 768px) {
      margin: 0 0 20px;
    }
    @media (max-width: 768px) {
      color: ${colors.white};
      a {
        position: static;
        &:before {
          content: '';
          display: block;
          position: absolute;
          z-index: 0;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
      }
    }
  }
  .project-description {
    ${mixins.boxShadow};
    position: relative;
    z-index: 2;
    padding: 25px;
    border-radius: ${theme.borderRadius};
    background-color: ${colors.lightNavy};
    color: ${colors.lightSlate};
    font-size: ${fontSizes.large};
    @media (max-width: 768px) {
      padding: 20px 0;
      background-color: transparent;
      box-shadow: none;
      &:hover {
        box-shadow: none;
      }
    }
    a {
      ${mixins.inlineLink};
    }
  }
  .project-tech-list {
    display: flex;
    flex-wrap: wrap;
    position: relative;
    z-index: 2;
    margin: 25px 0 10px;
    padding: 0;
    list-style: none;
    li {
      margin: 0 20px 5px 0;
      color: ${colors.lightSlate};
      font-family: ${fonts.SFMono};
      font-size: ${fontSizes.xsmall};
      white-space: nowrap;
    }
    @media (max-width: 768px) {
      margin: 10px 0;
      li {
        margin: 0 10px 5px 0;
        color: ${colors.lightestSlate};
      }
    }
  }
  .project-links {
    display: flex;
    align-items: center;
    position: relative;
    margin-top: 10px;
    margin-left: -10px;
    color: ${colors.lightestSlate};
    a {
      ${mixins.flexCenter};
      padding: 10px;
      &.external {
        svg {
          width: 22px;
          height: 22px;
          margin-top: -4px;
        }
      }
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
  .project-image {
    ${mixins.boxShadow};
    grid-column: 6 / -1;
    grid-row: 1 / -1;
    position: relative;
    z-index: 1;
    @media (max-width: 768px) {
      grid-column: 1 / -1;
      height: 100%;
      opacity: 0.25;
    }
    a {
      width: 100%;
      height: 100%;
      background-color: ${colors.green};
      border-radius: ${theme.borderRadius};
      vertical-align: middle;
      &:hover,
      &:focus {
        background: transparent;
        outline: 0;
        &:before,
        .img {
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
    }
    .img {
      border-radius: ${theme.borderRadius};
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1) brightness(90%);
      @media (max-width: 768px) {
        object-fit: cover;
        width: auto;
        height: 100%;
        filter: grayscale(100%) contrast(1) brightness(80%);
      }
    }
  }
`;

// ================================== COMPONENT =====================================

const Featured = () => {
  const data = useStaticQuery(graphql`
    {
      featured: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/featured/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              title
              cover {
                childImageSharp {
                  gatsbyImageData(
                    width: 700
                    layout: FULL_WIDTH
                    placeholder: BLURRED
                    formats: [AUTO, WEBP, AVIF]
                  )
                }
              }
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

  const featuredProjects = data.featured.edges.filter(
    ({ node }) => node.frontmatter.show === 'true',
  );

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

  return (
    <section id="projects">
      <Heading ref={revealTitle}>Featured Projects</Heading>

      <StyledProjectsGrid>
        {featuredProjects &&
          featuredProjects.map(({ node }, i) => {
            const { frontmatter, html } = node;
            const { external, title, tech, github, googleplay, appstore, cover } = frontmatter;
            const image = getImage(cover);

            return (
              <StyledProject key={i} ref={el => (revealProjects.current[i] = el)}>
                <div className="project-content">
                  <div>
                    <p className="project-overline">Featured Project</p>

                    <h3 className="project-title">
                      {external ? (
                        <ExternalLink url={external} aria-label="External Link">
                          {title}
                        </ExternalLink>
                      ) : (
                        title
                      )}
                    </h3>

                    <div
                      className="project-description"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />

                    {tech.length && (
                      <ul className="project-tech-list">
                        {tech.map((tech, i) => (
                          <li key={i}>{tech}</li>
                        ))}
                      </ul>
                    )}

                    <div className="project-links">
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
                    </div>
                  </div>
                </div>

                <div className="project-image">
                  <a href={external ? external : github ? github : '#'}>
                    <GatsbyImage image={image} alt={title} className="img" />
                  </a>
                </div>
              </StyledProject>
            );
          })}
      </StyledProjectsGrid>
    </section>
  );
};

export default Featured;
