import React, { useState, useEffect } from 'react';
import './AdminManagement.css';
import api from '../../api';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/adminauth`);
      setAdmins(response.data.admins);
    } catch (error) {
      showMessage('Failed to fetch admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      showMessage('All fields are required', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/adminauth/setadmin`, newAdmin);
      setNewAdmin({ name: '', email: '', password: '' });
      fetchAdmins();
      showMessage('Admin added successfully', 'success');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add admin';
      showMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      try {
        setDeletingId(id);
        await api.delete(`/adminauth/${id}`);
        setAdmins(admins.filter(admin => admin._id !== id));
        showMessage('Admin deleted successfully', 'success');
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to delete admin';
        showMessage(errorMsg, 'error');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  return (
    <div className="page-container">
      <div className="admin-management">
        <h2>Admin Management</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="admin-form-section">
          <h3>Add New Admin</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newAdmin.name}
                onChange={handleInputChange}
                placeholder="Enter admin name"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={newAdmin.email}
                onChange={handleInputChange}
                placeholder="Enter admin email"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="admin-password-container">
                <div className="admin-password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={newAdmin.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="admin-form-input"
                  />
                  <button 
                    type="button" 
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Admin'}
            </button>
          </form>
        </div>

        <div className="admin-list-section">
          <h3>Current Admins</h3>
          {loading && !admins.length ? (
            <div className="loading">Loading admins...</div>
          ) : (
            <div className="admin-grid">
              {admins.map(admin => (
                <div key={admin._id} className="admin-card">
                  <div className="admin-avatar">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-info">
                    <div className="admin-details">
                      <h4>{admin.name}</h4>
                      <p>{admin.email}</p>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteAdmin(admin._id)}
                      disabled={deletingId === admin._id}
                    >
                      {deletingId === admin._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
