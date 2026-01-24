'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getCurrentClubId } from '@/lib/tenant'

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

              return { success: true, list }
       } catch (error) {
              console.error(error)
              return { success: false, list: [] }
       }
}

export async function resolveWaitingList(id: number, action: 'DELETE' | 'FULFILLED') {
       try {
              if (action === 'DELETE') {
                     await prisma.waitingList.delete({ where: { id } })
              } else {
                     await prisma.waitingList.update({
                            where: { id },
                            data: { status: 'FULFILLED' }
                     })
              }
              revalidatePath('/')
              return { success: true }
       } catch (e) {
              return { success: false }
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
