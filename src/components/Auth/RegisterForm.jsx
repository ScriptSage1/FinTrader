import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const RegisterForm = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Full Name is required');
      return;
    }
    if (!username.trim()) {
      setValidationError('Username is required');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setValidationError('You must agree to the Terms of Service');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username, password, name);
    } catch (err) {
      setValidationError(err.message || 'Failed to register account');
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

      <div style={{
        backgroundColor: 'rgba(254, 127, 45, 0.08)',
        border: '1px solid rgba(254, 127, 45, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        fontSize: '13px',
        color: 'var(--color-secondary)',
        fontWeight: 600,
        textAlign: 'center',
        marginBottom: '10px'
      }}>
        💰 Signup bonus: Receive $10,000.00 virtual trading cash!
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="register-name">Full Name</label>
        <input
          id="register-name"
          type="text"
          className="form-input"
          placeholder="e.g. Ramya"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="register-username">Username</label>
        <input
          id="register-username"
          type="text"
          className="form-input"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          className="form-input"
          placeholder="Min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
        <input
          id="register-confirm"
          type="password"
          className="form-input"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <input
          type="checkbox"
          id="agree-terms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          disabled={isSubmitting}
          style={{ cursor: 'pointer' }}
        />
        <label htmlFor="agree-terms" style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }}>
          I agree to simulated terms for practice trading
        </label>
      </div>

      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
