
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import { Menu, X, ChevronRight } from 'lucide-react'

export default function LandingHeader() {
       const [scrolled, setScrolled] = useState(false)
       const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
                            "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out border-b",
                            scrolled
                                   ? "bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-slate-200/50 dark:border-white/5 py-4 shadow-2xl"
                                   : "bg-transparent border-transparent py-8"
                     )}
              >
                     {/* Scroll Progress Bar */}
                     <motion.div
                            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 origin-left z-50"
                            style={{ scaleX: scrollYProgress }}
                     />

                     <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">

                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-3 group relative">
                                   <div className="relative">
                                          <div className="absolute -inset-1.5 bg-emerald-500/20 rounded-xl blur-lg group-hover:bg-emerald-500/40 transition-all duration-700 opacity-0 group-hover:opacity-100" />
                                          <motion.div
                                                 whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                                                 className="relative w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-black text-xl shadow-2xl transition-all duration-500"
                                          >
                                                 C
                                          </motion.div>
                                   </div>
                                   <div className="flex flex-col">
                                          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center leading-none">
                                                 Court<span className="text-emerald-500 dark:text-emerald-400">Ops</span>
                                          </span>
                                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 mt-1 leading-none">Digital Turf</span>
                                   </div>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-xl">
                                   <Link href="#features" className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-xl transition-all">
                                          Características
                                   </Link>
                                   <Link href="/calculator" className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-all flex items-center gap-2 group/calc">
                                          Calculadora ROI
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                   </Link>
                                   <Link href="#pricing" className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-xl transition-all">
                                          Precios
                                   </Link>
                                   <Link href="#faq" className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-xl transition-all">
                                          FAQ
                                   </Link>
                            </nav>

                            {/* Actions */}
                            <div className="hidden lg:flex items-center gap-8">
                                   <ThemeToggle />
                                   <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white transition-colors">
                                          Ingresar
                                   </Link>
                                   <Link href="/register" className="btn-premium py-3 px-8 text-xs shadow-emerald-500/20">
                                          PROBAR GRATIS
                                   </Link>
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                   className="lg:hidden text-slate-900 dark:text-white p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-all active:scale-95"
                                   onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                   {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                     </div>

                     {/* Mobile Menu */}
                     <AnimatePresence>
                            {mobileMenuOpen && (
                                   <motion.div
                                          initial={{ opacity: 0, height: 0, filter: "blur(20px)" }}
                                          animate={{ opacity: 1, height: 'auto', filter: "blur(0px)" }}
                                          exit={{ opacity: 0, height: 0, filter: "blur(20px)" }}
                                          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                          className="absolute top-full left-0 right-0 bg-white dark:bg-black backdrop-blur-3xl border-b border-slate-200 dark:border-white/10 overflow-hidden lg:hidden shadow-2xl"
                                   >
                                          <div className="p-8 flex flex-col gap-4">
                                                 <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-widest p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-all">Características</Link>
                                                 <Link href="/calculator" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-widest p-4 rounded-3xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-all flex items-center justify-between">Calculadora ROI <ChevronRight size={20} /></Link>
                                                 <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-widest p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-all">Precios</Link>
                                                 <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-widest p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-all">FAQ</Link>

                                                 <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col gap-6">
                                                        <div className="flex justify-between items-center px-4">
                                                               <span className="font-black text-slate-400 dark:text-zinc-600 text-[10px] uppercase tracking-[0.3em]">Modo Visual</span>
                                                               <ThemeToggle />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-5 rounded-[2rem] border border-slate-200 dark:border-white/10 font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">
                                                                      Ingresar
                                                               </Link>
                                                               <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-5 rounded-[2rem] bg-emerald-500 font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-emerald-500/30">
                                                                      Gratis
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
