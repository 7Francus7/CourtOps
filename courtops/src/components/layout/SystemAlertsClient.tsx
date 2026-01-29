'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface SystemAlert {
       id: string
       title: string
       message: string
       type: string // 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' - typed loosely to match Prisma or string
}

export function SystemAlertsClient({ alerts: initialAlerts }: { alerts: SystemAlert[] }) {
       const [visibleAlerts, setVisibleAlerts] = useState<SystemAlert[]>(initialAlerts)
       const [mounted, setMounted] = useState(false)

       useEffect(() => {
              setMounted(true)
              // Check local storage for dismissed alerts
              const dismissed = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]')
              setVisibleAlerts(initialAlerts.filter(a => !dismissed.includes(a.id)))
       }, [initialAlerts])

       const dismiss = (id: string) => {
              setVisibleAlerts(prev => prev.filter(a => a.id !== id))
              const dismissed = JSON.parse(localStorage.getItem('dismissed_alerts') || '[]')
              localStorage.setItem('dismissed_alerts', JSON.stringify([...dismissed, id]))
       }

       if (!mounted) return null // Avoid hydration mismatch
       if (visibleAlerts.length === 0) return null

       return (
              <div className="flex flex-col gap-2 mb-4 w-full px-4 sm:px-6 lg:px-8 mt-4">
                     {visibleAlerts.map(alert => (
                            <div
                                   key={alert.id}
                                   className={`
            relative p-4 rounded-xl border flex items-start sm:items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2
            ${alert.type === 'INFO' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : ''}
            ${alert.type === 'WARNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : ''}
            ${alert.type === 'ERROR' ? 'bg-red-500/10 border-red-500/20 text-red-200' : ''}
            ${alert.type === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : ''}
          `}
                            >
                                   <div className="flex items-start sm:items-center gap-3 pr-8">
                                          <span className="text-xl shrink-0">
                                                 {alert.type === 'INFO' && 'ℹ️'}
                                                 {alert.type === 'WARNING' && '⚠️'}
                                                 {alert.type === 'ERROR' && '🚨'}
                                                 {alert.type === 'SUCCESS' && '✅'}
                                          </span>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                 <h4 className="font-bold text-xs uppercase tracking-widest opacity-80 shrink-0">{alert.title}</h4>
                                                 <span className="hidden sm:inline opacity-40">|</span>
                                                 <p className="text-sm font-medium leading-tight">{alert.message}</p>
                                          </div>
                                   </div>
                                   <button
                                          onClick={() => dismiss(alert.id)}
                                          className="absolute top-2 right-2 sm:top-1/2 sm:-translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                   >
                                          <X size={16} className="opacity-70 hover:opacity-100" />
                                   </button>
                            </div>
                     ))}
              </div>
       )
}
