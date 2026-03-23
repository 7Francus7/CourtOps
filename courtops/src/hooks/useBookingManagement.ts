import { useState, useCallback, useEffect } from 'react'
import { t } from '@/lib/toast'
import {
       getBookingDetails,
       addBookingItemWithPlayer,
       removeBookingItem,
       cancelBooking,
       cancelRecurringBooking,
       uncancelBooking,
} from '@/actions/manageBooking'
import { getProducts } from '@/actions/manageBooking'

// Server actions return dynamic Prisma data with varying shapes.
// We use 'any' at this boundary to avoid cascading Record<string, unknown>
// errors in all consuming components. The actual shape is BookingWithDetails.
/* eslint-disable @typescript-eslint/no-explicit-any */

export function useBookingManagement(bookingId: number | undefined, initialBooking: any) {
       const [booking, setBooking] = useState<any>(initialBooking || null)
       const [loading, setLoading] = useState(false)
       const [error, setError] = useState<string | null>(null)
       const [products, setProducts] = useState<any[]>([])

       const refreshBooking = useCallback(async () => {
              if (!bookingId) return
              setLoading(true)
              try {
                     const res = await getBookingDetails(bookingId)
                     const data = res as any
                     if (data.success) {
                            if (data.data) {
                                   setBooking(data.data)
                            } else if (data.booking) {
                                   setBooking(data.booking)
                            }
                     }
              } catch (e) {
                     console.error(e)
                     setError(e instanceof Error ? e.message : 'Error al cargar reserva')
              } finally {
                     setLoading(false)
              }
       }, [bookingId])

       useEffect(() => {
              if (bookingId) {
                     refreshBooking()
              }
       }, [bookingId, refreshBooking])

       // Load products
       useEffect(() => {
              getProducts().then((res: any) => {
                     if (res.success && Array.isArray(res.data)) {
                            setProducts(res.data)
                     }
              })
       }, [])

       const handleCancel = async () => {
              if (!bookingId) return false
              const res = await cancelBooking(bookingId)
              if (res.success) {
                     t.booking.cancelled(async () => {
                            const undo = await uncancelBooking(bookingId)
                            if (undo.success) {
                                   t.booking.restored()
                            } else {
                                   t.fail('No se pudo restaurar', undo.error)
                            }
                     })
                     return true
              } else {
                     t.fail('Error al cancelar', 'No se pudo cancelar la reserva')
                     return false
              }
       }

       const handleAddItem = async (productId: number, quantity: number, playerName?: string) => {
              if (!bookingId) return
              const res = await addBookingItemWithPlayer(bookingId, productId, quantity, playerName)
              if (res.success) {
                     const productName = products.find((p: any) => p.id === productId)?.name ?? 'Producto'
                     t.booking.itemAdded(productName)
                     refreshBooking()
                     return true
              } else {
                     t.fail('Error al agregar item', 'No se pudo agregar el producto')
                     return false
              }
       }

       const handleRemoveItem = async (itemId: number) => {
              const res = await removeBookingItem(itemId)
              if (res.success) {
                     t.booking.itemRemoved()
                     refreshBooking()
                     return true
              } else {
                     t.fail('Error eliminando item')
                     return false
              }
       }

       const handleCancelSeries = async () => {
              if (!bookingId) return false
              const res = await cancelRecurringBooking(bookingId)
              if (res.success) {
                     t.booking.seriesCancelled(res.count ?? 0)
                     return true
              } else {
                     t.fail('Error al cancelar serie', res.error)
                     return false
              }
       }

       return {
              booking,
              products,
              loading,
              error,
              refreshBooking,
              actions: {
                     cancel: handleCancel,
                     cancelSeries: handleCancelSeries,
                     addItem: handleAddItem,
                     removeItem: handleRemoveItem
              }
       }
}
