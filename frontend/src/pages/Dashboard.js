import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import TranscriptModal from '../components/TranscriptModal';

const Dashboard = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: '', role: '', id: '' });
  const [loading, setLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState('');
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const navigate = useNavigate();
  const slowTimerRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'User';
    const userRole = localStorage.getItem('role') || 'officer';
    
    if (!userId) return navigate('/');

    // Set user info
    setUserInfo({ name: userName, role: userRole, id: userId });

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
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Welcome back, {userInfo.name}! ({userInfo.role})</p>
        </div>
        <div className="dashboard-actions">
          {userInfo.role === 'admin' && (
            <button 
              className="btn btn-info me-2" 
              onClick={() => navigate('/admin')}
            >
              Admin Panel
            </button>
          )}
          <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      {isSlow && <div className="slow-banner mb-2">Loading your transcripts… This may be due to network slowness or server load.</div>}
      {error && <div className="error-banner mb-2">{error}</div>}

      {/* Action Buttons */}
      <div className="action-buttons mb-4">
        <button className="btn btn-success me-2" onClick={() => navigate('/transcribe')}>
          ✍️ New Transcription
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => setShowTranscriptModal(true)}
          disabled={transcripts.length === 0}
        >
          📝 View All My Transcripts ({transcripts.length})
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-summary mb-4">
        <div className="stat-item">
          <span className="stat-number">{transcripts.length}</span>
          <span className="stat-label">Total Transcripts</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {transcripts.filter(t => {
              const today = new Date().toDateString();
              return new Date(t.createdAt).toDateString() === today;
            }).length}
          </span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {transcripts.filter(t => {
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return new Date(t.createdAt) >= weekAgo;
            }).length}
          </span>
          <span className="stat-label">This Week</span>
        </div>
      </div>

      {/* Recent Transcripts Preview */}
      <div className="recent-transcripts">
        <h4 className="mb-3">Recent Transcripts</h4>
        {loading ? (
          <div>Loading…</div>
        ) : transcripts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No transcripts yet. Create your first transcription!</p>
            <button className="btn btn-success" onClick={() => navigate('/transcribe')}>
              Start Transcribing
            </button>
          </div>
        ) : (
          <div className="transcript-previews">
            {transcripts.slice(0, 3).map((t, idx) => (
              <div className="transcript-preview-card" key={idx}>
                <div className="transcript-date">
                  {new Date(t.createdAt).toLocaleString()}
                </div>
                <div className="transcript-content-preview">
                  {t.content.length > 150 
                    ? t.content.substring(0, 150) + '...'
                    : t.content
                  }
                </div>
              </div>
            ))}
            {transcripts.length > 3 && (
              <div className="view-more-card" onClick={() => setShowTranscriptModal(true)}>
                <span className="view-more-icon">👁️</span>
                <p>View {transcripts.length - 3} more transcripts</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transcript Modal */}
      <TranscriptModal
        isOpen={showTranscriptModal}
        onClose={() => setShowTranscriptModal(false)}
        userId={userInfo.id}
        userName={userInfo.name}
        isAdmin={userInfo.role === 'admin'}
        currentUserId={userInfo.id}
      />
    </div>
  );
};
export default Dashboard;
