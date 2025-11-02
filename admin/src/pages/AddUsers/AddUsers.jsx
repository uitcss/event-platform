import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddUsers.css';
import api from '../../api';

const AddUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const navigate = useNavigate();
  

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.email) {
    toast.error('Please fill in all fields');
    return;
  }

  try {
    const response = await api.post('/auth/add', formData);

    const data = response.data;

    toast.success(data.message || 'User added successfully');
    setFormData({ name: '', email: '' });
    fetchUsers();

  } catch (error) {
    console.log(error);
    
    if (error.response) {
      toast.error(error.response.data.message || 'Failed to add user');
    } else {
      toast.error('Error adding user');
    }
  }
};

const handleRemoveUser = async (email) => {
  if (window.confirm('Are you sure you want to remove this user?')) {
    try {
      const response = await api.delete('/auth/remove', {
        data: { email },
      });

      toast.success(response.data.message || 'User removed successfully');
      fetchUsers();
    } catch (error) {
    console.log(error);
        
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to remove user');
      } else {
        toast.error('Error removing user');
      }
    }
  }
};



  return (
    <div className="page-container">
    <div className="add-users-container">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <div className="add-users-header">
        <h1>User Management</h1>
        <p>Add and manage user accounts</p>
      </div>

      <div className="add-users-card">
        <h2>Add New User</h2>
        <form onSubmit={handleAddUser} className="add-users-form">
          <div className="add-users-form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="add-users-form-control"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="add-users-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="add-users-form-control"
              placeholder="john@example.com"
              required
            />
          </div>
          <button 
            type="submit" 
            className="add-users-submit-btn add-users-form-group"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>

      <div className="add-users-card">
        <h2>User List</h2>
        {loading ? (
          <div className="add-users-loading">Loading users...</div>
        ) : users.length > 0 ? (
          <div className="add-users-table-container">
            <table className="add-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <button 
                        onClick={() => handleRemoveUser(user.email)}
                        className="add-users-remove-btn"
                        disabled={loading}
                      >
                        {loading ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="add-users-empty-state">
            <p>No users found. Add a new user to get started.</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default AddUsers;
