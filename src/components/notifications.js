import React from 'react';
import { Toaster } from 'react-hot-toast';
import { theme } from '@styles';

const { colors } = theme;

const Notifications = () => (
  <Toaster
    position="bottom-center"
    reverseOrder={false}
    toastOptions={{
      // Define default options
      className: '',
      style: {
        margin: '50px',
        background: `${colors.darkNavy}`,
        color: `${colors.white}`,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
      },
      // duration: 5000,
      // Default options for specific types
      success: {
        duration: 2000,
        // theme: {
        //   primary: 'green',
        //   secondary: 'black',
        // },
        iconTheme: {
          primary: `${colors.lightNavy}`,
          secondary: `${colors.green}`,
        },
      },
    }}
  />
);

export default Notifications;
