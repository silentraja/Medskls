import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const register = async (userData) => {
    // Check network status before attempting registration
    if (!networkStatus) {
      setError('Network Error. Please check your internet connection.');
      return { 
        success: false, 
        message: 'Network Error. Please check your internet connection.',
        isNetworkError: true
      };
    }

    setLoading(true);
    setError(null);
    try {
      const result = await authService.register(userData);
      if (result.success) {
        // Optional: Automatically log in user after registration
        // You might want to modify this based on your requirements
        const loginResult = await authService.login({
          username: userData.username,
          password: userData.password
        });
        
        if (loginResult.success && loginResult.data) {
          localStorage.setItem('token', loginResult.token || '');
          localStorage.setItem('user', JSON.stringify(loginResult.data));
          setUser(loginResult.data);
          setIsAuthenticated(true);
        }
      } else {
        setError(result.message || 'Registration failed');
      }
      return result;
    } catch (err) {
      let errorMessage = 'An error occurred during registration';
      
      if (err.isNetworkError) {
        errorMessage = 'Network Error. Please check your internet connection.';
      } else if (err.isSSLError) {
        errorMessage = 'SSL Certificate Error. Please contact support.';
      } else if (err.isCorsError) {
        errorMessage = 'CORS Error. Please contact support.';
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        isNetworkError: err.isNetworkError || false,
        isSSLError: err.isSSLError || false
      };
    } finally {
      setLoading(false);
    }
  };
  const login = async (credentials) => {
    // Check network status before attempting login
    if (!networkStatus) {
      setError('Network Error. Please check your internet connection.');
      return { 
        success: false, 
        message: 'Network Error. Please check your internet connection.',
        isNetworkError: true
      };
    }

    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(credentials);
      if (result.success && result.data) {
        const userData = result.data;
        localStorage.setItem('token', result.token || '');
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setError(result.message || 'Login failed');
      }
      return result;
    } catch (err) {
      let errorMessage = 'An error occurred during login';
      
      if (err.isNetworkError) {
        errorMessage = 'Network Error. Please check your internet connection.';
      } else if (err.isSSLError) {
        errorMessage = 'SSL Certificate Error. Please contact support.';
      } else if (err.isCorsError) {
        errorMessage = 'CORS Error. Please contact support.';
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        isNetworkError: err.isNetworkError || false,
        isSSLError: err.isSSLError || false
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      error, 
      networkStatus,
      register, // Make sure to include register in the context value
      login, 
      logout,
      role: user?.RoleId || null
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);