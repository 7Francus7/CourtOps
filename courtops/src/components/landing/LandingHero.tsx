
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
       return (
              <section className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 overflow-hidden">

                     {/* Background Ambience */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none opacity-40 dark:opacity-20" />
                     <div className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none opacity-40 dark:opacity-20" />

                     <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 text-center space-y-8 max-w-4xl"
                     >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-4">
                                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                   Nueva Versión 3.0 Disponible
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground bg-clip-text">
                                   Tu club de pádel, <br className="hidden md:block" />
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                                          gestionado en piloto automático.
                                   </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                                   Olvídate del caos de WhatsApp. Automatiza reservas, cobra señas y controla tu caja desde una sola plataforma premium.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                                   <Link href="/register" className="group relative px-8 py-4 bg-emerald-500 rounded-xl font-bold text-black text-lg transition-transform active:scale-95 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 flex items-center gap-2">
                                          Empezar Prueba Gratis
                                          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                   </Link>

                                   <Link href="/login" className="px-8 py-4 bg-card border border-border rounded-xl font-bold text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                                          <Play size={18} fill="currentColor" /> Ver Demo
                                   </Link>
                            </div>

                            <div className="pt-12 flex justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                   {/* Placeholder Logos */}
                                   <span className="font-bold text-lg text-muted-foreground">+50 Clubes Confían en Nosotros</span>
                            </div>

                     </motion.div>

                     {/* Decorative UI Preview */}
                     <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 1 }}
                            className="mt-20 relative w-full max-w-5xl aspect-video rounded-t-3xl border-t border-l border-r border-white/10 bg-zinc-900/50 backdrop-blur-sm shadow-2xl overflow-hidden"
                     >
                            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                            {/* Abstract UI representation */}
                            <div className="p-4 grid grid-cols-12 gap-4 h-full opacity-50">
                                   <div className="col-span-3 bg-white/5 rounded-xl h-full" />
                                   <div className="col-span-9 space-y-4">
                                          <div className="flex gap-4">
                                                 <div className="h-32 w-1/3 bg-emerald-500/20 rounded-xl border border-emerald-500/30" />
                                                 <div className="h-32 w-1/3 bg-blue-500/20 rounded-xl border border-blue-500/30" />
                                                 <div className="h-32 w-1/3 bg-white/5 rounded-xl" />
                                          </div>
                                          <div className="h-64 bg-white/5 rounded-xl" />
                                   </div>
                            </div>
                     </motion.div>

              </section>
       )
}
