import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

/**
 * AdminDashboard Component
 * 
 * Main dashboard for admin users showing:
 * - System overview and statistics
 * - Recent activity
 * - Quick action buttons
 * - System health indicators
 */
const AdminDashboard = () => {
  const { adminName } = useOutletContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTranscripts: 0,
    adminUsers: 0,
    officerUsers: 0,
    deafUsers: 0,
    recentTranscripts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch dashboard statistics and recent activity
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch users and calculate statistics
      const usersResponse = await api.get('/admin/users');
      const users = usersResponse.data;

      // Calculate user role statistics
      const userStats = users.reduce((acc, user) => {
        acc.total++;
        acc[user.role]++;
        return acc;
      }, { total: 0, admin: 0, officer: 0, deaf: 0 });

      // Fetch recent transcripts (admin can see all)
      const recentTranscriptsPromises = users.slice(0, 5).map(user => 
        api.get(`/transcripts/${user.id}`)
          .then(res => res.data.slice(0, 2).map(transcript => ({
            ...transcript,
            userName: user.name
          })))
          .catch(() => [])
      );

      const recentTranscriptsArrays = await Promise.all(recentTranscriptsPromises);
      const recentTranscripts = recentTranscriptsArrays
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Get total transcript count
      const totalTranscriptsPromises = users.map(user =>
        api.get(`/transcripts/${user.id}`)
          .then(res => res.data.length)
          .catch(() => 0)
      );

      const transcriptCounts = await Promise.all(totalTranscriptsPromises);
      const totalTranscripts = transcriptCounts.reduce((sum, count) => sum + count, 0);

      setStats({
        totalUsers: userStats.total,
        totalTranscripts,
        adminUsers: userStats.admin,
        officerUsers: userStats.officer,
        deafUsers: userStats.deaf,
        recentTranscripts
      });

    } catch (err) {
      setError('Failed to load dashboard data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="spinner"></div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p className="page-subtitle">Welcome back, {adminName}! Here's your system overview.</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.totalTranscripts}</h3>
            <p>Total Transcripts</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🛡️</div>
          <div className="stat-content">
            <h3>{stats.adminUsers}</h3>
            <p>Admin Users</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">👮</div>
          <div className="stat-content">
            <h3>{stats.officerUsers}</h3>
            <p>Officers</p>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">🤟</div>
          <div className="stat-content">
            <h3>{stats.deafUsers}</h3>
            <p>Deaf Users</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h3>Recent Transcripts</h3>
        {stats.recentTranscripts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No recent transcripts found.</p>
          </div>
        ) : (
          <div className="recent-transcripts">
            {stats.recentTranscripts.map((transcript) => (
              <div key={`${transcript.id}-${transcript.userId}`} className="transcript-preview">
                <div className="transcript-meta">
                  <span className="user-name">{transcript.userName}</span>
                  <span className="transcript-date">
                    {new Date(transcript.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="transcript-content-preview">
                  {transcript.content.length > 100 
                    ? transcript.content.substring(0, 100) + '...'
                    : transcript.content
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <button 
            className="action-button primary"
            onClick={() => window.location.href = '/admin/add-user'}
          >
            <span className="action-icon">➕</span>
            Add New User
          </button>
          
          <button 
            className="action-button success"
            onClick={() => window.location.href = '/admin/users'}
          >
            <span className="action-icon">👥</span>
            Manage Users
          </button>
          
          <button 
            className="action-button info"
            onClick={() => window.location.href = '/admin/transcripts'}
          >
            <span className="action-icon">📝</span>
            View All Transcripts
          </button>
          
          <button 
            className="action-button warning"
            onClick={() => fetchDashboardData()}
          >
            <span className="action-icon">🔄</span>
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;