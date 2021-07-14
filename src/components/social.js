import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { socialMedia } from '@config';
import { FormattedIcon } from '@components/icons';
import { Side, ExternalLink } from '@components';
import { theme } from '@styles';

// -------------------------------- CONSTANTS ------------------------

const { colors } = theme;

// -------------------------------- STYLED COMPONENTS ------------------------

const SocialItemList = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: center;
  &:after {
    content: '';
    display: block;
    width: 1px;
    height: 90px;
    margin: 0 auto;
    background-color: ${colors.lightSlate};
  }
`;

const SocialItem = styled.li`
  &:last-of-type {
    margin-bottom: 20px;
  }
`;

const SocialLink = styled(ExternalLink)`
  padding: 10px;
  &:hover,
  &:focus {
    transform: translateY(-3px);
  }
  svg {
    width: 18px;
    height: 18px;
  }
`;

// -------------------------------- COMPONENT ------------------------

const Social = ({ isHome }) => (
  <Side isHome={isHome} orientation="left">
    <SocialItemList>
      {socialMedia &&
          socialMedia.map(({ url, name }, i) => (
            <SocialItem key={i}>
              <SocialLink url={url} aria-label={name} eventType={name}>
                <FormattedIcon name={name} />
              </SocialLink>
            </SocialItem>
          ))}
    </SocialItemList>
  </Side>
);

Social.propTypes = {
  isHome: PropTypes.bool,
};

export default Social;
