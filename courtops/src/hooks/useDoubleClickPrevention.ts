'use client'

import { useState, useCallback, useRef } from 'react'

/**
 * Hook to prevent double-click on async actions.
 * Returns [isProcessing, wrappedHandler] where wrappedHandler
 * ignores calls while a previous invocation is still running.
 */
export function useDoubleClickPrevention<T extends (...args: unknown[]) => Promise<unknown>>(
  handler: T
): [boolean, (...args: Parameters<T>) => Promise<void>] {
  const [isProcessing, setIsProcessing] = useState(false)
  const lockRef = useRef(false)

  const wrappedHandler = useCallback(async (...args: Parameters<T>) => {
    if (lockRef.current) return
    lockRef.current = true
    setIsProcessing(true)
    try {
      await handler(...args)
    } finally {
      lockRef.current = false
      setIsProcessing(false)
    }
  }, [handler]) as (...args: Parameters<T>) => Promise<void>

  return [isProcessing, wrappedHandler]
}
