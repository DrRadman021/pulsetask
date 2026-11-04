import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services';

export async function GET(req: NextRequest) {
  try {
    const userIdCookie =
      req.cookies.get('pulsetask_user_id')?.value ||
      req.cookies.get('zentask_user_id')?.value;

    let user = userIdCookie ? AuthService.getUserById(userIdCookie) : null;

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
