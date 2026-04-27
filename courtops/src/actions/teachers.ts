'use server'

import prisma from '@/lib/db'
import { createSafeAction } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'

export const getTeachers = createSafeAction(async ({ clubId }) => {
       return await prisma.teacher.findMany({
              where: { clubId, isActive: true },
              orderBy: { name: 'asc' }
       })
})

export const createTeacher = createSafeAction(async ({ clubId }, data: { name: string, phone?: string }) => {
       const teacher = await prisma.teacher.create({
              data: {
                     clubId,
                     name: data.name,
                     phone: data.phone
              }
       })
       revalidatePath('/configuracion/academia')
       return teacher
})

export const updateTeacher = createSafeAction(async ({ clubId }, id: string, data: { name: string, phone?: string, isActive?: boolean }) => {
       // Validate that the teacher belongs to the club
       const existing = await prisma.teacher.findUnique({ where: { id } })
       if (!existing || existing.clubId !== clubId) throw new Error("Not Found")
       
       const teacher = await prisma.teacher.update({
              where: { id },
              data
       })
       revalidatePath('/configuracion/academia')
       return teacher
})

export const deleteTeacher = createSafeAction(async ({ clubId }, id: string) => {
       const existing = await prisma.teacher.findUnique({ where: { id } })
       if (!existing || existing.clubId !== clubId) throw new Error("Not Found")

       await prisma.teacher.update({
              where: { id },
              data: { isActive: false }
       })
       revalidatePath('/configuracion/academia')
       return { success: true }
})

export const getAcademiaStats = createSafeAction(async ({ clubId }) => {
       const now = new Date()
       const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

       const [teachers, classesThisMonth, studentsThisMonth, upcomingClasses, teacherActivity] = await Promise.all([
              prisma.teacher.count({ where: { clubId, isActive: true } }),
              prisma.booking.count({
                     where: { clubId, bookingType: 'CLASS', startTime: { gte: startOfMonth, lte: now }, status: { not: 'CANCELED' } }
              }),
              prisma.booking.findMany({
                     where: { clubId, bookingType: 'CLASS', startTime: { gte: startOfMonth }, clientId: { not: null }, status: { not: 'CANCELED' } },
                     select: { clientId: true },
                     distinct: ['clientId']
              }),
              prisma.booking.findMany({
                     where: { clubId, bookingType: 'CLASS', startTime: { gte: now }, status: { not: 'CANCELED' } },
                     include: {
                            teacher: { select: { name: true } },
                            court: { select: { name: true } },
                            client: { select: { name: true } }
                     },
                     orderBy: { startTime: 'asc' },
                     take: 20
              }),
              prisma.booking.groupBy({
                     by: ['teacherId'],
                     where: { clubId, bookingType: 'CLASS', startTime: { gte: d30 }, status: { not: 'CANCELED' }, teacherId: { not: null } },
                     _count: { id: true }
              })
       ])

       const activityMap = new Map(teacherActivity.map(a => [a.teacherId, a._count.id]))
       const teacherList = await prisma.teacher.findMany({
              where: { clubId, isActive: true },
              orderBy: { name: 'asc' }
       })
       const teachersWithStats = teacherList.map(t => ({
              ...t,
              classesLast30: activityMap.get(t.id) || 0
       }))

       return {
              teacherCount: teachers,
              classesThisMonth,
              studentsThisMonth: studentsThisMonth.length,
              upcomingClasses,
              teachers: teachersWithStats
       }
})
