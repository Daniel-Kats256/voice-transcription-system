import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <Container fluid className="vh-100 p-0">
      <Row className="h-100 g-0">
        {/* Sidebar Column */}
        <Col
          xs={12}
          md={3}
          lg={2}
          className={`bg-dark text-white sidebar-column ${
            isCollapsed ? 'd-block' : 'd-none'
          } d-md-block`}
          style={{
            transition: 'all 0.3s ease-in-out',
            position: 'relative',
            zIndex: 1050,
          }}
        >
          <Sidebar />
        </Col>

        {/* Main Content Column */}
        <Col xs={12} md={9} lg={10} className="p-4 bg-light">
          {/* Mobile Toggle Button */}
          <div className="d-md-none mb-3">
            <Button variant="primary" onClick={toggleSidebar}>
              {isCollapsed ? '☰ Menu' : '✖ Close'}
            </Button>
          </div>

          {/* Nested route content */}
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
