import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/services';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title } = await req.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Subtask title is required' }, { status: 400 });
    }

    const subtask = TaskService.addSubtask(params.id, title);
    return NextResponse.json(subtask, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
