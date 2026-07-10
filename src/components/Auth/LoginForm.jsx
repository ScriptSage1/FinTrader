import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export const LoginForm = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!username.trim()) {
      setValidationError('Username is required');
      return;
    }
    if (!password) {
      setValidationError('Password is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setValidationError(err.message || 'Failed to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="trade-form">
      {validationError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--color-danger)',
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {validationError}
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="login-username">Username</label>
        <input
          id="login-username"
          type="text"
          className="form-input"
          placeholder="Enter admin or any username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="login-password">Password</label>
        <div style={{ position: 'relative' }}>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className="form-input"
            placeholder="Enter password123 or any password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'flex'
            }}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Authenticating...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
