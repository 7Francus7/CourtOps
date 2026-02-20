'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import LandingMockup from './LandingMockup'

export default function LandingHero() {
       return (
              <section className="relative min-h-[100vh] flex flex-col items-center justify-start pt-32 md:pt-48 p-4 md:p-6 overflow-hidden bg-white dark:bg-[#030712]">
                     {/* Ultra Premium Background Effects */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-emerald-100/50 via-white to-white dark:from-emerald-900/20 dark:via-[#030712] dark:to-[#030712]" />
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-emerald-500/15 dark:bg-emerald-500/10 rounded-[100%] blur-[120px] pointer-events-none opacity-50 animate-pulse mix-blend-screen" />
                     <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
                     <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-green-300/20 dark:bg-emerald-800/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

                     {/* Premium Grid Pattern */}
                     <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.04 }} />

                     <div className="relative z-10 text-center space-y-10 max-w-5xl mx-auto px-4 w-full">

                            {/* Intro Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.8, ease: "easeOut" }}
                                   className="flex justify-center"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-emerald-500/20 dark:border-white/10 backdrop-blur-md shadow-sm">
                                          <Sparkles className="w-4 h-4 text-emerald-500" />
                                          <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                                                 La nueva era en gestión deportiva
                                          </span>
                                   </div>
                            </motion.div>

                            {/* Ultimate Headline */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            >
                                   <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1] drop-shadow-sm mb-6">
                                          Tu club, <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 dark:from-emerald-400 dark:via-green-300 dark:to-teal-200 filter drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                 en piloto automático.
                                          </span>
                                   </h1>
                            </motion.div>

                            <motion.p
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                   className="text-lg md:text-2xl text-slate-600 dark:text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed"
                            >
                                   La plataforma definitiva que los clubes líderes eligen. <br className="hidden md:block" />
                                   <span className="text-slate-900 dark:text-white font-bold">Reservas, Pagos, Kiosco y Métricas</span> centralizadas.
                            </motion.p>

                            {/* Premium CTA Buttons */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                   className="flex flex-col items-center gap-6 mt-12"
                            >
                                   <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none">
                                          <Link href="/register" className="w-full sm:w-auto relative group">
                                                 {/* Animated Glow */}
                                                 <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
                                                 <span className="relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.8)] border border-emerald-400/50 overflow-hidden">
                                                        {/* Shine effect */}
                                                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shine_1.5s_ease-in-out_infinite]" style={{ transform: 'skewX(-20deg)', animationDuration: '3s' }} />
                                                        Prueba Gratis 14 Días
                                                        <ArrowRight className="group-hover:translate-x-1.5 transition-transform" strokeWidth={3} />
                                                 </span>
                                          </Link>

                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20ver%20una%20demo%20de%20CourtOps%20%F0%9F%91%80"
                                                 target="_blank"
                                                 className="relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl font-bold text-lg transition-all active:scale-95 backdrop-blur-md shadow-sm hover:shadow-md cursor-pointer group"
                                          >
                                                 <div className="bg-emerald-500/10 dark:bg-white/10 p-1.5 rounded-full group-hover:scale-110 transition-transform">
                                                        <Play size={16} fill="currentColor" className="text-emerald-500 dark:text-white" />
                                                 </div>
                                                 Ver Demo Rápida
                                          </a>
                                   </div>

                                   <Link href="/calculator" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 text-sm font-semibold transition-colors mt-2">
                                          🔥 Calculadora: ¿Cuánto dinero estás perdiendo?
                                   </Link>
                            </motion.div>
                     </div>

                     <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                            className="w-full relative z-20 mt-16 md:mt-24"
                     >
                            <LandingMockup />
                     </motion.div>

                     {/* WhatsApp Floating Button */}
                     <a
                            href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20info%20sobre%20CourtOps%20%F0%9F%8E%BE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_40px_-10px_rgba(37,211,102,0.8)] hover:bg-[#20bd5a] transition-all hover:scale-110 active:scale-95 flex items-center justify-center ring-4 ring-[#25D366]/20 cursor-pointer"
                            aria-label="Contactar por WhatsApp"
                     >
                            <MessageCircle size={32} fill="currentColor" className="text-white" />
                            <span className="absolute right-full mr-4 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block border border-slate-100 dark:border-zinc-700">
                                   ¿Hablamos? 👋
                            </span>
                     </a>

              </section>
       )
}
