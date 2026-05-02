'use client'

import React from 'react'
import { PlayCircle, Compass, CalendarDays, Users, Store, BarChart3 } from 'lucide-react'
import { useTour } from '@/hooks/useTour'
import { cn } from '@/lib/utils'

const TOUR_META: Record<string, { label: string; description: string; icon: React.ElementType; color: string }> = {
  general:  { label: 'Tour General',       description: 'Visión completa del sistema (8 pasos)',   icon: Compass,      color: 'text-primary'       },
  reservas: { label: 'Tour de Reservas',   description: 'Cómo crear y gestionar turnos (5 pasos)', icon: CalendarDays, color: 'text-blue-500'      },
  clientes: { label: 'Tour de Clientes',   description: 'Gestión de tu base de jugadores (5 pasos)', icon: Users,      color: 'text-emerald-500'   },
  kiosco:   { label: 'Tour de Kiosco',     description: 'Punto de venta y caja diaria (5 pasos)',   icon: Store,       color: 'text-purple-500'    },
  reportes: { label: 'Tour de Reportes',   description: 'Analytics y exportaciones (5 pasos)',      icon: BarChart3,   color: 'text-amber-500'     },
}

interface TourLauncherProps {
  /** Show all available tours as a list */
  variant?: 'list' | 'button'
  /** For variant="button" — which tour to launch */
  tourId?: string
  className?: string
  onLaunch?: () => void
}

/**
 * Renders a styled button or list of tour launchers.
 *
 * Usage (single button):
 * <TourLauncher variant="button" tourId="general" />
 *
 * Usage (full list in HelpSheet):
 * <TourLauncher variant="list" onLaunch={onClose} />
 */
export function TourLauncher({ variant = 'list', tourId, className, onLaunch }: TourLauncherProps) {
  const { startTour, resetAndStartTour, hasCompletedTour } = useTour()

  if (variant === 'button' && tourId) {
    const meta = TOUR_META[tourId]
    if (!meta) return null
    const Icon = meta.icon

    return (
      <button
        onClick={() => {
          onLaunch?.()
          startTour(tourId)
        }}
        className={cn(
          'flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all text-left cursor-pointer active:scale-95',
          className,
        )}
      >
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 shrink-0">
          <Icon size={17} />
        </div>
        <div>
          <p className="text-sm font-black text-foreground">{meta.label}</p>
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Iniciar tour</p>
        </div>
        <PlayCircle size={16} className="text-primary ml-auto shrink-0" />
      </button>
    )
  }

  // List variant — all tours
  return (
    <div className={cn('space-y-2', className)}>
      {Object.entries(TOUR_META).map(([id, meta]) => {
        const Icon = meta.icon
        const completed = hasCompletedTour(id)

        return (
          <button
            key={id}
            onClick={() => {
              onLaunch?.()
              resetAndStartTour(id)
            }}
            className="w-full group flex items-center gap-3 p-4 bg-card border border-white/5 rounded-2xl hover:border-primary/20 hover:bg-card/80 transition-all text-left cursor-pointer active:scale-[0.98]"
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 shadow-inner shrink-0',
              meta.color,
            )}>
              <Icon size={19} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                  {meta.label}
                </p>
                {completed && (
                  <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md shrink-0">
                    Visto
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 truncate">{meta.description}</p>
            </div>
            <PlayCircle size={16} className="text-zinc-600 group-hover:text-primary transition-colors shrink-0" />
          </button>
        )
      })}
    </div>
  )
}
