'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import { Menu, X, ChevronRight, Zap } from 'lucide-react'

const NavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) => (
       <Link
              href={href}
              className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={onClick}
       >
              {children}
       </Link>
)

export default function LandingHeader() {
       const [scrolled, setScrolled] = useState(false)
       const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
       const [mounted, setMounted] = useState(false)

       useEffect(() => {
              setMounted(true)
              const handleScroll = () => {
                     setScrolled(window.scrollY > 10)
              }
              window.addEventListener('scroll', handleScroll)
              return () => window.removeEventListener('scroll', handleScroll)
       }, [])


       return (
              <header
                     className={cn(
                            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-2xl",
                            scrolled
                                   ? "bg-white/80 dark:bg-zinc-950/70 border-b border-slate-200/60 dark:border-white/[0.07] shadow-sm dark:shadow-[0_1px_30px_rgba(0,0,0,0.4)] py-3"
                                   : "bg-transparent border-b border-transparent py-6"
                     )}
              >
                     <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">

                            {/* Simple Brand Logo */}
                            <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                          <Zap size={18} fill="currentColor" />
                                   </div>
                                   <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                          CourtOps
                                   </span>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-10">
                                   <NavLink href="#features" onClick={() => setMobileMenuOpen(false)}>Funciones</NavLink>
                                   <NavLink href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Proceso</NavLink>
                                   <NavLink href="#pricing" onClick={() => setMobileMenuOpen(false)}>Precios</NavLink>
                                   <NavLink href="#faq" onClick={() => setMobileMenuOpen(false)}>Ayuda</NavLink>
                            </nav>

                            {/* Action Buttons */}
                            <div className="hidden md:flex items-center gap-4">
                                   {mounted && <ThemeToggle />}
                                   <Link href="/login" className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                          Entrar
                                   </Link>
                                   <Link href="/register" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white/10 backdrop-blur-xl text-white text-sm font-bold border border-slate-800 dark:border-white/15 transition-all hover:bg-slate-800 dark:hover:bg-white/20 active:scale-95 shadow-lg">
                                          Registrarse
                                   </Link>
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                   className="md:hidden p-2 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                   onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                   {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                     </div>

                     {/* Mobile Dropdown */}
                     <AnimatePresence>
                            {mobileMenuOpen && (
                                   <motion.div
                                          initial={{ opacity: 0, y: -20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -20 }}
                                          transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                          className="absolute top-full left-0 right-0 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/[0.07] p-8 flex flex-col gap-5 md:hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.6)] z-50 rounded-b-3xl"
                                   >
                                          <div className="flex flex-col gap-4">
                                                 {[
                                                        { href: "#features", label: "Funciones" },
                                                        { href: "#how-it-works", label: "Proceso" },
                                                        { href: "#pricing", label: "Precios" },
                                                        { href: "#faq", label: "Preguntas Frecuentes" }
                                                 ].map((link) => (
                                                        <Link
                                                               key={link.href}
                                                               href={link.href}
                                                               onClick={() => setMobileMenuOpen(false)}
                                                               className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.07] text-sm font-bold text-slate-700 dark:text-zinc-300 transition-all active:scale-[0.98] hover:bg-slate-100 dark:hover:bg-white/[0.07]"
                                                        >
                                                               {link.label}
                                                               <ChevronRight size={16} className="text-slate-400" />
                                                        </Link>
                                                 ))}
                                          </div>

                                          <div className="pt-6 mt-4 border-t border-white/[0.06] flex flex-col gap-4">
                                                 <div className="flex items-center justify-between px-1">
                                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tema</span>
                                                        {mounted && <ThemeToggle />}
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-4">
                                                        <Link
                                                               href="/login"
                                                               onClick={() => setMobileMenuOpen(false)}
                                                               className="flex-1 text-center py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm bg-white dark:bg-white/5 backdrop-blur-xl"
                                                        >
                                                               Entrar
                                                        </Link>
                                                        <Link
                                                               href="/register"
                                                               onClick={() => setMobileMenuOpen(false)}
                                                               className="flex-1 text-center py-4 rounded-2xl bg-slate-900 dark:bg-emerald-500 text-white font-bold text-sm shadow-lg dark:shadow-emerald-500/25"
                                                        >
                                                               Registro
                                                        </Link>
                                                 </div>
                                          </div>
                                   </motion.div>
                            )}
                     </AnimatePresence>
              </header>
       )
}
