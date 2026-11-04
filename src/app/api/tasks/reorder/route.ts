import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/services';

export async function POST(req: NextRequest) {
  try {
    const { orderedIds } = await req.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds array is required' }, { status: 400 });
    }

    TaskService.reorderTasks(orderedIds);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
