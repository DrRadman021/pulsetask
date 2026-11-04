export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      const recentTasks = db.prepare(`
        SELECT id, title, priority, dueDate, completed, projectId, 'task' as itemType
        FROM tasks
        ORDER BY createdAt DESC
        LIMIT 10
      `).all();
      return NextResponse.json(recentTasks);
    }

    const term = `%${q}%`;
    const tasks = db.prepare(`
      SELECT id, title, priority, dueDate, completed, projectId, 'task' as itemType
      FROM tasks
      WHERE title LIKE ? OR description LIKE ?
      LIMIT 15
    `).all(term, term);

    const projects = db.prepare(`
      SELECT id, name as title, color, icon, 'project' as itemType
      FROM projects
      WHERE name LIKE ?
      LIMIT 5
    `).all(term);

    return NextResponse.json([...tasks, ...projects]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
