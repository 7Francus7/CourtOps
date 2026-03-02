'use client'

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
       Monitor, Smartphone, CalendarDays, ShoppingCart,
       BarChart3, Tv, ChevronRight, Bell, Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePerformance } from "@/contexts/PerformanceContext"

// --- REFINED SIMULATION COMPONENTS ---

function MockKiosco() {
       return (
              <div className="flex flex-col sm:flex-row h-full bg-white dark:bg-[#080808] border-t border-slate-100 dark:border-white/5 overflow-hidden">
                     <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 tracking-tight text-slate-900 dark:text-white uppercase">Venta Rápida</h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                   {[
                                          { name: "Agua", price: 1500, img: "💧" },
                                          { name: "Pelotas", price: 12000, img: "🔋" },
                                          { name: "Alquiler", price: 3000, img: "🏓" },
                                          { name: "Gatorade", price: 2500, img: "⚡" },
                                   ].map((p, i) => (
                                          <div key={i} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4">
                                                 <div className="text-xl md:text-2xl mb-1 md:mb-2">{p.img}</div>
                                                 <div className="font-bold text-[8px] md:text-[10px] uppercase text-slate-500 dark:text-zinc-500">{p.name}</div>
                                                 <div className="text-emerald-500 font-bold text-xs md:text-sm">${p.price.toLocaleString('es-AR')}</div>
                                          </div>
                                   ))}
                            </div>
                     </div>
                     <div className="w-full sm:w-56 md:w-64 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] p-6 flex flex-col">
                            <h3 className="font-bold text-[10px] mb-4 md:mb-6 uppercase tracking-widest text-slate-400">Carrito (2)</h3>
                            <div className="space-y-3">
                                   <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex justify-between items-center">
                                          <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">CANCHA 1</span>
                                          <span className="text-xs font-bold text-slate-900 dark:text-white">$32k</span>
                                   </div>
                            </div>
                            <div className="mt-6 sm:mt-auto pt-4 md:pt-6 border-t border-slate-100 dark:border-white/5">
                                   <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Total</div>
                                   <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">$34.500</div>
                            </div>
                     </div>
              </div>
       )
}

function MockMetrics() {
       return (
              <div className="h-full p-6 md:p-8 space-y-6 md:space-y-8 bg-white dark:bg-[#080808] border-t border-slate-100 dark:border-white/5 overflow-y-auto">
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                            {[
                                   { label: 'INGRESOS', value: '$1.2M', color: 'text-emerald-500' },
                                   { label: 'OCUPACIÓN', value: '84%', color: 'text-indigo-500' },
                                   { label: 'NUEVOS', value: '+432', color: 'text-slate-900 dark:text-white' },
                            ].map((stat, i) => (
                                   <div key={i} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-4 md:p-5 rounded-2xl">
                                          <div className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{stat.label}</div>
                                          <div className={cn("text-lg md:text-xl font-bold", stat.color)}>{stat.value}</div>
                                   </div>
                            ))}
                     </div>
                     <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl p-4 md:p-6 text-center sm:text-left">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                   <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Rentabilidad Semanal</h4>
                                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <div className="h-24 md:h-32 flex items-end justify-between gap-1 md:gap-2 px-1">
                                   {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                          <div key={i} className="flex-1 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-t-lg relative group">
                                                 <motion.div
                                                        initial={{ height: 0 }}
                                                        whileInView={{ height: `${h}%` }}
                                                        className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-lg transition-all group-hover:bg-emerald-400"
                                                 />
                                          </div>
                                   ))}
                            </div>
                     </div>
              </div>
       )
}

function MockTVMode() {
       return (
              <div className="h-full w-full bg-slate-950 p-6 md:p-10 flex flex-col gap-6 md:gap-10 relative overflow-hidden">
                     <div className="flex justify-between items-center pb-6 border-b border-white/5">
                            <div className="space-y-1">
                                   <div className="text-emerald-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Live Feed</div>
                                   <div className="text-xl md:text-3xl font-bold text-white uppercase tracking-tight">CENTRAL ARENA</div>
                            </div>
                            <div className="text-right">
                                   <div className="text-2xl md:text-4xl font-bold text-white tabular-nums">18:45</div>
                                   <div className="text-emerald-500/50 text-[8px] font-bold uppercase tracking-widest">Sábado 28 Feb</div>
                            </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 flex-1">
                            {[
                                   { court: "Cancha 1", players: "D'Amico vs Ferrero", time: "19:00" },
                                   { court: "Cancha 2", players: "Martinez vs Lopez", time: "19:30" }
                            ].map((t, i) => (
                                   <div key={i} className="bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl">
                                          <div className="flex justify-between items-center">
                                                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.court}</span>
                                                 <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[7px] font-bold uppercase">En 15 min</div>
                                          </div>
                                          <div className="text-lg md:text-2xl font-bold text-white tracking-tight leading-tight my-2">{t.players}</div>
                                          <div className="text-2xl md:text-4xl font-bold text-white/10 tabular-nums">{t.time}</div>
                                   </div>
                            ))}
                     </div>
              </div>
       )
}

