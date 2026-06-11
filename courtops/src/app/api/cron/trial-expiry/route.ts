import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendTrialReminderEmail, sendTrialExpiredEmail } from '@/lib/email'

// La fuente de verdad del fin del trial es club.nextBillingDate
// (la setea el registro a +14 días). createdAt ya no se usa para esto.

async function alreadyLogged(clubId: string, event: string, withinHours: number) {
  const cutoff = new Date(Date.now() - withinHours * 3600000)
  const entry = await prisma.billingLog.findFirst({
    where: { clubId, event, createdAt: { gte: cutoff } },
    select: { id: true },
  })
  return !!entry
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const now = new Date()

    const trialClubs = await prisma.club.findMany({
      where: {
        subscriptionStatus: 'TRIAL',
        deletedAt: null,
        nextBillingDate: { not: null },
      },
      select: {
        id: true,
        name: true,
        nextBillingDate: true,
        users: {
          where: { role: 'ADMIN' },
          take: 1,
          select: { email: true },
        },
      },
    })

    let expired = 0
    let reminded = 0
    let skipped = 0

    for (const club of trialClubs) {
      const trialEnd = club.nextBillingDate!
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000)
      const adminEmail = club.users[0]?.email

      // ── Trial vencido → EXPIRED + email de despedida elegante ──
      if (daysLeft <= 0) {
        await prisma.$transaction([
          prisma.club.update({
            where: { id: club.id },
            data: { subscriptionStatus: 'EXPIRED' },
          }),
          prisma.billingLog.create({
            data: {
              clubId: club.id,
              event: 'TRIAL_EXPIRED',
              details: JSON.stringify({ trialEnd: trialEnd.toISOString() }),
            },
          }),
        ])
        if (adminEmail) {
          try {
            await sendTrialExpiredEmail(adminEmail, club.name)
          } catch {
            // non-fatal
          }
        }
        expired++
        continue
      }

      // ── Recordatorios D-3 y D-1 (dedupe por billingLog) ──
      let eventName: string | null = null
      if (daysLeft === 3) eventName = 'TRIAL_REMINDER_3D'
      else if (daysLeft === 1) eventName = 'TRIAL_REMINDER_1D'

      if (!eventName || !adminEmail) {
        skipped++
        continue
      }

      if (await alreadyLogged(club.id, eventName, 48)) {
        skipped++
        continue
      }

      try {
        await sendTrialReminderEmail(adminEmail, club.name, daysLeft)
        await prisma.billingLog.create({
          data: {
            clubId: club.id,
            event: eventName,
            details: JSON.stringify({ daysLeft, email: adminEmail }),
          },
        })
        reminded++
      } catch (err) {
        console.error(`[Cron trial-expiry] Email failed for ${club.id}:`, err)
        skipped++
      }
    }

    return NextResponse.json({ success: true, expired, reminded, skipped })
  } catch (error: unknown) {
    console.error('[Cron trial-expiry] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
