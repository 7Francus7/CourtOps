import React, { useState } from 'react'
import { Wallet, ArrowRight, Check, Loader2, Banknote, ArrowLeftRight, CreditCard, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { payBooking } from '@/actions/manageBooking'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import { Haptics } from '@/lib/haptics'

interface PaymentActionsProps {
       bookingId: number
       balance: number
       onPaymentSuccess: () => void
}

export function PaymentActions({ bookingId, balance, onPaymentSuccess }: PaymentActionsProps) {
       const { t } = useLanguage()
       const [paymentAmount, setPaymentAmount] = useState<string>("")
       const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
       const [loading, setLoading] = useState(false)

       const paymentMethods = [
              { id: 'CASH', label: t('cash'), icon: Banknote, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
              { id: 'TRANSFER', label: t('transfer'), icon: ArrowLeftRight, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { id: 'MP', label: 'MercadoPago', icon: QrCode, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
              { id: 'CARD', label: t('card'), icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
       ]

       const handlePayment = async (amountOverride?: number) => {
              const amount = amountOverride || Number(paymentAmount)
              if (!amount || amount <= 0) {
                     Haptics.error()
                     return toast.warning(t('enter_valid_amount'))
              }

              setLoading(true)
              const res = await payBooking(bookingId, amount, paymentMethod)
              setLoading(false)

              if (res.success) {
                     Haptics.success()
                     toast.success(t('payment_registered_success'))
                     setPaymentAmount("")
                     onPaymentSuccess()
              } else {
                     Haptics.error()
                     toast.error((res as any).error || t('error_processing_payment'))
              }
       }

       return (
              <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                     <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mt-32 pointer-events-none"></div>

                     <h3 className="text-white font-black text-xs flex items-center gap-4 mb-10 uppercase tracking-[0.3em] relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                                   <Wallet size={20} />
                            </div>
                            {t('register_payment')}
                     </h3>

                     {/* Quick Pay Full */}
                     <button
                            onClick={() => handlePayment(balance)}
                            disabled={loading}
                            className="w-full h-20 bg-primary hover:brightness-110 text-primary-foreground font-black rounded-2xl flex items-center justify-center gap-4 text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 mb-10 group relative overflow-hidden"
                     >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <span className="relative z-10">{loading ? <Loader2 className="animate-spin" size={24} /> : (
                                   <div className="flex items-center gap-4">
                                          {t('charge_full_amount')}
                                          <div className="bg-white/20 px-4 py-1.5 rounded-lg text-white font-black">
                                                 ${balance.toLocaleString()}
                                          </div>
                                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                   </div>
                            )}</span>
                     </button>

                     <div className="flex items-center gap-6 mb-10">
                            <div className="h-px bg-white/5 flex-1"></div>
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">{t('partial_payment')} / SEÑA</span>
                            <div className="h-px bg-white/5 flex-1"></div>
                     </div>

                     <div className="space-y-8 relative z-10">
                            {/* Payment Methods */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                   {paymentMethods.map((method) => (
                                          <button
                                                 key={method.id}
                                                 onClick={() => {
                                                        Haptics.light()
                                                        setPaymentMethod(method.id)
                                                 }}
                                                 className={cn(
                                                        "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all relative overflow-hidden group h-24",
                                                        paymentMethod === method.id
                                                               ? "bg-white/5 border-primary shadow-2xl shadow-primary/10"
                                                               : "bg-zinc-900/50 border-white/5 hover:border-white/10"
                                                 )}
                                          >
                                                 <method.icon className={cn("w-6 h-6 transition-all duration-300", paymentMethod === method.id ? "text-primary scale-110" : "text-zinc-500 group-hover:text-zinc-400")} />
                                                 <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", paymentMethod === method.id ? "text-white" : "text-zinc-500")}>
                                                        {method.label}
                                                 </span>
                                                 {paymentMethod === method.id && (
                                                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                                                 )}
                                          </button>
                                   ))}
                            </div>

                            {/* Amount Input and Confirm */}
                            <div className="space-y-4">
                                   <div className="flex gap-4">
                                          <div className="relative flex-1 group">
                                                 <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-xl pointer-events-none group-focus-within:text-primary transition-colors">$</span>
                                                 <input
                                                        type="number"
                                                        value={paymentAmount}
                                                        onChange={e => setPaymentAmount(e.target.value)}
                                                        className="w-full h-16 bg-zinc-900 border-2 border-white/5 rounded-2xl pl-12 pr-6 text-white font-black text-2xl outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/10 transition-all placeholder:text-zinc-800"
                                                        placeholder="Monto"
                                                 />
                                          </div>
                                          <button
                                                 onClick={() => handlePayment()}
                                                 disabled={loading || !paymentAmount}
                                                 className="w-16 h-16 bg-white text-black hover:bg-zinc-200 rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-20 disabled:scale-100 shadow-2xl flex-shrink-0"
                                          >
                                                 {loading ? <Loader2 className="animate-spin" size={24} /> : <Check size={28} strokeWidth={3} />}
                                          </button>
                                   </div>

                                   {/* Quick Percentages */}
                                   <div className="grid grid-cols-2 gap-3">
                                          <button
                                                 onClick={() => {
                                                        Haptics.light()
                                                        setPaymentAmount(Math.round(balance * 0.5).toString())
                                                 }}
                                                 className="py-4 px-6 bg-orange-500/5 hover:bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-orange-500/10 transition-all active:scale-[0.98]"
                                          >
                                                 Seña 50% (${Math.round(balance * 0.5)})
                                          </button>
                                          <button
                                                 onClick={() => {
                                                        Haptics.light()
                                                        setPaymentAmount(balance.toString())
                                                 }}
                                                 className="py-4 px-6 bg-white/5 hover:bg-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/10 transition-all active:scale-[0.98]"
                                          >
                                                 Total (${balance})
                                          </button>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
