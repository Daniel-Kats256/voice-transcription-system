import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../api';

/**
 * AdminAddTranscript Component
 * 
 * Admin page for adding transcripts on behalf of users with:
 * - User selection dropdown
 * - Transcript content input
 * - Form validation
 * - Success feedback and navigation
 */
const AdminAddTranscript = () => {
  const navigate = useNavigate();
  const { adminId } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Fetch all users for the dropdown
   */
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/admin/users');
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingUsers(false);
    }
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};

    // User selection validation
    if (!formData.userId) {
      errors.userId = 'Please select a user';
    }

    // Content validation
    if (!formData.content.trim()) {
      errors.content = 'Transcript content is required';
    } else if (formData.content.trim().length < 10) {
      errors.content = 'Transcript content must be at least 10 characters';
    } else if (formData.content.trim().length > 5000) {
      errors.content = 'Transcript content must be less than 5000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare data for API call
      const transcriptData = {
        userId: parseInt(formData.userId),
        content: formData.content.trim()
      };

      await api.post('/transcripts', transcriptData);
      
      const selectedUser = users.find(u => u.id.toString() === formData.userId);
      setSuccess(`Transcript has been added successfully for user "${selectedUser?.name}"!`);
      
      // Reset form
      setFormData({
        userId: '',
        content: ''
      });

      // Redirect to transcripts page after a short delay
      setTimeout(() => {
        navigate('/admin/transcripts');
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to add transcript'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get character count info
   */
  const getCharacterCount = () => {
    const count = formData.content.length;
    const maxCount = 5000;
    const percentage = (count / maxCount) * 100;
    
    let className = 'character-count';
    if (percentage > 90) className += ' danger';
    else if (percentage > 75) className += ' warning';
    
    return { count, maxCount, className };
  };

  const characterInfo = getCharacterCount();

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Add Transcript</h1>
        <p className="page-subtitle">Create a new transcript on behalf of a user</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="success-banner">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Loading Users */}
      {loadingUsers ? (
        <div className="loading-state">
          <div className="spinner"></div>
          Loading users...
        </div>
      ) : (
        <>
          {/* Transcript Creation Form */}
          <div className="form-container">
            <form onSubmit={handleSubmit} className="transcript-form">
              
              {/* User Selection */}
              <div className="form-group">
                <label htmlFor="userId" className="form-label">
                  Select User *
                </label>
                <select
                  id="userId"
                  name="userId"
                  className={`form-select ${validationErrors.userId ? 'error' : ''}`}
                  value={formData.userId}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="">-- Select a user --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.name} ({user.username}) - {user.role}
                    </option>
                  ))}
                </select>
                {validationErrors.userId && (
                  <span className="error-text">{validationErrors.userId}</span>
                )}
                <small className="form-help">
                  Choose the user for whom this transcript is being created
                </small>
              </div>

              {/* Transcript Content */}
              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  Transcript Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  className={`form-textarea ${validationErrors.content ? 'error' : ''}`}
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter the transcript content here..."
                  rows={10}
                  disabled={loading}
                />
                <div className="textarea-footer">
                  <span className={characterInfo.className}>
                    {characterInfo.count} / {characterInfo.maxCount} characters
                  </span>
                </div>
                {validationErrors.content && (
                  <span className="error-text">{validationErrors.content}</span>
                )}
                <small className="form-help">
                  Enter the complete transcript content. Minimum 10 characters, maximum 5000 characters.
                </small>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/transcripts')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !formData.userId || !formData.content.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Adding Transcript...
                    </>
                  ) : (
                    'Add Transcript'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="help-section">
            <h3>Transcript Creation Guidelines</h3>
            <ul className="help-list">
              <li>Select the appropriate user from the dropdown list</li>
              <li>Ensure transcript content is accurate and complete</li>
              <li>Use proper punctuation and formatting for readability</li>
              <li>Double-check the content before submitting</li>
              <li>Transcripts will be associated with the selected user</li>
              <li>Users can view their transcripts from their dashboard</li>
            </ul>
          </div>

          {/* Quick Stats */}
          {users.length > 0 && (
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-number">{users.length}</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{users.filter(u => u.role === 'officer').length}</span>
                <span className="stat-label">Officers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{users.filter(u => u.role === 'deaf').length}</span>
                <span className="stat-label">Deaf Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
                <span className="stat-label">Administrators</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAddTranscript;