import React from 'react';
import { Toaster } from 'react-hot-toast';

const Notifications = () => (
  <Toaster
    position="bottom-center"
    reverseOrder={false}
    toastOptions={{
      // Define default options
      className: '',
      style: {
        margin: '50px',
        background: `${({ theme }) => theme.colors.darkNavy}`,
        color: `${({ theme }) => theme.colors.white}`,
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
          primary: `${({ theme }) => theme.colors.lightNavy}`,
          secondary: `${({ theme }) => theme.colors.green}`,
        },
      },
    }}
  />
);

export default Notifications;
