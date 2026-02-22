'use server'

import prisma from '@/lib/db'
import { createSafeAction } from '@/lib/safe-action'
import { format, startOfDay, endOfDay, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export type AiResponse = {
       content: string
       intent: 'AVAILABILITY' | 'FINANCE' | 'CLIENTS' | 'DEBTS' | 'PRICES' | 'GENERAL'
       data?: any
       suggestions?: string[]
}

export type AiMessage = {
       role: 'user' | 'assistant'
       content: string
       intent?: AiResponse['intent']
       suggestions?: string[]
}

export const processAiRequest = createSafeAction(async ({ clubId }, query: string): Promise<AiResponse> => {
       const lowerQuery = query.toLowerCase().trim()

       if (!lowerQuery) {
              return {
                     content: "Hola! Soy tu asistente CourtOps. ¿En qué puedo ayudarte?",
                     intent: 'GENERAL',
                     suggestions: ["¿Cuánto recaudamos hoy?", "Disponibilidad para mañana"]
              }
       }

       // 1. Intent Detection
       let intent: AiResponse['intent'] = 'GENERAL'
       if (lowerQuery.includes('disponible') || lowerQuery.includes('turno') || lowerQuery.includes('libre') || lowerQuery.includes('cancha')) intent = 'AVAILABILITY'
       else if (lowerQuery.includes('ganancia') || lowerQuery.includes('recaudado') || lowerQuery.includes('caja') || lowerQuery.includes('dinero') || lowerQuery.includes('ventas')) intent = 'FINANCE'
       else if (lowerQuery.includes('cliente') || lowerQuery.includes('persona') || lowerQuery.includes('jugador')) intent = 'CLIENTS'
       else if (lowerQuery.includes('debe') || lowerQuery.includes('deuda') || lowerQuery.includes('pagar') || lowerQuery.includes('pendiente')) intent = 'DEBTS'
       else if (lowerQuery.includes('precio') || lowerQuery.includes('cuanto vale') || lowerQuery.includes('costo') || lowerQuery.includes('tarifa')) intent = 'PRICES'

       // 2. Date Detection (Simplified)
       const today = new Date()
       let targetDate = today
       if (lowerQuery.includes('mañana')) {
              targetDate = new Date()
              targetDate.setDate(today.getDate() + 1)
       }

       // 3. Logic per Intent
       switch (intent) {
              case 'AVAILABILITY': {
                     const courts = await prisma.court.count({ where: { clubId, isActive: true } })
                     const bookingsCount = await prisma.booking.count({
                            where: {
                                   clubId,
                                   startTime: { gte: startOfDay(targetDate), lte: endOfDay(targetDate) },
                                   status: { not: 'CANCELED' }
                            }
                     })

                     const isToday = isSameDay(targetDate, today)
                     const dateText = isToday ? "hoy" : format(targetDate, "EEEE d 'de' MMMM", { locale: es })

                     const content = `Para ${dateText}, tienes **${courts} canchas** configuradas y **${bookingsCount} turnos** ya reservados. ` +
                            (bookingsCount < courts * 5 ? "¡Tienes mucha disponibilidad todavía! 🎾" : "El día parece estar bastante concurrido.")

                     return {
                            content,
                            intent,
                            data: { courtCount: courts, bookingCount: bookingsCount },
                            suggestions: ["Ver Turnero", "Crear Reservación"]
                     }
              }

              case 'FINANCE': {
                     const transactions = await prisma.transaction.findMany({
                            where: {
                                   booking: { clubId },
                                   createdAt: { gte: startOfDay(today) }
                            }
                     })
                     const total = transactions.reduce((sum, t) => sum + t.amount, 0)

                     return {
                            content: `Hoy se han recaudado **$${total.toLocaleString('es-AR')}** en caja. Se registraron ${transactions.length} movimientos de cobro hasta ahora. 💰`,
                            intent,
                            suggestions: ["Ir a Caja", "Ver Reportes"]
                     }
              }

              case 'CLIENTS': {
                     const totalClients = await prisma.client.count({ where: { clubId } })

                     // Basic name matching if query is longer
                     let extraInfo = ""
                     if (lowerQuery.length > 15) {
                            const words = lowerQuery.split(' ')
                            const namePart = words.slice(-1)[0]
                            const specificClient = await prisma.client.findFirst({
                                   where: { clubId, name: { contains: namePart, mode: 'insensitive' } }
                            })
                            if (specificClient) {
                                   extraInfo = `\n\nHe encontrado a **${specificClient.name}** (${specificClient.phone || 'sin teléfono'}).`
                            }
                     }

                     return {
                            content: `Tienes un total de **${totalClients} clientes** registrados en tu base de datos.${extraInfo}`,
                            intent,
                            suggestions: ["Ver Clientes", "Registrar Cliente"]
                     }
              }

              case 'DEBTS': {
                     const debtors = await prisma.booking.findMany({
                            where: {
                                   clubId,
                                   paymentStatus: { in: ['UNPAID', 'PARTIAL'] },
                                   status: 'CONFIRMED'
                            },
                            include: { client: true },
                            take: 5
                     })

                     if (debtors.length > 0) {
                            return {
                                   content: `Tienes **${debtors.length} turnos** con pagos pendientes. Clientes con deuda reciente: ${debtors.map(d => d.client?.name).join(', ')}.`,
                                   intent,
                                   suggestions: ["Ver Deudas", "Módulo de Clientes"]
                            }
                     }
                     return {
                            content: "¡Excelente! No tienes deudas pendientes registradas en este momento. ✅",
                            intent,
                            suggestions: ["Ver historial de pagos"]
                     }
              }

              case 'PRICES': {
                     const club = await prisma.club.findUnique({ where: { id: clubId }, select: { openTime: true, closeTime: true } })
                     // Assuming a default price exists or we can get it from first court
                     const firstCourt = await prisma.court.findFirst({ where: { clubId } })

                     return {
                            content: `Tus canchas están operando de **${club?.openTime} a ${club?.closeTime}**. Puedes ajustar los precios por hora desde la configuración de cada cancha.`,
                            intent,
                            suggestions: ["Configurar Precios", "Ver Canchas"]
                     }
              }

              default:
                     return {
                            content: "Hola! Soy el asistente inteligente de CourtOps. Puedo ayudarte con información en tiempo real sobre tu club.\n\nPrueba preguntando:\n• *\"¿Cuánto recaudamos hoy?\"*\n• *\"¿Hay canchas para mañana?\"*\n• *\"¿Quiénes deben?\"*",
                            intent: 'GENERAL',
                            suggestions: ["Recaudación de hoy", "Disponibilidad mañana"]
                     }
       }
})
