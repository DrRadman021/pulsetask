import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/lib/services';

export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get('pulsetask_user_id')?.value || req.cookies.get('zentask_user_id')?.value;
    if (!userId) return NextResponse.json([], { status: 200 });
    const projects = ProjectService.getUserProjects(userId);
    return NextResponse.json(projects);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get('pulsetask_user_id')?.value || req.cookies.get('zentask_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { name, color, icon } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = ProjectService.createProject(userId, { name, color, icon });
    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
