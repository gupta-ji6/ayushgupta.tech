import React from 'react';
import styled from 'styled-components';
import { mixins } from '@styles';
import PropTypes from 'prop-types';

// ============================= STYLED COMPONENTS ================================

const StyledDetailsContainer = styled.div`
  a {
    ${mixins.inlineLink};
  }

  details[open] {
    background-color: ${({ theme }) => theme.colors.lightNavy};
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: ${mixins.boxShadow};
    summary > span {
      color: ${({ theme }) => theme.colors.green};
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
    color: ${({ theme }) => theme.colors.green};
  }

  summary::marker {
    color: ${({ theme }) => theme.colors.green};
  }

  padding: 10px 0;
  margin-bottom: 20px;
  transition: ${({ theme }) => theme.transition};

  &:hover,
  &:focus,
  &:active {
    background-color: ${({ theme }) => theme.colors.lightNavy};
    border-radius: ${({ theme }) => theme.borderRadius};
  }
`;

const StyledSummary = styled.summary`
  display: list-item;
  cursor: pointer;
  position: relative;
  padding: 10px;
  font-size: ${({ theme }) => theme.fontSizes.h3};
  ${({ theme }) => theme.transition};
  user-select: none;
  line-height: 1.1;
  color: ${({ theme }) => theme.colors.slate};
  outline: none;

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors.green};
  }

  span {
    color: ${({ theme }) => theme.colors.white};
    font-weight: 600;
    &:hover {
      color: ${({ theme }) => theme.colors.green};
    }
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.xxlarge};
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
