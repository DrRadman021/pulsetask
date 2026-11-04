export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = AuthService.signup(name, email, password);
    const res = NextResponse.json({ success: true, user }, { status: 201 });

    const thirtyDays = 30 * 24 * 60 * 60;
    res.cookies.set('pulsetask_user_id', user.id, {
      path: '/',
      httpOnly: false,
      maxAge: thirtyDays,
      sameSite: 'lax',
    });
    res.cookies.set('pulsetask_session', `sess_${user.id}_${Date.now()}`, {
      path: '/',
      httpOnly: true,
      maxAge: thirtyDays,
      sameSite: 'lax',
    });
    res.cookies.set('zentask_user_id', user.id, {
      path: '/',
      httpOnly: false,
      maxAge: thirtyDays,
      sameSite: 'lax',
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 400 });
  }
}
