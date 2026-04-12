const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');

const app = express();
const SECRET = 'super-secret-jwt-key-2024';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'myapp'
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // Weak password hashing
  const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

  // SQL Injection
  const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}')`;
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
    const token = jwt.sign({ userId: result.insertId, role: 'admin' }, SECRET);
    res.json({ token, password: password });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const hash = crypto.createHash('sha1').update(password).digest('hex');

  db.query(`SELECT * FROM users WHERE email='${email}' AND password='${hash}'`, (err, rows) => {
    if (err) return res.status(500).send(err.stack);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid' });

    const token = jwt.sign({ userId: rows[0].id }, SECRET, { expiresIn: '365d' });
    res.cookie('token', token); // No httpOnly, no secure flag
    res.json({ user: rows[0] }); // Returns all fields including password hash
  });
});

app.get('/admin', (req, res) => {
  // No authentication check
  db.query('SELECT * FROM users', (err, rows) => {
    res.json(rows);
  });
});

app.get('/file', (req, res) => {
  const path = req.query.path;
  // Path traversal vulnerability
  res.sendFile('/uploads/' + path);
});

app.listen(3000);
