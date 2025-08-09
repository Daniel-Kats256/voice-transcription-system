import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * AdminSidebar Component
 * 
 * Provides a navigation sidebar for admin users with:
 * - Current admin's name display
 * - Navigation buttons for different admin functions
 * - Visual indication of current active page
 * - Logout functionality
 */
const AdminSidebar = ({ adminName, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation items with their routes and labels
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'View Users', icon: '👥' },
    { path: '/admin/add-user', label: 'Add User', icon: '➕' },
    { path: '/admin/transcripts', label: 'View Transcripts', icon: '📝' },
    { path: '/admin/add-transcript', label: 'Add Transcript', icon: '✍️' }
  ];

  // Check if current path matches nav item (exact or starts with for sub-routes)
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-sidebar">
      {/* Admin Profile Section */}
      <div className="admin-profile">
        <div className="admin-avatar">
          <span className="avatar-icon">👤</span>
        </div>
        <div className="admin-info">
          <h5 className="admin-name">{adminName}</h5>
          <span className="admin-role">Administrator</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <h6 className="nav-header">ADMIN PANEL</h6>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <button
                className={`nav-button ${isActiveRoute(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="sidebar-footer">
        <button 
          className="logout-button"
          onClick={onLogout}
          title="Logout"
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;