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
              const currentPlayersCount = 1 + match.players.length
              const missing = Math.max(0, match.maxPlayers - currentPlayersCount)
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
       })))
}

export async function joinOpenMatch(bookingId: number, name: string, phone: string) {
       const booking = await prisma.booking.findUnique({
              where: { id: bookingId },
              include: { players: true }
       })

       if (!booking) throw new Error("Partido no encontrado")

       // Guard: only bookings explicitly marked as open matches can be joined
       if (!booking.isOpenMatch) {
              throw new Error("Este partido no está abierto para unirse")
       }

       // Guard: cannot join cancelled or past bookings
       if (booking.status === 'CANCELED' || booking.status === 'CANCELLED') {
              throw new Error("No se puede unir a un partido cancelado")
       }

       if (booking.startTime <= new Date()) {
              throw new Error("No se puede unir a un partido que ya comenzó")
       }

       const currentPlayersCount = 1 + booking.players.length

       if (currentPlayersCount >= booking.maxPlayers) {
              throw new Error("El partido está completo.")
       }

       await prisma.bookingPlayer.create({
              data: {
                     bookingId,
                     name,
                     phone,
                     amount: booking.price / booking.maxPlayers,
                     isPaid: false,
              }
       })

       revalidatePath('/')
       return { success: true }
}
