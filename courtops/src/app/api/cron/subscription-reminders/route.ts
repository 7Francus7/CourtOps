import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendTextMessage, normalizePhone } from '@/lib/whatsapp'

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const now = new Date()
    const alias = process.env.COURTOPS_BANK_ALIAS || 'courtops.admin'
    const cvu = process.env.COURTOPS_BANK_CVU || ''

    // Clubs with TRANSFER subscriptions expiring within 8 days that haven't been reminded recently
    const clubs = await prisma.club.findMany({
      where: {
        subscriptionStatus: 'authorized',
        subscriptionMethod: 'TRANSFER',
        subscriptionEnd: {
          gte: now,
          lte: new Date(Date.now() + 8 * 86400000),
        },
        deletedAt: null,
        // Skip if reminded in last 48h
        OR: [
          { lastReminderSentAt: null },
          { lastReminderSentAt: { lt: new Date(Date.now() - 48 * 3600000) } },
        ],
      },
      include: {
        platformPlan: true,
        users: { where: { role: 'ADMIN' }, take: 1 },
      },
    })

    let reminded = 0
    let skipped = 0

    for (const club of clubs) {
      const endDate = club.subscriptionEnd!
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86400000)
      const price = club.platformPlan?.price ?? 0
      const amount = formatARS(price)

      // Find a phone to notify (club phone or admin user's club phone)
      const phone = club.phone
      if (!phone) {
        skipped++
        continue
      }

      const dateStr = endDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
      const daysText = daysLeft === 1 ? 'mañana' : `en ${daysLeft} días`

      const message =
        `⚠️ *CourtOps — Recordatorio de pago*\n\n` +
        `Hola *${club.name}*, tu suscripción *${club.platformPlan?.name ?? ''}* vence el *${dateStr}* (${daysText}).\n\n` +
        `Para renovar, transferí *${amount}* a:\n` +
        `• Alias: \`${alias}\`\n` +
        (cvu ? `• CVU: \`${cvu}\`\n` : '') +
        `\nCuando transfieran, ingresá el comprobante en: *Dashboard → Suscripción*.\n\n` +
        `Ante cualquier duda, respondé este mensaje. 🎾`

      try {
        await sendTextMessage(normalizePhone(phone), message)
        await prisma.$transaction([
          prisma.club.update({
            where: { id: club.id },
            data: { lastReminderSentAt: now },
          }),
          prisma.billingLog.create({
            data: {
              clubId: club.id,
              event: daysLeft <= 2 ? 'REMINDER_2D' : 'REMINDER_7D',
              details: JSON.stringify({ daysLeft, phone, amount }),
            },
          }),
        ])
        reminded++
      } catch (err) {
        console.error(`[subscription-reminders] WhatsApp failed for ${club.id}:`, err)
        skipped++
      }
    }

    return NextResponse.json({ success: true, reminded, skipped })
  } catch (error) {
    console.error('[subscription-reminders] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
