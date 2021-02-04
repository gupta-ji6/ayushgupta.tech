/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it

// import React from 'react';
const splitbee = require('@splitbee/web');

// Called when the Gatsby browser runtime first starts
exports.onClientEntry = () => {
  //   console.log('client has entered the chat!');
  splitbee.default.init({
    disableCookie: true, // will disable the cookie usage
    scriptUrl: '/bee',
    apiUrl: '/_hive',
  });
};
