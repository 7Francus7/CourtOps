'use client'

import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-out',
          error ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="text-xs text-red-500 font-medium ml-1">{error}</p>
      </div>
    </div>
  )
}
