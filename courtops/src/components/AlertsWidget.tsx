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
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark p-6 overflow-hidden flex flex-col h-full shadow-sm">
                     <div className="flex items-center gap-2 mb-4 text-primary">
                            <span className="material-icons-round text-lg">bolt</span>
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Deudas Pendientes</h4>
                     </div>

                     <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {!hasAlerts && (
                                   <p className="text-[11px] text-slate-500 italic">No hay deudas registradas.</p>
                            )}

                            {/* Low Stock Alerts */}
                            {alerts.lowStock.map((prod, idx) => (
                                   <div key={`stock-${idx}`} className="group cursor-pointer">
                                          <div className="flex items-start gap-3">
                                                 <span className="w-2 h-2 rounded-full bg-danger mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                                 <div>
                                                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Stock bajo: {prod.name}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">Quedan {prod.stock} unidades</p>
                                                 </div>
                                          </div>
                                   </div>
                            ))}

                            {/* Pending Booking Alerts */}
                            {alerts.pendingPayments.map((booking) => (
                                   <div
                                          key={`booking-${booking.id}`}
                                          onClick={() => onAlertClick?.(booking.id)}
                                          className="group cursor-pointer"
                                   >
                                          <div className="flex items-start gap-3">
                                                 <span className={`w-2 h-2 rounded-full mt-1.5 shadow-[0_0_8px_rgba(234,179,8,0.5)] ${booking.status === 'PENDING' ? 'bg-orange-500' : 'bg-accent'} group-hover:scale-125 transition-transform`}></span>
                                                 <div>
                                                        <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                                                               {booking.status === 'PENDING' ? 'Confirmación Pendiente' : 'Cobro Pendiente'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 mt-1 capitalize">
                                                               {format(new Date(booking.startTime), 'EEE d HH:mm', { locale: es })} hs - {booking.client?.name || 'Cliente Eventual'}
                                                        </p>
                                                 </div>
                                          </div>
                                   </div>
                            ))}
                     </div>
              </div>
       )
}
