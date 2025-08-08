import React, { useEffect, useState, useRef } from 'react';
import api from '../api';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'officer',
  });
  const [transcripts, setTranscripts] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [isSlowUsers, setIsSlowUsers] = useState(false);
  const [isSlowTranscripts, setIsSlowTranscripts] = useState(false);
  const [errorUsers, setErrorUsers] = useState('');
  const [errorTranscripts, setErrorTranscripts] = useState('');
  const [actionError, setActionError] = useState('');

  const usersSlowTimerRef = useRef(null);
  const trSlowTimerRef = useRef(null);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setErrorUsers('');
      if (usersSlowTimerRef.current) clearTimeout(usersSlowTimerRef.current);
      usersSlowTimerRef.current = setTimeout(() => setIsSlowUsers(true), 2000);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setErrorUsers('Failed to fetch users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingUsers(false);
      if (usersSlowTimerRef.current) clearTimeout(usersSlowTimerRef.current);
      setIsSlowUsers(false);
    }
  };

  const fetchTranscripts = async (userId) => {
    try {
      setLoadingTranscripts(true);
      setErrorTranscripts('');
      if (trSlowTimerRef.current) clearTimeout(trSlowTimerRef.current);
      trSlowTimerRef.current = setTimeout(() => setIsSlowTranscripts(true), 2000);
      const res = await api.get(`/transcripts/${userId}`);
      setTranscripts(prev => ({ ...prev, [userId]: res.data }));
      setSelectedUserId(userId);
    } catch (err) {
      setErrorTranscripts('Failed to fetch transcripts: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingTranscripts(false);
      if (trSlowTimerRef.current) clearTimeout(trSlowTimerRef.current);
      setIsSlowTranscripts(false);
    }
  };

  const handleAddUser = async () => {
    try {
      await api.post('/admin/users', formData);
      setFormData({ name: '', username: '', password: '', role: 'officer' });
      fetchUsers();
    } catch (err) {
      setActionError('Failed to add user: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      setActionError('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  useEffect(() => {
    fetchUsers();
    return () => {
      if (usersSlowTimerRef.current) clearTimeout(usersSlowTimerRef.current);
      if (trSlowTimerRef.current) clearTimeout(trSlowTimerRef.current);
    };
  }, []);

  return (
    <div className="page page-large container-fluid">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="text-center mb-4 page-title">Admin - User Management</h2>
        <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
      </div>

      {isSlowUsers && <div className="slow-banner mb-2">Loading users… This may be caused by a slow network or server.</div>}
      {errorUsers && <div className="error-banner mb-2">{errorUsers}</div>}
      {actionError && <div className="error-banner mb-2">{actionError}</div>}

      {/* Form Section */}
      <div className="card p-4 mb-4 shadow-sm">
        <h4 className="mb-3">Add New User</h4>
        <div className="form-group mb-2">
          <input className="form-control" placeholder="Name" value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="form-group mb-2">
          <input className="form-control" placeholder="Username" value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })} />
        </div>
        <div className="form-group mb-2">
          <input type="password" className="form-control" placeholder="Password" value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })} />
        </div>
        <div className="form-group mb-3">
          <select className="form-select" value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}>
            <option value="officer">Officer</option>
            <option value="deaf">Deaf User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" onClick={handleAddUser}>Add User</button>
        </div>
      </div>

      {/* User Table */}
      <h4 className="mb-3">All Users</h4>
      {loadingUsers ? (
        <div>Loading users…</div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th><th>Name</th><th>Username</th><th>Role</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-info" onClick={() => fetchTranscripts(u.id)}>View Transcripts</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Transcript Section */}
      {selectedUserId && (
        <div className="card mt-4 p-3 shadow-sm">
          <h5>Transcripts for User ID: {selectedUserId}</h5>
          {isSlowTranscripts && <div className="slow-banner mb-2">Loading transcripts…</div>}
          {errorTranscripts && <div className="error-banner mb-2">{errorTranscripts}</div>}
          {loadingTranscripts ? (
            <div>Loading…</div>
          ) : transcripts[selectedUserId]?.length > 0 ? (
            <ul className="list-group">
              {transcripts[selectedUserId].map((t, idx) => (
                <li key={idx} className="list-group-item">
                  <strong>{new Date(t.createdAt).toLocaleString()}:</strong> {t.content}
                </li>
              ))}
            </ul>
          ) : (
            <p>No transcripts found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
