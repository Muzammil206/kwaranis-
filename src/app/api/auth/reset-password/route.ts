import { NextResponse } from 'next/server'
import { hashPassword, consumePasswordResetToken } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const userId = await consumePasswordResetToken(token)
    if (!userId) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)
    await sql(`UPDATE app_users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      passwordHash,
      userId,
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}