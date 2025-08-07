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
    res.json({ userId: id, name, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRUD: Transcripts
app.post('/transcripts', async (req, res) => {
  const { content, userId } = req.body;
  try {
    const conn = await getConnection();
    await conn.execute(
      'INSERT INTO transcripts (userId, content, createdAt) VALUES (?, ?, NOW())',
      [userId, content]
    );
    await conn.end();
    res.status(201).json({ message: 'Transcript saved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/transcripts/:userId', async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM transcripts WHERE userId = ?', [req.params.userId]);
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Manage users
app.get('/admin/users', async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT * FROM users');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/users', async (req, res) => {
  const { name, username, password, role } = req.body;
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

app.delete('/admin/users/:id', async (req, res) => {
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
