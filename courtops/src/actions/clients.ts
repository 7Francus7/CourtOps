'use server'

import prisma from '@/lib/db'
import { createSafeAction } from '@/lib/safe-action'
import { getOrCreateTodayCashRegister } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export const getClients = createSafeAction(async ({ clubId }, query?: string) => {
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
                            where: { startTime: { lte: new Date() }, status: { not: 'CANCELED' } },
                            orderBy: { startTime: 'desc' },
                            take: 1,
                            select: { startTime: true }
                     },
                     memberships: {
                            where: { status: 'ACTIVE' },
                            take: 1
                     }
              },
              orderBy: {
                     name: 'asc'
              }
       })

       // Map to friendly format
       return clients.map(c => ({
              id: c.id,
              name: c.name,
              phone: c.phone || '',
              email: c.email || '',
              category: c.category || '',
              notes: c.notes || '',
              totalBookings: c._count.bookings,
              lastBooking: c.bookings[0]?.startTime || null,
              status: getUserStatus(c.bookings[0]?.startTime),
              membershipStatus: c.memberships.length > 0 ? 'ACTIVE' : 'INACTIVE'
       }))
})

function getUserStatus(lastDate?: Date) {
       if (!lastDate) return 'NEW'
       const diff = new Date().getTime() - new Date(lastDate).getTime()
       const days = diff / (1000 * 3600 * 24)
       if (days < 30) return 'ACTIVE'
       if (days < 90) return 'RISK'
       return 'LOST'
}

export const createClient = createSafeAction(async ({ clubId }, data: { name: string, phone: string, email?: string, category?: string, notes?: string }) => {
       const existingClient = await prisma.client.findFirst({
              where: { clubId, phone: data.phone }
       })

       if (existingClient) {
              if (existingClient.deletedAt) {
                     // Restore the soft-deleted client
                     const restoredClient = await prisma.client.update({
                            where: { id: existingClient.id },
                            data: {
                                   name: data.name,
                                   email: data.email,
                                   category: data.category,
                                   notes: data.notes,
                                   deletedAt: null
                            }
                     })
                     revalidatePath('/clientes')
                     return restoredClient
              } else {
                     throw new Error('Ya existe un cliente activo con este teléfono')
              }
       }

       const client = await prisma.client.create({
              data: {
                     clubId,
                     name: data.name,
                     phone: data.phone,
                     email: data.email,
                     category: data.category,
                     notes: data.notes
              }
       })
       revalidatePath('/clientes')
       return client
})

export const getClientDetails = createSafeAction(async ({ clubId }, clientId: number) => {
       const client = await prisma.client.findFirst({
              where: { id: clientId, clubId },
              include: {
                     bookings: {
                            orderBy: { startTime: 'desc' },
                            take: 20,
                            include: { court: true }
                     },
                     transactions: {
                            orderBy: { createdAt: 'desc' },
                            take: 20
                     },
                     memberships: {
                            where: { status: 'ACTIVE' },
                            include: { plan: true }
                     }
              }
       })

       if (!client) throw new Error('Cliente no encontrado')
       return client
})

export const updateClient = createSafeAction(async ({ clubId }, clientId: number, data: { name: string, phone: string, email?: string, category?: string, notes?: string }) => {
       const updated = await prisma.client.update({
              where: { id_clubId: { id: clientId, clubId } },
              data: {
                     name: data.name,
                     phone: data.phone,
                     email: data.email,
                     category: data.category,
                     notes: data.notes
              }
       })

       revalidatePath('/clientes')
       revalidatePath(`/clientes/${clientId}`)
       return updated
})

export const deleteClient = createSafeAction(async ({ clubId }, clientId: number) => {
       // Anonimizar PII además del soft delete (cumplimiento Ley 25.326)
       await prisma.client.update({
              where: { id_clubId: { id: clientId, clubId } },
              data: {
                     deletedAt: new Date(),
                     name: 'Cliente eliminado',
                     phone: `deleted_${clientId}_${Date.now()}`,
                     email: null,
                     notes: null,
              }
       })
       revalidatePath('/clientes')
       return { success: true }
})

export const createClientPayment = createSafeAction(async ({ clubId }, clientId: number, amount: number, method: string, description: string) => {
       const register = await getOrCreateTodayCashRegister(clubId)

       // Verify client belongs to club
       const client = await prisma.client.findFirst({ where: { id: clientId, clubId } })
       if (!client) throw new Error('Cliente no encontrado')

       const transaction = await prisma.transaction.create({
              data: {
                     clubId,
                     cashRegisterId: register.id,
                     clientId,
                     type: 'INCOME',
                     category: 'CLIENT_PAYMENT',
                     amount,
                     method: method || 'CASH',
                     description: description || 'Pago a cuenta'
              }
       })

       revalidatePath(`/clientes/${clientId}`)
       return transaction
})
