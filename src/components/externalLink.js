import React from 'react';
import PropTypes from 'prop-types';
import { OutboundLink } from 'gatsby-plugin-google-gtag';

const ExternalLink = ({
  url,
  children,
  className = '',
  eventName = 'External Link',
  eventType = '',
  ...otherProps
}) => (
  <OutboundLink
    className={className}
    href={url}
    target="_blank"
    rel="nofollow noopener noreferrer"
    data-splitbee-event={eventName}
    data-splitbee-event-type={eventType ? eventType : url}
    {...otherProps}>
    {children}
  </OutboundLink>
);

ExternalLink.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  eventName: PropTypes.string,
  eventType: PropTypes.string,
  otherProps: PropTypes.node,
};

export default ExternalLink;
