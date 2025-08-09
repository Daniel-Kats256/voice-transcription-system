import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  // Retrieve logged in user info from localStorage (simple client-side session)
  const adminName = localStorage.getItem('name') || 'Admin';

  return (
    <div className="sidebar d-flex flex-column p-3 text-bg-dark" style={{ minHeight: '100vh', width: '250px' }}>
      <h4 className="mb-4">{adminName}</h4>

      {/* Navigation links */}
      <nav className="nav nav-pills flex-column gap-2">
        <NavLink to="add-user" className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : 'text-white')}>Add User</NavLink>
        <NavLink to="view-users" className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : 'text-white')}>View Users</NavLink>
        <NavLink to="add-transcript" className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : 'text-white')}>Add Transcript</NavLink>
        <NavLink to="view-transcripts" className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : 'text-white')}>View Transcripts</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;