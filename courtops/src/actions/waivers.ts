'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export async function createWaiver(data: { title: string; content: string; isRequired: boolean }) {
  const clubId = await getCurrentClubId()
  const waiver = await prisma.waiver.create({
    data: { clubId, title: data.title, content: data.content, isRequired: data.isRequired },
  })
  revalidatePath('/configuracion')
  return { success: true, waiver }
}

export async function updateWaiver(id: string, data: { title?: string; content?: string; isRequired?: boolean; isActive?: boolean }) {
  const clubId = await getCurrentClubId()
  const waiver = await prisma.waiver.findFirst({ where: { id, clubId } })
  if (!waiver) return { success: false, error: 'No encontrado' }

  await prisma.waiver.update({ where: { id }, data })
  revalidatePath('/configuracion')
  return { success: true }
}

export async function deleteWaiver(id: string) {
  const clubId = await getCurrentClubId()
  const waiver = await prisma.waiver.findFirst({ where: { id, clubId } })
  if (!waiver) return { success: false, error: 'No encontrado' }

  await prisma.waiver.update({ where: { id }, data: { isActive: false } })
  revalidatePath('/configuracion')
  return { success: true }
}

export async function getWaivers() {
  const clubId = await getCurrentClubId()
  return prisma.waiver.findMany({
    where: { clubId, isActive: true },
    include: { _count: { select: { signatures: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function signWaiver(data: {
  waiverId: string
  signature: string
  clientId?: number
  guestName?: string
  guestPhone?: string
}) {
  await prisma.waiverSignature.create({
    data: {
      waiverId: data.waiverId,
      signature: data.signature,
      clientId: data.clientId || null,
      guestName: data.guestName || null,
      guestPhone: data.guestPhone || null,
    },
  })
  return { success: true }
}

export async function checkWaiverStatus(clientId: number) {
  const clubId = await getCurrentClubId()
  const requiredWaivers = await prisma.waiver.findMany({
    where: { clubId, isActive: true, isRequired: true },
    select: { id: true, title: true },
  })

  const signedWaiverIds = await prisma.waiverSignature.findMany({
    where: { clientId, waiverId: { in: requiredWaivers.map((w) => w.id) } },
    select: { waiverId: true },
  })

  const signedSet = new Set(signedWaiverIds.map((s) => s.waiverId))
  const unsigned = requiredWaivers.filter((w) => !signedSet.has(w.id))

  return { allSigned: unsigned.length === 0, unsigned }
}

export async function getWaiverSignatures(waiverId: string) {
  const clubId = await getCurrentClubId()
  const waiver = await prisma.waiver.findFirst({ where: { id: waiverId, clubId } })
  if (!waiver) return []

  return prisma.waiverSignature.findMany({
    where: { waiverId },
    include: { client: { select: { name: true, phone: true } } },
    orderBy: { signedAt: 'desc' },
  })
}

export async function getActiveWaiversForClub(clubId: string) {
  return prisma.waiver.findMany({
    where: { clubId, isActive: true, isRequired: true },
    select: { id: true, title: true, content: true },
  })
}

export async function checkWaiverStatusPublic(clubId: string, phone: string) {
  const requiredWaivers = await prisma.waiver.findMany({
    where: { clubId, isActive: true, isRequired: true },
    select: { id: true },
  })
  if (requiredWaivers.length === 0) return { allSigned: true, unsignedIds: [] }

  const client = await prisma.client.findFirst({
    where: { clubId, phone },
    select: { id: true },
  })
  if (!client) return { allSigned: false, unsignedIds: requiredWaivers.map((w) => w.id) }

  const signed = await prisma.waiverSignature.findMany({
    where: { clientId: client.id, waiverId: { in: requiredWaivers.map((w) => w.id) } },
    select: { waiverId: true },
  })
  const signedSet = new Set(signed.map((s) => s.waiverId))
  const unsignedIds = requiredWaivers.filter((w) => !signedSet.has(w.id)).map((w) => w.id)

  return { allSigned: unsignedIds.length === 0, unsignedIds }
}
