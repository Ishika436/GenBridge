-- GenBridge Database Schema
-- PostgreSQL DDL for users, tasks, and reviews tables

-- ===== USERS TABLE =====
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('seeker', 'helper')),
  govt_id TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ===== TASKS TABLE =====
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  pay TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  urgent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'completed', 'cancelled')),
  posted_by_id INT REFERENCES users(id) ON DELETE CASCADE,
  posted_by TEXT,
  accepted_by_id INT REFERENCES users(id) ON DELETE SET NULL,
  accepted_by TEXT,
  accepted_by_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_posted_by_id ON tasks(posted_by_id);
CREATE INDEX idx_tasks_accepted_by_id ON tasks(accepted_by_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- ===== REVIEWS TABLE =====
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id INT REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id INT REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_task_id ON reviews(task_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
