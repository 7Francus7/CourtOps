'use client'

import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { TOURS } from '@/lib/tour/tours'
import type { TourDefinition, TourStep } from '@/lib/tour/types'

interface TourContextValue {
  /** Currently active tour definition, or null if no tour is running */
  activeTour: TourDefinition | null
  /** Index of the current step within the active tour */
  currentStepIndex: number
  /** Current step object */
  currentStep: TourStep | null
  /** Total steps in the active tour */
  totalSteps: number
  /** Whether a tour is currently running */
  isRunning: boolean

  startTour: (tourId: string) => void
  stopTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  // Track step change direction for animation
  const directionRef = useRef<1 | -1>(1)

  const activeTour = activeTourId ? (TOURS[activeTourId] ?? null) : null
  const currentStep = activeTour?.steps[currentStepIndex] ?? null
  const totalSteps = activeTour?.steps.length ?? 0

  const startTour = useCallback((tourId: string) => {
    if (!TOURS[tourId]) {
      console.warn(`[TourContext] Tour "${tourId}" not found in registry.`)
      return
    }
    directionRef.current = 1
    setCurrentStepIndex(0)
    setActiveTourId(tourId)
  }, [])

  const stopTour = useCallback(() => {
    setActiveTourId(null)
    setCurrentStepIndex(0)
  }, [])

  const nextStep = useCallback(() => {
    if (!activeTour) return
    directionRef.current = 1
    if (currentStepIndex < activeTour.steps.length - 1) {
      setCurrentStepIndex(i => i + 1)
    } else {
      // Mark tour as completed in localStorage
      try { localStorage.setItem(activeTour.localStorageKey, 'true') } catch {}
      setActiveTourId(null)
      setCurrentStepIndex(0)
    }
  }, [activeTour, currentStepIndex])

  const prevStep = useCallback(() => {
    directionRef.current = -1
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1)
    }
  }, [currentStepIndex])

  const goToStep = useCallback((index: number) => {
    if (!activeTour) return
    if (index >= 0 && index < activeTour.steps.length) {
      directionRef.current = index > currentStepIndex ? 1 : -1
      setCurrentStepIndex(index)
    }
  }, [activeTour, currentStepIndex])

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStepIndex,
        currentStep,
        totalSteps,
        isRunning: !!activeTour,
        startTour,
        stopTour,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTourContext() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTourContext must be used inside <TourProvider>')
  return ctx
}
