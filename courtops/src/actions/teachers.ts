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
