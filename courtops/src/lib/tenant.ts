import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { startOfDay, addHours } from "date-fns"
import { nowInArg } from "./date-utils"

// REAL AUTH: Read from Session
export async function getCurrentClubId(): Promise<string> {
       const session = await getServerSession(authOptions)

       if (!session || !session.user || !session.user.clubId) {
              console.log("Tenant check failed. Session:", session ? "Present" : "Null", "ClubID:", session?.user?.clubId)
              redirect('/login')
       }

       // Verify Club Exists (in case it was deleted while user was logged in)
       const club = await prisma.club.findUnique({
              where: { id: session.user.clubId },
              select: { id: true }
       })

       if (!club) {
              // Club deleted. Handle graceful exit.
              if (session.user.email === 'dellorsif@gmail.com' || session.user.email === 'admin@courtops.com') {
                     redirect('/god-mode')
              } else {
                     redirect('/login')
              }
       }

       return session.user.clubId
}

export async function getEffectivePrice(clubId: string, date: Date, durationMin = 90, isMember = false): Promise<number> {
       // Convert to Argentina local components for matching rules
       const argDate = addHours(date, -3) // Simple manual shift for server logic
       const dayOfWeek = argDate.getUTCDay()
       const timeStr = argDate.getUTCHours().toString().padStart(2, '0') + ':' + argDate.getUTCMinutes().toString().padStart(2, '0')

       // Fetch all rules for logic (filtering in memory is safer for complex string time ranges)
       // Optimization: Filter by date range in SQL
       const rules = await prisma.priceRule.findMany({
              where: {
                     clubId: clubId,
                     OR: [
                            { startDate: null },
                            { startDate: { lte: date }, endDate: { gte: date } }
                     ]
              },
              orderBy: {
                     priority: 'desc'
              }
       })

       // Find first matching rule
       const match = rules.find(rule => {
              // 1. Check Day of Week
              if (rule.daysOfWeek) {
                     // "0,6"
                     const days = rule.daysOfWeek.split(',').map(d => parseInt(d.trim()))
                     if (!days.includes(dayOfWeek)) return false
              }

              // 2. Check Time Range
              // Simple string comparison works for "HH:mm" in 24h format
              // e.g. "18:00" <= "19:00" < "23:00"
              if (timeStr >= rule.startTime && timeStr < rule.endTime) {
                     return true
              }

              return false
       })

       if (!match) {
              console.warn(`No PriceRule found for ${date.toISOString()}, defaulting to 0`)
              return 0
       }

       if (isMember && match.memberPrice != null) {
              return match.memberPrice
       }

       return match.price
}

// Ensure a Cash Register exists for today
export async function getOrCreateTodayCashRegister(clubId: string) {
       const today = startOfDay(nowInArg())

       let register = await prisma.cashRegister.findFirst({
              where: {
                     clubId,
                     date: today
              }
       })

       if (!register) {
              register = await prisma.cashRegister.create({
                     data: {
                            clubId,
                            date: today,
                            status: 'OPEN',
                            startAmount: 0 // Should be manually opened, but auto-create for transactions
                     }
              })
       }

       return register
}
