import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="d-flex flex-column flex-md-row vh-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div
        className="flex-grow-1 p-4 bg-light"
        style={{
          overflowY: 'auto',
          transition: 'margin-left 0.3s ease-in-out',
          marginLeft: isSidebarOpen ? '250px' : '0',
        }}
      >
        {/* Mobile Toggle Button */}
        <div className="d-md-none mb-3">
          <Button variant="primary" onClick={toggleSidebar}>
            {isSidebarOpen ? '✖ Close' : '☰ Menu'}
          </Button>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
