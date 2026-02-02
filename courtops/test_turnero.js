const { PrismaClient } = require('@prisma/client')

// Simulate getTurneroData function
async function getTurneroData(dateStr) {
       const prisma = new PrismaClient()
       try {
              console.log('[TURNERO] 1. Starting getTurneroData for date:', dateStr)

              // Simulate session (using hardcoded clubId for testing)
              const clubId = 'e316a936-1f0b-412d-88d5-b4c18bd3aeee' // Match Point
              console.log('[TURNERO] 2. Got clubId:', clubId)

              const targetDate = new Date(dateStr)
              console.log('[TURNERO] 3. Parsed targetDate:', targetDate.toISOString())

              const start = new Date(targetDate)
              start.setDate(start.getDate() - 1)
              start.setHours(0, 0, 0, 0)

              const end = new Date(targetDate)
              end.setDate(end.getDate() + 1)
              end.setHours(23, 59, 59, 999)

              console.log('[TURNERO] 4. Date range:', { start: start.toISOString(), end: end.toISOString() })

              // Fetch courts
              console.log('[TURNERO] 5. Fetching courts...')
              const courts = await prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' }
              }).catch((err) => {
                     console.error('Courts fetch error:', err)
                     return []
              })

              console.log('[TURNERO] 6. Courts fetched:', courts.length)

              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { openTime: true, closeTime: true, slotDuration: true, timezone: true }
              }).catch((err) => {
                     console.error('Club fetch error:', err)
                     return null
              })

              console.log('[TURNERO] 7. Club config fetched:', !!club)

              // Fetch bookings
              let bookings = []
              try {
                     console.log('[TURNERO] 8. Fetching bookings...')
                     bookings = await prisma.booking.findMany({
                            where: {
                                   clubId,
                                   startTime: { gte: start, lte: end },
                                   status: { not: 'CANCELED' }
                            },
                            include: {
                                   client: { select: { id: true, name: true, phone: true } },
                                   items: { include: { product: true } },
                                   transactions: true
                            },
                            orderBy: { startTime: 'asc' }
                     })
                     console.log('[TURNERO] 9. Bookings fetched:', bookings.length)
              } catch (e) {
                     console.error("[TURNERO] Non-fatal: Error fetching bookings", e)
              }

              const config = {
                     openTime: club?.openTime || '09:00',
                     closeTime: club?.closeTime || '00:00',
                     slotDuration: club?.slotDuration || 90
              }

              console.log('[TURNERO] 10. Preparing response object...')

              const response = {
                     bookings,
                     courts,
                     config,
                     clubId,
                     success: true
              }

              console.log('[TURNERO] 11. Response prepared successfully')
              return response

       } catch (error) {
              console.error('[TURNERO SERVER ERROR]', error.message)
              console.error('[TURNERO STACK]', error.stack)
              return {
                     bookings: [],
                     courts: [],
                     config: { openTime: '09:00', closeTime: '00:00', slotDuration: 60 },
                     clubId: '',
                     success: false,
                     error: error.message || 'Server error'
              }
       } finally {
              await prisma.$disconnect()
       }
}

// Test it
const testDate = new Date('2026-02-02').toISOString()
console.log('Testing getTurneroData with date:', testDate)
console.log('')

getTurneroData(testDate).then(result => {
       console.log('\n=== RESULT ===')
       console.log('Success:', result.success)
       console.log('Error:', result.error)
       console.log('Courts:', result.courts.length)
       console.log('Bookings:', result.bookings.length)
       console.log('Config:', result.config)
})
