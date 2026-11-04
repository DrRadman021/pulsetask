'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Project, Task } from './services';
import confetti from 'canvas-confetti';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: User | null;
  projects: Project[];
  tasks: Task[];
  theme: 'dark' | 'light' | 'system';
  setTheme: (t: 'dark' | 'light' | 'system') => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (o: boolean) => void;
  activeTaskDetail: Task | null;
  setActiveTaskDetail: (t: Task | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  refreshData: () => Promise<void>;
  createTask: (data: Omit<Partial<Task>, 'subtasks'> & { subtasks?: string[] }) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, fields: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createProject: (name: string, color?: string, icon?: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>('dark');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Apply Theme
  const applyTheme = (t: 'dark' | 'light' | 'system') => {
    setThemeState(t);
    localStorage.setItem('pulsetask_theme', t);

    const isDark =
      t === 'dark' ||
      (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const saved =
      (localStorage.getItem('pulsetask_theme') as any) ||
      (localStorage.getItem('zentask_theme') as any) ||
      'dark';
    applyTheme(saved);
  }, []);

  // Global Keyboard Shortcuts (Q = Quick Add, Cmd+K = Command Palette, Escape = Close Modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Don't trigger 'Q' if typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (!isInput && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        setQuickAddOpen(true);
      } else if (e.key === 'Escape') {
        setQuickAddOpen(false);
        setActiveTaskDetail(null);
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = useCallback(async () => {
    try {
      const [uRes, pRes, tRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/projects'),
        fetch('/api/tasks')
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.user) setUser(uData.user);
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        setProjects(pData);
      }

      if (tRes.ok) {
        const tData = await tRes.json();
        setTasks(tData);
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createTask = async (data: Omit<Partial<Task>, 'subtasks'> & { subtasks?: string[] }): Promise<Task> => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }

    const created: Task = await res.json();
    setTasks((prev) => [created, ...prev]);
    addToast('Task added', 'success');
    return created;
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const willComplete = task?.completed === 0;

    if (willComplete) {
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#ef4444', '#10b981', '#f59e0b', '#ec4899']
        });
      } catch (e) {
        // Safe fallback
      }
    }

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: t.completed === 1 ? 0 : 1 } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        if (activeTaskDetail?.id === id) {
          setActiveTaskDetail(updated);
        }
      }
    } catch (err) {
      refreshData();
    }
  };

  const updateTask = async (id: string, fields: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        if (activeTaskDetail?.id === id) {
          setActiveTaskDetail(updated);
        }
      }
    } catch (err) {
      refreshData();
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskDetail?.id === id) setActiveTaskDetail(null);

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      addToast('Task deleted', 'info');
    } catch (err) {
      refreshData();
    }
  };

  const createProject = async (name: string, color = '#ef4444', icon = '📁'): Promise<Project> => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color, icon })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create project');
    }
    const created = await res.json();
    setProjects((prev) => [...prev, created]);
    addToast(`Project "${name}" created`, 'success');
    return created;
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      await refreshData();
      addToast('Project deleted', 'info');
    } catch (err) {
      refreshData();
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setUser(null);
    setTasks([]);
    setProjects([]);
    window.location.href = '/login';
  };

  return (
    <AppContext.Provider
      value={{
        user,
        projects,
        tasks,
        theme,
        setTheme: applyTheme,
        quickAddOpen,
        setQuickAddOpen,
        activeTaskDetail,
        setActiveTaskDetail,
        searchQuery,
        setSearchQuery,
        refreshData,
        createTask,
        toggleTask,
        updateTask,
        deleteTask,
        createProject,
        deleteProject,
        toasts,
        addToast,
        removeToast,
        commandPaletteOpen,
        setCommandPaletteOpen,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
