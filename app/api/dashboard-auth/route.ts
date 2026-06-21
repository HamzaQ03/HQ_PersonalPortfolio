import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const expected = process.env.DASHBOARD_PASSWORD

    if (!expected) {
      return NextResponse.json(
        { ok: false, error: 'Dashboard password not configured on server' },
        { status: 500 }
      )
    }

    if (typeof password !== 'string' || password !== expected) {
      // Constant-time check would be better, but for a portfolio dashboard
      // a simple string compare is acceptable. Brief delay to slow brute-force.
      await new Promise(r => setTimeout(r, 600))
      return NextResponse.json(
        { ok: false, error: 'Incorrect password' },
        { status: 401 }
      )
    }

    const res = NextResponse.json({ ok: true })

    // 7-day httpOnly cookie containing the password as the session token.
    // Middleware compares this cookie back to DASHBOARD_PASSWORD on every
    // /dashboard/* request to gate access.
    res.cookies.set('dashboard_session', expected, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (err) {
    console.error('[dashboard-auth] error:', err)
    return NextResponse.json(
      { ok: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Logout endpoint — clears the cookie.
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('dashboard_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return res
}
