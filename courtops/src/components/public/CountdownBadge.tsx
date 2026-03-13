'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountdownBadgeProps {
  targetDate: string | Date
  expiredLabel?: string
}

export function CountdownBadge({ targetDate, expiredLabel = 'Inscripciones cerradas' }: CountdownBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; expired: boolean }>({
    days: 0, hours: 0, minutes: 0, expired: false,
  })

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, expired: true })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        expired: false,
      })
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (timeLeft.expired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
        <Clock size={12} />
        {expiredLabel}
      </span>
    )
  }

  const isUrgent = timeLeft.days === 0
  const isWarning = timeLeft.days <= 3 && !isUrgent

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
      isUrgent && 'bg-red-500/10 text-red-500 border-red-500/20',
      isWarning && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      !isUrgent && !isWarning && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    )}>
      <Clock size={12} />
      {isUrgent && '¡Últimas horas! '}
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours}h {timeLeft.minutes}m
    </span>
  )
}
