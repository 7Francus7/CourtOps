'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { usePerformance } from '@/contexts/PerformanceContext'
import { forwardRef, type ReactNode } from 'react'

type AnimatedDivProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  className?: string
  children?: ReactNode
}

export const AnimatedDiv = forwardRef<HTMLDivElement, AnimatedDivProps>(
  function AnimatedDiv({ children, className, ...motionProps }, ref) {
    const { shouldReduceAnimations } = usePerformance()

    if (shouldReduceAnimations) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      )
    }

    return (
      <motion.div ref={ref} className={className} {...motionProps}>
        {children as Parameters<typeof motion.div>[0]['children']}
      </motion.div>
    )
  }
)
