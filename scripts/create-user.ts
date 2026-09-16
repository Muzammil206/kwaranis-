#!/usr/bin/env bun
/**
 * NIS Kwara — Create / Update a Login User
 * Creates (or updates) an app_users account with a bcrypt-hashed password,
 * and optionally links it to a member via the member's serial number.
 *
 * Usage:
 *   bun scripts/create-user.ts --email <email> --password <pw> [--role admin|treasurer|viewer|member] [--serial <n>]
 *
 * Examples:
 *   bun scripts/create-user.ts --email admin@niskwara.org.ng --password secret123 --role admin
 *   bun scripts/create-user.ts --email member@example.com --password secret123 --role member --serial 3
 */

import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

interface CliArg {
  email?: string
  password?: string
  role?: string
  serial?: string
}

function parseArgs(argv: string[]): CliArg {
  const args: CliArg = {}
  for (let i = 0; i < argv.length; i++) {
    const [flag, value] = [argv[i], argv[i + 1]]
    switch (flag) {
      case '--email': args.email = value; break
      case '--password': args.password = value; break
      case '--role': args.role = value; break
      case '--serial': args.serial = value; break
    }
  }
  return args
}

async function main() {
  const { email, password, role = 'member', serial } = parseArgs(process.argv.slice(2))

  if (!email || !password) {
    console.error('❌ --email and --password are required')
    process.exit(1)
  }

  const validRoles = ['admin', 'treasurer', 'viewer', 'member']
  if (!validRoles.includes(role)) {
    console.error(`❌ --role must be one of: ${validRoles.join(', ')}`)
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('❌ Missing DATABASE_URL in .env.local')
    process.exit(1)
  }

  const sql = neon(connectionString)
  const passwordHash = await bcrypt.hash(password, 10)

  let memberId: string | null = null
  if (serial) {
    const member = await sql(
      `SELECT id FROM members WHERE serial_no = $1`,
      [Number(serial)]
    )
    if (member.length === 0) {
      console.error(`❌ No member found with serial_no ${serial}`)
      process.exit(1)
    }
    memberId = member[0].id
  }

  await sql(
    `INSERT INTO app_users (email, password_hash, role, member_id)
     VALUES ($1, $2, $3::user_role, $4)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       member_id = EXCLUDED.member_id,
       updated_at = NOW()`,
    [email, passwordHash, role, memberId]
  )

  const memberRef = serial ? ` (member serial ${serial})` : ' (no member linked)'
  console.log(`✅ User ${email} created/updated with role "${role}"${memberRef}`)
}

main().catch(console.error)