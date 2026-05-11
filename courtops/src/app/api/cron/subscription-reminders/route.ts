import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendTextMessage, normalizePhone } from '@/lib/whatsapp'

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

async function alreadySent(clubId: string, event: string, withinHours: number): Promise<boolean> {
  const cutoff = new Date(Date.now() - withinHours * 3600000)
  const entry = await prisma.billingLog.findFirst({
    where: { clubId, event, createdAt: { gte: cutoff } },
    select: { id: true },
  })
  return !!entry
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

    // Clubs with TRANSFER subscriptions expiring within 8 days
    const clubs = await prisma.club.findMany({
      where: {
        subscriptionStatus: 'authorized',
        subscriptionMethod: 'TRANSFER',
        subscriptionEnd: {
          gte: now,
          lte: new Date(Date.now() + 8 * 86400000),
        },
        deletedAt: null,
      },
      include: { platformPlan: true },
    })

    let reminded = 0
    let skipped = 0

    for (const club of clubs) {
      const endDate = club.subscriptionEnd!
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86400000)

      // Determine which reminder window this is
      let eventName: string
      let dedupeHours: number
      if (daysLeft >= 5 && daysLeft <= 8) {
        eventName = 'REMINDER_7D'
        dedupeHours = 120 // 5 days — send at most once per window
      } else if (daysLeft >= 1 && daysLeft <= 3) {
        eventName = 'REMINDER_2D'
        dedupeHours = 36 // 1.5 days — send at most once per window
      } else {
        skipped++
        continue
      }

      if (!club.phone) {
        skipped++
        continue
      }

      // Check if we already sent this specific reminder
      if (await alreadySent(club.id, eventName, dedupeHours)) {
        skipped++
        continue
      }

      // Resolve renewal amount from last approved payment's billing cycle
      const lastPayment = await prisma.subscriptionPayment.findFirst({
        where: { clubId: club.id, status: 'APPROVED' },
        orderBy: { paymentDate: 'desc' },
        select: { billingCycle: true },
      })
      const cycle = (lastPayment?.billingCycle as 'monthly' | 'yearly') || 'monthly'
      const planPrice = club.platformPlan?.price ?? 0
      const renewalAmount = cycle === 'yearly' ? Math.round(planPrice * 12 * 0.8) : planPrice
      const amountStr = formatARS(renewalAmount)
      const cycleLabel = cycle === 'yearly' ? 'anual' : 'mensual'

      const dateStr = endDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
      const daysText = daysLeft === 1 ? 'mañana' : `en ${daysLeft} días`

      const message =
        `⚠️ *CourtOps — Recordatorio de pago*\n\n` +
        `Hola *${club.name}*, tu suscripción *${club.platformPlan?.name ?? ''}* (${cycleLabel}) vence el *${dateStr}* (${daysText}).\n\n` +
        `Para renovar, transferí *${amountStr}* a:\n` +
        `• Alias: \`${alias}\`\n` +
        (cvu ? `• CVU: \`${cvu}\`\n` : '') +
        `\nLuego subí el comprobante en: *Dashboard → Suscripción*.\n` +
        `Tu acceso se reactiva cuando validamos la transferencia (mismo día).\n\n` +
        `Si ya transferiste, ignorá este mensaje. 🎾`

      try {
        await sendTextMessage(normalizePhone(club.phone), message)
        await prisma.$transaction([
          prisma.club.update({
            where: { id: club.id },
            data: { lastReminderSentAt: now },
          }),
          prisma.billingLog.create({
            data: {
              clubId: club.id,
              event: eventName,
              details: JSON.stringify({ daysLeft, phone: club.phone, amount: amountStr, cycle }),
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
