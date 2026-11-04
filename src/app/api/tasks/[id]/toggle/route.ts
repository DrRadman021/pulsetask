import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/services';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const toggled = TaskService.toggleComplete(params.id);
    if (!toggled) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(toggled);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
