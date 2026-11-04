import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/services';
import { parseNaturalLanguageTask } from '@/lib/nlp';

export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get('pulsetask_user_id')?.value || req.cookies.get('zentask_user_id')?.value;
    if (!userId) return NextResponse.json([], { status: 200 });
    const { searchParams } = new URL(req.url);

    const view = (searchParams.get('view') as any) || 'all';
    const projectId = searchParams.get('projectId') || undefined;
    const includeCompleted = searchParams.get('includeCompleted') !== 'false';
    const search = searchParams.get('search') || undefined;

    const tasks = TaskService.getTasks(userId, {
      view,
      projectId,
      includeCompleted,
      search
    });

    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('pulsetask_user_id')?.value || req.cookies.get('zentask_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const body = await req.json();

    let { title, description, projectId, priority, colorTag, dueDate, dueTime, recurring, subtasks } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    // Auto-parse natural language if explicit dates or priorities were not passed
    if (!dueDate && (!priority || priority === 'p4')) {
      const parsed = parseNaturalLanguageTask(title);
      title = parsed.title;
      if (parsed.dueDate) dueDate = parsed.dueDate;
      if (parsed.dueTime) dueTime = parsed.dueTime;
      if (parsed.priority) priority = parsed.priority;
      if (parsed.recurring !== 'none') recurring = parsed.recurring;
    }

    const task = TaskService.createTask(userId, {
      title,
      description,
      projectId: projectId || null,
      priority: priority || 'p4',
      colorTag: colorTag || '#ef4444',
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      recurring: recurring || 'none',
      subtasks: subtasks || []
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
