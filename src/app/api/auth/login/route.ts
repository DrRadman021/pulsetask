import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = AuthService.login(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, user });

    // 30-day persistent session cookie
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
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}
