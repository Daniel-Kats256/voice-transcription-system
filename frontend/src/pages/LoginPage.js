import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const res = await axios.post('http://localhost:5000/login', { username, password });
    const { userId, role } = res.data;
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    if (role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  } catch (err) {
    alert('Login failed');
  }
};

  return (
   <div className="container mt-5">
  <h2 className="mb-4 text-center">Login</h2>
  <div className="mb-3">
    <input className="form-control" placeholder="Username" onChange={e => setUsername(e.target.value)} />
  </div>
  <div className="mb-3">
    <input type="password" className="form-control" placeholder="Password" onChange={e => setPassword(e.target.value)} />
  </div>
  <button className="btn btn-primary" onClick={handleLogin}>Login</button>
  <button className="btn btn-secondary ms-5 text-end" onClick={() => navigate('/register')}>
  Create Account
</button>

</div>

  );
};
export default LoginPage;
