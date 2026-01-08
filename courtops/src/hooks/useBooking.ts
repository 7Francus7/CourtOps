import { useState, useEffect, useCallback } from 'react'
import { Booking, BookingPricing, calculateBookingPricing } from '@/types/booking'
import { getBookingDetails } from '@/actions/manageBooking'

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

                     const result = await getBookingDetails(bookingId)

                     if (result.success && result.booking) {
                            const rawBooking = result.booking as any

                            // Transform raw booking data to typed Booking
                            const transformedBooking: Booking = {
                                   id: rawBooking.id,
                                   client: {
                                          id: rawBooking.client.id,
                                          name: rawBooking.client.name,
                                          phone: rawBooking.client.phone,
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
                                   status: rawBooking.status,
                                   paymentStatus: rawBooking.paymentStatus,
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
                                          unitPrice: item.unitPrice,
                                          playerName: item.playerName,
                                          subtotal: item.quantity * item.unitPrice
                                   })),
                                   players: rawBooking.players || [],
                                   notes: rawBooking.notes,
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
