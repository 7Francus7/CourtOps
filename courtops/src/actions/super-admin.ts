'use server'

import prisma from '@/lib/db'
import { hash } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

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
       return await prisma.platformPlan.findMany({ orderBy: { price: 'asc' } })
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
       try {
              return await prisma.club.findMany({
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
