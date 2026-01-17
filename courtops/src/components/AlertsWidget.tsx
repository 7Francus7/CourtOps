'use client'

import React, { useEffect, useState } from 'react'
import { getDashboardAlerts } from '@/actions/dashboard'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type AlertsData = {
       lowStock: { name: string, stock: number }[]
       pendingPayments: { id: number, startTime: Date, client?: { name: string } | null, status: string, paymentStatus: string }[]
}

type Props = {
       onAlertClick?: (bookingId: number) => void
}

export default function AlertsWidget({ onAlertClick }: Props) {
       const [alerts, setAlerts] = useState<AlertsData | null>(null)
       const [loading, setLoading] = useState(true)

       // Poll every 30 seconds
       useEffect(() => {
              const fetchAlerts = async () => {
                     try {
                            const data = await getDashboardAlerts()
                            setAlerts(data)
                     } catch (err) {
                            console.error("Error fetching alerts", err)
                     } finally {
                            setLoading(false)
                     }
              }

              fetchAlerts()
              const interval = setInterval(fetchAlerts, 30000)
              return () => clearInterval(interval)
       }, [])

       if (loading) return <div className="bg-bg-card p-6 rounded-3xl border border-white/5 animate-pulse h-48"></div>

       if (!alerts) return null

       const hasAlerts = alerts.lowStock.length > 0 || alerts.pendingPayments.length > 0

       return (
              <div className="glass p-5 rounded-2xl border-l-4 border-l-[var(--color-primary)]/30">
                     <div className="flex items-center gap-2 mb-3">
                            <span className="material-icons-round text-[var(--color-primary)] text-sm">bolt</span>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deudas Pendientes</h4>
                     </div>

                     <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {!hasAlerts && (
                                   <p className="text-[11px] text-slate-500 italic">No hay deudas registradas.</p>
                            )}

                            {/* Low Stock Alerts */}
                            {alerts.lowStock.map((prod, idx) => (
                                   <div key={`stock-${idx}`} className="flex gap-3 items-start p-2 hover:bg-white/5 rounded-lg transition-colors">
                                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                          <div>
                                                 <p className="text-sm font-medium text-white">Stock bajo: {prod.name}</p>
                                                 <p className="text-xs text-text-grey mt-0.5">Quedan {prod.stock} unidades</p>
                                          </div>
                                   </div>
                            ))}

                            {/* Pending Booking Alerts */}
                            {alerts.pendingPayments.map((booking) => (
                                   <div
                                          key={`booking-${booking.id}`}
                                          onClick={() => onAlertClick?.(booking.id)}
                                          className="flex gap-3 items-start p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
                                   >
                                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.5)] ${booking.status === 'PENDING' ? 'bg-orange-500' : 'bg-yellow-500'} group-hover:scale-125 transition-transform`}></div>
                                          <div>
                                                 <p className="text-sm font-medium text-white">
                                                        {booking.status === 'PENDING' ? 'Confirmación Pendiente' : 'Cobro Pendiente'}
                                                 </p>
                                                 <p className="text-xs text-text-grey mt-0.5 capitalize">
                                                        {format(new Date(booking.startTime), 'EEE d HH:mm', { locale: es })} hs - {booking.client?.name || 'Cliente Eventual'}
                                                 </p>
                                          </div>
                                   </div>
                            ))}
                     </div>
              </div>
       )
}
