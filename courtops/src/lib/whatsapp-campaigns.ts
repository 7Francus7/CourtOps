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
  { key: 'primer_nombre', label: '{primer_nombre}', description: 'Primer nombre del cliente' },
  { key: 'club', label: '{club}', description: 'Nombre del club' },
  { key: 'link_reserva', label: '{link_reserva}', description: 'Link publico de reserva del club' },
  { key: 'dias_sin_jugar', label: '{dias_sin_jugar}', description: 'Dias desde la ultima reserva jugada' },
  { key: 'deuda_reservas', label: '{deuda_reservas}', description: 'Cantidad de reservas vencidas con deuda' },
  { key: 'fecha_vencimiento', label: '{fecha_vencimiento}', description: 'Fecha de vencimiento de la membresia' },
  { key: 'dias_para_vencer', label: '{dias_para_vencer}', description: 'Dias restantes para el vencimiento' },
  { key: 'dias_desde_alta', label: '{dias_desde_alta}', description: 'Dias desde el alta del cliente' },
  { key: 'reservas_60d', label: '{reservas_60d}', description: 'Reservas acumuladas en los ultimos 60 dias' },
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
export type CampaignPlaybookKey =
  | 'REACTIVATION'
  | 'MEMBERSHIP_EXPIRING'
  | 'WITH_DEBT'
  | 'NEW_CLIENTS'

export const TEMPLATE_CAMPAIGN_VARIABLE_KEYS: CampaignVariableKey[] = ['nombre', 'club', 'link_reserva']

export const CAMPAIGN_PLAYBOOKS = [
  {
    key: 'REACTIVATION',
    label: 'Reactivacion',
    objective: 'Volver a cancha',
    description: 'Recupera clientes que hace al menos 30 dias no vuelven a reservar.',
    segment: 'INACTIVE_30D',
    deliveryType: 'TEXT',
    templateName: 'courtops_reactivacion_v1',
    template:
      'Hola {primer_nombre}, hace {dias_sin_jugar} dias que no te vemos por {club}. Esta semana abrimos agenda con buenos turnos para volver a jugar. Si quieres, puedes reservar directo desde aca: {link_reserva}',
    recommendedVariables: ['primer_nombre', 'dias_sin_jugar', 'club', 'link_reserva'],
    launchChecklist: [
      'Confirma que el link publico de reserva este actualizado.',
      'Usalo cuando quieras reactivar agenda floja de la semana.',
      'Conviene sumar una promo o franja horaria si la ocupacion viene baja.',
    ],
  },
  {
    key: 'MEMBERSHIP_EXPIRING',
    label: 'Membresia por vencer',
    objective: 'Renovacion',
    description: 'Empuja renovaciones antes del vencimiento con un recordatorio claro.',
    segment: 'MEMBERSHIP_EXPIRING',
    deliveryType: 'TEXT',
    templateName: 'courtops_membresia_vencer_v1',
    template:
      'Hola {primer_nombre}, te avisamos desde {club} que tu membresia vence el {fecha_vencimiento}, en {dias_para_vencer} dias. Si quieres renovarla y seguir aprovechando tus beneficios, escribenos por este medio o reserva aca: {link_reserva}',
    recommendedVariables: ['primer_nombre', 'club', 'fecha_vencimiento', 'dias_para_vencer', 'link_reserva'],
    launchChecklist: [
      'Ideal para enviarla entre 7 y 3 dias antes del vencimiento.',
      'Si ofreces renovacion con beneficio, agregalo en la segunda linea.',
      'Deja claro el canal de respuesta para cerrar la renovacion rapido.',
    ],
  },
  {
    key: 'WITH_DEBT',
    label: 'Clientes con deuda',
    objective: 'Cobro pendiente',
    description: 'Ordena cobranzas sin sonar agresivo y lleva la conversacion a cierre.',
    segment: 'WITH_DEBT',
    deliveryType: 'TEXT',
    templateName: 'courtops_deuda_v1',
    template:
      'Hola {primer_nombre}, te escribimos desde {club} porque vemos {deuda_reservas} reserva(s) pendientes de regularizar. Si ya lo resolviste, puedes ignorar este mensaje. Si no, respondeme por aqui y lo vemos juntos para dejar tu cuenta al dia.',
    recommendedVariables: ['primer_nombre', 'club', 'deuda_reservas'],
    launchChecklist: [
      'Funciona mejor con tono directo y sin excesos de contexto.',
      'Si manejas links de pago, puedes agregarlos manualmente antes de enviar.',
      'Evita plantillas Meta salvo que el copy use solo variables basicas.',
    ],
  },
  {
    key: 'NEW_CLIENTS',
    label: 'Nuevos clientes',
    objective: 'Bienvenida',
    description: 'Da la bienvenida y empuja la primera o segunda reserva rapido.',
    segment: 'NEW_CLIENTS',
    deliveryType: 'TEXT',
    templateName: 'courtops_bienvenida_v1',
    template:
      'Hola {primer_nombre}, bienvenido a {club}. Hace {dias_desde_alta} dias te sumaste y queriamos dejarte a mano el acceso directo para reservar cuando quieras: {link_reserva}. Si necesitas ayuda para encontrar horario, respondeme y te damos una mano.',
    recommendedVariables: ['primer_nombre', 'club', 'dias_desde_alta', 'link_reserva'],
    launchChecklist: [
      'Ideal para primeras 48 horas o primera semana del alta.',
      'Si tienes clases, torneos o beneficios de bienvenida, sumalos aca.',
      'Usala como base para una secuencia comercial corta.',
    ],
  },
] as const satisfies ReadonlyArray<{
  key: CampaignPlaybookKey
  label: string
  objective: string
  description: string
  segment: CampaignSegment
  deliveryType: CampaignDeliveryType
  templateName: string
  template: string
  recommendedVariables: CampaignVariableKey[]
  launchChecklist: string[]
}>

