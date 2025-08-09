import React, { useState, useRef } from 'react';
import api from '../api';

const AddUserPage = () => {
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'officer' });
  const [loading, setLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState('');
  const slowTimerRef = useRef(null);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = async () => {
    try {
      setLoading(true);
      setError('');
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => setIsSlow(true), 2000);
      await api.post('/admin/users', formData);
      alert('User created!');
      setFormData({ name: '', username: '', password: '', role: 'officer' });
    } catch (err) {
      setError('Failed to create user: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsSlow(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 className="mb-3">Add User</h2>

      {isSlow && <div className="slow-banner mb-2">This is taking longer than usual…</div>}
      {error && <div className="error-banner mb-2">{error}</div>}

      <div className="form-group mb-2">
        <label>Name</label>
        <input name="name" className="form-control" value={formData.name} onChange={handleChange} />
      </div>
      <div className="form-group mb-2">
        <label>Username</label>
        <input name="username" className="form-control" value={formData.username} onChange={handleChange} />
      </div>
      <div className="form-group mb-2">
        <label>Password</label>
        <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} />
      </div>
      <div className="form-group mb-3">
        <label>Role</label>
        <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
          <option value="officer">Officer</option>
          <option value="deaf">Deaf User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>
        {loading ? 'Saving…' : 'Add User'}
      </button>
    </div>
  );
};

export default AddUserPage;