/**
 * WhatsApp Cloud API client for CourtOps
 *
 * Uses the official Meta WhatsApp Business Platform Cloud API.
 * Supports:
 *  - Free-form text messages (within 24h customer service window)
 *  - Template messages (business-initiated, requires approved templates in Meta)
 *
 * Required env vars:
 *  - WHATSAPP_TOKEN        : Permanent access token from Meta Business
 *  - WHATSAPP_PHONE_ID     : Phone number ID from Meta
 *
 * Optional:
 *  - WHATSAPP_API_VERSION  : Graph API version (default: v21.0)
 */

import { withCircuitBreaker } from '@/lib/circuit-breaker'

const WA_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0'

function getConfig() {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  return { token, phoneId, configured: !!(token && phoneId) }
}

/** Normalize Argentine phone numbers to international E.164 format */
export function normalizePhone(phone: string): string {
  let clean = phone.replace(/\D/g, '')

  // Argentina local: 0XX... → 54XX...
  if (clean.startsWith('0')) {
    clean = '54' + clean.substring(1)
  }
  // Short number without country code → assume Argentina
  if (!clean.startsWith('54') && clean.length <= 10) {
    clean = '54' + clean
  }
  // Argentina mobile: remove the "9" after "54" if followed by area code
  // WhatsApp expects: 54 + area code + number (without the 9)
  // e.g. +54 9 351 1234567 → 54 351 1234567 for the API
  // Actually, WhatsApp Cloud API expects the full number WITH the 9 for Argentina mobiles
  // So we don't strip it.

  return clean
}

export type WhatsAppResult = {
  success: boolean
  messageId?: string
  error?: string
  simulated?: boolean
}

/** Send a free-form text message (works within 24h customer service window) */
export async function sendTextMessage(phone: string, text: string): Promise<WhatsAppResult> {
  const config = getConfig()

  if (!config.configured) {
    console.warn('[WhatsApp] Not configured (missing WHATSAPP_TOKEN or WHATSAPP_PHONE_ID). Message simulated:', {
      to: phone,
      preview: text.substring(0, 80),
    })
    return { success: true, simulated: true }
  }

  const to = normalizePhone(phone)
  const url = `https://graph.facebook.com/${WA_API_VERSION}/${config.phoneId}/messages`

  try {
    const res = await withCircuitBreaker('whatsapp', () =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { preview_url: false, body: text },
        }),
        signal: AbortSignal.timeout(10_000),
      })
    )

    const data = await res.json()

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}`
      console.error('[WhatsApp] API error:', errMsg, { to, status: res.status })
      return { success: false, error: errMsg }
    }

    const messageId = data?.messages?.[0]?.id
    console.log('[WhatsApp] Sent successfully:', { to, messageId })
    return { success: true, messageId }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[WhatsApp] Network error:', errMsg)
    return { success: false, error: errMsg }
  }
}

/**
 * Send a template message (for business-initiated conversations).
 * Templates must be pre-approved in Meta Business Manager.
 *
 * Common templates for CourtOps:
 *  - "booking_reminder"    : {{1}}=clientName, {{2}}=date, {{3}}=time, {{4}}=court
 *  - "booking_confirmed"   : {{1}}=clientName, {{2}}=date, {{3}}=time, {{4}}=court, {{5}}=price
 *  - "payment_received"    : {{1}}=clientName, {{2}}=amount
 *  - "slot_available"      : {{1}}=clientName, {{2}}=date, {{3}}=time
 */
export async function sendTemplateMessage(
  phone: string,
  templateName: string,
  parameters: string[],
  language: string = 'es_AR',
): Promise<WhatsAppResult> {
  const config = getConfig()

  if (!config.configured) {
    console.warn('[WhatsApp] Not configured. Template simulated:', { to: phone, template: templateName, parameters })
    return { success: true, simulated: true }
  }

  const to = normalizePhone(phone)
  const url = `https://graph.facebook.com/${WA_API_VERSION}/${config.phoneId}/messages`

  try {
    const res = await withCircuitBreaker('whatsapp', () =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
            components: [
              {
                type: 'body',
                parameters: parameters.map((value) => ({ type: 'text', text: value })),
              },
            ],
          },
        }),
        signal: AbortSignal.timeout(10_000),
      })
    )

    const data = await res.json()

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}`
      console.error('[WhatsApp] Template error:', errMsg, { to, template: templateName })
      return { success: false, error: errMsg }
    }

    const messageId = data?.messages?.[0]?.id
    console.log('[WhatsApp] Template sent:', { to, template: templateName, messageId })
    return { success: true, messageId }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[WhatsApp] Network error:', errMsg)
    return { success: false, error: errMsg }
  }
}