export type CampaignClientSnapshot = {
  createdAt: Date
  lastBookingAt: Date | null
  bookingsLast60: number
  debtCount: number
  membershipStatus?: string | null
  membershipExpiresAt?: Date | null
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getCampaignVariableRegex(wrapper: 'double' | 'single') {
  const keys = CAMPAIGN_VARIABLES.map((variable) => escapeRegExp(variable.key)).join('|')
  return wrapper === 'double'
    ? new RegExp(`\\{\\{\\s*(${keys})\\s*\\}\\}`, 'gi')
    : new RegExp(`\\{(${keys})\\}`, 'gi')
}

export function normalizeCampaignTemplate(template: string) {
  return template
    .replace(getCampaignVariableRegex('double'), (_, key: string) => `{${key.toLowerCase()}}`)
    .trim()
}

export function renderCampaignTemplate(
  template: string,
  variables: Partial<Record<CampaignVariableKey, string>>,
) {
  return normalizeCampaignTemplate(template).replace(getCampaignVariableRegex('single'), (_, rawKey: string) => {
    const key = rawKey.toLowerCase() as CampaignVariableKey
    return variables[key] || ''
  })
}

export function buildCampaignTemplateParameters(
  keys: CampaignVariableKey[],
  variables: Partial<Record<CampaignVariableKey, string>>,
) {
  return keys.map((key) => variables[key] || '')
}

export function extractCampaignVariableKeys(template: string) {
  const found = new Set<CampaignVariableKey>()

  normalizeCampaignTemplate(template).replace(getCampaignVariableRegex('single'), (_, rawKey: string) => {
    found.add(rawKey.toLowerCase() as CampaignVariableKey)
    return _
  })

  return [...found]
}

export function findUnsupportedTemplateVariables(
  template: string,
  allowedVariables: CampaignVariableKey[] = TEMPLATE_CAMPAIGN_VARIABLE_KEYS,
) {
  const allowedSet = new Set<CampaignVariableKey>(allowedVariables)
  return extractCampaignVariableKeys(template).filter((key) => !allowedSet.has(key))
}

export function getCampaignPlaybook(playbookKey: CampaignPlaybookKey) {
  return CAMPAIGN_PLAYBOOKS.find((playbook) => playbook.key === playbookKey)
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
