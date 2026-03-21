'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Rocket, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'

export default function LandingCTA() {
       return (
              <section className="py-20 md:py-32 px-4 sm:px-6 bg-transparent">
                     <div className="max-w-5xl mx-auto">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] backdrop-blur-2xl bg-slate-900 dark:bg-white/[0.04] border border-slate-800 dark:border-white/[0.08] p-8 md:p-20 text-center"
                            >
                                   {/* Decorative Elements */}
                                   <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
                                          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
                                   </div>

                                   <div className="relative z-10 space-y-6 md:space-y-8 max-w-3xl mx-auto">
                                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                                                 <Zap size={10} fill="currentColor" /> Únete a la Élite
                                          </div>

                                          <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium text-white tracking-tight leading-tight">
                                                 ¿Listo para llevar tu club al <br className="hidden md:block" />
                                                 <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">siguiente nivel?</span>
                                          </h2>

                                          <p className="text-zinc-400 text-base md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                                                 Digitaliza tu complejo hoy y descubre por qué los mejores clubes eligen CourtOps. 7 días gratis.
                                          </p>

                                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-4 sm:px-0">
                                                 <Link
                                                        href="/register"
                                                        className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl bg-white text-black font-bold text-sm shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                 >
                                                        Prueba Gratuita <ArrowRight size={18} />
                                                 </Link>
                                                 <Link
                                                        href="#pricing"
                                                        className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl backdrop-blur-xl bg-white/10 text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                                 >
                                                        Ver Planes
                                                 </Link>
                                          </div>

                                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-10 md:pt-12 border-t border-white/5 mt-10 md:mt-12">
                                                 {[
                                                        "Configuración Express",
                                                        "Soporte 24/7",
                                                        "Sin contratos"
                                                 ].map((text, i) => (
                                                        <div key={i} className="flex items-center justify-center gap-2 text-zinc-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                                                               <CheckCircle2 size={12} className="text-emerald-500" /> {text}
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>
                            </motion.div>
                     </div>
              </section>
       )
}
