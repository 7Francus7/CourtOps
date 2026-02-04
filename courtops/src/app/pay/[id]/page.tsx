'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, Loader2, CreditCard, Banknote, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentPage() {
       const params = useParams()
       const router = useRouter()
       const bookingId = params.id as string

       const [booking, setBooking] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [processing, setProcessing] = useState(false)
       const [paymentMethod, setPaymentMethod] = useState<'MERCADOPAGO' | 'CASH'>('MERCADOPAGO')

       useEffect(() => {
              loadBooking()
       }, [bookingId])

       const loadBooking = async () => {
              try {
                     const res = await fetch(`/api/bookings/${bookingId}/public`)
                     const data = await res.json()

                     if (data.success) {
                            setBooking(data.booking)
                     } else {
                            toast.error('Reserva no encontrada')
                     }
              } catch (error) {
                     toast.error('Error al cargar la reserva')
              } finally {
                     setLoading(false)
              }
       }

       const handlePayment = async () => {
              if (paymentMethod === 'MERCADOPAGO') {
                     setProcessing(true)
                     try {
                            const res = await fetch('/api/bookings/create-payment-link', {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({
                                          bookingId: Number(bookingId),
                                          amount: balance
                                   })
                            })

                            const data = await res.json()

                            if (data.success && data.url) {
                                   window.location.href = data.url
                            } else {
                                   toast.error('Error al generar el link de pago')
                                   setProcessing(false)
                            }
                     } catch (error) {
                            toast.error('Error al procesar el pago')
                            setProcessing(false)
                     }
              } else {
                     toast.info('Por favor, realiza el pago en efectivo en el club')
              }
       }

       if (loading) {
              return (
                     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                     </div>
              )
       }

       if (!booking) {
              return (
                     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
                            <div className="text-center">
                                   <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                   <h1 className="text-2xl font-bold text-foreground mb-2">Reserva no encontrada</h1>
                                   <p className="text-muted-foreground">El link de pago no es válido o la reserva fue cancelada.</p>
                            </div>
                     </div>
              )
       }

       const totalPaid = booking.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0
       const balance = booking.price - totalPaid
       const isPaid = balance <= 0

       const formattedDate = format(new Date(booking.startTime), "EEEE d 'de' MMMM", { locale: es })
       const formattedTime = format(new Date(booking.startTime), "HH:mm")

       return (
              <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
                     <div className="w-full max-w-md">
                            {/* Header */}
                            <div className="text-center mb-8">
                                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                          <CreditCard className="w-8 h-8 text-primary" />
                                   </div>
                                   <h1 className="text-3xl font-black text-foreground mb-2">Confirmar Reserva</h1>
                                   <p className="text-muted-foreground">Completa el pago para asegurar tu turno</p>
                            </div>

                            {/* Booking Details Card */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-zinc-800 mb-6">
                                   <div className="space-y-4">
                                          <div>
                                                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Cliente</p>
                                                 <p className="text-lg font-bold text-foreground">{booking.client?.name || booking.guestName}</p>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                 <div>
                                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Fecha</p>
                                                        <p className="text-sm font-bold text-foreground capitalize">{formattedDate}</p>
                                                 </div>
                                                 <div>
                                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Hora</p>
                                                        <p className="text-sm font-bold text-foreground">{formattedTime}hs</p>
                                                 </div>
                                          </div>

                                          <div>
                                                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Cancha</p>
                                                 <p className="text-sm font-bold text-foreground">{booking.court?.name}</p>
                                          </div>

                                          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
                                                 <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm text-muted-foreground">Total</span>
                                                        <span className="text-lg font-bold text-foreground">${booking.price.toLocaleString()}</span>
                                                 </div>
                                                 <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm text-muted-foreground">Pagado</span>
                                                        <span className="text-lg font-bold text-emerald-500">${totalPaid.toLocaleString()}</span>
                                                 </div>
                                                 <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-zinc-800">
                                                        <span className="text-sm font-black uppercase tracking-wider text-foreground">Falta Abonar</span>
                                                        <span className="text-2xl font-black text-primary">${balance.toLocaleString()}</span>
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {isPaid ? (
                                   <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-500/20 text-center">
                                          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                          <h2 className="text-xl font-black text-emerald-700 dark:text-emerald-400 mb-2">¡Reserva Confirmada!</h2>
                                          <p className="text-sm text-emerald-600 dark:text-emerald-300">Tu pago ha sido procesado correctamente.</p>
                                   </div>
                            ) : (
                                   <>
                                          {/* Payment Method Selection */}
                                          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-zinc-800 mb-6">
                                                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-4">Método de Pago</p>
                                                 <div className="space-y-3">
                                                        <button
                                                               onClick={() => setPaymentMethod('MERCADOPAGO')}
                                                               className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${paymentMethod === 'MERCADOPAGO'
                                                                             ? 'border-primary bg-primary/5'
                                                                             : 'border-slate-200 dark:border-zinc-800 hover:border-primary/50'
                                                                      }`}
                                                        >
                                                               <CreditCard className="w-5 h-5" />
                                                               <div className="text-left flex-1">
                                                                      <p className="font-bold text-sm">MercadoPago</p>
                                                                      <p className="text-xs text-muted-foreground">Tarjeta de crédito/débito</p>
                                                               </div>
                                                        </button>

                                                        <button
                                                               onClick={() => setPaymentMethod('CASH')}
                                                               className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${paymentMethod === 'CASH'
                                                                             ? 'border-primary bg-primary/5'
                                                                             : 'border-slate-200 dark:border-zinc-800 hover:border-primary/50'
                                                                      }`}
                                                        >
                                                               <Banknote className="w-5 h-5" />
                                                               <div className="text-left flex-1">
                                                                      <p className="font-bold text-sm">Efectivo</p>
                                                                      <p className="text-xs text-muted-foreground">Pagar en el club</p>
                                                               </div>
                                                        </button>
                                                 </div>
                                          </div>

                                          {/* Pay Button */}
                                          <button
                                                 onClick={handlePayment}
                                                 disabled={processing}
                                                 className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl text-lg uppercase tracking-wider transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                          >
                                                 {processing ? (
                                                        <>
                                                               <Loader2 className="w-5 h-5 animate-spin" />
                                                               Procesando...
                                                        </>
                                                 ) : (
                                                        `Pagar $${balance.toLocaleString()}`
                                                 )}
                                          </button>
                                   </>
                            )}
                     </div>
              </div>
       )
}
