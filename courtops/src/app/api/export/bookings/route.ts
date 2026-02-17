import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { format } from 'date-fns'
import { fromUTC } from '@/lib/date-utils'

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
              const { searchParams } = new URL(request.url)
              const startStr = searchParams.get('start')
              const endStr = searchParams.get('end')

              const start = startStr ? new Date(startStr) : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d })()
              const end = endStr ? new Date(endStr) : new Date()

              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: start, lte: end },
                            deletedAt: null
                     },
                     include: {
                            client: { select: { name: true, phone: true, email: true } },
                            court: { select: { name: true } },
                            transactions: { select: { amount: true, method: true } },
                            items: { select: { unitPrice: true, quantity: true } }
                     },
                     orderBy: { startTime: 'asc' }
              })

              const headers = [
                     'ID', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Cancha',
                     'Cliente', 'Teléfono', 'Email',
                     'Estado', 'Estado Pago', 'Método Pago',
                     'Precio Cancha', 'Consumos', 'Total', 'Pagado', 'Saldo'
              ]

              const rows = bookings.map(b => {
                     const localStart = fromUTC(b.startTime)
                     const localEnd = fromUTC(b.endTime)
                     const itemsTotal = b.items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0)
                     const total = b.price + itemsTotal
                     const paid = b.transactions.reduce((s, t) => s + t.amount, 0)
                     const balance = total - paid

                     return [
                            b.id,
                            format(localStart, 'dd/MM/yyyy'),
                            format(localStart, 'HH:mm'),
                            format(localEnd, 'HH:mm'),
                            b.court.name,
                            b.client?.name || b.guestName || 'Anónimo',
                            b.client?.phone || b.guestPhone || '',
                            b.client?.email || '',
                            b.status,
                            b.paymentStatus,
                            b.paymentMethod || '',
                            b.price,
                            itemsTotal,
                            total,
                            paid,
                            balance
                     ].map(escapeCSV).join(',')
              })

              const csv = [headers.join(','), ...rows].join('\n')
              const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility

              return new NextResponse(BOM + csv, {
                     headers: {
                            'Content-Type': 'text/csv; charset=utf-8',
                            'Content-Disposition': `attachment; filename="reservas_${format(start, 'yyyyMMdd')}_${format(end, 'yyyyMMdd')}.csv"`
                     }
              })

       } catch (error: any) {
              console.error('[CSV Export Bookings]', error)
              return NextResponse.json({ error: error.message }, { status: 500 })
       }
}
