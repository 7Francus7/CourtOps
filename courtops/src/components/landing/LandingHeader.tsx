'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const NAV_LINKS = [
  { href: '#features', label: 'Funciones', active: true },
  { href: '#how-it-works', label: 'Cómo Funciona' },
  { href: '#pricing', label: 'Precios' },
  { href: '#faq', label: 'Preguntas' },
]

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl ${scrolled ? 'shadow-sm' : ''}`}
      style={{ background: 'color-mix(in srgb, var(--co-bg) 75%, transparent)' }}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-8 h-20">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-black tracking-tighter select-none"
          style={{ color: 'var(--co-navy)' }}
        >
          CourtOps
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-tight transition-colors duration-200"
              style={link.active
                ? {
                  color: 'var(--co-green)',
                  fontWeight: 700,
                  borderBottom: '2px solid var(--co-green)',
                  paddingBottom: '4px',
                }
                : {
                  color: 'var(--co-navy)',
                  fontWeight: 500,
                  opacity: 0.65,
                }
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {mounted && <ThemeToggle />}
          <Link
            href="/login"
            className="text-sm font-medium transition-opacity hover:opacity-100"
            style={{ color: 'var(--co-navy)', opacity: 0.65 }}
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-full text-sm font-bold text-white hover:scale-95 active:scale-90 transition-transform"
            style={{ background: 'var(--co-green)' }}
          >
            Comenzar
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && <ThemeToggle />}
          <button
            className="p-2 rounded-lg"
            style={{ color: 'var(--co-navy)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute top-full left-0 right-0 p-6 flex flex-col gap-3 md:hidden shadow-lg border-b backdrop-blur-xl"
            style={{
              background: 'color-mix(in srgb, var(--co-bg) 95%, transparent)',
              borderColor: 'var(--co-border)',
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold border"
                style={{ color: 'var(--co-navy)', borderColor: 'var(--co-border)' }}
              >
                {link.label}
                <ChevronRight size={16} style={{ color: 'var(--co-muted)' }} />
              </Link>
            ))}
            <div className="pt-3 border-t grid grid-cols-2 gap-3" style={{ borderColor: 'var(--co-border)' }}>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3.5 rounded-2xl border font-bold text-sm"
                style={{ borderColor: 'var(--co-navy)', color: 'var(--co-navy)' }}
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3.5 rounded-2xl font-bold text-sm text-white"
                style={{ background: 'var(--co-green)' }}
              >
                Comenzar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
