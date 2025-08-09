import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

/**
 * AdminLayout - generic layout for all admin-related pages.
 * Renders a permanent sidebar on the left and the selected child route on the right.
 */
const AdminLayout = () => {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;