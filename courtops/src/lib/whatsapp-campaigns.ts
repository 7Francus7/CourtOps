export const CAMPAIGN_SEGMENTS = [
  {
    key: 'INACTIVE_30D',
    label: 'Inactivos 30d',
    description: 'Clientes que no jugaron en los ultimos 30 dias.',
  },
  {
    key: 'FREQUENT',
    label: 'Frecuentes',
    description: 'Jugadores con 3 o mas reservas en los ultimos 60 dias.',
  },
  {
    key: 'WITH_DEBT',
    label: 'Con deuda',
    description: 'Clientes con reservas pasadas impagas o parciales.',
  },
  {
    key: 'MEMBERSHIP_EXPIRING',
    label: 'Membresia por vencer',
    description: 'Socios activos cuya membresia vence en los proximos 7 dias.',
  },
  {
    key: 'NEW_CLIENTS',
    label: 'Nuevos',
    description: 'Clientes creados en los ultimos 30 dias.',
  },
] as const

export const CAMPAIGN_VARIABLES = [
  { key: 'nombre', label: '{nombre}', description: 'Nombre del cliente' },
  { key: 'club', label: '{club}', description: 'Nombre del club' },
  { key: 'link_reserva', label: '{link_reserva}', description: 'Link publico de reserva del club' },
] as const

export const CAMPAIGN_DELIVERY_TYPES = [
  {
    key: 'TEXT',
    label: 'Mensaje libre',
    description: 'Usa texto libre. Funciona bien dentro de la ventana activa de WhatsApp.',
  },
  {
    key: 'TEMPLATE',
    label: 'Plantilla Meta',
    description: 'Usa una plantilla aprobada para iniciar conversaciones o reactivar clientes.',
  },
] as const

export type CampaignSegment = (typeof CAMPAIGN_SEGMENTS)[number]['key']
export type CampaignVariableKey = (typeof CAMPAIGN_VARIABLES)[number]['key']
export type CampaignDeliveryType = (typeof CAMPAIGN_DELIVERY_TYPES)[number]['key']

export type CampaignClientSnapshot = {
  createdAt: Date
  lastBookingAt: Date | null
  bookingsLast60: number
  debtCount: number
  membershipStatus?: string | null
  membershipExpiresAt?: Date | null
}

export function normalizeCampaignTemplate(template: string) {
  return template
    .replace(/\{\{\s*(nombre|club|link_reserva)\s*\}\}/gi, (_, key: string) => `{${key.toLowerCase()}}`)
    .trim()
}

export function renderCampaignTemplate(
  template: string,
  variables: Record<CampaignVariableKey, string>,
) {
  return normalizeCampaignTemplate(template).replace(/\{(nombre|club|link_reserva)\}/gi, (_, rawKey: string) => {
    const key = rawKey.toLowerCase() as CampaignVariableKey
    return variables[key] || ''
  })
}

export function buildCampaignTemplateParameters(
  keys: CampaignVariableKey[],
  variables: Record<CampaignVariableKey, string>,
) {
  return keys.map((key) => variables[key] || '')
}

export function getSegmentMeta(segment: CampaignSegment) {
  return CAMPAIGN_SEGMENTS.find((item) => item.key === segment)
}

type CampaignHistorySummaryInput = {
  sentCount: number
  failedCount: number
  simulatedCount: number
  reachableCount: number
}

export function summarizeCampaignHistory(items: CampaignHistorySummaryInput[]) {
  const totals = items.reduce((accumulator, item) => ({
    campaigns: accumulator.campaigns + 1,
    sent: accumulator.sent + item.sentCount,
    failed: accumulator.failed + item.failedCount,
    simulated: accumulator.simulated + item.simulatedCount,
    reachable: accumulator.reachable + item.reachableCount,
  }), {
    campaigns: 0,
    sent: 0,
    failed: 0,
    simulated: 0,
    reachable: 0,
  })

  const deliveryRate = totals.reachable > 0
    ? Number(((totals.sent / totals.reachable) * 100).toFixed(1))
    : 0

  return {
    ...totals,
    deliveryRate,
  }
}

export function matchesCampaignSegment(
  client: CampaignClientSnapshot,
  segment: CampaignSegment,
  now: Date = new Date(),
) {
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  if (segment === 'INACTIVE_30D') {
    return !!client.lastBookingAt && client.lastBookingAt < thirtyDaysAgo
  }

  if (segment === 'FREQUENT') {
    return client.bookingsLast60 >= 3
  }

  if (segment === 'WITH_DEBT') {
    return client.debtCount > 0
  }

  if (segment === 'MEMBERSHIP_EXPIRING') {
    return (
      client.membershipStatus === 'ACTIVE' &&
      !!client.membershipExpiresAt &&
      client.membershipExpiresAt >= now &&
      client.membershipExpiresAt <= sevenDaysFromNow
    )
  }

  if (segment === 'NEW_CLIENTS') {
    return client.createdAt >= thirtyDaysAgo
  }

  return false
}
