import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Side } from '@components';
import ExternalLink from './externalLink';
import { email } from '@config';

// ------------------------- STYLED COMPONENTS ------------------------------

const EmailLinkWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  &:after {
    content: '';
    display: block;
    width: 1px;
    height: 90px;
    margin: 0 auto;
    background-color: ${({ theme }) => theme.colors.lightSlate};
  }
`;

const EmailLink = styled(ExternalLink)`
  font-family: ${({ theme }) => theme.fonts.SFMono};
  font-size: ${({ theme }) => theme.fontSizes.xsmall};
  letter-spacing: 0.8px;
  writing-mode: vertical-rl;
  margin: 20px auto;
  padding: 10px;

  &:hover,
  &:focus {
    transform: translateY(-3px);
  }
`;

// ------------------------- COMPONENT ------------------------------

const Email = ({ isHome }) => (
  <Side isHome={isHome} orientation="right">
    <EmailLinkWrapper>
      <EmailLink url={`mailto:${email}`} eventName="Mail" eventType="Hello">
        {email}
      </EmailLink>
    </EmailLinkWrapper>
  </Side>
);

Email.propTypes = {
  isHome: PropTypes.bool,
};

export default Email;
