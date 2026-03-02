'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import { Menu, X, ChevronRight, Zap } from 'lucide-react'
import { usePerformance } from '@/contexts/PerformanceContext'

export default function LandingHeader() {
       const [scrolled, setScrolled] = useState(false)
       const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
       const { isLowEnd } = usePerformance()

       useEffect(() => {
              const handleScroll = () => {
                     setScrolled(window.scrollY > 20)
              }
              window.addEventListener('scroll', handleScroll)
              return () => window.removeEventListener('scroll', handleScroll)
       }, [])

       const { scrollYProgress } = useScroll()

       return (
              <header
                     className={cn(
                            "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out",
                            scrolled
                                   ? cn(
                                          "py-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-b",
                                          isLowEnd
                                                 ? "bg-white dark:bg-[#02040A] border-slate-200 dark:border-white/10"
                                                 : "bg-white/80 dark:bg-[#02040A]/80 backdrop-blur-2xl border-slate-200/50 dark:border-white/5"
                                   )
                                   : "bg-transparent border-b border-transparent py-8"
                     )}
              >
                     {/* Scroll Progress Bar - Ultra thin cinematic */}
                     {!isLowEnd && (
                            <motion.div
                                   className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 origin-left z-50"
                                   style={{ scaleX: scrollYProgress }}
                                   transition={{ type: "spring", stiffness: 100, damping: 30, restDelta: 0.001 }}
                            />
                     )}

                     <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">

                            {/* Logo - High Contrast */}
                            <Link href="/" className="flex items-center gap-4 group">
                                   <div className="relative">
                                          <div className="absolute -inset-2 bg-emerald-500/20 rounded-xl blur-lg group-hover:bg-emerald-500/40 transition-all duration-700 opacity-0 group-hover:opacity-100" />
                                          <motion.div
                                                 whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                                                 className="relative w-11 h-11 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-2xl transition-all duration-500"
                                          >
                                                 <Zap size={22} fill="currentColor" />
                                          </motion.div>
                                   </div>
                                   <div className="flex flex-col">
                                          <span className="text-2xl font-black tracking-tighter text-slate-950 dark:text-white flex items-center leading-none uppercase italic">
                                                 Court<span className="text-emerald-500">Ops</span>
                                          </span>
                                          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-600 mt-1 leading-none">Engineering</span>
                                   </div>
                            </Link>

                            {/* Desktop Nav - Minimalist Capsule */}
                            <nav className="hidden lg:flex items-center gap-2 bg-slate-100/50 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-slate-900/5 dark:border-white/5 backdrop-blur-xl">
                                   {[
                                          { name: 'Funciones', href: '#features' },
                                          { name: 'Proceso', href: '#how-it-works' },
                                          { name: 'Planes', href: '#pricing' },
                                          { name: 'Preguntas', href: '#faq' }
                                   ].map((item) => (
                                          <Link
                                                 key={item.name}
                                                 href={item.href}
                                                 className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-zinc-500 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-xl transition-all"
                                          >
                                                 {item.name}
                                          </Link>
                                   ))}
                            </nav>

                            {/* Actions - Impactful */}
                            <div className="hidden lg:flex items-center gap-10">
                                   <div className="flex items-center gap-8 border-r border-slate-200 dark:border-white/10 pr-10">
                                          <ThemeToggle />
                                          <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-950 dark:text-zinc-500 dark:hover:text-white transition-colors">
                                                 Ingresar
                                          </Link>
                                   </div>
                                   <Link href="/register" className="relative group px-8 py-4 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl active:scale-95">
                                          Prueba Gratis
                                   </Link>
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                   className="lg:hidden text-slate-950 dark:text-white p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-900/5 dark:border-white/5 transition-all active:scale-95"
                                   onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                   {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                     </div>

                     {/* Mobile Overlay Menu */}
                     <AnimatePresence>
                            {mobileMenuOpen && (
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                          className={cn(
                                                 "absolute top-full left-4 right-4 mt-4 overflow-hidden lg:hidden rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-white/10",
                                                 "bg-white dark:bg-[#02040A] backdrop-blur-3xl"
                                          )}
                                   >
                                          <div className="p-10 flex flex-col gap-6">
                                                 <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase tracking-tighter italic p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-950 dark:text-white transition-all flex items-center justify-between">Funciones <ChevronRight size={20} /></Link>
                                                 <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase tracking-tighter italic p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-950 dark:text-white transition-all flex items-center justify-between">Proceso <ChevronRight size={20} /></Link>
                                                 <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black uppercase tracking-tighter italic p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-950 dark:text-white transition-all flex items-center justify-between">Planes <ChevronRight size={20} /></Link>

                                                 <div className="mt-10 pt-10 border-t border-slate-100 dark:border-white/5 flex flex-col gap-8">
                                                        <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem]">
                                                               <span className="font-black text-slate-400 dark:text-zinc-600 text-[10px] uppercase tracking-[0.4em]">Tema Visual</span>
                                                               <ThemeToggle />
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4">
                                                               <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-6 rounded-[2rem] bg-emerald-500 font-black text-xs uppercase tracking-[0.4em] text-white shadow-2xl">
                                                                      Empezar Gratis
                                                               </Link>
                                                               <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-6 rounded-[2rem] bg-slate-950 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.4em]">
                                                                      Ingresar
                                                               </Link>
                                                        </div>
                                                 </div>
                                          </div>
                                   </motion.div>
                            )}
                     </AnimatePresence>
              </header>
       )
}
