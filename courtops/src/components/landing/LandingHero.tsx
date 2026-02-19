
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import LandingMockup from './LandingMockup'

export default function LandingHero() {
       return (
              <section className="relative min-h-[90vh] md:min-h-[95vh] flex flex-col items-center justify-start pt-24 md:pt-48 p-4 md:p-6 overflow-hidden bg-white dark:bg-[#0a0a0a]">

                     {/* Dynamic Background */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white dark:from-background dark:via-background dark:to-background" />
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none opacity-60 animate-pulse" />
                     <div className="absolute bottom-0 right-0 w-[800px] h-[500px] bg-emerald-300/20 rounded-full blur-[100px] pointer-events-none opacity-60" />
                     <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-green-400/20 rounded-full blur-[80px] pointer-events-none" />

                     {/* Grid Pattern */}
                     <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,black,rgba(255,255,255,0))]" style={{ opacity: 0.03 }} />

                     <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 text-center space-y-8 max-w-5xl mx-auto px-4"
                     >


                            {/* Headline */}
                            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-none drop-shadow-sm mb-4 md:mb-6">
                                   Tu club, <br />
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 dark:from-emerald-400 dark:via-green-300 dark:to-emerald-200">
                                          en piloto automático.
                                   </span>
                            </h1>

                            <p className="text-base md:text-2xl text-slate-500 dark:text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">
                                   La plataforma definitiva para clubes deportivos. <br className="hidden md:block" />
                                   <span className="text-slate-900 dark:text-white font-bold">Reservas, Pagos, Kiosco y Métricas</span> en un solo lugar.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col items-center gap-4 md:gap-6 mt-8 md:mt-10">
                                   <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full">
                                          <Link
                                                 href="/register"
                                                 className="group relative w-full sm:w-auto inline-flex items-center justify-center"
                                          >
                                                 <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-200" />
                                                 <span className="relative w-full sm:w-auto px-6 md:px-8 py-4 md:py-5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-base md:text-lg transition-transform active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-primary/25 cursor-pointer">
                                                        Prueba Gratis 14 Días
                                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                                 </span>
                                          </Link>

                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20ver%20una%20demo%20de%20CourtOps%20%F0%9F%91%80"
                                                 target="_blank"
                                                 className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-5 bg-background border border-border text-foreground hover:bg-secondary/10 dark:bg-white/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white dark:hover:border-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-3 active:scale-95 group shadow-sm cursor-pointer"
                                          >
                                                 <Play size={18} fill="currentColor" className="text-muted-foreground group-hover:text-primary transition-colors" />
                                                 Solicitar Demo
                                          </a>
                                   </div>

                                   <Link href="/calculator" className="text-muted-foreground hover:text-accent font-medium text-sm flex items-center gap-2 transition-colors border-b border-transparent hover:border-accent pb-0.5 cursor-pointer">
                                          🔥 Calcular cuánto dinero estoy perdiendo por mes
                                   </Link>
                            </div>



                     </motion.div>

                     <LandingMockup />

                     {/* WhatsApp Floating Button */}
                     <a
                            href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20info%20sobre%20CourtOps%20%F0%9F%8E%BE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl shadow-[#25D366]/30 hover:bg-[#20bd5a] transition-all hover:scale-110 active:scale-95 flex items-center justify-center ring-4 ring-[#25D366]/20 cursor-pointer"
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
