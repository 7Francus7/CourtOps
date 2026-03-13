'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  caja: 'Caja',
  configuracion: 'Configuración',
  reportes: 'Reportes',
  auditoria: 'Auditoría',
  torneos: 'Torneos',
  reservas: 'Reservas',
  suscripcion: 'Suscripción',
  nuevo: 'Nuevo',
}

export function Breadcrumbs() {
  const pathname = usePathname()

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter(s => s !== '(protected)')

  if (segments.length <= 1) return null

  const crumbs = segments.map((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const isLast = i === segments.length - 1
    const isId = /^\d+$/.test(segment) || /^[a-z0-9]{20,}$/i.test(segment)
    const label = isId ? `#${segment.slice(0, 6)}...` : (ROUTE_LABELS[segment] || segment)

    return { href, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 overflow-x-auto no-scrollbar">
      <Link href="/dashboard" className="hover:text-foreground transition-colors shrink-0">
        <Home size={14} />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5 shrink-0">
          <ChevronRight size={12} className="opacity-40" />
          {crumb.isLast ? (
            <span className="font-bold text-foreground truncate max-w-[120px]">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[120px]">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
