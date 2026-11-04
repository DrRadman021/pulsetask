export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PomodoroService } from '@/lib/services';

export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get('pulsetask_user_id')?.value || req.cookies.get('zentask_user_id')?.value;
    if (!userId) return NextResponse.json({ todayCount: 0 });
    const count = PomodoroService.getTodaySessionCount(userId);
    return NextResponse.json({ todayCount: count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('pulsetask_user_id')?.value || req.cookies.get('zentask_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { taskId, durationMinutes, completed } = await req.json();

    const session = PomodoroService.logSession(userId, {
      taskId: taskId || null,
      durationMinutes: durationMinutes || 25,
      completed: completed ?? 1
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
