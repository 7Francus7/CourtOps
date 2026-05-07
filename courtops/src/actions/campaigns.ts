'use server'

import { createHash } from 'crypto'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { nowInArg } from '@/lib/date-utils'
import prisma from '@/lib/db'
import { logAction } from '@/lib/logger'
import {
  buildCampaignTemplateParameters,
  CAMPAIGN_DELIVERY_TYPES,
  CAMPAIGN_SEGMENTS,
  CAMPAIGN_VARIABLES,
  findUnsupportedTemplateVariables,
  TEMPLATE_CAMPAIGN_VARIABLE_KEYS,
  type CampaignDeliveryType,
  type CampaignSegment,
  type CampaignVariableKey,
  matchesCampaignSegment,
  normalizeCampaignTemplate,
  renderCampaignTemplate,
  summarizeCampaignHistory,
} from '@/lib/whatsapp-campaigns'
import { getWhatsAppConfigState, normalizePhone, sendTemplateMessage, sendTextMessage } from '@/lib/whatsapp'

type CampaignAudienceMember = {
  id: number
  name: string
  firstName: string
  phone: string
  normalizedPhone: string
  createdAt: string
  daysSinceCreated: number
  lastBookingAt: string | null
  daysSinceLastBooking: number | null
  bookingsLast60: number
  debtCount: number
  membershipStatus: string | null
  membershipExpiresAt: string | null
  daysToMembershipExpiry: number | null
  membershipExpiryLabel: string | null
}

type CampaignHistoryItem = {
  id: string
  segment: string
  deliveryType: string
  templateName: string | null
  status: string
  reachableCount: number
  sentCount: number
  failedCount: number
  simulatedCount: number
  createdAt: string
  previewMessage: string
}

type CampaignContext = {
  userId: string
  clubId: string
  clubName: string
  clubSlug: string
  hasWhatsApp: boolean
}

const DUPLICATE_WINDOW_MINUTES = 15
const CAMPAIGN_SEND_LIMIT = 250
const ADMIN_ROLES = new Set(['OWNER', 'ADMIN', 'SUPER_ADMIN', 'GOD'])
const ARG_DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  day: '2-digit',
  month: '2-digit',
})

