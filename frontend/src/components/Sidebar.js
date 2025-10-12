import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ closeSidebar }) => {
  const adminName = localStorage.getItem('name') || 'Admin';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    window.location.href = '/';
  };

  return (
    <div>
      <h4 className="mb-4">{adminName}</h4>

      <nav className="nav flex-column gap-2">
        <NavLink
          to="add-user"
          className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : 'text-white')}
          onClick={closeSidebar}
        >
          Add User
        </NavLink>
        <NavLink
          to="view-users"
          className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : 'text-white')}
          onClick={closeSidebar}
        >
          View Users
        </NavLink>
        <NavLink
          to="add-transcript"
          className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : 'text-white')}
          onClick={closeSidebar}
        >
          Add Transcript
        </NavLink>
        <NavLink
          to="view-transcripts"
          className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : 'text-white')}
          onClick={closeSidebar}
        >
          View Transcripts
        </NavLink>
      </nav>

      <button className="btn btn-outline-light mt-4 w-100" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
