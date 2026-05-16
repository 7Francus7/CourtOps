import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendTextMessage, normalizePhone } from '@/lib/whatsapp'
import { runCronWithMonitoring } from '@/lib/cron-monitor'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { result, meta } = await runCronWithMonitoring('subscription-suspend', async () => {
    const now = new Date()

    // Find TRANSFER clubs past their end date, not yet suspended, and NOT waiting for admin validation.
    // We explicitly exclude PENDING_VALIDATION so clubs that submitted a receipt before expiry
    // are never auto-suspended while the admin is reviewing.
    const clubs = await prisma.club.findMany({
      where: {
        subscriptionStatus: 'authorized',
        subscriptionMethod: 'TRANSFER',
        subscriptionEnd: { lt: now },
        suspendedAt: null,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        subscriptionEnd: true,
        gracePeriodDays: true,
        platformPlan: { select: { name: true } },
      },
    })

    let suspended = 0
    let skipped = 0

    for (const club of clubs) {
      const endDate = club.subscriptionEnd!
      const graceCutoff = new Date(endDate.getTime() + club.gracePeriodDays * 86400000)

      if (now < graceCutoff) {
        skipped++
        continue
      }

      // Suspend atomically
      await prisma.$transaction([
        prisma.club.update({
          where: { id: club.id },
          data: { subscriptionStatus: 'SUSPENDED', suspendedAt: now },
        }),
        prisma.billingLog.create({
          data: {
            clubId: club.id,
            event: 'SUSPENDED',
            details: JSON.stringify({
              reason: 'auto_suspend',
              subscriptionEnd: endDate.toISOString(),
              gracePeriodDays: club.gracePeriodDays,
            }),
          },
        }),
      ])

      // WhatsApp — non-fatal
      if (club.phone) {
        const alias = process.env.COURTOPS_BANK_ALIAS || 'courtops.admin'
        const message =
          `🔴 *CourtOps — Acceso suspendido*\n\n` +
          `Hola *${club.name}*, tu suscripción venció hace más de ${club.gracePeriodDays} días y el período de gracia terminó.\n\n` +
          `Para reactivar, realizá la transferencia y subí el comprobante en:\n` +
          `*Dashboard → Suscripción → Transferencia bancaria*\n\n` +
          `Alias de pago: \`${alias}\`\n\n` +
          `Una vez que validemos el pago, tu acceso queda activo el mismo día. 🎾`
        try {
          await sendTextMessage(normalizePhone(club.phone), message)
        } catch {
          // non-fatal
        }
      }

      suspended++
    }

    return { suspended, skipped }
  })

  if (!meta.success) {
    return NextResponse.json({ success: false, error: meta.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, ...result })
}
