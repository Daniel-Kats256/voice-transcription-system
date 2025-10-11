import React, { useState, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const slowTimerRef = useRef(null);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => setIsSlow(true), 2000);

    try {
      const res = await api.post('/login', { username, password });
      const { token, user, userId, role, name } = res.data;

      // Normalize backend variations
      const resolvedUser = user || { id: userId, role, name };

      // Store session data
      if (token) localStorage.setItem('token', token);
      if (resolvedUser?.id) localStorage.setItem('userId', resolvedUser.id);
      if (resolvedUser?.role) localStorage.setItem('role', resolvedUser.role);
      if (resolvedUser?.name) localStorage.setItem('name', resolvedUser.name);

      // ✅ Route based on role
      if (resolvedUser?.role === 'admin') {
        navigate('/admin');
      } else if (resolvedUser?.role === 'deaf') {
        navigate('/deaf');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsSlow(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div
        className="container-fluid shadow-sm p-5 mb-4 rounded"
        style={{
          maxWidth: '520px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }}
      >
        <h2 className="mb-4 text-center page-title">Login</h2>

        {isSlow && (
          <div className="alert alert-warning py-2">
            Login is taking longer than usual. Please wait…
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2">{error}</div>
        )}

        <div className="mb-3">
          <label><h5>Username</h5></label>
          <input
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label><h5>Password</h5></label>
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
          <button className="btn btn-secondary ms-auto" onClick={() => navigate('/register')}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
