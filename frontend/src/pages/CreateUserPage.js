import React, { useState, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const CreateUserPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'officer',
  });
  const [loading, setLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const slowTimerRef = useRef(null);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = { ...formData };
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => setIsSlow(true), 2000);
      await api.post('/register', payload);
      alert('User created successfully!');
      navigate('/');
    } catch (err) {
      setError('Registration failed: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsSlow(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="page page-large container-fluid" style={{ maxWidth: '600px' }}>
      <h3 className="mb-4 text-center page-title">Create Account</h3>

      {isSlow && <div className="slow-banner mb-2">Creating account is taking longer than usual. This might be due to network speed.</div>}
      {error && <div className="error-banner mb-2">{error}</div>}

      <div className="form-group mb-3">
        <label>Name</label>
        <input
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group mb-3">
        <label>Username</label>
        <input
          name="username"
          className="form-control"
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div className="form-group mb-3">
        <label>Password</label>
        <input
          type="password"
          name="password"
          className="form-control"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div className="form-group mb-4">
        <label>Role</label>
        <select
          name="role"
          className="form-select"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="officer">Officer</option>
          <option value="deaf">Deaf User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className='d-flex'>
        <button className="btn btn-primary w-80 mb-2" onClick={handleRegister} disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>
        <button className="btn btn-secondary w-80 mb-2 ms-auto" onClick={handleGoBack}>
          Back
        </button>
      </div>
    </div>
  );
};

export default CreateUserPage;
