import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = ({apiUrl}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {  const isLoggedIn = !localStorage.getItem('token');}, []);
  const isLoggedIn = !localStorage.getItem('userId');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };


  const logout = async() => {
    try {
      const user_id = localStorage.getItem('userId');
      const response = await axios.post(`${apiUrl}/api/test/logout`, {
        user_id
      });
      if(response.status === 200){
        console.log("Logout successful");
        toast.success("Logout successful");
      }else{
        toast.error("Logout failed, message: " + response.data.message);
      }
      
          localStorage.removeItem('userId');

      setTimeout(() => {
        window.location.href = '/contest';
      }, 1000);
      
    } catch (error) {
      toast.error("Logout failed, error: " + error.message);
    }

  }

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const navLinks = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About Us' },
    { path: '/contest', name: 'Contest' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img
            src="/club-logo.jpg"
            alt="Club Logo"
            className="logo"
          />
          <span>UU-Computer Science Club</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'} />
        </div>

        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          {navLinks.map((link) => (
            <li key={link.path} className="nav-item">
              <Link
                to={link.path}
                className={`nav-links ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}



            <li className="nav-item auth-buttons">
              <Link
                className="nav-links register-btn"
                to="/contest"
                onClick={() => setIsOpen(false)}
              >
                Join Contest
              </Link>
            </li>

        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
