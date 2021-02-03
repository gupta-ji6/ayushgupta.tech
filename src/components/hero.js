import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
// import { email } from '@config';
import styled from 'styled-components';
import { theme, mixins, media, Section } from '@styles';
import { fetchCurrentTrack } from '../utils/spotify';
const { colors, fontSizes, fonts } = theme;
import { NowPlayingContext } from './now-palying';
import ExternalLink from './externalLink';

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

const Hero = ({ data }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [track, setTrack] = useState({});

  const trackCopy =
    NowPlayingContext.playing[Math.floor(Math.random() * NowPlayingContext.playing.length)].copy;

  // fetch the current playing track, if any
  const fetchNowPlaying = async () => {
    const trackData = await fetchCurrentTrack();
    // console.log(trackData);
    if (trackData !== undefined) {
      setTrack(trackData);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMounted(true);
      fetchNowPlaying();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const { frontmatter, html } = data[0].node;

  const one = () => <Hi style={{ transitionDelay: '100ms' }}>{frontmatter.title}</Hi>;

  const two = () => <Name style={{ transitionDelay: '200ms' }}>{frontmatter.name}</Name>;

  const three = () => (
    <Subtitle style={{ transitionDelay: '300ms' }}>{frontmatter.subtitle}</Subtitle>
  );

  const four = () => (
    <Blurb style={{ transitionDelay: '400ms' }} dangerouslySetInnerHTML={{ __html: html }} />
  );

  const five = () =>
    Object.keys(track).length !== 0 ? (
      <NowPlayingTrack style={{ transitionDelay: '500ms' }}>
        <TrackCopy>{`${trackCopy} `}</TrackCopy>
        <ExternalLink url={track.external_urls.spotify}>{track.name}</ExternalLink>
        <span>{` at the moment.`}</span>
      </NowPlayingTrack>
    ) : null;

  const six = () => (
    <div style={{ transitionDelay: '600ms' }}>
      {/* <ResumeLink href="/resume.pdf" target="_blank" rel="nofollow noopener noreferrer">
        View Resume
      </ResumeLink> */}
      <EmailLink url="mailto:hire@ayushgupta.tech" data-splitbee-event="Hire Me">
        Hire Me {/* <span role="img" aria-label="man technologist">
          👨🏻‍💻
        </span> */}
      </EmailLink>
    </div>
  );

  const items = [one, two, three, four, five, six];

  return (
    <HeroContainer>
      <TransitionGroup>
        {isMounted &&
          items.map((item, i) => (
            <CSSTransition key={i} classNames="fadeup" timeout={3000}>
              {item}
            </CSSTransition>
          ))}
      </TransitionGroup>
    </HeroContainer>
  );
};

Hero.propTypes = {
  data: PropTypes.array.isRequired,
};

export default Hero;
