"use client"

import { motion, Variants } from "framer-motion"
import { ReactNode } from "react"

type Direction = "up" | "down" | "left" | "right" | "none"

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: Direction
  distance?: number
  className?: string
  once?: boolean
}

function getVariants(direction: Direction, distance: number): Variants {
  const offsets: Record<Direction, { x: number; y: number }> = {
    up:    { x: 0,         y: distance  },
    down:  { x: 0,         y: -distance },
    left:  { x: distance,  y: 0         },
    right: { x: -distance, y: 0         },
    none:  { x: 0,         y: 0         },
  }
  const { x, y } = offsets[direction]
  return {
    hidden: { opacity: 0, x, y },
    visible: { opacity: 1, x: 0, y: 0 },
  }
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.55,
  direction = "up",
  distance = 32,
  className,
  once = true,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      variants={getVariants(direction, distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerProps {
  children: ReactNode
  delay?: number
  stagger?: number
  direction?: Direction
  distance?: number
  className?: string
}

export function StaggerReveal({
  children,
  delay = 0,
  stagger = 0.08,
  direction = "up",
  distance = 28,
  className,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              variants={getVariants(direction, distance)}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}
