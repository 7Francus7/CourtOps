import React, { useState } from 'react'
import { ArrowRight, Loader2, Banknote, ArrowLeftRight, CreditCard, QrCode } from 'lucide-react'
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
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-2xl p-5 md:p-6 space-y-4">
                     <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">{t('register_payment')}</h3>

                     {/* Quick Pay Full */}
                     <button
                            onClick={() => handlePayment(balance)}
                            disabled={loading}
                            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-black hover:brightness-110 font-semibold rounded-xl flex items-center justify-between px-5 text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
                     >
                            <span className="text-xs">{t('charge_full_amount')}</span>
                            <div className="flex items-center gap-2.5">
                                   <span className="font-bold">${balance.toLocaleString()}</span>
                                   {loading ? <Loader2 className="animate-spin" size={14} /> : <ArrowRight size={14} />}
                            </div>
                     </button>

                     {/* Payment Methods Grid */}
                     <div className="grid grid-cols-4 gap-2">
                            {paymentMethods.map((method) => (
                                   <button
                                          key={method.id}
                                          onClick={() => {
                                                 Haptics.light()
                                                 setPaymentMethod(method.id)
                                          }}
                                          className={cn(
                                                 "flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all",
                                                 paymentMethod === method.id
                                                        ? "bg-primary/10 dark:bg-primary/15 border-primary/40 text-primary"
                                                        : "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-400 dark:text-zinc-600 hover:border-slate-300 dark:hover:border-white/[0.1]"
                                          )}
                                   >
                                          <method.icon size={15} />
                                          <span className={cn(
                                                 "text-[9px] font-semibold uppercase tracking-wider",
                                                 paymentMethod === method.id ? "text-primary" : "text-slate-400 dark:text-zinc-600"
                                          )}>
                                                 {method.label}
                                          </span>
                                   </button>
                            ))}
                     </div>

                     {/* Custom Amount Input */}
                     <div className="relative">
                            <span className="absolute left-4 top-2 text-[9px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('enter_amount')}</span>
                            <input
                                   type="number"
                                   value={paymentAmount}
                                   onChange={e => setPaymentAmount(e.target.value)}
                                   className="w-full h-14 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-4 pt-5 text-lg font-bold text-slate-900 dark:text-white outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-800"
                                   placeholder="0"
                            />
                            <button
                                   onClick={() => handlePayment()}
                                   disabled={loading || !paymentAmount}
                                   className="absolute right-2 top-2 bottom-2 px-4 bg-primary text-primary-foreground rounded-lg font-semibold text-[11px] disabled:opacity-20 active:scale-95 transition-all"
                            >
                                   {loading ? <Loader2 className="animate-spin" size={14} /> : t('confirm')}
                            </button>
                     </div>

                     {/* Quick Presets */}
                     <div className="flex gap-2">
                            <button
                                   onClick={() => setPaymentAmount(Math.round(balance * 0.5).toString())}
                                   className="flex-1 py-2 text-[10px] font-medium bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 rounded-lg border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                            >
                                   Seña 50%
                            </button>
                            <button
                                   onClick={() => setPaymentAmount(balance.toString())}
                                   className="flex-1 py-2 text-[10px] font-medium bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 rounded-lg border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                            >
                                   Total
                            </button>
                     </div>
              </div>
       )
}
