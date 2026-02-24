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
              <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mt-32 pointer-events-none"></div>

                     <h3 className="text-white font-black text-xs flex items-center gap-4 mb-10 uppercase tracking-[0.4em] relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10 border border-primary/20">
                                   <Wallet size={24} />
                            </div>
                            {t('register_payment')}
                     </h3>

                     {/* Quick Pay Full */}
                     <button
                            onClick={() => handlePayment(balance)}
                            disabled={loading}
                            className="w-full h-24 bg-white text-black hover:bg-zinc-200 font-black rounded-3xl flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 mb-10 group relative overflow-hidden"
                     >
                            <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <span className="relative z-10">{loading ? <Loader2 className="animate-spin" size={28} /> : (
                                   <div className="flex items-center gap-6">
                                          {t('charge_full_amount')}
                                          <div className="bg-black/5 px-6 py-2.5 rounded-xl text-black font-black text-xl tracking-tighter shadow-inner">
                                                 ${balance.toLocaleString()}
                                          </div>
                                          <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                   </div>
                            )}</span>
                     </button>

                     <div className="flex items-center gap-6 mb-10">
                            <div className="h-px bg-white/5 flex-1"></div>
                            <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] whitespace-nowrap">{t('partial_payment')} / SEÑA</span>
                            <div className="h-px bg-white/5 flex-1"></div>
                     </div>

                     <div className="space-y-10 relative z-10">
                            {/* Payment Methods */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                   {paymentMethods.map((method) => (
                                          <button
                                                 key={method.id}
                                                 onClick={() => {
                                                        Haptics.light()
                                                        setPaymentMethod(method.id)
                                                 }}
                                                 className={cn(
                                                        "flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border transition-all relative overflow-hidden group h-32",
                                                        paymentMethod === method.id
                                                               ? "bg-white/10 border-primary shadow-2xl"
                                                               : "bg-zinc-900 border-white/5 hover:border-white/10"
                                                 )}
                                          >
                                                 <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                                        paymentMethod === method.id ? "bg-primary text-primary-foreground scale-110 shadow-lg" : "bg-white/5 text-zinc-500 group-hover:bg-white/10"
                                                 )}>
                                                        <method.icon size={24} />
                                                 </div>
                                                 <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                                                        paymentMethod === method.id ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"
                                                 )}>
                                                        {method.label}
                                                 </span>
                                                 {paymentMethod === method.id && (
                                                        <div className="absolute top-2 right-2">
                                                               <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                        </div>
                                                 )}
                                          </button>
                                   ))}
                            </div>

                            {/* Amount Input and Confirm */}
                            <div className="space-y-6">
                                   <div className="flex gap-4">
                                          <div className="relative flex-1 group">
                                                 <span className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-2xl pointer-events-none group-focus-within:text-primary transition-colors">$</span>
                                                 <input
                                                        type="number"
                                                        value={paymentAmount}
                                                        onChange={e => setPaymentAmount(e.target.value)}
                                                        className="w-full h-20 bg-zinc-950/50 border border-white/5 rounded-3xl pl-16 pr-6 text-white font-black text-3xl outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/10 transition-all placeholder:text-zinc-900 shadow-inner"
                                                        placeholder="Monto"
                                                 />
                                          </div>
                                          <button
                                                 onClick={() => handlePayment()}
                                                 disabled={loading || !paymentAmount}
                                                 className="w-20 h-20 bg-white text-black hover:bg-zinc-200 rounded-3xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-20 disabled:scale-100 shadow-2xl flex-shrink-0"
                                          >
                                                 {loading ? <Loader2 className="animate-spin" size={32} /> : <Check size={36} strokeWidth={3} />}
                                          </button>
                                   </div>

                                   {/* Quick Percentages */}
                                   <div className="grid grid-cols-2 gap-4">
                                          <button
                                                 onClick={() => {
                                                        Haptics.light()
                                                        setPaymentAmount(Math.round(balance * 0.5).toString())
                                                 }}
                                                 className="py-5 px-8 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl border border-orange-500/20 transition-all active:scale-[0.98] shadow-lg"
                                          >
                                                 Seña 50% (${Math.round(balance * 0.5)})
                                          </button>
                                          <button
                                                 onClick={() => {
                                                        Haptics.light()
                                                        setPaymentAmount(balance.toString())
                                                 }}
                                                 className="py-5 px-8 bg-white/5 hover:bg-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl border border-white/10 transition-all active:scale-[0.98] shadow-lg"
                                          >
                                                 Total (${balance})
                                          </button>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
