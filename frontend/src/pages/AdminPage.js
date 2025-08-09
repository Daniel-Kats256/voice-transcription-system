import React, { useEffect, useState, useRef, useMemo } from 'react';
import api from '../api';
import TranscriptModal from '../components/TranscriptModal';

const AdminPage = () => {
  const [adminName, setAdminName] = useState(localStorage.getItem('name') || 'Admin');
  const [activeTab, setActiveTab] = useState('addUser');

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [usersSlow, setUsersSlow] = useState(false);
  const usersSlowTimerRef = useRef(null);

  const [userSearch, setUserSearch] = useState('');

  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'officer' });
  const [actionError, setActionError] = useState('');

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [transcriptsByUser, setTranscriptsByUser] = useState({});
  const [transcriptsLoading, setTranscriptsLoading] = useState(false);
  const [transcriptsError, setTranscriptsError] = useState('');
  const [transcriptsSlow, setTranscriptsSlow] = useState(false);
  const trSlowTimerRef = useRef(null);

  const [activeTranscript, setActiveTranscript] = useState(null);

  useEffect(() => {
    // Role guard: only admins can access
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      window.location.href = '/';
      return;
    }

    const loadMe = async () => {
      try {
        const res = await api.get('/me');
        const name = res.data?.user?.name || localStorage.getItem('name') || 'Admin';
        setAdminName(name);
        if (!localStorage.getItem('name') && name) {
          localStorage.setItem('name', name);
        }
      } catch (_) {
        // ignore, fallback to cached name
      }
    };
    loadMe();
    fetchUsers();
    return () => {
      if (usersSlowTimerRef.current) clearTimeout(usersSlowTimerRef.current);
      if (trSlowTimerRef.current) clearTimeout(trSlowTimerRef.current);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    window.location.href = '/';
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');
      if (usersSlowTimerRef.current) clearTimeout(usersSlowTimerRef.current);
      usersSlowTimerRef.current = setTimeout(() => setUsersSlow(true), 2000);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setUsersError('Failed to fetch users: ' + (err.response?.data?.error || err.message));
    } finally {
      setUsersLoading(false);
      if (usersSlowTimerRef.current) clearTimeout(usersSlowTimerRef.current);
      setUsersSlow(false);
    }
  };

  const addUser = async () => {
    try {
      setActionError('');
      await api.post('/admin/users', formData);
      setFormData({ name: '', username: '', password: '', role: 'officer' });
      fetchUsers();
      setActiveTab('viewUsers');
    } catch (err) {
      setActionError('Failed to add user: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      setActionError('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  const fetchTranscripts = async (userId) => {
    try {
      setTranscriptsLoading(true);
      setTranscriptsError('');
      if (trSlowTimerRef.current) clearTimeout(trSlowTimerRef.current);
      trSlowTimerRef.current = setTimeout(() => setTranscriptsSlow(true), 2000);
      const res = await api.get(`/transcripts/${userId}`);
      setTranscriptsByUser(prev => ({ ...prev, [userId]: res.data }));
      setSelectedUserId(userId);
    } catch (err) {
      setTranscriptsError('Failed to fetch transcripts: ' + (err.response?.data?.error || err.message));
    } finally {
      setTranscriptsLoading(false);
      if (trSlowTimerRef.current) clearTimeout(trSlowTimerRef.current);
      setTranscriptsSlow(false);
    }
  };

  const addTranscriptForUser = async (targetUserId, content) => {
    try {
      setActionError('');
      await api.post('/admin/transcripts', { userId: targetUserId, content });
      if (selectedUserId === targetUserId) {
        fetchTranscripts(targetUserId);
      }
      alert('Transcript added');
    } catch (err) {
      setActionError('Failed to add transcript: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredUsers = useMemo(() => {
    const lower = userSearch.toLowerCase();
    return users.filter(u =>
      String(u.name || '').toLowerCase().includes(lower) ||
      String(u.username || '').toLowerCase().includes(lower) ||
      String(u.role || '').toLowerCase().includes(lower)
    );
  }, [userSearch, users]);

  const Sidebar = () => (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-avatar">{String(adminName || 'A').charAt(0).toUpperCase()}</div>
        <div>
          <div className="small text-muted">Signed in as</div>
          <div className="fw-bold">{adminName}</div>
        </div>
      </div>
      <div className="list-group list-group-flush">
        <button className={`list-group-item list-group-item-action ${activeTab === 'addUser' ? 'active' : ''}`} onClick={() => setActiveTab('addUser')}>Add User</button>
        <button className={`list-group-item list-group-item-action ${activeTab === 'viewUsers' ? 'active' : ''}`} onClick={() => setActiveTab('viewUsers')}>View Users</button>
        <button className={`list-group-item list-group-item-action ${activeTab === 'addTranscript' ? 'active' : ''}`} onClick={() => setActiveTab('addTranscript')}>Add Transcript</button>
        <button className={`list-group-item list-group-item-action ${activeTab === 'viewTranscripts' ? 'active' : ''}`} onClick={() => setActiveTab('viewTranscripts')}>View Transcripts</button>
      </div>
      <div className="mt-auto p-3">
        <button className="btn btn-outline-secondary w-100" onClick={logout}>Logout</button>
      </div>
    </div>
  );

  const AddUserPanel = () => (
    <div className="card p-4 shadow-sm">
      <h4 className="mb-3">Add New User</h4>
      {actionError && <div className="error-banner mb-2">{actionError}</div>}
      <div className="form-group mb-2">
        <input className="form-control" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
      </div>
      <div className="form-group mb-2">
        <input className="form-control" placeholder="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
      </div>
      <div className="form-group mb-2">
        <input type="password" className="form-control" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
      </div>
      <div className="form-group mb-3">
        <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
          <option value="officer">Officer</option>
          <option value="deaf">Deaf User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="d-flex justify-content-end">
        <button className="btn btn-primary" onClick={addUser}>Add User</button>
      </div>
    </div>
  );

  const ViewUsersPanel = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">All Users</h4>
        <div style={{ width: 280 }}>
          <input className="form-control" placeholder="Search users" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
        </div>
      </div>
      {usersSlow && <div className="slow-banner mb-2">Loading users…</div>}
      {usersError && <div className="error-banner mb-2">{usersError}</div>}
      {usersLoading ? (
        <div>Loading…</div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th style={{ width: 120 }}>Role</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-info" onClick={() => fetchTranscripts(u.id)}>View Transcripts</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUserId && (
        <div className="card mt-4 p-3 shadow-sm">
          <h5>Transcripts for User ID: {selectedUserId}</h5>
          {transcriptsSlow && <div className="slow-banner mb-2">Loading transcripts…</div>}
          {transcriptsError && <div className="error-banner mb-2">{transcriptsError}</div>}
          {transcriptsLoading ? (
            <div>Loading…</div>
          ) : transcriptsByUser[selectedUserId]?.length > 0 ? (
            <ul className="list-group">
              {transcriptsByUser[selectedUserId].map((t, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{new Date(t.createdAt).toLocaleString()}:</strong> {String(t.content).slice(0, 120)}{String(t.content).length > 120 ? '…' : ''}
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => setActiveTranscript(t)}>View</button>
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

  const AddTranscriptPanel = () => {
    const [targetId, setTargetId] = useState('');
    const [content, setContent] = useState('');
    return (
      <div className="card p-4 shadow-sm">
        <h4 className="mb-3">Add Transcript For User</h4>
        {actionError && <div className="error-banner mb-2">{actionError}</div>}
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <select className="form-select" value={targetId} onChange={e => setTargetId(e.target.value)}>
              <option value="">Select user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.id} - {u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="col-md-8">
            <input className="form-control" placeholder="Short description (optional)" disabled />
          </div>
        </div>
        <textarea className="form-control mb-3" rows={10} value={content} onChange={e => setContent(e.target.value)} placeholder="Transcript content" />
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary" disabled={!targetId || !content.trim()} onClick={() => addTranscriptForUser(Number(targetId), content)}>Save Transcript</button>
        </div>
      </div>
    );
  };

  const ViewTranscriptsPanel = () => {
    const [targetId, setTargetId] = useState('');
    const [search, setSearch] = useState('');
    const list = useMemo(() => {
      const arr = targetId ? (transcriptsByUser[targetId] || []) : [];
      const lower = search.toLowerCase();
      return arr.filter(t => String(t.content || '').toLowerCase().includes(lower));
    }, [targetId, search, transcriptsByUser[targetId]]);

    useEffect(() => {
      if (targetId) fetchTranscripts(targetId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetId]);

    return (
      <div>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <select className="form-select" value={targetId} onChange={e => setTargetId(e.target.value)}>
              <option value="">Select user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.id} - {u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="col-md-8">
            <input className="form-control" placeholder="Search transcripts" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {targetId ? (
          transcriptsLoading ? (
            <div>Loading…</div>
          ) : (
            <ul className="list-group">
              {list.map((t, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{new Date(t.createdAt).toLocaleString()}:</strong> {String(t.content).slice(0, 120)}{String(t.content).length > 120 ? '…' : ''}
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => setActiveTranscript(t)}>View</button>
                </li>
              ))}
              {list.length === 0 && (
                <li className="list-group-item">No transcripts match your search.</li>
              )}
            </ul>
          )
        ) : (
          <div className="alert alert-info">Select a user to view transcripts.</div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-page">
      <Sidebar />
      <div className="admin-content">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="text-center mb-4 page-title">Admin Panel</h2>
          <div />
        </div>

        {usersSlow && <div className="slow-banner mb-2">Loading data…</div>}
        {actionError && activeTab !== 'addUser' && <div className="error-banner mb-2">{actionError}</div>}

        {activeTab === 'addUser' && <AddUserPanel />}
        {activeTab === 'viewUsers' && <ViewUsersPanel />}
        {activeTab === 'addTranscript' && <AddTranscriptPanel />}
        {activeTab === 'viewTranscripts' && <ViewTranscriptsPanel />}
      </div>

      <TranscriptModal transcript={activeTranscript} onHide={() => setActiveTranscript(null)} />
    </div>
  );
};

export default AdminPage;
