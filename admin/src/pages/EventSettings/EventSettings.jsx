import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import "./EventSettings.css";
import api from '../../api';



const EventSettings = ({url}) => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    setting_key: '',
    setting_value: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/eventsettings/all');
      setSettings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.setting_key || formData.setting_value === '') {
    toast.error('Both key and value are required');
    return;
  }

  try {
    // Single POST request for both add & update
    await api.post('/eventsettings/set', formData);

    toast.success(editingId ? 'Setting updated successfully' : 'Setting added successfully');

    setFormData({ setting_key: '', setting_value: '' });
    setEditingId(null);
    fetchSettings();
  } catch (error) {
    console.error('Error saving setting:', error);
    toast.error(error.response?.data?.message || 'Failed to save setting');
  }
};


  const handleEdit = (setting) => {
    setFormData({
      setting_key: setting.setting_key,
      setting_value: setting.setting_value
    });
    setEditingId(setting._id);
  };

  const handleDelete = async (key) => {
    if (window.confirm('Are you sure you want to delete this setting?')) {
      try {
        await api.delete('eventsettings/delete', { data: { key } });
        toast.success('Setting deleted successfully');
        fetchSettings();
      } catch (error) {
        console.error('Error deleting setting:', error);
        toast.error(error.response?.data?.message || 'Failed to delete setting');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className='page-container'>
    <div className="event-settings-container">
      <h1>Event Settings</h1>
      
      <div className="settings-form">
        <h2>{editingId ? 'Edit Setting' : 'Add New Setting'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Setting Key:</label>
            <input
              type="text"
              name="setting_key"
              value={formData.setting_key}
              onChange={handleInputChange}
              disabled={!!editingId}
              placeholder="Enter setting key"
              required
            />
          </div>
          <div className="form-group">
            <label>Setting Value:</label>
            <textarea
              name="setting_value"
              value={formData.setting_value}
              onChange={handleInputChange}
              placeholder="Enter setting value"
              required
              rows="3"
            />
          </div>
          <button type="submit" className="btn-primary">
            {editingId ? 'Update Setting' : 'Add Setting'}
          </button>
          {editingId && (
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => {
                setFormData({ setting_key: '', setting_value: '' });
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="settings-list">
        <h2>Current Settings</h2>
        {settings.length === 0 ? (
          <p>No settings found. Add a new setting using the form above.</p>
        ) : (
          <table className="settings-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting) => (
                <tr key={setting._id}>
                  <td>{setting.setting_key}</td>
                  <td className="setting-value">
                    {typeof setting.setting_value === 'object' 
                      ? JSON.stringify(setting.setting_value) 
                      : setting.setting_value}
                  </td>
                  <td>{new Date(setting.updatedAt).toLocaleString()}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleEdit(setting)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(setting.setting_key)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </div>
  );
};

export default EventSettings;
