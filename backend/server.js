// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// DB Config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

// Utility: Create connection
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// Auth helpers
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, role }
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Authentication
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM users WHERE username = ?', [username]);
    await conn.end();
    if (!rows.length || rows[0].password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const { id, name, role } = rows[0];
    const token = jwt.sign({ id, name, role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id, name, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Current user info
app.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// CRUD: Transcripts
app.post('/transcripts', authenticate, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const targetUserId = isAdmin && req.body.userId ? req.body.userId : req.user.id;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });
  try {
    const conn = await getConnection();
    await conn.execute(
      'INSERT INTO transcripts (userId, content, createdAt) VALUES (?, ?, NOW())',
      [targetUserId, content]
    );
    await conn.end();
    res.status(201).json({ message: 'Transcript saved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/transcripts', authenticate, requireAdmin, async (req, res) => {
  const { userId, content } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });
  try {
    const conn = await getConnection();
    await conn.execute(
      'INSERT INTO transcripts (userId, content, createdAt) VALUES (?, ?, NOW())',
      [userId, content]
    );
    await conn.end();
    res.status(201).json({ message: 'Transcript saved for user.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/transcripts/:userId', authenticate, async (req, res) => {
  const requestedUserId = String(req.params.userId);
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && String(req.user.id) !== requestedUserId) {
    return res.status(403).json({ error: 'Not authorized to view these transcripts' });
  }
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM transcripts WHERE userId = ?', [requestedUserId]);
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Manage users
app.get('/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT id, name, username, role FROM users');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/users', authenticate, requireAdmin, async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password || !role) {
    return res.status(400).json({ error: 'name, username, password, and role are required' });
  }
  try {
    const conn = await getConnection();
    await conn.execute(
      'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
      [name, username, password, role]
    );
    await conn.end();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const conn = await getConnection();
    await conn.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    await conn.end();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
