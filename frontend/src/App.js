import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TranscriptionPage from './pages/TranscriptionPage';
import CreateUserPage from './pages/CreateUserPage';
import AdminPage from './pages/AdminPage';
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
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
