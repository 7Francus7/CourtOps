import React, { useState } from 'react'
import { Wallet, ArrowRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { payBooking } from '@/actions/manageBooking'

interface PaymentActionsProps {
       bookingId: number
       balance: number
       onPaymentSuccess: () => void
}

export function PaymentActions({ bookingId, balance, onPaymentSuccess }: PaymentActionsProps) {
       const [paymentAmount, setPaymentAmount] = useState<string>("")
       const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
       const [loading, setLoading] = useState(false)

       const handlePayment = async (amountOverride?: number) => {
              const amount = amountOverride || Number(paymentAmount)
              if (!amount || amount <= 0) return toast.warning('Ingrese un monto válido')

              setLoading(true)
              const res = await payBooking(bookingId, amount, paymentMethod)
              setLoading(false)

              if (res.success) {
                     toast.success(`Pago de $${amount} registrado exitosamente`)
                     setPaymentAmount("")
                     onPaymentSuccess()
              } else {
                     toast.error((res as any).error || 'Error al procesar el pago')
              }
       }

       return (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-foreground/5">
                     <h3 className="text-foreground font-bold text-lg mb-4 flex items-center gap-2">
                            <Wallet className="text-[var(--primary)]" />
                            Registrar Cobro
                     </h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Quick Pay Full */}
                            <button
                                   onClick={() => handlePayment(balance)}
                                   disabled={loading}
                                   className="col-span-full bg-[var(--primary)] hover:opacity-90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg shadow-lg shadow-[var(--primary)]/20 active:scale-[0.99] transition-all disabled:opacity-50"
                            >
                                   {loading ? <Loader2 className="animate-spin" /> : <>COBRAR TOTAL (${balance.toLocaleString()}) <ArrowRight size={20} /></>}
                            </button>

                            <div className="col-span-full relative flex items-center gap-3 py-2">
                                   <div className="h-px bg-border flex-1"></div>
                                   <span className="text-muted-foreground text-xs font-bold uppercase">Pago Parcial</span>
                                   <div className="h-px bg-border flex-1"></div>
                            </div>

                            <div className="relative">
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                   <input
                                          type="number"
                                          value={paymentAmount}
                                          onChange={e => setPaymentAmount(e.target.value)}
                                          className="w-full bg-muted border border-border rounded-xl py-3 pl-8 pr-4 text-foreground font-bold outline-none focus:border-[var(--primary)] transition-colors"
                                          placeholder="Monto parcial"
                                   />
                            </div>
                            <div className="flex gap-2">
                                   <select
                                          value={paymentMethod}
                                          onChange={e => setPaymentMethod(e.target.value)}
                                          className="flex-1 bg-muted border border-border rounded-xl px-4 text-foreground text-sm font-bold outline-none focus:border-[var(--primary)] cursor-pointer"
                                   >
                                          <option value="CASH">Efectivo</option>
                                          <option value="TRANSFER">Transferencia</option>
                                          <option value="MP">MercadoPago</option>
                                          <option value="CARD">Tarjeta</option>
                                   </select>
                                   <button
                                          onClick={() => handlePayment()}
                                          disabled={loading}
                                          className="bg-muted hover:bg-muted/80 text-foreground p-3 rounded-xl transition-colors border border-border disabled:opacity-50"
                                   >
                                          {loading ? <Loader2 className="animate-spin" size={20} /> : <Check className="w-5 h-5" />}
                                   </button>
                            </div>
                     </div>
              </div>
       )
}
