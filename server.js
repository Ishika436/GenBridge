require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // 5mb for base64 photos

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// --- Utility: Convert snake_case to camelCase ---
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function convertToCamelCase(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => convertToCamelCase(item));
  
  const converted = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = toCamelCase(key);
      converted[camelKey] = convertToCamelCase(obj[key]);
    }
  }
  return converted;
}

// --- Middleware: Auto-convert all JSON responses to camelCase ---
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    return originalJson.call(this, convertToCamelCase(data));
  };
  next();
});

// --- Auth middleware ---
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ===== USER ROUTES =====

// Sign up
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role, govt_id, gender, photo } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const r = await pool.query(
      'INSERT INTO users (name,email,password,role,govt_id,gender,photo) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,name,email,role,gender,photo',
      [name, email, hash, role, govt_id, gender, photo]
    );
    const user = r.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ user, token });
  } catch (e) {
    if (e.code === '23505') res.status(400).json({ error: 'Email already registered' });
    else res.status(500).json({ error: 'Server error' });
  }
});

// Sign in
app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = r.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (e) {
    console.error('Sign in error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== TASK ROUTES =====

// Get all tasks (optionally filter by status)
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const { status } = req.query;
    let q = 'SELECT * FROM tasks ORDER BY created_at DESC';
    let params = [];
    if (status) { q = 'SELECT * FROM tasks WHERE status=$1 ORDER BY created_at DESC'; params = [status]; }
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch (e) {
    console.error('Get tasks error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks posted by current user
app.get('/api/tasks/mine', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM tasks WHERE posted_by_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(r.rows);
  } catch (e) {
    console.error('Get tasks/mine error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks accepted by current user (helper's helps)
app.get('/api/tasks/accepted', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM tasks WHERE accepted_by_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(r.rows);
  } catch (e) {
    console.error('Get tasks/accepted error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Post a task
app.post('/api/tasks', auth, async (req, res) => {
  try {
    const { title, description, category, location, pay, preferred_date, preferred_time, urgent } = req.body;
    if (!title || !description || !category || !location || !pay)
      return res.status(400).json({ error: 'Title, description, category, location, and pay are required' });
    const user = await pool.query('SELECT name FROM users WHERE id=$1', [req.user.id]);
    if (!user.rows[0]) return res.status(400).json({ error: 'User not found' });
    const r = await pool.query(
      'INSERT INTO tasks (title,description,category,location,pay,preferred_date,preferred_time,urgent,posted_by_id,posted_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [title, description, category, location, pay, preferred_date, preferred_time, urgent || false, req.user.id, user.rows[0].name]
    );
    res.json(r.rows[0]);
  } catch (e) {
    console.error('Post task error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task status (accept / complete / cancel)
app.patch('/api/tasks/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;
    if (!status || !['open', 'accepted', 'completed', 'cancelled'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    let q, params;
    if (status === 'accepted') {
      const user = await pool.query('SELECT name,photo FROM users WHERE id=$1', [req.user.id]);
      q = 'UPDATE tasks SET status=$1,accepted_by_id=$2,accepted_by=$3,accepted_by_photo=$4 WHERE id=$5 RETURNING *';
      params = [status, req.user.id, user.rows[0].name, user.rows[0].photo, taskId];
    } else {
      q = 'UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *';
      params = [status, taskId];
    }
    const r = await pool.query(q, params);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(r.rows[0]);
  } catch (e) {
    console.error('Update task status error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== REVIEW ROUTES =====

// Get reviews for a user (with reviewer name and photo joined)
app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT r.id, r.task_id, r.reviewer_id, r.reviewee_id, r.rating, r.comment, r.created_at,
              u.name AS reviewer_name, u.photo AS reviewer_photo
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id=$1
       ORDER BY r.created_at DESC`,
      [req.params.userId]
    );
    res.json(r.rows);
  } catch (e) {
    console.error('Get reviews error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get average rating for a user
app.get('/api/reviews/avg/:userId', async (req, res) => {
  try {
    const r = await pool.query('SELECT AVG(rating)::NUMERIC(3,1) as avg, COUNT(*) as count FROM reviews WHERE reviewee_id=$1', [req.params.userId]);
    res.json(r.rows[0] || { avg: null, count: 0 });
  } catch (e) {
    console.error('Get reviews/avg error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Post a review
app.post('/api/reviews', auth, async (req, res) => {
  try {
    const { task_id, reviewee_id, rating, comment } = req.body;
    if (!task_id || !reviewee_id || !rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: 'Invalid review data' });
    // Prevent duplicate reviews
    const exists = await pool.query('SELECT id FROM reviews WHERE task_id=$1 AND reviewer_id=$2', [task_id, req.user.id]);
    if (exists.rows.length) return res.status(400).json({ error: 'Already reviewed' });
    const r = await pool.query(
      'INSERT INTO reviews (task_id,reviewer_id,reviewee_id,rating,comment) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [task_id, req.user.id, reviewee_id, rating, comment]
    );
    res.json(r.rows[0]);
  } catch (e) {
    console.error('Post review error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== USER ROUTES =====

// Get current authenticated user
app.get('/api/users/me', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT id,name,email,role,gender,photo,created_at FROM users WHERE id=$1', [req.user.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(r.rows[0]);
  } catch (e) {
    console.error('Get user/me error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID (public endpoint - no auth required, but doesn't return password)
app.get('/api/users/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT id,name,email,role,gender,photo,created_at FROM users WHERE id=$1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(r.rows[0]);
  } catch (e) {
    console.error('Get user/:id error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Global error handler for unhandled exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(process.env.PORT, () => console.log(`GenBridge API running on port ${process.env.PORT}`));