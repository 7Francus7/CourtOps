'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getPublicTournament(tournamentId: string) {
       try {
              const tournament = await prisma.tournament.findUnique({
                     where: { id: tournamentId },
                     include: {
                            club: {
                                   select: { id: true, name: true, slug: true, logoUrl: true }
                            },
                            categories: {
                                   include: {
                                          _count: {
                                                 select: { teams: true }
                                          }
                                   }
                            }
                     }
              })

              if (!tournament) return null

              // We can also fetch accepted teams names for social proof if we want
              // But for now, just the count is enough or maybe a separate call.

              return tournament
       } catch (error) {
              console.error("Error fetching public tournament:", error)
              return null
       }
}

export async function registerPublicTeam(categoryId: string, data: {
       player1Name: string,
       player1Phone: string,
       player2Name: string,
       player2Phone: string,
       teamName?: string
}) {
       try {
              const category = await prisma.tournamentCategory.findUnique({
                     where: { id: categoryId },
                     include: { tournament: true }
              })

              if (!category) return { success: false, error: 'Categoría no encontrada' }

              // Create the team
              // We might want to create "Clients" for these players if they don't exist?
              // For simplicity in public flow, we just create the team with the provided names.
              // If we want to link to Clients, we'd need to fuzzy match by phone.

              // Let's try to finding or creating clients to keep the DB clean
              const p1 = await findOrCreateClient(category.tournament.clubId, data.player1Name, data.player1Phone)
              const p2 = await findOrCreateClient(category.tournament.clubId, data.player2Name, data.player2Phone)

              const teamName = data.teamName || `${p1.name.split(' ')[0]} / ${p2.name.split(' ')[0]}`

              const team = await prisma.tournamentTeam.create({
                     data: {
                            categoryId,
                            name: teamName,
                            player1Id: p1.id,
                            player1Name: p1.name,
                            player1Phone: p1.phone,
                            player2Id: p2.id,
                            player2Name: p2.name,
                            player2Phone: p2.phone
                     }
              })

              revalidatePath(`/torneo/${category.tournamentId}`)
              return { success: true, team }

       } catch (error) {
              console.error("Error registering public team:", error)
              return { success: false, error: 'Error al inscribirse' }
       }
}

async function findOrCreateClient(clubId: string, name: string, phone: string) {
       // Clean phone
       const cleanPhone = phone.replace(/[^0-9+]/g, '')

       let client = await prisma.client.findFirst({
              where: { clubId, phone: cleanPhone }
       })

       if (!client) {
              client = await prisma.client.create({
                     data: {
                            clubId,
                            name,
                            phone: cleanPhone,
                            notes: 'Creado desde Inscripción Pública Torneo'
                     }
              })
       }

       return client
}
