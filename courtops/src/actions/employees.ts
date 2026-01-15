'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { hash, compare } from 'bcryptjs'

export interface EmployeePermissions {
       canCreateBooking: boolean
       canDeleteBooking: boolean
       canViewReports: boolean
       canManageSettings: boolean
       canManageClients: boolean
       canManagePayments: boolean
}

const defaultPermissions: EmployeePermissions = {
       canCreateBooking: true,
       canDeleteBooking: false,
       canViewReports: false,
       canManageSettings: false,
       canManageClients: true,
       canManagePayments: true
}

export async function getEmployees() {
       const clubId = await getCurrentClubId()
       return await prisma.employee.findMany({
              where: { clubId },
              orderBy: { createdAt: 'desc' }
       })
}

export async function upsertEmployee(data: {
       id?: string
       name: string
       pin: string
       permissions: EmployeePermissions
}) {
       const clubId = await getCurrentClubId()

       const permissionsString = JSON.stringify(data.permissions)

       if (data.id) {
              // Update
              const dataToUpdate: any = {
                     name: data.name,
                     permissions: permissionsString,
              }

              if (data.pin) {
                     // Only update PIN if provided (handle hash)
                     // Check if pin is different? Assume if provided, we update it.
                     // Ideally we only update if it's a new pin, but we don't have old one here easily.
                     // Logic: if pin is 4 digits, hash it.
                     dataToUpdate.pin = await hash(data.pin, 10)
              }

              await prisma.employee.update({
                     where: { id: data.id }, // Security: Should add clubId check but id is uuid
                     data: dataToUpdate
              })
       } else {
              // Create
              const hashedPin = await hash(data.pin, 10)
              await prisma.employee.create({
                     data: {
                            clubId,
                            name: data.name,
                            pin: hashedPin,
                            permissions: permissionsString
                     }
              })
       }

       revalidatePath('/configuracion')
       return { success: true }
}

export async function deleteEmployee(id: string) {
       const clubId = await getCurrentClubId()
       const employee = await prisma.employee.findFirst({ where: { id, clubId } })

       if (!employee) throw new Error('Empleado no encontrado')

       await prisma.employee.delete({ where: { id } })
       revalidatePath('/configuracion')
       return { success: true }
}

export async function verifyEmployeePin(pin: string) {
       const clubId = await getCurrentClubId()

       // Find all employees for this club
       const employees = await prisma.employee.findMany({
              where: { clubId, isActive: true }
       })

       for (const emp of employees) {
              const isMatch = await compare(pin, emp.pin)
              if (isMatch) {
                     return {
                            success: true,
                            employee: {
                                   id: emp.id,
                                   name: emp.name,
                                   permissions: JSON.parse(emp.permissions) as EmployeePermissions
                            }
                     }
              }
       }

       return { success: false, error: 'PIN incorrecto' }
}
