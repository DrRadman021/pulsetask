export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/services';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updated = TaskService.toggleSubtask(params.id);
    if (!updated) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    TaskService.deleteSubtask(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
