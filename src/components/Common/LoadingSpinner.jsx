import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
