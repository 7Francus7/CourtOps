'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { sendTextMessage, normalizePhone } from '@/lib/whatsapp'

export type CampaignSegment = 'ALL' | 'ACTIVE' | 'RISK' | 'LOST' | 'MEMBERS'

export async function getCampaignRecipients(segment: CampaignSegment) {
       const clubId = await getCurrentClubId()
       const now = new Date()
       const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
       const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

       let where: Record<string, unknown> = { clubId, deletedAt: null, phone: { not: null } }

       if (segment === 'ACTIVE') {
              where = { ...where, bookings: { some: { startTime: { gte: d30 }, status: { not: 'CANCELED' } } } }
       } else if (segment === 'RISK') {
              where = {
                     ...where,
                     bookings: {
                            some: { startTime: { gte: d90, lt: d30 }, status: { not: 'CANCELED' } },
                            none: { startTime: { gte: d30 } }
                     }
              }
       } else if (segment === 'LOST') {
              where = { ...where, bookings: { none: { startTime: { gte: d90 } } } }
       } else if (segment === 'MEMBERS') {
              where = { ...where, memberships: { some: { status: 'ACTIVE', expiresAt: { gte: now } } } }
       }

       const clients = await prisma.client.findMany({
              where,
              select: { id: true, name: true, phone: true },
              take: 200
       })

       return clients.filter(c => c.phone && c.phone.trim())
}

export async function sendWhatsAppCampaign(segment: CampaignSegment, message: string) {
       const clubId = await getCurrentClubId()
       const recipients = await getCampaignRecipients(segment)

       let sent = 0
       let failed = 0
       const failedNames: string[] = []

       for (const client of recipients) {
              if (!client.phone) continue
              const phone = normalizePhone(client.phone)
              const personalizedMsg = message.replace('{{nombre}}', client.name)
              const result = await sendTextMessage(phone, personalizedMsg)
              if (result.success) {
                     sent++
              } else {
                     failed++
                     failedNames.push(client.name)
              }
              // Small delay to avoid rate limits
              await new Promise(r => setTimeout(r, 200))
       }

       return { sent, failed, failedNames, total: recipients.length }
}
