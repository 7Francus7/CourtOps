import prisma from '@/lib/db'
import { SystemAlertsClient } from './SystemAlertsClient'

export async function SystemAlerts() {
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

       if (alerts.length === 0) return null

       // 2. Reduce duplicates if any (based on title + message)
       // This handles the "se duplica" issue if the DB has accidental duplicates
       const uniqueAlerts = alerts.filter((alert, index, self) =>
              index === self.findIndex((t) => (
                     t.title === alert.title && t.message === alert.message
              ))
       )

       // 3. Render Client Component
       // Transform to plain objects to avoid "Date" serialization issues in Server Components
       const sanitizedAlerts = uniqueAlerts.map(a => ({
              id: a.id,
              title: a.title,
              message: a.message,
              type: a.type
       }))

       return <SystemAlertsClient alerts={sanitizedAlerts} />
       // force casting if needed, though structure matches. 
       // Prisma types usually include createdAt etc, but interface is compatible.
}
