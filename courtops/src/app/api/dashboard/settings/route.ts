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
    const club = await prisma.club.findUnique({ where: { id: clubId } })

    return NextResponse.json(club)
  } catch (err: any) {
    console.error('[API /settings] Error', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
