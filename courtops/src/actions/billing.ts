'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export function getBankDetails() {
  return {
    alias: process.env.COURTOPS_BANK_ALIAS || 'courtops.admin',
    cvu: process.env.COURTOPS_BANK_CVU || '',
    accountName: process.env.COURTOPS_BANK_ACCOUNT_NAME || 'CourtOps',
  }
}

export function calcBillingAmount(planPrice: number, cycle: 'monthly' | 'yearly') {
  return cycle === 'yearly' ? Math.round(planPrice * 12 * 0.8) : planPrice
}

function calcPeriodEnd(cycle: 'monthly' | 'yearly', from = new Date()) {
  const end = new Date(from)
  cycle === 'yearly' ? end.setFullYear(end.getFullYear() + 1) : end.setMonth(end.getMonth() + 1)
  return end
}

async function nextInvoiceNumber(clubId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.invoice.count({
    where: { clubId, issuedAt: { gte: new Date(`${year}-01-01`) } },
  })
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function getTransferPaymentDetails(planId: string, cycle: 'monthly' | 'yearly') {
  const clubId = await getCurrentClubId()
  const plan = await prisma.platformPlan.findUnique({ where: { id: planId } })
  if (!plan) throw new Error('Plan no encontrado')

  return {
    bank: getBankDetails(),
    amount: calcBillingAmount(plan.price, cycle),
    planName: plan.name,
    cycle,
    periodEnd: calcPeriodEnd(cycle).toISOString(),
    concept: `CourtOps ${plan.name} ${cycle === 'yearly' ? 'Anual' : 'Mensual'}`,
    clubId,
  }
}

export async function submitBillingTransfer(
  planId: string,
  cycle: 'monthly' | 'yearly',
  reference: string,
  receiptUrl?: string,
) {
  const clubId = await getCurrentClubId()

  const plan = await prisma.platformPlan.findUnique({ where: { id: planId } })
  if (!plan) return { success: false, error: 'Plan no encontrado' }

  const amount = calcBillingAmount(plan.price, cycle)

  await prisma.$transaction([
    prisma.club.update({
      where: { id: clubId },
      data: {
        subscriptionStatus: 'PENDING_VALIDATION',
        subscriptionMethod: 'TRANSFER',
        subscriptionReference: reference.trim(),
        subscriptionReceiptUrl: receiptUrl?.trim() || null,
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
        reference: reference.trim(),
        receiptUrl: receiptUrl?.trim() || null,
        billingCycle: cycle,
      },
    }),
    prisma.billingLog.create({
      data: {
        clubId,
        event: 'TRANSFER_SUBMITTED',
        details: JSON.stringify({ planId, planName: plan.name, cycle, reference, amount }),
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
    const trialEnd = new Date(club.createdAt)
    trialEnd.setDate(trialEnd.getDate() + 7)
    return Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000))
  }

  const endDate = club.subscriptionEnd || club.nextBillingDate
  if (!endDate) return null

  return Math.ceil((endDate.getTime() - now.getTime()) / 86400000)
}

// --- ADMIN: create invoice on payment approval ---
export async function createInvoiceForClub(
  clubId: string,
  planId: string,
  planName: string,
  amount: number,
  cycle: 'monthly' | 'yearly',
  method: string,
  periodStart: Date,
  periodEnd: Date,
) {
  const number = await nextInvoiceNumber(clubId)
  return prisma.invoice.create({
    data: {
      clubId,
      number,
      amount,
      status: 'PAID',
      method,
      planId,
      planName,
      billingCycle: cycle,
      periodStart,
      periodEnd,
    },
  })
}

// --- GOD-MODE: billing stats ---
export async function getBillingStats() {
  const now = new Date()

  const [
    active,
    trial,
    pendingValidation,
    expiring7d,
    expiring14d,
    suspended,
    recentInvoices,
  ] = await Promise.all([
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
