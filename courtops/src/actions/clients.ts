'use server'

import prisma from '@/lib/db'
import { getCurrentClubId, getOrCreateTodayCashRegister } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { startOfDay, endOfDay } from 'date-fns'

// ... EXISTING getClients Function ...
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

// ... MISSING FUNCTIONS RESTORED BELOW ...

export async function getClientDetails(clientId: number) {
       try {
              const clubId = await getCurrentClubId()
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

              if (!client) return { success: false, error: 'Cliente no encontrado' }

              return { success: true, client }
       } catch (error) {
              return { success: false, error: 'Error al obtener cliente' }
       }
}

export async function updateClient(clientId: number, data: any) {
       try {
              const clubId = await getCurrentClubId()
              // Check ownership
              const exists = await prisma.client.findFirst({ where: { id: clientId, clubId } })
              if (!exists) return { success: false, error: 'Acceso denegado' }

              await prisma.client.update({
                     where: { id: clientId },
                     data: {
                            name: data.name,
                            phone: data.phone,
                            email: data.email,
                            notes: data.notes
                     }
              })

              revalidatePath('/clientes')
              revalidatePath(`/clientes/${clientId}`)
              return { success: true }
       } catch (error) {
              return { success: false, error: 'Error al actualizar cliente' }
       }
}

export async function deleteClient(clientId: number) {
       try {
              const clubId = await getCurrentClubId()
              await prisma.client.updateMany({
                     where: { id: clientId, clubId },
                     data: { deletedAt: new Date() }
              })
              revalidatePath('/clientes')
              return { success: true }
       } catch (error) {
              return { success: false, error: 'Error al eliminar' }
       }
}

export async function createClientPayment(clientId: number, amount: number, description: string) {
       try {
              const clubId = await getCurrentClubId()
              const register = await getOrCreateTodayCashRegister(clubId)

              await prisma.transaction.create({
                     data: {
                            cashRegisterId: register.id,
                            clientId,
                            type: 'INCOME',
                            category: 'CLIENT_PAYMENT', // Pago de deuda o cuenta corriente
                            amount,
                            method: 'CASH',
                            description: description || 'Pago a cuenta'
                     }
              })

              revalidatePath(`/clientes/${clientId}`)
              return { success: true }

       } catch (error) {
              return { success: false, error: 'Error al registrar pago' }
       }
}
