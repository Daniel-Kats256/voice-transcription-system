import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * TranscriptModal Component
 * 
 * A reusable modal component for displaying user transcripts with:
 * - Loading states and error handling
 * - Pagination for large transcript lists
 * - Search functionality within transcripts
 * - Export functionality
 * - Responsive design
 */
const TranscriptModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  userName, 
  isAdmin = false,
  currentUserId = null 
}) => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSlowLoad, setIsSlowLoad] = useState(false);
  
  const ITEMS_PER_PAGE = 5;

  // Fetch transcripts when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchTranscripts();
    }
    // Reset state when modal closes
    if (!isOpen) {
      setTranscripts([]);
      setError('');
      setSearchTerm('');
      setCurrentPage(1);
    }
  }, [isOpen, userId]);

  /**
   * Fetch transcripts for the specified user
   * Includes permission check for non-admin users
   */
  const fetchTranscripts = async () => {
    // Permission check: non-admin users can only view their own transcripts
    if (!isAdmin && currentUserId && parseInt(userId) !== parseInt(currentUserId)) {
      setError('You can only view your own transcripts.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Show slow loading indicator after 2 seconds
      const slowTimer = setTimeout(() => setIsSlowLoad(true), 2000);
      
      const response = await api.get(`/transcripts/${userId}`);
      setTranscripts(response.data || []);
      
      clearTimeout(slowTimer);
      setIsSlowLoad(false);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to load transcripts'
      );
      setIsSlowLoad(false);
    } finally {
      setLoading(false);
    }
  };

  // Filter transcripts based on search term
  const filteredTranscripts = transcripts.filter(transcript =>
    transcript.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredTranscripts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTranscripts = filteredTranscripts.slice(
    startIndex, 
    startIndex + ITEMS_PER_PAGE
  );

  /**
   * Export transcripts as text file
   */
  const exportTranscripts = () => {
    if (transcripts.length === 0) return;
    
    const content = transcripts
      .map(t => `${new Date(t.createdAt).toLocaleString()}\n${t.content}\n${'='.repeat(50)}`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcripts_${userName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="transcript-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h4 className="modal-title">
            📝 Transcripts for {userName}
            {transcripts.length > 0 && (
              <span className="transcript-count">({transcripts.length})</span>
            )}
          </h4>
          <button className="close-button" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Loading and Error States */}
          {isSlowLoad && (
            <div className="slow-banner">
              Loading transcripts... This may take longer than usual.
            </div>
          )}
          
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              Loading transcripts...
            </div>
          ) : transcripts.length === 0 && !error ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No transcripts found for this user.</p>
            </div>
          ) : (
            <>
              {/* Search and Export Controls */}
              <div className="modal-controls">
                <div className="search-container">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search transcripts..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                
                {transcripts.length > 0 && (
                  <button 
                    className="export-button"
                    onClick={exportTranscripts}
                    title="Export all transcripts"
                  >
                    📄 Export
                  </button>
                )}
              </div>

              {/* Transcripts List */}
              {filteredTranscripts.length === 0 ? (
                <div className="no-results">
                  No transcripts match your search term "{searchTerm}"
                </div>
              ) : (
                <>
                  <div className="transcripts-list">
                    {paginatedTranscripts.map((transcript) => (
                      <div key={transcript.id} className="transcript-item">
                        <div className="transcript-header">
                          <span className="transcript-date">
                            {new Date(transcript.createdAt).toLocaleString()}
                          </span>
                          <span className="transcript-id">
                            ID: {transcript.id}
                          </span>
                        </div>
                        <div className="transcript-content">
                          {transcript.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        ← Previous
                      </button>
                      
                      <span className="page-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        className="pagination-button"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptModal;