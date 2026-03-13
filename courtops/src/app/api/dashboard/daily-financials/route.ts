import { NextRequest, NextResponse } from 'next/server'
import { getDailyFinancials } from '@/actions/finance'

export async function POST(req: NextRequest) {
  try {
    const { date, localDate } = await req.json()
    const res = await getDailyFinancials(localDate || date)
    return NextResponse.json(res)
  } catch (err: unknown) {
    console.error('[API /daily-financials] Error', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
