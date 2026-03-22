import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

const RETENTION_DAYS = 90

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS)

    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })

    console.log(`[Cron audit-cleanup] Eliminados ${result.count} registros de auditoría anteriores a ${cutoff.toISOString()}`)

    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error: unknown) {
    console.error('[Cron audit-cleanup] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
