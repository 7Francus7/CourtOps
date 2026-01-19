import { ArrowRight, CheckCircle2, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineBooking {
       id: number
       time: string
       courtName: string
       title: string
       status: string
       paymentStatus: 'paid' | 'partial' | 'unpaid'
       price: number
       balance: number
}

export function MobileBookingTimeline({ bookings, onOpenBooking }: { bookings: TimelineBooking[], onOpenBooking: (id: number) => void }) {
       if (!bookings || bookings.length === 0) {
              return (
                     <div className="flex flex-col items-center justify-center py-12 text-white/30 bg-white/5 rounded-2xl border border-dashed border-white/10 m-1">
                            <Clock className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Sin próximas reservas hoy</p>
                     </div>
              )
       }

       return (
              <div className="relative pl-4 space-y-4">
                     {/* Vertical Line */}
                     <div className="absolute top-2 bottom-4 left-[21px] w-px bg-gradient-to-b from-brand-green/50 via-white/10 to-transparent" />

                     {bookings.map((booking, index) => {
                            const isNext = index === 0

                            return (
                                   <div
                                          key={booking.id}
                                          onClick={() => onOpenBooking(booking.id)}
                                          className="relative flex items-start gap-4 group cursor-pointer active:scale-[0.98] transition-all duration-300"
                                   >
                                          {/* Dot Indicator */}
                                          <div className={cn(
                                                 "relative z-10 flex items-center justify-center w-3 h-3 mt-4 rounded-full border-2 ring-4 ring-[#09090b] transition-all duration-500",
                                                 isNext ? "bg-brand-green border-brand-green shadow-[0_0_15px_rgba(var(--secondary-rgb),0.5)] scale-110" : "bg-[#09090b] border-white/30 group-hover:border-brand-green/50 group-hover:bg-brand-green/20"
                                          )}>
                                                 {isNext && <div className="absolute inset-0 bg-brand-green rounded-full animate-ping opacity-75" />}
                                          </div>

                                          {/* Content */}
                                          <div className={cn(
                                                 "flex-1 rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden",
                                                 isNext
                                                        ? "glass-shiny bg-gradient-to-br from-brand-green/5 to-blue-500/5 border-brand-green/30 shadow-[0_0_20px_rgba(var(--secondary-rgb),0.1)]"
                                                        : "glass-card hover:bg-white/[0.07] border-white/5 hover:border-white/10"
                                          )}>
                                                 {/* Status Stripe */}
                                                 <div className={cn(
                                                        "absolute left-0 top-0 bottom-0 w-1 transition-all",
                                                        booking.paymentStatus === 'paid' ? "bg-brand-green" :
                                                               booking.paymentStatus === 'partial' ? "bg-orange-500" : "bg-red-500/50"
                                                 )} />

                                                 <div className="flex justify-between items-start mb-2 pl-2">
                                                        <span className={cn(
                                                               "font-mono text-lg font-black tracking-tight",
                                                               isNext ? "text-brand-green text-shadow-neon" : "text-white/70"
                                                        )}>
                                                               {booking.time}
                                                        </span>
                                                        <span className={cn(
                                                               "text-[9px] uppercase font-black px-2 py-1 rounded-md tracking-wider border",
                                                               booking.paymentStatus === 'paid' ? "bg-brand-green/10 text-brand-green border-brand-green/20" :
                                                                      booking.paymentStatus === 'partial' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                                        )}>
                                                               {booking.paymentStatus === 'paid' ? 'PAGADO' : (booking.paymentStatus === 'partial' ? 'SEÑA' : 'IMPAGO')}
                                                        </span>
                                                 </div>

                                                 <div className="pl-2">
                                                        <h4 className="font-bold text-white text-base mb-0.5 line-clamp-1 group-hover:text-brand-green transition-colors">
                                                               {booking.title}
                                                        </h4>
                                                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-3">{booking.courtName}</p>

                                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                               <div className="text-sm font-mono font-bold text-white/50 group-hover:text-white transition-colors">
                                                                      ${booking.price.toLocaleString()}
                                                               </div>
                                                               <div className={cn(
                                                                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                                                      isNext ? "bg-brand-green text-black shadow-lg shadow-brand-green/20" : "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white"
                                                               )}>
                                                                      <ArrowRight className="w-4 h-4" />
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            )
                     })}
              </div>
       )
}
