
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
       const { scrollY } = useScroll()
       const y1 = useTransform(scrollY, [0, 500], [0, 200])
       const y2 = useTransform(scrollY, [0, 500], [0, -150])
       const opacity = useTransform(scrollY, [0, 300], [1, 0])

       // Variant system
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

       const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
       const containerRef = useRef<HTMLElement>(null)

       useEffect(() => {
              const handleMouseMove = (e: MouseEvent) => {
                     setMousePos({ x: e.clientX, y: e.clientY })
              }
              window.addEventListener('mousemove', handleMouseMove)

              const interval = setInterval(() => {
                     setHeroVariant(prev => (prev + 1) % variants.length)
              }, 6000)

              return () => {
                     window.removeEventListener('mousemove', handleMouseMove)
                     clearInterval(interval)
              }
       }, [])

       return (
              <section
                     ref={containerRef}
                     className="relative min-h-[100vh] flex flex-col items-center justify-start pt-32 md:pt-56 p-4 md:p-6 overflow-hidden bg-background"
              >
                     {/* Ultra Premium Background Effects */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-muted/50 via-background to-background" />

                     {/* Atmospheric Lighting with Mouse Parallax */}
                     <motion.div
                            animate={{
                                   x: (mousePos.x / 50),
                                   y: (mousePos.y / 50),
                            }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1600px] h-[900px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none"
                     />
                     <motion.div
                            animate={{
                                   x: -(mousePos.x / 40),
                                   y: -(mousePos.y / 40),
                            }}
                            className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"
                     />

                     {/* Noise Texture */}
                     <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay">
                            <div className="absolute h-full w-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                     </div>

                     <div className="relative z-10 text-center space-y-12 max-w-7xl mx-auto px-4 w-full">

                            {/* Intro Badge */}
                            <motion.div
                                   initial={{ opacity: 0, y: -20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="flex justify-center"
                            >
                                   <AnimatePresence mode="wait">
                                          <motion.div
                                                 key={heroVariant}
                                                 initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                                 animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                                 exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                                                 className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-3xl shadow-2xl"
                                          >
                                                 <Sparkles size={14} className="text-emerald-500 animate-pulse" />
                                                 {variants[heroVariant].badge}
                                          </motion.div>
                                   </AnimatePresence>
                            </motion.div>

                            {/* Ultimate Headline */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                   <h1 className="text-6xl md:text-9xl lg:text-[11rem] font-black tracking-tighter text-foreground leading-[0.8] mb-12">
                                          Tu club, <br />
                                          <AnimatePresence mode="wait">
                                                 <motion.span
                                                        key={heroVariant}
                                                        initial={{ y: 80, opacity: 0, filter: 'blur(20px)', rotateX: 45 }}
                                                        animate={{ y: 0, opacity: 1, filter: 'blur(0px)', rotateX: 0 }}
                                                        exit={{ y: -80, opacity: 0, filter: 'blur(20px)', rotateX: -45 }}
                                                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                                        className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 pb-12 pt-4"
                                                 >
                                                        {variants[heroVariant].headline}
                                                 </motion.span>
                                          </AnimatePresence>
                                   </h1>
                            </motion.div>

                            <motion.p
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                   className="text-lg md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed"
                            >
                                   La plataforma definitiva que los clubes líderes eligen para escalar sin fricción. <br className="hidden md:block" />
                                   <span className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8">
                                          {['Reservas', 'Pagos', 'Kiosco', 'Métricas'].map((tag) => (
                                                 <span key={tag} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {tag}
                                                 </span>
                                          ))}
                                   </span>
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                   className="flex flex-col items-center gap-16 mt-16 mb-24"
                            >
                                   <div className="flex flex-col sm:flex-row gap-8 justify-center items-center w-full">
                                          <Link href="/register" className="btn-premium py-6 px-14 text-xl w-full sm:w-auto shadow-emerald-500/20 group relative overflow-hidden">
                                                 <span className="relative z-10 flex items-center">
                                                        {variants[heroVariant].button}
                                                        <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                                                 </span>
                                                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                                          </Link>

                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20ver%20una%20demo%20de%20CourtOps%20%F0%9F%91%80"
                                                 target="_blank"
                                                 className="w-full sm:w-auto flex items-center justify-center gap-6 px-14 py-6 bg-card text-foreground border border-border rounded-[1.5rem] font-black text-xl transition-all hover:bg-muted hover:-translate-y-2 active:scale-95 shadow-xl group/demo"
                                          >
                                                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-all group-hover/demo:bg-indigo-500 group-hover/demo:text-white">
                                                        <Play size={18} fill="currentColor" />
                                                 </div>
                                                 Ver Demo
                                          </a>
                                   </div>

                                   {/* Trusted By & Compact Stats */}
                                   <div className="w-full pt-10 border-t border-border space-y-16">
                                          <div className="flex flex-col items-center">
                                                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-10">Elegido por los mejores</p>
                                                 <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-40 dark:opacity-20 hover:opacity-100 transition-all duration-1000">
                                                        <div className="text-2xl font-black text-foreground tracking-tighter italic">PadelPro</div>
                                                        <div className="text-2xl font-black text-foreground tracking-tighter flex items-center gap-2 h-7">
                                                               <div className="w-7 h-7 bg-foreground rounded-lg" />ARENA
                                                        </div>
                                                        <div className="text-2xl font-black text-foreground tracking-tighter uppercase border-2 border-foreground px-3 py-0.5 rounded-lg">ClubX</div>
                                                        <div className="text-2xl font-black text-foreground tracking-tighter">Match<span className="text-emerald-500">Day</span></div>
                                                 </div>
                                          </div>

                                          {/* Compact Stats Grid */}
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto w-full border-t border-border pt-16">
                                                 {[
                                                        { label: 'Reservas Mensuales', value: '12k+' },
                                                        { label: 'Clubes Activos', value: '150+' },
                                                        { label: 'Uptime Sistema', value: '99.9%' },
                                                        { label: 'Onboarding', value: '10m' }
                                                 ].map((stat, i) => (
                                                        <div key={i} className="text-center group">
                                                               <div className="text-2xl md:text-3xl font-black text-foreground tracking-tighter group-hover:scale-110 transition-transform">{stat.value}</div>
                                                               <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</div>
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>
                            </motion.div>
                     </div>

                     {/* WhatsApp Floating Button */}
                     <a
                            href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20info%20sobre%20CourtOps%20%F0%9F%8E%BE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group fixed bottom-10 right-10 z-[100] bg-emerald-500 text-white p-6 rounded-full shadow-2xl shadow-emerald-500/50 hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center ring-8 ring-emerald-500/10 cursor-pointer overflow-hidden"
                            aria-label="Contactar por WhatsApp"
                     >
                            <MessageCircle size={32} fill="currentColor" className="text-white relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <span className="absolute right-full mr-8 bg-black text-white px-6 py-4 rounded-2xl text-sm font-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-8 group-hover:translate-x-0 whitespace-nowrap pointer-events-none hidden md:block border border-white/10">
                                   ¿Conversamos por WhatsApp? 👋
                            </span>
                     </a>
              </section>
       )
}
