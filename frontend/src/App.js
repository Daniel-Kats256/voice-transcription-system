import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TranscriptionPage from './pages/TranscriptionPage';
import CreateUserPage from './pages/CreateUserPage';
import AdminPage from './pages/AdminPage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAddUser from './pages/admin/AdminAddUser';
import AdminTranscripts from './pages/admin/AdminTranscripts';
import AdminAddTranscript from './pages/admin/AdminAddTranscript';
import './styles.css';

function App() {
  return (
    <div className="app-root">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<CreateUserPage />} />
          <Route path="/transcribe" element={<TranscriptionPage />} />
          
          {/* Legacy admin route for backward compatibility */}
          <Route path="/admin-legacy" element={<AdminPage />} />
          
          {/* New Admin Panel with Sidebar Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="add-user" element={<AdminAddUser />} />
            <Route path="transcripts" element={<AdminTranscripts />} />
            <Route path="add-transcript" element={<AdminAddTranscript />} />
            {/* Default admin route redirects to dashboard */}
            <Route index element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
