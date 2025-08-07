// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

dotenv.config();
const app = express();

// CORS
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Parsers
app.use(bodyParser.json());

// Rate limiting (basic)
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use(authLimiter);

// DB pool or mock
const useMock = process.env.MOCK_DB === '1';

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'transcripts_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

async function query(sql, params) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// Simple in-memory mock store for development
const mockStore = {
  users: [],
  transcripts: [],
  nextUserId: 1,
  nextTranscriptId: 1,
};

// DAO helpers
async function getUserByUsername(username) {
  if (useMock) {
    return mockStore.users.find(u => u.username === username) || null;
  }
  const rows = await query('SELECT id, name, username, role, password FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}

async function listUsers() {
  if (useMock) {
    return mockStore.users.map(({ password, ...rest }) => rest).sort((a, b) => b.id - a.id);
  }
  return await query('SELECT id, name, username, role FROM users ORDER BY id DESC');
}

async function createUser({ name, username, passwordHash, role }) {
  if (useMock) {
    if (mockStore.users.some(u => u.username === username)) {
      const err = new Error('Username already exists');
      err.code = 'DUP';
      throw err;
    }
    const user = { id: mockStore.nextUserId++, name, username, password: passwordHash, role };
    mockStore.users.push(user);
    return { id: user.id };
  }
  await query('INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)', [
    name,
    username,
    passwordHash,
    role,
  ]);
}

async function deleteUser(id) {
  if (useMock) {
    mockStore.users = mockStore.users.filter(u => u.id !== id);
    mockStore.transcripts = mockStore.transcripts.filter(t => t.userId !== id);
    return;
  }
  await query('DELETE FROM users WHERE id = ?', [id]);
}

async function insertTranscript({ userId, content }) {
  if (useMock) {
    const t = { id: mockStore.nextTranscriptId++, userId, content, createdAt: new Date() };
    mockStore.transcripts.push(t);
    return { id: t.id };
  }
  await query('INSERT INTO transcripts (userId, content, createdAt) VALUES (?, ?, NOW())', [userId, content]);
}

async function listTranscriptsByUser(userId) {
  if (useMock) {
    return mockStore.transcripts
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return await query('SELECT id, userId, content, createdAt FROM transcripts WHERE userId = ? ORDER BY createdAt DESC', [userId]);
}

// Seed mock admin for convenience
if (useMock && mockStore.users.length === 0) {
  const defaultAdminPass = 'Admin@123';
  bcrypt.hash(defaultAdminPass, 10).then(hash => {
    mockStore.users.push({
      id: mockStore.nextUserId++,
      name: 'Administrator',
      username: 'admin',
      password: hash,
      role: 'admin',
      createdAt: new Date(),
    });
    // eslint-disable-next-line no-console
    console.log('Mock DB seeded with admin/admin');
  });
}

// Auth helpers
function getTokenFromRequest(req) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) return token;
  return null;
}

function authenticate(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { id: payload.id, role: payload.role, name: payload.name };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

// Health
app.get('/health', async (req, res) => {
  if (useMock) return res.json({ status: 'ok', mode: 'mock', time: new Date().toISOString() });
  try {
    await getPool().query('SELECT 1');
    res.json({ status: 'ok', mode: 'mysql', time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ status: 'error', error: e.message });
  }
});

// Registration (public)
app.post('/register', async (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const safeRole = role && ['officer', 'deaf'].includes(role) ? role : 'officer';

    const existing = await getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await createUser({ name, username, passwordHash: hashed, role: safeRole });
    return res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );
    return res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Transcripts (auth required)
app.post('/transcripts', authenticate, async (req, res) => {
  const { content, userId } = req.body;
  try {
    if (!content || !content.trim()) return res.status(400).json({ message: 'Content is required' });
    const effectiveUserId = req.user.role === 'admin' && userId ? userId : req.user.id;
    await insertTranscript({ userId: Number(effectiveUserId), content });
    return res.status(201).json({ message: 'Transcript saved.' });
  } catch (err) {
    console.error('Save transcript error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/transcripts/:userId', authenticate, async (req, res) => {
  try {
    const requestedUserId = Number(req.params.userId);
    if (Number.isNaN(requestedUserId)) return res.status(400).json({ message: 'Invalid user id' });
    if (req.user.role !== 'admin' && req.user.id !== requestedUserId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const rows = await listTranscriptsByUser(requestedUserId);
    return res.json(rows);
  } catch (err) {
    console.error('Get transcripts error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Admin: Manage users
app.get('/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const rows = await listUsers();
    return res.json(rows);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/admin/users', authenticate, requireAdmin, async (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    if (!name || !username || !password || !role) return res.status(400).json({ message: 'Missing fields' });
    const existing = await getUserByUsername(username);
    if (existing) return res.status(409).json({ message: 'Username already exists' });
    const hashed = await bcrypt.hash(password, 10);
    await createUser({ name, username, passwordHash: hashed, role });
    return res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid id' });
    await deleteUser(id);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} (mode: ${useMock ? 'mock' : 'mysql'})`));
