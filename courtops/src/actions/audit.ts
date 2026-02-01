'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'

export async function getAuditLogs(page = 1, limit = 50) {
       const clubId = await getCurrentClubId()
       const skip = (page - 1) * limit

       const [logs, count] = await Promise.all([
              prisma.auditLog.findMany({
                     where: { clubId },
                     orderBy: { createdAt: 'desc' },
                     take: limit,
                     skip,
                     include: {
                            user: {
                                   select: { name: true, email: true }
                            }
                     }
              }),
              prisma.auditLog.count({ where: { clubId } })
       ])

       return { logs, totalPages: Math.ceil(count / limit) }
}
