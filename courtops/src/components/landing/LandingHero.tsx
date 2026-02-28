'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, MessageCircle, Sparkles, CheckCircle2, ShieldCheck, Zap, Star, Activity, Globe, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
       const { scrollY } = useScroll()
       const y1 = useTransform(scrollY, [0, 500], [0, 200])
       const opacity = useTransform(scrollY, [0, 300], [1, 0])

       const [heroVariant, setHeroVariant] = useState(0)
       const variants = [
              {
                     badge: "SaaS de Próxima Generación",
                     headline: "la gestión de tu club.",
                     subheadline: "La plataforma definitiva que los clubes de élite eligen para automatizar cada centímetro de su operación.",
                     button: "Empezar Gratis"
              },
              {
                     badge: "Rentabilidad Optimizada",
                     headline: "tus ingresos hoy.",
                     subheadline: "Kiosco inteligente, pagos automáticos y analíticas que revelan oportunidades ocultas en tu club.",
                     button: "Ver Planes Pro"
              }
       ]

       const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
       const containerRef = useRef<HTMLElement>(null)

       useEffect(() => {
              const handleMouseMove = (e: MouseEvent) => {
                     setMousePos({ x: e.clientX, y: e.clientY })
              }
              window.addEventListener('mousemove', handleMouseMove)
              const interval = setInterval(() => {
                     setHeroVariant(prev => (prev + 1) % variants.length)
              }, 8000)
              return () => {
                     window.removeEventListener('mousemove', handleMouseMove)
                     clearInterval(interval)
              }
       }, [])

       return (
              <section
                     ref={containerRef}
                     className="relative min-h-[110vh] flex flex-col items-center justify-center pt-24 md:pt-32 p-4 md:p-6 overflow-hidden bg-black antialiased"
              >
                     {/* Cinematic Atmospheric Light */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#0a192f_0%,_#000000_100%)] opacity-80" />

                     {/* Interactive Aurora Glow - Enhanced Brighter */}
                     <motion.div
                            animate={{
                                   x: (mousePos.x / 30) - 500,
                                   y: (mousePos.y / 30) - 500,
                            }}
                            className="absolute top-0 left-1/2 w-[1000px] h-[1000px] bg-emerald-500/20 rounded-full blur-[200px] pointer-events-none opacity-40 mix-blend-screen"
                     />
                     <motion.div
                            animate={{
                                   x: -(mousePos.x / 20) + 300,
                                   y: -(mousePos.y / 20) - 300,
                            }}
                            className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-indigo-500/15 rounded-full blur-[180px] pointer-events-none opacity-30 mix-blend-screen"
                     />

                     {/* Cinematic Grain & Grid */}
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay scale-150" />
                     <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_10%,#000_60%,transparent_100%)]" />

                     {/* Status Badge Top Right */}
                     <div className="absolute top-32 right-8 hidden lg:flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-2xl shadow-2xl z-50 animate-fade-in">
                            <div className="relative">
                                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                   <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                            </div>
                            <div className="flex flex-col">
                                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Sistemas Online</span>
                                   <span className="text-[7px] font-black uppercase tracking-[0.3em] text-emerald-500/80">Latencia: 14ms</span>
                            </div>
                     </div>

                     <div className="relative z-10 text-center max-w-7xl mx-auto px-4 w-full flex flex-col items-center">

                            {/* Animated Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                   animate={{ opacity: 1, y: 0, scale: 1 }}
                                   className="mb-10"
                            >
                                   <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group cursor-default">
                                          <div className="flex -space-x-1.5 mr-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                 {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-xl" />)}
                                          </div>
                                          <span className="flex items-center gap-3">
                                                 <Zap size={12} fill="currentColor" className="animate-pulse" />
                                                 {variants[heroVariant].badge}
                                          </span>
                                   </div>
                            </motion.div>

                            {/* Main Title Section */}
                            <div className="space-y-8 mb-16">
                                   <motion.h1
                                          initial={{ opacity: 0, y: 60 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                          className="text-[4rem] md:text-[10rem] lg:text-[14rem] font-black tracking-tighter text-white leading-[0.8] uppercase italic drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                                   >
                                          <span className="block opacity-90">Reinventamos</span>
                                          <AnimatePresence mode="wait">
                                                 <motion.span
                                                        key={heroVariant}
                                                        initial={{ opacity: 0, rotateX: 90, y: 50, filter: 'blur(20px)' }}
                                                        animate={{ opacity: 1, rotateX: 0, y: 0, filter: 'blur(0px)' }}
                                                        exit={{ opacity: 0, rotateX: -90, y: -50, filter: 'blur(20px)' }}
                                                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                                                        className="block text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-teal-300 to-indigo-500 pb-6 pr-4"
                                                 >
                                                        {variants[heroVariant].headline}
                                                 </motion.span>
                                          </AnimatePresence>
                                   </motion.h1>

                                   <motion.p
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.7, duration: 1.2 }}
                                          className="text-xl md:text-3xl text-slate-400 font-medium max-w-4xl mx-auto leading-tight px-4 italic opacity-80"
                                   >
                                          {variants[heroVariant].subheadline}
                                   </motion.p>
                            </div>

                            {/* Action Group */}
                            <motion.div
                                   initial={{ opacity: 0, y: 40 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 0.8, duration: 1 }}
                                   className="flex flex-col sm:flex-row items-center gap-8 w-full justify-center"
                            >
                                   <Link href="/register" className="relative group py-7 px-16 rounded-[2.5rem] bg-emerald-500 text-slate-950 font-black text-2xl uppercase tracking-[0.2em] shadow-[0_40px_80px_-20px_rgba(16,185,129,0.5)] hover:scale-[1.05] active:scale-95 transition-all duration-500 overflow-hidden">
                                          <span className="relative z-10 flex items-center gap-4">
                                                 {variants[heroVariant].button}
                                                 <ArrowRight className="group-hover:translate-x-3 transition-transform" strokeWidth={4} />
                                          </span>
                                          <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                          {/* Pulse Glow Internal */}
                                          <div className="absolute inset-0 bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                                   </Link>

                                   <a
                                          href="https://wa.me/5493524421497"
                                          className="flex items-center gap-6 px-12 py-7 bg-white/[0.03] border border-white/10 rounded-[2.5rem] font-black text-xl text-white hover:bg-white/[0.08] transition-all active:scale-95 group backdrop-blur-xl shadow-2xl"
                                   >
                                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-110 transition-all">
                                                 <Play size={20} fill="white" className="ml-1" />
                                          </div>
                                          Ver Demo Élite
                                   </a>
                            </motion.div>

                            {/* Trust & Verification Labels */}
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: 1.2 }}
                                   className="mt-20 flex items-center gap-12 text-slate-500 opacity-60"
                            >
                                   <div className="flex items-center gap-2 group cursor-default">
                                          <ShieldCheck size={16} className="text-emerald-500 group-hover:animate-bounce" />
                                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Encriptación 256-bit</span>
                                   </div>
                                   <div className="flex items-center gap-2 group cursor-default">
                                          <Activity size={16} className="text-indigo-500 group-hover:animate-pulse" />
                                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">99.9% Uptime</span>
                                   </div>
                                   <div className="flex items-center gap-2 group cursor-default">
                                          <Globe size={16} className="text-teal-500 group-hover:rotate-12 transition-transform" />
                                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Multi-Club Edition</span>
                                   </div>
                            </motion.div>
                     </div>

                     {/* Mouse Trail Scroll Indicator */}
                     <motion.div
                            style={{ opacity }}
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5 opacity-30"
                     >
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50">Explora la Ingeniería</span>
                            <div className="w-1 h-14 rounded-full bg-gradient-to-b from-emerald-500 to-transparent animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                     </motion.div>
              </section>
       )
}
