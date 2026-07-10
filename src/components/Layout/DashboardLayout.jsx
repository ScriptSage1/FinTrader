import React from 'react';
import NavBar from '../Common/NavBar';
import Toast from '../Common/Toast';

export const DashboardLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <main style={{ flex: 1, backgroundColor: 'var(--color-bg)' }}>
        {children}
      </main>
      <Toast />
    </div>
  );
};

export default DashboardLayout;
