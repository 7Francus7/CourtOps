"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface AnimatedCounterProps {
  value: string
  className?: string
}

function parseValue(raw: string): { prefix: string; num: number; suffix: string } {
  const match = raw.match(/^([^0-9]*)([0-9]+(?:[.,][0-9]+)?)(.*)$/)
  if (!match) return { prefix: "", num: 0, suffix: raw }
  return {
    prefix: match[1],
    num: parseFloat(match[2].replace(",", ".")),
    suffix: match[3],
  }
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const [display, setDisplay] = useState(value)
  const { prefix, num, suffix } = parseValue(value)
  const isNumeric = !isNaN(num) && value !== suffix

  useEffect(() => {
    if (!isInView || !isNumeric) return
    const duration = 1400
    const start = performance.now()
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * num)
      setDisplay(`${prefix}${current}${suffix}`)
      if (progress < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [isInView, isNumeric, num, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
