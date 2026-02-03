import { NextRequest, NextResponse } from 'next/server'
import { getDailyFinancials } from '@/actions/finance'

export async function POST(req: NextRequest) {
  try {
    const { date } = await req.json()
    const res = await getDailyFinancials(date)
    return NextResponse.json(res)
  } catch (err: any) {
    console.error('[API /daily-financials] Error', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
