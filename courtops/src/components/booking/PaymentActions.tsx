import React, { useState } from 'react'
import { Wallet, ArrowRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { payBooking } from '@/actions/manageBooking'
import { useLanguage } from '@/contexts/LanguageContext'

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

       const handlePayment = async (amountOverride?: number) => {
              const amount = amountOverride || Number(paymentAmount)
              if (!amount || amount <= 0) return toast.warning(t('enter_valid_amount'))

              setLoading(true)
              const res = await payBooking(bookingId, amount, paymentMethod)
              setLoading(false)

              if (res.success) {
                     toast.success(t('payment_registered_success'))
                     setPaymentAmount("")
                     onPaymentSuccess()
              } else {
                     toast.error((res as any).error || t('error_processing_payment'))
              }
       }

       return (
              <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-[2rem] p-8 shadow-sm">
                     <h3 className="text-slate-900 dark:text-foreground font-black text-xl mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                   <Wallet size={20} />
                            </div>
                            {t('register_payment')}
                     </h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                            {/* Quick Pay Full */}
                            <button
                                   onClick={() => handlePayment(balance)}
                                   disabled={loading}
                                   className="col-span-full h-16 bg-[var(--primary)] hover:brightness-110 text-white font-black rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl shadow-[var(--primary)]/20 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                   {loading ? <Loader2 className="animate-spin" /> : <>{t('charge_full_amount')} (${balance.toLocaleString()}) <ArrowRight size={22} /></>}
                            </button>

                            <div className="col-span-full relative flex items-center gap-4 py-4">
                                   <div className="h-px bg-slate-100 dark:bg-border flex-1"></div>
                                   <span className="text-slate-400 dark:text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">{t('partial_payment')}</span>
                                   <div className="h-px bg-slate-100 dark:bg-border flex-1"></div>
                            </div>

                            <div className="relative">
                                   <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                                   <input
                                          type="number"
                                          value={paymentAmount}
                                          onChange={e => setPaymentAmount(e.target.value)}
                                          className="w-full h-14 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-[1.2rem] pl-10 pr-4 text-slate-900 dark:text-foreground font-black outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all placeholder:text-slate-300"
                                          placeholder={t('amount_placeholder')}
                                   />
                            </div>
                            <div className="flex gap-3">
                                   <select
                                          value={paymentMethod}
                                          onChange={e => setPaymentMethod(e.target.value)}
                                          className="flex-1 h-14 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-[1.2rem] px-5 text-slate-900 dark:text-foreground text-xs font-black uppercase tracking-widest outline-none focus:border-[var(--primary)] cursor-pointer transition-all"
                                   >
                                          <option value="CASH">{t('cash')}</option>
                                          <option value="TRANSFER">{t('transfer')}</option>
                                          <option value="MP">MercadoPago</option>
                                          <option value="CARD">{t('card')}</option>
                                   </select>
                                   <button
                                          onClick={() => handlePayment()}
                                          disabled={loading}
                                          className="w-14 h-14 bg-slate-900 dark:bg-muted hover:bg-slate-800 dark:hover:bg-muted/80 text-white dark:text-foreground rounded-[1.2rem] flex items-center justify-center transition-all border border-transparent active:scale-90 disabled:opacity-50"
                                   >
                                          {loading ? <Loader2 className="animate-spin" size={20} /> : <Check className="w-6 h-6" />}
                                   </button>
                            </div>
                     </div>
              </div>
       )
}
