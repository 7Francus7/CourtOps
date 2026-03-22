import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

const TRIAL_DAYS = 7

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - TRIAL_DAYS)

    // Encontrar clubes en TRIAL cuyo trial ya expiró
    const expiredClubs = await prisma.club.findMany({
      where: {
        subscriptionStatus: 'TRIAL',
        createdAt: { lt: cutoff },
        deletedAt: null,
      },
      select: { id: true, name: true, createdAt: true },
    })

    if (expiredClubs.length === 0) {
      return NextResponse.json({ success: true, expired: 0 })
    }

    const ids = expiredClubs.map((c) => c.id)

    await prisma.club.updateMany({
      where: { id: { in: ids } },
      data: { subscriptionStatus: 'EXPIRED' },
    })

    console.log(`[Cron trial-expiry] ${ids.length} club(s) expirados:`, ids)

    return NextResponse.json({
      success: true,
      expired: ids.length,
      clubs: expiredClubs.map((c) => ({ id: c.id, name: c.name })),
    })
  } catch (error: unknown) {
    console.error('[Cron trial-expiry] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
