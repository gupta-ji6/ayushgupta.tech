import React, { useEffect, useRef, useState } from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { sample } from 'lodash';
import styled from 'styled-components';

import sr from '@utils/sr';
import { srConfig } from '@config';
import { theme, mixins, media, Section, Heading } from '@styles';
import { usePrefersReducedMotion } from '@hooks';

// ------------------------------ CONSTANTS --------------------------------

const { colors } = theme;

// ------------------------------ STYLED COMPONENTS --------------------------------

const FunFactsContainer = styled(Section)`
  position: relative;
`;

const FlexContainer = styled.div`
  ${mixins.flexBetween};
  flex-direction: column;
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

  strong {
    color: ${colors.green};
    font-weight: 400;
  }
`;

const ShuffleButton = styled.button`
  ${mixins.bigButton};
  margin-bottom: 44px;
`;

// ------------------------------ COMPONENT --------------------------------

const FunFacts = () => {
  const data = useStaticQuery(graphql`
    {
      funFacts: allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/funFacts/" } }) {
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

  const { funFacts } = data;

  const allFunFactsHTML = funFacts.edges.map(edge => edge.node.html);

  const [singleRandomFunFactHTML, setSingleRandomFunFactHTML] = useState(sample(allFunFactsHTML));
  const revealContainer = useRef(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const shuffleFunFacts = () => {
    setSingleRandomFunFactHTML(sample(allFunFactsHTML));
  };

  return (
    <FunFactsContainer id="about" ref={revealContainer}>
      <Heading>Fun Facts</Heading>
      <FlexContainer>
        <ShuffleButton onClick={shuffleFunFacts}>Shuffle</ShuffleButton>
        <ContentContainer>
          <div
            dangerouslySetInnerHTML={{ __html: singleRandomFunFactHTML }}
            className="animate slide"
          />
        </ContentContainer>
      </FlexContainer>
    </FunFactsContainer>
  );
};

export default FunFacts;
