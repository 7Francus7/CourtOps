
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
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

       return (
              <header
                     className={cn(
                            "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b border-transparent",
                            scrolled ? "bg-white/70 dark:bg-[#030712]/70 backdrop-blur-2xl border-slate-200/50 dark:border-white/5 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.05)]" : "bg-transparent py-6"
                     )}
              >
                     <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">

                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-3 group relative">
                                   <div className="relative">
                                          <div className="absolute -inset-2 bg-emerald-500/20 rounded-xl blur-lg group-hover:bg-emerald-500/40 transition-all duration-500" />
                                          <div className="relative w-11 h-11 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-black text-xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                 C
                                          </div>
                                   </div>
                                   <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center">
                                          Court<span className="text-emerald-500 dark:text-emerald-400">Ops</span>
                                          <div className="w-1 h-1 bg-emerald-500 rounded-full ml-1 animate-pulse" />
                                   </span>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center gap-1 bg-white/40 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-xl shadow-sm">
                                   <Link href="#features" className="px-5 py-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-xl transition-all">
                                          Características
                                   </Link>
                                   <Link href="/calculator" className="px-5 py-2 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-all flex items-center gap-2 group/calc">
                                          <span className="relative">
                                                 Calculadora ROI
                                                 <span className="absolute -top-1 -right-4 text-[8px] animate-bounce">🔥</span>
                                          </span>
                                   </Link>
                                   <Link href="#pricing" className="px-5 py-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-xl transition-all">
                                          Precios
                                   </Link>
                                   <Link href="#faq" className="px-5 py-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-xl transition-all">
                                          FAQ
                                   </Link>
                            </nav>

                            {/* Actions */}
                            <div className="hidden md:flex items-center gap-6">
                                   <ThemeToggle />
                                   <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                                          Ingresar
                                   </Link>
                                   <Link href="/register" className="btn-premium py-2.5 px-6 shadow-emerald-500/20">
                                          Probar Gratis
                                   </Link>
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                   className="md:hidden text-slate-900 dark:text-white p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
                                   onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                   {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                     </div>

                     {/* Mobile Menu */}
                     {mobileMenuOpen && (
                            <motion.div
                                   initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                                   animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                   className="absolute top-full left-0 right-0 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 p-6 md:hidden shadow-2xl flex flex-col gap-2"
                            >
                                   <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-200 transition-colors">Características</Link>
                                   <Link href="/calculator" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold p-4 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors">🔥 Calculadora ROI</Link>
                                   <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-200 transition-colors">Precios</Link>
                                   <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-200 transition-colors mb-4">FAQ</Link>

                                   <div className="flex flex-col gap-4 mt-2 pt-6 border-t border-slate-200 dark:border-white/10">
                                          <div className="flex justify-between items-center px-4">
                                                 <span className="font-bold text-slate-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Tema Visual</span>
                                                 <ThemeToggle />
                                          </div>
                                          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-4 rounded-2xl border-2 border-slate-200 dark:border-white/10 font-bold text-slate-900 dark:text-white mt-4">
                                                 Iniciar Sesión
                                          </Link>
                                          <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="relative group w-full text-center">
                                                 <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-2xl blur opacity-70" />
                                                 <div className="relative w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-wider text-sm shadow-xl flex items-center justify-center gap-2">
                                                        Comenzar Gratis <ChevronRight size={18} />
                                                 </div>
                                          </Link>
                                   </div>
                            </motion.div>
                     )}
              </header>
       )
}
