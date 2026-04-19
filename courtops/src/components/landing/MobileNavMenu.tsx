'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '#stats', label: 'Velocidad' },
  { href: '#cimiento', label: 'Táctica' },
  { href: '#inteligencia', label: 'Inteligencia' },
  { href: '#pricing', label: 'Planes' },
]

export default function MobileNavMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Menú"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50 shadow-xl z-50 px-6 py-4 flex flex-col gap-2">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-1 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-center py-3 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 font-bold text-sm text-zinc-700 dark:text-zinc-200 hover:border-green-600 dark:hover:border-[#72ff70] transition-colors"
            >
              Acceso
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="text-center py-3 rounded-xl font-bold text-sm text-white bg-green-600 dark:bg-[#72ff70] dark:text-[#006012] hover:bg-green-700 transition-colors"
            >
              Comenzar
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
