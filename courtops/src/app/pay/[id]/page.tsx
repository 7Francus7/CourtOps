'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, Loader2, CreditCard, Banknote, AlertCircle,
  ShieldCheck, XCircle, Calendar, Clock, MapPin, User, Receipt
} from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentPage() {
  const params = useParams()
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
          toast.error(data.error || 'Error al generar el link de pago')
          setProcessing(false)
          paymentLockRef.current = false
        }
      } catch {
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

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-white/[0.06] animate-pulse" />
            <div className="h-6 w-48 bg-slate-200 dark:bg-white/[0.06] rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 dark:bg-white/[0.04] rounded-lg animate-pulse" />
          </div>
          <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] p-6 space-y-4">
            <div className="h-4 w-20 bg-slate-100 dark:bg-white/[0.04] rounded animate-pulse" />
            <div className="h-5 w-40 bg-slate-200 dark:bg-white/[0.06] rounded animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-white/[0.04] rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="h-px bg-slate-200 dark:bg-white/[0.06]" />
            <div className="h-12 bg-slate-100 dark:bg-white/[0.04] rounded-xl animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-14 bg-slate-200 dark:bg-white/[0.06] rounded-xl animate-pulse" />
            <div className="h-14 bg-slate-200 dark:bg-white/[0.06] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reserva no encontrada</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            El link de pago no es válido o la reserva fue cancelada. Si crees que es un error, contacta al club.
          </p>
        </motion.div>
      </div>
    )
  }

  const totalPaid = (booking.transactions as { amount: number }[])?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0
  const balance = (booking.price as number) - totalPaid
  const isPaid = balance <= 0
  const price = booking.price as number
  const paymentProgress = price > 0 ? Math.min((totalPaid / price) * 100, 100) : 0

  const formattedDate = format(new Date(booking.startTime as string), "EEEE d 'de' MMMM", { locale: es })
  const formattedTime = format(new Date(booking.startTime as string), "HH:mm")

  const clubName = (booking.club as Record<string, unknown>)?.name as string | undefined
  const clubAddress = (booking.club as Record<string, unknown>)?.address as string | undefined

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/15 mb-4">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {isPaid ? '¡Reserva Confirmada!' : cancelled ? 'Reserva Cancelada' : 'Confirmar Reserva'}
          </h1>
          {!isPaid && !cancelled && (
            <p className="text-sm text-slate-500 dark:text-zinc-400">Completá el pago para asegurar tu turno</p>
          )}
          {clubName && (
            <p className="text-xs font-medium text-primary mt-1.5">{clubName}</p>
          )}
        </div>

        {/* Booking Details Card */}
        <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-sm overflow-hidden mb-4">
          {/* Info rows */}
          <div className="p-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center shrink-0">
                <User size={15} className="text-slate-500 dark:text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Cliente</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {(booking.client as Record<string, unknown>)?.name as string || booking.guestName as string}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center shrink-0">
                  <Calendar size={15} className="text-slate-500 dark:text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Fecha</p>
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white capitalize truncate">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center shrink-0">
                  <Clock size={15} className="text-slate-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Hora</p>
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{formattedTime}hs</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-slate-500 dark:text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Cancha</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{(booking.court as Record<string, unknown>)?.name as string}</p>
                {clubAddress && (
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">{clubAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Receipt size={13} className="text-slate-400 dark:text-zinc-500" />
              <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Detalle de pago</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[13px] text-slate-500 dark:text-zinc-400">Total</span>
              <span className="text-[13px] font-semibold text-slate-700 dark:text-zinc-300">${price.toLocaleString()}</span>
            </div>

            {totalPaid > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-emerald-600 dark:text-emerald-400">Pagado</span>
                <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">-${totalPaid.toLocaleString()}</span>
              </div>
            )}

            {/* Progress bar */}
            {totalPaid > 0 && !isPaid && (
              <div className="relative h-1.5 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${paymentProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {isPaid ? 'Pagado' : 'Falta abonar'}
              </span>
              <span className={`text-2xl font-bold tracking-tight ${isPaid ? 'text-emerald-500' : 'text-primary'}`}>
                ${isPaid ? totalPaid.toLocaleString() : balance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Status or Payment Section */}
        <AnimatePresence mode="wait">
          {cancelled ? (
            <motion.div
              key="cancelled"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-500/[0.06] rounded-2xl p-6 border border-red-200/60 dark:border-red-500/10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Reserva Cancelada</h2>
              <p className="text-sm text-red-600/70 dark:text-red-400/60">Tu reserva ha sido cancelada correctamente.</p>
            </motion.div>
          ) : isPaid ? (
            <motion.div
              key="paid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 dark:bg-emerald-500/[0.06] rounded-2xl p-6 border border-emerald-200/60 dark:border-emerald-500/10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-1">¡Pago Completado!</h2>
              <p className="text-sm text-emerald-600/70 dark:text-emerald-400/60">Tu reserva está confirmada. ¡Nos vemos en la cancha!</p>
            </motion.div>
          ) : (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Payment Methods */}
              <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] p-5">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Método de Pago</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setPaymentMethod('MERCADOPAGO')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 ${
                      paymentMethod === 'MERCADOPAGO'
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'MERCADOPAGO'
                        ? 'bg-[#009EE3]/15'
                        : 'bg-slate-100 dark:bg-white/[0.04]'
                    }`}>
                      <span className="text-[#009EE3] font-bold text-xs">MP</span>
                    </div>
                    <div className="text-center">
                      <p className={`text-[12px] font-semibold ${
                        paymentMethod === 'MERCADOPAGO' ? 'text-primary' : 'text-slate-700 dark:text-zinc-300'
                      }`}>Mercado Pago</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Tarjeta o cuenta</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2.5 ${
                      paymentMethod === 'CASH'
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'CASH'
                        ? 'bg-emerald-500/15'
                        : 'bg-slate-100 dark:bg-white/[0.04]'
                    }`}>
                      <Banknote className={`w-5 h-5 ${
                        paymentMethod === 'CASH' ? 'text-emerald-500' : 'text-slate-400 dark:text-zinc-500'
                      }`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-[12px] font-semibold ${
                        paymentMethod === 'CASH' ? 'text-primary' : 'text-slate-700 dark:text-zinc-300'
                      }`}>Efectivo</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Pagá en el club</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm tracking-wide transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-lg shadow-slate-900/10 dark:shadow-white/5"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Pagar ${balance.toLocaleString()}
                    <ShieldCheck size={15} className="opacity-50" />
                  </>
                )}
              </button>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-1.5 text-slate-400 dark:text-zinc-500">
                <ShieldCheck size={12} />
                <span className="text-[10px] font-medium">Pago 100% seguro y encriptado</span>
              </div>

              {/* Cancel */}
              <button
                onClick={() => setShowCancelDialog(true)}
                disabled={processing || cancelling}
                className="w-full text-red-400 dark:text-red-400/60 hover:text-red-500 dark:hover:text-red-400 text-[12px] font-medium py-2 transition-colors disabled:opacity-50"
              >
                Cancelar Reserva
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Confirmation Dialog */}
        <AnimatePresence>
          {showCancelDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-white/[0.08]"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">¿Cancelar Reserva?</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Esta acción no se puede deshacer. Tu turno quedará disponible para otros jugadores.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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
                    className="w-full text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
                  >
                    Volver
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
