'use server'

import prisma from '@/lib/db'
import { createSafeAction } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'
import { encrypt, decrypt } from '@/lib/encryption'
import { hash } from 'bcryptjs'

export const getSettings = createSafeAction(async ({ clubId }) => {
       const club = await prisma.club.findUnique({
              where: { id: clubId },
              include: {
                     courts: {
                            orderBy: { sortOrder: 'asc' }
                     },
                     priceRules: {
                            orderBy: { priority: 'desc' }
                     },
                     users: {
                            select: { id: true, name: true, email: true, role: true }
                     },
                     products: {
                            orderBy: { category: 'asc' }
                     },
                     membershipPlans: {
                            where: { isActive: true },
                            orderBy: { price: 'asc' }
                     }
              }
       })

       if (!club) throw new Error('Club not found')

       // Decrypt sensitive token if it exists
       if (club.mpAccessToken) {
              try {
                     club.mpAccessToken = decrypt(club.mpAccessToken)
              } catch (e) {
                     console.error("Failed to decrypt mpAccessToken", e)
                     // Keep original if decryption fails
              }
       }

       return club
})

export const updateClubSettings = createSafeAction(async ({ clubId }, data: {
       name?: string
       logoUrl?: string
       phone?: string
       openTime?: string
       closeTime?: string
       slotDuration?: number
       cancelHours?: number
       mpAccessToken?: string
       mpPublicKey?: string
       bookingDeposit?: number
       mpAlias?: string
       mpCvu?: string
       themeColor?: string
       allowCredit?: boolean
       address?: string
}) => {
       // Encrypt sensitive token if provided
       if (data.mpAccessToken && data.mpAccessToken.trim() !== '') {
              if (!data.mpAccessToken.includes(':')) {
                     data.mpAccessToken = encrypt(data.mpAccessToken)
              }
       }

       const updated = await prisma.club.update({
              where: { id: clubId },
              data
       })

       revalidatePath('/configuracion')
       revalidatePath('/')
       return updated
})

export const upsertCourt = createSafeAction(async ({ clubId }, data: { id?: number; name: string; surface?: string; isIndoor?: boolean; sport?: string; duration?: number }) => {
       if (data.id) {
              return await prisma.court.update({
                     where: { id_clubId: { id: data.id, clubId } },
                     data: {
                            name: data.name,
                            surface: data.surface,
                            isIndoor: data.isIndoor,
                            sport: data.sport,
                            duration: data.duration
                     }
              })
       } else {
              // 1. Check Limits
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { maxCourts: true, _count: { select: { courts: true } } }
              })

              if (club && club._count.courts >= club.maxCourts) {
                     throw new Error(`Has alcanzado el límite de ${club.maxCourts} canchas.`)
              }

              return await prisma.court.create({
                     data: {
                            clubId,
                            name: data.name,
                            surface: data.surface,
                            isIndoor: data.isIndoor || false,
                            sport: data.sport || 'PADEL',
                            duration: data.duration || 90
                     }
              })
       }
})

export const deleteCourt = createSafeAction(async ({ clubId }, id: number) => {
       const court = await prisma.court.findFirst({ where: { id, clubId } })
       if (!court) throw new Error('Cancha no encontrada')

       await prisma.court.delete({ where: { id_clubId: { id, clubId } } })
       revalidatePath('/configuracion')
       return { success: true }
})

export const upsertPriceRule = createSafeAction(async ({ clubId }, data: {
       id?: number
       name?: string
       courtId?: number | null
       daysOfWeek?: string
       startTime: string
       endTime: string
       price: number
       memberPrice?: number | null
       priority: number
       startDate?: Date | null
       endDate?: Date | null
}) => {
       if (data.id) {
              return await prisma.priceRule.update({
                     where: { id_clubId: { id: data.id, clubId } },
                     data: {
                            name: data.name,
                            courtId: data.courtId,
                            daysOfWeek: data.daysOfWeek,
                            startTime: data.startTime,
                            endTime: data.endTime,
                            price: data.price,
                            memberPrice: data.memberPrice,
                            priority: data.priority,
                            startDate: data.startDate,
                            endDate: data.endDate
                     }
              })
       } else {
              return await prisma.priceRule.create({
                     data: {
                            clubId,
                            courtId: data.courtId,
                            name: data.name,
                            daysOfWeek: data.daysOfWeek,
                            startTime: data.startTime,
                            endTime: data.endTime,
                            price: data.price,
                            memberPrice: data.memberPrice,
                            priority: data.priority,
                            startDate: data.startDate,
                            endDate: data.endDate
                     }
              })
       }
})

export const deletePriceRule = createSafeAction(async ({ clubId }, id: number) => {
       await prisma.priceRule.delete({ where: { id_clubId: { id, clubId } } })
       revalidatePath('/configuracion')
       return { success: true }
})

export const upsertProduct = createSafeAction(async ({ clubId }, data: {
       id?: number;
       name: string;
       category: string;
       cost: number;
       price: number;
       memberPrice?: number | null;
       stock: number;
       minStock?: number;
       imageUrl?: string | null;
}) => {
       if (data.id) {
              return await prisma.product.update({
                     where: { id_clubId: { id: data.id, clubId } },
                     data: {
                            name: data.name,
                            category: data.category,
                            cost: data.cost,
                            price: data.price,
                            memberPrice: data.memberPrice,
                            stock: data.stock,
                            minStock: data.minStock,
                            imageUrl: data.imageUrl
                     }
              })
       } else {
              return await prisma.product.create({
                     data: {
                            clubId,
                            name: data.name,
                            category: data.category,
                            cost: data.cost,
                            price: data.price,
                            memberPrice: data.memberPrice,
                            stock: data.stock,
                            minStock: data.minStock || 5,
                            imageUrl: data.imageUrl
                     }
              })
       }
})

export const deleteProduct = createSafeAction(async ({ clubId }, id: number) => {
       await prisma.product.delete({ where: { id_clubId: { id, clubId } } })
       revalidatePath('/configuracion')
       return { success: true }
})

export const updateMyPassword = createSafeAction(async ({ userId }, newPassword: string) => {
       if (!newPassword || newPassword.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres')

       const hashedPassword = await hash(newPassword, 10)

       await prisma.user.update({
              where: { id: userId },
              data: { password: hashedPassword }
       })

       return { success: true, message: 'Contraseña actualizada' }
})

export const getAuditLogs = createSafeAction(async ({ clubId }, limit: number = 50) => {
       return await prisma.auditLog.findMany({
              where: { clubId },
              orderBy: { createdAt: 'desc' },
              take: limit,
              include: {
                     user: { select: { name: true, email: true } }
              }
       })
})
