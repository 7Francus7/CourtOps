
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

       // A/B Testing Simulation
       const [heroVariant, setHeroVariant] = useState(0)

       const variants = [
              {
                     badge: "La nueva era en gestión deportiva",
                     headline: "en piloto automático.",
                     button: "Empezar Gratis Ahora"
              },
              {
                     badge: "Ahorra 10+ horas semanales",
                     headline: "que escala contigo.",
                     button: "Digitalizar Mi Club Hoy"
              },
              {
                     badge: "El sistema que los clubes aman",
                     headline: "sin complicaciones.",
                     button: "Unirme a la Élite"
              },
              {
                     badge: "Potencia tu rentabilidad",
                     headline: "100% automatizado.",
                     button: "Llevar Mi Club al Nivel Pro"
              }
       ]

       useEffect(() => {
              // Pick a random variant on mount
              setHeroVariant(Math.floor(Math.random() * variants.length))
       }, [])

       return (
              <section className="relative min-h-[100vh] flex flex-col items-center justify-start pt-32 md:pt-56 p-4 md:p-6 overflow-hidden bg-white dark:bg-black">
                     {/* Ultra Premium Background Effects */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-slate-100/50 via-white to-white dark:from-zinc-900/20 dark:via-black dark:to-black" />

                     {/* Atmospheric Lighting */}
                     <motion.div
                            style={{ y: y1, opacity }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"
                     />
                     <motion.div
                            style={{ y: y2, opacity }}
                            className="absolute top-1/4 -right-1/4 w-[700px] h-[700px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"
                     />

                     {/* Noise Texture */}
                     <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay">
                            <div className="absolute h-full w-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                     </div>

                     <div className="relative z-10 text-center space-y-10 max-w-6xl mx-auto px-4 w-full">

                            {/* Intro Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                   className="flex justify-center"
                            >
                                   <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl">
                                          <Sparkles size={14} className="text-emerald-500 animate-pulse" />
                                          {variants[heroVariant].badge}
                                   </div>
                            </motion.div>

                            {/* Ultimate Headline */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                   <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85] mb-8">
                                          Tu club, <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 pb-4">
                                                 {variants[heroVariant].headline}
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
                                   <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full">
                                          <Link href="/register" className="btn-premium py-5 px-12 text-xl w-full sm:w-auto shadow-emerald-500/20">
                                                 {variants[heroVariant].button}
                                                 <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                                          </Link>

                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20ver%20una%20demo%20de%20CourtOps%20%F0%9F%91%80"
                                                 target="_blank"
                                                 className="w-full sm:w-auto flex items-center justify-center gap-4 px-12 py-5 bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-[1.25rem] font-black text-xl transition-all hover:bg-slate-50 dark:hover:bg-white/[0.08] hover:-translate-y-1 active:scale-95 shadow-xl"
                                          >
                                                 <Play size={20} fill="currentColor" className="text-slate-900 dark:text-white" />
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
