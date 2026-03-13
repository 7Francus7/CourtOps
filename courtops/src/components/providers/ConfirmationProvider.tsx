'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmationContext = createContext<ConfirmFn>(async () => false)

export const useConfirmation = () => useContext(ConfirmationContext)

export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmOptions & { open: boolean }>({
    open: false,
    title: '',
  })

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setState({ ...options, open: true })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true)
    resolveRef.current = null
    setState((s) => ({ ...s, open: false }))
  }, [])

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false)
    resolveRef.current = null
    setState((s) => ({ ...s, open: false }))
  }, [])

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      <ConfirmationDialog
        open={state.open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={state.title}
        description={state.description}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        variant={state.variant}
      />
    </ConfirmationContext.Provider>
  )
}
