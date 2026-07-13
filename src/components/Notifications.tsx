import { Toaster } from 'react-hot-toast';

export default function Notifications() {
  return (
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          margin: '50px',
          background: 'var(--color-dark-navy)',
          color: 'var(--color-white)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
        },
        success: {
          duration: 2000,
          iconTheme: {
            primary: 'var(--color-light-navy)',
            secondary: 'var(--color-green)',
          },
        },
      }}
    />
  );
}
