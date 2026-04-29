'use server'

import prisma from '@/lib/db'
import { hash } from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions, isSuperAdmin } from "@/lib/auth"

// ... (existing code at end of file)
async function checkOnlyDellorsif() {
       const session = await getServerSession(authOptions)
       if (!session?.user || !isSuperAdmin(session.user)) {
              return false
       }
       return true
}

export async function generateImpersonationToken(clubId: string) {
       if (!(await checkOnlyDellorsif())) {
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

              const signature = createHmac('sha256', process.env.NEXTAUTH_SECRET!)
                     .update(`${targetEmail}:${timestamp}`)
                     .digest('hex')

              const tokenPayload = JSON.stringify({ targetEmail, timestamp, signature })
              const token = Buffer.from(tokenPayload).toString('base64')

              return { success: true, token }
       } catch (error: unknown) {
              console.error("Token generation error:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function getGodModeStats() {
       if (!(await checkOnlyDellorsif())) return { totalClubs: 0, activeClubs: 0, mrr: 0, bookingsToday: 0, totalBookings: 0, totalUsers: 0 }
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

              // Use Argentina timezone for "today" calculation
              const argNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
              const today = new Date(argNow)
              today.setHours(0, 0, 0, 0)

              const bookingsToday = await prisma.booking.count({
                     where: { createdAt: { gte: today } }
              })

              const totalBookings = await prisma.booking.count()
              const totalUsers = await prisma.user.count()

              return {
                     totalClubs,
                     activeClubs: activeClubsCount,
                     mrr,
                     bookingsToday,
                     totalBookings,
                     totalUsers
              }
       } catch (error) {
              console.error("Error fetching stats:", error)
              return { totalClubs: 0, activeClubs: 0, mrr: 0, bookingsToday: 0, totalBookings: 0, totalUsers: 0 }
       }
}

export async function updatePlatformPlan(formData: FormData) {
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }

       const id = formData.get('id') as string
       const price = Number(formData.get('price'))

       if (!id || isNaN(price) || price <= 0) return { success: false, error: 'Datos inválidos - precio debe ser mayor a 0' }

       try {
              await prisma.platformPlan.update({
                     where: { id },
                     data: { price }
              })
              revalidatePath('/god-mode')
              return { success: true, message: 'Precio actualizado' }
       } catch (error: unknown) {
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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

// Re-export from shared module for backwards compatibility
import { getPlanFeatures } from '@/lib/plan-features'

export async function createNewClub(formData: FormData) {
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
       const clubName = formData.get('clubName') as string
       const adminEmail = formData.get('adminEmail') as string
       const adminPassword = formData.get('adminPassword') as string
       const adminName = formData.get('adminName') as string
       const platformPlanId = formData.get('platformPlanId') as string

       if (!clubName || !adminEmail || !adminPassword || !platformPlanId) {
              return { success: false, error: 'Faltan datos: Nombre, Email, Contraseña y Plan son obligatorios.' }
       }

       try {
              const selectedPlan = await prisma.platformPlan.findUnique({ where: { id: platformPlanId } })

              if (!selectedPlan) {
                     return { success: false, error: 'El plan seleccionado no es válido o no existe.' }
              }

              // 1. Determine Plan and Limits using helper
              const features = getPlanFeatures(selectedPlan.name)

              // 2. Generate Slug
              let slug = clubName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
              const existingSlug = await prisma.club.findUnique({ where: { slug } })
              if (existingSlug) {
                     slug = `${slug}-${Date.now()}`
              }

              // Check for duplicate admin email before creating
              const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
              if (existingUser) return { success: false, error: `El email ${adminEmail} ya está registrado.` }

              if (adminPassword.length < 6) return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }

              const hashedPassword = await hash(adminPassword, 10)

              // 3. Create everything in a transaction to prevent orphans
              const club = await prisma.$transaction(async (tx) => {
                     const newClub = await tx.club.create({
                            data: {
                                   name: clubName,
                                   slug: slug,
                                   plan: 'BASIC',
                                   platformPlanId: selectedPlan?.id,
                                   subscriptionStatus: 'TRIAL',
                                   ...features
                            }
                     })

                     await tx.court.createMany({
                            data: [
                                   { name: 'Cancha 1', clubId: newClub.id },
                                   { name: 'Cancha 2', clubId: newClub.id },
                            ]
                     })

                     await tx.user.create({
                            data: {
                                   email: adminEmail,
                                   name: adminName || 'Admin Club',
                                   password: hashedPassword,
                                   role: 'ADMIN',
                                   clubId: newClub.id
                            }
                     })

                     await tx.priceRule.create({
                            data: {
                                   name: 'Precio General',
                                   price: 10000,
                                   daysOfWeek: '0,1,2,3,4,5,6',
                                   startTime: '00:00',
                                   endTime: '23:59',
                                   priority: 1,
                                   clubId: newClub.id
                            }
                     })

                     return newClub
              })

              revalidatePath('/god-mode')
              return { success: true, message: `Club "${clubName}" creado con éxito!` }

       } catch (error: unknown) {
              console.error("Error creating club:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Error al crear el club' }
       }
}

export async function getAllClubs() {
       if (!(await checkOnlyDellorsif())) {
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
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
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
       } catch (error: unknown) {
              console.error("Error deleting club:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function activateClubSubscription(clubId: string, planName: string = 'Élite', months: number = 1) {
	if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
	try {
		let plan = await prisma.platformPlan.findFirst({
			where: { name: planName }
		})

		if (!plan) {
			plan = await prisma.platformPlan.findFirst({
				where: { name: 'Élite' }
			})
		}

		if (!plan) {
			plan = await prisma.platformPlan.findFirst()
		}

              const validPlanId = plan?.id

              if (!validPlanId || !plan) return { success: false, error: 'No se encontró ningún plan válido en el sistema.' }

              // Update features based on the new plan
              const features = getPlanFeatures(plan.name)

              const nextDate = new Date()
              nextDate.setMonth(nextDate.getMonth() + months)

              await prisma.club.update({
                     where: { id: clubId },
                     data: {
                            subscriptionStatus: 'authorized',
                            platformPlanId: validPlanId,
                            nextBillingDate: nextDate,
                            mpPreapprovalId: `MANUAL_${Date.now()}`,
                            ...features // Apply new plan limits
                     }
              })

              revalidatePath('/god-mode')
              return { success: true, message: `Suscripción activada por ${months} mes(es)` }
       } catch (error: unknown) {
              console.error("Activate Sub Error:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function updateClub(formData: FormData) {
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
       const clubId = formData.get('clubId') as string
       const name = formData.get('name') as string
       const slug = formData.get('slug') as string
       const platformPlanId = formData.get('platformPlanId') as string

       if (!clubId || !name || !slug) return { success: false, error: 'Datos incompletos' }

       let updateData: Record<string, unknown> = { name, slug }

       if (platformPlanId) {
              const plan = await prisma.platformPlan.findUnique({ where: { id: platformPlanId } })
              if (plan) {
                     updateData.platformPlanId = platformPlanId
                     const features = getPlanFeatures(plan.name)
                     updateData = { ...updateData, ...features }
              }
       }

       try {
              await prisma.club.update({
                     where: { id: clubId },
                     data: updateData
              })
              revalidatePath('/god-mode')
              return { success: true, message: 'Club actualizado' }
       } catch (error: unknown) {
              console.error("Error updating club:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function updateClubAdminPassword(formData: FormData) {
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
       const clubId = formData.get('clubId') as string
       const newPassword = formData.get('newPassword') as string

       if (!clubId || !newPassword) return { success: false, error: 'Faltan datos' }
       if (newPassword.length < 6) return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }

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
       } catch (error: unknown) {
              console.error("Error updating admin password:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function searchGodMode(query: string) {
       if (!(await checkOnlyDellorsif())) return { success: false, results: null }
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
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
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
                     const date = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000)
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
                     const date = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
                     date.setHours(10 + Math.floor(Math.random() * 10), 0, 0, 0)

                     bookingsData.push({
                            clubId,
                            courtId: randomCourt.id,
                            clientId: randomClient.id,
                            startTime: date,
                            endTime: new Date(date.getTime() + 90 * 60000),
                            price: 15000,
                            status: 'CONFIRMED',
                            paymentStatus: 'UNPAID',
                     })
              }

              await prisma.booking.createMany({ data: bookingsData })

              revalidatePath('/god-mode')
              return { success: true, message: 'Seeded 10 clients and 30 bookings' }

       } catch (error: unknown) {
              console.error("Seeding Error:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }

}

export async function toggleClubFeature(clubId: string, feature: string, value: boolean) {
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
       try {
              const validFeatures = ['hasKiosco', 'hasOnlinePayments', 'hasAdvancedReports', 'hasTournaments', 'hasCustomDomain', 'hasWhatsApp', 'hasWaivers']
              if (!validFeatures.includes(feature)) return { success: false, error: 'Invalid feature' }

              await prisma.club.update({
                     where: { id: clubId },
                     data: { [feature]: value }
              })

              revalidatePath('/god-mode')
              return { success: true, message: `${feature} updated to ${value}` }
       } catch (error: unknown) {
              console.error("Toggle Feature Error:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function createSystemNotification(formData: FormData) {
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
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
       } catch (error: unknown) {
              console.error("Notification Error:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
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
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
       try {
              await prisma.systemNotification.update({
                     where: { id },
                     data: { isActive: false }
              })
              revalidatePath('/god-mode')
              return { success: true, message: 'Notificación desactivada' }
       } catch (error: unknown) {
              console.error("Deactivate Notification Error:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function getActiveSystemNotification() {
       try {
              return await prisma.systemNotification.findFirst({
                     where: { isActive: true },
                     orderBy: { createdAt: 'desc' }
              })
       } catch (_error) {
              return null
       }
}

export async function cleanClubData(clubId: string) {
       if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }
       try {
              const deleteBookings = prisma.booking.deleteMany({ where: { clubId } })
              const deleteWaiting = prisma.waitingList.deleteMany({ where: { clubId } })
              const deleteCash = prisma.cashRegister.deleteMany({ where: { clubId } })
              const deleteTournaments = prisma.tournament.deleteMany({ where: { clubId } })
              const deleteClients = prisma.client.deleteMany({ where: { clubId } })
              const deleteAudit = prisma.auditLog.deleteMany({ where: { clubId } })

              await prisma.$transaction([
                     deleteBookings,
                     deleteWaiting,
                     deleteCash,
                     deleteTournaments,
                     deleteClients,
                     deleteAudit
              ])

              revalidatePath('/god-mode')
              return { success: true, message: 'Datos del club eliminados correctamente (Reservas, Caja, Clientes, Torneos)' }
       } catch (error: unknown) {
              console.error("Clean Club Data Error:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function seedOfficialPlans() {
	if (!(await checkOnlyDellorsif())) return { success: false, error: 'Unauthorized' }

	try {
		const plans = [
			{
				name: 'Arranque',
				price: 45000,
				setupFee: 100000,
				features: [
					'Hasta 2 canchas de padel',
					'Hasta 3 empleados en el sistema',
					'Reservas online (link público)',
					'Turnero digital en tiempo real',
					'Caja diaria (apertura y cierre)',
					'QR Check-in',
					'Soporte por email L-V'
				],
			},
			{
				name: 'Élite',
				price: 89000,
				setupFee: 100000,
				features: [
					'Hasta 8 canchas de padel',
					'Hasta 10 empleados en el sistema',
					'Todo lo del plan Arranque',
					'Kiosco / Punto de venta con stock',
					'Pagos online con MercadoPago',
					'Notificaciones WhatsApp automáticas',
					'Gestión de torneos y brackets',
					'Waivers digitales (firma electrónica)',
					'Reportes financieros avanzados',
					'Soporte prioritario WhatsApp 24/7'
				],
			},
			{
				name: 'VIP',
				price: 129000,
				setupFee: 100000,
				features: [
					'Canchas ilimitadas',
					'Usuarios ilimitados',
					'Todo lo del plan Élite',
					'Dominio personalizado (ej: tuclub.com)',
					'Gestor de cuenta dedicado'
				],
			}
		]

              for (const p of plans) {
                     const existing = await prisma.platformPlan.findFirst({ where: { name: p.name } })
                     const featuresPayload = JSON.stringify(p.features)

                     if (existing) {
                            await prisma.platformPlan.update({
                                   where: { id: existing.id },
                                   data: { price: p.price, setupFee: p.setupFee, features: featuresPayload }
                            })
                     } else {
                            await prisma.platformPlan.create({
                                   data: {
                                          name: p.name,
                                          price: p.price,
                                          setupFee: p.setupFee,
                                          features: featuresPayload
                                   }
                            })
                     }
              }

              revalidatePath('/god-mode')
              return { success: true, message: 'Planes actualizados a los precios oficiales 2026' }
       } catch (error: unknown) {
              console.error("Seed Plans Error:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

/**
 * Fuerza el cierre de sesión de un usuario incrementando su tokenVersion.
 * Cualquier JWT activo con la versión anterior quedará inválido en el próximo request.
 */
export async function forceLogoutUser(userId: string) {
       if (!(await checkOnlyDellorsif())) {
              return { success: false, error: 'Unauthorized' }
       }

       try {
              await prisma.user.update({
                     where: { id: userId },
                     data: { tokenVersion: { increment: 1 } }
              })
              return { success: true }
       } catch (error: unknown) {
              console.error('forceLogoutUser error:', error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}
