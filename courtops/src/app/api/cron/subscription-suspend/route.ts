import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendTextMessage, normalizePhone } from '@/lib/whatsapp'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const now = new Date()

    // Find TRANSFER clubs that are past their end date + grace period and not yet suspended
    const clubs = await prisma.club.findMany({
      where: {
        subscriptionStatus: 'authorized',
        subscriptionMethod: 'TRANSFER',
        subscriptionEnd: { lt: now },
        suspendedAt: null,
        deletedAt: null,
      },
      include: {
        platformPlan: true,
      },
    })

    let suspended = 0
    let skipped = 0

    for (const club of clubs) {
      const endDate = club.subscriptionEnd!
      const gracePeriodDays = (club as any).gracePeriodDays ?? 3
      const graceCutoff = new Date(endDate.getTime() + gracePeriodDays * 86400000)

      if (now < graceCutoff) {
        skipped++
        continue
      }

      // Suspend
      await prisma.$transaction([
        prisma.club.update({
          where: { id: club.id },
          data: {
            subscriptionStatus: 'SUSPENDED',
            suspendedAt: now,
          },
        }),
        prisma.billingLog.create({
          data: {
            clubId: club.id,
            event: 'SUSPENDED',
            details: JSON.stringify({
              reason: 'auto_suspend',
              subscriptionEnd: endDate.toISOString(),
              gracePeriodDays,
            }),
          },
        }),
      ])

      // WhatsApp notification
      if (club.phone) {
        const alias = process.env.COURTOPS_BANK_ALIAS || 'courtops.admin'
        const message =
          `🔴 *CourtOps — Acceso suspendido*\n\n` +
          `Hola *${club.name}*, tu suscripción venció y el período de gracia terminó.\n\n` +
          `Para reactivar, realizá la transferencia y subí el comprobante desde:\n` +
          `*Dashboard → Suscripción → Transferencia bancaria*\n\n` +
          `Alias de pago: \`${alias}\`\n\n` +
          `Reactivamos tu cuenta en el día. 🎾`
        try {
          await sendTextMessage(normalizePhone(club.phone), message)
        } catch {
          // non-fatal
        }
      }

      suspended++
    }

    return NextResponse.json({ success: true, suspended, skipped })
  } catch (error) {
    console.error('[subscription-suspend] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
