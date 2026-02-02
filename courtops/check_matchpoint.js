const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
       try {
              const clubId = 'e316a936-1f0b-412d-88d5-b4c18bd3aeee' // Match Point club
              console.log('Checking Match Point club data...\n')

              // Check courts
              const courts = await prisma.court.findMany({
                     where: { clubId, isActive: true }
              })
              console.log(`Courts: ${courts.length}`)
              courts.forEach(c => console.log(`  - ${c.name} (ID: ${c.id})`))
              console.log()

              // Check for February 2, 2026
              const targetDate = new Date('2026-02-02')
              const start = new Date(targetDate)
              start.setHours(0, 0, 0, 0)
              const end = new Date(targetDate)
              end.setHours(23, 59, 59, 999)

              console.log(`\nBookings for ${start.toDateString()}: ${start.toISOString()} to ${end.toISOString()}\n`)

              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: start, lte: end },
                            status: { not: 'CANCELED' }
                     },
                     include: { client: true, items: true, transactions: true }
              })

              console.log(`Found: ${bookings.length} bookings`)
              bookings.forEach(b => {
                     const items = b.items?.length || 0
                     const txs = b.transactions?.length || 0
                     console.log(`  - Court ${b.courtId}: ${new Date(b.startTime).toLocaleTimeString('es-AR')} | Items: ${items}, Txs: ${txs} | Status: ${b.status}`)
              })
              console.log()

              // Check today also (for debugging)
              const today = new Date()
              const todayStart = new Date(today)
              todayStart.setHours(0, 0, 0, 0)
              const todayEnd = new Date(today)
              todayEnd.setHours(23, 59, 59, 999)

              const todayBookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: todayStart, lte: todayEnd },
                            status: { not: 'CANCELED' }
                     }
              })

              console.log(`\nBookings for today (${today.toDateString()}): ${todayBookings.length}`)

              // Check club settings
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { openTime: true, closeTime: true, slotDuration: true }
              })

              console.log('\nClub settings:')
              console.log(`  Open: ${club?.openTime}`)
              console.log(`  Close: ${club?.closeTime}`)
              console.log(`  Slot duration: ${club?.slotDuration} mins`)

       } catch (error) {
              console.error('Error:', error.message)
       } finally {
              await prisma.$disconnect()
       }
}

main()
