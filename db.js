const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tasks.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#4f46e5',
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    project_id INTEGER,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK(status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
  );
`);

// Seed initial data if projects table is empty
const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
if (projectCount === 0) {
  const insertProject = db.prepare('INSERT INTO projects (name, color, description) VALUES (?, ?, ?)');
  const p1 = insertProject.run('Website Redesign', '#6366f1', 'Modernizing our corporate landing page');
  const p2 = insertProject.run('Mobile App API', '#06b6d4', 'REST endpoints for iOS & Android app');
  const p3 = insertProject.run('Marketing Launch', '#ec4899', 'Q4 campaign assets and outreach');

  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, project_id, priority, status, due_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertTask.run(
    'Draft wireframes and hero section',
    'Create Figma mockups for desktop and responsive mobile views.',
    Number(p1.lastInsertRowid),
    'high',
    'completed',
    '2026-11-05'
  );
  insertTask.run(
    'Implement dark mode & responsive navbar',
    'Add theme switcher with localStorage persistence and CSS custom properties.',
    Number(p1.lastInsertRowid),
    'urgent',
    'in_progress',
    '2026-11-10'
  );
  insertTask.run(
    'JWT Authentication & refresh tokens',
    'Build secure login, token generation, and role authorization middlewares.',
    Number(p2.lastInsertRowid),
    'high',
    'todo',
    '2026-11-15'
  );
  insertTask.run(
    'Setup database migration scripts',
    'Automate SQLite schema versions and backups for local staging.',
    Number(p2.lastInsertRowid),
    'medium',
    'completed',
    '2026-11-02'
  );
  insertTask.run(
    'Prepare launch newsletter & social graphics',
    'Coordinate with design team for banner dimensions and copy review.',
    Number(p3.lastInsertRowid),
    'low',
    'todo',
    '2026-11-20'
  );
}

// Data Access Helpers
const Projects = {
  getAll() {
    return db.prepare(`
      SELECT 
        p.*, 
        COUNT(t.id) as task_count,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_task_count
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY p.name ASC
    `).all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  },

  create({ name, color, description }) {
    const stmt = db.prepare('INSERT INTO projects (name, color, description) VALUES (?, ?, ?)');
    const res = stmt.run(name.trim(), color || '#6366f1', (description || '').trim());
    return this.getById(Number(res.lastInsertRowid));
  },

  update(id, { name, color, description }) {
    const existing = this.getById(id);
    if (!existing) return null;
    const stmt = db.prepare(`
      UPDATE projects 
      SET name = ?, color = ?, description = ? 
      WHERE id = ?
    `);
    stmt.run(
      name !== undefined ? name.trim() : existing.name,
      color !== undefined ? color : existing.color,
      description !== undefined ? description.trim() : existing.description,
      id
    );
    return this.getById(id);
  },

  delete(id) {
    const existing = this.getById(id);
    if (!existing) return false;
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return true;
  }
};

const Tasks = {
  getAll({ projectId, status, priority, search, sortBy = 'created_at', sortOrder = 'DESC' } = {}) {
    let query = `
      SELECT 
        t.*, 
        p.name as project_name, 
        p.color as project_color
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (projectId) {
      query += ' AND t.project_id = ?';
      params.push(projectId);
    }
    if (status && status !== 'all') {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (priority && priority !== 'all') {
      query += ' AND t.priority = ?';
      params.push(priority);
    }
    if (search && search.trim()) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const allowedSortFields = ['created_at', 'due_date', 'priority', 'title', 'status'];
    const validSortBy = allowedSortFields.includes(sortBy) ? `t.${sortBy}` : 't.created_at';
    const validOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${validSortBy} ${validOrder}`;

    return db.prepare(query).all(...params);
  },

  getById(id) {
    return db.prepare(`
      SELECT 
        t.*, 
        p.name as project_name, 
        p.color as project_color
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `).get(id);
  },

  create({ title, description, project_id, priority, status, due_date }) {
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, project_id, priority, status, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      title.trim(),
      (description || '').trim(),
      project_id ? Number(project_id) : null,
      priority || 'medium',
      status || 'todo',
      due_date || null
    );
    return this.getById(Number(res.lastInsertRowid));
  },

  update(id, fields) {
    const existing = this.getById(id);
    if (!existing) return null;

    const updated = {
      title: fields.title !== undefined ? fields.title.trim() : existing.title,
      description: fields.description !== undefined ? fields.description.trim() : existing.description,
      project_id: fields.project_id !== undefined ? (fields.project_id ? Number(fields.project_id) : null) : existing.project_id,
      priority: fields.priority !== undefined ? fields.priority : existing.priority,
      status: fields.status !== undefined ? fields.status : existing.status,
      due_date: fields.due_date !== undefined ? (fields.due_date || null) : existing.due_date
    };

    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, project_id = ?, priority = ?, status = ?, due_date = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(
      updated.title,
      updated.description,
      updated.project_id,
      updated.priority,
      updated.status,
      updated.due_date,
      id
    );
    return this.getById(id);
  },

  delete(id) {
    const existing = this.getById(id);
    if (!existing) return false;
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return true;
  }
};

const Stats = {
  getOverview() {
    const total = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    const todo = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'todo'").get().count;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'").get().count;
    const completed = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get().count;
    const urgent = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE priority = 'urgent' AND status != 'completed'").get().count;
    const projectTotal = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;

    return {
      total,
      todo,
      inProgress,
      completed,
      urgent,
      projectTotal,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
};

module.exports = {
  db,
  Projects,
  Tasks,
  Stats
};
