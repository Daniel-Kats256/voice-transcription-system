// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ==========================
// DATABASE CONFIGURATION
// ==========================
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  // Important for Railway + Render
  connectTimeout: 60000,

  ssl: {
    rejectUnauthorized: false,
  },
};

// ==========================
// CREATE DATABASE CONNECTION
// ==========================
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to Railway MySQL');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

// ==========================
// TEST ROUTE
// ==========================
app.get('/', (req, res) => {
  res.json({
    message: 'Voice Transcription Backend Running Successfully',
  });
});

// ==========================
// AUTHENTICATION
// ==========================
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    await conn.end();

    if (!rows.length || rows[0].password !== password) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const { id, name, role } = rows[0];

    res.json({
      userId: id,
      name,
      role,
    });
  } catch (err) {
    console.error('Login Error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// CREATE TRANSCRIPT
// ==========================
app.post('/transcripts', async (req, res) => {
  const { content, userId } = req.body;

  try {
    const conn = await getConnection();

    await conn.execute(
      'INSERT INTO transcripts (userId, content, createdAt) VALUES (?, ?, NOW())',
      [userId, content]
    );

    await conn.end();

    res.status(201).json({
      message: 'Transcript saved.',
    });
  } catch (err) {
    console.error('Transcript Save Error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// GET USER TRANSCRIPTS
// ==========================
app.get('/transcripts/:userId', async (req, res) => {
  const requesterRole = req.headers['x-role'];
  const requesterId = req.headers['x-user-id'];

  // Authorization
  if (
    requesterRole !== 'admin' &&
    requesterId !== req.params.userId
  ) {
    return res.status(403).json({
      error: 'Forbidden',
    });
  }

  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(
      'SELECT * FROM transcripts WHERE userId = ?',
      [req.params.userId]
    );

    await conn.end();

    res.json(rows);
  } catch (err) {
    console.error('Fetch Transcript Error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// ADMIN - GET USERS
// ==========================
app.get('/admin/users', async (req, res) => {
  try {
    const conn = await getConnection();

    const [rows] = await conn.execute('SELECT * FROM users');

    await conn.end();

    res.json(rows);
  } catch (err) {
    console.error('Fetch Users Error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// ADMIN - CREATE USER
// ==========================
app.post('/admin/users', async (req, res) => {
  const { name, username, password, role } = req.body;

  try {
    const conn = await getConnection();

    await conn.execute(
      'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
      [name, username, password, role]
    );

    await conn.end();

    res.status(201).json({
      message: 'User created',
    });
  } catch (err) {
    console.error('Create User Error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// ADMIN - DELETE USER
// ==========================
app.delete('/admin/users/:id', async (req, res) => {
  try {
    const conn = await getConnection();

    await conn.execute(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    await conn.end();

    res.json({
      message: 'User deleted',
    });
  } catch (err) {
    console.error('Delete User Error:', err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
