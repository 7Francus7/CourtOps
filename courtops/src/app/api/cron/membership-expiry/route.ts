import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { addDays } from 'date-fns'

export async function GET(request: Request) {
       try {
              const authHeader = request.headers.get('authorization')
              if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                     return new NextResponse('Unauthorized', { status: 401 })
              }

              const now = new Date()

              // 1. Find all ACTIVE memberships that have expired
              const expiredMemberships = await prisma.membership.findMany({
                     where: {
                            status: 'ACTIVE',
                            endDate: { lt: now }
                     },
                     include: {
                            client: true,
                            plan: { select: { clubId: true, name: true } }
                     }
              })

              // 2. Expire them and update client status
              const results = await Promise.all(expiredMemberships.map(async (membership) => {
                     try {
                            await prisma.$transaction([
                                   prisma.membership.update({
                                          where: { id: membership.id },
                                          data: { status: 'EXPIRED' }
                                   }),
                                   prisma.client.update({
                                          where: { id_clubId: { id: membership.clientId, clubId: membership.plan.clubId } },
                                          data: { membershipStatus: 'EXPIRED' }
                                   })
                            ])
                            return { id: membership.id, clientId: membership.clientId, status: 'expired' }
                     } catch (err) {
                            console.error(`Failed to expire membership ${membership.id}`, err)
                            return { id: membership.id, status: 'error' }
                     }
              }))

              // 3. Find memberships expiring in 7 days — send reminder via WhatsApp
              const reminderDate = addDays(now, 7)
              const expiringMemberships = await prisma.membership.findMany({
                     where: {
                            status: 'ACTIVE',
                            endDate: { gte: now, lte: reminderDate }
                     },
                     include: {
                            client: true,
                            plan: { select: { clubId: true, name: true } }
                     }
              })

              let remindersSent = 0
              if (expiringMemberships.length > 0) {
                     const { MessagingService } = await import('@/lib/messaging')

                     for (const membership of expiringMemberships) {
                            try {
                                   const phone = membership.client?.phone
                                   if (!phone) continue

                                   const daysLeft = Math.ceil((membership.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                   const message = `Hola ${membership.client.name}, tu membresía *${membership.plan.name}* vence en ${daysLeft} días. Renovála para seguir disfrutando los beneficios.`

                                   await MessagingService.sendWhatsApp(phone, message)
                                   remindersSent++
                            } catch (err) {
                                   console.error(`Failed to remind membership ${membership.id}`, err)
                            }
                     }
              }

              return NextResponse.json({
                     success: true,
                     expired: results.filter(r => r.status === 'expired').length,
                     errors: results.filter(r => r.status === 'error').length,
                     remindersSent,
                     total: expiredMemberships.length
              })
       } catch (error: unknown) {
              return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
       }
}
