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
              const dateStr = searchParams.get('date')

              // Default to today
              const targetDate = dateStr ? new Date(dateStr) : new Date()
              const startOfDay = new Date(targetDate)
              startOfDay.setHours(0, 0, 0, 0)
              const endOfDay = new Date(targetDate)
              endOfDay.setHours(23, 59, 59, 999)

              // Find the register for the date
              const register = await prisma.cashRegister.findFirst({
                     where: {
                            clubId,
                            date: { gte: startOfDay, lte: endOfDay }
                     },
                     include: {
                            transactions: {
                                   orderBy: { createdAt: 'asc' },
                                   include: {
                                          client: { select: { name: true } },
                                          booking: { select: { id: true } }
                                   }
                            }
                     }
              })

              if (!register) {
                     return new NextResponse('No hay caja registrada para esta fecha', { status: 404 })
              }

              const headers = [
                     'ID', 'Hora', 'Tipo', 'Categoría', 'Método',
                     'Monto', 'Descripción', 'Cliente', 'Reserva ID'
              ]

              const rows = register.transactions.map(tx => {
                     const localTime = fromUTC(tx.createdAt)
                     return [
                            tx.id,
                            format(localTime, 'HH:mm'),
                            tx.type === 'INCOME' ? 'Ingreso' : 'Egreso',
                            tx.category,
                            tx.method,
                            tx.type === 'EXPENSE' ? -tx.amount : tx.amount,
                            tx.description || '',
                            tx.client?.name || '',
                            tx.booking?.id || ''
                     ].map(escapeCSV).join(',')
              })

              // Add summary row
              const totalIncome = register.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
              const totalExpense = register.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
              rows.push('') // empty row
              rows.push(['', '', '', '', 'TOTAL INGRESOS', totalIncome, '', '', ''].map(escapeCSV).join(','))
              rows.push(['', '', '', '', 'TOTAL EGRESOS', -totalExpense, '', '', ''].map(escapeCSV).join(','))
              rows.push(['', '', '', '', 'BALANCE', totalIncome - totalExpense, '', '', ''].map(escapeCSV).join(','))

              if (register.startAmount) {
                     rows.push(['', '', '', '', 'FONDO INICIAL', register.startAmount, '', '', ''].map(escapeCSV).join(','))
                     rows.push(['', '', '', '', 'EFECTIVO ESPERADO', register.startAmount + totalIncome - totalExpense, '', '', ''].map(escapeCSV).join(','))
              }

              const csv = [headers.join(','), ...rows].join('\n')
              const BOM = '\uFEFF'
              const dateLabel = format(targetDate, 'yyyyMMdd')

              return new NextResponse(BOM + csv, {
                     headers: {
                            'Content-Type': 'text/csv; charset=utf-8',
                            'Content-Disposition': `attachment; filename="caja_${dateLabel}.csv"`
                     }
              })

       } catch (error: any) {
              console.error('[CSV Export Caja]', error)
              return NextResponse.json({ error: error.message }, { status: 500 })
       }
}
