import React from 'react';
import styled from 'styled-components';
import { theme, mixins } from '@styles';
import PropTypes from 'prop-types';

const { colors, fontSizes } = theme;

// ============================= STYLED COMPONENTS ================================

const StyledDetailsContainer = styled.div`
  a {
    ${mixins.inlineLink};
  }

  details[open] {
    background-color: ${colors.lightNavy};
    border-radius: ${theme.borderRadius};
    box-shadow: ${mixins.boxShadow};
    summary > span {
      color: ${colors.green};
    }
  }

  details[open] summary ~ * {
    @media (prefers-reduced-motion: no-preference) {
      animation: sweep 0.6s ease-in-out;
    }
  }

  @keyframes sweep {
    0% {
      opacity: 0;
      margin-left: 0px;
    }
    100% {
      opacity: 1;
      margin-left: 10px;
    }
  }
`;

const StyledDetails = styled.details`
  summary::-webkit-details-marker {
    color: ${colors.green};
  }

  summary::marker {
    color: ${colors.green};
  }

  padding: 10px 0;
  margin-bottom: 20px;
  transition: ${theme.transition};

  &:hover,
  &:focus,
  &:active {
    background-color: ${colors.lightNavy};
    border-radius: ${theme.borderRadius};
  }
`;

const StyledSummary = styled.summary`
  display: list-item;
  cursor: pointer;
  position: relative;
  padding: 10px;
  font-size: ${fontSizes.h3};
  ${theme.transition};
  user-select: none;
  line-height: 1.1;
  color: ${colors.slate};
  outline: none;

  &:focus-visible {
    outline: 1px solid ${colors.green};
  }

  span {
    color: ${colors.white};
    font-weight: 600;
    &:hover {
      color: ${colors.green};
    }
  }

  p {
    font-size: ${fontSizes.xxlarge};
  }
`;

// ============================= COMPONENT ================================

function DetailsAndSummary({ title = '', subtitle = '', children, ...otherProps }) {
  return (
    <StyledDetailsContainer {...otherProps}>
      <StyledDetails>
        <StyledSummary>
          <span className="medium-heading">{title}</span>
          {subtitle.length > 0 ? <p>{subtitle}</p> : null}
        </StyledSummary>
        {children}
      </StyledDetails>
    </StyledDetailsContainer>
  );
}

DetailsAndSummary.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
};

export default DetailsAndSummary;
