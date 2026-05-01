'use server'

import prisma from '@/lib/db'
import { createSafeAction } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/logger'

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

// --- CLASS SCHEDULES ---

type ClassScheduleData = {
  name: string
  teacherId: string
  courtId?: number
  description?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  maxStudents: number
  price: number
}

export const getClassSchedules = createSafeAction(async ({ clubId }) => {
  return await prisma.classSchedule.findMany({
    where: { clubId, isActive: true, deletedAt: null },
    include: {
      teacher: { select: { id: true, name: true } },
      court: { select: { id: true, name: true } },
      enrollments: {
        where: { status: 'ACTIVE' },
        select: { id: true }
      }
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  })
})

export const createClassSchedule = createSafeAction(async ({ clubId }, data: ClassScheduleData) => {
  const schedule = await prisma.classSchedule.create({
    data: { clubId, ...data }
  })
  await logAction({ clubId, action: 'CREATE', entity: 'SETTINGS', details: { type: 'CLASS_SCHEDULE', name: data.name } })
  revalidatePath('/configuracion/academia')
  return schedule
})

export const updateClassSchedule = createSafeAction(async ({ clubId }, id: string, data: Partial<ClassScheduleData> & { isActive?: boolean }) => {
  const existing = await prisma.classSchedule.findFirst({ where: { id, clubId, deletedAt: null } })
  if (!existing) throw new Error('Horario no encontrado')
  const schedule = await prisma.classSchedule.update({ where: { id }, data })
  revalidatePath('/configuracion/academia')
  return schedule
})

export const deleteClassSchedule = createSafeAction(async ({ clubId }, id: string) => {
  const existing = await prisma.classSchedule.findFirst({ where: { id, clubId } })
  if (!existing) throw new Error('Horario no encontrado')
  await prisma.classSchedule.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } })
  revalidatePath('/configuracion/academia')
  return { success: true }
})

// --- CLASS ENROLLMENTS ---

export const getClassEnrollments = createSafeAction(async ({ clubId }, scheduleId: string) => {
  const schedule = await prisma.classSchedule.findFirst({ where: { id: scheduleId, clubId } })
  if (!schedule) throw new Error('Horario no encontrado')
  return await prisma.classEnrollment.findMany({
    where: { classScheduleId: scheduleId, status: 'ACTIVE' },
    include: { client: { select: { id: true, name: true, phone: true } } },
    orderBy: { enrolledAt: 'asc' }
  })
})

export const enrollClient = createSafeAction(async ({ clubId }, scheduleId: string, clientId: number) => {
  const [schedule, client] = await Promise.all([
    prisma.classSchedule.findFirst({ where: { id: scheduleId, clubId }, include: { enrollments: { where: { status: 'ACTIVE' } } } }),
    prisma.client.findFirst({ where: { id: clientId, clubId } })
  ])
  if (!schedule) throw new Error('Horario no encontrado')
  if (!client) throw new Error('Cliente no encontrado')
  if (schedule.enrollments.length >= schedule.maxStudents) throw new Error('Clase llena')

  const existing = await prisma.classEnrollment.findUnique({
    where: { classScheduleId_clientId: { classScheduleId: scheduleId, clientId } }
  })
  if (existing) {
    if (existing.status === 'ACTIVE') throw new Error('El alumno ya está inscripto')
    await prisma.classEnrollment.update({ where: { id: existing.id }, data: { status: 'ACTIVE', enrolledAt: new Date() } })
  } else {
    await prisma.classEnrollment.create({ data: { classScheduleId: scheduleId, clientId, clubId, status: 'ACTIVE' } })
  }
  revalidatePath('/configuracion/academia')
  return { success: true }
})

export const unenrollClient = createSafeAction(async ({ clubId }, enrollmentId: string) => {
  const enrollment = await prisma.classEnrollment.findFirst({ where: { id: enrollmentId, clubId } })
  if (!enrollment) throw new Error('Inscripción no encontrada')
  await prisma.classEnrollment.update({ where: { id: enrollmentId }, data: { status: 'CANCELLED' } })
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
