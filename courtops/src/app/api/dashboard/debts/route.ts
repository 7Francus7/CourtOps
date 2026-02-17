import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
       try {
              const session = await getServerSession(authOptions)
              if (!session?.user?.clubId) {
                     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
              }

              const clubId = session.user.clubId

              // Get all UNPAID/PARTIAL bookings where the booking is in the past (debt)
              const now = new Date()

              const debts = await prisma.booking.findMany({
                     where: {
                            clubId,
                            deletedAt: null,
                            paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
                            status: 'CONFIRMED',
                            startTime: { lt: now }, // Only past bookings = actual debts
                     },
                     select: {
                            id: true,
                            startTime: true,
                            price: true,
                            guestName: true,
                            guestPhone: true,
                            client: {
                                   select: {
                                          id: true,
                                          name: true,
                                          phone: true,
                                   }
                            },
                            court: {
                                   select: {
                                          name: true,
                                   }
                            }
                     },
                     orderBy: { startTime: 'desc' },
                     take: 10,
              })

              // Aggregate total debt
              const totalDebt = await prisma.booking.aggregate({
                     where: {
                            clubId,
                            deletedAt: null,
                            paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
                            status: 'CONFIRMED',
                            startTime: { lt: now },
                     },
                     _sum: { price: true },
                     _count: true,
              })

              // Group by client for top debtors
              const debtsByClient = debts.reduce((acc: Record<string, { name: string, phone: string, total: number, count: number }>, b) => {
                     const name = b.client?.name || b.guestName || 'Sin nombre'
                     const phone = b.client?.phone || b.guestPhone || ''
                     const key = phone || name
                     if (!acc[key]) {
                            acc[key] = { name, phone, total: 0, count: 0 }
                     }
                     acc[key].total += b.price
                     acc[key].count += 1
                     return acc
              }, {})

              const topDebtors = Object.values(debtsByClient)
                     .sort((a, b) => b.total - a.total)
                     .slice(0, 5)

              return NextResponse.json({
                     success: true,
                     data: {
                            totalAmount: totalDebt._sum.price || 0,
                            totalCount: totalDebt._count || 0,
                            topDebtors,
                            recentDebts: debts.slice(0, 5).map(d => ({
                                   id: d.id,
                                   name: d.client?.name || d.guestName || 'Sin nombre',
                                   phone: d.client?.phone || d.guestPhone || '',
                                   amount: d.price,
                                   date: d.startTime,
                                   court: d.court?.name || '',
                            })),
                     }
              })
       } catch (err: any) {
              console.error('[API /dashboard/debts] Error', err)
              return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
       }
}
