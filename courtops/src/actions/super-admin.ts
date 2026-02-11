'use server'

import prisma from '@/lib/db'
import { hash } from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions, isSuperAdmin } from "@/lib/auth"

// ... (existing code at end of file)
export async function generateImpersonationToken(clubId: string) {
       const session = await getServerSession(authOptions)
       if (!session?.user || !isSuperAdmin(session.user)) {
              return { success: false, error: 'Unauthorized' }
       }

       try {
              // Find the admin user for this club
              const adminUser = await prisma.user.findFirst({
                     where: { clubId, role: 'ADMIN' }
              })

              if (!adminUser) return { success: false, error: 'Club has no admin user' }

              const { createHmac } = await import('crypto')
              const timestamp = Date.now()
              const targetEmail = adminUser.email

              const signature = createHmac('sha256', process.env.NEXTAUTH_SECRET || "lxoRcjQQrIBR5JSGWlNka/1LfH0JtrrxtIGDM/MTAN7o=")
                     .update(`${targetEmail}:${timestamp}`)
                     .digest('hex')

              const tokenPayload = JSON.stringify({ targetEmail, timestamp, signature })
              const token = Buffer.from(tokenPayload).toString('base64')

              return { success: true, token }
       } catch (error: any) {
              console.error("Token generation error:", error)
              return { success: false, error: error.message }
       }
}

export async function getGodModeStats() {
       try {
              const activeClubsCount = await prisma.club.count({
                     where: { subscriptionStatus: 'authorized' }
              })

              const totalClubs = await prisma.club.count()

              // Calculate MRR (Monthly Recurring Revenue)
              const activeClubs = await prisma.club.findMany({
                     where: { subscriptionStatus: 'authorized' },
                     include: { platformPlan: true }
              })

              const mrr = activeClubs.reduce((acc, club) => {
                     return acc + (club.platformPlan?.price || 0)
              }, 0)

              return {
                     totalClubs,
                     activeClubs: activeClubsCount,
                     mrr
              }
       } catch (error) {
              console.error("Error fetching stats:", error)
              return { totalClubs: 0, activeClubs: 0, mrr: 0 }
       }
}

export async function getPlatformPlans() {
       try {
              const plans = await prisma.platformPlan.findMany({ orderBy: { price: 'asc' } })
              return JSON.parse(JSON.stringify(plans))
       } catch (error) {
              console.error("Error fetching platform plans:", error)
              return []
       }
}

export async function createNewClub(formData: FormData) {
       const clubName = formData.get('clubName') as string
       const adminEmail = formData.get('adminEmail') as string
       const adminPassword = formData.get('adminPassword') as string
       const adminName = formData.get('adminName') as string
       const platformPlanId = formData.get('platformPlanId') as string

       if (!clubName || !adminEmail || !adminPassword) {
              return { success: false, error: 'Faltan datos' }
       }

       try {
              // 1. Determine Plan and Limits
              let maxCourts = 2
              let maxUsers = 3
              let hasKiosco = false
              let hasOnlinePayments = false
              let hasAdvancedReports = false

              const selectedPlan = platformPlanId ? await prisma.platformPlan.findUnique({ where: { id: platformPlanId } }) : null

              if (selectedPlan) {
                     // Simple logic to map plan features to limits (customize as needed)
                     const featuresStr = selectedPlan.features as string

                     if (selectedPlan.name.includes("Pro") || selectedPlan.name.includes("Premium")) {
                            maxCourts = 10
                            maxUsers = 10
                            hasKiosco = true
                            hasOnlinePayments = true
                            hasAdvancedReports = true
                     } else if (selectedPlan.name.includes("Enterprise")) {
                            maxCourts = 50
                            maxUsers = 50
                            hasKiosco = true
                            hasOnlinePayments = true
                            hasAdvancedReports = true
                     }
              }

              // 2. Generate Slug
              let slug = clubName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
              const existingSlug = await prisma.club.findUnique({ where: { slug } })
              if (existingSlug) {
                     slug = `${slug}-${Date.now()}`
              }

              // 3. Crear el Club
              const club = await prisma.club.create({
                     data: {
                            name: clubName,
                            slug: slug,
                            // SaaS Fields
                            plan: 'BASIC', // Deprecated Enum kept for compat
                            platformPlanId: selectedPlan?.id,
                            subscriptionStatus: 'TRIAL',
                            maxCourts,
                            maxUsers,
                            hasKiosco,
                            hasOnlinePayments,
                            hasAdvancedReports
                     }
              })

              // 4. Crear Canchas por defecto
              await prisma.court.createMany({
                     data: [
                            { name: 'Cancha 1', clubId: club.id },
                            { name: 'Cancha 2', clubId: club.id },
                     ]
              })

              // 5. Crear el Usuario Admin para ese Club
              const hashedPassword = await hash(adminPassword, 10)
              await prisma.user.create({
                     data: {
                            email: adminEmail,
                            name: adminName || 'Admin Club',
                            password: hashedPassword,
                            role: 'ADMIN',
                            clubId: club.id
                     }
              })

              // 6. Crear Reglas de Precio base
              await prisma.priceRule.create({
                     data: {
                            name: 'Precio General',
                            price: 10000,
                            daysOfWeek: '0,1,2,3,4,5,6',
                            startTime: '00:00',
                            endTime: '23:59',
                            priority: 1,
                            clubId: club.id
                     }
              })

              revalidatePath('/god-mode')
              return { success: true, message: `Club "${clubName}" creado con éxito!` }

       } catch (error: any) {
              console.error("Error creating club:", error)
              return { success: false, error: error.message || 'Error al crear el club' }
       }
}

