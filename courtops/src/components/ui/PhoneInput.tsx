'use client'

import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  /** Classes para el wrapper externo (borde, fondo, radius) */
  className?: string
  onBlur?: () => void
  id?: string
}

/**
 * Input de teléfono argentino con prefijo +54 9 fijo.
 * `value` y `onChange` trabajan con los dígitos locales (sin prefijo).
 */
export function PhoneInput({
  value,
  onChange,
  placeholder = '351 123 4567',
  required,
  className,
  onBlur,
  id,
}: Props) {
  return (
    <div className={cn('flex items-center overflow-hidden', className)}>
      <span className="shrink-0 select-none pl-3 pr-1.5 text-sm font-semibold text-current opacity-50 whitespace-nowrap">
        +54 9
      </span>
      <span className="shrink-0 opacity-20 text-current text-sm mr-2">|</span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        required={required}
        value={value}
        placeholder={placeholder}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 12))}
        className="min-w-0 flex-1 bg-transparent pr-3 py-0 text-sm font-medium placeholder:opacity-30 outline-none border-none focus:ring-0"
      />
    </div>
  )
}
