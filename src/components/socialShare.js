import { useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { IconTwitter, IconCopy, IconFacebook, IconCheckbox } from '@components/icons';
import { theme, media, mixins } from '@styles';
import config from '../config/index';

// ====================== CONSTANTS =============================

const { fontSizes, colors } = theme;

// ===================== STYLED COMPONENTS =======================

const SocialShareContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  ${media.phone`flex-direction: column;`};
  ${media.phablet`flex-direction: column;`};
  ${media.tablet`flex-direction: column;`};
  font-size: ${fontSizes.xxlarge};
`;
const StyledSocialPlatform = styled.button`
  ${mixins.flexCenter};
  background-color: transparent;
  border: none;
  margin: 0 20px 20px 0;
  padding: 0;
  outline: none;
  color: inherit;
  transition: ${theme.transition};
  font-size: ${fontSizes.xlarge};
  &:hover,
  &:focus,
  &:active {
    color: ${colors.green};
  }
  &:after {
    display: none !important;
  }
  svg {
    width: 20px;
    height: 20px;
    margin-right: 6px;
  }
`;
const StyledLink = styled.a`
  ${mixins.flexCenter};
`;
const StyledCopyButton = styled.button`
  background-color: transparent;
  border: none;
  margin: 0 20px 20px 0;
  padding: 0;
  outline: none;
  cursor: pointer;
  transition: ${theme.transition};
  font-size: ${fontSizes.xlarge};
  color: inherit;
  display: flex;
  &:hover,
  &:focus,
  &:active {
    color: ${colors.green};
  }
  &:after {
    display: none !important;
  }
  svg {
    width: 20px;
    height: 20px;
    margin-right: 6px;
  }
`;

// ============================== COMPONENT =========================

const SocialShare = ({
  url = '',
  title = '',
  tags = [],
  showText = false,
  twitter = true,
  copyLink = true,
  facebook = true,
}) => {
  // const [blogTitle, setBlogTitle] = useState(() => title);
  const [copyBtn, setCopyBtn] = useState({ text: 'Copy Link', icon: <IconCopy /> });
  const [socialMediaConfig, setSocialMediaConfig] = useState({});

  // console.log(Object.keys(socialMediaConfig).length);
  useEffect(() => {
    // console.log({ title, tags });
    if (title !== '' && tags !== []) {
      setSocialMediaConfig({
        twitter: {
          username: '_guptaji_',
          text: encodeURIComponent(
            `I recommend reading '${title}' by ${config.twitterHandle}. \n\nRead at - ${url}\n\n`,
          ),
          tags: tags.toString(),
        },
      });
    }
  }, [title, tags]);

  useEffect(() => {
    const timer = setTimeout(() => setCopyBtn({ text: 'Copy Link', icon: <IconCopy /> }), 1500);

    return () => clearTimeout(timer);
  }, [copyBtn]);

  if (Object.keys(socialMediaConfig).length === 0) {
    return null;
  }

  const copyLinkToClipBoard = async link => {
    try {
      await navigator.clipboard.writeText(link);
      setCopyBtn({ text: 'Copied!', icon: <IconCheckbox /> });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SocialShareContainer>
      {twitter && (
        <StyledSocialPlatform>
          <StyledLink
            href={`https://twitter.com/intent/tweet?text=${socialMediaConfig.twitter.text}&hashtags=${socialMediaConfig.twitter.tags}`}
            target="_blank"
            rel="noreferrer">
            <IconTwitter />
            {showText && <div>Share to Twitter</div>}
          </StyledLink>
        </StyledSocialPlatform>
      )}
      {copyLink && (
        <StyledCopyButton onClick={() => copyLinkToClipBoard(url)}>
          {copyBtn.icon}
          {showText && <div>{copyBtn.text}</div>}
        </StyledCopyButton>
      )}
      {facebook && (
        <StyledSocialPlatform>
          <StyledLink
            href={`https://www.facebook.com/dialog/share?app_id=${process.env.GATSBY_FACEBOOK_APP_ID}&display=popup&href=${url}&redirect_uri=${url}`}
            target="_blank"
            rel="noreferrer">
            <IconFacebook />
            {showText && <div>Share to Facebook</div>}
          </StyledLink>
        </StyledSocialPlatform>
      )}
    </SocialShareContainer>
  );
};

export default SocialShare;

SocialShare.propTypes = {
  showText: PropTypes.bool,
  twitter: PropTypes.bool,
  copyLink: PropTypes.bool,
  facebook: PropTypes.bool,
  url: PropTypes.string,
  title: PropTypes.string,
  tags: PropTypes.array,
};
