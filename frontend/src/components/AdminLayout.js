import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div
          className={`col-md-3 col-lg-2 bg-dark text-white p-3 position-fixed top-0 start-0 vh-100 
          ${isCollapsed ? 'd-none d-md-block' : 'd-block'}`}
          style={{ zIndex: 1040 }}
        >
          <Sidebar closeSidebar={() => setIsCollapsed(true)} />
        </div>

        {/* Main content area */}
        <div className={`col-12 ${!isCollapsed ? '' : 'col-md-9 offset-md-3 col-lg-10 offset-lg-2'} p-4`}>
          {/* Toggle button (visible on all screen sizes for flexibility) */}
          <div className="mb-3">
            <Button variant="primary" onClick={toggleSidebar} className="me-2">
              {isCollapsed ? '☰ Menu' : '✖ Close'}
            </Button>
          </div>

          {/* Routed page content */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
