'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'

const FUNNEL_ENTITY = 'PUBLIC_BOOKING_FUNNEL'

type FunnelEvent = 'page_view' | 'date_selected' | 'slot_selected' | 'booking_created' | 'waitlist_created'

type FunnelSource = {
       source: string
       medium: string
       campaign: string
}

function normalizeSource(value?: string | null) {
       return value?.trim().slice(0, 80) || 'direct'
}

function buildSourceKey(source: FunnelSource) {
       return `${source.source} / ${source.medium}`
}

export async function trackPublicBookingEvent(data: {
       clubId: string
       event: FunnelEvent
       source?: string | null
       medium?: string | null
       campaign?: string | null
       dateStr?: string | null
       timeStr?: string | null
       courtId?: number | null
}) {
       try {
              if (!data.clubId || !data.event) return { success: false }

              const club = await prisma.club.findUnique({
                     where: { id: data.clubId },
                     select: { id: true }
              })

              if (!club) return { success: false }

              const source = normalizeSource(data.source)
              const medium = normalizeSource(data.medium)
              const campaign = normalizeSource(data.campaign)

              await prisma.auditLog.create({
                     data: {
                            clubId: data.clubId,
                            action: 'CREATE',
                            entity: FUNNEL_ENTITY,
                            entityId: data.event,
                            details: JSON.stringify({
                                   event: data.event,
                                   source,
                                   medium,
                                   campaign,
                                   dateStr: data.dateStr || null,
                                   timeStr: data.timeStr || null,
                                   courtId: data.courtId || null
                            })
                     }
              })

              return { success: true }
       } catch (error) {
              console.error('[PUBLIC FUNNEL TRACKING]', error)
              return { success: false }
       }
}

export async function getPublicBookingGrowthSummary(days = 14) {
       const clubId = await getCurrentClubId()
       const since = new Date()
       since.setDate(since.getDate() - days)

       const [club, logs] = await Promise.all([
              prisma.club.findUnique({
                     where: { id: clubId },
                     select: { slug: true }
              }),
              prisma.auditLog.findMany({
                     where: {
                            clubId,
                            entity: FUNNEL_ENTITY,
                            createdAt: { gte: since }
                     },
                     select: {
                            entityId: true,
                            details: true,
                            createdAt: true
                     },
                     orderBy: { createdAt: 'desc' },
                     take: 1200
              })
       ])

       const events: Record<FunnelEvent, number> = {
              page_view: 0,
              date_selected: 0,
              slot_selected: 0,
              booking_created: 0,
              waitlist_created: 0
       }
       const sources = new Map<string, {
              source: string
              medium: string
              campaign: string
              views: number
              bookings: number
              waitlist: number
       }>()

       for (const log of logs) {
              let details: Partial<FunnelSource & { event: FunnelEvent }> = {}
              try {
                     details = log.details ? JSON.parse(log.details) : {}
              } catch {
                     details = {}
              }

              const event = (details.event || log.entityId) as FunnelEvent
              if (event in events) {
                     events[event] += 1
              }

              const source = {
                     source: normalizeSource(details.source),
                     medium: normalizeSource(details.medium),
                     campaign: normalizeSource(details.campaign)
              }
              const key = buildSourceKey(source)
              const current = sources.get(key) || {
                     ...source,
                     views: 0,
                     bookings: 0,
                     waitlist: 0
              }

              if (event === 'page_view') current.views += 1
              if (event === 'booking_created') current.bookings += 1
              if (event === 'waitlist_created') current.waitlist += 1

              sources.set(key, current)
       }

       return {
              success: true,
              slug: club?.slug || '',
              days,
              events,
              conversionRate: events.page_view > 0
                     ? Math.round((events.booking_created / events.page_view) * 1000) / 10
                     : 0,
              sources: Array.from(sources.values()).sort((a, b) => {
                     const aTotal = a.bookings + a.waitlist
                     const bTotal = b.bookings + b.waitlist
                     return bTotal - aTotal || b.views - a.views
              })
       }
}
