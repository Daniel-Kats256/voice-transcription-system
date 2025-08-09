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
      const resolvedUser = user || { id: userId, role: role, name };
      if (token) localStorage.setItem('token', token);
      if (resolvedUser?.id) localStorage.setItem('userId', resolvedUser.id);
      if (resolvedUser?.role) localStorage.setItem('role', resolvedUser.role);
      if (resolvedUser?.name) localStorage.setItem('name', resolvedUser.name);
      if (resolvedUser?.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
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
   <div className='flex'>
       <div className="container-fluid" style={{ maxWidth: '520px' }}>
      <h2 className="mb-4 text-start page-title">Login</h2>
      {isSlow && (
        <div className="slow-banner mb-2">Login is taking longer than usual. Possible causes: slow network or server. Please wait…</div>
      )}
      {error && (
        <div className="error-banner mb-2">{error}</div>
      )}
      <div className="mb-3">
        <input className="form-control" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div className="mb-3">
        <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
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