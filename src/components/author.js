import styled from 'styled-components';
import PropTypes from 'prop-types';
import { theme, media, mixins } from '@styles';

const { colors } = theme;

// ======================= STYLED COMPONENTS ========================

const StyledAuthorContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
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

const StyledAuthorImg = styled.img`
  border-radius: ${theme.borderRadius};
  ${props => props.showBg && `border-radius: 50%;`}
  width: 6.5rem;
  height: 6.5rem;
  background-color: ${colors.lightNavy};
  padding: 4px;
  object-fit: cover;
  border: 1px solid ${colors.green};
  margin-right: 1rem;
  margin-bottom: 0;
  ${media.tablet`margin-bottom: 1rem;`}
  ${media.phone`margin-bottom: 1rem;`}
`;

const StyledAuthorDescription = styled.div`
  color: ${colors.slate};
  /* ${props => !props.showBg && 'text-align: center;'}; */
`;

// ======================= COMPONENT ========================

const Author = ({ showBg = false }) => (
  <StyledAuthorContainer showBg={showBg}>
    <StyledAuthorImg
      width="6rem"
      height="6rem"
      src="https://github.com/gupta-ji6.png"
      loading="lazy"
    />
    <StyledAuthorDescription>
      <strong>{`Ayush Gupta `}</strong>
      <span>
        is a Web & Mobile Application Developer who is passionate about photography, writes blogs
        and occasionaly designs. Currently working as a React & React Native Developer at FirstCry.
        Fondly known as GuptaJi.
      </span>
    </StyledAuthorDescription>
  </StyledAuthorContainer>
);

export default Author;

Author.propTypes = {
  showBg: PropTypes.bool,
};
