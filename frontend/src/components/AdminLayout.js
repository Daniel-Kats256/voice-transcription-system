import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="container-fluid vh-100 bg-light">
      <div className="row h-100">
        {/* Sidebar Column */}
        <div
          className={`col-12 col-md-3 col-lg-2 p-0 bg-dark text-white transition-all position-relative`}
          style={{
            width: isSidebarOpen ? '250px' : '0',
            overflow: 'hidden',
            transition: 'width 0.3s ease-in-out',
          }}
        >
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        {/* Main Content Column */}
        <div
          className={`col p-4`}
          style={{
            transition: 'margin-left 0.3s ease-in-out',
            marginLeft: isSidebarOpen && window.innerWidth < 768 ? '250px' : '0',
          }}
        >
          {/* Mobile Toggle Button */}
          <div className="d-md-none mb-3">
            <Button variant="primary" onClick={toggleSidebar}>
              {isSidebarOpen ? '✖ Close Menu' : '☰ Menu'}
            </Button>
          </div>

          <div className="bg-white rounded-3 shadow-sm p-4 h-100 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
