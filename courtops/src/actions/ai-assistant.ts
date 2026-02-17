'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export type AiMessage = {
       role: 'user' | 'assistant'
       content: string
}

export async function processAiRequest(message: string): Promise<string> {
       const session = await getServerSession(authOptions)

       if (!session?.user?.clubId) {
              return "No puedo verificar tu identidad. Por favor recarga la página."
       }

       const clubId = session.user.clubId
       const msg = message.toLowerCase()

       // 1. GREETINGS
       if (msg.includes('hola') || msg.includes('buenos dias') || msg.includes('buenas tardes')) {
              return `¡Hola ${session.user.name?.split(' ')[0] || ''}! Soy tu asistente de CourtOps. ¿En qué puedo ayudarte hoy? 
    
Puedo informarte sobre:
• El estado de la ocupación hoy
• Cuánto facturaste esta semana
• Clientes con deuda
• Crear un bloqueo de pista (próximamente)`
       }

       // 2. OCCUPATION / BOOKINGS TODAY
       if (msg.includes('ocupacion') || msg.includes('ocupación') || msg.includes('reservas huy') || msg.includes('reservas hoy') || msg.includes('agenda')) {
              const start = new Date()
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setHours(23, 59, 59, 999)

              const bookings = await prisma.booking.count({
                     where: {
                            clubId,
                            startTime: { gte: start, lte: end },
                            status: { not: 'CANCELED' }
                     }
              })

              const totalCourts = await prisma.court.count({
                     where: { clubId, isActive: true }
              })

              // Asumiendo 10 turnos por cancha aprox
              const totalSlots = totalCourts * 10
              const occupancy = Math.round((bookings / totalSlots) * 100)

              return `Hoy tienes **${bookings} reservas** confirmadas.
    
Esto representa aproximadamente un **${occupancy}% de ocupación**. 
¿Quieres que revise si hay huecos libres para promocionar?`
       }

       // 3. REVENUE
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
                     _sum: {
                            amount: true
                     }
              })

              const total = transactions._sum.amount || 0
              return `La caja del día de hoy acumula un total de **$${total.toLocaleString('es-AR')}**.
    
Recuerda que esto incluye efectivo y transferencias registradas en el sistema.`
       }

       // 4. DEBTORS OR OUTSTANDING
       if (msg.includes('deben') || msg.includes('deuda') || msg.includes('sin pagar')) {
              const unpaid = await prisma.booking.count({
                     where: {
                            clubId,
                            paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
                            status: 'CONFIRMED'
                     }
              })

              return `Actualmente tienes **${unpaid} reservas** con pagos pendientes o parciales.
     
¿Te gustaría ver la lista detallada en la sección de reportes?`
       }

       // 5. HELP/DEFAULT
       return "Entiendo, pero aún estoy aprendiendo a procesar esa solicitud específica. \n\nPrueba preguntándome sobre:\n- Reservas de hoy\n- Estado de la caja\n- Ocupación actual"
}
