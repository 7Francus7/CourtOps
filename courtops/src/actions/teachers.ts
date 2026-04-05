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

export const createTeacher = createSafeAction(async ({ clubId }, data: { name: string, email?: string, phone?: string, specialization?: string }) => {
       const teacher = await prisma.teacher.create({
              data: {
                     clubId,
                     name: data.name,
                     email: data.email,
                     phone: data.phone,
                     specialization: data.specialization
              }
       })
       revalidatePath('/configuracion/academia')
       return teacher
})

export const updateTeacher = createSafeAction(async ({ clubId }, id: number, data: { name: string, email?: string, phone?: string, specialization?: string, isActive?: boolean }) => {
       const teacher = await prisma.teacher.update({
              where: { id_clubId: { id, clubId } },
              data
       })
       revalidatePath('/configuracion/academia')
       return teacher
})

export const deleteTeacher = createSafeAction(async ({ clubId }, id: number) => {
       await prisma.teacher.update({
              where: { id_clubId: { id, clubId } },
              data: { isActive: false }
       })
       revalidatePath('/configuracion/academia')
       return { success: true }
})
