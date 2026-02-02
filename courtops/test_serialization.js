const { PrismaClient } = require('@prisma/client')

/**
 * Ultra-safe serializer for Next.js 16 Server Actions
 * Handles: Dates, BigInt, Decimal, undefined, circular references, etc.
 */
function ultraSafeSerialize(data) {
       return serializeRecursive(data, new WeakSet())
}

function serializeRecursive(value, visited) {
       // Primitives
       if (value === null || value === undefined) {
              return null
       }

       if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              return value
       }

       if (typeof value === 'bigint') {
              return value.toString()
       }

       if (typeof value === 'function') {
              return undefined // Functions cannot be serialized
       }

       if (typeof value === 'symbol') {
              return value.toString()
       }

       // Objects
       if (typeof value === 'object') {
              // Dates
              if (value instanceof Date) {
                     return value.toISOString()
              }

              // Decimal (Prisma)
              if (value && typeof value.toFixed === 'function' && typeof value.toNumber === 'function') {
                     return value.toNumber()
              }
              if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'Decimal') {
                     return Number(value.toString())
              }

              // Prevent circular references
              if (visited.has(value)) {
                     return '[Circular Reference]'
              }
              visited.add(value)

              // Arrays
              if (Array.isArray(value)) {
                     return value.map(v => serializeRecursive(v, visited))
              }

              // Regular objects
              const result = {}
              for (const [key, val] of Object.entries(value)) {
                     result[key] = serializeRecursive(val, visited)
              }
              return result
       }

       return value
}

async function testSerialization() {
       const prisma = new PrismaClient()

       try {
              console.log('Testing serialization...\n')

              const clubId = 'e316a936-1f0b-412d-88d5-b4c18bd3aeee'
              
              // Get real data from DB
              const courts = await prisma.court.findMany({
                     where: { clubId, isActive: true }
              })

              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { openTime: true, closeTime: true, slotDuration: true, timezone: true }
              })

              const bookings = await prisma.booking.findMany({
                     where: { clubId, status: { not: 'CANCELED' } },
                     take: 2,
                     include: {
                            client: { select: { id: true, name: true, phone: true } },
                            items: { include: { product: true } },
                            transactions: true
                     }
              })

              console.log('Raw data retrieved from DB:')
              console.log('- Courts:', courts.length)
              console.log('- Bookings:', bookings.length)
              console.log()

              const config = {
                     openTime: club?.openTime || '09:00',
                     closeTime: club?.closeTime || '00:00',
                     slotDuration: club?.slotDuration || 90
              }

              const response = {
                     bookings,
                     courts,
                     config,
                     clubId,
                     success: true
              }

              console.log('Before serialization:')
              console.log('- Response object created')
              console.log()

              console.log('Attempting serialization...')
              const serialized = ultraSafeSerialize(response)
              console.log('✓ Serialization successful!')
              console.log()

              console.log('Serialized data:')
              console.log('- Courts:', serialized.courts.length)
              console.log('- Bookings:', serialized.bookings.length)
              console.log('- Config:', serialized.config)
              console.log('- Success:', serialized.success)
              console.log()

              // Try to JSON.stringify it
              console.log('Attempting JSON.stringify...')
              const jsonStr = JSON.stringify(serialized)
              console.log('✓ JSON.stringify successful!')
              console.log('JSON length:', jsonStr.length)

       } catch (error) {
              console.error('✗ Error:', error.message)
              console.error('Stack:', error.stack)
       } finally {
              await prisma.$disconnect()
       }
}

testSerialization()
