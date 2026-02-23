'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BarChart3, QrCode, ArrowRight } from 'lucide-react'

const features = [
       {
              title: "Check-in con QR",
              desc: "Acceso rápido y sin contacto para tus jugadores",
              icon: <QrCode className="w-6 h-6 text-violet-500" />
       },
       {
              title: "Notificaciones Automáticas",
              desc: "Avisos de canchas libres al instante",
              icon: <Bell className="w-6 h-6 text-violet-500" />
       },
       {
              title: "Control en Tiempo Real",
              desc: "Tu caja y ocupación en la palma de tu mano",
              icon: <BarChart3 className="w-6 h-6 text-violet-500" />
       }
]

export default function LandingAppShowcase() {
       return (
              <section className="py-24 md:py-32 relative overflow-hidden bg-background border-y border-border">
                     {/* Premium Background Effects */}
                     <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 dark:bg-violet-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3 mix-blend-screen" />
                     <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-600/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3 mix-blend-screen" />

                     <div className="container mx-auto px-4 relative z-10 max-w-7xl">
                            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                                   {/* Left Content */}
                                   <div className="flex-1 space-y-10 text-center lg:text-left">
                                          <motion.div
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
                                          >
                                                 <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                                 </span>
                                                 App Nativa Privada
                                          </motion.div>

                                          <motion.h2
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: 0.1 }}
                                                 className="text-4xl lg:text-6xl font-black text-foreground leading-[1.1]"
                                          >
                                                 Lleva tu club <br />
                                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-400 filter drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                                                        en el bolsillo
                                                 </span>
                                          </motion.h2>

                                          <motion.p
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: 0.2 }}
                                                 className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
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
                                                               className="group flex items-center gap-5 bg-card border border-border hover:border-primary/30 p-5 rounded-2xl transition-all shadow-sm hover:shadow-primary/5 hover:-translate-y-1"
                                                        >
                                                               <div className="p-3.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform group-hover:bg-primary/20 text-primary">
                                                                      {feature.icon}
                                                               </div>
                                                               <div className="text-left">
                                                                      <h4 className="font-bold text-lg text-foreground mb-0.5">{feature.title}</h4>
                                                                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
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
                                                 <button className="flex items-center gap-3 bg-card text-muted-foreground border border-border px-6 py-3.5 rounded-xl font-bold cursor-default shadow-sm backdrop-blur-sm">
                                                        <svg className="w-6 h-6 grayscale opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 7.9c-.8-1-1.9-1.5-3.1-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.8-.7-3-.7-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9.1.8 1.1 1.6 2.3 2.8 2.3.6 0 .9-.2 1.9-.2 1.1 0 1.3.2 2 .2 1.1 0 1.9-1 2.8-2.3.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.4 0-2.1 1.7-3.1 1.8-3.2-.9-1.4-2.5-1.6-3-1.6-.1 0 0 0 0 0zm-2.2-4c.7-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 0 2.1-.6 2.7-1.3z" /></svg>
                                                        <div className="text-left leading-none">
                                                               <div className="text-[10px] uppercase opacity-80 mb-0.5">Versión Beta Privada</div>
                                                               <div className="text-base text-nowrap text-muted-foreground">App Store</div>
                                                        </div>
                                                 </button>
                                                 <button className="flex items-center gap-3 bg-card text-muted-foreground border border-border px-6 py-3.5 rounded-xl font-bold cursor-default shadow-sm backdrop-blur-sm">
                                                        <svg className="w-6 h-6 grayscale opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M5.3 3.3l10.8 6.1-4 3.9-8.4-8.5c.3-.8.9-1.4 1.6-1.5zm-3.6 1.8l7.6 7.6-7.6 7.6c-.2-.6-.3-1.3-.3-2v-11.2c0-.7.1-1.3.3-2zm12.5 7.6l4.6 2.6c.9.5 1.5 1.4 1.5 2.5s-.6 2-1.5 2.5l-4.6 2.6-4.9-4.8 4.9-5.4zm-12.2 6.5l8.1-8.2 4.3 4.2-10.9 6.2c-.6-.2-1.1-.7-1.5-1.5z" /></svg>
                                                        <div className="text-left leading-none">
                                                               <div className="text-[10px] uppercase opacity-80 mb-0.5">Versión Beta Privada</div>
                                                               <div className="text-base text-nowrap text-muted-foreground">Google Play</div>
                                                        </div>
                                                 </button>
                                          </motion.div>
                                   </div>

                                   {/* Right Content - Phone Mockup (Ultra Premium) */}
                                   <div className="flex-1 relative w-full flex justify-center lg:justify-end max-w-md mx-auto lg:mx-0">
                                          {/* Mockup Outer Glow */}
                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-violet-500/20 dark:bg-indigo-500/10 blur-[100px] rounded-[100px] pointer-events-none mix-blend-screen" />
                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[105%] bg-gradient-to-b from-violet-500/20 to-transparent blur-[40px] pointer-events-none rounded-[60px]" />

                                          <motion.div
                                                 initial={{ y: 50, opacity: 0, rotateX: 10, rotateY: -10 }}
                                                 whileInView={{ y: 0, opacity: 1, rotateX: 0, rotateY: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ duration: 1, ease: "easeOut" }}
                                                 style={{ transformStyle: "preserve-3d" }}
                                                 className="relative z-10 w-full aspect-[9/19] rounded-[3rem] p-2.5 bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_0_80px_rgba(139,92,246,0.15)]"
                                          >
                                                 {/* Inner border fake hardware */}
                                                 <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative border-[6px] border-black">

                                                        {/* Hardware Notch area */}
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-[1.2rem] z-30 flex items-center justify-center gap-2">
                                                               <div className="w-1.5 h-1.5 rounded-full bg-slate-800/80"></div>
                                                               <div className="w-1.5 h-1.5 rounded-full bg-[#101010] shadow-[inset_0_0_2px_rgba(255,255,255,0.1)]"></div>
                                                        </div>

                                                        {/* Screen Content */}
                                                        <div className="w-full h-full bg-[#030712] text-white p-6 pt-14 flex flex-col gap-6 relative overflow-hidden">
                                                               {/* Screen Top Glow */}
                                                               <div className="absolute top-0 left-0 w-full h-40 bg-violet-600/20 blur-[40px] pointer-events-none" />

                                                               {/* Notification Toast (Live Feel) */}
                                                               <AnimatePresence>
                                                                      <motion.div
                                                                             initial={{ y: -100, opacity: 0 }}
                                                                             animate={{ y: 0, opacity: 1 }}
                                                                             transition={{ delay: 2, duration: 0.8, ease: "backOut" }}
                                                                             className="absolute top-4 left-4 right-4 z-40 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4"
                                                                      >
                                                                             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                                                    <QrCode className="w-5 h-5 text-emerald-400" />
                                                                             </div>
                                                                             <div className="flex-1">
                                                                                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Check-in Nuevo</div>
                                                                                    <div className="text-sm font-bold">Cancha 2 - 18:00hs</div>
                                                                             </div>
                                                                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                      </motion.div>
                                                               </AnimatePresence>

                                                               {/* Header */}
                                                               <div className="flex justify-between items-center relative z-10">
                                                                      <div className="space-y-0.5">
                                                                             <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Dashboard Pro</div>
                                                                             <div className="font-black text-2xl tracking-tighter uppercase">CourtOps</div>
                                                                      </div>
                                                                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group cursor-pointer hover:bg-white/10 transition-colors">
                                                                             <Bell className="w-5 h-5 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                                                                      </div>
                                                               </div>

                                                               {/* Main KPI Card */}
                                                               <div className="bg-gradient-to-br from-violet-600 to-indigo-800 rounded-[2rem] p-6 shadow-2xl shadow-violet-900/40 relative overflow-hidden group">
                                                                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 blur-[50px] rounded-full group-hover:bg-white/20 transition-all duration-1000" />

                                                                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-100/60 mb-2">Ventas de Hoy</div>
                                                                      <div className="text-4xl font-black tracking-tighter mb-5">$345.200</div>

                                                                      <div className="flex items-center gap-3">
                                                                             <div className="flex items-center gap-1.5 text-[10px] font-black bg-white/20 text-white w-fit px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 uppercase tracking-widest">
                                                                                    <span>📈 +24%</span>
                                                                             </div>
                                                                             <span className="text-[9px] text-violet-100/50 font-black uppercase tracking-widest">vS AYER</span>
                                                                      </div>
                                                               </div>

                                                               {/* Quick Actions Grid */}
                                                               <div className="grid grid-cols-2 gap-4">
                                                                      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-all cursor-pointer group hover:-translate-y-1">
                                                                             <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                                                                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                                                             </div>
                                                                             <div className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">Reserva</div>
                                                                      </div>
                                                                      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-all cursor-pointer group hover:-translate-y-1">
                                                                             <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-inner">
                                                                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                             </div>
                                                                             <div className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">Cobrar</div>
                                                                      </div>
                                                               </div>

                                                               {/* Upcoming Matches */}
                                                               <div className="flex-1 space-y-4">
                                                                      <div className="flex items-center justify-between">
                                                                             <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">En curso</div>
                                                                             <div className="flex h-2 w-2 relative">
                                                                                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></div>
                                                                                    <div className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></div>
                                                                             </div>
                                                                      </div>

                                                                      <div className="space-y-4">
                                                                             {[1, 2].map(i => (
                                                                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all rounded-[1.5rem] border border-white/5 hover:border-white/10 cursor-pointer group">
                                                                                           <div className="flex items-center gap-4">
                                                                                                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex flex-col items-center justify-center border border-white/10 group-hover:border-violet-500/30 transition-colors">
                                                                                                         <div className="text-sm font-black text-white leading-none mb-0.5">1{7 + i}</div>
                                                                                                         <div className="text-[8px] text-zinc-500 font-black uppercase tracking-tighter">MIN</div>
                                                                                                  </div>
                                                                                                  <div>
                                                                                                         <div className="text-sm font-black text-white uppercase tracking-tight">Cancha Panorámica {i}</div>
                                                                                                         <div className="text-[10px] text-zinc-500 font-bold">Martín vs Leo</div>
                                                                                                  </div>
                                                                                           </div>
                                                                                           <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                                                                                                  <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
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
