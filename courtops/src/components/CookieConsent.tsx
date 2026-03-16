'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('courtops_cookies_accepted')
    if (!accepted) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500)
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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[100]"
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/10 dark:shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie size={20} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Usamos cookies</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Utilizamos cookies para mejorar tu experiencia, recordar tus preferencias y analizar el uso del sitio.{' '}
                  <Link href="/legal/privacy" className="text-primary hover:underline font-medium">
                    Política de Privacidad
                  </Link>
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={accept}
                    className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold hover:scale-105 active:scale-95 transition-transform"
                  >
                    Aceptar todo
                  </button>
                  <button
                    onClick={reject}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    Solo esenciales
                  </button>
                </div>
              </div>
              <button onClick={reject} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
