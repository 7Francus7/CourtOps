"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// -- VALIDATION SCHEMAS --
const CreateTournamentSchema = z.object({
       name: z.string().min(1, "El nombre es requerido"),
       startDate: z.date(),
       endDate: z.date().optional(),
})

const CreateCategorySchema = z.object({
       name: z.string().min(1),
       gender: z.enum(["MALE", "FEMALE", "MIXED"]),
       price: z.number().min(0),
})

const CreateTeamSchema = z.object({
       name: z.string().min(1, "Nombre del equipo requerido"),
       player1Name: z.string().min(1),
       player1Phone: z.string().optional(),
       player2Name: z.string().min(1),
       player2Phone: z.string().optional(),
})

// -- ACTIONS --

export async function getTournaments() {
       const session = await getServerSession(authOptions)
       if (!session?.user?.clubId) return []

       try {
              const tournaments = await prisma.tournament.findMany({
                     where: {
                            clubId: session.user.clubId,
                     },
                     orderBy: {
                            startDate: 'desc'
                     },
                     include: {
                            _count: {
                                   select: { categories: true }
                            },
                            // Manually counting teams and matches might be needed if they are deep relations
                            // Prisma _count does not support deep relations easily on top level
                            // But we can approximate or changing schema to link directly if performance needed.
                            // For now, let's keep it simple.
                     }
              })

              // Calculate totals manually or via separate query if needed for deep counts.
              // For now we just return what we have. 
              // If the UI needs deep counts (teams across all categories), we might need a raw query or loop.
              // Let's attach them:
              const tournamentsWithCounts = await Promise.all(tournaments.map(async (t) => {
                     const teamsCount = await prisma.tournamentTeam.count({
                            where: {
                                   category: {
                                          tournamentId: t.id
                                   }
                            }
                     })
                     const matchesCount = await prisma.tournamentMatch.count({
                            where: {
                                   category: {
                                          tournamentId: t.id
                                   }
                            }
                     })
                     return {
                            ...t,
                            _count: {
                                   ...t._count,
                                   teams: teamsCount,
                                   matches: matchesCount
                            }
                     }
              }))

              return tournamentsWithCounts
       } catch (error) {
              console.error("Error fetching tournaments:", error)
              return []
       }
}

export async function createTournament(data: { name: string, startDate: Date, endDate?: Date }) {
       const session = await getServerSession(authOptions)
       if (!session?.user?.clubId) return { success: false, error: "Unauthorized" }

       const valid = CreateTournamentSchema.safeParse(data)
       if (!valid.success) return { success: false, error: "Datos inválidos" }

       try {
              const tournament = await prisma.tournament.create({
                     data: {
                            name: data.name,
                            startDate: data.startDate,
                            endDate: data.endDate,
                            clubId: session.user.clubId,
                            status: "DRAFT"
                     }
              })
              revalidatePath('/torneos')
              return { success: true, tournament }
       } catch (error) {
              console.error("Error creating tournament:", error)
              return { success: false, error: "Failed to create tournament" }
       }
}

export async function deleteTournament(id: string) {
       const session = await getServerSession(authOptions)
       if (!session?.user?.clubId) return { success: false, error: "Unauthorized" }

       try {
              await prisma.tournament.delete({
                     where: { id }
              })
              revalidatePath('/torneos')
              return { success: true }
       } catch (error) {
              return { success: false, error: "Failed to delete" }
       }
}

export async function getTournament(id: string) {
       const session = await getServerSession(authOptions)
       if (!session?.user?.clubId) return null

       try {
              const tournament = await prisma.tournament.findUnique({
                     where: { id },
                     include: {
                            categories: {
                                   include: {
                                          teams: true,
                                          groups: {
                                                 include: {
                                                        teams: true
                                                 }
                                          }
                                   }
                            },
                            // Matches are related to categories in schema, not directly to tournament?
                            // Schema: TournamentMatch has categoryId.
                            // So we need to fetch matches via category or link TournamentMatch to Tournament directly.
                            // Current Schema: TournamentMatch -> category -> tournament.
                            // So to get all matches for a tournament, we query TournamentMatch where category.tournamentId = id
                     }
              })

              if (!tournament) return null

              // Fetch matches separately to avoid massive nesting or missing relations
              const matches = await prisma.tournamentMatch.findMany({
                     where: {
                            category: {
                                   tournamentId: id
                            }
                     },
                     include: {
                            homeTeam: true,
                            awayTeam: true,
                            category: true
                     },
                     orderBy: {
                            startTime: 'asc'
                     }
              })

              return { ...tournament, matches }
       } catch (error) {
              console.error("Error fetching tournament:", error)
              return null
       }
}

export async function createCategory(tournamentId: string, data: { name: string, gender: "MALE" | "FEMALE" | "MIXED", price: number }) {
       try {
              const category = await prisma.tournamentCategory.create({
                     data: {
                            tournamentId,
                            name: data.name,
                            gender: data.gender,
                            price: data.price
                     }
              })
              revalidatePath(`/torneos/${tournamentId}`)
              return { success: true, category }
       } catch (error) {
              return { success: false, error: "Error creating category" }
       }
}

export async function deleteCategory(categoryId: string) {
       try {
              await prisma.tournamentCategory.delete({ where: { id: categoryId } })
              revalidatePath('/torneos/[id]')
              return { success: true }
       } catch (e) {
              return { success: false, error: "Failed to delete category" }
       }
}

export async function createTeam(categoryId: string, data: { name: string, player1Name: string, player2Name: string, player1Phone?: string, player2Phone?: string }) {
       try {
              const team = await prisma.tournamentTeam.create({
                     data: {
                            categoryId,
                            name: data.name,
                            player1Name: data.player1Name,
                            player2Name: data.player2Name,
                            player1Phone: data.player1Phone,
                            player2Phone: data.player2Phone
                     }
              })
              revalidatePath(`/torneos/[id]`)
              return { success: true, team }
       } catch (error) {
              return { success: false, error: "Error creating team" }
       }
}

export async function deleteTeam(teamId: string) {
       try {
              await prisma.tournamentTeam.delete({ where: { id: teamId } })
              revalidatePath('/torneos/[id]')
              return { success: true }
       } catch (e) {
              return { success: false, error: "Failed to delete team" }
       }
}
