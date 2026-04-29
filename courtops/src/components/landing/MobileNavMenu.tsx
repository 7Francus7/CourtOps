'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '#experiencia', label: 'Experiencia' },
  { href: '#operacion', label: 'Operación' },
  { href: '#impacto', label: 'Impacto' },
  { href: '#planes', label: 'Planes' },
]

export default function MobileNavMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-950/5 dark:text-zinc-200 dark:hover:bg-white/10 md:hidden"
        aria-label="Menú"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 flex flex-col gap-2 border-b border-zinc-950/10 bg-white/95 px-6 py-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#07090b]/95 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-950/5 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-1 grid grid-cols-2 gap-3 border-t border-zinc-950/10 pt-3 dark:border-white/10">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-zinc-950/15 py-3 text-center text-sm font-bold text-zinc-700 transition-colors hover:border-emerald-500 dark:border-white/15 dark:text-zinc-200 dark:hover:border-emerald-300"
            >
              Acceso
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-emerald-300 py-3 text-center text-sm font-black text-emerald-950 transition-colors hover:bg-emerald-200"
            >
              Comenzar
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
