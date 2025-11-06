import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children, apiUrl }) => {

  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    token: null,
    isAuthenticated: false,
    loading: true,
    user: null,
  });

  
  // Set auth token for axios requests
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };



  // Login function
  const login = async (email) => {
    try {
      const response = await axios.post(`${apiUrl}/api/test/login`, {
        email
      });

      const token = response.data.id;
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


  // Check if token exists and is valid
  const checkAuth = () => {
    return !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
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
