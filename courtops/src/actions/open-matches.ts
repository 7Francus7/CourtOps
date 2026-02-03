'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export interface OpenMatch {
       id: number
       startTime: Date
       endTime: Date
       courtName: string
       surface?: string | null
       level: string | null
       gender: string | null
       missingPlayers: number
       pricePerPlayer: number
       players: { name: string }[]
}

export async function getOpenMatches(clubSlug: string): Promise<OpenMatch[]> {
       const club = await prisma.club.findUnique({ where: { slug: clubSlug } })
       if (!club) return []

       const now = new Date()

       const matches = await prisma.booking.findMany({
              where: {
                     clubId: club.id,
                     isOpenMatch: true,
                     startTime: { gt: now },
                     status: { not: 'CANCELED' }
              },
              include: {
                     court: true,
                     players: true,
                     client: true
              },
              orderBy: {
                     startTime: 'asc'
              }
       })

       return JSON.parse(JSON.stringify(matches.map(match => {
              // Logic to calculate missing players
              // Creator counts as 1.
              // Joined players count as 1 each.
              const currentPlayersCount = 1 + match.players.length
              const missing = Math.max(0, match.maxPlayers - currentPlayersCount)

              // Price per person
              // Assuming equal split
              const pricePerPerson = match.price / match.maxPlayers

              return {
                     id: match.id,
                     startTime: match.startTime,
                     endTime: match.endTime,
                     courtName: match.court.name,
                     surface: match.court.surface,
                     level: match.matchLevel,
                     gender: match.matchGender,
                     missingPlayers: missing,
                     pricePerPlayer: pricePerPerson,
                     players: match.players.map(p => ({ name: p.name }))
              }
       })
}

export async function joinOpenMatch(bookingId: number, name: string, phone: string) {
       const booking = await prisma.booking.findUnique({
              where: { id: bookingId },
              include: { players: true }
       })

       if (!booking) throw new Error("Partido no encontrado")

       const currentPlayersCount = 1 + booking.players.length

       if (currentPlayersCount >= booking.maxPlayers) {
              throw new Error("El partido está completo.")
       }

       // Add player
       await prisma.bookingPlayer.create({
              data: {
                     bookingId,
                     name,
                     phone,
                     amount: booking.price / booking.maxPlayers, // Auto set amount
                     isPaid: false, // Default unpaid
              }
       })

       revalidatePath('/')
       return { success: true }
}
