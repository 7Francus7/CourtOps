const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
       try {
              console.log('Searching for Maxi Boetti user...\n')
              
              const users = await prisma.user.findMany()
              console.log('All users in database:')
              users.forEach(u => {
                     console.log(`- Email: ${u.email}`)
                     console.log(`  Name: ${u.name}`)
                     console.log(`  Club: ${u.clubId}`)
                     console.log()
              })

              console.log('\nSearching for "dellorsif@gmail.com"...')
              const delloUser = await prisma.user.findUnique({
                     where: { email: 'dellorsif@gmail.com' }
              })
              
              if (delloUser) {
                     console.log('Found:', delloUser)
              } else {
                     console.log('Not found')
              }

              console.log('\nLooking at "Match Point" club (the second one)...')
              const matchPoint = await prisma.club.findUnique({
                     where: { id: 'e316a936-1f0b-412d-88d5-b4c18bd3aeee' },
                     include: { users: true }
              })
              
              if (matchPoint) {
                     console.log('Club:', matchPoint.name)
                     console.log('Users:', matchPoint.users.map(u => `${u.email} (${u.name})`))
              }

       } catch (error) {
              console.error('Error:', error.message)
       } finally {
              await prisma.$disconnect()
       }
}

main()
