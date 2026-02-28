import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProductForm } from '@/hooks/useProductForm'
import { toast } from 'sonner'

// Mock sonner toast
vi.mock('sonner', () => ({
       toast: {
              success: vi.fn(),
              error: vi.fn(),
       },
}))

// Mock fetch
global.fetch = vi.fn()

describe('useProductForm', () => {
       const mockOnSave = vi.fn()
       const mockOnClose = vi.fn()

       beforeEach(() => {
              vi.clearAllMocks()
       })

       it('should initialize with default data', () => {
              const { result } = renderHook(() => useProductForm({ onSave: mockOnSave, isOpen: true }))

              expect(result.current.formData.name).toBe('')
              expect(result.current.formData.category).toBe('Bebidas')
              expect(result.current.isSearchingImage).toBe(false)
       })

       it('should update form data', () => {
              const { result } = renderHook(() => useProductForm({ onSave: mockOnSave, isOpen: true }))

              act(() => {
                     result.current.setFormData((prev: any) => ({ ...prev, name: 'Test Product' }))
              })

              expect(result.current.formData.name).toBe('Test Product')
       })

       it('should handle image search failure', async () => {
              const { result } = renderHook(() => useProductForm({ onSave: mockOnSave, isOpen: true }))

              act(() => {
                     result.current.setFormData((prev: any) => ({ ...prev, name: '' }))
              })

              await act(async () => {
                     await result.current.searchImages()
              })

              expect(toast.error).toHaveBeenCalledWith('Escribe el nombre del producto primero')
       })

       it('should call onSave when handleSubmit is called', async () => {
              const { result } = renderHook(() => useProductForm({ onSave: mockOnSave, isOpen: true }))

              act(() => {
                     result.current.setFormData((prev: any) => ({ ...prev, name: 'Cola' }))
              })

              await act(async () => {
                     await result.current.handleSubmit()
              })

              expect(mockOnSave).toHaveBeenCalled()
       })
})