// --- MAIN SHOWCASE COMPONENT ---

export default function LandingUnifiedShowcase() {
       const [platform, setPlatform] = useState<'desktop' | 'mobile'>('desktop')
       const [activeTab, setActiveTab] = useState<'turnero' | 'kiosco' | 'metricas' | 'tv'>('turnero')
       const { isLowEnd } = usePerformance()
       const [step, setStep] = useState(0)

       useEffect(() => {
              if (isLowEnd) return;
              const timer = setInterval(() => {
                     setStep(s => (s + 1) % 4)
              }, 4000)
              return () => clearInterval(timer)
       }, [isLowEnd])

       const cursorPositions = {
              turnero: { x: '45.7%', y: '45.1%', label: 'Seleccionando Cancha...' },
              kiosco: { x: '35%', y: '40%', label: 'Agregando Bebida' },
              metricas: { x: '25%', y: '35%', label: 'Analizando Ingresos' },
              tv: { x: '0%', y: '0%', label: '' }
       }

       return (
              <section className="py-20 md:py-32 relative overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-700">
                     <div className="max-w-7xl mx-auto px-6 relative z-10">

                            {/* Platform Switcher */}
                            <div className="flex justify-center mb-10 md:mb-16">
                                   <div className="inline-flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                                          <button
                                                 onClick={() => setPlatform('desktop')}
                                                 className={cn("px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2", platform === 'desktop' ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400")}
                                          >
                                                 <Monitor size={14} /> Escritorio
                                          </button>
                                          <button
                                                 onClick={() => setPlatform('mobile')}
                                                 className={cn("px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2", platform === 'mobile' ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400")}
                                          >
                                                 <Smartphone size={14} /> Móvil
                                          </button>
                                   </div>
                            </div>

                            {/* Header */}
                            <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto space-y-4">
                                   <h2 className="text-3xl sm:text-4xl md:text-7xl font-medium text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                                          Plataforma <span className="text-slate-400 dark:text-zinc-600">Omnicanal.</span>
                                   </h2>
                                   <p className="text-slate-500 dark:text-zinc-500 text-base md:text-lg leading-relaxed px-4">
                                          Gestiona desde tu PC, controla con el móvil, o exhibe los turnos en el TV del club.
                                   </p>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center">

                                   {/* List of Features (Tabs) */}
                                   <div className="flex-1 w-full space-y-2 md:space-y-3 order-2 lg:order-1">
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
                                                               "w-full text-left p-4 md:p-6 rounded-2xl border transition-all duration-300 group flex items-start gap-4 md:gap-5",
                                                               activeTab === tab.id
                                                                      ? "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/10 shadow-lg dark:shadow-white/[0.02]"
                                                                      : "bg-transparent border-transparent opacity-40 hover:opacity-100"
                                                        )}
                                                 >
                                                        <div className={cn(
                                                               "p-2.5 md:p-3 rounded-xl transition-all duration-300",
                                                               activeTab === tab.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                                                        )}>
                                                               <tab.icon size={18} />
                                                        </div>
                                                        <div className="space-y-1">
                                                               <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white tracking-tight uppercase">{tab.label}</h4>
                                                               <p className="text-[10px] md:text-xs text-slate-500 dark:text-zinc-500 leading-tight">{tab.desc}</p>
                                                        </div>
                                                 </button>
                                          ))}
                                   </div>

                                   {/* Mockup Frame Content */}
                                   <div className="flex-[1.8] w-full relative order-1 lg:order-2">
                                          <AnimatePresence mode="wait">
                                                 {platform === 'desktop' ? (
                                                        <motion.div
                                                               key="desktop"
                                                               initial={{ opacity: 0, scale: 0.98 }}
                                                               animate={{ opacity: 1, scale: 1 }}
                                                               exit={{ opacity: 0, scale: 1.02 }}
                                                               className="w-full bg-white dark:bg-[#0a0a0a] rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden aspect-[4/3] sm:aspect-video relative"
                                                        >
                                                               <div className="h-8 md:h-10 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center px-4 md:px-6 gap-2">
                                                                      <div className="flex gap-1.5 opacity-30">
                                                                             <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-400" />
                                                                             <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-400" />
                                                                             <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-slate-400" />
                                                                      </div>
                                                               </div>
                                                               <div className="absolute inset-0 top-8 md:top-10 overflow-hidden">
                                                                      {activeTab === 'turnero' && (
                                                                             <div className="h-full w-full pointer-events-none scale-[0.85] sm:scale-90 origin-top pt-4">
                                                                                    <div className="p-4 md:p-8 h-full bg-white dark:bg-[#080808] rounded-xl border border-slate-100 dark:border-white/5">
                                                                                           <div className="flex justify-between items-center mb-6 md:mb-8">
                                                                                                  <div className="h-3 md:h-4 w-24 md:w-32 bg-slate-100 dark:bg-white/5 rounded-full" />
                                                                                                  <div className="h-6 md:h-8 w-6 md:w-8 rounded-full bg-emerald-500" />
                                                                                           </div>
                                                                                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 h-full">
                                                                                                  {[...Array(8)].map((_, i) => (
                                                                                                         <div key={i} className={cn(
                                                                                                                "rounded-xl border border-slate-100 dark:border-white/5 h-20 md:h-24 p-3 flex flex-col justify-end",
                                                                                                                i === step + 2 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-slate-50/50 dark:bg-white/[0.01]"
                                                                                                         )}>
                                                                                                                <div className="h-1.5 w-10 md:w-12 bg-slate-200 dark:bg-white/5 rounded-full mb-1" />
                                                                                                                <div className="h-1 w-6 md:w-8 bg-slate-200 dark:bg-white/5 rounded-full" />
                                                                                                         </div>
                                                                                                  ))}
                                                                                           </div>
                                                                                    </div>
                                                                             </div>
                                                                      )}
                                                                      {activeTab === 'kiosco' && <MockKiosco />}
                                                                      {activeTab === 'metricas' && <MockMetrics />}
                                                                      {activeTab === 'tv' && <MockTVMode />}

                                                                      {/* Subtle Simulation Cursor */}
                                                                      {activeTab !== 'tv' && (
                                                                             <motion.div
                                                                                    animate={{
                                                                                           left: cursorPositions[activeTab].x,
                                                                                           top: cursorPositions[activeTab].y
                                                                                    }}
                                                                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                                                                    className="absolute z-50 pointer-events-none hidden sm:block"
                                                                             >
                                                                                    <div className="relative">
                                                                                           <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center backdrop-blur-sm">
                                                                                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                                           </div>
                                                                                           <div className="absolute left-8 top-0 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-[9px] font-bold uppercase tracking-widest border border-white/10 whitespace-nowrap">
                                                                                                  {cursorPositions[activeTab].label}
                                                                                           </div>
                                                                                    </div>
                                                                             </motion.div>
                                                                      )}
                                                               </div>
                                                        </motion.div>
                                                 ) : (
                                                        <motion.div
                                                               key="mobile"
                                                               initial={{ opacity: 0, scale: 0.95 }}
                                                               animate={{ opacity: 1, scale: 1 }}
                                                               exit={{ opacity: 0, scale: 1.05 }}
                                                               className="mx-auto w-[240px] md:w-[300px] aspect-[9/18.5] bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] md:rounded-[3rem] border-[6px] md:border-8 border-slate-100 dark:border-zinc-900 shadow-2xl relative overflow-hidden"
                                                        >
                                                               <div className="p-4 md:p-6 pt-10 md:pt-12 flex flex-col gap-4 md:gap-6">
                                                                      <div className="flex justify-between items-center mb-2 md:mb-4">
                                                                             <div className="h-3 md:h-4 w-16 md:w-20 bg-slate-100 dark:bg-white/5 rounded-full" />
                                                                             <Bell size={16} className="text-slate-400" />
                                                                      </div>
                                                                      <div className="bg-emerald-500 p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl shadow-xl shadow-emerald-500/20">
                                                                             <div className="text-[8px] md:text-[10px] font-bold text-emerald-950/50 uppercase tracking-widest mb-1">Ventas de Hoy</div>
                                                                             <div className="text-2xl md:text-3xl font-bold text-emerald-950 tracking-tight">$345.200</div>
                                                                      </div>
                                                                      <div className="space-y-2 md:space-y-3">
                                                                             {[1, 2, 3].map(i => (
                                                                                    <div key={i} className="p-3 md:p-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl md:rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                                                           <div className="flex items-center gap-3">
                                                                                                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-emerald-500 font-bold text-[10px] md:text-xs">{(i + 1) * 15}m</div>
                                                                                                  <div className="h-2.5 w-12 md:w-16 bg-slate-200 dark:bg-white/5 rounded-full" />
                                                                                           </div>
                                                                                           <ChevronRight size={12} className="text-slate-300" />
                                                                                    </div>
                                                                             ))}
                                                                      </div>
                                                               </div>
                                                               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-20 h-4 md:h-5 bg-slate-100 dark:bg-zinc-900 rounded-b-xl z-20" />
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
