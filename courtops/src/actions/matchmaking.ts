"use server"

import prisma from "@/lib/db"
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
       try {
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
                                   // If closing the match, we might want to clear these or leave them as history.
                                   // Leaving them is safer for toggling back on.
                                   isOpenMatch: false
                            })
                     },
                     include: {
                            club: true // To get the slug for revalidation
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
       } catch (error) {
              return { success: false, error: "Failed to fetch open matches" }
       }
}
