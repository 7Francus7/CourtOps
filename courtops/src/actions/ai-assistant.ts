'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export type AiMessage = {
       role: 'user' | 'assistant'
       content: string
}

// Helper para obtener fechas relativas
function getRelativeDate(text: string): Date {
       const needsTomorrow = text.includes('mañana')
       const date = new Date()

       if (needsTomorrow) {
              date.setDate(date.getDate() + 1)
       }

       // Resetear horas para comparaciones de día completo
       date.setHours(0, 0, 0, 0)
       return date
}

// Helper para extraer hora (ej: "19", "19hs", "19:00")
function extractHour(text: string): number | null {
       const match = text.match(/(\d{1,2})(?::00)?(?:\s?hs)?/i)
       if (match) {
              const hour = parseInt(match[1])
              if (hour >= 0 && hour <= 23) return hour
       }
       return null
}

export async function processAiRequest(message: string): Promise<string> {
       const session = await getServerSession(authOptions)

       if (!session?.user?.clubId) {
              return "No puedo verificar tu identidad. Por favor recarga la página."
       }

       const clubId = session.user.clubId
       const msg = message.toLowerCase()

       // --- 1. BIENVENIDA / AYUDA ---
       if (msg.includes('hola') || msg.includes('ayuda') || msg === 'menu') {
              return `¡Hola ${session.user.name?.split(' ')[0] || ''}! Soy tu asistente (Modo Gratuito).
    
Puedo ayudarte con esto (escribe tal cual):
📅 *Reservas:* "¿Hay cancha libre mañana a las 19?"
💰 *Caja:* "¿Cuánto facturé hoy?"
search *Clientes:* "Buscar a Juan" o "¿Cuándo juega Pedro?"
alert *Deudas:* "¿Quién debe?"
🏷️ *Precios:* "¿Precio de la cancha?"`
       }

       // --- 2. CONSULTAR DISPONIBILIDAD ---
       if (msg.includes('libre') || msg.includes('disponible') || msg.includes('hay lugar') || msg.includes('hay cancha')) {
              const date = getRelativeDate(msg)
              const hour = extractHour(msg)

              // Si la fecha es invalida, default a hoy
              const context = msg.includes('mañana') ? 'mañana' : 'hoy'

              // Si pide una hora específica
              if (hour !== null) {
                     // Buscar reservas existentes en esa hora
                     const start = new Date(date)
                     start.setHours(hour, 0, 0, 0)
                     const end = new Date(date)
                     end.setHours(hour, 59, 59, 999)

                     const bookings = await prisma.booking.findMany({
                            where: {
                                   clubId,
                                   startTime: { gte: start, lte: end },
                                   status: { not: 'CANCELED' }
                            },
                            select: { courtId: true }
                     })

                     const allCourts = await prisma.court.findMany({
                            where: { clubId, isActive: true },
                            select: { id: true, name: true }
                     })

                     const occupiedCourtIds = bookings.map(b => b.courtId)
                     const freeCourts = allCourts.filter(c => !occupiedCourtIds.includes(c.id))

                     if (freeCourts.length > 0) {
                            return `✅ Sí, para ${context} a las ${hour}hs tienes **${freeCourts.length} canchas libres**:
${freeCourts.map(c => `• ${c.name}`).join('\n')}`
                     } else {
                            return `❌ No hay canchas disponibles ${context} a las ${hour}hs.`
                     }
              }

              // Si es disponibilidad general del día (resumen simple)
              const startOfDay = new Date(date)
              startOfDay.setHours(0, 0, 0, 0)
              const endOfDay = new Date(date)
              endOfDay.setHours(23, 59, 59, 999)

              const count = await prisma.booking.count({
                     where: {
                            clubId,
                            startTime: { gte: startOfDay, lte: endOfDay },
                            status: { not: 'CANCELED' }
                     }
              })

              return `Para ${context} tienes **${count} reservas** confirmadas en total. 
    
Para ver huecos específicos, pregúntame por una hora. Ej: "¿Hay cancha a las 18?"`
       }

       // --- 3. BUSCAR CLIENTE / TELEFONO ---
       if (msg.includes('buscar a') || msg.includes('telefono de') || msg.includes('datos de')) {
              const searchName = msg.replace('buscar a', '').replace('telefono de', '').replace('datos de', '').trim()

              if (searchName.length < 3) return "Por favor escribe un nombre más largo para buscar."

              const clients = await prisma.client.findMany({
                     where: {
                            clubId,
                            name: { contains: searchName, mode: 'insensitive' }
                     },
                     take: 3
              })

              if (clients.length === 0) return `No encontré ningún cliente llamado "${searchName}".`

              return `Encontré estos clientes:
${clients.map(c => `👤 **${c.name}**\n📞 ${c.phone || 'Sin teléfono'}\n`).join('\n')}`
       }

       // --- 4. CUÁNDO JUEGA ALGUIEN ---
       if (msg.includes('cuando juega') || msg.includes('cuándo juega') || msg.includes('reserva de')) {
              const searchName = msg.replace('cuando juega', '').replace('cuándo juega', '').replace('reserva de', '').trim()

              const clients = await prisma.client.findMany({
                     where: { clubId, name: { contains: searchName, mode: 'insensitive' } },
                     select: { id: true }
              })

              const clientIds = clients.map(c => c.id)

              if (clientIds.length === 0) return `No encontré al cliente "${searchName}".`

              const nextBooking = await prisma.booking.findFirst({
                     where: {
                            clubId: clubId, // Fixed explicit clubId assignment
                            clientId: { in: clientIds.map(id => id!) }, // Ensure non-null IDs
                            startTime: { gte: new Date() },
                            status: { not: 'CANCELED' }
                     },
                     orderBy: { startTime: 'asc' },
                     include: {
                            client: true,
                            court: true // Ensure relations are included
                     }
              })

              if (!nextBooking) return `"${searchName}" no tiene próximas reservas agendadas.`

              const dateStr = nextBooking.startTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              return `🎾 **${nextBooking.client?.name || 'Cliente'}** juega el:
🗓️ ${dateStr}
📍 ${nextBooking.court?.name || 'Cancha'}`
       }

       // --- 5. CAJA / FACTURACIÓN ---
       if (msg.includes('facturado') || msg.includes('ganancias') || msg.includes('caja')) {
              const start = new Date()
              start.setHours(0, 0, 0, 0)

              const transactions = await prisma.transaction.aggregate({
                     where: {
                            cashRegister: {
                                   clubId,
                                   date: { gte: start }
                            }
                     },
                     _sum: { amount: true }
              })

              const total = transactions._sum.amount || 0
              return `💰 La caja de hoy acumula: **$${total.toLocaleString('es-AR')}**`
       }

       // --- 6. DEUDAS ---
       if (msg.includes('deben') || msg.includes('deuda') || msg.includes('sin pagar')) {
              const unpaid = await prisma.booking.findMany({
                     where: {
                            clubId,
                            paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
                            status: 'CONFIRMED'
                     },
                     take: 5,
                     include: { client: true }
              })

              if (unpaid.length === 0) return "¡Excelente! No hay reservas impagas pendientes."

              return `⚠️ Últimas 5 reservas con deuda:
${unpaid.map(b => `• ${b.client?.name || 'Cliente Casual'} ($${b.price})`).join('\n')}`
       }

       // --- 7. PRECIOS (Simple fetch del primer precio encontrado o rango) ---
       if (msg.includes('precio') || msg.includes('cuanto sale') || msg.includes('cuánto sale')) {
              const prices = await prisma.priceRule.findMany({
                     where: { clubId },
                     take: 1,
                     orderBy: { price: 'asc' } // Tomar el más barato como referencia
              })

              if (prices.length > 0) {
                     return `El precio base ronda los **$${prices[0].price}**.
Depende del horario y día. Puedes ver la tabla completa en Configuración > Precios.`
              }
              return "No tienes precios configurados aún."
       }

       // --- DEFAULT ---
       return "🤔 No entendí eso. Prueba con:\n- 'Disponibilidad mañana a las 19'\n- 'Buscar a Juan'\n- 'Caja de hoy'\n- 'Deudas'"
}
