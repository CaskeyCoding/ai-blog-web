import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const {
    login,
    changePassword,
    isLoading,
    isNewPasswordRequired,
    error: authError,
    clearError,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!username.trim() || !password.trim()) {
      setLocalError('Please enter both username and password');
      return;
    }

    try {
      await login(username, password);
    } catch (error: any) {
      if (error.message === 'NEW_PASSWORD_REQUIRED') {
        // AuthContext sets isNewPasswordRequired — form will swap automatically
        return;
      }
      setLocalError(error.message || 'Authentication failed');
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!newPassword.trim()) {
      setLocalError('Please enter a new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await changePassword('', newPassword);
    } catch (error: any) {
      setLocalError(error.message || 'Password change failed');
    }
  };

  const displayError = localError || authError;

  if (isLoading && !isNewPasswordRequired) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#003366' }}>
          {isNewPasswordRequired ? 'Set New Password' : 'Sign In'}
        </h1>

        {displayError && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {displayError}
          </div>
        )}

        {isNewPasswordRequired ? (
          /* ── New Password Form ── */
          <form onSubmit={handleNewPasswordSubmit}>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Your account requires a new password. Please set one below.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '0.5rem' }}>
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                style={inputStyle}
              />
            </div>

            <button type="submit" disabled={isLoading} style={buttonStyle(isLoading)}>
              {isLoading ? 'Updating...' : 'Set Password'}
            </button>
          </form>
        ) : (
          /* ── Login Form ── */
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                style={inputStyle}
              />
            </div>

            <button type="submit" disabled={isLoading} style={buttonStyle(isLoading)}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

/* ── Shared styles ── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1rem',
  boxSizing: 'border-box',
};

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '0.75rem',
  backgroundColor: disabled ? '#ccc' : '#003366',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

export default Login;
