import { NextRequest, NextResponse } from 'next/server'
import { createBooking } from '@/actions/createBooking'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await createBooking(body)
    return NextResponse.json(res)
  } catch (err: any) {
    console.error('[API /bookings] Error', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 })
  }
}
