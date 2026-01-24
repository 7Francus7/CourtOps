
import prisma from '@/lib/db'

export async function SystemAlerts() {
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

       return (
              <div className="space-y-2 mb-4">
                     {alerts.map(alert => (
                            <div
                                   key={alert.id}
                                   className={`
                        p-3 rounded-lg border flex items-center justify-between shadow-lg
                        ${alert.type === 'INFO' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : ''}
                        ${alert.type === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' : ''}
                        ${alert.type === 'ERROR' ? 'bg-red-500/10 border-red-500/20 text-red-200' : ''}
                        ${alert.type === 'SUCCESS' ? 'bg-green-500/10 border-green-500/20 text-green-200' : ''}
                    `}
                            >
                                   <div className="flex items-center gap-3">
                                          <span className="text-xl">
                                                 {alert.type === 'INFO' && 'ℹ️'}
                                                 {alert.type === 'WARNING' && '⚠️'}
                                                 {alert.type === 'ERROR' && '🚨'}
                                                 {alert.type === 'SUCCESS' && '✅'}
                                          </span>
                                          <div>
                                                 <h4 className="font-bold text-sm uppercase tracking-wider opacity-80">{alert.title}</h4>
                                                 <p className="text-sm font-medium">{alert.message}</p>
                                          </div>
                                   </div>
                            </div>
                     ))}
              </div>
       )
}
