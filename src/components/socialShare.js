import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { IconTwitter, IconCopy, IconFacebook, IconCheckbox, IconShare } from '@components/icons';
import { theme, media, mixins } from '@styles';
import config from '../config/index';
import toast from 'react-hot-toast';

// ====================== CONSTANTS =============================

const { fontSizes, colors } = theme;
const eventName = 'Share';

// ===================== STYLED COMPONENTS =======================

const SocialShareContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  ${media.phone`flex-direction: ${props => (props.showText ? 'column' : 'row')};`};
  ${media.phablet`flex-direction: ${props => (props.showText ? 'column' : 'row')};`};
  ${media.tablet`flex-direction: ${props => (props.showText ? 'column' : 'row')};`};
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
  // share = false,
}) => {
  // const [blogTitle, setBlogTitle] = useState(() => title);
  const [copyBtn, setCopyBtn] = useState({ text: 'Copy Link', icon: <IconCopy /> });
  const [socialMediaConfig, setSocialMediaConfig] = useState({});
  const [showShareBtn, setShowShareBtn] = useState(false);

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

  useEffect(() => {
    if (navigator.share) {
      setShowShareBtn(true);
    } else {
      setShowShareBtn(false);
    }
  }, []);

  if (Object.keys(socialMediaConfig).length === 0) {
    return null;
  }

  const copyLinkToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyBtn({ text: 'Copy Link', icon: <IconCheckbox /> });
      toast.success('Copied to clipboard!');
    } catch (error) {
      console.error(error);
    }
  };

  const shareExternal = async () => {
    if (navigator.share) {
      // Web Share API is supported
      setShowShareBtn(true);
      const shareData = { title, url };
      navigator
        .share(shareData)
        .then(() => {
          // console.log('Thanks for sharing!');
        })
        .catch(console.error);
    } else {
      // Fallback
      setShowShareBtn(false);
    }
  };

  return (
    <SocialShareContainer>
      {twitter && (
        <StyledSocialPlatform>
          <StyledLink
            href={`https://twitter.com/intent/tweet?text=${socialMediaConfig.twitter.text}&hashtags=${socialMediaConfig.twitter.tags}`}
            target="_blank"
            rel="noreferrer"
            data-splitbee-event={eventName}
            data-splitbee-event-type={'Twitter'}>
            <IconTwitter />
            {showText && <div>Share to Twitter</div>}
          </StyledLink>
        </StyledSocialPlatform>
      )}
      {copyLink && (
        <StyledCopyButton
          onClick={() => copyLinkToClipBoard()}
          data-splitbee-event={eventName}
          data-splitbee-event-type={'Copy To Clipboard'}>
          {copyBtn.icon}
          {showText && <div>{copyBtn.text}</div>}
        </StyledCopyButton>
      )}
      {facebook && (
        <StyledSocialPlatform>
          <StyledLink
            href={`https://www.facebook.com/dialog/share?app_id=${process.env.GATSBY_FACEBOOK_APP_ID}&display=popup&href=${url}&redirect_uri=${url}`}
            target="_blank"
            rel="noreferrer"
            data-splitbee-event={eventName}
            data-splitbee-event-type={'Facebook'}>
            <IconFacebook />
            {showText && <div>Share to Facebook</div>}
          </StyledLink>
        </StyledSocialPlatform>
      )}
      {showShareBtn && (
        <StyledCopyButton
          onClick={() => shareExternal()}
          data-splitbee-event={eventName}
          data-splitbee-event-type={'External'}>
          <IconShare />
          {showText && <div>Share</div>}
        </StyledCopyButton>
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
  share: PropTypes.bool,
  url: PropTypes.string,
  title: PropTypes.string,
  tags: PropTypes.array,
};
