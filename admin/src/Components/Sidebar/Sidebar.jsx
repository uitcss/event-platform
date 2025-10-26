import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/eventsettings', label: 'Event Settings' },
  { path: '/rounds', label: 'Rounds Management' },
  { path: '/questions', label: 'Upload Questions' },
  { path: '/users', label: 'User Management' },
  { path: '/answers', label: 'Validate Answers' },
  { path: '/results', label: 'Participant results' },
  { path: '/admin', label: 'Admin Management' }
];

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        {menuItems.map((item, index) => (
          <NavLink 
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-option ${isActive ? 'active' : ''}`
            }
          >
            <p>{item.label}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