export async function getAllClubs() {
       const session = await getServerSession(authOptions)
       if (!session?.user || !isSuperAdmin(session.user)) {
              return []
       }

       try {
              const clubs = await prisma.club.findMany({
                     include: {
                            _count: {
                                   select: {
                                          courts: true,
                                          users: true,
                                          bookings: true
                                   }
                            },
                            users: {
                                   where: { role: 'ADMIN' },
                                   select: { id: true, email: true },
                                   take: 1
                            },
                            platformPlan: true
                     },
                     orderBy: {
                            createdAt: 'desc'
                     }
              })
              return JSON.parse(JSON.stringify(clubs))
       } catch (error) {
              console.error("DB Error in getAllClubs:", error)
              return []
       }
}

export async function deleteClub(formData: FormData) {
       const clubId = formData.get('clubId') as string
       if (!clubId) return { success: false, error: 'ID de club requerido' }

       try {
              // Manually delete related records to ensure clean removal
              // Use Promise.all where possible for speed, but sequential for dependency safety
              // Transaction is safest
              const deleteBookings = prisma.booking.deleteMany({ where: { clubId } })
              const deleteCourts = prisma.court.deleteMany({ where: { clubId } })
              const deletePriceRules = prisma.priceRule.deleteMany({ where: { clubId } })
              const deleteUsers = prisma.user.deleteMany({ where: { clubId } })
              const deleteClub = prisma.club.delete({ where: { id: clubId } })

              await prisma.$transaction([deleteBookings, deleteCourts, deletePriceRules, deleteUsers, deleteClub])

              revalidatePath('/god-mode')
              return { success: true, message: 'Club eliminado' }
       } catch (error: any) {
              console.error("Error deleting club:", error)
              return { success: false, error: error.message }
       }
}

export async function activateClubSubscription(clubId: string, planName: string = 'Plan Profesional', months: number = 1) {
       try {
              const plan = await prisma.platformPlan.findFirst({
                     where: { name: planName }
              })

              const validPlanId = plan?.id

              if (!validPlanId) return { success: false, error: 'Plan not found' }

              const nextDate = new Date()
              nextDate.setMonth(nextDate.getMonth() + months)

              await prisma.club.update({
                     where: { id: clubId },
                     data: {
                            subscriptionStatus: 'authorized',
                            platformPlanId: validPlanId,
                            nextBillingDate: nextDate,
                            mpPreapprovalId: `MANUAL_${Date.now()}`
                     }
              })

              revalidatePath('/god-mode')
              return { success: true, message: `Suscripción activada por ${months} mes(es)` }
       } catch (error: any) {
              console.error("Activate Sub Error:", error)
              return { success: false, error: error.message }
       }
}

export async function updateClub(formData: FormData) {
       const clubId = formData.get('clubId') as string
       const name = formData.get('name') as string
       const slug = formData.get('slug') as string
       const platformPlanId = formData.get('platformPlanId') as string

       if (!clubId || !name || !slug) return { success: false, error: 'Datos incompletos' }

       let updateData: any = { name, slug }

       if (platformPlanId) {
              updateData.platformPlanId = platformPlanId
              // Logic to update limits based on plan could go here
       }

       try {
              await prisma.club.update({
                     where: { id: clubId },
                     data: updateData
              })
              revalidatePath('/god-mode')
              return { success: true, message: 'Club actualizado' }
       } catch (error: any) {
              console.error("Error updating club:", error)
              return { success: false, error: error.message }
       }
}

