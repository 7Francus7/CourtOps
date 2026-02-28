'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, MessageCircle, Sparkles, CheckCircle2, ShieldCheck, Zap, Star } from 'lucide-react'
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
                     className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 md:pt-32 p-4 md:p-6 overflow-hidden bg-[#020617] dark:bg-[#020617] antialiased"
              >
                     {/* Cinematic Atmospheric Light */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#0f172a_0%,_#020617_100%)]" />

                     {/* Interactive Aurora Glow */}
                     <motion.div
                            animate={{
                                   x: (mousePos.x / 40) - 400,
                                   y: (mousePos.y / 40) - 400,
                            }}
                            className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none opacity-50"
                     />
                     <motion.div
                            animate={{
                                   x: -(mousePos.x / 30) + 200,
                                   y: -(mousePos.y / 30) - 200,
                            }}
                            className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none opacity-30"
                     />

                     {/* Stars/Grid Background */}
                     <div className="absolute inset-0 bg-[url('https://grain-y.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
                     <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                     <div className="relative z-10 text-center max-w-6xl mx-auto px-4 w-full flex flex-col items-center">

                            {/* Animated Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                   animate={{ opacity: 1, y: 0, scale: 1 }}
                                   className="mb-8"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md shadow-2xl">
                                          <div className="flex -space-x-1 mr-2 opacity-60">
                                                 {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />)}
                                          </div>
                                          <span className="animate-pulse flex items-center gap-2">
                                                 <Zap size={10} fill="currentColor" />
                                                 {variants[heroVariant].badge}
                                          </span>
                                   </div>
                            </motion.div>

                            {/* Main Title Section */}
                            <div className="space-y-6 mb-12">
                                   <motion.h1
                                          initial={{ opacity: 0, y: 40 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                          className="text-[3.5rem] md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-[0.85] uppercase italic"
                                   >
                                          Reinventamos <br />
                                          <AnimatePresence mode="wait">
                                                 <motion.span
                                                        key={heroVariant}
                                                        initial={{ opacity: 0, rotateX: 90, y: 40, filter: 'blur(10px)' }}
                                                        animate={{ opacity: 1, rotateX: 0, y: 0, filter: 'blur(0px)' }}
                                                        exit={{ opacity: 0, rotateX: -90, y: -40, filter: 'blur(10px)' }}
                                                        transition={{ duration: 0.8, ease: "circOut" }}
                                                        className="block text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-teal-300 to-indigo-400 pb-4"
                                                 >
                                                        {variants[heroVariant].headline}
                                                 </motion.span>
                                          </AnimatePresence>
                                   </motion.h1>

                                   <motion.p
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.5, duration: 1 }}
                                          className="text-lg md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed px-4"
                                   >
                                          {variants[heroVariant].subheadline}
                                   </motion.p>
                            </div>

                            {/* Action Group */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 0.6, duration: 0.8 }}
                                   className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center"
                            >
                                   <Link href="/register" className="relative group overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl px-12 py-6 rounded-[2rem] transition-all transform active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                          <span className="relative z-10 flex items-center gap-3">
                                                 {variants[heroVariant].button}
                                                 <ArrowRight className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                                          </span>
                                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                                   </Link>

                                   <a
                                          href="https://wa.me/5493524421497"
                                          className="flex items-center gap-4 px-10 py-6 bg-white/5 border border-white/10 rounded-[2rem] font-black text-xl text-white hover:bg-white/10 transition-all active:scale-95 group"
                                   >
                                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                                 <Play size={16} fill="white" className="ml-1" />
                                          </div>
                                          Ver Demo en Vivo
                                   </a>
                            </motion.div>

                            {/* Trust & Stats */}
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ delay: 1, duration: 1 }}
                                   className="mt-24 pt-12 border-t border-white/5 w-full max-w-4xl"
                            >
                                   <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-slate-500">
                                          <div className="flex flex-col items-center md:items-start gap-1">
                                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-emerald-500/60">Socios Globales</span>
                                                 <div className="flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">
                                                        <span className="text-xl font-black italic tracking-tighter text-white">ARENA</span>
                                                        <span className="text-xl font-black italic tracking-tighter text-white">PADELPRO</span>
                                                        <span className="text-xl font-black italic tracking-tighter text-white">MATCHDAY</span>
                                                 </div>
                                          </div>
                                          <div className="bg-white/5 px-8 py-5 rounded-[2rem] border border-white/10 flex items-center gap-8 backdrop-blur-sm">
                                                 <div className="text-center">
                                                        <p className="text-2xl font-black text-white tracking-tighter">12.5k</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Reservas/Mes</p>
                                                 </div>
                                                 <div className="w-px h-8 bg-white/10" />
                                                 <div className="text-center">
                                                        <p className="text-2xl font-black text-white tracking-tighter">99.9%</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Uptime</p>
                                                 </div>
                                          </div>
                                   </div>
                            </motion.div>
                     </div>

                     {/* Floating WhatsApp Card */}
                     <Link
                            href="https://wa.me/5493524421497"
                            target="_blank"
                            className="fixed bottom-8 right-8 z-[110] bg-[#25D366] text-white p-5 rounded-full shadow-2xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all group flex items-center justify-center overflow-hidden"
                     >
                            <MessageCircle size={32} fill="white" />
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="absolute right-full mr-6 bg-slate-900 border border-white/10 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 whitespace-nowrap shadow-2xl pointer-events-none">
                                   ¿Conversamos? 👋
                            </span>
                     </Link>

                     {/* Mouse Trail Scroll Indicator */}
                     <motion.div
                            style={{ opacity }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20"
                     >
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Deslizar para explorar</span>
                            <div className="w-1 h-12 rounded-full bg-gradient-to-b from-emerald-500/80 to-transparent animate-bounce" />
                     </motion.div>
              </section>
       )
}
