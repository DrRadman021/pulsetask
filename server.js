const express = require('express');
const cors = require('cors');
const path = require('path');
const { Projects, Tasks, Stats } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'SQLite (node:sqlite)',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Stats overview
app.get('/api/stats', (req, res) => {
  try {
    const stats = Stats.getOverview();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
});

// Project endpoints
app.get('/api/projects', (req, res) => {
  try {
    const projects = Projects.getAll();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { name, color, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    const newProject = Projects.create({ name, color, description });
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project', details: err.message });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, color, description } = req.body;
    const updated = Projects.update(id, { name, color, description });
    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project', details: err.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = Projects.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project', details: err.message });
  }
});

// Task endpoints
app.get('/api/tasks', (req, res) => {
  try {
    const { projectId, status, priority, search, sortBy, sortOrder } = req.query;
    const tasks = Tasks.getAll({
      projectId: projectId ? Number(projectId) : undefined,
      status,
      priority,
      search,
      sortBy,
      sortOrder
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
});

app.get('/api/tasks/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = Tasks.getById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task', details: err.message });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, project_id, priority, status, due_date } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    const newTask = Tasks.create({
      title,
      description,
      project_id,
      priority,
      status,
      due_date
    });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = Tasks.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

app.patch('/api/tasks/:id/status', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!['todo', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be todo, in_progress, or completed' });
    }
    const updated = Tasks.update(id, { status });
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task status', details: err.message });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = Tasks.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});

// Catch-all fallback to serve index.html for SPA feel
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TaskFlow Server is running at http://localhost:${PORT}`);
  console.log(`📁 Database initialized with SQLite at ./data/tasks.db`);
});
