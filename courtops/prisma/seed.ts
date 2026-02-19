import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
       console.log('Seeding database...')

       const alfaPassword = await hash('alfa1234', 12)
       const godPassword = await hash('123456franco', 12)

       // 1. Ensure Alfa Padel Club exists
       const alfaClub = await prisma.club.upsert({
              where: { slug: 'alfa-padel' },
              update: {},
              create: {
                     name: 'Alfa Padel',
                     slug: 'alfa-padel',
                     openTime: '08:00',
                     closeTime: '01:00', // Extend to 01:00 AM
                     slotDuration: 90,
                     courts: {
                            create: [
                                   { name: 'CANCHA 1', sortOrder: 1, sport: 'PADEL', duration: 90 },
                                   { name: 'CANCHA 2', sortOrder: 2, sport: 'PADEL', duration: 90 },
                                   { name: 'CANCHA 3', sortOrder: 3, sport: 'PADEL', duration: 90 }
                            ]
                     }
              }
       })

       // 2. Ensure Alfa User exists
       await prisma.user.upsert({
              where: { email: 'alfa@courtops.com' },
              update: {
                     password: alfaPassword,
                     clubId: alfaClub.id,
                     role: 'OWNER'
              },
              create: {
                     email: 'alfa@courtops.com',
                     name: 'Fabricio Offredi',
                     password: alfaPassword,
                     role: 'OWNER',
                     clubId: alfaClub.id
              }
       })

       // 3. User God Mode: dellorsif@gmail.com
       await prisma.user.upsert({
              where: { email: 'dellorsif@gmail.com' },
              update: { password: godPassword },
              create: {
                     email: 'dellorsif@gmail.com',
                     name: 'Franco Admin',
                     password: godPassword,
                     role: 'GOD'
              }
       })

       // 4. Admin user for recovery
       await prisma.user.upsert({
              where: { email: 'admin@courtops.com' },
              update: {},
              create: {
                     email: 'admin@courtops.com',
                     name: 'Admin CourtOps',
                     password: await hash('admin1234', 12),
                     role: 'GOD'
              }
       })

       // 4.5 Ensure Match Point Club exists
       const matchClub = await prisma.club.upsert({
              where: { slug: 'match-point' },
              update: {},
              create: {
                     name: 'Match Point',
                     slug: 'match-point',
                     openTime: '14:00',
                     closeTime: '00:00',
                     slotDuration: 60,
                     courts: {
                            create: [
                                   { name: 'Court A', sortOrder: 1, sport: 'FOOTBALL', duration: 60 },
                                   { name: 'Court B', sortOrder: 2, sport: 'PADEL', duration: 90 }
                            ]
                     }
              }
       })

       // Ensure Match User exists and is linked
       await prisma.user.upsert({
              where: { email: 'match@courtops.com' },
              update: {
                     clubId: matchClub.id,
                     role: 'ADMIN'
              },
              create: {
                     email: 'match@courtops.com',
                     name: 'Maxi Boetti',
                     password: await hash('match1234', 12),
                     role: 'ADMIN',
                     clubId: matchClub.id
              }
       })

       // 5. Platform Plans
       const plans = [
              {
                     name: 'Inicial',
                     price: 45000,
                     features: JSON.stringify(['Hasta 2 Canchas', 'Turnero Digital', 'Caja Básica', 'Soporte por Email']),
              },
              {
                     name: 'Profesional',
                     price: 85000,
                     features: JSON.stringify(['Hasta 8 Canchas', 'Punto de Venta (Kiosco)', 'Gestión de Torneos', 'Control de Stock', 'Reportes Avanzados', 'Soporte WhatsApp']),
              },
              {
                     name: 'Empresarial',
                     price: 150000,
                     features: JSON.stringify(['Canchas Ilimitadas', 'Gestión Multi-Sede', 'Gestión de Torneos', 'API Access', 'Roles de Empleado', 'Soporte Prioritario 24/7']),
              }
       ]

       for (const plan of plans) {
              await prisma.platformPlan.upsert({
                     where: { name: plan.name },
                     update: {
                            price: plan.price,
                            features: plan.features
                     },
                     create: {
                            name: plan.name,
                            price: plan.price,
                            features: plan.features
                     }
              })
       }

       console.log('Seeding finished successfully.')
}

main()
       .then(async () => {
              await prisma.$disconnect()
       })
       .catch(async (e) => {
              console.error(e)
              await prisma.$disconnect()
              process.exit(1)
       })
