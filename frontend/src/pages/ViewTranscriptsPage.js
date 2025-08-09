import React, { useEffect, useState, useRef } from 'react';
import api from '../api';

const ViewTranscriptsPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [transcripts, setTranscripts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [errorUsers, setErrorUsers] = useState('');
  const [errorTranscripts, setErrorTranscripts] = useState('');
  const usersSlowTimerRef = useRef(null);
  const trSlowTimerRef = useRef(null);
  const [isSlowUsers, setIsSlowUsers] = useState(false);
  const [isSlowTranscripts, setIsSlowTranscripts] = useState(false);

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

  const fetchTranscripts = async (uid) => {
    if (!uid) return;
    try {
      setLoadingTranscripts(true);
      setErrorTranscripts('');
      if (trSlowTimerRef.current) clearTimeout(trSlowTimerRef.current);
      trSlowTimerRef.current = setTimeout(() => setIsSlowTranscripts(true), 2000);
      const res = await api.get(`/transcripts/${uid}`);
      setTranscripts(res.data);
    } catch (err) {
      setErrorTranscripts('Failed to fetch transcripts: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingTranscripts(false);
      if (trSlowTimerRef.current) clearTimeout(trSlowTimerRef.current);
      setIsSlowTranscripts(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    return () => {
      if (usersSlowTimerRef.current) clearTimeout(usersSlowTimerRef.current);
      if (trSlowTimerRef.current) clearTimeout(trSlowTimerRef.current);
    };
  }, []);

  const handleUserChange = (e) => {
    const uid = e.target.value;
    setSelectedUserId(uid);
    fetchTranscripts(uid);
  };

  return (
    <div>
      <h2 className="mb-3">Transcripts</h2>

      {isSlowUsers && <div className="slow-banner mb-2">Loading users…</div>}
      {errorUsers && <div className="error-banner mb-2">{errorUsers}</div>}
      {loadingUsers ? (
        <div>Loading users…</div>
      ) : (
        <div className="mb-3">
          <label>Select user:</label>
          <select className="form-select" value={selectedUserId} onChange={handleUserChange}>
            <option value="">-- Choose --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.username})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedUserId && (
        <div className="card p-3">
          <h5 className="mb-3">Transcripts for User ID: {selectedUserId}</h5>
          {isSlowTranscripts && <div className="slow-banner mb-2">Loading transcripts…</div>}
          {errorTranscripts && <div className="error-banner mb-2">{errorTranscripts}</div>}
          {loadingTranscripts ? (
            <div>Loading…</div>
          ) : transcripts.length > 0 ? (
            <ul className="list-group">
              {transcripts.map((t, idx) => (
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

export default ViewTranscriptsPage;