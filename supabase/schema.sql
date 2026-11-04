-- ==============================================================================
-- PulseTask Production Schema for Supabase PostgreSQL
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#ef4444',
  icon TEXT DEFAULT '📁',
  "orderIndex" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "projectId" TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT CHECK (priority IN ('p1', 'p2', 'p3', 'p4')) DEFAULT 'p4',
  "colorTag" TEXT DEFAULT '#ef4444',
  "dueDate" TEXT,
  "dueTime" TEXT,
  recurring TEXT DEFAULT 'none',
  completed INTEGER DEFAULT 0,
  "completedAt" TEXT,
  "orderIndex" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Subtasks Table
CREATE TABLE IF NOT EXISTS public.subtasks (
  id TEXT PRIMARY KEY,
  "taskId" TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  "orderIndex" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Pomodoro Sessions Table
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "taskId" TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
  "durationMinutes" INTEGER DEFAULT 25,
  completed INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Configuration
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Service Role Full Access Policies
DROP POLICY IF EXISTS "Service role access on users" ON public.users;
CREATE POLICY "Service role access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access on projects" ON public.projects;
CREATE POLICY "Service role access on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access on tasks" ON public.tasks;
CREATE POLICY "Service role access on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access on subtasks" ON public.subtasks;
CREATE POLICY "Service role access on subtasks" ON public.subtasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access on pomodoro" ON public.pomodoro_sessions;
CREATE POLICY "Service role access on pomodoro" ON public.pomodoro_sessions FOR ALL USING (true) WITH CHECK (true);
