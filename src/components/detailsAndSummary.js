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
    summary > span {
      color: ${colors.green};
    }
  }

  details[open] summary ~ * {
    animation: sweep 0.5s ease-in-out;
  }

  @keyframes sweep {
    0% {
      opacity: 0;
      margin-left: -10px;
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

  div {
    margin-left: 10px;
  }

  transition: ${theme.transition};
  &:hover,
  &:focus {
    transform: translateY(-5px);
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
  subtitle: PropTypes.object,
  children: PropTypes.node,
};

export default DetailsAndSummary;
