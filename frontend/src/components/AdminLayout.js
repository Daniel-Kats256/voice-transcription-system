import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="d-flex flex-column flex-md-row vh-100">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-grow-1 p-4 bg-light" style={{ overflowY: 'auto' }}>
        {/* Mobile Toggle Button */}
        <div className="d-md-none mb-3">
          <Button variant="primary" onClick={toggleSidebar}>
            {isCollapsed ? '☰ Menu' : '✖ Close'}
          </Button>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
