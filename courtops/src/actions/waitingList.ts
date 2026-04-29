'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getCurrentClubId } from '@/lib/tenant'

async function triggerWaitingListUpdate(payload: {
       clubId: string
       action: 'create' | 'delete' | 'fulfilled' | 'status'
       dateStr: string
       name?: string
       source?: 'internal' | 'public'
       status?: string
}) {
       try {
              const { pusherServer } = await import('@/lib/pusher')
              await pusherServer.trigger(`club-${payload.clubId}`, 'waiting-list-update', payload)
       } catch (error) {
              console.error('[PUSHER ERROR in waiting-list]', error)
       }
}

export async function addToWaitingList(data: {
       date: Date,
       startTime?: Date,
       endTime?: Date,
       courtId?: number,
       clientName: string,
       clientPhone: string,
       notes?: string
}) {
       try {
              const clubId = await getCurrentClubId()

              // Check if client exists by phone (simple lookup)
              let clientId: undefined | number = undefined
              const existingClient = await prisma.client.findFirst({
                     where: { clubId, phone: data.clientPhone }
              })
              if (existingClient) clientId = existingClient.id

              await prisma.waitingList.create({
                     data: {
                            clubId,
                            date: data.date,
                            startTime: data.startTime,
                            endTime: data.endTime,
                            courtId: data.courtId,
                            name: data.clientName,
                            phone: data.clientPhone,
                            notes: data.notes,
                            clientId
                     }
              })

              await triggerWaitingListUpdate({
                     clubId,
                     action: 'create',
                     dateStr: data.date.toISOString(),
                     name: data.clientName,
                     source: 'internal'
              })

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              console.error("Error adding to waiting list:", error)
              return { success: false, error: 'Error al agregar a lista de espera' }
       }
}

export async function getWaitingList(dateStr: string) {
       try {
              const clubId = await getCurrentClubId()
              const date = new Date(dateStr)
              const startOfDay = new Date(date)
              startOfDay.setHours(0, 0, 0, 0)
              const endOfDay = new Date(date)
              endOfDay.setHours(23, 59, 59, 999)

              const list = await prisma.waitingList.findMany({
                     where: {
                            clubId,
                            date: {
                                   gte: startOfDay,
                                   lte: endOfDay
                            },
                            status: 'PENDING'
                     },
                     include: {
                            client: { select: { id: true, name: true, phone: true } },
                            court: { select: { id: true, name: true } }
                     },
                     orderBy: { createdAt: 'asc' }
              })

              const [contacted, noResponse, fulfilled] = await Promise.all([
                     prisma.waitingList.count({
                            where: {
                                   clubId,
                                   date: {
                                          gte: startOfDay,
                                          lte: endOfDay
                                   },
                                   status: 'CONTACTED'
                            }
                     }),
                     prisma.waitingList.count({
                            where: {
                                   clubId,
                                   date: {
                                          gte: startOfDay,
                                          lte: endOfDay
                                   },
                                   status: 'NO_RESPONSE'
                            }
                     }),
                     prisma.waitingList.count({
                            where: {
                                   clubId,
                                   date: {
                                          gte: startOfDay,
                                          lte: endOfDay
                                   },
                                   status: 'FULFILLED'
                            }
                     })
              ])

              return {
                     success: true,
                     list,
                     summary: {
                            pending: list.length,
                            contacted,
                            noResponse,
                            fulfilled
                     }
              }
       } catch (error) {
              console.error(error)
              return {
                     success: false,
                     list: [],
                     summary: {
                            pending: 0,
                            contacted: 0,
                            noResponse: 0,
                            fulfilled: 0
                     }
              }
       }
}

export async function resolveWaitingList(id: number, action: 'DELETE' | 'FULFILLED') {
       try {
              const clubId = await getCurrentClubId()

              // Verify ownership
              const entry = await prisma.waitingList.findFirst({
                     where: { id, clubId }
              })

              if (!entry) return { success: false, error: 'No autorizado' }

              if (action === 'DELETE') {
                     await prisma.waitingList.delete({ where: { id } })
              } else {
                     await prisma.waitingList.update({
                            where: { id },
                            data: { status: 'FULFILLED' }
                     })
              }

              await triggerWaitingListUpdate({
                     clubId,
                     action: action === 'DELETE' ? 'delete' : 'fulfilled',
                     dateStr: entry.date.toISOString(),
                     name: entry.name,
                     source: 'internal'
              })

              revalidatePath('/')
              return { success: true }
       } catch (e) {
              console.error("Error resolving waiting list:", e)
              return { success: false, error: 'Error al procesar' }
       }
}

export async function updateWaitingListStatus(
       id: number,
       status: 'PENDING' | 'CONTACTED' | 'NO_RESPONSE' | 'FULFILLED'
) {
       try {
              const clubId = await getCurrentClubId()

              const entry = await prisma.waitingList.findFirst({
                     where: { id, clubId }
              })

              if (!entry) return { success: false, error: 'No autorizado' }

              await prisma.waitingList.update({
                     where: { id },
                     data: { status }
              })

              await triggerWaitingListUpdate({
                     clubId,
                     action: status === 'FULFILLED' ? 'fulfilled' : 'status',
                     dateStr: entry.date.toISOString(),
                     name: entry.name,
                     source: 'internal',
                     status
              })

              revalidatePath('/')
              return { success: true }
       } catch (error) {
              console.error('Error updating waiting list status:', error)
              return { success: false, error: 'Error al actualizar el estado' }
       }
}

export async function getMatchingWaitingUsers(date: Date, startTime: Date, courtId: number) {
       try {
              const clubId = await getCurrentClubId()

              // Define time window (e.g., +/- 30 mins or exact match)
              // For now, exact match on startTime or purely date based notes
              const searchDate = new Date(date)
              searchDate.setHours(0, 0, 0, 0)
              const nextDay = new Date(searchDate)
              nextDay.setDate(nextDay.getDate() + 1)

              const matchTime = new Date(startTime)

              const candidates = await prisma.waitingList.findMany({
                     where: {
                            clubId,
                            status: 'PENDING',
                            date: {
                                   gte: searchDate,
                                   lt: nextDay
                            },
                            // Flexible logic: Match if no specific time set OR overlap
                            OR: [
                                   { startTime: null },
                                   { startTime: { equals: matchTime } }
                            ]
                     },
                     include: {
                            client: true
                     }
              })

              // Filter by court if specified
              const filtered = candidates.filter(c => !c.courtId || c.courtId === courtId)

              return { success: true, list: filtered }
       } catch (error) {
              console.error("Error finding matching waiting users:", error)
              return { success: false, list: [] }
       }
}
