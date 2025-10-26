import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';
import './RoundsManagement.css';

const RoundsManagement = () => {
  const [rounds, setRounds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    round_name: '',
    time_limit_minutes: 0,
  });
  const [editingRound, setEditingRound] = useState(null);

  // Fetch all rounds
  const fetchRounds = async () => {
    try {
      const response = await api.get('/rounds');
      setRounds(response.data.rounds);
    } catch (error) {
      console.error('Error fetching rounds:', error);
      toast.error('Failed to load rounds');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'time_limit_minutes' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddRound = async (e) => {
    e.preventDefault();
    if (!formData.round_name || formData.time_limit_minutes <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/rounds', formData);
      toast.success('Round added successfully');
      setFormData({ round_name: '', time_limit_minutes: 0 });
      fetchRounds();
    } catch (error) {
      console.error('Error adding round:', error);
      toast.error(error.response?.data?.message || 'Failed to add round');
    }
  };

  const handleDeleteRound = async (round) => {
    if (!window.confirm(`Are you sure you want to delete "${round.round_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/rounds/${round._id}`);
      toast.success('Round deleted successfully');
      fetchRounds();
    } catch (error) {
      console.error('Error deleting round:', error);
      toast.error(error.response?.data?.message || 'Failed to delete round');
    }
  };

  const handleToggleRoundStatus = async (round) => {
    const { _id: roundId, is_active } = round;
    
    if (is_active) {
      if (!window.confirm('Are you sure you want to deactivate this round?')) {
        return;
      }
      try {
        await api.patch(`/rounds/${roundId}/deactivate`);
        toast.success('Round deactivated successfully');
        fetchRounds();
      } catch (error) {
        console.error('Error deactivating round:', error);
        toast.error(error.response?.data?.message || 'Failed to deactivate round');
      }
    } else {
      if (!window.confirm('Are you sure you want to activate this round? This will deactivate all other rounds.')) {
        return;
      }
      try {
        await api.patch(`/rounds/${roundId}/activate`);
        toast.success('Round activated successfully');
        fetchRounds();
      } catch (error) {
        console.error('Error activating round:', error);
        toast.error(error.response?.data?.message || 'Failed to activate round');
      }
    }
  };

  const handleUpdateTime = async (roundId, newTime) => {
    try {
      await api.patch(`/rounds/${roundId}/time`, { time_limit_minutes: newTime });
      toast.success('Round time updated successfully');
      fetchRounds();
    } catch (error) {
      console.error('Error updating round time:', error);
      toast.error(error.response?.data?.message || 'Failed to update round time');
    }
  };

  const startEditing = (round) => {
    setEditingRound(round);
    setFormData({
      round_name: round.round_name,
      time_limit_minutes: round.time_limit_minutes
    });
  };

  const cancelEditing = () => {
    setEditingRound(null);
    setFormData({ round_name: '', time_limit_minutes: 0 });
  };

  const handleUpdateRound = async (e) => {
    e.preventDefault();
    if (!editingRound) return;

    try {
      await handleUpdateTime(editingRound._id, formData.time_limit_minutes);
      cancelEditing();
    } catch (error) {
      console.error('Error updating round:', error);
    }
  };

  if (isLoading) {
    return <div className="page-container">Loading rounds...</div>;
  }

  return (
    <div className="page-container">
      <div className="rounds-management">
        <h2>Rounds Management</h2>
        
        {/* Add/Edit Form */}
        <div className="round-form-container">
          <h3>{editingRound ? 'Edit Round' : 'Add New Round'}</h3>
          <form onSubmit={editingRound ? handleUpdateRound : handleAddRound} className="round-form">
            <div className="form-group">
              <label>Round Name</label>
              <input
                type="text"
                name="round_name"
                value={formData.round_name}
                onChange={handleInputChange}
                placeholder="Enter round name"
                required
                disabled={!!editingRound}
              />
            </div>
            
            <div className="form-group">
              <label>Time Limit (minutes)</label>
              <input
                type="number"
                name="time_limit_minutes"
                min="1"
                value={formData.time_limit_minutes}
                onChange={handleInputChange}
                placeholder="Enter time limit in minutes"
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingRound ? 'Update Round' : 'Add Round'}
              </button>
              {editingRound && (
                <button type="button" className="btn btn-secondary" onClick={cancelEditing}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Rounds List */}
        <div className="rounds-list">
          <h3>Rounds</h3>
          {rounds.length === 0 ? (
            <p>No rounds found. Add a new round to get started.</p>
          ) : (
            <table className="rounds-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Time Limit (min)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((round) => (
                  <tr key={round._id} className={round.is_active ? 'active-round' : ''}>
                    <td>{round.round_id}</td>
                    <td>{round.round_name}</td>
                    <td>
                      {editingRound?._id === round._id ? (
                        <input
                          type="number"
                          name="time_limit_minutes"
                          value={formData.time_limit_minutes}
                          onChange={handleInputChange}
                          min="1"
                        />
                      ) : (
                        round.time_limit_minutes
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${round.is_active ? 'active' : 'inactive'}`}>
                        {round.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className={`btn btn-sm ${round.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => handleToggleRoundStatus(round)}
                      >
                        {round.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => startEditing(round)}
                        disabled={round.is_active}
                        title={round.is_active ? 'Cannot edit active round' : 'Edit round'}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDeleteRound(round)}
                        disabled={round.is_active}
                        title={round.is_active ? 'Cannot delete active round' : 'Delete round'}
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

export default RoundsManagement;
