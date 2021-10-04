import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { graphql, useStaticQuery } from 'gatsby';

import sr from '@utils/sr';
import { srConfig } from '@config';
import { media, Section, Heading } from '@styles';
import { usePrefersReducedMotion } from '@hooks';
import ExternalLink from '../externalLink';

// ================================== STYLED COMPONENTS =====================================

const ContactContainer = styled(Section)`
  text-align: center;
  max-width: 600px;
  margin: 0 auto 100px;
  a {
    ${({ theme }) => theme.mixins.inlineLink};
  }
`;

const GreenHeading = styled(Heading)`
  display: block;
  color: ${({ theme }) => theme.colors.green};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-family: ${({ theme }) => theme.fonts.SFMono};
  font-weight: 400;
  margin-bottom: 20px;
  justify-content: center;
  ${media.desktop`font-size: ${({ theme }) => theme.fontSizes.small};`};
  &:before {
    bottom: 0;
    font-size: ${({ theme }) => theme.fontSizes.small};
    ${media.desktop`font-size: ${({ theme }) => theme.fontSizes.smallish};`};
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
  ${({ theme }) => theme.mixins.bigButton};
  margin-top: 50px;
`;

// ================================== COMPONENT =====================================

const Contact = () => {
  const data = useStaticQuery(graphql`
    {
      contact: allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/contact/" } }) {
        edges {
          node {
            frontmatter {
              title
            }
            html
          }
        }
      }
    }
  `);

  const { contact } = data;
  const { frontmatter, html } = contact.edges[0].node;
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

export default Contact;
