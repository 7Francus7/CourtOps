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
              { id: 'CASH', label: t('cash'), icon: Banknote },
              { id: 'TRANSFER', label: t('transfer'), icon: ArrowLeftRight },
              { id: 'MP', label: 'MP', icon: QrCode },
              { id: 'CARD', label: t('card'), icon: CreditCard },
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
              <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-xl relative overflow-hidden">
                     <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                   <Wallet size={16} />
                            </div>
                            <h3 className="text-white font-black text-[10px] uppercase tracking-[0.3em]">{t('register_payment')}</h3>
                     </div>

                     {/* Minimal Quick Pay */}
                     <button
                            onClick={() => handlePayment(balance)}
                            disabled={loading}
                            className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl flex items-center justify-between px-6 text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 active:scale-[0.98]"
                     >
                            <span>{t('charge_full_amount')}</span>
                            <div className="flex items-center gap-3">
                                   <span className="font-black text-sm">${balance.toLocaleString()}</span>
                                   <ArrowRight size={14} />
                            </div>
                     </button>

                     <div className="space-y-4">
                            {/* Compact Grid */}
                            <div className="grid grid-cols-4 gap-2">
                                   {paymentMethods.map((method) => (
                                          <button
                                                 key={method.id}
                                                 onClick={() => {
                                                        Haptics.light()
                                                        setPaymentMethod(method.id)
                                                 }}
                                                 className={cn(
                                                        "flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all h-20",
                                                        paymentMethod === method.id
                                                               ? "bg-white/10 border-primary shadow-lg"
                                                               : "bg-zinc-900 border-white/5 hover:border-white/10"
                                                 )}
                                          >
                                                 <method.icon size={16} className={paymentMethod === method.id ? "text-primary" : "text-zinc-600"} />
                                                 <span className={cn(
                                                        "text-[8px] font-black uppercase tracking-widest",
                                                        paymentMethod === method.id ? "text-white" : "text-zinc-600"
                                                 )}>
                                                        {method.label}
                                                 </span>
                                          </button>
                                   ))}
                            </div>

                            {/* Minimal Input */}
                            <div className="relative group">
                                   <input
                                          type="number"
                                          value={paymentAmount}
                                          onChange={e => setPaymentAmount(e.target.value)}
                                          className="w-full h-14 bg-zinc-950/50 border border-white/5 rounded-2xl px-6 pt-4 text-xl font-black text-white outline-none focus:border-primary/30 transition-all placeholder:text-zinc-800 shadow-inner"
                                          placeholder="0"
                                   />
                                   <span className="absolute left-6 top-2 text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">{t('enter_amount')}</span>
                                   <button
                                          onClick={() => handlePayment()}
                                          disabled={loading || !paymentAmount}
                                          className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-black rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 active:scale-95 transition-all"
                                   >
                                          {loading ? <Loader2 className="animate-spin" size={14} /> : t('confirm')}
                                   </button>
                            </div>

                            {/* Ultra Minimal Percentages */}
                            <div className="flex gap-2">
                                   <button
                                          onClick={() => setPaymentAmount(Math.round(balance * 0.5).toString())}
                                          className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest bg-white/5 text-zinc-500 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                                   >
                                          SEÑA 50%
                                   </button>
                                   <button
                                          onClick={() => setPaymentAmount(balance.toString())}
                                          className="flex-1 py-2 text-[8px] font-black uppercase tracking-widest bg-white/5 text-zinc-500 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                                   >
                                          TOTAL
                                   </button>
                            </div>
                     </div>
              </div>
       )
}
