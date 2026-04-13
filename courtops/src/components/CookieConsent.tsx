'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('courtops_cookies_accepted')
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1800)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('courtops_cookies_accepted', 'true')
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem('courtops_cookies_accepted', 'essential')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:bottom-6 md:max-w-[380px] z-[100]"
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'color-mix(in srgb, var(--co-dark-section, #050c1a) 96%, transparent)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(114,255,112,0.05)',
            }}
          >
            {/* Green top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #72ff70 40%, transparent)' }}
            />

            <div className="p-5 pt-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {/* Cookie SVG icon in brand style */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(114,255,112,0.08)', border: '1px solid rgba(114,255,112,0.15)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#72ff70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                      <path d="M8.5 8.5v.01"/>
                      <path d="M16 15.5v.01"/>
                      <path d="M12 12v.01"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white">Cookies & Privacidad</h3>
                </div>
                <button
                  onClick={reject}
                  className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors shrink-0 cursor-pointer mt-0.5"
                  aria-label="Cerrar"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio.{' '}
                <Link
                  href="/legal/privacy"
                  className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Leer política
                </Link>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={accept}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  style={{
                    background: '#72ff70',
                    color: '#003d00',
                    boxShadow: '0 4px 16px rgba(114,255,112,0.2)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Aceptar todo
                </button>
                <button
                  onClick={reject}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  Solo esenciales
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
