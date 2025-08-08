import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [transcripts, setTranscripts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return navigate('/');

    const fetchTranscripts = async () => {
      const res = await api.get(`/transcripts/${userId}`);
      setTranscripts(res.data);
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
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Dashboard</h2>
        <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
      </div>
      <button className="btn btn-success mb-3" onClick={() => navigate('/transcribe')}>New Transcription</button>
      <ul className="list-group">
        {transcripts.map((t, idx) => (
          <li className="list-group-item" key={idx}>
            <strong>{new Date(t.createdAt).toLocaleString()}:</strong> {t.content}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Dashboard;
