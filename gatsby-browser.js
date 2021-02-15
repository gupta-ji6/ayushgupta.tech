/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it

const React = require('react');
const splitbee = require('@splitbee/web');
const { toast } = require('react-hot-toast');
const theme = require('./src/styles/theme');

// console.log(theme);
const { colors } = theme.default;

const updateButtonStyles = {
  margin: '0px',
  marginLeft: '10px',
  backgroundColor: `${colors.green}`,
  color: `${colors.lightestNavy}`,
  padding: '6px',
  borderRadius: '0.3em',
  border: 'none',
  fontWeight: 'bold',
};

// Called when the Gatsby browser runtime first starts
exports.onClientEntry = () => {
  // console.log('client has entered the chat!');
  splitbee.default.init({
    disableCookie: true, // will disable the cookie usage
    scriptUrl: 'https://ayushgupta.tech/bee.js',
    apiUrl: 'https://ayushgupta.tech/_hive',
  });
};

// Reference - https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#onServiceWorkerUpdateReady
// Also see - https://github.com/gatsbyjs/gatsby/issues/9087#issuecomment-723294431

// Inform plugins when a service worker has been updated in the background and the page is ready to reload to apply changes.
exports.onServiceWorkerUpdateReady = () => {
  toast(
    // eslint-disable-next-line no-unused-vars
    t => (
      <span>
        A new version is available!
        <button onClick={() => window.location.reload()} style={updateButtonStyles}>
          Update
        </button>
      </span>
    ),
    {
      duration: 5000,
    },
  );
};
