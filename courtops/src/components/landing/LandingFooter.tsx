'use client'

import React from 'react'
import Link from 'next/link'
import { CourtOpsLogoFull } from '@/components/ui/CourtOpsLogo'

const links = {
  Producto: [
    { label: 'Funciones', href: '#features' },
    { label: 'Precios', href: '#pricing' },
    { label: 'API', href: '#' },
  ],
  Empresa: [
    { label: 'Empleo', href: '#' },
    { label: 'Press Kit', href: '#' },
    { label: 'Contacto', href: '#' },
  ],
  Legal: [
    { label: 'Política de Privacidad', href: '/legal/privacy' },
    { label: 'Términos de Servicio', href: '/legal/terms' },
  ],
}

export default function LandingFooter() {
  return (
    <footer style={{ background: 'var(--co-dark-section)' }} className="py-16 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="flex flex-col md:flex-row justify-between border-t pt-16"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >

          {/* Marca */}
          <div className="mb-12 md:mb-0">
            <div className="mb-6">
              <CourtOpsLogoFull className="h-8 w-auto" darkBg />
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'rgba(249,249,255,0.5)' }}
            >
              © {new Date().getFullYear()} CourtOps. Precisión total en la gestión de clubes.
              Plataforma líder para centros deportivos de alto rendimiento.
            </p>
          </div>

          {/* Columnas de links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {Object.entries(links).map(([seccion, items]) => (
              <div key={seccion}>
                <h5
                  className="font-bold mb-6 text-sm"
                  style={{ color: '#f9f9ff' }}
                >
                  {seccion}
                </h5>
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm transition-colors hover:underline underline-offset-4"
                        style={{ color: 'rgba(249,249,255,0.5)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--co-green)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(249,249,255,0.5)' }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
