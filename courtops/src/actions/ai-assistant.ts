'use server'

import prisma from '@/lib/db'
import { createSafeAction } from '@/lib/safe-action'
import { format, startOfDay, endOfDay, subDays, isSameDay, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai"

// --- TYPES & INTERFACES ---
export type AiResponse = {
    content: string
    intent: 'AVAILABILITY' | 'FINANCE' | 'CLIENTS' | 'DEBTS' | 'PRICES' | 'GENERAL' | 'ANALYTICS'
    data?: Record<string, unknown>
    suggestions?: string[]
}

export type AiMessage = {
    role: 'user' | 'assistant'
    content: string
    intent?: AiResponse['intent']
    suggestions?: string[]
}

// --- INITIALIZATION ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

// --- TOOLS DEFINITION (FOR THE AI TO FETCH DATA) ---
const tools: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "get_financials",
                description: "Obtiene métricas financieras reales (ingresos, gastos) del club para un rango de fechas. Útil para reportes de ganancias y rentabilidad.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        startDate: { type: SchemaType.STRING, description: "Fecha inicio (YYYY-MM-DD)" },
                        endDate: { type: SchemaType.STRING, description: "Fecha fin (YYYY-MM-DD)" }
                    },
                    required: ["startDate", "endDate"]
                }
            },
            {
                name: "get_occupancy",
                description: "Calcula el porcentaje de ocupación de las canchas en un período. Ayuda a identificar horas muertas o días pico.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        startDate: { type: SchemaType.STRING, description: "Fecha inicio (YYYY-MM-DD)" },
                        endDate: { type: SchemaType.STRING, description: "Fecha fin (YYYY-MM-DD)" }
                    },
                    required: ["startDate", "endDate"]
                }
            },
            {
                name: "get_inactive_clients",
                description: "Lista clientes que no han realizado reservas en los últimos X días. Ideal para campañas de marketing y retención.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        daysInactive: { type: SchemaType.NUMBER, description: "Días sin actividad (ej: 20)" }
                    },
                    required: ["daysInactive"]
                }
            },
            {
                name: "get_popular_slots",
                description: "Identifica los horarios y días más reservados. Útil para estrategias de Precios Dinámicos.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {}
                }
            }
        ]
    }
]

// --- TOOL HANDLERS ---
async function handleToolCall(clubId: string, name: string, args: any) {
    switch (name) {
        case "get_financials": {
            const start = startOfDay(new Date(args.startDate))
            const end = endOfDay(new Date(args.endDate))
            
            const transactions = await prisma.transaction.aggregate({
                where: { clubId, createdAt: { gte: start, lte: end } },
                _sum: { amount: true },
                _count: { id: true }
            })
            
            const income = await prisma.transaction.aggregate({
                where: { clubId, type: 'INCOME', createdAt: { gte: start, lte: end } },
                _sum: { amount: true }
            })

            const expenses = await prisma.transaction.aggregate({
                where: { clubId, type: 'EXPENSE', createdAt: { gte: start, lte: end } },
                _sum: { amount: true }
            })

            return {
                period: `${args.startDate} a ${args.endDate}`,
                total_transactions: transactions._count.id,
                total_income: income._sum.amount || 0,
                total_expenses: expenses._sum.amount || 0,
                net_profit: (income._sum.amount || 0) - (expenses._sum.amount || 0)
            }
        }

        case "get_occupancy": {
            const start = startOfDay(new Date(args.startDate))
            const end = endOfDay(new Date(args.endDate))
            
            const courtsCount = await prisma.court.count({ where: { clubId, isActive: true } })
            const bookings = await prisma.booking.count({
                where: { clubId, startTime: { gte: start, lte: end }, status: { not: 'CANCELED' } }
            })
            
            // Assume 10-hour day per court as capacity (simplification for the AI)
            const capacityHours = 10 * courtsCount 
            const occupancyRate = (bookings / capacityHours) * 100

            return {
                courts: courtsCount,
                bookings_in_period: bookings,
                estimated_occupancy: `${Math.round(occupancyRate)}%`
            }
        }

        case "get_inactive_clients": {
            const cutoffDate = subDays(new Date(), args.daysInactive)
            
            // Clients whose latest booking was before cutoffDate
            const clients = await prisma.client.findMany({
                where: {
                    clubId,
                    bookings: {
                        none: {
                            createdAt: { gte: cutoffDate }
                        }
                    }
                },
                select: { name: true, phone: true },
                take: 10
            })

            return {
                inactive_count: clients.length,
                sample_clients: clients.map(c => ({ name: c.name, phone: c.phone }))
            }
        }

        case "get_popular_slots": {
            const last30Days = subDays(new Date(), 30)
            const bookings = await prisma.booking.findMany({
                where: { clubId, createdAt: { gte: last30Days }, status: { not: 'CANCELED' } },
                select: { startTime: true }
            })

            const hourCounts: Record<string, number> = {}
            bookings.forEach(b => {
                const hour = format(b.startTime, 'HH:00')
                hourCounts[hour] = (hourCounts[hour] || 0) + 1
            })

            const sorted = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
            return {
                popular_hours: sorted.map(([h, c]) => `${h} (${c} reservas en el último mes)`)
            }
        }

        default:
            return { error: "Herramienta no implementada" }
    }
}

