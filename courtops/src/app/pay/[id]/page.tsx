'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, Loader2, CreditCard, Banknote, AlertCircle, ShieldCheck, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentPage() {
       const params = useParams()
       const _router = useRouter()
       const bookingId = params.id as string

       const [booking, setBooking] = useState<Record<string, unknown> | null>(null)
       const [loading, setLoading] = useState(true)
       const [processing, setProcessing] = useState(false)
       const [cancelling, setCancelling] = useState(false)
       const [showCancelDialog, setShowCancelDialog] = useState(false)
       const [cancelled, setCancelled] = useState(false)
       const [paymentMethod, setPaymentMethod] = useState<'MERCADOPAGO' | 'CASH'>('MERCADOPAGO')
       const paymentLockRef = useRef(false)

       const loadBooking = async () => {
              try {
                     const res = await fetch(`/api/bookings/${bookingId}/public`)
                     const data = await res.json()

                     if (data.success) {
                            setBooking(data.booking)
                     } else {
                            toast.error('Reserva no encontrada')
                     }
              } catch {
                     toast.error('Error al cargar la reserva')
              } finally {
                     setLoading(false)
              }
       }

       useEffect(() => {
              loadBooking()
       // eslint-disable-next-line react-hooks/exhaustive-deps
       }, [bookingId])

       const handlePayment = async () => {
              if (paymentLockRef.current) return
              paymentLockRef.current = true
              if (paymentMethod === 'MERCADOPAGO') {
                     setProcessing(true)
                     console.log('🔄 Iniciando pago con MercadoPago...', { bookingId, balance })

                     try {
                            const res = await fetch('/api/bookings/create-payment-link', {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({
                                          bookingId: Number(bookingId),
                                          amount: balance
                                   })
                            })

                            console.log('📡 Response status:', res.status)
                            const data = await res.json()
                            console.log('📦 Response data:', data)

                            if (data.success && data.url) {
                                   console.log('✅ Redirigiendo a:', data.url)
                                   window.location.href = data.url
                            } else {
                                   console.error('❌ Error en respuesta:', data.error)
                                   toast.error(data.error || 'Error al generar el link de pago')
                                   setProcessing(false)
                                   paymentLockRef.current = false
                            }
                     } catch (error) {
                            console.error('❌ Error en fetch:', error)
                            toast.error('Error al procesar el pago')
                            setProcessing(false)
                            paymentLockRef.current = false
                     }
              } else {
                     toast.info('Por favor, realiza el pago en efectivo en el club')
                     paymentLockRef.current = false
              }
       }

       const handleCancel = async () => {
              setCancelling(true)
              try {
                     const res = await fetch(`/api/bookings/${bookingId}/cancel-public`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({})
                     })
                     const data = await res.json()

                     if (data.success) {
                            setCancelled(true)
                            setShowCancelDialog(false)
                            toast.success('Reserva cancelada correctamente')
                     } else {
                            toast.error(data.error || 'Error al cancelar la reserva')
                     }
              } catch {
                     toast.error('Error al cancelar la reserva')
              } finally {
                     setCancelling(false)
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

       const totalPaid = (booking.transactions as { amount: number }[])?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0
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
                                                        <span className="text-3xl font-black text-primary">${balance.toLocaleString()}</span>
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {cancelled ? (
                            <div className="bg-red-50 dark:bg-red-500/10 rounded-3xl p-6 border border-red-200 dark:border-red-500/20 text-center">
                                   <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                   <h2 className="text-xl font-black text-red-700 dark:text-red-400 mb-2">Reserva Cancelada</h2>
                                   <p className="text-sm text-red-600 dark:text-red-300">Tu reserva ha sido cancelada correctamente.</p>
                            </div>
                     ) : isPaid ? (
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
                                                               <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex items-center justify-center shrink-0">
                                                               <span className="text-[#009EE3] font-black text-xs">MP</span>
                                                        </div>
                                                               <div className="text-left flex-1">
                                                                      <p className="font-bold text-sm">Mercado Pago</p>
                                                                      <p className="text-xs text-muted-foreground">Tarjeta de crédito, débito o dinero en cuenta</p>
                                                               </div>
                                                        </button>

                                                        <button
                                                               onClick={() => setPaymentMethod('CASH')}
                                                               className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${paymentMethod === 'CASH'
                                                                      ? 'border-primary bg-primary/5'
                                                                      : 'border-slate-200 dark:border-zinc-800 hover:border-primary/50'
                                                                      }`}
                                                        >
                                                               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                                      <Banknote className="w-5 h-5 text-emerald-500" />
                                                               </div>
                                                               <div className="text-left flex-1">
                                                                      <p className="font-bold text-sm">Efectivo</p>
                                                                      <p className="text-xs text-muted-foreground">Pagá en el club al momento de jugar</p>
                                                               </div>
                                                        </button>
                                                 </div>
                                          </div>

                                          {/* Trust Badge */}
                                          <div className="flex items-center justify-center gap-2 mb-4 text-muted-foreground">
                                                 <ShieldCheck size={14} />
                                                 <span className="text-xs font-medium">Pago 100% seguro</span>
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

                                          {/* Cancel Button */}
                                          <button
                                                 onClick={() => setShowCancelDialog(true)}
                                                 disabled={processing || cancelling}
                                                 className="w-full mt-4 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium py-2 transition-colors disabled:opacity-50"
                                          >
                                                 Cancelar Reserva
                                          </button>
                                   </>
                            )}

                            {/* Cancel Confirmation Dialog */}
                            {showCancelDialog && (
                                   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-zinc-800">
                                                 <div className="text-center mb-6">
                                                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                                        <h3 className="text-lg font-black text-foreground mb-2">Cancelar Reserva</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                               Esta acción no se puede deshacer. Tu turno quedará disponible para otros jugadores.
                                                        </p>
                                                 </div>
                                                 <div className="space-y-3">
                                                        <button
                                                               onClick={handleCancel}
                                                               disabled={cancelling}
                                                               className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                               {cancelling ? (
                                                                      <>
                                                                             <Loader2 className="w-4 h-4 animate-spin" />
                                                                             Cancelando...
                                                                      </>
                                                               ) : (
                                                                      'Confirmar Cancelación'
                                                               )}
                                                        </button>
                                                        <button
                                                               onClick={() => setShowCancelDialog(false)}
                                                               disabled={cancelling}
                                                               className="w-full text-muted-foreground hover:text-foreground font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                                                        >
                                                               Volver
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            )}
                     </div>
              </div>
       )
}
