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
                            scrolled ? "bg-background/80 backdrop-blur-xl border-white/5 py-3 shadow-sm" : "bg-transparent py-5"
                     )}
              >
                     <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2 group">
                                   <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                                          C
                                   </div>
                                   <span className="text-xl font-bold tracking-tight text-foreground">
                                          Court<span className="text-emerald-500">Ops</span>
                                   </span>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center gap-8">
                                   <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                          Características
                                   </Link>
                                   <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                          Precios
                                   </Link>
                                   <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                          FAQ
                                   </Link>
                            </nav>

                            {/* Actions */}
                            <div className="hidden md:flex items-center gap-4">
                                   <ThemeToggle />

                                   <div className="h-4 w-[1px] bg-border/50" />

                                   <Link href="/login" className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors">
                                          Iniciar Sesión
                                   </Link>
                                   <Link href="/register" className="relative group">
                                          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-200" />
                                          <button className="relative px-5 py-2 bg-foreground text-background rounded-lg text-sm font-bold hover:bg-foreground/90 transition-colors">
                                                 Comenzar Ahora
                                          </button>
                                   </Link>
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                   className="md:hidden text-foreground p-2"
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
                                   className="absolute top-full left-0 right-0 bg-background border-b border-border p-6 md:hidden shadow-xl flex flex-col gap-4"
                            >
                                   <Link href="#features" className="text-base font-medium py-2 border-b border-border/50">Características</Link>
                                   <Link href="#pricing" className="text-base font-medium py-2 border-b border-border/50">Precios</Link>
                                   <div className="flex flex-col gap-3 mt-2">
                                          <Link href="/login" className="w-full text-center py-2.5 rounded-xl border border-border font-semibold">
                                                 Iniciar Sesión
                                          </Link>
                                          <Link href="/register" className="w-full text-center py-2.5 rounded-xl bg-primary text-primary-foreground font-bold">
                                                 Comenzar Gratis
                                          </Link>
                                   </div>
                            </motion.div>
                     )}
              </header>
       )
}
