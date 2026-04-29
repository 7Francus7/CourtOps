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
                     closeTime: '01:00',
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
                     password: await hash('123456', 12),
                     role: 'ADMIN',
                     clubId: matchClub.id
              }
       })

       // 5. Platform Plans
       const plans = [
              {
                     name: 'Arranque',
                     price: 45000,
                     setupFee: 100000,
                     features: JSON.stringify([
                            'Hasta 2 canchas de padel',
                            'Hasta 3 empleados en el sistema',
                            'Reservas online (link público)',
                            'Turnero digital en tiempo real',
                            'Caja diaria (apertura y cierre)',
                            'QR Check-in',
                            'Soporte por email L-V'
                     ]),
              },
              {
                     name: 'Élite',
                     price: 89000,
                     setupFee: 100000,
                     features: JSON.stringify([
                            'Hasta 8 canchas de padel',
                            'Hasta 10 empleados en el sistema',
                            'Todo lo del plan Arranque',
                            'Kiosco / Punto de venta con stock',
                            'Pagos online con MercadoPago',
                            'Notificaciones WhatsApp automáticas',
                            'Gestión de torneos y brackets',
                            'Waivers digitales (firma electrónica)',
                            'Reportes financieros avanzados',
                            'Soporte prioritario WhatsApp 24/7'
                     ]),
              },
              {
                     name: 'VIP',
                     price: 129000,
                     setupFee: 100000,
                     features: JSON.stringify([
                            'Canchas ilimitadas',
                            'Usuarios ilimitados',
                            'Todo lo del plan Élite',
                            'Dominio personalizado (ej: tuclub.com)',
                            'Gestor de cuenta dedicado'
                     ]),
              }
       ]

       for (const plan of plans) {
              await prisma.platformPlan.upsert({
                     where: { name: plan.name },
                     update: {
                            price: plan.price,
                            setupFee: plan.setupFee,
                            features: plan.features
                     },
                     create: {
                            name: plan.name,
                            price: plan.price,
                            setupFee: plan.setupFee,
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
