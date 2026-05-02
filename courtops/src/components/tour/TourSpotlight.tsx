'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  X,
  CheckCheck,
  Lightbulb,
  Sparkles,
} from 'lucide-react'
import { useTourContext } from '@/contexts/TourContext'
import { cn } from '@/lib/utils'
import type { TourPosition } from '@/lib/tour/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOOLTIP_W  = 348
const TOOLTIP_H  = 260
const ARROW_SIZE = 9
const VP_PAD     = 16

// ─── Utilities ────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

async function waitForElement(selector: string, maxMs = 3000): Promise<Element | null> {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    const el = document.querySelector(selector)
    if (el) return el
    await new Promise(r => setTimeout(r, 120))
  }
  return null
}

function computeTooltipPos(
  rect: Rect,
  position: TourPosition,
  padding: number,
): { top: number; left: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const cx = rect.x + rect.width  / 2
  const cy = rect.y + rect.height / 2
  let top = 0, left = 0

  switch (position) {
    case 'bottom':
      top  = rect.y + rect.height + padding + ARROW_SIZE + 10
      left = clamp(cx - TOOLTIP_W / 2, VP_PAD, vw - TOOLTIP_W - VP_PAD)
      break
    case 'top':
      top  = rect.y - padding - TOOLTIP_H - ARROW_SIZE - 10
      left = clamp(cx - TOOLTIP_W / 2, VP_PAD, vw - TOOLTIP_W - VP_PAD)
      break
    case 'right':
      top  = clamp(cy - TOOLTIP_H / 2, VP_PAD, vh - TOOLTIP_H - VP_PAD)
      left = rect.x + rect.width + padding + ARROW_SIZE + 10
      break
    case 'left':
      top  = clamp(cy - TOOLTIP_H / 2, VP_PAD, vh - TOOLTIP_H - VP_PAD)
      left = rect.x - padding - TOOLTIP_W - ARROW_SIZE - 10
      break
    default:
      top  = vh / 2 - TOOLTIP_H / 2
      left = vw / 2 - TOOLTIP_W / 2
  }

  // Auto-flip if clipping
  if (position === 'bottom' && top + TOOLTIP_H > vh - VP_PAD)
    top = rect.y - padding - TOOLTIP_H - ARROW_SIZE - 10
  if (position === 'top' && top < VP_PAD)
    top = rect.y + rect.height + padding + ARROW_SIZE + 10
  if (position === 'right' && left + TOOLTIP_W > vw - VP_PAD)
    left = rect.x - padding - TOOLTIP_W - ARROW_SIZE - 10
  if (position === 'left' && left < VP_PAD)
    left = rect.x + rect.width + padding + ARROW_SIZE + 10

  return { top: Math.round(top), left: Math.round(left) }
}

// ─── Spotlight (box-shadow travels between elements) ──────────────────────────

function Spotlight({ rect, padding, borderRadius }: {
  rect: Rect | null
  padding: number
  borderRadius: number
}) {
  if (!rect) return null

  const hole = {
    x:  rect.x  - padding,
    y:  rect.y  - padding,
    w:  rect.width  + padding * 2,
    h:  rect.height + padding * 2,
    rx: borderRadius,
  }

  return (
    <>
      {/* Dark overlay — box-shadow creates the "hole" effect */}
      <motion.div
        className="fixed pointer-events-none"
        style={{ zIndex: 9998 }}
        initial={{ opacity: 0, left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderRadius: hole.rx }}
        animate={{
          opacity: 1,
          left:   hole.x,
          top:    hole.y,
          width:  hole.w,
          height: hole.h,
          borderRadius: hole.rx,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.78)',
        }}
        transition={{
          opacity:      { duration: 0.25 },
          left:         { type: 'spring', stiffness: 300, damping: 32 },
          top:          { type: 'spring', stiffness: 300, damping: 32 },
          width:        { type: 'spring', stiffness: 300, damping: 32 },
          height:       { type: 'spring', stiffness: 300, damping: 32 },
          borderRadius: { type: 'spring', stiffness: 300, damping: 32 },
        }}
      />

      {/* Primary glow ring — travels with the spotlight */}
      <motion.div
        className="fixed pointer-events-none"
        style={{ zIndex: 9999 }}
        animate={{
          left:         hole.x - 2,
          top:          hole.y - 2,
          width:        hole.w + 4,
          height:       hole.h + 4,
          borderRadius: hole.rx + 2,
          boxShadow:    '0 0 0 2px var(--primary), 0 0 20px 2px color-mix(in srgb, var(--primary) 30%, transparent)',
        }}
        transition={{
          left:         { type: 'spring', stiffness: 300, damping: 32 },
          top:          { type: 'spring', stiffness: 300, damping: 32 },
          width:        { type: 'spring', stiffness: 300, damping: 32 },
          height:       { type: 'spring', stiffness: 300, damping: 32 },
          borderRadius: { type: 'spring', stiffness: 300, damping: 32 },
        }}
      />

      {/* Pulsing beacon — corner indicator */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          zIndex: 10000,
          left:   hole.x + hole.w - 6,
          top:    hole.y - 6,
        }}
        animate={{
          left: hole.x + hole.w - 6,
          top:  hole.y - 6,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      >
        <motion.div
          className="w-3 h-3 rounded-full bg-primary"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
        />
      </motion.div>
    </>
  )
}

