import { BookingPricing } from '@/types/booking'
import { cn } from '@/lib/utils'

interface PricingPanelProps {
       pricing: BookingPricing
       className?: string
}

export default function PricingPanel({ pricing, className }: PricingPanelProps) {
       const { basePrice, kioskExtras, total, paid, balance } = pricing

       return (
              <div className={cn("", className)}>
                     <div className="bg-bg-dark/30 rounded-xl border border-white/5 p-4 space-y-2">
                            {/* Base Price */}
                            <div className="flex items-center justify-between text-xs text-white/60">
                                   <span>Precio turno</span>
                                   <span className="">${basePrice.toLocaleString()}</span>
                            </div>

                            {/* Kiosk Extras */}
                            {kioskExtras > 0 && (
                                   <div className="flex items-center justify-between text-xs text-brand-green/80">
                                          <span className="flex items-center gap-1.5">
                                                 <span>🛒</span> Extras
                                          </span>
                                          <span className="">+${kioskExtras.toLocaleString()}</span>
                                   </div>
                            )}

                            {/* Divider with Subtotal if needed, or just jump to summary */}
                            <div className="border-t border-white/5 my-2" />

                            {/* Totals */}
                            <div className="flex items-center justify-between text-sm">
                                   <span className="text-white font-bold">Total</span>
                                   <span className="text-white font-bold">${total.toLocaleString()}</span>
                            </div>

                            {/* Paid */}
                            {paid > 0 && (
                                   <div className="flex items-center justify-between text-xs text-green-400">
                                          <span>Pagado</span>
                                          <span className="">-${paid.toLocaleString()}</span>
                                   </div>
                            )}

                            {/* Pending - Only distinct if not 0 */}
                            {balance > 0 && (
                                   <div className="flex items-center justify-between text-sm mt-1 pt-2 border-t border-white/5">
                                          <span className="text-yellow-400 font-black uppercase tracking-wider text-xs">Falta Pagar</span>
                                          <span className="text-yellow-400 font-black text-lg">${balance.toLocaleString()}</span>
                                   </div>
                            )}
                     </div>
              </div>
       )
}
