import React, { useState, useEffect, Fragment } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { graphql, useStaticQuery } from 'gatsby';
import styled from 'styled-components';

// import { email } from '@config';
import { theme, mixins, media, Section } from '@styles';
import { navDelay, loaderDelay } from '@config';
import { useNowPlayingTrack, usePrefersReducedMotion } from '@hooks';
import { NowPlayingContext } from '../now-palying';
import ExternalLink from '../externalLink';

// --------------------------- CONSTANTS -----------------------------------

const { colors, fontSizes, fonts } = theme;

// --------------------------- STYLED COMPONENTS -----------------------------------

const HeroContainer = styled(Section)`
  ${mixins.flexCenter};
  flex-direction: column;
  align-items: flex-start;
  min-height: 100vh;
  ${media.tablet`padding-top: 150px;`};
  div {
    width: 100%;
  }
`;

const Hi = styled.h1`
  color: ${colors.green};
  margin: 0 0 20px 3px;
  font-size: ${fontSizes.medium};
  font-family: ${fonts.SFMono};
  font-weight: normal;
  ${media.desktop`font-size: ${fontSizes.small};`};
  ${media.tablet`font-size: ${fontSizes.smallish};`};
`;

const Name = styled.h2`
  font-size: 80px;
  line-height: 1.1;
  margin: 0;
  ${media.desktop`font-size: 70px;`};
  ${media.tablet`font-size: 60px;`};
  ${media.phablet`font-size: 50px;`};
  ${media.phone`font-size: 40px;`};
`;

const Subtitle = styled.h3`
  font-size: 70px;
  line-height: 1.1;
  color: ${colors.slate};
  ${media.desktop`font-size: 60px;`};
  ${media.tablet`font-size: 50px;`};
  ${media.phablet`font-size: 40px;`};
  ${media.phone`font-size: 30px;`};
`;

const Blurb = styled.div`
  margin-top: 25px;
  width: 50%;
  max-width: 500px;
  a {
    ${mixins.inlineLink};
  }
`;

const NowPlayingTrack = styled.div`
  width: 50%;
  max-width: 500px;
  a {
    ${mixins.inlineLink};
  }
`;

const TrackCopy = styled.span`
  &:first-letter {
    text-transform: uppercase;
  }
`;

// const ResumeLink = styled.a`
//   ${mixins.bigButton};
//   padding: 18px 50px;
//   margin: 10% auto 0;
//   width: max-content;
// `;

const EmailLink = styled(ExternalLink)`
  ${mixins.bigButton};
  margin-top: 50px;
`;

// --------------------------- COMPONENT -----------------------------------

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { nowPlayingTrack, isAyushListeningToAnything } = useNowPlayingTrack();

  const trackCopy =
    NowPlayingContext.playing[Math.floor(Math.random() * NowPlayingContext.playing.length)].copy;

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, navDelay);

    return () => clearTimeout(timeout);
  }, []);

  const data = useStaticQuery(graphql`
    {
      hero: allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/hero/" } }) {
        edges {
          node {
            frontmatter {
              title
              name
              subtitle
              contactText
            }
            html
          }
        }
      }
    }
  `);

  const { hero } = data;
  const { frontmatter, html } = hero.edges[0].node;
  const { title, name, subtitle, contactText } = frontmatter;

  const one = () => <Hi>{title}</Hi>;

  const two = () => <Name>{name}</Name>;

  const three = () => <Subtitle>{subtitle}</Subtitle>;

  const four = () => <Blurb dangerouslySetInnerHTML={{ __html: html }} />;

  const five = () =>
    isAyushListeningToAnything ? (
      <NowPlayingTrack>
        <TrackCopy>{`${trackCopy} `}</TrackCopy>
        <ExternalLink
          url={nowPlayingTrack.external_urls.spotify}
          eventName="Spotify"
          eventType="Open Spotify Link">
          {nowPlayingTrack.name}
        </ExternalLink>
        <span>{` at the moment.`}</span>
      </NowPlayingTrack>
    ) : null;

  const six = () => (
    <div>
      {/* <ResumeLink href="/resume.pdf" target="_blank" rel="nofollow noopener noreferrer">
        View Resume
      </ResumeLink> */}
      <EmailLink url="mailto:hire@ayushgupta.tech" eventName="Hire Me">
        Hire Me{' '}
        {/* <span role="img" aria-label="man technologist">
          👨🏻‍💻
        </span> */}
      </EmailLink>
    </div>
  );

  const items = [one, two, three, four, five, six];

  return (
    <HeroContainer>
      {prefersReducedMotion ? (
        <Fragment>
          {items.map((Item, i) => {
            return (
              <div key={i}>
                <Item />
              </div>
            );
          })}
        </Fragment>
      ) : (
        <TransitionGroup component={null}>
          {isMounted &&
            items.map((Item, i) => {
              return (
                <CSSTransition key={i} classNames="fadeup" timeout={loaderDelay}>
                  <div style={{ transitionDelay: `${i + 1}00ms` }}>
                    <Item />
                  </div>
                </CSSTransition>
              );
            })}
        </TransitionGroup>
      )}
    </HeroContainer>
  );
};

export default Hero;
