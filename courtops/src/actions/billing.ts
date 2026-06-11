'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions, isSuperAdmin } from '@/lib/auth'
import { getBankDetails, calcBillingAmount, calcPeriodEnd } from '@/lib/billing-utils'

async function assertSuperAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isSuperAdmin(session.user)) {
    throw new Error('Unauthorized')
  }
}

// Atomically allocates the next receipt number within a serializable transaction,
// preventing duplicate numbers under concurrent requests.
// The @@unique([clubId, number]) constraint in schema is the final safety net.
async function nextReceiptNumber(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  clubId: string,
): Promise<string> {
  const year = new Date().getFullYear()
  const latest = await tx.invoice.findFirst({
    where: { clubId, issuedAt: { gte: new Date(`${year}-01-01`) } },
    orderBy: { issuedAt: 'desc' },
    select: { number: true },
  })
  let next = 1
  if (latest?.number) {
    const match = latest.number.match(/(\d+)$/)
    if (match) next = parseInt(match[1], 10) + 1
  }
  return `REC-${year}-${String(next).padStart(4, '0')}`
}

// ─── Club-facing actions ──────────────────────────────────────────────────────

export async function getTransferPaymentDetails(planId: string, cycle: 'monthly' | 'yearly') {
  await getCurrentClubId() // validates session
  const plan = await prisma.platformPlan.findUnique({ where: { id: planId } })
  if (!plan) throw new Error('Plan no encontrado')

  return {
    bank: getBankDetails(),
    amount: calcBillingAmount(plan.price, cycle),
    planName: plan.name,
    cycle,
    periodEnd: calcPeriodEnd(cycle).toISOString(),
    concept: `CourtOps ${plan.name} ${cycle === 'yearly' ? 'Anual' : 'Mensual'}`,
    // clubId intentionally omitted — clients don't need it
  }
}

export async function submitBillingTransfer(
  planId: string,
  cycle: 'monthly' | 'yearly',
  reference: string,
  receiptUrl?: string,
) {
  const clubId = await getCurrentClubId()

  // Prevent duplicate submissions while already waiting for validation
  const clubStatus = await prisma.club.findUnique({
    where: { id: clubId },
    select: { subscriptionStatus: true },
  })
  if (clubStatus?.subscriptionStatus === 'PENDING_VALIDATION') {
    return {
      success: false,
      error: 'Ya tenés un comprobante en revisión. Si necesitás corregirlo, contactá a soporte.',
    }
  }

  const plan = await prisma.platformPlan.findUnique({ where: { id: planId } })
  if (!plan) return { success: false, error: 'Plan no encontrado' }

  const amount = calcBillingAmount(plan.price, cycle)
  const trimmedRef = reference.trim()
  const trimmedReceipt = receiptUrl?.trim() || null

  await prisma.$transaction([
    prisma.club.update({
      where: { id: clubId },
      data: {
        subscriptionStatus: 'PENDING_VALIDATION',
        subscriptionMethod: 'TRANSFER',
        subscriptionReference: trimmedRef,
        subscriptionReceiptUrl: trimmedReceipt,
        pendingPlanId: planId,
        pendingBillingCycle: cycle,
      },
    }),
    prisma.subscriptionPayment.create({
      data: {
        clubId,
        planId,
        amount,
        method: 'TRANSFER',
        status: 'PENDING_VALIDATION',
        reference: trimmedRef,
        receiptUrl: trimmedReceipt,
        billingCycle: cycle,
      },
    }),
    prisma.billingLog.create({
      data: {
        clubId,
        event: 'TRANSFER_SUBMITTED',
        details: JSON.stringify({ planId, planName: plan.name, cycle, reference: trimmedRef, amount }),
      },
    }),
  ])

  revalidatePath('/dashboard/suscripcion')
  return { success: true }
}

export async function getBillingHistory() {
  const clubId = await getCurrentClubId()

  const [invoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: { clubId },
      orderBy: { issuedAt: 'desc' },
      take: 12,
    }),
    prisma.subscriptionPayment.findMany({
      where: { clubId },
      orderBy: { paymentDate: 'desc' },
      take: 12,
    }),
  ])

  return JSON.parse(JSON.stringify({ invoices, payments }))
}

export async function getSubscriptionDaysRemaining(): Promise<number | null> {
  const clubId = await getCurrentClubId()
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      subscriptionStatus: true,
      subscriptionEnd: true,
      nextBillingDate: true,
      createdAt: true,
    },
  })
  if (!club) return null

  const now = new Date()

  if (club.subscriptionStatus === 'TRIAL') {
    // nextBillingDate es la fecha de fin del trial (registro la setea a +14 días)
    const trialEnd = club.nextBillingDate ?? (() => {
      const d = new Date(club.createdAt)
      d.setDate(d.getDate() + 14)
      return d
    })()
    return Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000))
  }

  const endDate = club.subscriptionEnd || club.nextBillingDate
  if (!endDate) return null
  return Math.ceil((endDate.getTime() - now.getTime()) / 86400000)
}

// ─── Internal helper — called only from validateSaaSTransfer (god-mode) ──────

export async function createReceiptForClub(
  clubId: string,
  planId: string,
  planName: string,
  amount: number,
  cycle: 'monthly' | 'yearly',
  method: string,
  periodStart: Date,
  periodEnd: Date,
) {
  await assertSuperAdmin()
  return prisma.$transaction(async (tx) => {
    const number = await nextReceiptNumber(tx, clubId)
    return tx.invoice.create({
      data: { clubId, number, amount, status: 'PAID', method, planId, planName, billingCycle: cycle, periodStart, periodEnd },
    })
  }, { isolationLevel: 'Serializable' })
}

// ─── God-mode stats — requires super-admin session ───────────────────────────

export async function getBillingStats() {
  await assertSuperAdmin()

  const now = new Date()

  const [active, trial, pendingValidation, expiring7d, expiring14d, suspended, recentInvoices] =
    await Promise.all([
      prisma.club.count({ where: { subscriptionStatus: 'authorized', deletedAt: null } }),
      prisma.club.count({ where: { subscriptionStatus: 'TRIAL', deletedAt: null } }),
      prisma.club.count({ where: { subscriptionStatus: 'PENDING_VALIDATION', deletedAt: null } }),
      prisma.club.count({
        where: {
          subscriptionStatus: 'authorized',
          subscriptionEnd: { gte: now, lte: new Date(Date.now() + 7 * 86400000) },
          deletedAt: null,
        },
      }),
      prisma.club.count({
        where: {
          subscriptionStatus: 'authorized',
          subscriptionEnd: { gte: now, lte: new Date(Date.now() + 14 * 86400000) },
          deletedAt: null,
        },
      }),
      prisma.club.count({ where: { subscriptionStatus: 'SUSPENDED', deletedAt: null } }),
      prisma.invoice.findMany({
        orderBy: { issuedAt: 'desc' },
        take: 20,
        include: { club: { select: { name: true } } },
      }),
    ])

  const mrrClubs = await prisma.club.findMany({
    where: { subscriptionStatus: 'authorized', deletedAt: null },
    include: { platformPlan: true },
  })
  const mrr = mrrClubs.reduce((acc, c) => acc + (c.platformPlan?.price ?? 0), 0)

  const revenueByMethod = await prisma.invoice.groupBy({
    by: ['method'],
    _sum: { amount: true },
    where: { issuedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
  })

  return JSON.parse(
    JSON.stringify({ active, trial, pendingValidation, expiring7d, expiring14d, suspended, mrr, revenueByMethod, recentInvoices }),
  )
}
