import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TranscriptionPage from './pages/TranscriptionPage';
import CreateUserPage from './pages/CreateUserPage';
import AdminPage from './pages/AdminPage';
// NEW IMPORTS
import AdminLayout from './components/AdminLayout';
import AddUserPage from './pages/AddUserPage';
import ViewUsersPage from './pages/ViewUsersPage';
import AddTranscriptPage from './pages/AddTranscriptPage';
import ViewTranscriptsPage from './pages/ViewTranscriptsPage';
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

          {/* Admin routes with sidebar layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<ViewUsersPage />} />
            <Route path="add-user" element={<AddUserPage />} />
            <Route path="view-users" element={<ViewUsersPage />} />
            <Route path="add-transcript" element={<AddTranscriptPage />} />
            <Route path="view-transcripts" element={<ViewTranscriptsPage />} />
          </Route>

          {/* Legacy admin page for direct access, kept for backward compatibility */}
          <Route path="/admin-legacy" element={<AdminPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
