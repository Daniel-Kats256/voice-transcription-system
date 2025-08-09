import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

/**
 * AdminAddUser Component
 * 
 * Admin page for adding new users to the system with:
 * - User registration form with validation
 * - Role selection
 * - Form validation and error handling
 * - Success feedback and navigation
 */
const AdminAddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'officer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

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

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm the password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!['admin', 'officer', 'deaf'].includes(formData.role)) {
      errors.role = 'Please select a valid role';
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

      // Prepare data for API call (exclude confirmPassword)
      const userData = {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      };

      await api.post('/admin/users', userData);
      
      setSuccess(`User "${userData.name}" has been created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'officer'
      });

      // Redirect to users page after a short delay
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to create user'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate a strong password suggestion
   */
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Add New User</h1>
        <p className="page-subtitle">Create a new user account for the system</p>
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

      {/* User Creation Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="user-form">
          
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${validationErrors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter user's full name"
              disabled={loading}
            />
            {validationErrors.name && (
              <span className="error-text">{validationErrors.name}</span>
            )}
          </div>

          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${validationErrors.username ? 'error' : ''}`}
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username (letters, numbers, underscores only)"
              disabled={loading}
            />
            {validationErrors.username && (
              <span className="error-text">{validationErrors.username}</span>
            )}
          </div>

          {/* Role Field */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              User Role *
            </label>
            <select
              id="role"
              name="role"
              className={`form-select ${validationErrors.role ? 'error' : ''}`}
              value={formData.role}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="officer">Officer</option>
              <option value="deaf">Deaf User</option>
              <option value="admin">Administrator</option>
            </select>
            {validationErrors.role && (
              <span className="error-text">{validationErrors.role}</span>
            )}
            <small className="form-help">
              • <strong>Officer:</strong> Can create transcripts and view their own<br/>
              • <strong>Deaf User:</strong> Can view their own transcripts<br/>
              • <strong>Administrator:</strong> Full system access
            </small>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password *
            </label>
            <div className="password-input-group">
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter a secure password (min 6 characters)"
                disabled={loading}
              />
              <button
                type="button"
                className="generate-password-btn"
                onClick={generatePassword}
                disabled={loading}
                title="Generate secure password"
              >
                🎲
              </button>
            </div>
            {validationErrors.password && (
              <span className="error-text">{validationErrors.password}</span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter the password"
              disabled={loading}
            />
            {validationErrors.confirmPassword && (
              <span className="error-text">{validationErrors.confirmPassword}</span>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/users')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating User...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>User Creation Guidelines</h3>
        <ul className="help-list">
          <li>Use meaningful usernames that users can easily remember</li>
          <li>Generate strong passwords or advise users to change them on first login</li>
          <li>Assign the appropriate role based on the user's responsibilities</li>
          <li>Officers can create and view their own transcripts</li>
          <li>Deaf users can only view their own transcripts</li>
          <li>Administrators have full system access</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAddUser;