import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import sr from '@utils/sr';
import { srConfig } from '@config';
import { theme, mixins, media, Section, Heading } from '@styles';
import { usePrefersReducedMotion } from '@hooks';
import ExternalLink from './externalLink';

// ================================== CONSTANTS =====================================

const { colors, fontSizes, fonts } = theme;

// ================================== STYLED COMPONENTS =====================================

const ContactContainer = styled(Section)`
  text-align: center;
  max-width: 600px;
  margin: 0 auto 100px;
  a {
    ${mixins.inlineLink};
  }
`;
const GreenHeading = styled(Heading)`
  display: block;
  color: ${colors.green};
  font-size: ${fontSizes.medium};
  font-family: ${fonts.SFMono};
  font-weight: normal;
  margin-bottom: 20px;
  justify-content: center;
  ${media.desktop`font-size: ${fontSizes.small};`};
  &:before {
    bottom: 0;
    font-size: ${fontSizes.small};
    ${media.desktop`font-size: ${fontSizes.smallish};`};
  }
  &:after {
    display: none;
  }
`;
const Title = styled.h4`
  margin: 0 0 20px;
  font-size: 60px;
  ${media.desktop`font-size: 50px;`};
  ${media.tablet`font-size: 40px;`};
`;
const EmailLink = styled(ExternalLink)`
  ${mixins.bigButton};
  margin-top: 50px;
`;

// ================================== COMPONENT =====================================

const Contact = ({ data }) => {
  const { frontmatter, html } = data[0].node;
  const { title } = frontmatter;
  const revealContainer = useRef(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  return (
    <ContactContainer id="contact" ref={revealContainer}>
      <GreenHeading>What&apos;s Next?</GreenHeading>

      <Title>{title}</Title>

      <div dangerouslySetInnerHTML={{ __html: html }} />

      <EmailLink url="mailto:hello@ayushgupta.tech" eventName="Mail" eventType="Hello">
        Say Hello{' '}
        <span role="img" aria-label="wave">
          👋🏻
        </span>
      </EmailLink>
    </ContactContainer>
  );
};

Contact.propTypes = {
  data: PropTypes.array.isRequired,
};

export default Contact;
