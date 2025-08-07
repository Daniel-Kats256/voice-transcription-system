import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateUserPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'officer', // default role
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/admin/users', formData); // Adjusted endpoint
      alert('User created successfully!');
      navigate('/');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h3 className="mb-4 text-center">Create Account</h3>

      <div className="form-group mb-3">
        <label>Name</label>
        <input
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group mb-3">
        <label>Username</label>
        <input
          name="username"
          className="form-control"
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div className="form-group mb-3">
        <label>Password</label>
        <input
          type="password"
          name="password"
          className="form-control"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div className="form-group mb-4">
        <label>Role</label>
        <select
          name="role"
          className="form-select"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="officer">Officer</option>
          <option value="deaf">Deaf User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className='d-flex'>

        <button className="btn btn-primary w-80 mb-2" onClick={handleRegister}>
          Register
        </button>

        <button className="btn btn-secondary w-80 mb-2 ms-auto" onClick={handleGoBack}>
          Back
        </button>
      </div>
    </div>
  );
};

export default CreateUserPage;
