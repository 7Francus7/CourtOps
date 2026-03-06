import prisma from '@/lib/db'
import { SystemAlertsClient } from './SystemAlertsClient'

export async function SystemAlerts() {
       let finalAlerts = []
       try {
              // 1. Fetch active alerts from DB
              const alerts = await prisma.systemNotification.findMany({
                     where: {
                            isActive: true,
                            OR: [
                                   { expiresAt: null },
                                   { expiresAt: { gt: new Date() } }
                            ]
                     },
                     orderBy: { createdAt: 'desc' }
              })

              if (alerts.length > 0) {
                     // 2. Reduce duplicates if any (based on title + message)
                     const uniqueAlerts = alerts.filter((alert, index, self) =>
                            index === self.findIndex((t) => (
                                   t.title === alert.title && t.message === alert.message
                            ))
                     )

                     // 3. Render Client Component
                     // Transform to plain objects to avoid "Date" serialization issues
                     const sanitizedAlerts = uniqueAlerts.map(a => ({
                            id: a.id,
                            title: a.title,
                            message: a.message,
                            type: a.type
                     }))

                     // FINAL GUARD: Ensure it's perfectly serializable (no hidden Prisma properties)
                     finalAlerts = JSON.parse(JSON.stringify(sanitizedAlerts))
              }
       } catch (error) {
              console.error("[SYSTEM ALERTS ERROR]:", error)
              return null // Return null if fetching fails
       }

       if (finalAlerts.length === 0) return null
       return <SystemAlertsClient alerts={finalAlerts} />
}

