import React, { useEffect, useState } from 'react';
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

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchTranscripts = async (userId) => {
    try {
      const res = await api.get(`/transcripts/${userId}`);
      setTranscripts(prev => ({ ...prev, [userId]: res.data }));
      setSelectedUserId(userId);
    } catch (err) {
      console.error('Failed to fetch transcripts', err);
    }
  };

  const handleAddUser = async () => {
    try {
      await api.post('/admin/users', formData);
      setFormData({ name: '', username: '', password: '', role: 'officer' });
      fetchUsers();
    } catch (err) {
      alert('Failed to add user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
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
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="text-center mb-4">Admin - User Management</h2>
        <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
      </div>

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

      {/* Transcript Section */}
      {selectedUserId && (
        <div className="card mt-4 p-3 shadow-sm">
          <h5>Transcripts for User ID: {selectedUserId}</h5>
          {transcripts[selectedUserId]?.length > 0 ? (
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
