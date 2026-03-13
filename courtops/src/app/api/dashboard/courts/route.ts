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
    const courts = await prisma.court.findMany({
      where: { clubId, isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(courts)
  } catch (err: unknown) {
    console.error('[API /courts] Error', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
