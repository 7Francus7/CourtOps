'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions, isSuperAdmin } from '@/lib/auth'

const MAX_ROWS = 500
const QUERY_TIMEOUT_MS = 10_000

const BLOCKED_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE',
  'CREATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'CALL',
  'SET ', 'COPY', 'VACUUM', 'REINDEX', 'CLUSTER',
]

function isSafeQuery(sql: string): { safe: boolean; reason?: string } {
  const upper = sql.toUpperCase().trim()

  // Must start with SELECT, WITH, or EXPLAIN
  if (!upper.startsWith('SELECT') && !upper.startsWith('WITH') && !upper.startsWith('EXPLAIN')) {
    return { safe: false, reason: 'Solo se permiten queries SELECT, WITH o EXPLAIN' }
  }

  // Block dangerous keywords
  for (const kw of BLOCKED_KEYWORDS) {
    // Check as standalone word (not part of column name)
    const regex = new RegExp(`\\b${kw}\\b`, 'i')
    if (regex.test(upper)) {
      return { safe: false, reason: `Keyword bloqueado: ${kw.trim()}` }
    }
  }

  // Block semicolons (prevent multi-statement)
  if (sql.includes(';')) {
    const withoutStrings = sql.replace(/'[^']*'/g, '')
    if (withoutStrings.includes(';')) {
      return { safe: false, reason: 'No se permiten múltiples statements (;)' }
    }
  }

  return { safe: true }
}

export async function executeReadOnlyQuery(sql: string): Promise<{
  success: boolean
  data?: Record<string, unknown>[]
  columns?: string[]
  rowCount?: number
  duration?: number
  error?: string
  truncated?: boolean
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isSuperAdmin(session.user)) {
    return { success: false, error: 'Unauthorized' }
  }

  const trimmed = sql.trim()
  if (!trimmed) {
    return { success: false, error: 'Query vacía' }
  }

  const validation = isSafeQuery(trimmed)
  if (!validation.safe) {
    return { success: false, error: validation.reason }
  }

  const start = Date.now()

  try {
    // Add LIMIT if not present
    const hasLimit = /\bLIMIT\b/i.test(trimmed)
    const queryWithLimit = hasLimit ? trimmed : `${trimmed} LIMIT ${MAX_ROWS + 1}`

    const result = await Promise.race([
      prisma.$queryRawUnsafe(queryWithLimit) as Promise<Record<string, unknown>[]>,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout (${QUERY_TIMEOUT_MS / 1000}s)`)), QUERY_TIMEOUT_MS)
      ),
    ])

    const duration = Date.now() - start
    const rows = Array.isArray(result) ? result : []
    const truncated = rows.length > MAX_ROWS
    const data = truncated ? rows.slice(0, MAX_ROWS) : rows

    // Serialize BigInt values to strings
    const serialized = data.map((row) => {
      const obj: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(row)) {
        obj[key] = typeof val === 'bigint' ? val.toString() : val
      }
      return obj
    })

    const columns = serialized.length > 0 ? Object.keys(serialized[0]) : []

    return {
      success: true,
      data: serialized,
      columns,
      rowCount: serialized.length,
      duration,
      truncated,
    }
  } catch (err) {
    const duration = Date.now() - start
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return { success: false, error: message, duration }
  }
}

/** Quick-access queries for common admin tasks */
export const PRESET_QUERIES = {
  'Clubes activos': `SELECT id, name, slug, "subscriptionStatus", "createdAt" FROM "Club" ORDER BY "createdAt" DESC`,
  'Reservas hoy': `SELECT b.id, b."startTime", b.status, b.price, c.name as client, co.name as court, cl.name as club
FROM "Booking" b
LEFT JOIN "Client" c ON b."clientId" = c.id
JOIN "Court" co ON b."courtId" = co.id
JOIN "Club" cl ON b."clubId" = cl.id
WHERE b."startTime"::date = CURRENT_DATE
ORDER BY b."startTime"`,
  'Ingresos por club (30d)': `SELECT cl.name as club, COUNT(t.id) as transacciones, COALESCE(SUM(t.amount), 0) as total
FROM "Transaction" t
JOIN "Club" cl ON t."clubId" = cl.id
WHERE t."createdAt" > NOW() - INTERVAL '30 days' AND t.type = 'INCOME'
GROUP BY cl.name
ORDER BY total DESC`,
  'Clientes sin reserva (60d)': `SELECT c.name, c.phone, c.email, cl.name as club, c."lastBookingAt"
FROM "Client" c
JOIN "Club" cl ON c."clubId" = cl.id
WHERE c."lastBookingAt" < NOW() - INTERVAL '60 days' OR c."lastBookingAt" IS NULL
ORDER BY c."lastBookingAt" ASC NULLS FIRST
LIMIT 50`,
  'Ocupacion por cancha': `SELECT co.name as court, cl.name as club, COUNT(b.id) as bookings_30d
FROM "Court" co
JOIN "Club" cl ON co."clubId" = cl.id
LEFT JOIN "Booking" b ON b."courtId" = co.id AND b."startTime" > NOW() - INTERVAL '30 days' AND b.status = 'CONFIRMED'
GROUP BY co.name, cl.name
ORDER BY bookings_30d DESC`,
  'Tablas y tamaños': `SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC`,
} as const
