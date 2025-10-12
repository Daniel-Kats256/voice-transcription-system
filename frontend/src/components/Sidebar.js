import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const adminName = localStorage.getItem('name') || 'Admin';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    window.location.href = '/';
  };

  return (
    <div
      className="d-flex flex-column h-100 p-3 text-white"
      style={{
        width: isOpen ? '250px' : '0',
        overflow: 'hidden',
        backgroundColor: 'rgba(33, 37, 41, 0.95)',
        backdropFilter: 'blur(6px)',
        transition: 'width 0.3s ease-in-out',
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">{adminName}</h4>
        <Button
          variant="outline-light"
          size="sm"
          className="d-md-none"
          onClick={toggleSidebar}
        >
          ✖
        </Button>
      </div>

      {/* Navigation */}
      <nav className="nav nav-pills flex-column gap-2">
        <NavLink
          to="add-user"
          className={({ isActive }) =>
            'nav-link ' + (isActive ? 'active bg-light text-dark' : 'text-white')
          }
        >
          Add User
        </NavLink>
        <NavLink
          to="view-users"
          className={({ isActive }) =>
            'nav-link ' + (isActive ? 'active bg-light text-dark' : 'text-white')
          }
        >
          View Users
        </NavLink>
        <NavLink
          to="add-transcript"
          className={({ isActive }) =>
            'nav-link ' + (isActive ? 'active bg-light text-dark' : 'text-white')
          }
        >
          Add Transcript
        </NavLink>
        <NavLink
          to="view-transcripts"
          className={({ isActive }) =>
            'nav-link ' + (isActive ? 'active bg-light text-dark' : 'text-white')
          }
        >
          View Transcripts
        </NavLink>
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto">
        <Button
          variant="outline-light"
          className="w-100"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
