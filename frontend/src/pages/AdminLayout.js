import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

/**
 * AdminLayout Component
 * 
 * Main layout wrapper for all admin pages that provides:
 * - Sidebar navigation with admin info
 * - Role-based access control
 * - Responsive layout structure
 * - Shared admin functionality
 */
const AdminLayout = () => {
  const [adminName, setAdminName] = useState('');
  const [adminId, setAdminId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and has admin role
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('userName') || 'Admin User';

    // Redirect non-admin users
    if (!userId || role !== 'admin') {
      navigate('/');
      return;
    }

    setAdminName(name);
    setAdminId(userId);
  }, [navigate]);

  /**
   * Handle admin logout
   * Clears all stored user data and redirects to login
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    navigate('/');
  };

  // Don't render if not authenticated as admin
  if (!adminId) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        Verifying admin access...
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <AdminSidebar 
        adminName={adminName}
        onLogout={handleLogout}
      />
      
      {/* Main Content Area */}
      <div className="admin-content">
        <div className="content-container">
          {/* This is where individual admin pages will be rendered */}
          <Outlet context={{ adminId, adminName }} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;