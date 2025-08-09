import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';
import TranscriptModal from '../../components/TranscriptModal';

/**
 * AdminUsers Component
 * 
 * Admin page for viewing and managing all users with:
 * - User list with filtering and sorting
 * - User actions (view transcripts, edit, delete)
 * - Bulk operations
 * - User statistics
 */
const AdminUsers = () => {
  const { adminId } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter and sort users when dependencies change
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, sortBy, sortOrder]);

  /**
   * Fetch all users from the server
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/users');
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a user after confirmation
   */
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionError('');
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      setActionError('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  /**
   * Open transcript modal for a specific user
   */
  const handleViewTranscripts = (user) => {
    setSelectedUser(user);
    setShowTranscriptModal(true);
  };

  /**
   * Get role badge styling
   */
  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'role-badge admin',
      officer: 'role-badge officer',
      deaf: 'role-badge deaf'
    };
    return classes[role] || 'role-badge';
  };

  /**
   * Calculate user statistics
   */
  const getUserStats = () => {
    return {
      total: users.length,
      admin: users.filter(u => u.role === 'admin').length,
      officer: users.filter(u => u.role === 'officer').length,
      deaf: users.filter(u => u.role === 'deaf').length
    };
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="spinner"></div>
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>User Management</h1>
        <p className="page-subtitle">Manage all system users, roles, and permissions</p>
      </div>

      {/* Error Displays */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
      
      {actionError && (
        <div className="error-banner">
          {actionError}
        </div>
      )}

      {/* User Statistics */}
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.admin}</span>
          <span className="stat-label">Admins</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.officer}</span>
          <span className="stat-label">Officers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.deaf}</span>
          <span className="stat-label">Deaf Users</span>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="users-controls">
        <div className="search-controls">
          <div className="search-group">
            <input
              type="text"
              className="search-input"
              placeholder="Search users by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="officer">Officer</option>
            <option value="deaf">Deaf User</option>
          </select>

          <select
            className="sort-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="role-asc">Role (A-Z)</option>
            <option value="role-desc">Role (Z-A)</option>
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
          </select>
        </div>

        <button 
          className="refresh-button"
          onClick={fetchUsers}
          title="Refresh user list"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <p>
              {searchTerm || roleFilter !== 'all' 
                ? 'No users match your filters' 
                : 'No users found'
              }
            </p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="user-row">
                  <td className="user-id">{user.id}</td>
                  <td className="user-name">
                    <div className="name-cell">
                      <strong>{user.name}</strong>
                      {parseInt(user.id) === parseInt(adminId) && (
                        <span className="current-user-badge">You</span>
                      )}
                    </div>
                  </td>
                  <td className="user-username">{user.username}</td>
                  <td className="user-role">
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="user-created">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="user-actions">
                    <div className="action-buttons">
                      <button
                        className="action-btn view-transcripts"
                        onClick={() => handleViewTranscripts(user)}
                        title="View user transcripts"
                      >
                        📝
                      </button>
                      <button
                        className="action-btn delete-user"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        disabled={parseInt(user.id) === parseInt(adminId)}
                        title={
                          parseInt(user.id) === parseInt(adminId) 
                            ? "Cannot delete your own account" 
                            : "Delete user"
                        }
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Transcript Modal */}
      <TranscriptModal
        isOpen={showTranscriptModal}
        onClose={() => {
          setShowTranscriptModal(false);
          setSelectedUser(null);
        }}
        userId={selectedUser?.id}
        userName={selectedUser?.name}
        isAdmin={true}
        currentUserId={adminId}
      />
    </div>
  );
};

export default AdminUsers;