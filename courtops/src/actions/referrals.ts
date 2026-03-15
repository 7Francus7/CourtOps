'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function generateReferralCode(clientId: number) {
  const clubId = await getCurrentClubId()

  // Check if client already has an active referral code
  const existing = await prisma.referral.findFirst({
    where: { clubId, referrerId: clientId, status: 'PENDING' },
    select: { code: true },
  })
  if (existing) return { success: true, code: existing.code }

  // Generate unique code
  let code = generateCode()
  let attempts = 0
  while (attempts < 10) {
    const exists = await prisma.referral.findUnique({ where: { code } })
    if (!exists) break
    code = generateCode()
    attempts++
  }

  const referral = await prisma.referral.create({
    data: { clubId, referrerId: clientId, code },
  })

  return { success: true, code: referral.code }
}

export async function getReferralsByClient(clientId: number) {
  const clubId = await getCurrentClubId()
  return prisma.referral.findMany({
    where: { clubId, referrerId: clientId },
    include: { referred: { select: { name: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getReferralStats() {
  const clubId = await getCurrentClubId()

  const [total, completed, rewarded] = await Promise.all([
    prisma.referral.count({ where: { clubId } }),
    prisma.referral.count({ where: { clubId, status: 'COMPLETED' } }),
    prisma.referral.count({ where: { clubId, status: 'REWARDED' } }),
  ])

  // Top referrers
  const topReferrers = await prisma.referral.groupBy({
    by: ['referrerId'],
    where: { clubId, status: { in: ['COMPLETED', 'REWARDED'] } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  })

  const referrerIds = topReferrers.map((r) => r.referrerId)
  const referrerClients = await prisma.client.findMany({
    where: { id: { in: referrerIds } },
    select: { id: true, name: true, phone: true },
  })

  const topReferrersWithNames = topReferrers.map((r) => ({
    client: referrerClients.find((c) => c.id === r.referrerId),
    count: r._count.id,
  }))

  return { total, completed, rewarded, topReferrers: topReferrersWithNames }
}

export async function completeReferral(code: string, referredClientId: number) {
  const referral = await prisma.referral.findUnique({ where: { code } })
  if (!referral || referral.status !== 'PENDING') return { success: false }

  await prisma.referral.update({
    where: { code },
    data: {
      referredId: referredClientId,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  })

  return { success: true }
}

export async function getClubReferrals() {
  const clubId = await getCurrentClubId()
  return prisma.referral.findMany({
    where: { clubId },
    include: {
      referrer: { select: { name: true, phone: true } },
      referred: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function getReferralByCode(code: string) {
  const referral = await prisma.referral.findUnique({
    where: { code },
    include: { referrer: { select: { name: true } }, club: { select: { name: true } } },
  })
  if (!referral) return null
  return {
    referrerName: referral.referrer.name,
    clubName: referral.club.name,
    code: referral.code,
  }
}
