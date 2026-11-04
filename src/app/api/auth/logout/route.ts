export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.set('pulsetask_user_id', '', { path: '/', maxAge: 0 });
  res.cookies.set('pulsetask_session', '', { path: '/', maxAge: 0 });
  res.cookies.set('zentask_user_id', '', { path: '/', maxAge: 0 });
  return res;
}
