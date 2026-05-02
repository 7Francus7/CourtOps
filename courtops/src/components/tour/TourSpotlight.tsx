'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Check, Compass } from 'lucide-react'
import { useTourContext } from '@/contexts/TourContext'
import { cn } from '@/lib/utils'
import type { TourPosition } from '@/lib/tour/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ElementRect {
  x: number
  y: number
  width: number
  height: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function waitForElement(selector: string, maxMs = 3000): Promise<Element | null> {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    const el = document.querySelector(selector)
    if (el) return el
    await new Promise(r => setTimeout(r, 120))
  }
  return null
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

// ─── Tooltip positioning ──────────────────────────────────────────────────────

const TOOLTIP_W = 320
const TOOLTIP_H = 220 // approximate
const ARROW_SIZE = 8
const VIEWPORT_PADDING = 12

function computeTooltipStyle(
  rect: ElementRect,
  position: TourPosition,
  padding: number,
): React.CSSProperties {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const cx = rect.x + rect.width / 2
  const cy = rect.y + rect.height / 2

  let top = 0
  let left = 0

  switch (position) {
    case 'bottom':
      top = rect.y + rect.height + padding + ARROW_SIZE + 8
      left = clamp(cx - TOOLTIP_W / 2, VIEWPORT_PADDING, vw - TOOLTIP_W - VIEWPORT_PADDING)
      break
    case 'top':
      top = rect.y - padding - TOOLTIP_H - ARROW_SIZE - 8
      left = clamp(cx - TOOLTIP_W / 2, VIEWPORT_PADDING, vw - TOOLTIP_W - VIEWPORT_PADDING)
      break
    case 'right':
      top = clamp(cy - TOOLTIP_H / 2, VIEWPORT_PADDING, vh - TOOLTIP_H - VIEWPORT_PADDING)
      left = rect.x + rect.width + padding + ARROW_SIZE + 8
      break
    case 'left':
      top = clamp(cy - TOOLTIP_H / 2, VIEWPORT_PADDING, vh - TOOLTIP_H - VIEWPORT_PADDING)
      left = rect.x - padding - TOOLTIP_W - ARROW_SIZE - 8
      break
    default:
      // center
      top = vh / 2 - TOOLTIP_H / 2
      left = vw / 2 - TOOLTIP_W / 2
  }

  // Guard: if tooltip would go off-screen, flip
  if (position === 'bottom' && top + TOOLTIP_H > vh - VIEWPORT_PADDING) {
    top = rect.y - padding - TOOLTIP_H - ARROW_SIZE - 8
  }
  if (position === 'top' && top < VIEWPORT_PADDING) {
    top = rect.y + rect.height + padding + ARROW_SIZE + 8
  }
  if (position === 'right' && left + TOOLTIP_W > vw - VIEWPORT_PADDING) {
    left = rect.x - padding - TOOLTIP_W - ARROW_SIZE - 8
  }

  return { position: 'fixed', top, left, width: TOOLTIP_W }
}

// ─── Arrow indicator ──────────────────────────────────────────────────────────

