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
    <>
      {/* Sidebar Container */}
      <div
        className={`sidebar bg-dark text-white d-flex flex-column p-3 position-fixed h-100`}
        style={{
          width: isOpen ? '250px' : '0',
          overflow: 'hidden',
          transition: 'width 0.3s ease-in-out',
          zIndex: 1040,
        }}
      >
        {/* Sidebar Header */}
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

        {/* Navigation Links */}
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

        {/* Logout Button */}
        <button
          className="btn btn-outline-light mt-auto w-100"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;
