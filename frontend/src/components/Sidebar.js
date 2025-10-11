import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const adminName = localStorage.getItem('name') || 'Admin';

  const toggleSidebar = () => setIsOpen(!isOpen);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    window.location.href = '/';
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="d-md-none p-2 bg-dark text-white">
        <Button
          variant="outline-light"
          size="sm"
          onClick={toggleSidebar}
        >
          {isOpen ? '✖ Close Menu' : '☰ Menu'}
        </Button>
      </div>

      {/* Sidebar Container */}
      <div
        className={`sidebar d-flex flex-column p-3 text-bg-dark transition-all position-fixed h-100`}
        style={{
          width: isOpen ? '250px' : '0',
          overflow: 'hidden',
          transition: 'width 0.3s ease-in-out',
          zIndex: 1040,
        }}
      >
        <h4 className="mb-4 mt-3">{adminName}</h4>

        {/* Navigation Links */}
        <nav className="nav nav-pills flex-column gap-2">
          <NavLink
            to="add-user"
            className={({ isActive }) =>
              'nav-link ' + (isActive ? 'active' : 'text-white')
            }
          >
            Add User
          </NavLink>
          <NavLink
            to="view-users"
            className={({ isActive }) =>
              'nav-link ' + (isActive ? 'active' : 'text-white')
            }
          >
            View Users
          </NavLink>
          <NavLink
            to="add-transcript"
            className={({ isActive }) =>
              'nav-link ' + (isActive ? 'active' : 'text-white')
            }
          >
            Add Transcript
          </NavLink>
          <NavLink
            to="view-transcripts"
            className={({ isActive }) =>
              'nav-link ' + (isActive ? 'active' : 'text-white')
            }
          >
            View Transcripts
          </NavLink>
        </nav>

        <button className="btn btn-outline-secondary mt-auto" onClick={logout}>
          Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;
