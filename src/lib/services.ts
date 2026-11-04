import db from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  orderIndex: number;
  taskCount?: number;
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: number;
  orderIndex: number;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  projectId: string | null;
  projectName?: string;
  projectColor?: string;
  title: string;
  description: string;
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  colorTag?: string | null;
  dueDate: string | null;
  dueTime: string | null;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  completed: number;
  completedAt: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  subtasks?: Subtask[];
}

// -------------------------------------------------------------
// Onboarding Seeder (Runs once per user)
// -------------------------------------------------------------
export function seedUserOnboarding(userId: string) {
  if (!userId) return;

  // Check if projects already exist for this user - only once per user!
  const countRow = db.prepare('SELECT COUNT(*) as count FROM projects WHERE userId = ?').get(userId) as { count: number } | undefined;
  if (countRow && countRow.count > 0) return;

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = `${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}`;

  const currentYear = today.getFullYear();
  const oct25Str = `${currentYear}-10-25`;
  const oct30Str = `${currentYear}-10-30`;
  const oct31Str = `${currentYear}-10-31`;

  const p1Id = `proj_${Date.now()}_1`;
  const p2Id = `proj_${Date.now()}_2`;
  const p3Id = `proj_${Date.now()}_3`;

  // Project 1: Getting Started
  db.prepare(`
    INSERT INTO projects (id, userId, name, color, icon, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(p1Id, userId, '🚀 Getting Started with PulseTask', '#ef4444', '🚀', 0);

  // Project 2: Personal Life & Errands
  db.prepare(`
    INSERT INTO projects (id, userId, name, color, icon, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(p2Id, userId, '💡 Personal Life & Errands', '#10b981', '💡', 1);

  // Project 3: Halloween Preparation
  db.prepare(`
    INSERT INTO projects (id, userId, name, color, icon, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(p3Id, userId, '🎃 Halloween Preparation', '#f97316', '🎃', 2);

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, userId, projectId, title, description, priority, colorTag, dueDate, dueTime, recurring, completed, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Project 1 Tasks
  insertTask.run(`task_${Date.now()}_1`, userId, p1Id, 'Welcome to PulseTask! 👋', '', 'p1', '#ef4444', todayStr, null, 'none', 0, 0);
  insertTask.run(`task_${Date.now()}_2`, userId, p1Id, 'Add your first task', '', 'p2', '#ef4444', todayStr, null, 'none', 0, 1);
  insertTask.run(`task_${Date.now()}_3`, userId, p1Id, 'Organize with Projects & Labels', '', 'p3', '#ef4444', null, null, 'none', 0, 2);
  insertTask.run(`task_${Date.now()}_4`, userId, p1Id, 'Stay focused with the Pomodoro Timer', '', 'p3', '#ef4444', null, null, 'none', 0, 3);
  insertTask.run(`task_${Date.now()}_5`, userId, p1Id, 'Switch to Dark Mode 🌙', '', 'p4', '#ef4444', null, null, 'none', 0, 4);

  // Project 2 Tasks
  insertTask.run(`task_${Date.now()}_6`, userId, p2Id, 'Buy groceries 🛒', '', 'p2', '#10b981', tomorrowStr, null, 'none', 0, 0);
  insertTask.run(`task_${Date.now()}_7`, userId, p2Id, 'Schedule dentist appointment', '', 'p3', '#10b981', nextWeekStr, null, 'none', 0, 1);
  insertTask.run(`task_${Date.now()}_8`, userId, p2Id, 'Read a book for 30 minutes', '', 'p4', '#10b981', todayStr, null, 'daily', 0, 2);

  // Project 3 Tasks
  insertTask.run(`task_${Date.now()}_9`, userId, p3Id, 'Buy Halloween costume', '', 'p1', '#f97316', oct25Str, null, 'none', 0, 0);
  insertTask.run(`task_${Date.now()}_10`, userId, p3Id, 'Decorate the house with pumpkins', '', 'p2', '#f97316', oct30Str, null, 'none', 0, 1);
  insertTask.run(`task_${Date.now()}_11`, userId, p3Id, 'Prepare spooky playlist', '', 'p3', '#f97316', oct31Str, null, 'none', 0, 2);
}

// -------------------------------------------------------------
// Auth Services
// -------------------------------------------------------------
export const AuthService = {
  login(email: string, password: string): User | null {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) return null;

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) return null;

    const { passwordHash, ...userClean } = user;
    return userClean;
  },

  signup(name: string, email: string, password: string): User {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const hashed = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO users (id, name, email, passwordHash)
      VALUES (?, ?, ?, ?)
    `).run(userId, name.trim(), email.toLowerCase().trim(), hashed);

    // Seed initial onboarding projects and tasks (only once per user)
    seedUserOnboarding(userId);

    return db.prepare('SELECT id, name, email, createdAt FROM users WHERE id = ?').get(userId) as User;
  },

  getUserById(id: string): User | null {
    const user = db.prepare('SELECT id, name, email, createdAt FROM users WHERE id = ?').get(id) as User | undefined;
    return user || null;
  }
};

// -------------------------------------------------------------
// Project Services
// -------------------------------------------------------------
export const ProjectService = {
  getUserProjects(userId: string): Project[] {
    // Ensure onboarding is present for the user (only once)
    seedUserOnboarding(userId);

    return db.prepare(`
      SELECT p.*, COUNT(t.id) as taskCount
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.projectId AND t.completed = 0
      WHERE p.userId = ?
      GROUP BY p.id
      ORDER BY p.orderIndex ASC, p.createdAt ASC
    `).all(userId) as Project[];
  },

  getProjectById(id: string): Project | null {
    const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
    return p || null;
  },

  createProject(userId: string, { name, color = '#ef4444', icon = '📁' }: { name: string; color?: string; icon?: string }): Project {
    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const maxOrder = db.prepare('SELECT MAX(orderIndex) as maxIdx FROM projects WHERE userId = ?').get(userId) as { maxIdx: number | null };
    const nextOrder = (maxOrder?.maxIdx ?? -1) + 1;

    db.prepare(`
      INSERT INTO projects (id, userId, name, color, icon, orderIndex)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, userId, name.trim(), color, icon, nextOrder);

    return this.getProjectById(id)!;
  },

  updateProject(id: string, fields: Partial<Pick<Project, 'name' | 'color' | 'icon'>>): Project | null {
    const current = this.getProjectById(id);
    if (!current) return null;

    db.prepare(`
      UPDATE projects
      SET name = ?, color = ?, icon = ?
      WHERE id = ?
    `).run(
      fields.name !== undefined ? fields.name.trim() : current.name,
      fields.color !== undefined ? fields.color : current.color,
      fields.icon !== undefined ? fields.icon : current.icon,
      id
    );

    return this.getProjectById(id);
  },

  deleteProject(id: string): boolean {
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return true;
  }
};

// -------------------------------------------------------------
// Task & Subtask Services
// -------------------------------------------------------------
export const TaskService = {
  getTasks(
    userId: string,
    options: {
      view?: 'inbox' | 'today' | 'upcoming' | 'project' | 'all';
      projectId?: string;
      includeCompleted?: boolean;
      search?: string;
    } = {}
  ): Task[] {
    const { view = 'all', projectId, includeCompleted = true, search } = options;

    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    let query = `
      SELECT t.*, p.name as projectName, p.color as projectColor
      FROM tasks t
      LEFT JOIN projects p ON t.projectId = p.id
      WHERE t.userId = ?
    `;
    const params: any[] = [userId];

    if (!includeCompleted) {
      query += ' AND t.completed = 0';
    }

    if (view === 'inbox') {
      query += ' AND t.projectId IS NULL';
    } else if (view === 'today') {
      query += ' AND (t.dueDate <= ? OR t.dueDate IS NULL)';
      params.push(todayStr);
    } else if (view === 'upcoming') {
      query += ' AND t.dueDate IS NOT NULL';
    } else if (view === 'project' && projectId) {
      query += ' AND t.projectId = ?';
      params.push(projectId);
    }

    if (search && search.trim()) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY t.completed ASC, t.orderIndex ASC, t.createdAt DESC';

    const tasks = db.prepare(query).all(...params) as Task[];

    // Attach subtasks
    const taskIds = tasks.map((t) => t.id);
    if (taskIds.length > 0) {
      const placeholders = taskIds.map(() => '?').join(',');
      const subtasks = db.prepare(`
        SELECT * FROM subtasks
        WHERE taskId IN (${placeholders})
        ORDER BY orderIndex ASC
      `).all(...taskIds) as Subtask[];

      const subtaskMap: Record<string, Subtask[]> = {};
      subtasks.forEach((s) => {
        if (!subtaskMap[s.taskId]) subtaskMap[s.taskId] = [];
        subtaskMap[s.taskId].push(s);
      });

      tasks.forEach((t) => {
        t.subtasks = subtaskMap[t.id] || [];
      });
    }

    return tasks;
  },

  getTaskById(id: string): Task | null {
    const task = db.prepare(`
      SELECT t.*, p.name as projectName, p.color as projectColor
      FROM tasks t
      LEFT JOIN projects p ON t.projectId = p.id
      WHERE t.id = ?
    `).get(id) as Task | undefined;

    if (!task) return null;

    task.subtasks = db.prepare('SELECT * FROM subtasks WHERE taskId = ? ORDER BY orderIndex ASC').all(id) as Subtask[];
    return task;
  },

  createTask(
    userId: string,
    data: {
      title: string;
      description?: string;
      projectId?: string | null;
      priority?: 'p1' | 'p2' | 'p3' | 'p4';
      colorTag?: string | null;
      dueDate?: string | null;
      dueTime?: string | null;
      recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
      subtasks?: string[];
    }
  ): Task {
    const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const maxOrder = db.prepare('SELECT MAX(orderIndex) as maxIdx FROM tasks WHERE userId = ?').get(userId) as { maxIdx: number | null };
    const nextOrder = (maxOrder?.maxIdx ?? -1) + 1;

    db.prepare(`
      INSERT INTO tasks (id, userId, projectId, title, description, priority, colorTag, dueDate, dueTime, recurring, orderIndex)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      data.projectId || null,
      data.title.trim(),
      (data.description || '').trim(),
      data.priority || 'p4',
      data.colorTag || '#ef4444',
      data.dueDate || null,
      data.dueTime || null,
      data.recurring || 'none',
      nextOrder
    );

    // Insert subtasks if any
    if (data.subtasks && data.subtasks.length > 0) {
      const insertSub = db.prepare(`
        INSERT INTO subtasks (id, taskId, title, completed, orderIndex)
        VALUES (?, ?, ?, ?, ?)
      `);
      data.subtasks.forEach((title, idx) => {
        if (title.trim()) {
          insertSub.run(`sub_${Date.now()}_${idx}`, id, title.trim(), 0, idx);
        }
      });
    }

    return this.getTaskById(id)!;
  },

  updateTask(
    id: string,
    fields: Partial<Pick<Task, 'title' | 'description' | 'projectId' | 'priority' | 'colorTag' | 'dueDate' | 'dueTime' | 'recurring' | 'orderIndex'>>
  ): Task | null {
    const current = this.getTaskById(id);
    if (!current) return null;

    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, projectId = ?, priority = ?, colorTag = ?, dueDate = ?, dueTime = ?, recurring = ?, orderIndex = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(
      fields.title !== undefined ? fields.title.trim() : current.title,
      fields.description !== undefined ? fields.description.trim() : current.description,
      fields.projectId !== undefined ? (fields.projectId || null) : current.projectId,
      fields.priority !== undefined ? fields.priority : current.priority,
      fields.colorTag !== undefined ? fields.colorTag : current.colorTag,
      fields.dueDate !== undefined ? (fields.dueDate || null) : current.dueDate,
      fields.dueTime !== undefined ? (fields.dueTime || null) : current.dueTime,
      fields.recurring !== undefined ? fields.recurring : current.recurring,
      fields.orderIndex !== undefined ? fields.orderIndex : current.orderIndex,
      id
    );

    return this.getTaskById(id);
  },

  toggleComplete(id: string): Task | null {
    const current = this.getTaskById(id);
    if (!current) return null;

    const nextCompleted = current.completed === 1 ? 0 : 1;
    const completedAt = nextCompleted === 1 ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE tasks
      SET completed = ?, completedAt = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(nextCompleted, completedAt, id);

    // If marked completed and has a recurring schedule, advance to next due date!
    if (nextCompleted === 1 && current.recurring !== 'none' && current.dueDate) {
      const d = new Date(current.dueDate);
      if (current.recurring === 'daily') d.setDate(d.getDate() + 1);
      if (current.recurring === 'weekly') d.setDate(d.getDate() + 7);
      if (current.recurring === 'monthly') d.setMonth(d.getMonth() + 1);

      const pad = (n: number) => String(n).padStart(2, '0');
      const nextDueStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      this.createTask(current.userId, {
        title: current.title,
        description: current.description,
        projectId: current.projectId,
        priority: current.priority,
        dueDate: nextDueStr,
        dueTime: current.dueTime,
        recurring: current.recurring
      });
    }

    return this.getTaskById(id);
  },

  deleteTask(id: string): boolean {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return true;
  },

  reorderTasks(orderedIds: string[]): boolean {
    db.exec('BEGIN TRANSACTION;');
    try {
      const updateStmt = db.prepare('UPDATE tasks SET orderIndex = ? WHERE id = ?');
      orderedIds.forEach((id, idx) => {
        updateStmt.run(idx, id);
      });
      db.exec('COMMIT;');
      return true;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  },

  // Subtask Actions
  addSubtask(taskId: string, title: string): Subtask {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const maxOrder = db.prepare('SELECT MAX(orderIndex) as maxIdx FROM subtasks WHERE taskId = ?').get(taskId) as { maxIdx: number | null };
    const nextOrder = (maxOrder?.maxIdx ?? -1) + 1;

    db.prepare(`
      INSERT INTO subtasks (id, taskId, title, completed, orderIndex)
      VALUES (?, ?, ?, 0, ?)
    `).run(id, taskId, title.trim(), nextOrder);

    return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id) as Subtask;
  },

  toggleSubtask(subtaskId: string): Subtask | null {
    const current = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(subtaskId) as Subtask | undefined;
    if (!current) return null;

    const nextCompleted = current.completed === 1 ? 0 : 1;
    db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?').run(nextCompleted, subtaskId);
    return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(subtaskId) as Subtask;
  },

  deleteSubtask(subtaskId: string): boolean {
    db.prepare('DELETE FROM subtasks WHERE id = ?').run(subtaskId);
    return true;
  }
};

// -------------------------------------------------------------
// Pomodoro Focus Services
// -------------------------------------------------------------
export const PomodoroService = {
  logSession(userId: string, data: { taskId?: string | null; durationMinutes?: number; completed?: number }) {
    const id = `pomo_${Date.now()}`;
    db.prepare(`
      INSERT INTO pomodoro_sessions (id, userId, taskId, durationMinutes, completed)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, data.taskId || null, data.durationMinutes || 25, data.completed ?? 1);

    return db.prepare('SELECT * FROM pomodoro_sessions WHERE id = ?').get(id);
  },

  getTodaySessionCount(userId: string): number {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStart = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())} 00:00:00`;

    const row = db.prepare(`
      SELECT COUNT(*) as count
      FROM pomodoro_sessions
      WHERE userId = ? AND createdAt >= ? AND completed = 1
    `).get(userId, todayStart) as { count: number };

    return row?.count || 0;
  }
};
