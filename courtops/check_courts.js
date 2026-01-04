const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
       console.log('Checking Clubs...')
       const clubs = await prisma.club.findMany()
       console.log('Clubs:', clubs.map(c => ({ id: c.id, name: c.name, slug: c.slug })))

       if (clubs.length > 0) {
              const clubId = clubs[0].id
              console.log(`Checking Courts for Club ${clubs[0].name} (${clubId})...`)
              const courts = await prisma.court.findMany({
                     where: { clubId }
              })
              console.log('Courts:', courts)
       }
}

main()
       .catch(e => {
              console.error(e)
              process.exit(1)
       })
       .finally(async () => {
              await prisma.$disconnect()
       })
