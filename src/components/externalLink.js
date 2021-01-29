import React from 'react';
import PropTypes from 'prop-types';
import { OutboundLink } from 'gatsby-plugin-google-gtag';

const ExternalLink = ({ url, children, className, ...otherProps }) => (
  <OutboundLink
    className={className}
    href={url}
    target="_blank"
    rel="nofollow noopener noreferrer"
    {...otherProps}>
    {children}
  </OutboundLink>
);

ExternalLink.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  otherProps: PropTypes.node,
};

export default ExternalLink;
