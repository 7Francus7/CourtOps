'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export async function getClients(query?: string) {
       try {
              const clubId = await getCurrentClubId()
              const clients = await prisma.client.findMany({
                     where: {
                            clubId,
                            name: { contains: query, mode: 'insensitive' },
                            deletedAt: null
                     },
                     include: {
                            _count: {
                                   select: { bookings: true }
                            },
                            bookings: {
                                   orderBy: { startTime: 'desc' },
                                   take: 1,
                                   select: { startTime: true }
                            }
                     },
                     orderBy: {
                            name: 'asc'
                     }
              })

              // Map to friendly format
              const mapped = clients.map(c => ({
                     id: c.id,
                     name: c.name,
                     phone: c.phone || '',
                     email: c.email || '',
                     totalBookings: c._count.bookings,
                     lastBooking: c.bookings[0]?.startTime || null,
                     status: getUserStatus(c.bookings[0]?.startTime)
              }))

              return { success: true, data: mapped }
       } catch (error) {
              console.error("Error fetching clients:", error)
              return { success: false, error: "Error al obtener clientes" }
       }
}

function getUserStatus(lastDate?: Date) {
       if (!lastDate) return 'NEW'
       const diff = new Date().getTime() - new Date(lastDate).getTime()
       const days = diff / (1000 * 3600 * 24)
       if (days < 30) return 'ACTIVE'
       if (days < 90) return 'RISK'
       return 'LOST'
}