function TooltipArrow({ position }: { position: TourPosition }) {
  if (position === 'center') return null
  const base = 'absolute w-0 h-0 border-transparent'
  const borderSize = `${ARROW_SIZE}px`

  const styles: Record<TourPosition, React.CSSProperties> = {
    top: {
      bottom: -ARROW_SIZE,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px 0 ${ARROW_SIZE}px`,
      borderTopColor: 'var(--card)',
    },
    bottom: {
      top: -ARROW_SIZE,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: `0 ${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px`,
      borderBottomColor: 'var(--card)',
    },
    right: {
      top: '50%',
      left: -ARROW_SIZE,
      transform: 'translateY(-50%)',
      borderWidth: `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`,
      borderRightColor: 'var(--card)',
    },
    left: {
      top: '50%',
      right: -ARROW_SIZE,
      transform: 'translateY(-50%)',
      borderWidth: `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`,
      borderLeftColor: 'var(--card)',
    },
    center: {},
  }

  return (
    <div
      className={cn(base, 'border-solid')}
      style={{ ...styles[position], position: 'absolute', width: 0, height: 0 }}
      aria-hidden
    />
  )
}

// ─── SVG Spotlight Overlay ────────────────────────────────────────────────────

function SpotlightOverlay({
  rect,
  padding,
  borderRadius,
  onClick,
}: {
  rect: ElementRect | null
  padding: number
  borderRadius: number
  onClick?: () => void
}) {
  const hole = rect
    ? {
        x: rect.x - padding,
        y: rect.y - padding,
        w: rect.width + padding * 2,
        h: rect.height + padding * 2,
        rx: borderRadius,
      }
    : null

  return (
    <motion.svg
      className="fixed inset-0 pointer-events-none"
      style={{ width: '100vw', height: '100vh', zIndex: 9998 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      aria-hidden
    >
      <defs>
        <mask id="tour-spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          {hole && (
            <motion.rect
              fill="black"
              initial={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }}
              animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              rx={hole.rx}
              ry={hole.rx}
            />
          )}
        </mask>
      </defs>

      {/* Dark overlay with hole */}
      <rect
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.72)"
        mask="url(#tour-spotlight-mask)"
        className="pointer-events-auto cursor-default"
        onClick={onClick}
      />

      {/* Glow ring around highlighted element */}
      {hole && (
        <motion.rect
          initial={{ x: hole.x - 2, y: hole.y - 2, width: hole.w + 4, height: hole.h + 4 }}
          animate={{ x: hole.x - 2, y: hole.y - 2, width: hole.w + 4, height: hole.h + 4 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          rx={hole.rx + 2}
          ry={hole.rx + 2}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          opacity="0.8"
          className="pointer-events-none"
        />
      )}
    </motion.svg>
  )
}

// ─── Main TourSpotlight Component ─────────────────────────────────────────────

export function TourSpotlight() {
  const {
    activeTour,
    currentStep,
    currentStepIndex,
    totalSteps,
    isRunning,
    nextStep,
    prevStep,
    stopTour,
    goToStep,
  } = useTourContext()

  const [targetRect, setTargetRect] = useState<ElementRect | null>(null)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const rafRef = useRef<number | null>(null)

  // ── Measure target element ────────────────────────────────────────────────

  const measureTarget = useCallback(async (selector: string | null | undefined, wait: boolean, scroll: boolean) => {
    if (!selector) {
      setTargetRect(null)
      return
    }

    setIsMeasuring(true)

    let el: Element | null = wait
      ? await waitForElement(selector)
      : document.querySelector(selector)

    if (!el) {
      setTargetRect(null)
      setIsMeasuring(false)
      return
    }

    if (scroll) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      await new Promise(r => setTimeout(r, 450))
      // Re-query after scroll
      el = document.querySelector(selector)
      if (!el) { setTargetRect(null); setIsMeasuring(false); return }
    }

    const rect = el.getBoundingClientRect()
    setTargetRect({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
    setIsMeasuring(false)
  }, [])

  // Update measurement when step changes
  useEffect(() => {
    if (!currentStep || !isRunning) {
      setTargetRect(null)
      return
    }
    measureTarget(
      currentStep.target,
      currentStep.waitForElement ?? false,
      currentStep.scrollIntoView ?? false,
    )
  }, [currentStep, isRunning, measureTarget])

  // Re-measure on resize / scroll (RAF-throttled)
  useEffect(() => {
    if (!currentStep?.target || !isRunning) return

    const update = () => {
      const el = document.querySelector(currentStep.target!)
      if (!el) return
      const rect = el.getBoundingClientRect()
      setTargetRect({ x: rect.x, y: rect.y, width: rect.width, height: rect.height })
    }

    const onEvent = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    window.addEventListener('resize', onEvent)
    window.addEventListener('scroll', onEvent, true)
    return () => {
      window.removeEventListener('resize', onEvent)
      window.removeEventListener('scroll', onEvent, true)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [currentStep, isRunning])

  // Keyboard navigation
  useEffect(() => {
    if (!isRunning) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { stopTour(); return }
      if (e.key === 'ArrowRight' || e.key === 'Enter') { nextStep(); return }
      if (e.key === 'ArrowLeft') { prevStep(); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isRunning, nextStep, prevStep, stopTour])

  // ── Derived values ────────────────────────────────────────────────────────

  if (!isRunning || !currentStep || !activeTour) return null

  const isCentered = !currentStep.target
  const isLast = currentStepIndex === totalSteps - 1
  const isFirst = currentStepIndex === 0
  const padding = currentStep.padding ?? 10
  const borderRadius = currentStep.borderRadius ?? 12
  const position: TourPosition = isCentered ? 'center' : (currentStep.position ?? 'bottom')

  const tooltipStyle = targetRect
    ? computeTooltipStyle(targetRect, position, padding)
    : isCentered
    ? {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: TOOLTIP_W,
      }
    : { position: 'fixed' as const, top: -9999, left: -9999, width: TOOLTIP_W }

  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  const stepLabel = isCentered
    ? isFirst ? 'Introducción' : isLast ? 'Final' : `Paso ${currentStepIndex} de ${totalSteps - 2}`
    : `Paso ${currentStepIndex} de ${totalSteps - 1}`

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0"
        style={{ zIndex: 9997 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Tour: ${activeTour.title} — ${currentStep.title}`}
      >
        {/* SVG Spotlight overlay */}
        <SpotlightOverlay
          rect={targetRect}
          padding={padding}
          borderRadius={borderRadius}
        />

        {/* Centered backdrop for non-targeted steps */}
        {isCentered && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
          />
        )}

        {/* ── Tooltip ── */}
        <motion.div
          key={currentStep.id}
          style={{ ...tooltipStyle, zIndex: 9999 }}
          initial={{ opacity: 0, y: position === 'bottom' ? -8 : position === 'top' ? 8 : 0, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="h-[3px] bg-border">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          </div>

          <div className="p-5 space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                  <Compass size={12} className="text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary truncate">
                  {activeTour.title}
                </span>
              </div>
              <button
                onClick={stopTour}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
                aria-label="Cerrar tour"
              >
                <X size={14} />
              </button>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-1.5"
              >
                <h3 className="text-base font-black text-foreground leading-tight">
                  {currentStep.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStep.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {activeTour.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToStep(i)}
                    aria-label={`Ir al paso ${i + 1}`}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                      i === currentStepIndex
                        ? 'w-4 bg-primary'
                        : 'w-1.5 bg-border hover:bg-muted-foreground/40',
                    )}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-1.5">
                {!isFirst && (
                  <button
                    onClick={prevStep}
                    className="h-8 w-8 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                    aria-label="Paso anterior"
                  >
                    <ChevronLeft size={15} />
                  </button>
                )}

                {/* Skip (only on non-last steps) */}
                {!isLast && (
                  <button
                    onClick={stopTour}
                    className="h-8 px-3 rounded-xl text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                  >
                    Saltar
                  </button>
                )}

                <button
                  onClick={nextStep}
                  className="h-8 px-4 bg-primary hover:brightness-110 text-primary-foreground rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-primary/20 cursor-pointer"
                >
                  {isLast ? (
                    <>
                      <span>Finalizar</span>
                      <Check size={12} strokeWidth={3} />
                    </>
                  ) : isFirst ? (
                    <>
                      <span>Comenzar</span>
                      <ChevronRight size={13} />
                    </>
                  ) : (
                    <>
                      <span>Siguiente</span>
                      <ChevronRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step counter text */}
            <p className="text-[10px] text-muted-foreground/50 text-center -mt-2">
              {stepLabel} · ESC para salir
            </p>
          </div>

          {/* Arrow for non-centered tooltips */}
          {!isMeasuring && targetRect && <TooltipArrow position={position} />}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  )
}