export async function updateClubAdminPassword(formData: FormData) {
       const clubId = formData.get('clubId') as string
       const newPassword = formData.get('newPassword') as string

       if (!clubId || !newPassword) return { success: false, error: 'Faltan datos' }

       try {
              const hashedPassword = await hash(newPassword, 10)
              await prisma.user.updateMany({
                     where: {
                            clubId: clubId,
                            role: 'ADMIN'
                     },
                     data: {
                            password: hashedPassword
                     }
              })

              revalidatePath('/god-mode')
              return { success: true, message: 'Contraseña de admin actualizada' }
       } catch (error: any) {
              console.error("Error updating admin password:", error)
              return { success: false, error: error.message }
       }
}

export async function searchGodMode(query: string) {
       if (!query || query.length < 3) return { success: false, results: null }

       try {
              const clubs = await prisma.club.findMany({
                     where: {
                            OR: [
                                   { name: { contains: query, mode: 'insensitive' } },
                                   { slug: { contains: query, mode: 'insensitive' } },
                                   { id: { contains: query } }
                            ]
                     },
                     select: { id: true, name: true, slug: true, _count: { select: { users: true, bookings: true } } },
                     take: 5
              })

              const users = await prisma.user.findMany({
                     where: {
                            OR: [
                                   { email: { contains: query, mode: 'insensitive' } },
                                   { name: { contains: query, mode: 'insensitive' } }
                            ]
                     },
                     select: { id: true, email: true, name: true, role: true, club: { select: { name: true, slug: true } } },
                     take: 5
              })

              return {
                     success: true,
                     results: { clubs, users }
              }
       } catch (error) {
              console.error("Search Error:", error)
              return { success: false, error: 'Failed to search' }
       }
}

export async function seedClubData(clubId: string) {
       try {
              const club = await prisma.club.findUnique({ where: { id: clubId } })
              if (!club) return { success: false, error: 'Club not found' }

              // Create 10 fake clients
              const clientsData = Array.from({ length: 10 }).map((_, i) => ({
                     name: `Demo User ${i + 1}`,
                     phone: `555-000${i}`,
                     email: `demo${i}@test.com`,
                     clubId: clubId
              }))

              // We need to create clients one by one or createMany. createMany is cleaner but no relations return
              await prisma.client.createMany({ data: clientsData })

              // Fetch them back to make bookings
              const clients = await prisma.client.findMany({ where: { clubId }, take: 10 })
              const courts = await prisma.court.findMany({ where: { clubId } })

              if (courts.length === 0) return { success: false, error: 'Club has no courts to seed bookings' }

              // Create 20 past bookings and 10 future bookings
              const bookingsData = []
              const now = new Date()

              // Past
              for (let i = 0; i < 20; i++) {
                     const randomCourt = courts[Math.floor(Math.random() * courts.length)]
                     const randomClient = clients[Math.floor(Math.random() * clients.length)]
                     const date = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000) // Days back
                     date.setHours(10 + Math.floor(Math.random() * 10), 0, 0, 0)

                     bookingsData.push({
                            clubId,
                            courtId: randomCourt.id,
                            clientId: randomClient.id,
                            startTime: date,
                            endTime: new Date(date.getTime() + 90 * 60000),
                            price: 15000,
                            status: 'COMPLETED',
                            paymentStatus: 'PAID',
                            paymentMethod: 'CASH'
                     })
              }

              // Future
              for (let i = 0; i < 10; i++) {
                     const randomCourt = courts[Math.floor(Math.random() * courts.length)]
                     const randomClient = clients[Math.floor(Math.random() * clients.length)]
                     const date = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000) // Days forward
                     date.setHours(10 + Math.floor(Math.random() * 10), 0, 0, 0)

                     bookingsData.push({
                            clubId,
                            courtId: randomCourt.id,
                            clientId: randomClient.id,
                            startTime: date,
                            endTime: new Date(date.getTime() + 90 * 60000),
                            price: 15000,
                            status: 'CONFIRMED',
                            paymentStatus: 'PENDING',
                     })
              }

              await prisma.booking.createMany({ data: bookingsData })

              revalidatePath('/god-mode')
              return { success: true, message: 'Seeded 10 clients and 30 bookings' }

       } catch (error: any) {
              console.error("Seeding Error:", error)
              return { success: false, error: error.message }
       }

}

