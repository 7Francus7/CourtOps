'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Rocket, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'

export default function LandingCTA() {
       return (
              <section className="py-24 px-6 bg-white dark:bg-[#050505] transition-colors duration-700">
                     <div className="max-w-5xl mx-auto">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   className="relative overflow-hidden rounded-[3rem] bg-slate-900 dark:bg-zinc-900 p-12 md:p-20 text-center"
                            >
                                   {/* Decorative Elements */}
                                   <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
                                          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
                                   </div>

                                   <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
                                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                                 <Zap size={10} fill="currentColor" /> Únete a la Élite del Padel
                                          </div>

                                          <h2 className="text-4xl md:text-6xl font-medium text-white tracking-tight leading-tight">
                                                 ¿Listo para llevar tu club al <br />
                                                 <span className="text-zinc-500">siguiente nivel?</span>
                                          </h2>

                                          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                                                 Digitaliza tu complejo hoy y descubre por qué los mejores clubes de Argentina eligen CourtOps. 14 días gratis, sin tarjetas.
                                          </p>

                                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                                 <Link
                                                        href="/register"
                                                        className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-black font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                 >
                                                        Comenzar Prueba Gratuita <ArrowRight size={18} />
                                                 </Link>
                                                 <Link
                                                        href="#pricing"
                                                        className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-zinc-800 text-white font-bold text-sm border border-white/5 hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                                                 >
                                                        Ver Planes
                                                 </Link>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-white/5 mt-12">
                                                 {[
                                                        "Configuración en 5 min",
                                                        "Soporte 24/7",
                                                        "Sin contratos largos"
                                                 ].map((text, i) => (
                                                        <div key={i} className="flex items-center justify-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
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
