'use client'

import React, { useEffect, useState } from 'react'
import { getDashboardAlerts } from '@/actions/dashboard'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInArg } from '@/lib/client-date-utils'

type AlertsData = {
       lowStock: { name: string, stock: number }[]
       pendingPayments: { id: number, startTime: Date, client?: { name: string } | null, status: string, paymentStatus: string }[]
}

type Props = {
       onAlertClick?: (bookingId: number) => void
       compact?: boolean
}

export default function AlertsWidget({ onAlertClick, compact }: Props) {
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
              <div className="bg-card-dark rounded-2xl border border-white/5 p-4 flex flex-col gap-3 shadow-sm h-full overflow-y-auto custom-scrollbar">
                     {!compact && (
                            <div className="flex items-center gap-2 mb-1">
                                   <span className="material-icons-round text-amber-500 text-sm">notifications</span>
                                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Alertas</h4>
                            </div>
                     )}

                     <div className="flex flex-col gap-2">
                            {!hasAlerts && (
                                   <p className="text-xs text-muted-foreground italic py-2">Todo en orden.</p>
                            )}

                            {/* Low Stock Alerts */}
                            {alerts.lowStock.map((prod, idx) => (
                                   <div key={`stock-${idx}`} className="flex items-start gap-3 p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/10">
                                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                          <div>
                                                 <p className="text-xs font-semibold text-white">Stock bajo: {prod.name}</p>
                                                 <p className="text-[10px] text-red-400">{prod.stock} unidades</p>
                                          </div>
                                   </div>
                            ))}

                            {/* Pending Booking Alerts */}
                            {alerts.pendingPayments.map((booking) => (
                                   <div
                                          key={`booking-${booking.id}`}
                                          onClick={() => onAlertClick?.(booking.id)}
                                          className="flex items-start gap-3 p-2 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer border border-transparent hover:border-amber-500/10"
                                   >
                                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${booking.status === 'PENDING' ? 'bg-orange-500' : 'bg-amber-500'}`} />
                                          <div>
                                                 <p className="text-xs font-semibold text-white">
                                                        {booking.status === 'PENDING' ? 'Confirmar Reserva' : 'Cobro Pendiente'}
                                                 </p>
                                                 <p className="text-[10px] text-muted-foreground">
                                                        {formatInArg(booking.startTime, 'EEE HH:mm')} · {booking.client?.name || 'Cliente'}
                                                 </p>
                                          </div>
                                   </div>
                            ))}
                     </div>
              </div>
       )
}
