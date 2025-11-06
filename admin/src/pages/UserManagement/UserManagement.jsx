import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [isRoundsLoading, setIsRoundsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

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

  // Fetch all rounds
  const fetchRounds = async () => {
    try {
      setIsRoundsLoading(true);
      const response = await api.get('/rounds');
      setRounds(response.data.rounds);
    } catch (error) {
      console.error('Error fetching rounds:', error);
      toast.error('Failed to fetch rounds');
      setRounds([]);
    } finally {
      setIsRoundsLoading(false);
    }
  };

  // Fetch users by round
  const fetchUsersByRound = async (roundId) => {
    try {
      setLoading(true);
      if (roundId === 'all') {
        const response = await api.get('/users');
        setUsers(response.data);
      } else {
        const response = await api.get(`/users/round/${roundId}`);
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users by round:', error);
      // toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Handle user promotion
  const handlePromote = async (userId) => {
    try {
      await api.patch(`/users/${userId}/promote`);
      toast.success('User promoted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user');
    }
  };

  // Handle user depromotion
  const handleDepromote = async (userId) => {
    try {
      await api.patch(`/users/${userId}/depromote`);
      toast.success('User depromoted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error depromoting user:', error);
      toast.error(error.response?.data?.message || 'Failed to depromote user');
    }
  };

  // Handle user activation/deactivation
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus) {
        await api.patch(`/users/${userId}/deactivate`);
        toast.success('User deactivated successfully');
      } else {
        await api.patch(`/users/${userId}/activate`);
        toast.success('User activated successfully');
      }
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Handle round filter change
  const handleRoundChange = (e) => {
    const round = e.target.value;
    setSelectedRound(round);
    setCurrentPage(1);
    fetchUsersByRound(round);
  };

  // Filter users by search term and round
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRound = 
      selectedRound === 'all' || 
      user.current_round.toString() === selectedRound;
      
    return matchesSearch && matchesRound;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Initialize component
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchRounds()
        ]);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    
    if (isMounted) {
      init();
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="loading page-container">Loading users...</div>;
  }

  return (
    <div className="page-container">
    <div className="user-management">
      <h1>User Management</h1>
      
      {/* Filters and Search */}
      <div className="user-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="round-filter">
          <label htmlFor="round">Filter by Round:</label>
          <select 
            id="round" 
            value={selectedRound} 
            onChange={handleRoundChange}
            disabled={loading || isRoundsLoading}
          >
            <option value="all">All Rounds</option>
            {!isRoundsLoading && rounds.length > 0 ? (
              rounds.map(round => (
                <option key={round.round_id} value={round.round_id}>
                  {round.round_name}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading rounds...</option>
            )}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Round</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user._id} className={!user.is_active ? 'inactive' : ''}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>Round {user.current_round}</td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      onClick={() => handlePromote(user._id)}
                      className="btn-promote"
                      title="Promote to next round"
                      disabled={!user.is_active }
                    >
                      ↑
                    </button>
                    <button 
                      onClick={() => handleDepromote(user._id)}
                      className="btn-depromote"
                      title="Move to previous round"
                      disabled={!user.is_active || user.current_round <= 1}
                    >
                      ↓
                    </button>
                    <button 
                      onClick={() => toggleUserStatus(user._id, user.is_active)}
                      className={`btn-status ${user.is_active ? 'deactivate' : 'activate'}`}
                      title={user.is_active ? 'Deactivate user' : 'Activate user'}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-users">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span>Page {currentPage} of {totalPages}</span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default UserManagement;