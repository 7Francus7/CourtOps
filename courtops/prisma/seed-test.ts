import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Realistic data pools
const firstNames = ['Juan', 'María', 'Pedro', 'Lucía', 'Carlos', 'Sofía', 'Diego', 'Elena', 'Ricardo', 'Valentina', 'Franco', 'Fabricio', 'Maxi', 'Santi', 'Lucre', 'Toti', 'Gabi', 'Nico', 'Facu', 'Mati']
const lastNames = ['García', 'Rodríguez', 'Pérez', 'López', 'Martínez', 'Sánchez', 'González', 'Gómez', 'Fernández', 'Díaz', 'Offredi', 'Boetti', 'Sosa', 'Rossi', 'Mazza', 'Bianchi', 'Ferrari', 'Esposito', 'Romano']
const categories = ['Bebidas', 'Snacks', 'Accesorios', 'Indumentaria', 'Pelotas']
const productNames = {
       'Bebidas': ['Gatorade Blue', 'Paso de los Toros 500ml', 'Agua Villavicencio', 'Coca Cola 600ml', 'Cerveza Patagonia 24.7', 'Agua con Gas'],
       'Snacks': ['Papas Lay\'s Clásicas', 'Barras de Cereal mix', 'Turrón Arcor', 'Oreo Pack x3', 'Pringles Original small'],
       'Accesorios': ['Overgrip Wilson Pro', 'Protector Bullpadel', 'Muñequera Adidas Black', 'Antivibrador Siux'],
       'Indumentaria': ['Remera CourtOps Tech', 'Short Padel Black', 'Medias Deportivas Blancas'],
       'Pelotas': ['Tubo Penn x3', 'Tubo Head Pro S', 'Tubo Wilson Triniti']
}

function getRandom(arr: any[]) {
       return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
       console.log('🚀 Starting Test Seeding...')

       const clubSlug = 'test-club'

       // 1. Create/Update Test Club
       const club = await prisma.club.upsert({
              where: { slug: clubSlug },
              update: {
                     plan: 'PRO',
                     hasKiosco: true,
                     hasAdvancedReports: true
              },
              create: {
                     name: 'Club de Prueba CourtOps',
                     slug: clubSlug,
                     openTime: '08:00',
                     closeTime: '01:00',
                     slotDuration: 90,
                     plan: 'PRO',
                     hasKiosco: true,
                     hasAdvancedReports: true,
                     courts: {
                            create: [
                                   { name: 'Pista Panorámica', sortOrder: 1, sport: 'PADEL', duration: 90, isIndoor: true },
                                   { name: 'Pista Azul Central', sortOrder: 2, sport: 'PADEL', duration: 90 },
                                   { name: 'Pista 3 Master', sortOrder: 3, sport: 'PADEL', duration: 90 }
                            ]
                     }
              }
       })

       const courts = await prisma.court.findMany({ where: { clubId: club.id } })

       // 2. Create Clients
       console.log('👥 Creating clients...')
       for (let i = 0; i < 20; i++) {
              const name = `${getRandom(firstNames)} ${getRandom(lastNames)}`
              await prisma.client.upsert({
                     where: { clubId_phone: { clubId: club.id, phone: `11${Math.floor(10000000 + Math.random() * 90000000)}` } },
                     update: {},
                     create: {
                            clubId: club.id,
                            name,
                            phone: `11${Math.floor(10000000 + Math.random() * 90000000)}`,
                            email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
                            membershipStatus: Math.random() > 0.7 ? 'ACTIVE' : 'NONE',
                            category: getRandom(['7ma', '6ta', '5ta', '4ta'])
                     }
              })
       }
       const clients = await prisma.client.findMany({ where: { clubId: club.id } })

       // 3. Create Products
       console.log('🛍️ Creating products...')
       for (const cat of categories) {
              const items = productNames[cat as keyof typeof productNames]
              for (const name of items) {
                     const isLowStock = Math.random() > 0.8
                     await prisma.product.upsert({
                            where: { id_clubId: { id: 0, clubId: club.id }, name: name }, // Name is not unique but we use name for finding in this loop
                            update: {
                                   stock: isLowStock ? 2 : 25,
                                   minStock: 5
                            },
                            create: {
                                   clubId: club.id,
                                   name,
                                   category: cat,
                                   cost: 500 + Math.random() * 2000,
                                   price: 1500 + Math.random() * 5000,
                                   memberPrice: 1200 + Math.random() * 4000,
                                   stock: isLowStock ? 2 : 25,
                                   minStock: 5,
                                   isActive: true
                            }
                     }).catch(() => { /* skip duplicates if name loop hits same product */ })
              }
       }
       const products = await prisma.product.findMany({ where: { clubId: club.id } })

       // 4. Create Bookings (Past and Future)
       console.log('📅 Creating bookings...')
       const now = new Date()
       for (let day = -15; day < 7; day++) {
              const date = new Date(now)
              date.setDate(now.getDate() + day)

              // Parallel bookings for each court
              for (const court of courts) {
                     // 3 bookings per court per day
                     for (let h = 0; h < 3; h++) {
                            const startTime = new Date(date)
                            startTime.setHours(17 + (h * 1.5), 0, 0, 0)
                            const endTime = new Date(startTime)
                            endTime.setMinutes(startTime.getMinutes() + 90)

                            if (Math.random() > 0.3) { // 70% occupancy
                                   const client = getRandom(clients)
                                   await prisma.booking.create({
                                          data: {
                                                 clubId: club.id,
                                                 courtId: court.id,
                                                 clientId: client.id,
                                                 startTime,
                                                 endTime,
                                                 price: 8000 + (Math.random() * 4000),
                                                 status: day < 0 ? 'COMPLETED' : 'CONFIRMED',
                                                 paymentStatus: day < 0 ? 'PAID' : 'PENDING',
                                                 paymentMethod: day < 0 ? 'CASH' : null
                                          }
                                   })
                            }
                     }
              }
       }

       // 5. Create Transactions (Kiosk Sales)
       console.log('💰 Creating Kiosk transactions...')
       const register = await prisma.cashRegister.create({
              data: {
                     clubId: club.id,
                     status: 'OPEN',
                     startAmount: 5000,
                     date: now
              }
       })

       for (let i = 0; i < 30; i++) {
              const client = Math.random() > 0.5 ? getRandom(clients) : null
              const numItems = Math.floor(Math.random() * 4) + 1
              let subtotal = 0
              const items = []

              for (let j = 0; j < numItems; j++) {
                     const prod = getRandom(products)
                     const qty = 1
                     const price = (client?.membershipStatus === 'ACTIVE' && prod.memberPrice) ? prod.memberPrice : prod.price
                     subtotal += price * qty
                     items.push({
                            productId: prod.id,
                            quantity: qty,
                            unitPrice: price,
                            subtotal: price * qty
                     })
              }

              await prisma.transaction.create({
                     data: {
                            clubId: club.id,
                            cashRegisterId: register.id,
                            clientId: client?.id,
                            type: 'INCOME',
                            category: 'KIOSKO',
                            amount: subtotal,
                            method: getRandom(['CASH', 'TRANSFER', 'DEBIT']),
                            description: 'Venta de Kiosco Simulada',
                            items: {
                                   create: items
                            }
                     }
              })
       }

       console.log('✨ Seed Finalizado para Club de Prueba.')
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
