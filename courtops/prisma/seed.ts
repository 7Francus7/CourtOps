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
                     closeTime: '23:30',
                     slotDuration: 90,
                     courts: {
                            create: [
                                   { name: 'CANCHA 1', sortOrder: 1 },
                                   { name: 'CANCHA 2', sortOrder: 2 },
                                   { name: 'CANCHA 3', sortOrder: 3 }
                            ]
                     }
              }
       })

       // 2. Ensure Alfa User exists
       await prisma.user.upsert({
              where: { email: 'alfa@courtops.com' },
              update: { password: alfaPassword },
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

       // 5. Platform Plans
       const plans = [
              {
                     name: 'Plan Inicial',
                     price: 35000,
                     setupFee: 200000,
                     features: JSON.stringify(['Hasta 2 canchas', 'Gestión de Turnos', '1 Mes de Mantenimiento Gratis', 'Soporte Básico']),
              },
              {
                     name: 'Plan Profesional',
                     price: 50000,
                     setupFee: 300000,
                     features: JSON.stringify(['Hasta 10 canchas', 'Kiosco / Punto de Venta', 'Reportes Avanzados', '1 Mes de Mantenimiento Gratis', 'Soporte Prioritario']),
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
