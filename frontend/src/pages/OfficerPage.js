import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TranscriptModal from '../components/TranscriptModal';

const OfficerPage = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState('');
  const [activeTranscript, setActiveTranscript] = useState(null);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('desc');
  const navigate = useNavigate();
  const slowTimerRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (!userId) return navigate('/');
    if (role !== 'officer') return navigate('/dashboard');

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
    localStorage.removeItem('name');
    navigate('/');
  };

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    const fromTime = from ? new Date(from).getTime() : null;
    const toTime = to ? new Date(to).getTime() : null;
    const data = transcripts.filter(t => {
      const content = String(t.content || '').toLowerCase();
      const created = new Date(t.createdAt).getTime();
      if (lower && !content.includes(lower)) return false;
      if (fromTime && created < fromTime) return false;
      if (toTime && created > toTime) return false;
      return true;
    });
    return data.sort((a, b) => {
      const A = new Date(a.createdAt).getTime();
      const B = new Date(b.createdAt).getTime();
      return sort === 'asc' ? A - B : B - A;
    });
  }, [search, from, to, sort, transcripts]);

  return (
    <div className="page page-large container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="page-title">Officer Workspace</h2>
        <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
      </div>

      {isSlow && <div className="slow-banner mb-2">Loading your transcripts…</div>}
      {error && <div className="error-banner mb-2">{error}</div>}

      <div className="card p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <input className="form-control" placeholder="Search content" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="col-md-3">
            <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="col-md-3">
            <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div className="col-md-2">
            <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <ul className="list-group">
          {filtered.map((t, idx) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={idx}>
              <div>
                <strong>{new Date(t.createdAt).toLocaleString()}:</strong> {String(t.content).slice(0, 160)}{String(t.content).length > 160 ? '…' : ''}
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => setActiveTranscript(t)}>View</button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="list-group-item">No transcripts match your filters.</li>
          )}
        </ul>
      )}

      <TranscriptModal transcript={activeTranscript} onHide={() => setActiveTranscript(null)} />
    </div>
  );
};

export default OfficerPage;