import { BookingPricing } from '@/types/booking'
import { cn } from '@/lib/utils'
import { Receipt, CreditCard, Wallet, AlertCircle, Check } from 'lucide-react'

interface PricingPanelProps {
       pricing: BookingPricing
       className?: string
}

export default function PricingPanel({ pricing, className }: PricingPanelProps) {
       const { basePrice, kioskExtras, total, paid, balance } = pricing

       return (
              <div className={cn("group", className)}>
                     <div className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border/50 p-8 space-y-6 shadow-2xl relative overflow-hidden transition-all hover:border-primary/30">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="flex items-center gap-4 mb-2">
                                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
                                          <Receipt size={20} />
                                   </div>
                                   <span className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Resumen de Cuenta</span>
                            </div>

                            <div className="space-y-4">
                                   {/* Base Price */}
                                   <div className="flex items-center justify-between group/item">
                                          <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Precio Turno</span>
                                          <span className="text-white font-black tracking-tight">${basePrice.toLocaleString()}</span>
                                   </div>

                                   {/* Kiosk Extras */}
                                   {kioskExtras > 0 && (
                                          <div className="flex items-center justify-between text-emerald-500 group/item">
                                                 <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-colors">
                                                        <span>🛒</span> Extras Kiosco
                                                 </span>
                                                 <span className="font-black tracking-tight">+${kioskExtras.toLocaleString()}</span>
                                          </div>
                                   )}

                                   {/* Divider */}
                                   <div className="h-px bg-white/5 my-2" />

                                   {/* Total */}
                                   <div className="flex items-center justify-between py-2">
                                          <div className="space-y-1">
                                                 <span className="text-white font-black uppercase tracking-[0.2em] text-xs block">Total</span>
                                                 <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">IVA Incluido</span>
                                          </div>
                                          <span className="text-3xl font-black text-white tracking-tighter shadow-primary/20 drop-shadow-2xl">${total.toLocaleString()}</span>
                                   </div>

                                   {/* Paid */}
                                   {paid > 0 && (
                                          <div className="flex items-center justify-between text-emerald-500/80 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                                                 <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                               <Wallet size={16} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Pagado</span>
                                                 </div>
                                                 <span className="font-black">-${paid.toLocaleString()}</span>
                                          </div>
                                   )}

                                   {/* Pending */}
                                   {balance > 0 && (
                                          <div className="mt-4 pt-6 border-t border-white/5">
                                                 <div className="bg-orange-500 text-black p-6 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-orange-500/20 active:scale-[0.98] transition-all">
                                                        <div className="flex flex-col">
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      <AlertCircle size={14} />
                                                                      <span className="font-black uppercase tracking-[0.2em] text-[10px]">Saldo Pendiente</span>
                                                               </div>
                                                               <p className="text-[9px] font-bold uppercase opacity-70">Requiere pago</p>
                                                        </div>
                                                        <span className="text-3xl font-black tracking-tighter">${balance.toLocaleString()}</span>
                                                 </div>
                                          </div>
                                   )}

                                   {balance === 0 && paid > 0 && (
                                          <div className="mt-4 pt-4 border-t border-white/5">
                                                 <div className="bg-emerald-500/10 text-emerald-500 p-6 rounded-[2rem] flex items-center justify-between border border-emerald-500/20">
                                                        <div className="flex items-center gap-3">
                                                               <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                                                                      <Check size={24} strokeWidth={3} />
                                                               </div>
                                                               <div className="flex flex-col">
                                                                      <span className="font-black uppercase tracking-[0.2em] text-[10px]">Cuenta Saldada</span>
                                                                      <p className="text-[9px] font-bold uppercase opacity-70">Todo en orden</p>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   )}
                            </div>
                     </div>
              </div>
       )
}
