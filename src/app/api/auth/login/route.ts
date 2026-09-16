import { NextResponse } from 'next/server'
import { createSession, verifyPassword, findUserByEmail } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
      member_id: user.member_id,
    })

    return NextResponse.json({ success: true, role: user.role })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}