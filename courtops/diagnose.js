const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
       console.log('=== CourtOps Diagnosis ===\n')

       try {
              // 1. Check connection
              console.log('1. Testing database connection...')
              await prisma.$queryRaw`SELECT 1`
              console.log('   ✓ Database connected\n')

              // 2. Check clubs
              console.log('2. Checking clubs...')
              const clubs = await prisma.club.findMany({ take: 5 })
              console.log(`   Found ${clubs.length} clubs`)
              clubs.forEach(c => {
                     console.log(`   - ${c.name} (${c.id})`)
              })
              console.log()

              if (clubs.length === 0) {
                     console.log('   ⚠ No clubs found. This is the issue!')
                     console.log('   → Dashboard cannot load without a club\n')
              } else {
                     const clubId = clubs[0].id
                     console.log(`3. Using first club: ${clubId}\n`)

                     // 3. Check courts for this club
                     console.log('4. Checking courts...')
                     const courts = await prisma.court.findMany({
                            where: { clubId, isActive: true }
                     })
                     console.log(`   Found ${courts.length} active courts\n`)

                     // 4. Check bookings
                     console.log('5. Checking bookings...')
                     const today = new Date()
                     const start = new Date(today)
                     start.setHours(0, 0, 0, 0)
                     const end = new Date(today)
                     end.setHours(23, 59, 59, 999)

                     const bookings = await prisma.booking.findMany({
                            where: {
                                   clubId,
                                   status: { not: 'CANCELED' },
                                   startTime: { gte: start, lte: end }
                            }
                     })
                     console.log(`   Found ${bookings.length} bookings for today\n`)

                     // 5. Check transactions
                     console.log('6. Checking transactions...')
                     const transactions = await prisma.transaction.findMany({
                            where: { createdAt: { gte: start, lte: end } },
                            take: 5
                     })
                     console.log(`   Found ${transactions.length} transactions today\n`)

                     // 6. Check users
                     console.log('7. Checking users...')
                     const users = await prisma.user.findMany({
                            where: { clubId },
                            take: 5
                     })
                     console.log(`   Found ${users.length} users for this club`)
                     users.forEach(u => {
                            console.log(`   - ${u.email} (${u.name})`)
                     })
              }

              console.log('\n✓ Diagnosis complete')
       } catch (error) {
              console.error('\n✗ Error during diagnosis:')
              console.error(error.message)
       } finally {
              await prisma.$disconnect()
       }
}

main()
