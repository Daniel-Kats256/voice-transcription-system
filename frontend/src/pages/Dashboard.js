import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [transcripts, setTranscripts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return navigate('/');

    const fetchTranscripts = async () => {
      const res = await axios.get(`http://localhost:5000/transcripts/${userId}`);
      setTranscripts(res.data);
    };
    fetchTranscripts();
  }, [navigate]);

  return (
   <div className="container mt-5">
  <h2>Dashboard</h2>
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
