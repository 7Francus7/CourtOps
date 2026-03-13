import { NextResponse } from 'next/server'
import { getRevenueHeatmapData } from '@/actions/dashboard'

export async function GET() {
  try {
    const res = await getRevenueHeatmapData()
    return NextResponse.json(res)
  } catch (err: unknown) {
    console.error('[API /heatmap] Error', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}
