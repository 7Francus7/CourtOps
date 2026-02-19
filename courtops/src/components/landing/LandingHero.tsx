
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
       return (
              <section className="relative min-h-[95vh] flex flex-col items-center justify-start pt-32 md:pt-48 p-6 overflow-hidden bg-white dark:bg-[#0a0a0a]">

                     {/* Dynamic Background */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-white to-white dark:from-background dark:via-background dark:to-background" />
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none opacity-60 animate-pulse" />
                     <div className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none opacity-60" />
                     <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-accent/20 rounded-full blur-[80px] pointer-events-none" />

                     {/* Grid Pattern */}
                     <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,black,rgba(255,255,255,0))]" style={{ opacity: 0.03 }} />

                     <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 text-center space-y-8 max-w-5xl mx-auto px-4"
                     >


                            {/* Headline */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-none drop-shadow-sm mb-6">
                                   Tu club, <br />
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent dark:from-primary dark:via-purple-400 dark:to-accent">
                                          en piloto automático.
                                   </span>
                            </h1>

                            <p className="text-lg md:text-2xl text-slate-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">
                                   La plataforma definitiva para clubes deportivos. <br className="hidden md:block" />
                                   <span className="text-slate-900 dark:text-white font-bold">Reservas, Pagos, Kiosco y Métricas</span> en un solo lugar.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col items-center gap-6 mt-10">
                                   <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full">
                                          <Link href="/register" className="group relative w-full sm:w-auto">
                                                 <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-200" />
                                                 <button className="relative w-full sm:w-auto px-8 py-5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-lg transition-transform active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-primary/25">
                                                        Prueba Gratis 14 Días
                                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                                 </button>
                                          </Link>

                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20ver%20una%20demo%20de%20CourtOps%20%F0%9F%91%80"
                                                 target="_blank"
                                                 className="w-full sm:w-auto px-8 py-5 bg-background border border-border text-foreground hover:bg-secondary/10 dark:bg-white/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white dark:hover:border-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-3 active:scale-95 group shadow-sm"
                                          >
                                                 <Play size={18} fill="currentColor" className="text-muted-foreground group-hover:text-primary transition-colors" />
                                                 Ver Demo en Vivo
                                          </a>
                                   </div>

                                   <Link href="/calculator" className="text-muted-foreground hover:text-accent font-medium text-sm flex items-center gap-2 transition-colors border-b border-transparent hover:border-accent pb-0.5">
                                          🔥 Calcular cuánto dinero estoy perdiendo por mes
                                   </Link>
                            </div>



                     </motion.div>

                     {/* 3D Mockup Container */}
                     <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            transition={{ delay: 0.4, duration: 1.2, type: "spring" }}
                            className="mt-16 w-full max-w-6xl mx-auto perspective-1000 hidden md:block group relative z-20"
                     >
                            {/* Glow Behind */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                            <div className="relative rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl shadow-black/80 overflow-hidden h-[650px] flex flex-col">

                                   {/* Dashboard Header */}
                                   <div className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#09090b]">
                                          <div className="flex items-center gap-6">
                                                 <span className="font-bold text-white text-sm">Dashboard</span>
                                                 <span className="font-medium text-zinc-500 text-sm">Vista General</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                                 <div className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm shadow-primary/10">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">+ Nueva Reserva</span>
                                                 </div>
                                                 <div className="w-8 h-8 rounded-full bg-zinc-800" />
                                          </div>
                                   </div>

                                   {/* Dashboard Content */}
                                   <div className="p-6 flex flex-col gap-6 h-full bg-[#09090b]">

                                          {/* Stats Row */}
                                          <div className="grid grid-cols-4 gap-4">
                                                 {/* Ingresos - Dark Card */}
                                                 <div className="bg-[#121212] p-4 rounded-xl border border-white/5 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ingresos Hoy</p>
                                                        <h3 className="text-2xl font-black text-white tracking-tighter">$124.500</h3>
                                                 </div>

                                                 {/* Reservas Activas */}
                                                 <div className="bg-[#121212] p-4 rounded-xl border border-white/5 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reservas Activas</p>
                                                        <h3 className="text-2xl font-black text-white tracking-tighter">18</h3>
                                                 </div>

                                                 {/* Clientes Nuevos */}
                                                 <div className="bg-[#121212] p-4 rounded-xl border border-white/5 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Clientes Nuevos</p>
                                                        <h3 className="text-2xl font-black text-white tracking-tighter">+5</h3>
                                                 </div>

                                                 {/* Ocupación */}
                                                 <div className="bg-[#121212] p-4 rounded-xl border border-white/5 flex flex-col gap-1 shadow-lg relative overflow-hidden justify-center">
                                                        <div className="flex justify-between items-end mb-2">
                                                               <div>
                                                                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ocupación</p>
                                                                      <h3 className="text-2xl font-black text-white tracking-tighter">85%</h3>
                                                               </div>
                                                        </div>
                                                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                               <div className="h-full bg-primary rounded-full w-[85%]" />
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Turnero Grid Container */}
                                          <div className="flex-1 bg-[#121212]/50 border border-white/5 rounded-xl overflow-hidden flex flex-col relative">
                                                 {/* Grid Header */}
                                                 <div className="flex border-b border-white/5">
                                                        <div className="w-12 border-r border-white/5" /> {/* Time Col Header */}
                                                        {['Cancha 1 (Cristal)', 'Cancha 2 (Panorámica)', 'Cancha 3', 'Cancha 4'].map((name, i) => (
                                                               <div key={i} className={`flex-1 py-3 text-center border-r border-white/5 last:border-r-0`}>
                                                                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{name}</span>
                                                               </div>
                                                        ))}
                                                 </div>

                                                 {/* Grid Content */}
                                                 <div className="flex-1 overflow-hidden relative">
                                                        {/* Gradient Fade at bottom */}
                                                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#09090b] to-transparent z-10 pointer-events-none" />

                                                        {[17, 18, 19, 20, 21, 22].map((hour, rowIndex) => (
                                                               <div key={hour} className="flex border-b border-white/5 h-20">
                                                                      {/* Time Column */}
                                                                      <div className="w-12 border-r border-white/5 flex items-center justify-center bg-[#09090b]">
                                                                             <span className="text-[10px] font-medium text-zinc-600">{hour}:00</span>
                                                                      </div>

                                                                      {/* Slots */}
                                                                      {[0, 1, 2, 3].map((colIndex) => {
                                                                             // Mock Data Logic
                                                                             // Row 17:00 -> Col 1 (Seña), Col 4 (Empty)
                                                                             // Row 18:00 -> Col 0 (Seña), Col 3 (Pagado)
                                                                             // Row 19:00 -> Col 2 (Pagado)
                                                                             // Row 20:00 -> Col 1 (Pagado)
                                                                             // Row 21:00 -> Col 0 (Pagado), Col 3 (Seña)
                                                                             // Row 22:00 -> Col 2 (Seña)

                                                                             let content = null

                                                                             if (hour === 17 && colIndex === 1) content = { type: 'sena', name: 'Juan Pérez' }
                                                                             if (hour === 18 && colIndex === 0) content = { type: 'sena', name: 'Juan Pérez' }
                                                                             if (hour === 18 && colIndex === 3) content = { type: 'pagado', name: 'Juan Pérez' }
                                                                             if (hour === 19 && colIndex === 2) content = { type: 'pagado', name: 'Juan Pérez' }
                                                                             if (hour === 20 && colIndex === 1) content = { type: 'pagado', name: 'Juan Pérez' }
                                                                             if (hour === 21 && colIndex === 0) content = { type: 'pagado', name: 'Juan Pérez' }
                                                                             if (hour === 21 && colIndex === 3) content = { type: 'sena', name: 'Juan Pérez' }
                                                                             if (hour === 22 && colIndex === 2) content = { type: 'sena', name: 'Juan Pérez' }

                                                                             return (
                                                                                    <div key={colIndex} className="flex-1 border-r border-white/5 p-1 relative group hover:bg-white/[0.02] transition-colors last:border-r-0">
                                                                                           {content && (
                                                                                                  <div className={`w-full h-full rounded-lg p-3 flex flex-col justify-between shadow-sm border ${content.type === 'pagado'
                                                                                                         ? 'bg-primary/20 border-primary/20'
                                                                                                         : 'bg-secondary/20 border-secondary/20'
                                                                                                         }`}>
                                                                                                         <span className={`text-[9px] font-black uppercase tracking-wider ${content.type === 'pagado' ? 'text-primary' : 'text-secondary'
                                                                                                                }`}>
                                                                                                                {content.type === 'pagado' ? 'PAGADO' : 'SEÑA 50%'}
                                                                                                         </span>
                                                                                                         <span className="text-[10px] font-bold text-white/90 truncate">
                                                                                                                {content.name}
                                                                                                         </span>
                                                                                                  </div>
                                                                                           )}
                                                                                    </div>
                                                                             )
                                                                      })}
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </motion.div>

                     {/* WhatsApp Floating Button */}
                     <a
                            href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20info%20sobre%20CourtOps%20%F0%9F%8E%BE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl shadow-[#25D366]/30 hover:bg-[#20bd5a] transition-all hover:scale-110 active:scale-95 flex items-center justify-center ring-4 ring-[#25D366]/20"
                            aria-label="Contactar por WhatsApp"
                     >
                            <MessageCircle size={32} fill="currentColor" className="text-white" />
                            <span className="absolute right-full mr-4 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
                                   ¿Hablamos? 👋
                            </span>
                     </a>

              </section >
       )
}
