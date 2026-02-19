
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

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
                            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-transparent",
                            scrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-slate-200 dark:border-white/10 py-3 shadow-sm" : "bg-transparent py-5"
                     )}
              >
                     <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2 group">
                                   <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                                          C
                                   </div>
                                   <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                          Court<span className="text-primary dark:text-primary">Ops</span>
                                   </span>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center gap-8">
                                   <Link href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                                          Características
                                   </Link>
                                   <Link href="/calculator" className="text-sm font-medium text-accent dark:text-accent hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
                                          Calculadora ROI
                                   </Link>
                                   <Link href="#pricing" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                                          Precios
                                   </Link>
                                   <Link href="#faq" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                                          FAQ
                                   </Link>
                            </nav>

                            {/* Actions */}
                            <div className="hidden md:flex items-center gap-4">
                                   <ThemeToggle />

                                   <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />

                                   <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white transition-colors">
                                          Iniciar Sesión
                                   </Link>
                                   <Link href="/register" className="relative group">
                                          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-200" />
                                          <button className="relative px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-black rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors">
                                                 Comenzar Ahora
                                          </button>
                                   </Link>
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                   className="md:hidden text-slate-900 dark:text-white p-2"
                                   onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                   {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                     </div>

                     {/* Mobile Menu */}
                     {mobileMenuOpen && (
                            <motion.div
                                   initial={{ opacity: 0, y: -20 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-white/10 p-6 md:hidden shadow-xl flex flex-col gap-4"
                            >
                                   <Link href="#features" className="text-base font-medium py-2 border-b border-slate-100 dark:border-white/5 text-slate-600 dark:text-zinc-300">Características</Link>
                                   <Link href="#pricing" className="text-base font-medium py-2 border-b border-slate-100 dark:border-white/5 text-slate-600 dark:text-zinc-300">Precios</Link>
                                   <div className="flex flex-col gap-3 mt-2">
                                          <Link href="/login" className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-white/10 font-semibold text-slate-700 dark:text-zinc-200">
                                                 Iniciar Sesión
                                          </Link>
                                          <Link href="/register" className="w-full text-center py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-violet-700">
                                                 Comenzar Gratis
                                          </Link>
                                   </div>
                            </motion.div>
                     )}
              </header>
       )
}
