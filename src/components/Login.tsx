import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Logout } from '@mui/icons-material';

const palette = {
  primary: '#003366',
  accent: '#F5A623',
  background: '#ffffff',
  error: '#d32f2f'
};

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { 
    login, 
    logout, 
    changePassword, 
    isNewPasswordRequired, 
    isLoading, 
    error: authError, 
    clearError,
    isAuthenticated,
    user
  } = useAuth();
  
  const navigate = useNavigate();

  // Clear errors when component mounts or when switching between login/password change
  useEffect(() => {
    setLocalError('');
    clearError();
  }, [isNewPasswordRequired, clearError]);

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
    
    try {
      if (isNewPasswordRequired) {
        if (newPassword.length < 8) {
          setLocalError('New password must be at least 8 characters long');
          return;
        }
        await changePassword(password, newPassword);
      } else {
        if (!username.trim() || !password.trim()) {
          setLocalError('Please enter both username and password');
          return;
        }
        await login(username, password);
      }
      // Navigation will happen automatically via useEffect when isAuthenticated changes
    } catch (error: any) {
      if (error.message === 'NEW_PASSWORD_REQUIRED') {
        // This is handled by the isNewPasswordRequired state
        return;
      }
      setLocalError(error.message || 'Authentication failed');
    }
  };

  const handleForceLogout = async () => {
    try {
      await logout();
      setUsername('');
      setPassword('');
      setNewPassword('');
      setLocalError('');
    } catch (error) {
      console.error('Force logout failed:', error);
    }
  };

  const displayError = localError || authError;

  if (isLoading) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={40} sx={{ color: palette.primary }} />
          <Typography variant="body1" sx={{ mt: 2, color: palette.primary }}>
            Checking authentication...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', backgroundColor: palette.background }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography component="h1" variant="h5" sx={{ color: palette.primary }}>
              {isNewPasswordRequired ? 'Change Password' : 'Sign in'}
            </Typography>
            {(isAuthenticated || user) && (
              <IconButton 
                onClick={handleForceLogout}
                title="Force logout and clear session"
                sx={{ color: palette.error }}
              >
                <Logout />
              </IconButton>
            )}
          </Box>

          {user && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Currently signed in as: {user.username}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {!isNewPasswordRequired && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: palette.primary,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: palette.primary,
                  },
                }}
              />
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={isNewPasswordRequired ? "Current Password" : "Password"}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: palette.primary,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: palette.primary,
                },
              }}
            />
            
            {isNewPasswordRequired && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                helperText="Password must be at least 8 characters long"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: palette.primary,
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: palette.primary,
                  },
                }}
              />
            )}
            
            {displayError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {displayError}
              </Alert>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                mt: 3, 
                mb: 2,
                backgroundColor: palette.primary,
                '&:hover': {
                  backgroundColor: palette.accent,
                },
                '&:disabled': {
                  backgroundColor: '#ccc',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isNewPasswordRequired ? 'Change Password' : 'Sign In'
              )}
            </Button>

            {!isNewPasswordRequired && (
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#666' }}>
                Having trouble logging in? Try clearing your browser cache or use an incognito window.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 