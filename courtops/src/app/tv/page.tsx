/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useMemo } from 'react'
import { getTurneroData } from '@/actions/dashboard'
import { format, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trophy, Zap, Info, Calendar, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePerformance } from '@/contexts/PerformanceContext'

const REFRESH_INTERVAL = 15000 // 15 seconds

export default function TvModePage() {
       const [data, setData] = useState<any>(null)
       const [currentTime, setCurrentTime] = useState(new Date())
       const [isLoading, setIsLoading] = useState(true)
       const [currentSlide, setCurrentSlide] = useState<'TURNS' | 'SCHEDULE' | 'PROMO'>('TURNS')
       const { isLowEnd } = usePerformance()

       const fetchData = async () => {
              try {
                     const date = new Date().toISOString()
                     const res = await getTurneroData(date)
                     setData(res)
              } catch (error) {
                     console.error("TV Mode Fetch Error:", error)
              } finally {
                     setIsLoading(false)
              }
       }

       useEffect(() => {
              fetchData()
              const interval = setInterval(fetchData, REFRESH_INTERVAL)
              const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)
              const slideInterval = setInterval(() => {
                     setCurrentSlide(prev => {
                            if (prev === 'TURNS') return 'SCHEDULE'
                            if (prev === 'SCHEDULE') return 'PROMO'
                            return 'TURNS'
                     })
              }, 12000)

              return () => {
                     clearInterval(interval)
                     clearInterval(clockInterval)
                     clearInterval(slideInterval)
              }
       }, [])

       const activeBookings = useMemo(() => {
              if (!data?.courts) return []
              return data.courts.map((court: any) => {
                     const now = currentTime
                     const currentBooking = data.bookings.find((b: any) => {
                            const start = new Date(b.startTime)
                            const end = new Date(b.endTime)
                            return isBefore(start, now) && isAfter(end, now)
                     })
                     const nextBooking = data.bookings
                            .filter((b: any) => b.courtId === court.id && isAfter(new Date(b.startTime), now))
                            .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]

                     return { ...court, currentBooking, nextBooking }
              })
       }, [data, currentTime])

       if (!data && isLoading) {
              return (
                     <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-8">
                            <motion.div
                                   animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                   transition={{ repeat: Infinity, duration: 4 }}
                                   className="w-24 h-24 border-t-4 border-emerald-500 rounded-full"
                            />
                            <span className="text-3xl font-black tracking-widest animate-pulse uppercase">INICIALIZANDO SISTEMA...</span>
                     </div>
              )
       }

       return (
              <div className="min-h-screen bg-[#0b0f19] text-white overflow-hidden font-sans selection:bg-emerald-500/30">
                     {/* Dynamic Background */}
                     {!isLowEnd && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                   <motion.div
                                          animate={{
                                                 scale: [1, 1.2, 1],
                                                 x: [0, 50, 0],
                                                 y: [0, -50, 0],
                                                 rotate: [0, 90, 180]
                                          }}
                                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                          className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] bg-emerald-500/[0.03] rounded-full blur-[150px]"
                                   />
                                   <motion.div
                                          animate={{
                                                 scale: [1, 1.5, 1],
                                                 x: [0, -100, 0],
                                                 y: [0, 100, 0]
                                          }}
                                          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                                          className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-500/[0.02] rounded-full blur-[120px]"
                                   />
                            </div>
                     )}

                     {/* HEADER */}
                     <header className={cn(
                            "fixed top-0 inset-x-0 h-32 border-b border-white/5 z-50 flex items-center justify-between px-16",
                            isLowEnd ? "bg-black" : "bg-black/40 backdrop-blur-2xl"
                     )}>
                            <div className="flex items-center gap-8">
                                   <div className="relative">
                                          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse" />
                                          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center relative shadow-2xl overflow-hidden group">
                                                 <span className="text-4xl font-black text-black">TP</span>
                                                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                          </div>
                                   </div>
                                   <div>
                                          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                                                 {data?.clubName ?? ''}
                                          </h1>
                                          <div className="flex items-center gap-3 mt-2">
                                                 <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[ping_2s_infinite]" />
                                                        <span className="text-xs font-black text-emerald-500 tracking-[0.2em]">SISTEMA ACTIVO</span>
                                                 </div>
                                                 <span className="text-white/30 text-xs font-bold uppercase tracking-widest">{format(currentTime, "EEEE d 'de' MMMM", { locale: es })}</span>
                                          </div>
                                   </div>
                            </div>

                            <div className="flex items-center gap-8">
                                   <div className="text-right">
                                          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-1">HORA LOCAL</p>
                                          <div className="flex items-baseline gap-2">
                                                 <span className="text-7xl font-black tracking-tight tabular-nums">{format(currentTime, 'HH:mm')}</span>
                                                 <span className="text-2xl font-bold text-white/20 tabular-nums">{format(currentTime, 'ss')}</span>
                                          </div>
                                   </div>
                            </div>
                     </header>

                     {/* MAIN VIEWPORT */}
                     <main className="pt-32 h-screen p-12 relative z-10">
                            <AnimatePresence mode="wait">
                                   {currentSlide === 'TURNS' && (
                                          <motion.div
                                                 key="turns"
                                                 initial={{ opacity: 0, scale: 0.95 }}
                                                 animate={{ opacity: 1, scale: 1 }}
                                                 exit={{ opacity: 0, scale: 1.05 }}
                                                 className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10"
                                          >
                                                 {activeBookings.map((court: any) => (
                                                        <div key={court.id} className="relative group">
                                                               <div className={cn(
                                                                      "absolute inset-0 rounded-[4rem] blur-3xl opacity-10 transition-all duration-1000",
                                                                      court.currentBooking ? "bg-emerald-500" : "bg-blue-500/30"
                                                               )} />
                                                               <div className="h-full bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-[3.5rem] p-12 flex flex-col justify-between overflow-hidden relative shadow-2xl">

                                                                      {/* Court Decor */}
                                                                      <div className="absolute top-10 right-10 opacity-5">
                                                                             <Zap size={140} className="text-white" />
                                                                      </div>

                                                                      <div>
                                                                             <div className="flex justify-between items-start mb-12">
                                                                                    <h2 className="text-5xl font-black tracking-tighter uppercase">{court.name}</h2>
                                                                                    <div className={cn(
                                                                                           "px-6 py-2 rounded-2xl text-xs font-black tracking-[0.2em] border shadow-lg",
                                                                                           court.currentBooking
                                                                                                  ? "bg-emerald-500 text-black border-emerald-400"
                                                                                                  : "bg-white/5 text-white/40 border-white/10"
                                                                                    )}>
                                                                                           {court.currentBooking ? 'OCUPADA' : 'LIBRE'}
                                                                                    </div>
                                                                             </div>

                                                                             <div className="space-y-8">
                                                                                    {court.currentBooking ? (
                                                                                           <div className="space-y-6">
                                                                                                  <div className="flex items-center gap-4">
                                                                                                         <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                                                                                                                <Users size={32} />
                                                                                                         </div>
                                                                                                         <div>
                                                                                                                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">JUGANDO EN PISTA</p>
                                                                                                                <h3 className="text-4xl font-bold truncate max-w-[280px] leading-tight mt-1">
                                                                                                                       {court.currentBooking.client?.name || court.currentBooking.guestName}
                                                                                                                </h3>
                                                                                                         </div>
                                                                                                  </div>
                                                                                                  <div className="flex items-center gap-12">
                                                                                                         <div>
                                                                                                                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">HORA FIN</p>
                                                                                                                <div className="bg-emerald-500/10 px-5 py-2 rounded-xl border border-emerald-500/20">
                                                                                                                       <span className="text-3xl font-black text-emerald-500">{format(new Date(court.currentBooking.endTime), 'HH:mm')} HS</span>
                                                                                                                </div>
                                                                                                         </div>
                                                                                                  </div>
                                                                                           </div>
                                                                                    ) : (
                                                                                           <div className="py-12 opacity-30 flex flex-col items-center text-center">
                                                                                                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                                                                                         <Calendar size={48} />
                                                                                                  </div>
                                                                                                  <p className="text-2xl font-bold uppercase tracking-widest">Disponible</p>
                                                                                                  <p className="text-sm mt-3 font-medium">Consulte en recepción para reservar</p>
                                                                                           </div>
                                                                                    )}
                                                                             </div>
                                                                      </div>

                                                                      <footer className="pt-8 border-t border-white/10 mt-12">
                                                                             <div className="flex items-center justify-between">
                                                                                    <span className="text-[10px] font-black text-white/20 tracking-widest uppercase">PRÓXIMO TURNO</span>
                                                                                    <div className="flex items-center gap-3">
                                                                                           {court.nextBooking ? (
                                                                                                  <>
                                                                                                         <span className="text-sm font-bold text-white/60">{format(new Date(court.nextBooking.startTime), 'HH:mm')} HS</span>
                                                                                                         <div className="w-1 h-1 rounded-full bg-white/20" />
                                                                                                         <span className="text-[10px] font-bold text-white/40 truncate max-w-[100px]">{court.nextBooking.client?.name || court.nextBooking.guestName}</span>
                                                                                                  </>
                                                                                           ) : (
                                                                                                  <span className="text-[10px] font-bold text-white/20">SIN RESERVAS</span>
                                                                                           )}
                                                                                    </div>
                                                                             </div>
                                                                      </footer>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </motion.div>
                                   )}

                                   {currentSlide === 'SCHEDULE' && (
                                          <motion.div
                                                 key="schedule"
                                                 initial={{ opacity: 0, y: 50 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 exit={{ opacity: 0, y: -50 }}
                                                 className="h-full bg-white/[0.02] backdrop-blur-sm rounded-[4rem] border border-white/5 p-16 flex flex-col"
                                          >
                                                 <div className="flex items-center justify-between mb-12">
                                                        <div className="flex items-center gap-6">
                                                               <div className="p-4 bg-blue-500 rounded-3xl shadow-xl shadow-blue-500/20">
                                                                      <Clock size={40} className="text-white" />
                                                               </div>
                                                               <h2 className="text-5xl font-black uppercase tracking-tighter">Agenda del Día</h2>
                                                        </div>
                                                        <div className="text-right">
                                                               <p className="text-xs font-black text-white/30 tracking-[0.3em] uppercase mb-1">Total Reservas</p>
                                                               <p className="text-5xl font-black text-blue-500">{data?.bookings?.length || 0}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex-1 grid grid-cols-4 gap-8">
                                                        {activeBookings.map((court: any) => (
                                                               <div key={court.id} className="space-y-6">
                                                                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center font-black text-xs uppercase tracking-widest text-white/60">
                                                                             {court.name}
                                                                      </div>
                                                                      <div className="space-y-3">
                                                                             {data.bookings
                                                                                    .filter((b: any) => b.courtId === court.id)
                                                                                    .slice(0, 6)
                                                                                    .map((b: any) => (
                                                                                           <div key={b.id} className="bg-white/[0.03] p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-white/10 transition-all">
                                                                                                  <span className="text-sm font-black text-white/80">{format(new Date(b.startTime), 'HH:mm')}</span>
                                                                                                  <span className="text-xs font-bold text-white/40 truncate max-w-[120px]">{b.client?.name || b.guestName}</span>
                                                                                           </div>
                                                                                    ))
                                                                             }
                                                                             {data.bookings.filter((b: any) => b.courtId === court.id).length === 0 && (
                                                                                    <div className="h-full flex items-center justify-center py-20 opacity-10 grayscale">
                                                                                           <Info size={48} />
                                                                                    </div>
                                                                             )}
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </motion.div>
                                   )}

                                   {currentSlide === 'PROMO' && (
                                          <motion.div
                                                 key="promo"
                                                 initial={{ opacity: 0, rotateY: 90 }}
                                                 animate={{ opacity: 1, rotateY: 0 }}
                                                 exit={{ opacity: 0, rotateY: -90 }}
                                                 className="h-full bg-gradient-to-br from-emerald-500 to-teal-400 rounded-[5rem] p-24 flex flex-col justify-center items-center text-center text-black"
                                          >
                                                 <motion.div
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                        className="bg-black/10 p-8 rounded-full mb-12"
                                                 >
                                                        <Trophy size={160} />
                                                 </motion.div>
                                                 <h2 className="text-8xl font-black tracking-tighter uppercase leading-none mb-6">Americano Expertos</h2>
                                                 <p className="text-3xl font-black uppercase tracking-widest opacity-80 mb-12">Este Sábado - 18:00 Hs</p>
                                                 <div className="bg-black text-white px-12 py-6 rounded-3xl text-3xl font-black shadow-2xl">
                                                        $5.000 POR JUGADOR
                                                 </div>
                                                 <div className="mt-16 flex gap-12 text-black/60 font-black tracking-[0.2em] uppercase">
                                                        <span>Premios Babolat</span>
                                                        <span>•</span>
                                                        <span>Cena Post Torneo</span>
                                                        <span>•</span>
                                                        <span>Ranking Anual</span>
                                                 </div>
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </main>

                     {/* INFO BAR / FOOTER */}
                     <footer className={cn(
                            "fixed bottom-0 inset-x-0 h-24 border-t border-white/5 z-50 flex items-center px-16",
                            isLowEnd ? "bg-black" : "bg-black/60 backdrop-blur-3xl"
                     )}>
                            <div className="flex-1 flex gap-16 items-center overflow-hidden whitespace-nowrap">
                                   <motion.div
                                          animate={{ x: ["0%", "-50%"] }}
                                          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                                          className="flex gap-20 items-center"
                                   >
                                          <div className="flex items-center gap-4">
                                                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                 <span className="text-2xl font-black uppercase tracking-widest">Bienvenidos a {data?.clubName ?? ''}</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                                 <Zap className="text-yellow-400" />
                                                 <span className="text-2xl font-black uppercase tracking-widest">Kiosco abierto: Bebidas frías y Snacks</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                                 <Info className="text-blue-400" />
                                                 <span className="text-2xl font-black uppercase tracking-widest">Descargá nuestra App para reservar</span>
                                          </div>
                                          {/* Loop items */}
                                          <div className="flex items-center gap-4">
                                                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                 <span className="text-2xl font-black uppercase tracking-widest">Bienvenidos a {data?.clubName ?? ''}</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                                 <Zap className="text-yellow-400" />
                                                 <span className="text-2xl font-black uppercase tracking-widest">Kiosco abierto: Bebidas frías y Snacks</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                                 <Info className="text-blue-400" />
                                                 <span className="text-2xl font-black uppercase tracking-widest">Descargá nuestra App para reservar</span>
                                          </div>
                                   </motion.div>
                            </div>
                            <div className="pl-12 border-l border-white/10 ml-8">
                                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">ESTADO</p>
                                   <p className="font-bold text-emerald-500">SISTEMA OK</p>
                            </div>
                     </footer>
              </div>
       )
}
