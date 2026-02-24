import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
       getBookingDetails,
       addBookingItemWithPlayer,
       removeBookingItem,
       cancelBooking,
       cancelRecurringBooking,
       payBooking,
       manageSplitPlayers
} from '@/actions/manageBooking'
import { getProducts } from '@/actions/manageBooking'

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
                     // Use 'as any' to bypass the loose type definition of getBookingDetails returning a plain object
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
                     toast.success('Reserva cancelada')
                     return true
              } else {
                     toast.error('Error al cancelar')
                     return false
              }
       }

       const handleAddItem = async (productId: number, quantity: number, playerName?: string) => {
              if (!bookingId) return
              const res = await addBookingItemWithPlayer(bookingId, productId, quantity, playerName)
              if (res.success) {
                     toast.success('Item agregado')
                     refreshBooking()
                     return true
              } else {
                     toast.error('Error al agregar item')
                     return false
              }
       }

       const handleRemoveItem = async (itemId: number) => {
              const res = await removeBookingItem(itemId)
              if (res.success) {
                     toast.success('Item eliminado')
                     refreshBooking()
                     return true
              } else {
                     toast.error('Error eliminando item')
                     return false
              }
       }

       const handleCancelSeries = async () => {
              if (!bookingId) return false
              const res = await cancelRecurringBooking(bookingId)
              if (res.success) {
                     toast.success(`Serie de ${res.count} reservas cancelada`)
                     return true
              } else {
                     toast.error(res.error || 'Error al cancelar serie')
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
