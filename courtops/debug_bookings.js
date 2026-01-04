const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { startOfDay, endOfDay } = require('date-fns')

async function main() {
       console.log('Checking Bookings for Today (2026-01-04)...')

       const clubs = await prisma.club.findMany()
       if (clubs.length === 0) {
              console.log('No clubs found.')
              return
       }

       const clubId = clubs[0].id
       console.log(`Using Club ID: ${clubId}`)

       // Hardcoded date 2026-01-04
       const date = new Date('2026-01-04T12:00:00') // Noon explicitly
       const start = startOfDay(date)
       const end = endOfDay(date)

       console.log(`Querying between ${start.toISOString()} and ${end.toISOString()}`)

       const bookings = await prisma.booking.findMany({
              where: {
                     clubId,
                     startTime: {
                            gte: start,
                            lte: end
                     },
                     status: {
                            not: 'CANCELED'
                     }
              },
              include: {
                     client: true
              }
       })

       console.log(`Found ${bookings.length} bookings.`)
       bookings.forEach(b => {
              console.log(`- ID: ${b.id}, Court: ${b.courtId}, Start: ${b.startTime.toISOString()}, Status: ${b.status}, Client: ${b.client?.name}`)
       })
}

main()
       .catch(e => {
              console.error(e)
              process.exit(1)
       })
       .finally(async () => {
              await prisma.$disconnect()
       })
