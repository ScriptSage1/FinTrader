import React, { useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

export const Toast = () => {
  const { toastMessage, clearToast } = useTrading();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  return (
    <div className="toast-container">
      <div className={`toast ${type === 'error' ? 'error' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {type === 'error' ? (
            <AlertTriangle size={18} color="var(--color-danger)" />
          ) : (
            <CheckCircle size={18} color="var(--color-success)" />
          )}
          <span className="toast-msg">{message}</span>
        </div>
        <button className="toast-close" onClick={clearToast} aria-label="Close notification">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
