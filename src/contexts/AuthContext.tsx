import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signIn, signOut, getCurrentUser, confirmSignIn, SignInOutput, fetchAuthSession } from 'aws-amplify/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewPasswordRequired: boolean;
  user: any | null;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signInOutput, setSignInOutput] = useState<SignInOutput | null>(null);

  const clearError = () => setError(null);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const currentUser = await getCurrentUser();
      
      // Verify the session is still valid
      const session = await fetchAuthSession();
      
      if (session.tokens?.accessToken) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        throw new Error('No valid session');
      }
    } catch (error: any) {
      setIsAuthenticated(false);
      setUser(null);
      try {
        await signOut();
      } catch (_) {
        // Silent cleanup
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await signOut();
      setIsAuthenticated(false);
      setIsNewPasswordRequired(false);
      setSignInOutput(null);
      setUser(null);
      
      // Clear any cached data
      localStorage.removeItem('amplify-signin-with-hostedUI');
      
    } catch (error: any) {
      setError(error.message || 'Logout failed');
      
      // Force clear state even if signOut fails
      setIsAuthenticated(false);
      setUser(null);
      setIsNewPasswordRequired(false);
      setSignInOutput(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Set up periodic token refresh (every 30 minutes)
    const interval = setInterval(async () => {
      if (isAuthenticated) {
        try {
          const session = await fetchAuthSession({ forceRefresh: true });
          if (!session.tokens?.accessToken) {
            // Token expired
            await logout();
          }
        } catch (_) {
          await logout();
        }
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const output = await signIn({ username, password });
      setSignInOutput(output);
      
      if (output.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setIsNewPasswordRequired(true);
        setIsLoading(false);
        throw new Error('NEW_PASSWORD_REQUIRED');
      }
      
      // Get user info after successful login
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsNewPasswordRequired(false);
      setSignInOutput(null);
      
    } catch (error: any) {
      setError(error.message || 'Login failed');
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!signInOutput) {
      throw new Error('No sign in session found');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await confirmSignIn({
        challengeResponse: newPassword
      });
      
      // Get user info after password change
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsNewPasswordRequired(false);
      setSignInOutput(null);
      
    } catch (error: any) {
      setError(error.message || 'Password change failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      isNewPasswordRequired, 
      user, 
      error, 
      login, 
      logout, 
      changePassword, 
      clearError,
      refreshAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    // Return a default context to prevent crashes
    return {
      isAuthenticated: false,
      isLoading: false,
      isNewPasswordRequired: false,
      user: null,
      error: 'AuthProvider not found',
      login: async () => { throw new Error('AuthProvider not found'); },
      logout: async () => { throw new Error('AuthProvider not found'); },
      changePassword: async () => { throw new Error('AuthProvider not found'); },
      clearError: () => {},
      refreshAuth: async () => {}
    };
  }
  return context;
}; 