import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, apiUrl }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: true,
    user: null
  });

  const navigate = useNavigate();

  // Set auth token for axios requests
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      // Optionally fetch user data here if needed
      // await loadUser();
    }
    setAuthState(prev => ({
      ...prev,
      loading: false
    }));
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password
      });

      const { token } = response.data;
      setAuthToken(token);
      
      setAuthState({
        token,
        isAuthenticated: true,
        loading: false,
        user: null // You can set user data here if returned from login
      });

      return { success: true };
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setAuthToken(null);
    setAuthState({
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null
    });
    navigate('/login');
  };

  // Check if token exists and is valid
  const checkAuth = () => {
    return !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        checkAuth,
        setAuthToken
      }}
    >
      {!authState.loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
