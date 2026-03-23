'use client'

import { motion } from 'framer-motion'
import { Link2, Globe, Smartphone, CreditCard, QrCode, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LandingPublicBooking() {
       return (
              <section className="py-10 md:py-24 px-4 sm:px-6 bg-slate-50 dark:bg-zinc-900/50 transition-colors duration-700 relative overflow-hidden">
                     {/* Background */}
                     <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-12 lg:gap-20">

                                   {/* Left Content */}
                                   <div className="flex-1 space-y-8 text-center lg:text-left">
                                          <motion.div
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest"
                                          >
                                                 <Link2 size={14} />
                                                 Reservas Online
                                          </motion.div>

                                          <motion.h2
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: 0.1 }}
                                                 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white tracking-[-0.03em] leading-[1.15]"
                                          >
                                                 Creá un link.{' '}
                                                 <span className="text-slate-400 dark:text-zinc-500">
                                                        Aceptá jugadores desde cualquier lugar.
                                                 </span>
                                          </motion.h2>

                                          <motion.p
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: 0.2 }}
                                                 className="text-lg text-slate-500 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
                                          >
                                                 Cada club tiene su link público personalizado. Tus jugadores reservan, pagan y firman el deslinde — todo sin llamarte. Compartilo por WhatsApp, Instagram o donde quieras.
                                          </motion.p>

                                          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
                                                 {[
                                                        { icon: Globe, title: 'Link Personalizado', desc: 'tuclub.courtops.net — tu marca, tu dominio' },
                                                        { icon: Smartphone, title: 'Mobile-First', desc: 'Diseñado para reservar desde el celular' },
                                                        { icon: CreditCard, title: 'Cobro Automático', desc: 'Seña online con MercadoPago integrado' },
                                                        { icon: QrCode, title: 'Check-in con QR', desc: 'Escanean el QR al llegar y listo' },
                                                 ].map((item, i) => (
                                                        <motion.div
                                                               key={i}
                                                               initial={{ opacity: 0, y: 20 }}
                                                               whileInView={{ opacity: 1, y: 0 }}
                                                               viewport={{ once: true }}
                                                               transition={{ delay: 0.3 + i * 0.08 }}
                                                               className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/50 dark:border-white/5 shadow-sm"
                                                        >
                                                               <div className="p-2 rounded-xl bg-emerald-500/10 shrink-0">
                                                                      <item.icon size={18} className="text-emerald-500" />
                                                               </div>
                                                               <div>
                                                                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                                                                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{item.desc}</p>
                                                               </div>
                                                        </motion.div>
                                                 ))}
                                          </div>

                                          <motion.div
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: 0.6 }}
                                          >
                                                 <Link
                                                        href="/register"
                                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                                                 >
                                                        Crear Mi Link Gratis
                                                        <ArrowRight size={16} />
                                                 </Link>
                                          </motion.div>
                                   </div>

                                   {/* Right — Phone Mockup */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 40, rotateY: -8 }}
                                          whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.8, ease: 'easeOut' }}
                                          className="flex-1 w-full max-w-sm"
                                   >
                                          <div className="relative mx-auto w-[240px] sm:w-[280px] aspect-[9/17] rounded-[3rem] p-2 bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 shadow-2xl">
                                                 <div className="w-full h-full bg-[#09090b] rounded-[2.5rem] overflow-hidden border-[5px] border-black relative">
                                                        {/* Notch */}
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-xl z-30" />

                                                        {/* Screen */}
                                                        <div className="w-full h-full p-5 pt-12 flex flex-col gap-4 text-white overflow-hidden">
                                                               {/* Header */}
                                                               <div className="text-center space-y-1">
                                                                      <div className="w-14 h-14 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center text-2xl font-black">P</div>
                                                                      <h3 className="text-base font-black tracking-tight">PADEL CLUB</h3>
                                                                      <p className="text-[10px] text-zinc-500">Av. Libertador 1234</p>
                                                               </div>

                                                               {/* Date selector */}
                                                               <div className="flex gap-1.5 justify-center">
                                                                      {['Lun', 'Mar', 'Mie', 'Jue', 'Vie'].map((d, i) => (
                                                                             <div key={d} className={`w-10 py-2 rounded-xl text-center text-[9px] font-bold ${i === 2 ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-400'}`}>
                                                                                    <div>{d}</div>
                                                                                    <div className="text-sm font-black mt-0.5">{15 + i}</div>
                                                                             </div>
                                                                      ))}
                                                               </div>

                                                               {/* Time slots */}
                                                               <div className="space-y-2 flex-1">
                                                                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Horarios disponibles</p>
                                                                      {['14:00', '15:30', '17:00', '18:30', '20:00'].map((t, i) => (
                                                                             <div key={t} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${i === 2 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-zinc-300'}`}>
                                                                                    <span>{t} hs</span>
                                                                                    <span className="text-[10px] text-zinc-500">Cancha {i + 1}</span>
                                                                             </div>
                                                                      ))}
                                                               </div>

                                                               {/* CTA */}
                                                               <div className="bg-emerald-500 rounded-xl py-3 text-center text-xs font-black uppercase tracking-widest">
                                                                      Reservar Ahora
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </motion.div>
                            </div>
                     </div>
              </section>
       )
}
