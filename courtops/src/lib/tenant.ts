import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { startOfDay, endOfDay } from "date-fns"
import { nowInArg, fromUTC } from "./date-utils"
import type { PriceRule } from "@prisma/client"
import { getCache, setCache } from "./cache"

// REAL AUTH: Read from Session
export async function getCurrentClubId(): Promise<string> {
       const session = await getServerSession(authOptions)

       if (!session || !session.user || !session.user.clubId) {
              redirect('/login')
       }

       // Verify Club Exists (in case it was deleted while user was logged in)
       const club = await prisma.club.findUnique({
              where: { id: session.user.clubId },
              select: { id: true }
       })

       if (!club) {
              redirect('/login')
       }

       return session.user.clubId
}

/**
 * Checks if the club's trial has expired. Throws if expired to block server actions.
 * Call this at the start of any server action that should be blocked when trial ends.
 */
export async function enforceActiveSubscription(clubId: string): Promise<void> {
       const club = await prisma.club.findUnique({
              where: { id: clubId },
              select: { subscriptionStatus: true, nextBillingDate: true }
       })

       if (!club) return

       // Trial expirado por el cron de trial-expiry
       if (club.subscriptionStatus === 'EXPIRED') {
              throw new Error('Tu prueba terminó. Activá un plan desde Suscripción para continuar.')
       }

       // Suspendido por falta de pago (cron subscription-suspend)
       if (club.subscriptionStatus === 'SUSPENDED') {
              throw new Error('Tu cuenta está suspendida por falta de pago. Renovala desde Suscripción.')
       }

       // Trial expirado por tiempo (nextBillingDate = fecha fin del trial),
       // por si el cron todavía no corrió hoy
       if (
              club.subscriptionStatus === 'TRIAL' &&
              club.nextBillingDate &&
              new Date(club.nextBillingDate) < new Date()
       ) {
              throw new Error('Tu prueba gratuita terminó. Activá un plan desde Suscripción para continuar.')
       }
}

export async function getOptionalClubId(): Promise<string | null> {
       const session = await getServerSession(authOptions)
       return session?.user?.clubId || null
}

/**
 * Pure price computation from pre-fetched rules — no DB call.
 * Use this inside loops where rules are fetched once outside.
 */
export function computePriceFromRules(
       rules: PriceRule[],
       date: Date,
       isMember = false,
       discountPercent = 0,
       courtId?: number
): number {
       const argDate = fromUTC(date)
       const dayOfWeek = argDate.getUTCDay()
       const timeStr = argDate.getUTCHours().toString().padStart(2, '0') + ':' + argDate.getUTCMinutes().toString().padStart(2, '0')
       const checkDate = argDate.toISOString().substring(0, 10)

       const activeRules = rules.filter(r => {
              if (!r.startDate) return true
              const ruleStart = r.startDate.toISOString().substring(0, 10)
              if (checkDate < ruleStart) return false
              if (r.endDate) {
                     const ruleEnd = r.endDate.toISOString().substring(0, 10)
                     if (checkDate > ruleEnd) return false
              }
              return true
       })

       const courtSpecificRules = courtId ? activeRules.filter(r => r.courtId === courtId) : []
       const globalRules = activeRules.filter(r => r.courtId === null)
       const orderedRules = [...courtSpecificRules, ...globalRules]

       const match = orderedRules.find(rule => {
              if (rule.daysOfWeek) {
                     const days = rule.daysOfWeek.split(',').map(d => parseInt(d.trim()))
                     if (!days.includes(dayOfWeek)) return false
              }
              const start = rule.startTime
              const end = rule.endTime
              if (start <= end) {
                     if (timeStr >= start && timeStr < end) return true
              } else {
                     if (timeStr >= start || timeStr < end) return true
              }
              return false
       })

       const effective = match ?? orderedRules[0] ?? activeRules[0]
       if (!effective) return 0

       if (!match) {
              console.warn(`[pricing] No exact PriceRule match for ${date.toISOString()} (time=${timeStr}, day=${dayOfWeek}), using fallback "${effective.name}"`)
       }

       let finalPrice = effective.price
       if (isMember) {
              if (effective.memberPrice != null) {
                     finalPrice = effective.memberPrice
              } else if (discountPercent > 0) {
                     finalPrice = finalPrice * (1 - discountPercent / 100)
              }
       }
       return finalPrice
}

async function fetchPriceRules(clubId: string): Promise<PriceRule[]> {
       const cacheKey = `price-rules:${clubId}`
       const cached = await getCache<PriceRule[]>(cacheKey)
       if (cached) return cached
       const rules = await prisma.priceRule.findMany({
              where: { clubId },
              orderBy: { priority: 'desc' },
       })
       await setCache(cacheKey, rules, 300) // 5 min — rules change rarely
       return rules
}

export async function getEffectivePrice(
       clubId: string,
       date: Date,
       _durationMin = 90,
       isMember = false,
       discountPercent = 0,
       courtId?: number
): Promise<number> {
       const rules = await fetchPriceRules(clubId)
       return computePriceFromRules(rules, date, isMember, discountPercent, courtId)
}

// Ensure a Cash Register exists for today
export async function getOrCreateTodayCashRegister(clubId: string) {
       const now = nowInArg()
       const todayStart = startOfDay(now)
       const todayEnd = endOfDay(now)

       let register = await prisma.cashRegister.findFirst({
              where: {
                     clubId,
                     date: {
                            gte: todayStart,
                            lte: todayEnd
                     }
              },
              orderBy: { id: 'desc' }
       })

       if (!register) {
              try {
                     register = await prisma.cashRegister.create({
                            data: {
                                   clubId,
                                   date: todayStart,
                                   status: 'OPEN',
                                   startAmount: 0
                            }
                     })
              } catch {
                     // Race condition: another request created it first, retry find
                     register = await prisma.cashRegister.findFirst({
                            where: {
                                   clubId,
                                   date: { gte: todayStart, lte: todayEnd }
                            },
                            orderBy: { id: 'desc' }
                     })
                     if (!register) throw new Error('No se pudo crear la caja del día')
              }
       }

       return register
}
