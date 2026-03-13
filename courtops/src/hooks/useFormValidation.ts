'use client'

import { useState, useCallback } from 'react'

type ValidationRules = Record<string, (value: string) => string | null>

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback((field: string, value: string): boolean => {
    const rule = rules[field]
    if (!rule) return true
    const error = rule(value)
    setErrors(prev => {
      if (error) return { ...prev, [field]: error }
      const next = { ...prev }
      delete next[field]
      return next
    })
    return !error
  }, [rules])

  const validateAll = useCallback((values: Record<string, string>): boolean => {
    const newErrors: Record<string, string> = {}
    for (const [field, rule] of Object.entries(rules)) {
      const error = rule(values[field] || '')
      if (error) newErrors[field] = error
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [rules])

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  return { errors, validate, validateAll, clearError }
}
