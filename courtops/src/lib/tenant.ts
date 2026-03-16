import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { startOfDay, endOfDay } from "date-fns"
import { nowInArg, fromUTC } from "./date-utils"

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

       if (
              club &&
              club.subscriptionStatus === 'TRIAL' &&
              club.nextBillingDate &&
              new Date(club.nextBillingDate) < new Date()
       ) {
              throw new Error('Tu prueba gratuita ha expirado. Suscribite a un plan para continuar.')
       }
}

export async function getOptionalClubId(): Promise<string | null> {
       const session = await getServerSession(authOptions)
       return session?.user?.clubId || null
}

export async function getEffectivePrice(
       clubId: string,
       date: Date,
       _durationMin = 90,
       isMember = false,
       discountPercent = 0,
       courtId?: number
): Promise<number> {
       // Convert to Argentina local components for matching rules
       const argDate = fromUTC(date)
       const dayOfWeek = argDate.getUTCDay()
       const timeStr = argDate.getUTCHours().toString().padStart(2, '0') + ':' + argDate.getUTCMinutes().toString().padStart(2, '0')

       // Fetch all rules for logic (filtering in memory is safer for complex string time ranges)
       // Optimization: Filter by date range in SQL
       const rules = await prisma.priceRule.findMany({
              where: {
                     clubId: clubId,
                     // We fetch ALL rules and filter in memory to avoid Timezone strictness issues with startDate/endDate
              },
              orderBy: {
                     priority: 'desc'
              }
       })

       // Filter rules: court-specific first, then global (courtId = null)
       // Filter by Date Validity manually here
       const activeRules = rules.filter(r => {
              if (!r.startDate) return true

              // Normalize dates to YYYY-MM-DD for comparison, ignoring time
              const ruleStart = r.startDate.toISOString().substring(0, 10)
              const checkDate = argDate.toISOString().substring(0, 10)

              if (checkDate < ruleStart) return false

              if (r.endDate) {
                     const ruleEnd = r.endDate.toISOString().substring(0, 10)
                     if (checkDate > ruleEnd) return false
              }

              return true
       })


       // Filter rules: court-specific first, then global (courtId = null)
       // If courtId is provided, prioritize rules for that court, then fall back to global rules
       const courtSpecificRules = courtId ? activeRules.filter(r => r.courtId === courtId) : []
       const globalRules = activeRules.filter(r => r.courtId === null)

       // Combined priority: court-specific first, then global
       const orderedRules = [...courtSpecificRules, ...globalRules]

       // Find first matching rule
       const match = orderedRules.find(rule => {
              // 1. Check Day of Week
              if (rule.daysOfWeek) {
                     // "0,6"
                     const days = rule.daysOfWeek.split(',').map(d => parseInt(d.trim()))
                     if (!days.includes(dayOfWeek)) return false
              }

              // 2. Check Time Range
              const start = rule.startTime
              const end = rule.endTime

              // Case A: Standard day range (e.g., 09:00 - 18:00)
              if (start <= end) {
                     if (timeStr >= start && timeStr < end) return true
              }
              // Case B: Cross-midnight range (e.g., 20:00 - 02:00)
              else {
                     // Applies if time is AFTER start (20:00..23:59) OR BEFORE end (00:00..01:59)
                     if (timeStr >= start || timeStr < end) return true
              }

              return false
       })

       if (!match) {
              // Fallback: use the highest-priority rule for this club regardless of time/day
              const fallback = orderedRules[0] || activeRules[0]
              if (fallback) {
                     console.warn(`No exact PriceRule match for ${date.toISOString()} (time=${timeStr}, day=${dayOfWeek}), using fallback rule "${fallback.name}" (id=${fallback.id})`)
                     let fallbackPrice = fallback.price
                     if (isMember) {
                            if (fallback.memberPrice != null) {
                                   fallbackPrice = fallback.memberPrice
                            } else if (discountPercent > 0) {
                                   fallbackPrice = fallbackPrice * (1 - (discountPercent / 100))
                            }
                     }
                     return fallbackPrice
              }
              console.warn(`No PriceRule found for club ${clubId}, defaulting to 0`)
              return 0
       }

       let finalPrice = match.price

       if (isMember) {
              if (match.memberPrice != null) {
                     // Fixed override takes precedence
                     finalPrice = match.memberPrice
              } else if (discountPercent > 0) {
                     // Dynamic % discount
                     finalPrice = finalPrice * (1 - (discountPercent / 100))
              }
       }

       return finalPrice
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
