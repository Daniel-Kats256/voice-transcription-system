import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Legacy AdminPage Component
 * 
 * This component now redirects to the new admin layout.
 * Kept for backward compatibility.
 */
const AdminPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin and redirect to new admin layout
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      Redirecting to admin panel...
    </div>
  );
};

export default AdminPage;
