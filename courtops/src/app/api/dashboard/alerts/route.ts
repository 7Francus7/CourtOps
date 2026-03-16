import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { nowInArg } from '@/lib/date-utils'
import { fromZonedTime } from 'date-fns-tz'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.clubId

    // Build today's boundaries in Argentina timezone
    const now = nowInArg()
    const yyyy = now.getUTCFullYear()
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(now.getUTCDate()).padStart(2, '0')
    const todayStart = fromZonedTime(`${yyyy}-${mm}-${dd} 00:00:00`, 'America/Argentina/Buenos_Aires')
    const todayEnd = fromZonedTime(`${yyyy}-${mm}-${dd} 23:59:59`, 'America/Argentina/Buenos_Aires')

    const lowStock = await prisma.product.findMany({ where: { clubId, stock: { lte: 5 }, isActive: true }, take: 5 }).catch(() => [])
    const pendingPayments = await prisma.booking.findMany({
      where: {
        clubId,
        status: 'CONFIRMED',
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
        startTime: { gte: todayStart, lte: todayEnd }
      },
      include: { client: true },
      take: 10
    }).catch(() => [])

    return NextResponse.json({ lowStock, pendingPayments })
  } catch (err: unknown) {
    console.error('[API /alerts] Error', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
