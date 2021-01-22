import styled from 'styled-components';
import PropTypes from 'prop-types';
import { IconTwitter, IconCopy, IconFacebook } from '@components/icons';
import { theme, media } from '@styles';

const { fontSizes } = theme;

const SocialShareContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  ${media.phone`flex-direction: column;`};
  font-size: ${fontSizes.xxlarge};
`;
const StyledSocialPlatform = styled.div`
  margin-right: 20px;
  margin-bottom: 20px;
  svg {
    width: 20px;
    height: 20px;
    margin-right: 6px;
  }
`;

const SocialShare = ({ showText = false, twitter = true, copyLink = true, facebook = true }) => (
  <SocialShareContainer>
    {twitter && (
      <StyledSocialPlatform>
        <a href="https://twitter.com" target="_blank" rel="noreferrer">
          <IconTwitter />
          {showText && <span>Share to Twitter</span>}
        </a>
      </StyledSocialPlatform>
    )}
    {copyLink && (
      <StyledSocialPlatform>
        <a href="https://twitter.com" target="_blank" rel="noreferrer">
          <IconCopy />
          {showText && <span>Copy Link</span>}
        </a>
      </StyledSocialPlatform>
    )}
    {facebook && (
      <StyledSocialPlatform>
        <a href="https://twitter.com" target="_blank" rel="noreferrer">
          <IconFacebook />
          {showText && <span>Share to Facebook</span>}
        </a>
      </StyledSocialPlatform>
    )}
  </SocialShareContainer>
);

export default SocialShare;

SocialShare.propTypes = {
  showText: PropTypes.bool,
  twitter: PropTypes.bool,
  copyLink: PropTypes.bool,
  facebook: PropTypes.bool,
};
