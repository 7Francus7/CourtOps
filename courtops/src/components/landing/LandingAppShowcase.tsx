
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const features = [
       {
              title: "Check-in QR",
              desc: "Acceso sin contacto para tus socios",
              icon: (
                     <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                     </svg>
              )
       },
       {
              title: "Push Notifications",
              desc: "Avisos de pistas libres al instante",
              icon: (
                     <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                     </svg>
              )
       },
       {
              title: "Reportes Real-Time",
              desc: "Tu club en números, en tu bolsillo",
              icon: (
                     <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                     </svg>
              )
       }
]

export default function LandingAppShowcase() {
       return (
              <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-black/40 border-y border-slate-200 dark:border-white/5">
                     {/* Decorative Elements */}
                     <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
                     <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                     <div className="container mx-auto px-4 relative z-10">
                            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                                   {/* Left Content */}
                                   <div className="flex-1 space-y-8 text-center lg:text-left">
                                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                                                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                 Disponible ahora
                                          </div>

                                          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                                                 Lleva tu club <br />
                                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                                                        en el bolsillo
                                                 </span>
                                          </h2>

                                          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                                 Gestiona reservas, monitorea ingresos y atiende a tus clientes desde cualquier lugar con nuestra App nativa diseñada para la máxima eficiencia.
                                          </p>

                                          <div className="grid gap-6">
                                                 {features.map((feature, idx) => (
                                                        <motion.div
                                                               key={idx}
                                                               initial={{ opacity: 0, x: -20 }}
                                                               whileInView={{ opacity: 1, x: 0 }}
                                                               viewport={{ once: true }}
                                                               transition={{ delay: idx * 0.1 }}
                                                               className="flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 transition-colors shadow-sm"
                                                        >
                                                               <div className="p-3 bg-emerald-500/10 rounded-lg">
                                                                      {feature.icon}
                                                               </div>
                                                               <div className="text-left">
                                                                      <h4 className="font-bold text-slate-900 dark:text-white">{feature.title}</h4>
                                                                      <p className="text-sm text-slate-500 dark:text-zinc-400">{feature.desc}</p>
                                                               </div>
                                                        </motion.div>
                                                 ))}
                                          </div>

                                          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                                                 <button className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3.5 rounded-xl font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-emerald-500/20">
                                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 7.9c-.8-1-1.9-1.5-3.1-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.8-.7-3-.7-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9.1.8 1.1 1.6 2.3 2.8 2.3.6 0 .9-.2 1.9-.2 1.1 0 1.3.2 2 .2 1.1 0 1.9-1 2.8-2.3.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.4 0-2.1 1.7-3.1 1.8-3.2-.9-1.4-2.5-1.6-3-1.6-.1 0 0 0 0 0zm-2.2-4c.7-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 0 2.1-.6 2.7-1.3z" /></svg>
                                                        <div className="text-left leading-none">
                                                               <div className="text-[10px] uppercase opacity-80">Download on the</div>
                                                               <div className="text-base text-nowrap">App Store</div>
                                                        </div>
                                                 </button>
                                                 <button className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3.5 rounded-xl font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-blue-500/20">
                                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M5.3 3.3l10.8 6.1-4 3.9-8.4-8.5c.3-.8.9-1.4 1.6-1.5zm-3.6 1.8l7.6 7.6-7.6 7.6c-.2-.6-.3-1.3-.3-2v-11.2c0-.7.1-1.3.3-2zm12.5 7.6l4.6 2.6c.9.5 1.5 1.4 1.5 2.5s-.6 2-1.5 2.5l-4.6 2.6-4.9-4.8 4.9-5.4zm-12.2 6.5l8.1-8.2 4.3 4.2-10.9 6.2c-.6-.2-1.1-.7-1.5-1.5z" /></svg>
                                                        <div className="text-left leading-none">
                                                               <div className="text-[10px] uppercase opacity-80">Get it on</div>
                                                               <div className="text-base text-nowrap">Google Play</div>
                                                        </div>
                                                 </button>
                                          </div>
                                   </div>

                                   {/* Right Content - Phone Mockup */}
                                   <div className="flex-1 relative w-full max-w-md mx-auto lg:mx-0">
                                          {/* Glow Effect */}
                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

                                          {/* Phone Frame */}
                                          <motion.div
                                                 initial={{ y: 50, opacity: 0 }}
                                                 whileInView={{ y: 0, opacity: 1 }}
                                                 viewport={{ once: true }}
                                                 transition={{ duration: 0.8 }}
                                                 className="relative z-10 bg-black rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden aspect-[9/19]"
                                          >
                                                 {/* Notch */}
                                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20" />

                                                 {/* Screen Content */}
                                                 <div className="w-full h-full bg-[#0a0a0a] text-white p-6 pt-12 flex flex-col gap-6">
                                                        {/* Header */}
                                                        <div className="flex justify-between items-center">
                                                               <div>
                                                                      <div className="text-xs text-zinc-400">Bienvenido</div>
                                                                      <div className="font-bold text-lg">Padelo Club</div>
                                                               </div>
                                                               <div className="w-8 h-8 rounded-full bg-zinc-800" />
                                                        </div>

                                                        {/* Stat Card */}
                                                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-4 shadow-lg">
                                                               <div className="text-xs text-emerald-100 mb-1">Ingresos Hoy</div>
                                                               <div className="text-2xl font-black">€1,240.00</div>
                                                               <div className="mt-2 flex items-center gap-1 text-[10px] bg-white/20 w-fit px-2 py-0.5 rounded-full">
                                                                      <span>📈 +15% vs ayer</span>
                                                               </div>
                                                        </div>

                                                        {/* Quick Actions Grid */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                               <div className="bg-zinc-900 rounded-xl p-3 border border-white/5">
                                                                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                                                                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                                      </div>
                                                                      <div className="text-xs font-bold text-zinc-300">Nueva Reserva</div>
                                                               </div>
                                                               <div className="bg-zinc-900 rounded-xl p-3 border border-white/5">
                                                                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center mb-2">
                                                                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                                      </div>
                                                                      <div className="text-xs font-bold text-zinc-300">Registrar Pago</div>
                                                               </div>
                                                        </div>

                                                        {/* Upcoming List */}
                                                        <div className="flex-1 space-y-3">
                                                               <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Próximos Partidos</div>
                                                               {[1, 2, 3].map(i => (
                                                                      <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                                                                             <div className="text-center bg-zinc-800 rounded px-2 py-1">
                                                                                    <div className="text-[10px] text-zinc-400">1{7 + i}:00</div>
                                                                             </div>
                                                                             <div>
                                                                                    <div className="text-xs font-bold">Cancha {i}</div>
                                                                                    <div className="text-[10px] text-zinc-500">Juan vs Pedro</div>
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </div>
                                          </motion.div>
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
