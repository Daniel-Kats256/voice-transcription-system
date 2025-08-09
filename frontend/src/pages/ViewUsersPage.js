import React, { useEffect, useState, useRef } from 'react';
import api from '../api';

/**
 * ViewUsersPage - shows list of all users and allows admin to view/delete.
 * Extracted from original AdminPage for separation of concerns.
 */
const ViewUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState('');
  const slowTimerRef = useRef(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => setIsSlow(true), 2000);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsSlow(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    fetchUsers();
    return () => slowTimerRef.current && clearTimeout(slowTimerRef.current);
  }, []);

  return (
    <div>
      <h2 className="mb-3">Users</h2>
      {isSlow && <div className="slow-banner mb-2">Loading users… This may be caused by a slow network or server.</div>}
      {error && <div className="error-banner mb-2">{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewUsersPage;