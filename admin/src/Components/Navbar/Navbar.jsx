import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/adminAuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar-container">
      <div className="navbar-content">
        <h2>Admin Panel</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