function buildReservationLink(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${baseUrl.replace(/\/$/, '')}/p/${slug}`
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name.trim()
}

function getElapsedDays(from: Date, to: Date) {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)))
}

function getRemainingDays(from: Date, to: Date) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)))
}

function buildCampaignVariables(
  member: CampaignAudienceMember | undefined,
  clubName: string,
  reservationLink: string,
): Record<CampaignVariableKey, string> {
  return {
    nombre: member?.name || 'Jugador',
    primer_nombre: member?.firstName || 'Jugador',
    club: clubName,
    link_reserva: reservationLink,
    dias_sin_jugar: member?.daysSinceLastBooking?.toString() || '',
    deuda_reservas: member?.debtCount.toString() || '0',
    fecha_vencimiento: member?.membershipExpiryLabel || '',
    dias_para_vencer: member?.daysToMembershipExpiry?.toString() || '',
    dias_desde_alta: member?.daysSinceCreated.toString() || '0',
    reservas_60d: member?.bookingsLast60.toString() || '0',
  }
}

async function requireCampaignContext(): Promise<CampaignContext> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || !session.user.clubId) {
    throw new Error('No autorizado')
  }

  if (!ADMIN_ROLES.has(session.user.role || '')) {
    throw new Error('No tienes permisos para enviar campañas')
  }

  const club = await prisma.club.findUnique({
    where: { id: session.user.clubId },
    select: {
      id: true,
      name: true,
      slug: true,
      hasWhatsApp: true,
    },
  })

  if (!club) {
    throw new Error('Club no encontrado')
  }

  return {
    userId: session.user.id,
    clubId: club.id,
    clubName: club.name,
    clubSlug: club.slug,
    hasWhatsApp: club.hasWhatsApp,
  }
}

async function buildCampaignAudience(clubId: string): Promise<CampaignAudienceMember[]> {
  const now = nowInArg()
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const [clients, bookingStats, recentBookingCounts, debtCounts] = await Promise.all([
    prisma.client.findMany({
      where: {
        clubId,
        deletedAt: null,
        phone: { not: '' },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        membershipStatus: true,
        membershipExpiresAt: true,
      },
      orderBy: { name: 'asc' },
      take: 1000,
    }),
    prisma.booking.groupBy({
      by: ['clientId'],
      where: {
        clubId,
        clientId: { not: null },
        deletedAt: null,
        status: { notIn: ['CANCELED', 'CANCELLED'] },
      },
      _max: { startTime: true },
    }),
    prisma.booking.groupBy({
      by: ['clientId'],
      where: {
        clubId,
        clientId: { not: null },
        deletedAt: null,
        status: { notIn: ['CANCELED', 'CANCELLED'] },
        startTime: { gte: sixtyDaysAgo },
      },
      _count: { id: true },
    }),
    prisma.booking.groupBy({
      by: ['clientId'],
      where: {
        clubId,
        clientId: { not: null },
        deletedAt: null,
        paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
        status: { notIn: ['CANCELED', 'CANCELLED'] },
        startTime: { lt: now },
      },
      _count: { id: true },
    }),
  ])

  const lastBookingMap = new Map<number, Date | null>()
  const recentBookingCountMap = new Map<number, number>()
  const debtCountMap = new Map<number, number>()

  bookingStats.forEach((item) => {
    if (item.clientId) {
      lastBookingMap.set(item.clientId, item._max.startTime || null)
    }
  })

  recentBookingCounts.forEach((item) => {
    if (item.clientId) {
      recentBookingCountMap.set(item.clientId, item._count.id)
    }
  })

  debtCounts.forEach((item) => {
    if (item.clientId) {
      debtCountMap.set(item.clientId, item._count.id)
    }
  })

  return clients
    .map((client) => {
      const createdAt = client.createdAt
      const lastBookingAt = lastBookingMap.get(client.id) || null
      const membershipExpiresAt = client.membershipExpiresAt || null

      return {
        id: client.id,
        name: client.name,
        firstName: getFirstName(client.name),
        phone: client.phone.trim(),
        normalizedPhone: normalizePhone(client.phone.trim()),
        createdAt: createdAt.toISOString(),
        daysSinceCreated: getElapsedDays(createdAt, now),
        lastBookingAt: lastBookingAt?.toISOString() || null,
        daysSinceLastBooking: lastBookingAt ? getElapsedDays(lastBookingAt, now) : null,
        bookingsLast60: recentBookingCountMap.get(client.id) || 0,
        debtCount: debtCountMap.get(client.id) || 0,
        membershipExpiresAt: membershipExpiresAt?.toISOString() || null,
        membershipStatus: client.membershipStatus,
        daysToMembershipExpiry: membershipExpiresAt ? getRemainingDays(now, membershipExpiresAt) : null,
        membershipExpiryLabel: membershipExpiresAt ? ARG_DATE_FORMATTER.format(membershipExpiresAt) : null,
      }
    })
    .filter((client) => client.phone.length >= 8)
}

function filterAudienceBySegment(audience: CampaignAudienceMember[], segment: CampaignSegment) {
  const now = nowInArg()

  return audience.filter((member) => matchesCampaignSegment({
    createdAt: new Date(member.createdAt),
    lastBookingAt: member.lastBookingAt ? new Date(member.lastBookingAt) : null,
    bookingsLast60: member.bookingsLast60,
    debtCount: member.debtCount,
    membershipStatus: member.membershipStatus,
    membershipExpiresAt: member.membershipExpiresAt ? new Date(member.membershipExpiresAt) : null,
  }, segment, now))
}

async function getCampaignHistory(clubId: string): Promise<CampaignHistoryItem[]> {
  const campaigns = await prisma.whatsAppCampaign.findMany({
    where: { clubId },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      segment: true,
      deliveryType: true,
      templateName: true,
      status: true,
      reachableCount: true,
      sentCount: true,
      failedCount: true,
      simulatedCount: true,
      createdAt: true,
      previewMessage: true,
    },
  })

  return campaigns.map((campaign) => ({
    ...campaign,
    createdAt: campaign.createdAt.toISOString(),
  }))
}

function buildDedupeKey(params: {
  clubId: string
  segment: CampaignSegment
  deliveryType: CampaignDeliveryType
  template: string
  templateName?: string | null
  phones: string[]
}) {
  return createHash('sha256')
    .update(JSON.stringify({
      clubId: params.clubId,
      segment: params.segment,
      deliveryType: params.deliveryType,
      template: normalizeCampaignTemplate(params.template),
      templateName: params.templateName || null,
      phones: [...params.phones].sort(),
    }))
    .digest('hex')
}

export async function getWhatsAppCampaignComposerData(segment: CampaignSegment) {
  const context = await requireCampaignContext()
  const audience = await buildCampaignAudience(context.clubId)
  const filteredAudience = filterAudienceBySegment(audience, segment).slice(0, CAMPAIGN_SEND_LIMIT)
  const history = await getCampaignHistory(context.clubId)
  const segmentMeta = CAMPAIGN_SEGMENTS.find((item) => item.key === segment)
  const reservationLink = buildReservationLink(context.clubSlug)
  const configState = getWhatsAppConfigState()
  const segmentReachCounts = Object.fromEntries(
    CAMPAIGN_SEGMENTS.map((item) => [
      item.key,
      filterAudienceBySegment(audience, item.key).slice(0, CAMPAIGN_SEND_LIMIT).length,
    ]),
  ) as Record<CampaignSegment, number>

  return {
    club: {
      name: context.clubName,
      reservationLink,
      hasWhatsAppFeature: context.hasWhatsApp,
      isConfigured: configState.configured,
      isSimulationMode: context.hasWhatsApp && !configState.configured,
    },
    segment: {
      key: segment,
      label: segmentMeta?.label || segment,
      description: segmentMeta?.description || '',
    },
    availableSegments: CAMPAIGN_SEGMENTS,
    deliveryOptions: CAMPAIGN_DELIVERY_TYPES,
    variables: CAMPAIGN_VARIABLES,
    segmentReachCounts,
    reachableCount: filteredAudience.length,
    recipientsPreview: filteredAudience.slice(0, 6),
    history,
    historySummary: summarizeCampaignHistory(history),
  }
}

export async function getCampaignRecipients(segment: CampaignSegment) {
  const data = await getWhatsAppCampaignComposerData(segment)
  return data.recipientsPreview
}

export async function sendWhatsAppCampaign(input: {
  segment: CampaignSegment
  message: string
  deliveryType: CampaignDeliveryType
  templateName?: string
}) {
  const context = await requireCampaignContext()

  if (!context.hasWhatsApp) {
    throw new Error('Tu plan no incluye campañas por WhatsApp')
  }

  const normalizedTemplate = normalizeCampaignTemplate(input.message)
  if (!normalizedTemplate) {
    throw new Error('El mensaje no puede estar vacio')
  }

  if (input.deliveryType === 'TEMPLATE' && !input.templateName?.trim()) {
    throw new Error('Debes indicar el nombre de la plantilla aprobada en Meta')
  }

  if (input.deliveryType === 'TEMPLATE') {
    const unsupportedVariables = findUnsupportedTemplateVariables(
      normalizedTemplate,
      TEMPLATE_CAMPAIGN_VARIABLE_KEYS,
    )

    if (unsupportedVariables.length > 0) {
      throw new Error(
        `La plantilla Meta solo admite estas variables: ${TEMPLATE_CAMPAIGN_VARIABLE_KEYS.map((key) => `{${key}}`).join(', ')}.`,
      )
    }
  }

  const audience = await buildCampaignAudience(context.clubId)
  const filteredAudience = filterAudienceBySegment(audience, input.segment).slice(0, CAMPAIGN_SEND_LIMIT)

  if (filteredAudience.length === 0) {
    throw new Error('No hay destinatarios para este segmento')
  }

  const reservationLink = buildReservationLink(context.clubSlug)
  const dedupeKey = buildDedupeKey({
    clubId: context.clubId,
    segment: input.segment,
    deliveryType: input.deliveryType,
    template: normalizedTemplate,
    templateName: input.templateName?.trim() || null,
    phones: filteredAudience.map((member) => member.normalizedPhone),
  })

  const duplicateWindowStart = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000)
  const duplicate = await prisma.whatsAppCampaign.findFirst({
    where: {
      clubId: context.clubId,
      dedupeKey,
      createdAt: { gte: duplicateWindowStart },
      status: { in: ['SENDING', 'SENT', 'PARTIAL'] },
    },
    select: { id: true, createdAt: true },
  })

  if (duplicate) {
    throw new Error('Ya enviaste una campaña igual hace muy poco. Espera unos minutos para evitar duplicados.')
  }

  const previewMessage = renderCampaignTemplate(normalizedTemplate, {
    ...buildCampaignVariables(filteredAudience[0], context.clubName, reservationLink),
  })

  const campaign = await prisma.whatsAppCampaign.create({
    data: {
      clubId: context.clubId,
      createdById: context.userId,
      segment: input.segment,
      deliveryType: input.deliveryType,
      templateName: input.templateName?.trim() || null,
      templateLanguage: input.deliveryType === 'TEMPLATE' ? 'es_AR' : null,
      status: 'SENDING',
      messageTemplate: normalizedTemplate,
      previewMessage,
      reservationLink,
      dedupeKey,
      reachableCount: filteredAudience.length,
      startedAt: new Date(),
    },
  })

  let sentCount = 0
  let failedCount = 0
  let simulatedCount = 0
  const failedRecipients: string[] = []

  for (const recipient of filteredAudience) {
    const campaignVariables = buildCampaignVariables(recipient, context.clubName, reservationLink)
    const personalizedMessage = renderCampaignTemplate(normalizedTemplate, campaignVariables)

    const result = input.deliveryType === 'TEMPLATE'
      ? await sendTemplateMessage(
        recipient.normalizedPhone,
        input.templateName!.trim(),
        buildCampaignTemplateParameters(TEMPLATE_CAMPAIGN_VARIABLE_KEYS, campaignVariables),
        'es_AR',
      )
      : await sendTextMessage(recipient.normalizedPhone, personalizedMessage)

    const status = result.success ? (result.simulated ? 'SIMULATED' : 'SENT') : 'FAILED'

    if (status === 'SENT') sentCount += 1
    if (status === 'SIMULATED') {
      sentCount += 1
      simulatedCount += 1
    }
    if (status === 'FAILED') {
      failedCount += 1
      failedRecipients.push(recipient.name)
    }

    await prisma.whatsAppCampaignRecipient.create({
      data: {
        campaignId: campaign.id,
        clubId: context.clubId,
        clientId: recipient.id,
        clientName: recipient.name,
        phone: recipient.normalizedPhone,
        personalizedMessage,
        status,
        messageId: result.messageId,
        error: result.error,
        simulated: !!result.simulated,
        sentAt: result.success ? new Date() : null,
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  const finalStatus = failedCount === 0 ? 'SENT' : sentCount > 0 ? 'PARTIAL' : 'FAILED'

  await prisma.whatsAppCampaign.update({
    where: { id: campaign.id },
    data: {
      status: finalStatus,
      sentCount,
      failedCount,
      simulatedCount,
      completedAt: new Date(),
    },
  })

  await logAction({
    clubId: context.clubId,
    userId: context.userId,
    action: 'CREATE',
    entity: 'SETTINGS',
    entityId: campaign.id,
    details: {
      type: 'WHATSAPP_CAMPAIGN',
      segment: input.segment,
      deliveryType: input.deliveryType,
      templateName: input.templateName?.trim() || null,
      reachableCount: filteredAudience.length,
      sentCount,
      failedCount,
      simulatedCount,
    },
  })

  return {
    id: campaign.id,
    status: finalStatus,
    segment: input.segment,
    deliveryType: input.deliveryType,
    templateName: input.templateName?.trim() || null,
    total: filteredAudience.length,
    sent: sentCount,
    failed: failedCount,
    simulated: simulatedCount,
    failedRecipients,
  }
}
