import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const slowTimerRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return navigate('/');

    const fetchTranscripts = async () => {
      setLoading(true);
      setError('');
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => setIsSlow(true), 2000);
      try {
        const res = await api.get(`/transcripts/${userId}`);
        setTranscripts(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load transcripts');
      } finally {
        setLoading(false);
        if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
        setIsSlow(false);
      }
    };
    fetchTranscripts();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="page page-large container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title">Dashboard</h2>
        <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
      </div>

      {isSlow && <div className="slow-banner mb-2">Loading your transcripts… This may be due to network slowness or server load.</div>}
      {error && <div className="error-banner mb-2">{error}</div>}

      <button className="btn btn-success mb-3" onClick={() => navigate('/transcribe')}>New Transcription</button>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <ul className="list-group">
          {transcripts.map((t, idx) => (
            <li className="list-group-item" key={idx}>
              <strong>{new Date(t.createdAt).toLocaleString()}:</strong> {t.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default Dashboard;
