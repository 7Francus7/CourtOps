
'use client'

import React, { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Play, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
       const { scrollY } = useScroll()
       const y1 = useTransform(scrollY, [0, 500], [0, 200])
       const y2 = useTransform(scrollY, [0, 500], [0, -150])
       const opacity = useTransform(scrollY, [0, 300], [1, 0])

       return (
              <section className="relative min-h-[100vh] flex flex-col items-center justify-start pt-32 md:pt-48 p-4 md:p-6 overflow-hidden bg-white dark:bg-background">
                     {/* Ultra Premium Background Effects */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-indigo-100/30 via-white to-white dark:from-violet-900/10 dark:via-background dark:to-background" />

                     {/* Animated Floating Blobs */}
                     <motion.div
                            style={{ y: y1, opacity }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-indigo-500/10 dark:bg-violet-600/10 rounded-[100%] blur-[120px] pointer-events-none mix-blend-screen"
                     />
                     <motion.div
                            style={{ y: y2, opacity }}
                            className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-orange-400/10 dark:bg-orange-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"
                     />

                     {/* Dynamic Particles Background (CSS only for performance) */}
                     <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08] pointer-events-none">
                            <div className="absolute h-full w-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                     </div>

                     <div className="relative z-10 text-center space-y-10 max-w-6xl mx-auto px-4 w-full">

                            {/* Intro Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.8, ease: "easeOut" }}
                                   className="flex justify-center"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-indigo-500/20 dark:border-white/10 backdrop-blur-md shadow-sm group">
                                          <div className="relative">
                                                 <Sparkles className="w-4 h-4 text-indigo-500 dark:text-violet-400 animate-pulse" />
                                                 <div className="absolute inset-0 bg-indigo-500/50 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                          <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-violet-400 dark:to-indigo-300">
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
                                   <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1] drop-shadow-sm mb-6">
                                          Tu club, <br />
                                          <span className="relative inline-block">
                                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-400 to-purple-600 dark:from-violet-400 dark:via-indigo-300 dark:to-purple-200 filter drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] px-2">
                                                        en piloto automático.
                                                 </span>
                                                 {/* Decorative underline */}
                                                 <motion.div
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: 1 }}
                                                        transition={{ delay: 0.8, duration: 1 }}
                                                        className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent rounded-full"
                                                 />
                                          </span>
                                   </h1>
                            </motion.div>

                            <motion.p
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                   className="text-lg md:text-2xl text-slate-600 dark:text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed"
                            >
                                   La plataforma definitiva que los clubes líderes eligen para escalar sin fricción. <br className="hidden md:block" />
                                   <span className="text-slate-900 dark:text-white font-bold decoration-orange-500/30 decoration-4 underline-offset-4 flex flex-wrap justify-center gap-x-4 mt-2">
                                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Reservas</span>
                                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pagos</span>
                                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kiosco</span>
                                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Métricas</span>
                                   </span>
                            </motion.p>

                            {/* Premium CTA Buttons */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                   className="flex flex-col items-center gap-10 mt-12 mb-16"
                            >
                                   <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-md sm:max-w-none">
                                          <Link href="/register" className="w-full sm:w-auto relative group">
                                                 {/* Animated Glow */}
                                                 <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-gradient-x" />
                                                 <span className="relative w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 dark:bg-primary text-white dark:text-primary-foreground rounded-2xl font-black text-xl transition-all active:scale-95 shadow-2xl border border-white/10 overflow-hidden">
                                                        {/* Shine effect */}
                                                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shine_1.5s_ease-in-out_infinite]" style={{ transform: 'skewX(-20deg)', animationDuration: '3s' }} />
                                                        Empezar Gratis Ahora
                                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                                                 </span>
                                          </Link>

                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20ver%20una%20demo%20de%20CourtOps%20%F0%9F%91%80"
                                                 target="_blank"
                                                 className="relative w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-black text-xl transition-all active:scale-95 backdrop-blur-xl shadow-xl hover:shadow-2xl cursor-pointer group"
                                          >
                                                 <div className="bg-orange-500/10 dark:bg-orange-500/20 p-2 rounded-full group-hover:scale-110 transition-transform">
                                                        <Play size={20} fill="currentColor" className="text-orange-500" />
                                                 </div>
                                                 Ver Demo
                                          </a>
                                   </div>

                                   {/* Trusted By / Logos Section */}
                                   <div className="w-full pt-10">
                                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500 mb-8">Elegido por los mejores</p>
                                          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                                                 <div className="text-xl font-black text-slate-800 dark:text-zinc-200 tracking-tighter italic">PadelPro</div>
                                                 <div className="text-xl font-black text-slate-800 dark:text-zinc-200 tracking-tighter flex items-center gap-1 h-6">
                                                        <div className="w-6 h-6 bg-slate-800 dark:bg-zinc-200 rounded-sm" />ARENA
                                                 </div>
                                                 <div className="text-xl font-black text-slate-800 dark:text-zinc-200 tracking-tighter uppercase border-2 border-slate-800 dark:border-zinc-200 px-2 py-0">ClubX</div>
                                                 <div className="text-xl font-black text-slate-800 dark:text-zinc-200 tracking-tighter">Match<span className="text-orange-500">Day</span></div>
                                          </div>
                                   </div>
                            </motion.div>
                     </div>

                     {/* WhatsApp Floating Button - Customized */}
                     <a
                            href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20info%20sobre%20CourtOps%20%F0%9F%8E%BE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group fixed bottom-8 right-8 z-[100] bg-orange-500 text-white p-5 rounded-full shadow-[0_15px_50px_-10px_rgba(249,115,22,0.8)] hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center ring-4 ring-orange-500/20 cursor-pointer"
                            aria-label="Contactar por WhatsApp"
                     >
                            <MessageCircle size={36} fill="currentColor" className="text-white" />
                            <span className="absolute right-full mr-6 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white px-5 py-3 rounded-2xl text-sm font-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none hidden md:block border border-slate-100 dark:border-white/10">
                                   ¿Hablamos por WhatsApp? 👋
                            </span>
                     </a>

              </section>
       )
}
