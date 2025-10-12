import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const Sidebar = () => {
  const adminName = localStorage.getItem('name') || 'Admin';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    window.location.href = '/';
  };

  return (
    <div className="d-flex flex-column p-3 h-100">
      <h4 className="text-white mb-4">{adminName}</h4>

      <nav className="nav nav-pills flex-column gap-2 mb-auto">
        <NavLink
          to="add-user"
          className={({ isActive }) =>
            'nav-link ' + (isActive ? 'active bg-primary' : 'text-white')
          }
        >
          Add User
        </NavLink>

        <NavLink
          to="view-users"
          className={({ isActive }) =>
            'nav-link ' + (isActive ? 'active bg-primary' : 'text-white')
          }
        >
          View Users
        </NavLink>

        <NavLink
          to="add-transcript"
          className={({ isActive }) =>
            'nav-link ' + (isActive ? 'active bg-primary' : 'text-white')
          }
        >
          Add Transcript
        </NavLink>

        <NavLink
          to="view-transcripts"
          className={({ isActive }) =>
            'nav-link ' + (isActive ? 'active bg-primary' : 'text-white')
          }
        >
          View Transcripts
        </NavLink>
      </nav>

      <Button variant="outline-light" onClick={logout}>
        Logout
      </Button>
    </div>
  );
};

export default Sidebar;
