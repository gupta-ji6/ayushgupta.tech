import React from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { theme, media, mixins } from '@styles';

// ======================= CONSTANTS ========================

const { colors } = theme;

// ======================= STYLED COMPONENTS ========================

const StyledAuthorContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  /* flex-wrap: wrap; */
  ${media.desktop`flex-direction: row;`}
  ${media.tablet`flex-direction: column;`}
  ${media.phone`flex-direction: column;`}
  ${props =>
    props.showBg &&
    `background-color: ${colors.lightNavy};
    box-shadow: ${mixins.boxShadow};
    border-radius: ${theme.borderRadius};
    margin-top: 2rem;
    padding: 1.5rem;
    align-items: center;`}
`;

const StyledAuthorDescription = styled.div`
  color: ${colors.slate};
  flex: 0.9;
  /* ${props => !props.showBg && 'text-align: center;'}; */
`;

const AuthorImgContainer = styled.div`
  width: 20vw;

  .img {
    border-radius: ${theme.borderRadius};
    ${props => props.showBg && `border-radius: 50%;`}
    background-color: ${colors.lightNavy};
    padding: 4px;
    object-fit: cover;
    border: 0.15rem solid ${colors.green};
    margin-right: 1rem;
    margin-bottom: 1rem;
  }
`;

// ======================= COMPONENT ========================

const Author = ({ showBg = false }) => {
  return (
    <StyledAuthorContainer showBg={showBg}>
      <AuthorImgContainer style={{ width: '20vh' }}>
        <StaticImage
          className="img"
          src="../../content/about/ayush.jpg"
          width={400}
          quality={95}
          alt="Ayush Gupta's Picture"
        />
      </AuthorImgContainer>
      <StyledAuthorDescription>
        <strong>{`Ayush Gupta `}</strong>
        <span>
          is a Web & Mobile Application Developer who is passionate about photography, writes blogs
          and occasionaly designs. Currently working as a React & React Native Developer at
          FirstCry. Fondly known as GuptaJi.
        </span>
      </StyledAuthorDescription>
    </StyledAuthorContainer>
  );
};

Author.propTypes = {
  showBg: PropTypes.bool,
};

export default Author;
