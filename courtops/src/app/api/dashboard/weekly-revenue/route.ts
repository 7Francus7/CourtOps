import { NextResponse } from 'next/server'
import { getWeeklyRevenue } from '@/actions/finance'

export async function GET() {
  try {
    const res = await getWeeklyRevenue()
    return NextResponse.json(res)
  } catch (err: unknown) {
    console.error('[API /weekly-revenue] Error', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
