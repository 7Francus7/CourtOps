'use client'

import { useCallback } from 'react'
import { useTourContext } from '@/contexts/TourContext'
import { TOURS } from '@/lib/tour/tours'

/**
 * Convenience hook for triggering and controlling tours from any component.
 *
 * Usage:
 * ```tsx
 * const { startTour, stopTour, isRunning } = useTour()
 * startTour('general')      // launch the general tour
 * startTour('reservas')     // launch the bookings tour
 * stopTour()                // close the active tour
 * ```
 *
 * Available tour IDs: 'general' | 'reservas' | 'clientes' | 'kiosco' | 'reportes'
 *
 * To reset completion state (force re-show):
 * ```ts
 * localStorage.removeItem('courtops_tour_general_v1')
 * startTour('general')
 * ```
 */
export function useTour() {
  const ctx = useTourContext()

  const hasCompletedTour = useCallback((tourId: string): boolean => {
    const tour = TOURS[tourId]
    if (!tour) return false
    try {
      return localStorage.getItem(tour.localStorageKey) === 'true'
    } catch {
      return false
    }
  }, [])

  const resetTour = useCallback((tourId: string) => {
    const tour = TOURS[tourId]
    if (!tour) return
    try {
      localStorage.removeItem(tour.localStorageKey)
    } catch {}
  }, [])

  const resetAndStartTour = useCallback((tourId: string) => {
    resetTour(tourId)
    ctx.startTour(tourId)
  }, [ctx, resetTour])

  return {
    ...ctx,
    hasCompletedTour,
    resetTour,
    resetAndStartTour,
  }
}