// ─── Tooltip Arrow ────────────────────────────────────────────────────────────

function Arrow({ position }: { position: TourPosition }) {
  if (position === 'center') return null
  const s = ARROW_SIZE
  const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0, borderStyle: 'solid', borderColor: 'transparent' }

  const map: Partial<Record<TourPosition, React.CSSProperties>> = {
    bottom: { bottom: -(s), left: '50%', transform: 'translateX(-50%)', borderWidth: `0 ${s}px ${s}px`, borderBottomColor: 'var(--card)' },
    top:    { top: -(s),    left: '50%', transform: 'translateX(-50%)', borderWidth: `${s}px ${s}px 0`, borderTopColor: 'var(--card)' },
    right:  { right: -(s),  top: '50%',  transform: 'translateY(-50%)', borderWidth: `${s}px 0 ${s}px ${s}px`, borderLeftColor: 'var(--card)' },
    left:   { left: -(s),   top: '50%',  transform: 'translateY(-50%)', borderWidth: `${s}px ${s}px ${s}px 0`, borderRightColor: 'var(--card)' },
  }

  const style = map[position]
  if (!style) return null
  return <div style={{ ...base, ...style }} aria-hidden />
}

// ─── Welcome / Finish Card (centered, no target) ──────────────────────────────

function CenteredCard({
  step,
  stepIndex,
  totalSteps,
  activeTourTitle,
  isFirst,
  isLast,
  onNext,
  onSkip,
  onPrev,
  onClose,
  onDotClick,
}: {
  step: ReturnType<typeof useTourContext>['currentStep']
  stepIndex: number
  totalSteps: number
  activeTourTitle: string
  isFirst: boolean
  isLast: boolean
  onNext: () => void
  onSkip: () => void
  onPrev: () => void
  onClose: () => void
  onDotClick: (i: number) => void
}) {
  if (!step) return null
  const Icon = step.icon ?? Sparkles

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={{    opacity: 0, scale: 0.95,  y: 16 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      style={{ position: 'fixed', zIndex: 10001, width: 388 }}
      className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      // inline style needed for centering via Framer + fixed
      // Use a wrapper div for actual centering
    >
      <div className="bg-card border border-border rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.55)] overflow-hidden">

        {/* ── Gradient header ── */}
        <div className="relative px-7 pt-7 pb-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/60">
          {/* Tour label */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <Sparkles size={10} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                {activeTourTitle}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Cerrar tour"
            >
              <X size={14} />
            </button>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]">
                <Icon size={34} className="text-primary" />
              </div>
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary/40"
                animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-foreground text-center leading-tight tracking-tight">
            {step.title}
          </h2>
        </div>

        {/* ── Body ── */}
        <div className="px-7 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            {step.description}
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="px-7 pb-7 space-y-4">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => onDotClick(i)}
                className={cn(
                  'rounded-full transition-all duration-300 cursor-pointer',
                  i === stepIndex
                    ? 'w-5 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-border hover:bg-muted-foreground/40',
                )}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="h-12 w-12 rounded-2xl border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <button
              onClick={isLast ? onClose : onNext}
              className="flex-1 h-12 bg-primary hover:brightness-110 text-primary-foreground rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-lg shadow-primary/25 cursor-pointer"
            >
              {isLast ? (
                <><CheckCheck size={16} /><span>¡Empezar a usar CourtOps!</span></>
              ) : isFirst ? (
                <><span>Comenzar el tour</span><ChevronRight size={16} /></>
              ) : (
                <><span>Continuar</span><ChevronRight size={16} /></>
              )}
            </button>
          </div>

          {!isLast && (
            <button
              onClick={onSkip}
              className="w-full text-center text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer py-1"
            >
              Saltar este tour
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Tooltip Card (with target spotlight) ─────────────────────────────────────

function TooltipCard({
  step,
  stepIndex,
  totalSteps,
  activeTourTitle,
  position,
  posStyle,
  isFirst,
  isLast,
  onNext,
  onPrev,
  onSkip,
  onClose,
  onDotClick,
}: {
  step: ReturnType<typeof useTourContext>['currentStep']
  stepIndex: number
  totalSteps: number
  activeTourTitle: string
  position: TourPosition
  posStyle: React.CSSProperties
  isFirst: boolean
  isLast: boolean
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  onClose: () => void
  onDotClick: (i: number) => void
}) {
  if (!step) return null
  const Icon    = step.icon
  const progress = ((stepIndex + 1) / totalSteps) * 100

  // Slide direction based on position
  const enterFrom = position === 'right' ? -12 : position === 'left' ? 12 : position === 'bottom' ? -8 : 8

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: enterFrom, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{    opacity: 0, y: -enterFrom * 0.5, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{ ...posStyle, position: 'fixed', width: TOOLTIP_W, zIndex: 10001 }}
      className="bg-card border border-border rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.50)] overflow-hidden"
    >
      {/* Progress bar */}
      <div className="h-[3px] bg-muted w-full">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="p-5 space-y-4">
        {/* ── Header row ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-primary" />
              </div>
            )}
            <div className="min-w-0">
              {step.category && (
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary leading-none mb-0.5">
                  {step.category}
                </p>
              )}
              <p className="text-[9px] font-semibold text-muted-foreground/50 leading-none truncate">
                {activeTourTitle} · {stepIndex} / {totalSteps - 1}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id + '-content'}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{    opacity: 0, x: -8 }}
            transition={{ duration: 0.16 }}
            className="space-y-3"
          >
            <h3 className="text-[15px] font-black text-foreground leading-snug">
              {step.title}
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {/* Pro tip */}
            {step.proTip && (
              <div className="flex gap-2.5 p-3 bg-amber-500/6 border border-amber-500/20 rounded-xl">
                <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-amber-200/80 leading-relaxed">
                  <span className="font-black text-amber-400">Pro tip: </span>
                  {step.proTip}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => onDotClick(i)}
                className={cn(
                  'rounded-full transition-all duration-300 cursor-pointer',
                  i === stepIndex
                    ? 'w-4 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-border hover:bg-primary/40',
                )}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1.5">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="h-8 w-8 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            {!isLast && (
              <button
                onClick={onSkip}
                className="h-8 px-3 rounded-xl text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                Saltar
              </button>
            )}
            <button
              onClick={onNext}
              className={cn(
                'h-8 px-4 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer',
                'bg-primary text-primary-foreground hover:brightness-110 shadow-md shadow-primary/20',
              )}
            >
              {isLast
                ? <><CheckCheck size={13} /><span>Listo</span></>
                : <><span>Siguiente</span><ChevronRight size={13} /></>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Arrow indicator */}
      <Arrow position={position} />
    </motion.div>
  )
}

// ─── Main TourSpotlight ────────────────────────────────────────────────────────

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

  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const rafRef = useRef<number | null>(null)

  // ── Measure target element ────────────────────────────────────────────────

  const measureTarget = useCallback(async (
    selector: string | null | undefined,
    wait: boolean,
    scroll: boolean,
  ) => {
    if (!selector) { setTargetRect(null); return }

    let el: Element | null = wait
      ? await waitForElement(selector)
      : document.querySelector(selector)

    if (!el) { setTargetRect(null); return }

    if (scroll) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      await new Promise(r => setTimeout(r, 450))
      el = document.querySelector(selector)
      if (!el) { setTargetRect(null); return }
    }

    const r = el.getBoundingClientRect()
    setTargetRect({ x: r.x, y: r.y, width: r.width, height: r.height })
  }, [])

  useEffect(() => {
    if (!currentStep || !isRunning) { setTargetRect(null); return }
    measureTarget(currentStep.target, currentStep.waitForElement ?? false, currentStep.scrollIntoView ?? false)
  }, [currentStep, isRunning, measureTarget])

  // Re-measure on resize/scroll
  useEffect(() => {
    if (!currentStep?.target || !isRunning) return
    const update = () => {
      const el = document.querySelector(currentStep.target!)
      if (!el) return
      const r = el.getBoundingClientRect()
      setTargetRect({ x: r.x, y: r.y, width: r.width, height: r.height })
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
      if (e.key === 'Escape')                              { stopTour(); return }
      if (e.key === 'ArrowRight' || e.key === 'Enter')    { nextStep(); return }
      if (e.key === 'ArrowLeft')                           { prevStep(); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isRunning, nextStep, prevStep, stopTour])

  if (!isRunning || !currentStep || !activeTour) return null

  const isCentered = !currentStep.target
  const isFirst    = currentStepIndex === 0
  const isLast     = currentStepIndex === totalSteps - 1
  const padding      = currentStep.padding      ?? 10
  const borderRadius = currentStep.borderRadius ?? 14
  const position: TourPosition = isCentered
    ? 'center'
    : (currentStep.position ?? 'bottom')

  const posStyle: React.CSSProperties = targetRect
    ? computeTooltipPos(targetRect, position, padding)
    : { top: -9999, left: -9999 }

  const sharedProps = {
    step:             currentStep,
    stepIndex:        currentStepIndex,
    totalSteps,
    activeTourTitle:  activeTour.title,
    isFirst,
    isLast,
    onNext:     nextStep,
    onPrev:     prevStep,
    onSkip:     stopTour,
    onClose:    stopTour,
    onDotClick: goToStep,
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tour: ${activeTour.title} — ${currentStep.title}`}
      style={{ position: 'fixed', inset: 0, zIndex: 9997, pointerEvents: 'none' }}
    >
      {/* ── Click blocker (non-centered steps) ── */}
      {!isCentered && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 9997, pointerEvents: 'auto' }}
          aria-hidden
        />
      )}

      {/* ── Centered backdrop ── */}
      {isCentered && (
        <motion.div
          className="fixed inset-0 bg-black/72 backdrop-blur-sm"
          style={{ zIndex: 9997, pointerEvents: 'auto' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden
        />
      )}

      {/* ── Spotlight (only when there's a target) ── */}
      {!isCentered && (
        <Spotlight
          rect={targetRect}
          padding={padding}
          borderRadius={borderRadius}
        />
      )}

      {/* ── Card ── */}
      <AnimatePresence mode="wait">
        {isCentered ? (
          <div
            key="centered"
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              pointerEvents: 'none',
            }}
          >
            <div style={{ pointerEvents: 'auto' }}>
              <CenteredCard {...sharedProps} />
            </div>
          </div>
        ) : (
          <div style={{ pointerEvents: 'auto' }}>
            <TooltipCard
              key={currentStep.id}
              {...sharedProps}
              position={position}
              posStyle={posStyle}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── ESC hint (bottom center) ── */}
      {!isCentered && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/60 border border-white/10 rounded-full backdrop-blur-sm pointer-events-none"
          style={{ zIndex: 10001 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <kbd className="text-[9px] font-black text-white/50 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">ESC</kbd>
          <span className="text-[10px] text-white/40">salir</span>
          <span className="text-white/20 mx-1">·</span>
          <kbd className="text-[9px] font-black text-white/50 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">→</kbd>
          <span className="text-[10px] text-white/40">siguiente</span>
        </motion.div>
      )}
    </div>,
    document.body,
  )
}
