import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pulsetask.db');
const oldDbPath = path.join(dataDir, 'zentask.db');
if (!fs.existsSync(dbPath) && fs.existsSync(oldDbPath)) {
  try {
    fs.copyFileSync(oldDbPath, dbPath);
  } catch (e) {
    // ignore
  }
}
const db = new DatabaseSync(dbPath);

// Enable WAL mode, busy timeout, and foreign keys for safe multi-worker access
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 10000;
  PRAGMA foreign_keys = ON;
`);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#ef4444',
    icon TEXT DEFAULT '📁',
    orderIndex INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    projectId TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT CHECK(priority IN ('p1', 'p2', 'p3', 'p4')) DEFAULT 'p4',
    colorTag TEXT DEFAULT '#ef4444',
    dueDate TEXT,
    dueTime TEXT,
    recurring TEXT DEFAULT 'none',
    completed INTEGER DEFAULT 0,
    completedAt TEXT,
    orderIndex INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    taskId TEXT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    orderIndex INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(taskId) REFERENCES tasks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    taskId TEXT,
    durationMinutes INTEGER DEFAULT 25,
    completed INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(taskId) REFERENCES tasks(id) ON DELETE SET NULL
  );
`);

// Safe migration for colorTag
try {
  db.exec("ALTER TABLE tasks ADD COLUMN colorTag TEXT DEFAULT '#ef4444';");
} catch (e) {
  // column already exists
}

// No seed data — app starts with a clean slate. Users must sign up.

export default db;
