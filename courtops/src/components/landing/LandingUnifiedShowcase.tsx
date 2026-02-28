'use client'

import TurneroGrid from "@/components/TurneroGrid"
import RevenueHeatmap from "@/components/RevenueHeatmap"
import { set } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import {
       ChevronRight, ChevronLeft, CalendarDays, ShoppingCart,
       BarChart3, Fingerprint, Zap, Shield, ArrowRight, Play,
       Smartphone, Monitor, Bell, QrCode, Tv
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- CINEMATIC SIMULATION COMPONENT (DESKTOP) ---
function CinematicSimulation({ type, demoData }: { type: 'turnero' | 'kiosco' | 'metricas' | 'tv', demoData: any }) {
       const [step, setStep] = useState(0)

       useEffect(() => {
              const timer = setInterval(() => {
                     setStep(s => (s + 1) % 4)
              }, 5000)
              return () => clearInterval(timer)
       }, [])

       const cursorPositions = {
              turnero: [
                     { x: '45%', y: '35%', label: 'Seleccionando Cancha...' },
                     { x: '65%', y: '55%', label: 'Confirmando Horario' },
                     { x: '25%', y: '75%', label: 'Añadiendo Cliente' },
                     { x: '50%', y: '50%', label: 'Reserva Exitosa' }
              ],
              kiosco: [
                     { x: '30%', y: '40%', label: 'Agregando Bebida' },
                     { x: '40%', y: '60%', label: 'Sumando Pelotas' },
                     { x: '85%', y: '85%', label: 'Procesando Pago' },
                     { x: '50%', y: '50%', label: 'Venta Finalizada' }
              ],
              metricas: [
                     { x: '20%', y: '30%', label: 'Analizando Ingresos' },
                     { x: '50%', y: '30%', label: 'Revisando Ocupación' },
                     { x: '80%', y: '80%', label: 'Exportando Reporte' },
                     { x: '50%', y: '50%', label: 'Dashboard Actualizado' }
              ],
              tv: [
                     { x: '0%', y: '0%', label: 'Rotación Automática' },
                     { x: '0%', y: '0%', label: 'Próximos Turnos' },
                     { x: '0%', y: '0%', label: 'Promociones Live' },
                     { x: '0%', y: '0%', label: 'Publicidad Activa' }
              ]
       }

       return (
              <div className="relative h-full w-full bg-white dark:bg-black overflow-hidden group">
                     {type !== 'tv' && (
                            <div className="absolute top-8 left-8 z-30 flex items-center gap-4 px-5 py-2.5 bg-black text-white rounded-2xl border border-white/10 shadow-2xl pointer-events-none backdrop-blur-3xl">
                                   <div className="flex h-3 w-3 relative">
                                          <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                                          <div className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></div>
                                   </div>
                                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Simulation System</span>
                            </div>
                     )}

                     <motion.div animate={{ scale: [1, 1.01, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="h-full w-full">
                            {type === 'turnero' && (
                                   <div className="h-full w-full pointer-events-none scale-95 origin-center">
                                          <TurneroGrid date={new Date()} onDateChange={() => { }} onBookingClick={() => { }} onNewBooking={() => { }} demoData={demoData} hideHeader={true} showWaitingList={false} />
                                   </div>
                            )}
                            {type === 'kiosco' && <MockKiosco />}
                            {type === 'metricas' && <MockMetrics />}
                            {type === 'tv' && <MockTVMode />}
                     </motion.div>

                     {type !== 'tv' && (
                            <motion.div animate={{ left: cursorPositions[type][step].x, top: cursorPositions[type][step].y }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }} className="absolute z-50 pointer-events-none">
                                   <div className="relative">
                                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center backdrop-blur-sm shadow-2xl relative">
                                                 <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                                 <div className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-20" />
                                          </div>
                                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={step} className="absolute left-10 top-0 bg-black text-white px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap border border-white/10">
                                                 <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Acción</div>
                                                 <div className="text-sm font-black tracking-tighter">{cursorPositions[type][step].label}</div>
                                          </motion.div>
                                   </div>
                            </motion.div>
                     )}

                     <div className="absolute bottom-10 left-10 right-10 flex gap-2 z-30">
                            {[0, 1, 2, 3].map((i) => (
                                   <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: i === step ? 1 : i < step ? 1 : 0 }} transition={{ duration: i === step ? 5 : 0.5, ease: "linear" }} className="h-full bg-emerald-500 origin-left" />
                                   </div>
                            ))}
                     </div>
              </div>
       )
}

function MockTVMode() {
       return (
              <div className="h-full w-full bg-[#020617] p-12 flex flex-col gap-12 relative overflow-hidden">
                     <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                   <div className="text-emerald-500 text-xs font-black uppercase tracking-[0.4em]">Próximos Turnos</div>
                                   <div className="text-4xl font-black text-white uppercase italic text-shadow-glow">Central Arena</div>
                            </div>
                            <div className="text-right">
                                   <div className="text-5xl font-black text-white tabular-nums">18:45</div>
                                   <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sábado 28 Feb</div>
                            </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 flex-1">
                            {[
                                   { court: "Cancha 1", players: "D'Amico vs Ferrero", time: "19:00", status: "NEXT" },
                                   { court: "Cancha 2", players: "Martinez vs Lopez", time: "19:30", status: "NEXT" }
                            ].map((t, i) => (
                                   <div key={i} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl">
                                          <div className="flex justify-between items-center">
                                                 <span className="text-lg font-black text-white uppercase tracking-tighter">{t.court}</span>
                                                 <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase">En 15 min</div>
                                          </div>
                                          <div className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">{t.players}</div>
                                          <div className="text-6xl font-black text-white/20 tabular-nums">{t.time}</div>
                                   </div>
                            ))}
                     </div>

                     <div className="absolute right-[-100px] top-1/2 -translate-y-1/2 rotate-90 flex items-center gap-12 opacity-10">
                            {[1, 2, 3].map(i => <div key={i} className="text-8xl font-black text-white whitespace-nowrap uppercase tracking-tighter">COURTOPS PREMUM SIGNAGE</div>)}
                     </div>
              </div>
       )
}

function MockKiosco() {
       return (
              <div className="flex h-full text-slate-900 dark:text-white font-sans bg-white dark:bg-black">
                     <div className="flex-1 p-8 sm:p-12 overflow-y-auto relative">
                            <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Venta Rápida</h3>
                            <div className="grid grid-cols-2 gap-6">
                                   {[
                                          { name: "Agua Mineral", price: 1500, img: "💧" },
                                          { name: "Tubo Pelotas", price: 12000, img: "🔋" },
                                          { name: "Alquiler Paleta", price: 3000, img: "🏓" },
                                          { name: "Gatorade Azul", price: 2500, img: "⚡" },
                                   ].map((p, i) => (
                                          <div key={i} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 transition-all group hover:bg-white dark:hover:bg-white/5 hover:shadow-2xl">
                                                 <div className="text-4xl mb-4">{p.img}</div>
                                                 <div className="font-black uppercase text-sm tracking-tight">{p.name}</div>
                                                 <div className="text-emerald-500 font-black text-lg">${p.price.toLocaleString('es-AR')}</div>
                                          </div>
                                   ))}
                            </div>
                     </div>
                     <div className="hidden lg:flex w-80 border-l border-white/5 bg-slate-100 dark:bg-white/[0.01] p-8 flex-col">
                            <h3 className="font-black text-lg mb-8 uppercase flex items-center gap-3">
                                   <ShoppingCart size={20} /> Carrito (2)
                            </h3>
                            <div className="flex-1 space-y-4">
                                   <div className="flex justify-between items-center p-4 bg-white dark:bg-white/5 rounded-2xl border border-white/5">
                                          <span className="font-black text-xs uppercase tracking-tight">Cancha Central</span>
                                          <span className="font-black">$32.000</span>
                                   </div>
                            </div>
                            <div className="pt-8 mt-auto border-t border-white/5">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Total</span>
                                   <span className="text-4xl font-black">$76.000</span>
                            </div>
                     </div>
              </div>
       )
}

function MockMetrics() {
       return (
              <div className="h-full p-10 overflow-y-auto space-y-12 bg-white dark:bg-black relative">
                     <div className="grid grid-cols-3 gap-6">
                            {[
                                   { label: 'Ingresos', value: '$1.2M', color: 'bg-emerald-500/10 text-emerald-500' },
                                   { label: 'Ocupación', value: '84%', color: 'bg-orange-500/10 text-orange-500' },
                                   { label: 'Nuevos', value: '+432', color: 'bg-indigo-500/10 text-indigo-500' },
                            ].map((stat, i) => (
                                   <div key={i} className="bg-slate-50 dark:bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
                                          <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">{stat.label}</div>
                                          <div className="text-3xl font-black">{stat.value}</div>
                                   </div>
                            ))}
                     </div>
                     <div className="bg-slate-50 dark:bg-white/[0.01] border border-white/5 rounded-[3rem] p-10">
                            <h4 className="font-black text-lg mb-8 uppercase">Rentabilidad Semanal</h4>
                            <div className="h-40 bg-white/5 rounded-2xl flex items-end justify-between px-10 pb-4">
                                   {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                          <motion.div
                                                 initial={{ height: 0 }}
                                                 whileInView={{ height: `${h}%` }}
                                                 key={i}
                                                 className="w-8 bg-emerald-500/50 hover:bg-emerald-500 rounded-t-lg transition-all"
                                          />
                                   ))}
                            </div>
                     </div>
              </div>
       )
}

