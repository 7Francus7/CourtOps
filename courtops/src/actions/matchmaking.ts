"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function toggleOpenMatch(
       bookingId: number,
       isOpen: boolean,
       details?: {
              matchLevel?: string
              matchGender?: string
              maxPlayers?: number
              description?: string
       }
) {
       const session = await getServerSession(authOptions)
       if (!session?.user?.clubId) {
              return { success: false, error: "No autorizado" }
       }

       try {
              // Verify ownership: booking must belong to the authenticated club
              const existing = await prisma.booking.findUnique({
                     where: { id: bookingId },
                     select: { clubId: true, club: { select: { slug: true } } }
              })

              if (!existing) {
                     return { success: false, error: "Reserva no encontrada" }
              }

              if (existing.clubId !== session.user.clubId) {
                     return { success: false, error: "No autorizado" }
              }

              const booking = await prisma.booking.update({
                     where: { id: bookingId },
                     data: {
                            isOpenMatch: isOpen,
                            ...(isOpen && details ? {
                                   matchLevel: details.matchLevel,
                                   matchGender: details.matchGender,
                                   maxPlayers: details.maxPlayers || 4,
                                   description: details.description
                            } : {
                                   isOpenMatch: false
                            })
                     },
                     include: {
                            club: true
                     }
              })

              if (booking.club?.slug) {
                     revalidatePath(`/dashboard/${booking.club.slug}/bookings`)
                     revalidatePath(`/p/${booking.club.slug}`)
              }

              return { success: true, booking }
       } catch (error) {
              console.error("Error toggling open match:", error)
              return { success: false, error: "Failed to update match status" }
       }
}

export async function getOpenMatches(clubId: string) {
       try {
              const matches = await prisma.booking.findMany({
                     where: {
                            clubId: clubId,
                            isOpenMatch: true,
                            startTime: {
                                   gte: new Date()
                            },
                            status: {
                                   not: "CANCELLED"
                            }
                     },
                     include: {
                            court: true,
                            players: true
                     },
                     orderBy: {
                            startTime: 'asc'
                     }
              })
              return { success: true, matches }
       } catch (_error) {
              return { success: false, error: "Failed to fetch open matches" }
       }
}
