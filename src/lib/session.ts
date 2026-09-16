import { SignJWT, jwtVerify } from 'jose'
import type { UserRole } from '@/types'

export const SESSION_COOKIE = 'nis_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface SessionUser {
  id: string
  email: string
  role: UserRole
  member_id: string | null
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET is not set. Add it to .env.local')
  }
  return new TextEncoder().encode(secret)
}

/** Sign a JWT for the given user. */
export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
    member_id: user.member_id,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

/** Verify a JWT and return the session user (or null). Edge-safe, no DB access. */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      id: payload.sub!,
      email: (payload.email as string) ?? '',
      role: (payload.role as UserRole) ?? 'member',
      member_id: (payload.member_id as string | null) ?? null,
    }
  } catch {
    return null
  }
}

// Keep max age available for the cookie config
export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE