'use client'

import React, { useEffect, useState } from 'react'
import { getTurneroData } from '@/actions/dashboard'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'

// Auto-refresh configuration
const REFRESH_INTERVAL = 30000 // 30 seconds

export default function TvModePage() {
       const [data, setData] = useState<any>(null)
       const [currentTime, setCurrentTime] = useState(new Date())
       const [isLoading, setIsLoading] = useState(true)

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

              return () => {
                     clearInterval(interval)
                     clearInterval(clockInterval)
              }
       }, [])

       if (!data && isLoading) {
              return <div className="min-h-screen bg-black flex items-center justify-center text-white">
                     <span className="text-2xl animate-pulse font-mono">CARGANDO SISTEMA DE TV...</span>
              </div>
       }

       const activeBookings = data?.courts?.map((court: any) => {
              // Find usage for this court RIGHT NOW
              const currentBooking = data.bookings.find((b: any) =>
                     b.courtId === court.id &&
                     new Date(b.startTime) <= currentTime &&
                     new Date(b.endTime) > currentTime
              )
              return { ...court, currentBooking }
       }) || []


       return (
              <div className="min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-brand-green/30">

                     {/* HEADER */}
                     <header className="fixed top-0 inset-x-0 h-24 bg-[#09090b] border-b border-white/10 z-50 flex items-center justify-between px-10 shadow-2xl">
                            <div className="flex items-center gap-6">
                                   <div className="w-16 h-16 bg-brand-green rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(var(--brand-green-rgb),0.4)]">
                                          <span className="text-3xl font-black text-black">TP</span>
                                   </div>
                                   <div>
                                          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                                                 Court<span className="text-brand-green">Ops</span>
                                          </h1>
                                          <div className="flex items-center gap-2 text-white/50 font-medium">
                                                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                 <span>EN VIVO</span>
                                          </div>
                                   </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                   <Clock className="w-8 h-8 text-brand-green" />
                                   <span className="text-4xl font-black font-mono tracking-wider">
                                          {format(currentTime, 'HH:mm')}
                                   </span>
                            </div>
                     </header>

                     {/* MAIN GRID */}
                     <main className="pt-24 h-screen p-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
                            {activeBookings.map((court: any) => (
                                   <div key={court.id} className="relative group">
                                          {/* Card Background with Glow */}
                                          <div className={`absolute inset-0 rounded-[3rem] blur-2xl transition-all duration-1000 opacity-20 ${court.currentBooking ? 'bg-brand-green' : 'bg-blue-500'}`} />

                                          <div className="relative h-full bg-[#121215] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden">

                                                 {/* Court Header */}
                                                 <div className="flex justify-between items-start">
                                                        <h2 className="text-4xl font-black text-white/90 uppercase tracking-tight">{court.name}</h2>
                                                        <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest border ${court.currentBooking
                                                                      ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                                                                      : 'bg-white/5 text-white/30 border-white/5'
                                                               }`}>
                                                               {court.currentBooking ? 'OCUPADA' : 'DISPONIBLE'}
                                                        </span>
                                                 </div>

                                                 {/* Status Indicator */}
                                                 <div className="flex-1 flex flex-col justify-center items-center py-12">
                                                        {court.currentBooking ? (
                                                               <div className="text-center space-y-4">
                                                                      <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-brand-green/30 flex items-center justify-center mb-6">
                                                                             <div className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center animate-pulse">
                                                                                    <span className="material-icons text-5xl text-black">sports_tennis</span>
                                                                             </div>
                                                                      </div>
                                                                      <div>
                                                                             <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-2">JUGANDO AHORA</p>
                                                                             <h3 className="text-3xl font-bold text-white max-w-[250px] mx-auto leading-tight">
                                                                                    {court.currentBooking.client?.name || court.currentBooking.guestName || "Jugador"}
                                                                             </h3>
                                                                      </div>
                                                                      <div className="mt-4 px-6 py-2 bg-brand-green/10 rounded-xl inline-block">
                                                                             <span className="font-mono text-xl text-brand-green font-bold">
                                                                                    {format(new Date(court.currentBooking.endTime), 'HH:mm')} HS
                                                                             </span>
                                                                             <span className="text-brand-green/50 text-xs font-bold uppercase ml-2">FIN</span>
                                                                      </div>
                                                               </div>
                                                        ) : (
                                                               <div className="text-center opacity-30">
                                                                      <div className="w-32 h-32 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-6">
                                                                             <span className="material-icons text-6xl text-white">event_available</span>
                                                                      </div>
                                                                      <h3 className="text-2xl font-bold uppercase">Cancha Libre</h3>
                                                                      <p className="mt-2 text-sm">Reserva ahora en recepción</p>
                                                               </div>
                                                        )}
                                                 </div>

                                                 {/* Next Booking Footer */}
                                                 <div className="w-full pt-6 border-t border-white/5">
                                                        <div className="flex items-center justify-between">
                                                               <span className="text-xs font-bold text-white/30 uppercase tracking-widest">PRÓXIMO TURNO</span>
                                                               <span className="text-xs font-mono font-bold text-white/50">--:--</span>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            ))}
                     </main>

                     {/* MARQUEE FOOTER */}
                     <footer className="fixed bottom-0 inset-x-0 h-16 bg-brand-green text-black flex items-center overflow-hidden whitespace-nowrap z-50">
                            <motion.div
                                   className="flex gap-12 font-black text-2xl uppercase tracking-wider"
                                   animate={{ x: ["0%", "-50%"] }}
                                   transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                            >
                                   <span>🎾 BIENVENIDOS A COURT OPS</span>
                                   <span>🔥 PROMO BEBIDAS: 2x1 EN GATORADE</span>
                                   <span>🏆 TORNEO AMERICANO ÉSTE SABADO - ¡ANOTATE!</span>
                                   <span>🎾 ESCUELA DE MENORES: LUNES Y MIÉRCOLES</span>
                                   {/* Repeat for seamless loop */}
                                   <span>🎾 BIENVENIDOS A COURT OPS</span>
                                   <span>🔥 PROMO BEBIDAS: 2x1 EN GATORADE</span>
                                   <span>🏆 TORNEO AMERICANO ÉSTE SABADO - ¡ANOTATE!</span>
                                   <span>🎾 ESCUELA DE MENORES: LUNES Y MIÉRCOLES</span>
                            </motion.div>
                     </footer>
              </div>
       )
}
