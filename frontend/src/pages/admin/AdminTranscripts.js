import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';
import TranscriptModal from '../../components/TranscriptModal';

/**
 * AdminTranscripts Component
 * 
 * Admin page for viewing all transcripts in the system with:
 * - Comprehensive transcript list from all users
 * - Advanced filtering and search capabilities
 * - User-specific transcript viewing
 * - Export functionality
 * - Transcript statistics
 */
const AdminTranscripts = () => {
  const { adminId } = useOutletContext();
  const [allTranscripts, setAllTranscripts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredTranscripts, setFilteredTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter and sort transcripts when dependencies change
    let filtered = allTranscripts.filter(transcript => {
      const matchesSearch = transcript.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transcript.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUser = userFilter === 'all' || transcript.userId.toString() === userFilter;
      const matchesDate = checkDateFilter(transcript.createdAt, dateFilter);
      
      return matchesSearch && matchesUser && matchesDate;
    });

    // Sort transcripts
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'userName') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredTranscripts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allTranscripts, searchTerm, userFilter, dateFilter, sortBy, sortOrder]);

  /**
   * Check if transcript matches date filter
   */
  const checkDateFilter = (createdAt, filter) => {
    if (filter === 'all') return true;
    
    const transcriptDate = new Date(createdAt);
    const now = new Date();
    
    switch (filter) {
      case 'today':
        return transcriptDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transcriptDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transcriptDate >= monthAgo;
      default:
        return true;
    }
  };

  /**
   * Fetch all transcripts and users
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all users first
      const usersResponse = await api.get('/admin/users');
      const usersData = usersResponse.data || [];
      setUsers(usersData);

      // Fetch transcripts for all users
      const transcriptPromises = usersData.map(async (user) => {
        try {
          const response = await api.get(`/transcripts/${user.id}`);
          return response.data.map(transcript => ({
            ...transcript,
            userName: user.name,
            userRole: user.role
          }));
        } catch (err) {
          // If user has no transcripts or error, return empty array
          return [];
        }
      });

      const transcriptArrays = await Promise.all(transcriptPromises);
      const combinedTranscripts = transcriptArrays.flat();
      
      setAllTranscripts(combinedTranscripts);

    } catch (err) {
      setError('Failed to fetch transcript data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open transcript modal for a specific user
   */
  const handleViewUserTranscripts = (userId, userName) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setShowTranscriptModal(true);
  };

  /**
   * Export filtered transcripts
   */
  const exportTranscripts = () => {
    if (filteredTranscripts.length === 0) return;
    
    const content = filteredTranscripts
      .map(t => `User: ${t.userName}\nDate: ${new Date(t.createdAt).toLocaleString()}\nContent: ${t.content}\n${'='.repeat(80)}`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_transcripts_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Get transcript statistics
   */
  const getStats = () => {
    const stats = {
      total: allTranscripts.length,
      today: allTranscripts.filter(t => checkDateFilter(t.createdAt, 'today')).length,
      thisWeek: allTranscripts.filter(t => checkDateFilter(t.createdAt, 'week')).length,
      thisMonth: allTranscripts.filter(t => checkDateFilter(t.createdAt, 'month')).length,
      byRole: {}
    };

    // Calculate transcripts by user role
    allTranscripts.forEach(transcript => {
      const role = transcript.userRole || 'unknown';
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;
    });

    return stats;
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredTranscripts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTranscripts = filteredTranscripts.slice(
    startIndex, 
    startIndex + ITEMS_PER_PAGE
  );

  const stats = getStats();

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="spinner"></div>
          Loading transcripts...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>All Transcripts</h1>
        <p className="page-subtitle">View and manage all transcripts in the system</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Transcripts</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.today}</span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.thisWeek}</span>
          <span className="stat-label">This Week</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.thisMonth}</span>
          <span className="stat-label">This Month</span>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="transcripts-controls">
        <div className="search-controls">
          <div className="search-group">
            <input
              type="text"
              className="search-input"
              placeholder="Search transcripts by content or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            className="filter-select"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id.toString()}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
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
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="userName-asc">User (A-Z)</option>
            <option value="userName-desc">User (Z-A)</option>
          </select>
        </div>

        <div className="action-controls">
          <button 
            className="export-button"
            onClick={exportTranscripts}
            disabled={filteredTranscripts.length === 0}
            title="Export filtered transcripts"
          >
            📄 Export
          </button>
          <button 
            className="refresh-button"
            onClick={fetchData}
            title="Refresh transcript list"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Transcripts List */}
      <div className="transcripts-container">
        {filteredTranscripts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <p>
              {searchTerm || userFilter !== 'all' || dateFilter !== 'all'
                ? 'No transcripts match your filters'
                : 'No transcripts found'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="transcripts-list">
              {paginatedTranscripts.map((transcript) => (
                <div key={`${transcript.id}-${transcript.userId}`} className="transcript-card">
                  <div className="transcript-header">
                    <div className="user-info">
                      <span className="user-name">{transcript.userName}</span>
                      <span className={`role-badge ${transcript.userRole}`}>
                        {transcript.userRole}
                      </span>
                    </div>
                    <div className="transcript-meta">
                      <span className="transcript-date">
                        {new Date(transcript.createdAt).toLocaleString()}
                      </span>
                      <button
                        className="view-user-transcripts-btn"
                        onClick={() => handleViewUserTranscripts(transcript.userId, transcript.userName)}
                        title="View all transcripts for this user"
                      >
                        👁️ View All
                      </button>
                    </div>
                  </div>
                  <div className="transcript-content">
                    {transcript.content.length > 200 
                      ? transcript.content.substring(0, 200) + '...'
                      : transcript.content
                    }
                  </div>
                  <div className="transcript-footer">
                    <span className="transcript-id">ID: {transcript.id}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <span className="page-info">
                  Page {currentPage} of {totalPages} 
                  ({filteredTranscripts.length} transcripts)
                </span>
                
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
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

export default AdminTranscripts;