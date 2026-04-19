import React from 'react';
import PropTypes from 'prop-types';
import { OutboundLink } from 'gatsby-plugin-google-gtag';

const ExternalLink = ({
  url,
  children,
  className = '',
  ...otherProps
}) => {
  if (url == null || url === '') {
    return (
      <span className={className} {...otherProps}>
        {children}
      </span>
    );
  }
  return (
    <OutboundLink
      className={className}
      href={url}
      target="_blank"
      rel="nofollow noopener noreferrer"
      {...otherProps}>
      {children}
    </OutboundLink>
  );
};

ExternalLink.propTypes = {
  url: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  otherProps: PropTypes.node,
};

export default ExternalLink;
