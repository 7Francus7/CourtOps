import { NextRequest, NextResponse } from 'next/server'
import { createPreference } from '@/actions/mercadopago'
import { checkRateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const rl = await checkRateLimit(`payment:${ip}`, 10, 60_000)

  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Demasiadas solicitudes. Intentá en un minuto.' },
      { status: 429, headers: rl.headers }
    )
  }

  try {
    const body = await request.json()
    const { bookingId, amount } = body

    if (!bookingId || !amount) {
      return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 })
    }

    const result = await createPreference(bookingId, `/pay/${bookingId}`, amount)

    if (result.success && result.init_point) {
      return NextResponse.json({ success: true, url: result.init_point })
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Error al crear preferencia' }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error('Server error creating payment link:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error del servidor' }, { status: 500 })
  }
}