export async function toggleClubFeature(clubId: string, feature: string, value: boolean) {
       try {
              const validFeatures = ['hasKiosco', 'hasOnlinePayments', 'hasAdvancedReports', 'hasTournaments', 'hasCustomDomain']
              if (!validFeatures.includes(feature)) return { success: false, error: 'Invalid feature' }

              await prisma.club.update({
                     where: { id: clubId },
                     data: { [feature]: value }
              })

              revalidatePath('/god-mode')
              return { success: true, message: `${feature} updated to ${value}` }
       } catch (error: any) {
              console.error("Toggle Feature Error:", error)
              return { success: false, error: error.message }
       }
}

export async function createSystemNotification(formData: FormData) {
       const title = formData.get('title') as string
       const message = formData.get('message') as string
       const type = formData.get('type') as string
       const target = formData.get('target') as string

       if (!title || !message) return { success: false, error: 'Missing fields' }

       try {
              await prisma.systemNotification.create({
                     data: {
                            title,
                            message,
                            type: type || 'INFO',
                            target: target || 'ALL'
                     }
              })
              revalidatePath('/god-mode')
              return { success: true, message: 'Notification broadcasted' }
       } catch (error: any) {
              console.error("Notification Error:", error)
              return { success: false, error: error.message }
       }
}

export async function getSystemNotifications() {
       try {
              const notifications = await prisma.systemNotification.findMany({
                     orderBy: { createdAt: 'desc' },
                     take: 5
              })
              return JSON.parse(JSON.stringify(notifications))
       } catch (error) {
              console.error("Error fetching system notifications:", error)
              return []
       }
}

export async function deactivateSystemNotification(id: string) {
       try {
              await prisma.systemNotification.update({
                     where: { id },
                     data: { isActive: false }
              })
              revalidatePath('/god-mode')
              return { success: true, message: 'Notificación desactivada' }
       } catch (error: any) {
              console.error("Deactivate Notification Error:", error)
              return { success: false, error: error.message }
       }
}

export async function getActiveSystemNotification() {
       try {
              // Get the most recent active notification
              // Optionally check for expiration if you use expiresAt
              return await prisma.systemNotification.findFirst({
                     where: { isActive: true },
                     orderBy: { createdAt: 'desc' }
              })
       } catch (error) {
              return null
       }
}

export async function cleanClubData(clubId: string) {
       try {
              // 1. Delete Bookings (Operational)
              // We delete bookings first. Note that transactions might refer to bookings.
              // We will delete CashRegisters which cascade deletes Transactions, so logic holds.
              // But to be safe, delete bookings first, assuming Transactions on Booking will SetNull or we delete them via CashRegister.

              const deleteBookings = prisma.booking.deleteMany({ where: { clubId } })
              const deleteWaiting = prisma.waitingList.deleteMany({ where: { clubId } })

              // 2. Delete Cash Registers (Cascades to Transactions)
              const deleteCash = prisma.cashRegister.deleteMany({ where: { clubId } })

              // 3. Delete Tournaments
              const deleteTournaments = prisma.tournament.deleteMany({ where: { clubId } })

              // 4. Delete Clients (Must be after bookings/transactions are cleared)
              const deleteClients = prisma.client.deleteMany({ where: { clubId } })

              // 5. Delete Audit Logs
              const deleteAudit = prisma.auditLog.deleteMany({ where: { clubId } })

              // Execute in transaction
              await prisma.$transaction([
                     deleteBookings,
                     deleteWaiting,
                     deleteCash,
                     deleteTournaments,
                     // deleteClients, // Careful with clients if they are linked to other things not cleaned. 
                     // Logic: Bookings linked to Client. Transactions linked to Client.
                     // If we deleted Bookings and Cash(Transactions), Client should be free unless linked to something else like TournamentTeam?
                     // TournamentTeam -> player1 Client. Tournament -> deleted. 
                     // Tournament deletion cascades to Categories -> Teams. So Teams deleted. 
                     // So Clients should be safe to delete.
                     deleteClients,
                     deleteAudit
              ])

              revalidatePath('/god-mode')
              return { success: true, message: 'Datos del club eliminados correctamente (Reservas, Caja, Clientes, Torneos)' }
       } catch (error: any) {
              console.error("Clean Club Data Error:", error)
              return { success: false, error: error.message }
       }
}
