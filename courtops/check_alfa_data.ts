import prisma from './src/lib/db'

async function main() {
       console.log('--- DB CHECK START ---')
       const user = await prisma.user.findUnique({
              where: { email: 'alfa@courtops.com' },
              include: { club: true }
       })

       if (!user) {
              console.log('User alfa@courtops.com not found')
              return
       }

       console.log('User found:', user.email, 'ClubID:', user.clubId, 'Club Name:', user.club?.name)

       const courts = await prisma.court.findMany({
              where: { clubId: user.clubId! }
       })
       console.log('Courts found:', courts.map(c => c.name).join(', '))

       const now = new Date()
       const startOfToday = new Date(now)
       startOfToday.setHours(0, 0, 0, 0)
       const endOfToday = new Date(now)
       endOfToday.setHours(23, 59, 59, 999)

       const bookings = await prisma.booking.findMany({
              where: {
                     clubId: user.clubId!,
                     startTime: {
                            gte: startOfToday,
                            lte: endOfToday
                     }
              },
              include: { client: true, court: true }
       })

       console.log(`Bookings for today (${startOfToday.toISOString().split('T')[0]}):`, bookings.length)
       bookings.forEach(b => {
              console.log(`- ID: ${b.id}, Time: ${b.startTime.toISOString()}, Court: ${b.court.name}, Client: ${b.client?.name}, Status: ${b.status}`)
       })

       const allBookingsCount = await prisma.booking.count({ where: { clubId: user.clubId! } })
       console.log('Total bookings for this club:', allBookingsCount)

       console.log('--- DB CHECK END ---')
}

main().catch(console.error).finally(() => prisma.$disconnect())
