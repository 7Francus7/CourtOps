import { BookingPricing } from '@/types/booking'
import { cn } from '@/lib/utils'

interface PricingPanelProps {
       pricing: BookingPricing
       className?: string
}

export default function PricingPanel({ pricing, className }: PricingPanelProps) {
       const { basePrice, kioskExtras, total, paid, balance } = pricing

       return (
              <div className={cn("space-y-4", className)}>

                     {/* Breakdown Section */}
                     <div className="bg-bg-dark/50 rounded-2xl border border-white/5 p-3 sm:p-5 space-y-3">

                            {/* Base Price */}
                            <div className="flex items-center justify-between text-sm">
                                   <span className="text-white/60 font-medium">Precio turno</span>
                                   <span className="text-white font-bold font-mono">
                                          ${basePrice.toLocaleString()}
                                   </span>
                            </div>

                            {/* Kiosk Extras */}
                            {kioskExtras > 0 && (
                                   <div className="flex items-center justify-between text-sm">
                                          <span className="text-white/60 font-medium flex items-center gap-2">
                                                 <span className="text-brand-green">🛒</span>
                                                 Extras kiosco
                                          </span>
                                          <span className="text-brand-green font-bold font-mono">
                                                 +${kioskExtras.toLocaleString()}
                                          </span>
                                   </div>
                            )}

                            {/* Divider */}
                            <div className="border-t border-white/5 my-2" />

                            {/* Subtotal */}
                            <div className="flex items-center justify-between text-sm">
                                   <span className="text-white/80 font-semibold">Subtotal</span>
                                   <span className="text-white font-bold font-mono text-base">
                                          ${total.toLocaleString()}
                                   </span>
                            </div>

                            {/* Paid */}
                            {paid > 0 && (
                                   <div className="flex items-center justify-between text-sm">
                                          <span className="text-green-400/80 font-medium flex items-center gap-2">
                                                 <span>✓</span>
                                                 Pagado
                                          </span>
                                          <span className="text-green-400 font-bold font-mono">
                                                 -${paid.toLocaleString()}
                                          </span>
                                   </div>
                            )}

                            {/* Heavy Divider */}
                            <div className="border-t-2 border-white/10 my-3" />

                            {/* Balance */}
                            <div className={cn(
                                   "flex items-center justify-between px-3 py-3 sm:p-4 rounded-xl border-2 transition-all",
                                   balance > 0
                                          ? "bg-yellow-500/5 border-yellow-500/30"
                                          : "bg-green-500/5 border-green-500/30"
                            )}>
                                   <span className={cn(
                                          "font-black text-sm uppercase tracking-widest",
                                          balance > 0 ? "text-yellow-400" : "text-green-400"
                                   )}>
                                          {balance > 0 ? "Saldo Pendiente" : "Totalmente Pagado"}
                                   </span>
                                   <span className={cn(
                                          "font-black font-mono text-xl sm:text-2xl",
                                          balance > 0 ? "text-yellow-400" : "text-green-400"
                                   )}>
                                          ${balance.toLocaleString()}
                                   </span>
                            </div>
                     </div>

                     {/* Payment Progress Bar */}
                     {total > 0 && (
                            <div className="space-y-2">
                                   <div className="flex items-center justify-between text-xs text-white/40 font-bold uppercase tracking-wider">
                                          <span>Progreso de pago</span>
                                          <span>{Math.round((paid / total) * 100)}%</span>
                                   </div>
                                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                          <div
                                                 className="h-full bg-gradient-to-r from-brand-blue to-brand-green transition-all duration-500 ease-out"
                                                 style={{ width: `${Math.min((paid / total) * 100, 100)}%` }}
                                          />
                                   </div>
                            </div>
                     )}

                     {/* Quick Stats */}
                     <div className="grid grid-cols-3 gap-3">
                            <div className="bg-bg-dark/30 rounded-xl p-3 text-center border border-white/5">
                                   <div className="text-2xl mb-1">💰</div>
                                   <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Total</div>
                                   <div className="text-white font-black font-mono text-sm">
                                          ${total.toLocaleString()}
                                   </div>
                            </div>

                            <div className="bg-bg-dark/30 rounded-xl p-3 text-center border border-white/5">
                                   <div className="text-2xl mb-1">✅</div>
                                   <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Pagado</div>
                                   <div className="text-green-400 font-black font-mono text-sm">
                                          ${paid.toLocaleString()}
                                   </div>
                            </div>

                            <div className="bg-bg-dark/30 rounded-xl p-3 text-center border border-white/5">
                                   <div className="text-2xl mb-1">⏳</div>
                                   <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Resta</div>
                                   <div className="text-yellow-400 font-black font-mono text-sm">
                                          ${balance.toLocaleString()}
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
