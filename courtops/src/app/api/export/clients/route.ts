import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { format } from 'date-fns'

function escapeCSV(value: string | number | null | undefined): string {
       if (value === null || value === undefined) return ''
       const str = String(value)
       if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`
       }
       return str
}

export async function GET(request: Request) {
       try {
              const session = await getServerSession(authOptions)
              if (!session?.user?.clubId) {
                     return new NextResponse('Unauthorized', { status: 401 })
              }

              const clubId = session.user.clubId

              const clients = await prisma.client.findMany({
                     where: { clubId, deletedAt: null },
                     include: {
                            _count: { select: { bookings: true } },
                            bookings: {
                                   orderBy: { startTime: 'desc' },
                                   take: 1,
                                   select: { startTime: true }
                            },
                            memberships: {
                                   where: { status: 'ACTIVE' },
                                   take: 1,
                                   select: { plan: { select: { name: true } } }
                            }
                     },
                     orderBy: { name: 'asc' }
              })

              // Count no-shows per client
              const noShows = await prisma.booking.groupBy({
                     by: ['clientId'],
                     where: { clubId, status: 'NO_SHOW', clientId: { not: null } },
                     _count: true
              })
              const noShowMap = new Map(noShows.map(n => [n.clientId, n._count]))

              const headers = [
                     'ID', 'Nombre', 'Teléfono', 'Email', 'Categoría',
                     'Total Reservas', 'Última Reserva', 'No-Shows',
                     'Membresía', 'Notas'
              ]

              const rows = clients.map(c => {
                     const lastBooking = c.bookings[0]?.startTime
                            ? format(new Date(c.bookings[0].startTime), 'dd/MM/yyyy')
                            : 'Nunca'
                     const membership = c.memberships[0]?.plan?.name || 'Sin membresía'

                     return [
                            c.id,
                            c.name,
                            c.phone,
                            c.email || '',
                            c.category || '',
                            c._count.bookings,
                            lastBooking,
                            noShowMap.get(c.id) || 0,
                            membership,
                            c.notes || ''
                     ].map(escapeCSV).join(',')
              })

              const csv = [headers.join(','), ...rows].join('\n')
              const BOM = '\uFEFF'

              return new NextResponse(BOM + csv, {
                     headers: {
                            'Content-Type': 'text/csv; charset=utf-8',
                            'Content-Disposition': `attachment; filename="clientes_${format(new Date(), 'yyyyMMdd')}.csv"`
                     }
              })

       } catch (error: any) {
              console.error('[CSV Export Clients]', error)
              return NextResponse.json({ error: error.message }, { status: 500 })
       }
}
