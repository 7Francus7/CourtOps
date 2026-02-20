
'use client'

import TurneroGrid from "@/components/TurneroGrid"
import RevenueHeatmap from "@/components/RevenueHeatmap"
import { addHours, set, format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronRight, ChevronLeft, CalendarDays, ShoppingCart, BarChart3, Fingerprint, Zap, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

// --- MOCK COMPONENTS FOR KIOSCO & METRICS ---

function MockKiosco() {
       return (
              <div className="flex h-full text-slate-900 dark:text-white font-sans bg-[#f8fafc] dark:bg-[#030712]">
                     <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                                   <Zap size={20} className="text-emerald-500" /> Venta Rápida
                            </h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                   {[
                                          { name: "Reserva de Turno", price: 32000, img: "🎾", glow: "hover:shadow-emerald-500/20" },
                                          { name: "Agua Mineral", price: 1500, img: "💧", glow: "hover:shadow-blue-500/20" },
                                          { name: "Tubo Pelotas", price: 12000, img: "🔋", glow: "hover:shadow-yellow-500/20" },
                                          { name: "Alquiler Paleta", price: 3000, img: "🏓", glow: "hover:shadow-orange-500/20" },
                                          { name: "Gatorade Azul", price: 2500, img: "⚡", glow: "hover:shadow-cyan-500/20" },
                                          { name: "Proteína Bar", price: 3500, img: "🍫", glow: "hover:shadow-purple-500/20" },
                                   ].map((p, i) => (
                                          <div key={i} className={cn("bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-[1.5rem] p-5 transition-all duration-300 cursor-pointer group hover:-translate-y-1 shadow-sm backdrop-blur-md", p.glow)}>
                                                 <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-500">{p.img}</div>
                                                 <div className="font-bold text-slate-800 dark:text-zinc-200 mb-1">{p.name}</div>
                                                 <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm">${p.price.toLocaleString('es-AR')}</div>
                                          </div>
                                   ))}
                            </div>
                     </div>
                     <div className="hidden lg:flex w-96 border-l border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl p-8 flex-col shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.1)]">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-slate-800 dark:text-white pb-6 border-b border-slate-200 dark:border-white/10">
                                   <ShoppingCart size={22} className="text-emerald-500" /> Resumen de Cobro
                            </h3>
                            <div className="flex-1 space-y-4">
                                   <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent dark:hover:border-white/10 transition-colors">
                                          <div className="flex items-center gap-3">
                                                 <span className="w-6 h-6 rounded bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-400">2</span>
                                                 <span className="font-medium text-slate-700 dark:text-zinc-300">Reserva de Turno</span>
                                          </div>
                                          <span className="font-bold text-slate-900 dark:text-white">$64,000</span>
                                   </div>
                                   <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent dark:hover:border-white/10 transition-colors">
                                          <div className="flex items-center gap-3">
                                                 <span className="w-6 h-6 rounded bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-400">1</span>
                                                 <span className="font-medium text-slate-700 dark:text-zinc-300">Tubo Pelotas</span>
                                          </div>
                                          <span className="font-bold text-slate-900 dark:text-white">$12,000</span>
                                   </div>
                            </div>
                            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10">
                                   <div className="flex justify-between items-end mb-6">
                                          <span className="text-slate-500 dark:text-zinc-400 font-medium">Total a pagar</span>
                                          <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">$76,000</span>
                                   </div>
                                   <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                          Procesar Pago <Fingerprint size={18} />
                                   </button>
                            </div>
                     </div>
              </div>
       )
}

function MockMetrics() {
       const demoHeatmap = Array.from({ length: 40 }, (_, i) => ({
              day: Math.floor(Math.random() * 7),
              hour: Math.floor(Math.random() * 9) + 14,
              value: Math.floor(Math.random() * 10)
       }))

       return (
              <div className="h-full p-6 lg:p-8 overflow-y-auto space-y-8 bg-[#f8fafc] dark:bg-[#030712]">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-6 rounded-[1.5rem] shadow-sm backdrop-blur-md relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                                   <div className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2">Ingresos Hoy</div>
                                   <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">$145,000</div>
                                   <div className="flex items-center gap-1 mt-4">
                                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">+12.5%</span>
                                          <span className="text-xs text-slate-500 dark:text-zinc-500">vs ayer</span>
                                   </div>
                            </div>
                            <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-6 rounded-[1.5rem] shadow-sm backdrop-blur-md relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                                   <div className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2">Ocupación Promedio</div>
                                   <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">85%</div>
                                   <div className="flex items-center gap-1 mt-4">
                                          <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold">Alta Demanda</span>
                                   </div>
                            </div>
                            <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-6 rounded-[1.5rem] shadow-sm backdrop-blur-md relative overflow-hidden group">
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                                   <div className="text-slate-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider mb-2">Canastas Jugadas</div>
                                   <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">124</div>
                                   <div className="flex items-center gap-1 mt-4">
                                          <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Esta semana</span>
                                   </div>
                            </div>
                     </div>

                     <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[1.5rem] p-6 lg:p-8 shadow-sm backdrop-blur-xl">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">Mapa de Calor: Ocupación por Hora</h3>
                            <div className="opacity-90">
                                   <RevenueHeatmap demoData={demoHeatmap} />
                            </div>
                     </div>
              </div>
       )
}


export default function LandingShowcase() {
       const [date, setDate] = useState(new Date())
       const [activeTab, setActiveTab] = useState<'turnero' | 'kiosco' | 'metricas' | 'torneos'>('turnero')

       const tabs = [
              { id: 'turnero', label: 'Turnero Inteligente', icon: CalendarDays },
              { id: 'kiosco', label: 'Punto de Venta', icon: ShoppingCart },
              { id: 'metricas', label: 'Reportes y Métricas', icon: BarChart3 },
       ]

       // Create dynamic demo data for "Today"
       const demoData = {
              clubId: 'demo',
              config: { openTime: '13:00', closeTime: '23:30', slotDuration: 90 },
              courts: [
                     { id: 1, name: "Cancha Central (Indoor)", sport: "Padel", duration: 90 },
                     { id: 2, name: "Cancha Panorámica", sport: "Padel", duration: 90 },
                     { id: 3, name: "Cancha 3 Descubierta", sport: "Padel", duration: 90 },
              ],
              bookings: [
                     {
                            id: 1,
                            courtId: 1,
                            startTime: set(date, { hours: 14, minutes: 30 }).toISOString(),
                            endTime: set(date, { hours: 16, minutes: 0 }).toISOString(),
                            client: { name: "Juan Pérez", phone: "11-1234-5678" },
                            price: 32000,
                            paymentStatus: 'PAID',
                            status: 'CONFIRMED',
                            transactions: [{ amount: 32000 }]
                     },
                     {
                            id: 2,
                            courtId: 2,
                            startTime: set(date, { hours: 16, minutes: 0 }).toISOString(),
                            endTime: set(date, { hours: 17, minutes: 30 }).toISOString(),
                            client: { name: "Torneo Mensual" },
                            items: [{ unitPrice: 2000, quantity: 4, product: { name: "Pelotas" } }],
                            price: 32000,
                            paymentStatus: 'PARTIAL',
                            status: 'CONFIRMED',
                            transactions: [{ amount: 15000 }]
                     },
                     {
                            id: 3,
                            courtId: 1,
                            startTime: set(date, { hours: 19, minutes: 0 }).toISOString(),
                            endTime: set(date, { hours: 20, minutes: 30 }).toISOString(),
                            client: { name: "Reserva App Móvil" },
                            price: 35000,
                            paymentStatus: 'PENDING',
                            status: 'PENDING',
                            transactions: []
                     },
                     {
                            id: 4,
                            courtId: 3,
                            startTime: set(date, { hours: 20, minutes: 30 }).toISOString(),
                            endTime: set(date, { hours: 22, minutes: 0 }).toISOString(),
                            client: { name: "Clase Prof. Martin" },
                            price: 28000,
                            paymentStatus: 'PAID',
                            status: 'CONFIRMED',
                            transactions: [{ amount: 28000 }]
                     }
              ]
       }

       const handleNext = () => {
              const idx = tabs.findIndex(t => t.id === activeTab)
              const next = (idx + 1) % tabs.length
              setActiveTab(tabs[next].id as any)
       }

       const handlePrev = () => {
              const idx = tabs.findIndex(t => t.id === activeTab)
              const prev = (idx - 1 + tabs.length) % tabs.length
              setActiveTab(tabs[prev].id as any)
       }

       return (
              <section className="py-24 md:py-32 bg-slate-50 dark:bg-[#030712] overflow-hidden relative">
                     {/* Cinematic Background Glows */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
                     <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

                     <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8 }}
                                   className="text-center mb-16"
                            >
                                   <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                                          Un ecosistema completo, <br className="hidden md:block" />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                                 en una sola pantalla.
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                          Olvídate de usar múltiples herramientas. CourtOps integra agenda, facturación y reportes en una interfaz unificada y elegante.
                                   </p>
                            </motion.div>

                            {/* CONTROLS */}
                            <div className="flex justify-start md:justify-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-4 md:pb-0 px-4 md:px-0 scroll-smooth">
                                   {tabs.map(tab => {
                                          const isActive = activeTab === tab.id;
                                          return (
                                                 <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id as any)}
                                                        className={cn(
                                                               "flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap shrink-0 border",
                                                               isActive
                                                                      ? "bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_30px_rgba(255,255,255,0.2)] scale-105"
                                                                      : "bg-white/50 dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white backdrop-blur-md"
                                                        )}
                                                 >
                                                        <tab.icon size={18} className={isActive ? "text-emerald-400 dark:text-emerald-600" : "text-slate-400 dark:text-zinc-500"} />
                                                        {tab.label}
                                                 </button>
                                          )
                                   })}
                            </div>

                            {/* MOCKUP FRAME */}
                            <motion.div
                                   initial={{ opacity: 0, y: 50 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8, delay: 0.2 }}
                                   className="relative max-w-6xl mx-auto perspective-[2000px]"
                            >
                                   {/* Glow behind mockup */}
                                   <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                                   {/* WINDOW CHROME */}
                                   <div className="bg-slate-100 dark:bg-[#0A101A] rounded-2xl md:rounded-[2rem] border border-slate-200/50 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden min-h-[500px] md:min-h-[700px] flex flex-col relative transform-gpu transition-transform duration-700 hover:scale-[1.01] backdrop-blur-2xl ring-1 ring-white/50 dark:ring-white/5">

                                          {/* Window Header */}
                                          <div className="h-12 bg-white/50 dark:bg-[#030712]/50 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 flex items-center px-6 gap-4 shrink-0 justify-between">
                                                 <div className="flex gap-2">
                                                        <div className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-inner" />
                                                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-inner" />
                                                        <div className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-inner" />
                                                 </div>
                                                 <div className="flex-1 flex justify-center">
                                                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-md bg-white/60 dark:bg-black/40 shadow-sm border border-slate-200/50 dark:border-white/5 text-[11px] font-medium text-slate-500 dark:text-zinc-400 backdrop-blur-md min-w-[200px] justify-center">
                                                               <Shield size={12} className="text-emerald-500" /> courtops.net/app/{activeTab}
                                                        </div>
                                                 </div>
                                                 <div className="w-16" /> {/* Spacer for centering */}
                                          </div>

                                          {/* LIVE COMPONENT PREVIEW */}
                                          <div className="flex-1 bg-white/30 dark:bg-transparent p-3 sm:p-5 relative overflow-hidden">
                                                 <div className="h-full border border-slate-200/60 dark:border-white/5 rounded-xl md:rounded-2xl overflow-hidden bg-white dark:bg-[#050A14] relative shadow-inner">
                                                        <AnimatePresence mode="wait">
                                                               <motion.div
                                                                      key={activeTab}
                                                                      initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                                                                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                                                      exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                                                                      transition={{ duration: 0.4, ease: "easeInOut" }}
                                                                      className="h-full w-full"
                                                               >
                                                                      {activeTab === 'turnero' && (
                                                                             <div className="h-full opacity-95 hover:opacity-100 transition-opacity">
                                                                                    <TurneroGrid
                                                                                           date={date}
                                                                                           onDateChange={setDate}
                                                                                           onBookingClick={() => { }}
                                                                                           onNewBooking={() => { }}
                                                                                           demoData={demoData}
                                                                                           hideHeader={true} // Cleaner look for demo
                                                                                           showWaitingList={false}
                                                                                    />
                                                                             </div>
                                                                      )}
                                                                      {activeTab === 'kiosco' && <MockKiosco />}
                                                                      {activeTab === 'metricas' && <MockMetrics />}
                                                               </motion.div>
                                                        </AnimatePresence>
                                                 </div>
                                          </div>

                                          {/* Navigation Arrows (Floating Overlay) */}
                                          <button
                                                 onClick={handlePrev}
                                                 className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white hover:bg-white dark:hover:bg-black transition-all shadow-2xl z-50 group hidden md:block opacity-0 md:opacity-100 hover:scale-110"
                                          >
                                                 <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                          </button>
                                          <button
                                                 onClick={handleNext}
                                                 className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white hover:bg-white dark:hover:bg-black transition-all shadow-2xl z-50 group hidden md:block opacity-0 md:opacity-100 hover:scale-110"
                                          >
                                                 <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                          </button>
                                   </div>

                            </motion.div>
                     </div>
              </section>
       )
}
