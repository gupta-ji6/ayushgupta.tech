import PropTypes from 'prop-types';
import {
  IconGithub,
  IconLinkedin,
  IconMedium,
  IconInstagram,
  IconTwitter,
  IconFacebook,
} from '@components/icons';

const FormattedIcon = ({ name }) => {
  switch (name) {
    case 'Github':
      return <IconGithub />;
    case 'Linkedin':
      return <IconLinkedin />;
    case 'Medium':
      return <IconMedium />;
    case 'Instagram':
      return <IconInstagram />;
    case 'Twitter':
      return <IconTwitter />;
    case 'Facebook':
      return <IconFacebook />;
    default:
      return <IconGithub />;
  }
};

FormattedIcon.propTypes = {
  name: PropTypes.string.isRequired,
};

export default FormattedIcon;
