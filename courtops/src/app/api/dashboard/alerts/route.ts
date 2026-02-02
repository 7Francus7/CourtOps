import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.clubId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.clubId
    const lowStock = await prisma.product.findMany({ where: { clubId, stock: { lte: 5 }, isActive: true }, take: 5 }).catch(() => [])
    const pendingPayments = await prisma.booking.findMany({ where: { clubId, status: 'CONFIRMED', paymentStatus: { in: ['UNPAID', 'PARTIAL'] } }, include: { client: true }, take: 10 }).catch(() => [])

    return NextResponse.json({ lowStock, pendingPayments })
  } catch (err: any) {
    console.error('[API /alerts] Error', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
