
'use client'

import { motion } from 'framer-motion'
import { Bell, BarChart3, QrCode } from 'lucide-react'

const features = [
       {
              title: "Check-in con QR",
              desc: "Acceso rápido y sin contacto para tus jugadores",
              icon: <QrCode className="w-6 h-6 text-emerald-500" />
       },
       {
              title: "Notificaciones Automáticas",
              desc: "Avisos de canchas libres al instante",
              icon: <Bell className="w-6 h-6 text-emerald-500" />
       },
       {
              title: "Control en Tiempo Real",
              desc: "Tu caja y ocupación en la palma de tu mano",
              icon: <BarChart3 className="w-6 h-6 text-emerald-500" />
       }
]

export default function LandingAppShowcase() {
       return (
              <section className="py-24 md:py-32 relative overflow-hidden bg-slate-50 dark:bg-[#030712] border-y border-slate-200/50 dark:border-white/5">
                     {/* Premium Background Effects */}
                     <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3 mix-blend-screen" />
                     <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3 mix-blend-screen" />

                     <div className="container mx-auto px-4 relative z-10 max-w-7xl">
                            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                                   {/* Left Content */}
                                   <div className="flex-1 space-y-10 text-center lg:text-left">
                                          <motion.div
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
                                          >
                                                 <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                 </span>
                                                 App Nativa Privada
                                          </motion.div>

                                          <motion.h2
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: 0.1 }}
                                                 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1]"
                                          >
                                                 Lleva tu club <br />
                                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                                        en el bolsillo
                                                 </span>
                                          </motion.h2>

                                          <motion.p
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: 0.2 }}
                                                 className="text-xl text-slate-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                                          >
                                                 Nuestra App exclusiva para administradores. Gestiona reservas, controla la caja y revisa las métricas de tu club desde cualquier lugar del mundo.
                                          </motion.p>

                                          <div className="grid gap-4">
                                                 {features.map((feature, idx) => (
                                                        <motion.div
                                                               key={idx}
                                                               initial={{ opacity: 0, x: -30 }}
                                                               whileInView={{ opacity: 1, x: 0 }}
                                                               viewport={{ once: true }}
                                                               transition={{ delay: 0.3 + (idx * 0.1), type: "spring", stiffness: 100 }}
                                                               className="group flex items-center gap-5 bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 hover:border-emerald-500/30 p-5 rounded-2xl transition-all shadow-sm hover:shadow-emerald-500/5 hover:-translate-y-1"
                                                        >
                                                               <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                                                      {feature.icon}
                                                               </div>
                                                               <div className="text-left">
                                                                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-0.5">{feature.title}</h4>
                                                                      <p className="text-sm text-slate-500 dark:text-zinc-400">{feature.desc}</p>
                                                               </div>
                                                        </motion.div>
                                                 ))}
                                          </div>

                                          <motion.div
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: 0.6 }}
                                                 className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-6"
                                          >
                                                 <button className="flex items-center gap-3 bg-white dark:bg-white/5 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-white/10 px-6 py-3.5 rounded-xl font-bold cursor-default shadow-sm backdrop-blur-sm">
                                                        <svg className="w-6 h-6 grayscale opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 7.9c-.8-1-1.9-1.5-3.1-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.8-.7-3-.7-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9.1.8 1.1 1.6 2.3 2.8 2.3.6 0 .9-.2 1.9-.2 1.1 0 1.3.2 2 .2 1.1 0 1.9-1 2.8-2.3.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.4 0-2.1 1.7-3.1 1.8-3.2-.9-1.4-2.5-1.6-3-1.6-.1 0 0 0 0 0zm-2.2-4c.7-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 0 2.1-.6 2.7-1.3z" /></svg>
                                                        <div className="text-left leading-none">
                                                               <div className="text-[10px] uppercase opacity-80 mb-0.5">Versión Beta Privada</div>
                                                               <div className="text-base text-nowrap">App Store</div>
                                                        </div>
                                                 </button>
                                                 <button className="flex items-center gap-3 bg-white dark:bg-white/5 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-white/10 px-6 py-3.5 rounded-xl font-bold cursor-default shadow-sm backdrop-blur-sm">
                                                        <svg className="w-6 h-6 grayscale opacity-50" viewBox="0 0 24 24" fill="currentColor"><path d="M5.3 3.3l10.8 6.1-4 3.9-8.4-8.5c.3-.8.9-1.4 1.6-1.5zm-3.6 1.8l7.6 7.6-7.6 7.6c-.2-.6-.3-1.3-.3-2v-11.2c0-.7.1-1.3.3-2zm12.5 7.6l4.6 2.6c.9.5 1.5 1.4 1.5 2.5s-.6 2-1.5 2.5l-4.6 2.6-4.9-4.8 4.9-5.4zm-12.2 6.5l8.1-8.2 4.3 4.2-10.9 6.2c-.6-.2-1.1-.7-1.5-1.5z" /></svg>
                                                        <div className="text-left leading-none">
                                                               <div className="text-[10px] uppercase opacity-80 mb-0.5">Versión Beta Privada</div>
                                                               <div className="text-base text-nowrap">Google Play</div>
                                                        </div>
                                                 </button>
                                          </motion.div>
                                   </div>

                                   {/* Right Content - Phone Mockup (Ultra Premium) */}
                                   <div className="flex-1 relative w-full flex justify-center lg:justify-end max-w-md mx-auto lg:mx-0">
                                          {/* Mockup Outer Glow */}
                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/20 dark:bg-emerald-500/30 blur-[100px] rounded-[100px] pointer-events-none mix-blend-screen" />
                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[105%] bg-gradient-to-b from-emerald-500/20 to-transparent blur-[40px] pointer-events-none rounded-[60px]" />

                                          <motion.div
                                                 initial={{ y: 50, opacity: 0, rotateX: 10, rotateY: -10 }}
                                                 whileInView={{ y: 0, opacity: 1, rotateX: 0, rotateY: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ duration: 1, ease: "easeOut" }}
                                                 style={{ transformStyle: "preserve-3d" }}
                                                 className="relative z-10 w-full aspect-[9/19] rounded-[3rem] p-2.5 bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_0_80px_rgba(16,185,129,0.15)]"
                                          >
                                                 {/* Inner border fake hardware */}
                                                 <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative border-[6px] border-black">

                                                        {/* Hardware Notch area */}
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-[1.2rem] z-30 flex items-center justify-center gap-2">
                                                               <div className="w-1.5 h-1.5 rounded-full bg-slate-800/80"></div>
                                                               <div className="w-1.5 h-1.5 rounded-full bg-[#101010] shadow-[inset_0_0_2px_rgba(255,255,255,0.1)]"></div>
                                                        </div>

                                                        {/* Screen Content */}
                                                        <div className="w-full h-full bg-[#050B14] text-white p-6 pt-14 flex flex-col gap-6 relative">
                                                               {/* Screen Top Glow */}
                                                               <div className="absolute top-0 left-0 w-full h-40 bg-emerald-500/10 blur-[30px]" />

                                                               {/* Header */}
                                                               <div className="flex justify-between items-center relative z-10">
                                                                      <div className="space-y-0.5">
                                                                             <div className="text-xs text-zinc-400 font-medium tracking-wide">Panel Admon</div>
                                                                             <div className="font-bold text-xl tracking-tight">Padelo Club</div>
                                                                      </div>
                                                                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-lg shadow-emerald-500/20">
                                                                             <div className="w-full h-full bg-zinc-900 rounded-full border-2 border-[#050B14]"></div>
                                                                      </div>
                                                               </div>

                                                               {/* Main KPI Card */}
                                                               <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[1.5rem] p-5 shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                                                                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 blur-2xl rounded-full group-hover:bg-white/20 transition-colors" />

                                                                      <div className="text-sm font-medium text-emerald-50 mb-1">Ingresos de Hoy</div>
                                                                      <div className="text-3xl font-black tracking-tighter mb-4">$345.000</div>

                                                                      <div className="flex items-center gap-3">
                                                                             <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 text-white w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                                                                                    <span>📈 +24%</span>
                                                                             </div>
                                                                             <span className="text-xs text-emerald-100/80 font-medium">vs ayer</span>
                                                                      </div>
                                                               </div>

                                                               {/* Quick Actions Grid */}
                                                               <div className="grid grid-cols-2 gap-4">
                                                                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group">
                                                                             <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                                                             </div>
                                                                             <div className="text-xs font-bold tracking-wide text-zinc-300">Reserva</div>
                                                                      </div>
                                                                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group">
                                                                             <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                             </div>
                                                                             <div className="text-xs font-bold tracking-wide text-zinc-300">Cobrar</div>
                                                                      </div>
                                                               </div>

                                                               {/* Upcoming Matches */}
                                                               <div className="flex-1 space-y-4">
                                                                      <div className="flex items-center justify-between">
                                                                             <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">En curso</div>
                                                                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                      </div>

                                                                      <div className="space-y-3">
                                                                             {[1, 2].map(i => (
                                                                                    <div key={i} className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5">
                                                                                           <div className="flex items-center gap-3">
                                                                                                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex flex-col items-center justify-center border border-white/5">
                                                                                                         <div className="text-xs font-bold text-white leading-none mb-0.5">1{7 + i}</div>
                                                                                                         <div className="text-[9px] text-zinc-500 font-medium">00</div>
                                                                                                  </div>
                                                                                                  <div>
                                                                                                         <div className="text-sm font-bold text-white">Cancha {i}</div>
                                                                                                         <div className="text-xs text-zinc-500 font-medium">Martín vs Leo</div>
                                                                                                  </div>
                                                                                           </div>
                                                                                    </div>
                                                                             ))}
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </motion.div>
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