// --- MAIN ACTION ---
export const processAiRequest = createSafeAction(async ({ clubId }, query: string): Promise<AiResponse> => {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return {
            content: "⚠️ **Configuración requerida**: Para activar la Consultoría AI 2.0, por favor agrega tu `GOOGLE_GENERATIVE_AI_API_KEY` en el archivo `.env`. \n\nSoy capaz de analizar tus finanzas, sugerir campañas de marketing y detectar horarios con baja ocupación para maximizar tus ganancias.",
            intent: 'GENERAL',
            suggestions: ["¿Cómo consigo el API Key?", "Ver mi recaudación (clásico)"]
        }
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            tools: tools
        })

        const chat = model.startChat()
        const systemInstruction = `Eres CourtOps AI, un consultor de negocios experto en clubes de Padel. 
        Tu objetivo es ayudar al dueño del club a maximizar rentabilidad y mejorar la experiencia del cliente.
        
        Reglas:
        1. Contexto: Club ID actual es ${clubId}. Solo puedes ver datos de este club.
        2. Personalidad: Profesional, analítica y proactiva. Si ves baja ocupación, sugiere una promo.
        3. Formato: Usa Markdown con negritas para destacar cifras.
        4. Idioma: Español (Argentina/Latam). Usa términos de padel (turno, pala, set, etc).
        
        Si te preguntan "qué puedes hacer", menciona que analizas finanzas, clientes inactivos y optimización de horarios.`

        // First prompt with context
        const prompt = `${systemInstruction}\n\nPregunta del Usuario: ${query}`
        const result = await chat.sendMessage(prompt)
        const response = result.response
        const calls = response.functionCalls() || []

        let finalContent = ""
        let intent: AiResponse['intent'] = 'ANALYTICS'

        if (calls.length > 0) {
            const toolResults = []
            for (const call of calls) {
                const data = await handleToolCall(clubId, call.name, call.args)
                toolResults.push({
                    functionResponse: {
                        name: call.name,
                        response: { result: data }
                    }
                })
            }

            // Secondary call with data results to generate final analysis
            const finalResult = await chat.sendMessage(toolResults)
            finalContent = finalResult.response.text()
        } else {
            finalContent = response.text()
        }

        // Basic suggestion generation based on AI content
        const suggestions = []
        if (finalContent.includes('recaudación') || finalContent.includes('dinero')) suggestions.push("Ver reportes detallados", "Precios Dinámicos")
        if (finalContent.includes('cliente') || finalContent.includes('marketing')) suggestions.push("Ver Clientes", "Crear Campaña WPP")
        if (suggestions.length === 0) suggestions.push("¿Qué días rinden más?", "Detectar horas muertas")

        return {
            content: finalContent,
            intent,
            suggestions
        }

    } catch (error) {
        console.error("AI Error:", error)
        return {
            content: "Hubo un error procesando tu consulta de Consultoría AI. Por favor, intenta de nuevo en unos momentos.",
            intent: 'GENERAL',
            data: { error: String(error) }
        }
    }
})
