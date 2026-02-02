import { useState, useEffect, useCallback } from 'react'
import { Booking, BookingPricing, calculateBookingPricing } from '@/types/booking'
import { getBookingDetails } from '@/actions/manageBooking'

// Define narrowed types for the server action result
type GetBookingSuccess = {
       success: true
       booking: {
              id: number
              client?: { id: string; name: string; phone: string | null; email: string | null }
              startTime: string | Date
              endTime: string | Date
              price: number
              status: string
              paymentStatus: string
              courtId: number
              court?: { id: number; name: string }
              transactions: any[]
              items: any[]
              players: any[]
              createdAt: string | Date
              updatedAt: string | Date
       }
}

type GetBookingError = {
       success: false
       error: string
}

type BookingDetailsResult = GetBookingSuccess | GetBookingError

interface UseBookingReturn {
       booking: Booking | null
       pricing: BookingPricing | null
       loading: boolean
       error: string | null
       refresh: () => Promise<void>
       updateLocal: (updates: Partial<Booking>) => void
}

export function useBooking(bookingId: number | null): UseBookingReturn {
       const [booking, setBooking] = useState<Booking | null>(null)
       const [pricing, setPricing] = useState<BookingPricing | null>(null)
       const [loading, setLoading] = useState(true)
       const [error, setError] = useState<string | null>(null)

       const fetchBooking = useCallback(async () => {
              if (!bookingId) {
                     setLoading(false)
                     return
              }

              try {
                     setLoading(true)
                     setError(null)

                     // Cast the result to our discriminated union
                     const result = await getBookingDetails(bookingId) as unknown as BookingDetailsResult

                     if (result.success) {
                            const rawBooking = result.booking

                            if (!rawBooking.client) {
                                   setError("La reserva no tiene cliente asociado")
                                   setLoading(false)
                                   return
                            }

                            // Transform raw booking data to typed Booking
                            const transformedBooking: Booking = {
                                   id: Number(rawBooking.id),
                                   client: {
                                          id: Number(rawBooking.client.id),
                                          name: rawBooking.client.name,
                                          phone: rawBooking.client.phone || '',
                                          email: rawBooking.client.email
                                   },
                                   schedule: {
                                          date: new Date(rawBooking.startTime),
                                          startTime: new Date(rawBooking.startTime),
                                          endTime: new Date(rawBooking.endTime),
                                          duration: Math.round((new Date(rawBooking.endTime).getTime() - new Date(rawBooking.startTime).getTime()) / 60000),
                                          courtId: rawBooking.courtId,
                                          courtName: rawBooking.court?.name || `Cancha ${rawBooking.courtId}`
                                   },
                                   pricing: {
                                          basePrice: rawBooking.price,
                                          kioskExtras: 0,
                                          total: 0,
                                          paid: 0,
                                          balance: 0
                                   },
                                   status: rawBooking.status as any,
                                   paymentStatus: rawBooking.paymentStatus as any,
                                   transactions: (rawBooking.transactions || []).map((t: any) => ({
                                          id: t.id,
                                          amount: t.amount,
                                          method: t.method,
                                          createdAt: new Date(t.createdAt),
                                          notes: t.description,
                                          reference: t.reference
                                   })),
                                   products: (rawBooking.items || []).map((item: any) => ({
                                          id: item.id,
                                          productId: item.productId,
                                          productName: item.product?.name || 'Producto',
                                          quantity: item.quantity,
                                          unitPrice: Number(item.unitPrice),
                                          playerName: item.playerName || '',
                                          subtotal: item.quantity * Number(item.unitPrice)
                                   })),
                                   players: rawBooking.players || [],
                                   // notes: rawBooking.notes,
                                   metadata: {
                                          createdAt: new Date(rawBooking.createdAt),
                                          updatedAt: new Date(rawBooking.updatedAt)
                                   }
                            }

                            // Calculate pricing
                            const calculatedPricing = calculateBookingPricing(
                                   transformedBooking.pricing.basePrice,
                                   transformedBooking.products,
                                   transformedBooking.transactions
                            )

                            transformedBooking.pricing = calculatedPricing

                            setBooking(transformedBooking)
                            setPricing(calculatedPricing)
                     } else {
                            setError(result.error || 'Error al cargar el turno')
                     }
              } catch (err) {
                     console.error('Error fetching booking:', err)
                     setError('Error al cargar el turno')
              } finally {
                     setLoading(false)
              }
       }, [bookingId])

       const refresh = useCallback(async () => {
              await fetchBooking()
       }, [fetchBooking])

       const updateLocal = useCallback((updates: Partial<Booking>) => {
              setBooking(prev => {
                     if (!prev) return null
                     const updated = { ...prev, ...updates }

                     // Recalculate pricing if products or transactions changed
                     if (updates.products || updates.transactions) {
                            const newPricing = calculateBookingPricing(
                                   updated.pricing.basePrice,
                                   updated.products || prev.products,
                                   updated.transactions || prev.transactions
                            )
                            updated.pricing = newPricing
                            setPricing(newPricing)
                     }

                     return updated
              })
       }, [])

       useEffect(() => {
              fetchBooking()
       }, [fetchBooking])

       return {
              booking,
              pricing,
              loading,
              error,
              refresh,
              updateLocal
       }
}
