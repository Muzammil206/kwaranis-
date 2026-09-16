import { NextResponse } from 'next/server'
import { createPasswordResetToken, findUserByEmail } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await findUserByEmail(email)

    // Always return success — don't reveal whether an account exists.
    if (user) {
      const token = await createPasswordResetToken(user.id)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      await sendPasswordResetEmail(user.email, `${appUrl}/auth/reset-password?token=${token}`)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}