export default function LandingUnifiedShowcase() {
       const [platform, setPlatform] = useState<'desktop' | 'mobile'>('desktop')
       const [activeTab, setActiveTab] = useState<'turnero' | 'kiosco' | 'metricas' | 'tv'>('turnero')
       const [date, setDate] = useState(new Date())

       const demoData = {
              clubId: 'demo',
              config: { openTime: '13:00', closeTime: '23:30', slotDuration: 90 },
              courts: [
                     { id: 1, name: "Cancha Central (Indoor)", sport: "Padel", duration: 90 },
                     { id: 2, name: "Cancha Panorámica", sport: "Padel", duration: 90 },
              ],
              bookings: [
                     {
                            id: 1, courtId: 1,
                            startTime: set(date, { hours: 14, minutes: 30 }).toISOString(),
                            endTime: set(date, { hours: 16, minutes: 0 }).toISOString(),
                            client: { name: "Juan Pérez" }, price: 32000, paymentStatus: 'PAID', status: 'CONFIRMED'
                     }
              ]
       }

       return (
              <section className="py-24 relative overflow-hidden bg-white dark:bg-black">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />

                     <div className="max-w-7xl mx-auto px-4 relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   className="text-center mb-16 space-y-4"
                            >
                                   <div className="inline-flex p-1 bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-2xl mb-6">
                                          <button onClick={() => setPlatform('desktop')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", platform === 'desktop' ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xl" : "text-slate-400")}>
                                                 <Monitor size={14} className="inline mr-2" /> Escritorio
                                          </button>
                                          <button onClick={() => setPlatform('mobile')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", platform === 'mobile' ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xl" : "text-slate-400")}>
                                                 <Smartphone size={14} className="inline mr-2" /> Móvil
                                          </button>
                                   </div>
                                   <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase italic">
                                          Plataforma <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500">Omnicanal.</span>
                                   </h2>
                                   <p className="text-lg text-slate-500 dark:text-zinc-500 font-medium max-w-2xl mx-auto">
                                          Gestiona desde tu PC en el club, controla todo con el móvil, o exhibe tus turnos en el TV del club.
                                   </p>
                            </motion.div>

                            <div className="flex flex-col lg:flex-row gap-8 items-center">
                                   <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full">
                                          {[
                                                 { id: 'turnero', label: 'Agenda Inteligente', icon: CalendarDays, desc: 'Gestión visual de turnos y reservas dinámicas.' },
                                                 { id: 'kiosco', label: 'Kiosko Hub', icon: ShoppingCart, desc: 'Sistema de terminal de venta ultra-rápida.' },
                                                 { id: 'metricas', label: 'Real-time Analytics', icon: BarChart3, desc: 'Métricas de ingresos y ocupación al instante.' },
                                                 { id: 'tv', label: 'Modo TV Social', icon: Tv, desc: 'Cartelería digital automática para tu complejo.' },
                                          ].map((tab) => (
                                                 <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id as any)}
                                                        className={cn(
                                                               "w-full text-left p-6 rounded-3xl border transition-all duration-500 group flex items-start gap-4",
                                                               activeTab === tab.id
                                                                      ? "bg-white dark:bg-white/5 border-emerald-500/20 shadow-2xl scale-105 z-10"
                                                                      : "bg-transparent border-transparent opacity-50 hover:opacity-80"
                                                        )}
                                                 >
                                                        <div className={cn("p-3 rounded-xl transition-all duration-500", activeTab === tab.id ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/30" : "bg-slate-100 dark:bg-white/5 text-slate-400")}>
                                                               <tab.icon size={20} />
                                                        </div>
                                                        <div>
                                                               <h4 className="font-black text-sm text-slate-900 dark:text-white tracking-tight uppercase leading-none mb-1">{tab.label}</h4>
                                                               <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">{tab.desc}</p>
                                                        </div>
                                                 </button>
                                          ))}
                                   </div>

                                   <div className="flex-[1.8] w-full relative">
                                          <AnimatePresence mode="wait">
                                                 {platform === 'desktop' ? (
                                                        <motion.div
                                                               key="desktop"
                                                               initial={{ opacity: 0, scale: 0.95 }}
                                                               animate={{ opacity: 1, scale: 1 }}
                                                               exit={{ opacity: 0, scale: 1.05 }}
                                                               transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                                               className="w-full bg-[#030712] rounded-[3rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden aspect-video relative"
                                                        >
                                                               <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-6 gap-2">
                                                                      <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                                                      <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                                                      <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                                               </div>
                                                               <div className="absolute inset-x-0 bottom-0 top-10">
                                                                      <CinematicSimulation type={activeTab} demoData={demoData} />
                                                               </div>
                                                        </motion.div>
                                                 ) : (
                                                        <motion.div
                                                               key="mobile"
                                                               initial={{ opacity: 0, y: 50, rotateX: 20 }}
                                                               animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                                               exit={{ opacity: 0, y: -50, rotateX: -20 }}
                                                               transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                                               className="mx-auto w-[310px] aspect-[9/19] bg-[#030712] rounded-[3rem] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden"
                                                        >
                                                               <div className="h-full w-full p-6 pt-12 flex flex-col gap-6">
                                                                      <div className="flex justify-between items-center px-2">
                                                                             <div className="font-black text-white text-xl uppercase tracking-tighter">CourtOps</div>
                                                                             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Bell size={14} className="text-zinc-500" /></div>
                                                                      </div>
                                                                      <div className="bg-emerald-500 p-6 rounded-[2rem] shadow-xl shadow-emerald-500/20">
                                                                             <div className="text-[9px] font-black uppercase tracking-widest text-emerald-950/60 mb-1">Ventas de Hoy</div>
                                                                             <div className="text-3xl font-black text-emerald-950 tracking-tighter">$345.200</div>
                                                                      </div>
                                                                      <div className="flex-1 space-y-3">
                                                                             {[1, 2, 3].map(i => (
                                                                                    <div key={i} className="flex gap-4 items-center p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                                                                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 font-black text-xs">{i}5m</div>
                                                                                           <div className="flex-1">
                                                                                                  <div className="text-[10px] font-black text-white uppercase tracking-tight">Cancha Panorámica {i}</div>
                                                                                                  <div className="text-[8px] text-zinc-500 uppercase font-black">En curso</div>
                                                                                           </div>
                                                                                           <ChevronRight size={14} className="text-zinc-600" />
                                                                                    </div>
                                                                             ))}
                                                                      </div>
                                                               </div>
                                                               <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-b-xl z-20" />
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
