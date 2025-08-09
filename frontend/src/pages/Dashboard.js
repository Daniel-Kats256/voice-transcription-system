import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Dashboard = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState('');
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState(null);
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
    localStorage.removeItem('name');
    navigate('/');
  };

  const handleOpenModal = (transcript) => {
    setCurrentTranscript(transcript);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentTranscript(null);
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
            <li
              role="button"
              className="list-group-item d-flex justify-content-between align-items-center"
              key={idx}
              onClick={() => handleOpenModal(t)}
            >
              <span><strong>{new Date(t.createdAt).toLocaleString()}:</strong> {t.content.slice(0, 50)}{t.content.length > 50 ? '…' : ''}</span>
              <span className="badge bg-primary">View</span>
            </li>
          ))}
        </ul>
      )}

      {/* Transcript modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Transcript Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTranscript ? (
            <>
              <p><strong>Date:</strong> {new Date(currentTranscript.createdAt).toLocaleString()}</p>
              <p>{currentTranscript.content}</p>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Dashboard;
