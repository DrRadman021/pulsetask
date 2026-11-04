import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

declare global {
  // eslint-disable-next-line no-var
  var __pulseDb: DatabaseSync | undefined;
  // eslint-disable-next-line no-var
  var __pulseDbInit: boolean | undefined;
}

function getDatabase(): DatabaseSync {
  if (globalThis.__pulseDb) {
    return globalThis.__pulseDb;
  }

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {}
  }

  const dbPath = path.join(dataDir, 'pulsetask.db');
  const db = new DatabaseSync(dbPath);

  try {
    db.exec('PRAGMA busy_timeout = 15000;');
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
  } catch {}

  if (!globalThis.__pulseDbInit) {
    globalThis.__pulseDbInit = true;
    try {
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
      try {
        db.exec("ALTER TABLE tasks ADD COLUMN colorTag TEXT DEFAULT '#ef4444';");
      } catch {}
    } catch (e: any) {
      if (!e?.message?.includes('locked') && !e?.message?.includes('busy')) {
        console.error('Database init warning:', e);
      }
    }
  }

  globalThis.__pulseDb = db;
  return db;
}

// Lazy Proxy so db is only created and accessed on demand at runtime
const db = new Proxy({} as DatabaseSync, {
  get(_target, prop) {
    const instance = getDatabase();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export default db;
