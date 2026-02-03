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
              <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 shadow-sm">
                     <h3 className="text-slate-900 dark:text-white font-black text-sm flex items-center gap-3 mb-6 uppercase tracking-widest">
                            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                   <Wallet size={16} />
                            </div>
                            {t('register_payment')}
                     </h3>

                     {/* Quick Pay Full */}
                     <button
                            onClick={() => handlePayment(balance)}
                            disabled={loading}
                            className="w-full h-14 bg-[var(--primary)] hover:opacity-90 text-white font-black rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98] transition-all disabled:opacity-50 mb-6"
                     >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                   <>
                                          {t('charge_full_amount')}
                                          <span className="bg-white/20 px-2 py-0.5 rounded text-white text-xs">${balance.toLocaleString()}</span>
                                          <ArrowRight size={16} />
                                   </>
                            )}
                     </button>

                     <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-slate-100 dark:bg-white/5 flex-1"></div>
                            <span className="text-slate-400 dark:text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">{t('partial_payment')} / SEÑA</span>
                            <div className="h-px bg-slate-100 dark:bg-white/5 flex-1"></div>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                            {/* Payment Methods */}
                            <div className="grid grid-cols-4 gap-2">
                                   {paymentMethods.map((method) => (
                                          <button
                                                 key={method.id}
                                                 onClick={() => setPaymentMethod(method.id)}
                                                 className={cn(
                                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all relative overflow-hidden group",
                                                        paymentMethod === method.id
                                                               ? `${method.bg} ${method.border} ring-1 ring-offset-2 ring-offset-white dark:ring-offset-[#121214] ring-current`
                                                               : "bg-slate-50 dark:bg-white/5 border-transparent hover:bg-slate-100 dark:hover:bg-white/10"
                                                 )}
                                          >
                                                 <method.icon className={cn("w-5 h-5 transition-colors", paymentMethod === method.id ? method.color : "text-slate-400 dark:text-muted-foreground group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                                                 <span className={cn("text-[9px] font-black uppercase tracking-wider transition-colors truncate w-full text-center", paymentMethod === method.id ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-muted-foreground")}>
                                                        {method.label}
                                                 </span>
                                          </button>
                                   ))}
                            </div>

                            {/* Amount Input and Confirm */}
                            <div className="space-y-3">
                                   <div className="flex gap-3">
                                          <div className="relative flex-1 group">
                                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-muted-foreground font-black pointer-events-none group-focus-within:text-[var(--primary)] transition-colors">$</span>
                                                 <input
                                                        type="number"
                                                        value={paymentAmount}
                                                        onChange={e => setPaymentAmount(e.target.value)}
                                                        className="w-full h-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 text-slate-900 dark:text-white font-black text-lg outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all placeholder:text-slate-300 dark:placeholder:text-muted-foreground/30"
                                                        placeholder={t('amount_placeholder')}
                                                 />
                                          </div>
                                          <button
                                                 onClick={() => handlePayment()}
                                                 disabled={loading || !paymentAmount}
                                                 className="w-12 h-12 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-white/90 text-white dark:text-black rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg"
                                          >
                                                 {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={20} />}
                                          </button>
                                   </div>

                                   {/* Quick Percentages */}
                                   <div className="grid grid-cols-2 gap-2">
                                          <button
                                                 onClick={() => setPaymentAmount(Math.round(balance * 0.5).toString())}
                                                 className="py-2 px-3 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-orange-200 dark:border-orange-500/20 transition-colors"
                                          >
                                                 Seña 50% (${Math.round(balance * 0.5)})
                                          </button>
                                          <button
                                                 onClick={() => setPaymentAmount(balance.toString())}
                                                 className="py-2 px-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200 dark:border-white/10 transition-colors"
                                          >
                                                 Total (${balance})
                                          </button>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
