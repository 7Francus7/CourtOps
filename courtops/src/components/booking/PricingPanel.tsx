import { BookingPricing } from '@/types/booking'
import { cn } from '@/lib/utils'
import { Receipt, Wallet, AlertCircle, Check } from 'lucide-react'

interface PricingPanelProps {
       pricing: BookingPricing
       className?: string
}

export default function PricingPanel({ pricing, className }: PricingPanelProps) {
       const { basePrice, kioskExtras, total, paid, balance } = pricing

       return (
              <div className={cn("", className)}>
                     <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/5 p-6 space-y-4 shadow-xl">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2">
                                   <div className="flex items-center gap-2">
                                          <Receipt size={12} />
                                          Resumen
                                   </div>
                                   <span className="opacity-50">#MOCK-ID</span>
                            </div>

                            <div className="space-y-3">
                                   <div className="flex justify-between text-xs">
                                          <span className="text-slate-500 dark:text-zinc-500 font-medium">Turno</span>
                                          <span className="text-slate-900 dark:text-white font-bold">${basePrice.toLocaleString()}</span>
                                   </div>

                                   {kioskExtras > 0 && (
                                          <div className="flex justify-between text-xs">
                                                 <span className="text-slate-500 dark:text-zinc-500 font-medium">Extras</span>
                                                 <span className="text-emerald-600 dark:text-emerald-500 font-bold">+${kioskExtras.toLocaleString()}</span>
                                          </div>
                                   )}

                                   <div className="h-px bg-slate-100 dark:bg-white/5" />

                                   <div className="flex justify-between items-baseline">
                                          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest">Total</span>
                                          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">${total.toLocaleString()}</span>
                                   </div>

                                   {paid > 0 && (
                                          <div className="flex justify-between text-[10px] font-bold text-emerald-500/80">
                                                 <span>PAGADO</span>
                                                 <span>-${paid.toLocaleString()}</span>
                                          </div>
                                   )}

                                   {balance > 0 && (
                                          <div className="mt-4 bg-orange-500 dark:bg-orange-500 text-black px-4 py-3 rounded-xl flex items-center justify-between shadow-lg shadow-orange-500/20">
                                                 <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <AlertCircle size={12} />
                                                        Saldo
                                                 </span>
                                                 <span className="text-lg font-black tracking-tight">${balance.toLocaleString()}</span>
                                          </div>
                                   )}

                                   {balance === 0 && paid > 0 && (
                                          <div className="mt-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/10">
                                                 <Check size={12} strokeWidth={3} />
                                                 Saldado
                                          </div>
                                   )}
                            </div>
                     </div>
              </div>
       )
}
