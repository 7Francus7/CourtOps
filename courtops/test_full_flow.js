const { PrismaClient } = require('@prisma/client')
const { getServerSession } = require('next-auth')

async function testFullFlow() {
       const prisma = new PrismaClient()

       try {
              console.log('=== Testing Full Flow ===\n')

              // 1. Test DB connection
              console.log('1. Testing DB connection...')
              await prisma.$queryRaw`SELECT 1`
              console.log('   ✓ DB connected\n')

              // 2. Get clubs
              const clubs = await prisma.club.findMany({ take: 3 })
              console.log(`2. Clubs found: ${clubs.length}`)
              clubs.forEach(c => console.log(`   - ${c.name} (${c.id})`))
              console.log()

              if (clubs.length > 0) {
                     const clubId = clubs[0].id

                     // 3. Get courts
                     const courts = await prisma.court.findMany({
                            where: { clubId, isActive: true }
                     })
                     console.log(`3. Courts: ${courts.length}`)
                     courts.forEach(c => console.log(`   - ${c.name}`))
                     console.log()

                     // 4. Check config
                     const club = await prisma.club.findUnique({
                            where: { id: clubId }
                     })
                     console.log('4. Club config:')
                     console.log(`   Open: ${club.openTime}`)
                     console.log(`   Close: ${club.closeTime}`)
                     console.log(`   Slot: ${club.slotDuration}`)
                     console.log()

                     // 5. Check for bookings on Feb 2, 2026
                     const targetDate = new Date('2026-02-02')
                     const start = new Date(targetDate)
                     start.setHours(0, 0, 0, 0)
                     const end = new Date(targetDate)
                     end.setHours(23, 59, 59, 999)

                     const bookings = await prisma.booking.findMany({
                            where: {
                                   clubId,
                                   startTime: { gte: start, lte: end },
                                   status: { not: 'CANCELED' }
                            },
                            include: {
                                   client: true,
                                   items: true,
                                   transactions: true
                            }
                     })

                     console.log(`5. Bookings on Feb 2: ${bookings.length}`)
                     bookings.forEach(b => {
                            console.log(`   - Court ${b.courtId}: ${new Date(b.startTime).toLocaleTimeString()}`)
                     })
                     console.log()

                     // 6. Simulate serialization
                     console.log('6. Testing serialization...')
                     const response = {
                            bookings,
                            courts,
                            config: {
                                   openTime: club.openTime,
                                   closeTime: club.closeTime,
                                   slotDuration: club.slotDuration
                            },
                            clubId,
                            success: true
                     }

                     const jsonStr = JSON.stringify(response)
                     console.log('   ✓ Serialization OK')
                     console.log(`   JSON size: ${jsonStr.length} bytes`)
              }

              console.log('\n✓ All tests passed!')

       } catch (error) {
              console.error('\n✗ Error:', error.message)
              console.error('\nFull error:')
              console.error(error)
       } finally {
              await prisma.$disconnect()
       }
}

testFullFlow()
