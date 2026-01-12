'use client'

import React, { useEffect, useState } from 'react'
import NotificationsSheet from './NotificationsSheet'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
       LayoutDashboard,
       CalendarDays,
       Users,
       BarChart3,
       Plus,
       Bell,
       Menu,
       DollarSign,
       Clock,
       MinusCircle,
       Store,
       ChevronRight,
       AlertTriangle,
       CheckCircle,
       ArrowUp,
       Search,
       ExternalLink
} from 'lucide-react'

import { getMobileDashboardData } from '@/actions/dashboard_mobile'
import { cn } from '@/lib/utils'

interface MobileDashboardProps {
       user: any
       clubName: string
       logoUrl?: string | null
       onOpenBooking: (id: any) => void
       onOpenKiosco: () => void
       currentView?: 'dashboard' | 'calendar'
       onNavigate?: (view: 'dashboard' | 'calendar') => void
}

export default function MobileDashboard({ user, clubName, logoUrl, onOpenBooking, onOpenKiosco, currentView = 'dashboard', onNavigate }: MobileDashboardProps) {
       const [data, setData] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

       const fetchData = async () => {
              try {
                     const res = await getMobileDashboardData()
                     setData(res)
              } catch (e) {
                     console.error(e)
              } finally {
                     setLoading(false)
              }
       }

       useEffect(() => {
              fetchData()
              const interval = setInterval(fetchData, 10000) // 10s refresh
              return () => clearInterval(interval)
       }, [])

       if (loading && !data) {
              return <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
              </div>
       }

       const today = new Date()

       return (
              <>
                     <div className="bg-bg-dark font-sans text-white antialiased min-h-screen flex flex-col pb-20 relative overflow-hidden">
                            {/* HEADER */}
                            <header className="bg-bg-surface/80 backdrop-blur-md px-4 py-3 sticky top-0 z-20 shadow-sm border-b border-white/5">
                                   <div className="flex justify-between items-center">
                                          <div className="flex items-center gap-3">
                                                 <div className="h-10 w-10 bg-bg-card rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-white/10">
                                                        {logoUrl ? (
                                                               <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                        ) : (
                                                               <span className="text-brand-green font-bold text-xl">A</span>
                                                        )}
                                                 </div>
                                                 <div>
                                                        <h1 className="text-lg font-bold leading-tight text-white">{clubName}</h1>
                                                        <span className="text-[10px] font-medium text-text-grey bg-white/5 px-2 py-0.5 rounded-full">COURTOPS</span>
                                                 </div>
                                          </div>
                                          <button
                                                 onClick={() => setIsNotificationsOpen(true)}
                                                 className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors relative group"
                                          >
                                                 <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                                 <Bell className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                          </button>
                                   </div>
                            </header >

                            <main className="flex-1 p-4 space-y-6">
                                   {/* GREETING & DATE */}
                                   <div className="flex justify-between items-end">
                                          <div>
                                                 <p className="text-sm text-text-grey">Hola, {user.name || 'Admin'}</p>
                                                 <h2 className="text-xl font-bold text-white">Resumen Diario</h2>
                                          </div>
                                          <div className="text-right">
                                                 <p className="text-xs text-text-grey uppercase font-semibold">
                                                        {format(today, "EEEE d MMM", { locale: es })}
                                                 </p>
                                          </div>
                                   </div>

                                   {/* STATS SCROLL */}
                                   <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                                          {/* CAJA */}
                                          <div className="min-w-[140px] flex-1 bg-bg-card p-4 rounded-xl border border-white/5 shadow-sm relative overflow-hidden group">
                                                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <DollarSign className="w-10 h-10 text-brand-green" />
                                                 </div>
                                                 <p className="text-[10px] font-bold text-brand-green uppercase tracking-wider mb-1">Caja Real Hoy</p>
                                                 <div className="text-2xl font-bold text-white mb-1">${(data?.caja?.total ?? 0).toLocaleString()}</div>
                                                 <div className="flex items-center gap-1 text-[10px] text-text-grey">
                                                        <ArrowUp className="w-3 h-3 text-brand-green" />
                                                        <span>${(data?.caja?.incomeCash ?? 0).toLocaleString()} Efvo</span>
                                                 </div>
                                          </div>

                                          {/* A COBRAR */}
                                          <div className="min-w-[140px] flex-1 bg-bg-card p-4 rounded-xl border border-white/5 shadow-sm relative overflow-hidden group">
                                                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <Clock className="w-10 h-10 text-orange-400" />
                                                 </div>
                                                 <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">A Cobrar</p>
                                                 <div className="text-2xl font-bold text-white mb-1">${(data?.receivables ?? 0).toLocaleString()}</div>
                                                 <div className="flex items-center gap-1 text-[10px] text-text-grey">
                                                        <CheckCircle className="w-3 h-3 text-brand-green" />
                                                        <span>Del día</span>
                                                 </div>
                                          </div>

                                          {/* GASTOS */}
                                          <div className="min-w-[140px] flex-1 bg-bg-card p-4 rounded-xl border border-white/5 shadow-sm relative overflow-hidden group">
                                                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <MinusCircle className="w-10 h-10 text-red-500" />
                                                 </div>
                                                 <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Gastos</p>
                                                 <div className="text-2xl font-bold text-white mb-1">-${(data?.caja?.expenses ?? 0).toLocaleString()}</div>
                                                 <div className="flex items-center gap-1 text-[10px] text-text-grey">
                                                        <span>Registrados</span>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* MAIN ACTIONS */}
                                   <div className="grid grid-cols-3 gap-3">
                                          <button
                                                 onClick={() => onOpenBooking({})}
                                                 className="bg-brand-blue hover:bg-brand-blue-secondary active:scale-95 transition-all text-white p-3 rounded-xl shadow-lg shadow-brand-blue/20 flex flex-col items-center justify-center gap-2"
                                          >
                                                 <div className="bg-white/20 p-2 rounded-full">
                                                        <Plus className="w-5 h-5" />
                                                 </div>
                                                 <span className="font-semibold text-xs text-center">Reservar</span>
                                          </button>
                                          <button
                                                 onClick={onOpenKiosco}
                                                 className="bg-bg-card hover:bg-white/5 active:scale-95 transition-all border border-white/5 p-3 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 text-white"
                                          >
                                                 <div className="bg-white/5 p-2 rounded-full">
                                                        <Store className="w-5 h-5 text-brand-green" />
                                                 </div>
                                                 <span className="font-semibold text-xs text-center">Kiosco</span>
                                          </button>
                                          <Link
                                                 href={data?.clubSlug ? `/p/${data.clubSlug}` : '#'}
                                                 target="_blank"
                                                 className="bg-bg-card hover:bg-white/5 active:scale-95 transition-all border border-white/5 p-3 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 text-white"
                                          >
                                                 <div className="bg-white/5 p-2 rounded-full">
                                                        <ExternalLink className="w-5 h-5 text-purple-400" />
                                                 </div>
                                                 <span className="font-semibold text-xs text-center">Público</span>
                                          </Link>
                                   </div>

                                   {/* COURTS NOW */}
                                   <div>
                                          <div className="flex justify-between items-center mb-4">
                                                 <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                                        <span className="w-1 h-5 bg-brand-green rounded-full"></span>
                                                        Canchas Ahora
                                                 </h3>
                                                 {/* <a className="text-xs font-semibold text-brand-blue hover:text-white" href="#">Ver Agenda Completa</a> */}
                                          </div>
                                          <div className="space-y-3">
                                                 {(!data?.courts || data.courts.length === 0) ? (
                                                        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5">
                                                               <span className="text-2xl opacity-50 block mb-2">🎾</span>
                                                               <p className="text-sm text-text-grey">No hay canchas disponibles o activas.</p>
                                                        </div>
                                                 ) : data.courts.map((court: any) => (
                                                        <div
                                                               key={court.id}
                                                               onClick={() => court.currentBookingId && onOpenBooking(court.currentBookingId)}
                                                               className={cn("bg-bg-card rounded-xl p-4 border border-white/5 shadow-sm flex items-center justify-between relative overflow-hidden", !court.isFree && "border-l-4 border-l-brand-blue")}
                                                        >
                                                               {selectedCourtBg(court)}

                                                               <div className="flex items-center gap-4 relative z-10">
                                                                      <div className={cn("h-10 w-1 rounded-full", court.isFree ? "bg-brand-green" : "bg-brand-blue")}></div>
                                                                      <div>
                                                                             <div className="text-sm font-bold text-brand-blue mb-0.5 uppercase">{court.name}</div>
                                                                             <div className="text-xs text-text-grey">{court.surface || 'Padel'} {court.status === 'En Juego' && ''}</div>
                                                                      </div>
                                                               </div>
                                                               <div className="flex items-center gap-3 relative z-10">
                                                                      <div className="text-right">
                                                                             <div className="text-sm font-semibold text-white">{court.timeDisplay}</div>
                                                                             <div className={cn("text-[10px] font-medium uppercase tracking-wide", court.isFree ? "text-brand-green" : "text-brand-blue")}>
                                                                                    {court.status}
                                                                             </div>
                                                                      </div>
                                                                      <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-text-grey hover:text-white transition-colors">
                                                                             <ChevronRight className="w-4 h-4" />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>

                                   {/* ALERTS */}
                                   {data?.alerts.length > 0 && (
                                          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 relative overflow-hidden">
                                                 <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                                 <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-sm font-bold text-white">Alertas</h4>
                                                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                                                 </div>
                                                 <div className="space-y-3">
                                                        {data.alerts.map((alert: any, i: number) => (
                                                               <div key={i} className="flex gap-3 items-start">
                                                                      <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                                                                      <div>
                                                                             <p className="text-sm font-medium text-white">{alert.title}</p>
                                                                             <p className="text-xs text-text-grey">{alert.message}</p>
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>
                                   )}

                            </main>

                            {/* BOTTOM NAV */}
                            <nav className="fixed bottom-0 w-full bg-bg-surface border-t border-white/10 pb-4 pt-2 px-2 z-40 safe-area-bottom">
                                   <div className="flex justify-around items-center h-16">
                                          <button
                                                 onClick={() => onNavigate?.('dashboard')}
                                                 className={cn(
                                                        "flex flex-col items-center gap-1 w-16 group transition-colors",
                                                        currentView === 'dashboard' ? "text-brand-blue" : "text-text-grey hover:text-white"
                                                 )}
                                          >
                                                 <LayoutDashboard className={cn("w-6 h-6 transition-transform", currentView === 'dashboard' ? "scale-110" : "group-hover:scale-110")} />
                                                 <span className="text-[10px] font-medium">Inicio</span>
                                          </button>

                                          <button
                                                 onClick={() => onNavigate?.('calendar')}
                                                 className={cn(
                                                        "flex flex-col items-center gap-1 w-16 group transition-colors",
                                                        currentView === 'calendar' ? "text-brand-blue" : "text-text-grey hover:text-white"
                                                 )}
                                          >
                                                 <CalendarDays className={cn("w-6 h-6 transition-transform", currentView === 'calendar' ? "scale-110" : "group-hover:scale-110")} />
                                                 <span className="text-[10px] font-medium">Reservas</span>
                                          </button>

                                          <div className="relative -top-6">
                                                 <button
                                                        onClick={() => onOpenBooking({})}
                                                        className="bg-brand-green text-bg-dark h-14 w-14 rounded-2xl shadow-lg shadow-brand-green/20 flex items-center justify-center transform active:scale-95 transition-all border-4 border-bg-dark"
                                                 >
                                                        <Plus className="w-8 h-8" />
                                                 </button>
                                          </div>

                                          <Link href="/clientes" className="flex flex-col items-center gap-1 w-16 group text-text-grey hover:text-white transition-colors">
                                                 <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                 <span className="text-[10px] font-medium">Clientes</span>
                                          </Link>
                                          <Link href="/reportes" className="flex flex-col items-center gap-1 w-16 group text-text-grey hover:text-white transition-colors">
                                                 <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                 <span className="text-[10px] font-medium">Reportes</span>
                                          </Link>
                                   </div>
                            </nav>
                     </div >

                     <NotificationsSheet
                            isOpen={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                     />
              </>
       )
}

function selectedCourtBg(court: any) {
       if (!court.isFree) {
              return <div className="absolute bottom-0 left-0 h-1 bg-brand-green w-3/4 opacity-50 blur-sm"></div>
       }
       return null
}
