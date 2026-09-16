import { cookies } from 'next/headers'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { sql, sqlOne } from '@/lib/db'
import {
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
  signSessionToken,
  verifySessionToken,
  type SessionUser,
} from '@/lib/session'
import type { UserRole } from '@/types'

export type { SessionUser, UserRole }

/** Hash a plaintext password for storage. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/** Compare a plaintext password against a stored bcrypt hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/** Read the current session user from cookies (server components / route handlers). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

/** Set the session cookie for a user. */
export async function createSession(user: SessionUser) {
  const token = await signSessionToken(user)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE,
  })
}

/** Clear the session cookie. */
export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// ── Password reset tokens ──────────────────────────────
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/** Create a reset token for a user and return the raw token (to be emailed). */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString()

  await sql(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, hashToken(token), expiresAt]
  )

  return token
}

/**
 * Validate a reset token and — on success — mark it used, returning the user id.
 * Returns null when the token is invalid, expired, or already used.
 */
export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const row = await sqlOne<{ user_id: string; id: string }>(
    `SELECT id, user_id FROM password_resets
     WHERE token_hash = $1 AND used = false AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [hashToken(token)]
  )

  if (!row) return null

  await sql(`UPDATE password_resets SET used = true WHERE id = $1`, [row.id])
  return row.user_id
}

/** Helper: load a user's profile row for login. */
export async function findUserByEmail(email: string) {
  return sqlOne<{
    id: string
    email: string
    password_hash: string
    role: UserRole
    member_id: string | null
  }>(`SELECT * FROM app_users WHERE LOWER(email) = LOWER($1)`, [email])
}