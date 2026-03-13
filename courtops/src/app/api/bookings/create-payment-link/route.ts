import { NextRequest, NextResponse } from 'next/server'
import { createPreference } from '@/actions/mercadopago'

export async function POST(request: NextRequest) {
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
