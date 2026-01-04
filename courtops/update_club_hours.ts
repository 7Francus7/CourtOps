
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
       console.log('Updating Club Hours to 08:00 - 23:30 (Scalable Fix)...')

       const clubs = await prisma.club.findMany()
       if (clubs.length === 0) {
              console.log('No clubs found.')
              return
       }

       const clubId = clubs[0].id
       console.log(`Updating Club ID: ${clubId}`)

       const updated = await prisma.club.update({
              where: { id: clubId },
              data: {
                     openTime: '08:00',
                     closeTime: '23:30' // Ensuring it covers late night
              }
       })

       console.log('Club updated:', updated)
}

main()
       .catch(e => {
              console.error(e)
              process.exit(1)
       })
       .finally(async () => {
              await prisma.$disconnect()
       })
