import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';
import '../../Theme.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Initialize toast
  const notify = (message, type = 'error') => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.success) {
      notify(location.state.message || 'Registration successful! Please log in.', 'success');
      // Clear the location state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }
      
      await login(formData.email, formData.password);
      
      // Show success message
      notify('Login successful! Redirecting...', 'success');
      
      // Navigate to contest page after a short delay
      setTimeout(() => {
        navigate('/contest');
      }, 1000);
      
    } catch (err) {
      // Handle specific error cases from backend
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('not active')) {
        notify('Your account is not active. Please contact the administrator.', 'error');
      } else if (errorMessage.includes('not eligible')) {
        notify('You are not eligible for the current round.', 'error');
      } else if (errorMessage.includes('Global round not set')) {
        notify('System error: Global round not configured. Please contact support.', 'error');
      } else {
        notify(errorMessage, 'error');
      }
      
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logoin-logo">
          <img 
            src="../public/club-logo.jpg" 
            alt="UUCSC Logo" 
            className="login-logo"
          />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>


        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="register-link">
          Didn't register for contest?{' '}
          <Link to="/register" className="register-cta">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
