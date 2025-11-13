import React, { useState, useEffect } from 'react';
import './Contest.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css'
const Contest = ({ apiUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartContestClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ email: '' });
  };

  // Using standard toast configuration from App.jsx
  const notify = (message, type = 'error') => {
    toast[type](message);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      notify('Email is required.');
      return;
    }
    setLoading(true);
    
    try {
      const response = await fetch(`${apiUrl}/api/test/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { id: userId } = data;
      localStorage.setItem('userId', userId);
      
      notify('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        navigate('/test');
      }, 1000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      
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
    <>
      <div className='contest-page-container'>
        <div className="contest-card">
          <div className="contest-card-logo">
            <img src="/club-logo.jpg" alt="Club Logo" />
          </div>
          <div className="contest-card-heading">
            <h1>Technical Quiz</h1>
          </div>
          <div className="contest-card-info">
            <ul>
              <li>Make sure you have Registered for the Contest.</li>
              <li>If not Registered, please contact Club Members.</li>
              <li>For login Email, please contact Club Members.</li>
            </ul>
          </div>
          <div className="contest-card-submit">
            <button onClick={handleStartContestClick}>Start Contest</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content login-modal">
            <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            <div className="login-header">
              <div className="logoin-logo">
                <img 
                  src="/club-logo.jpg" 
                  alt="UUCSC Logo" 
                  className="login-logo"
                />
              </div>
              <h2>Welcome Back</h2>
              <p>Sign in to your email to start contest</p>
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
                  placeholder="Enter your registered email"
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
              <p className="register-cta">Contact Admin</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Contest;
