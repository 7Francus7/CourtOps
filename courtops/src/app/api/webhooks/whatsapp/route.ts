import { NextRequest, NextResponse } from 'next/server'

/**
 * WhatsApp Cloud API Webhook
 *
 * GET  → Verification challenge (Meta sends this when you register the webhook)
 * POST → Incoming messages & status updates
 *
 * Set WHATSAPP_VERIFY_TOKEN in your env to a random string,
 * then use the same string when registering the webhook in Meta Business Manager.
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verified successfully')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const entries = body?.entry || []
    for (const entry of entries) {
      const changes = entry?.changes || []
      for (const change of changes) {
        const value = change?.value

        // Status updates (sent, delivered, read, failed)
        const statuses = value?.statuses || []
        for (const status of statuses) {
          console.log('[WhatsApp Webhook] Status:', {
            messageId: status.id,
            recipientId: status.recipient_id,
            status: status.status,
            timestamp: status.timestamp,
            error: status.errors?.[0]?.message,
          })
        }

        // Incoming messages
        const messages = value?.messages || []
        for (const message of messages) {
          console.log('[WhatsApp Webhook] Incoming message:', {
            from: message.from,
            type: message.type,
            text: message.text?.body,
            timestamp: message.timestamp,
          })
          // Future: auto-reply, booking via WhatsApp, etc.
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
