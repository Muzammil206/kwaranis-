import { neon } from '@neondatabase/serverless'

type SqlFn = (query: string, params?: unknown[]) => Promise<Record<string, unknown>[]>

declare global {
  // eslint-disable-next-line no-var
  var __nisSql: SqlFn | undefined
}

function createSql(): SqlFn {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local')
  }
  const run = neon(connectionString)
  return (query: string, params?: unknown[]) => run(query, params ?? []) as Promise<Record<string, unknown>[]>
}

export function getDb(): SqlFn {
  const globalForDb = globalThis as unknown as { __nisSql?: SqlFn }
  if (!globalForDb.__nisSql) {
    globalForDb.__nisSql = createSql()
  }
  return globalForDb.__nisSql
}

/** Run a query and return all rows. */
export async function sql<T = Record<string, unknown>>(
  query: string,
  params?: unknown[]
): Promise<T[]> {
  return (await getDb()(query, params)) as unknown as T[]
}

/** Run a query and return the first row (or null). */
export async function sqlOne<T = Record<string, unknown>>(
  query: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await sql<T>(query, params)
  return rows[0] ?? null
}