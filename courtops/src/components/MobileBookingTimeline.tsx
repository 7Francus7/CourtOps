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
                     <div className="flex flex-col items-center justify-center py-12 text-white/30">
                            <Clock className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Sin próximas reservas hoy</p>
                     </div>
              )
       }

       return (
              <div className="relative pl-4 space-y-6">
                     {/* Vertical Line */}
                     <div className="absolute top-2 bottom-0 left-[21px] w-px bg-gradient-to-b from-white/20 to-transparent" />

                     {bookings.map((booking, index) => {
                            const isNext = index === 0

                            return (
                                   <div
                                          key={booking.id}
                                          onClick={() => onOpenBooking(booking.id)}
                                          className="relative flex items-start gap-4 active:opacity-70 transition-opacity"
                                   >
                                          {/* Dot Indicator */}
                                          <div className={cn(
                                                 "relative z-10 flex items-center justify-center w-3 h-3 mt-1.5 rounded-full border-2 ring-4 ring-bg-dark",
                                                 isNext ? "bg-brand-green border-brand-green shadow-[0_0_10px_rgba(50,255,126,0.5)]" : "bg-bg-dark border-white/30"
                                          )}>
                                                 {isNext && <div className="absolute inset-0 bg-brand-green rounded-full animate-ping opacity-75" />}
                                          </div>

                                          {/* Content */}
                                          <div className={cn(
                                                 "flex-1 rounded-xl p-3 border transition-all",
                                                 isNext
                                                        ? "bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-lg"
                                                        : "bg-bg-card border-white/5"
                                          )}>
                                                 <div className="flex justify-between items-start mb-1">
                                                        <span className={cn(
                                                               "font-mono text-sm font-bold",
                                                               isNext ? "text-brand-green" : "text-white/70"
                                                        )}>
                                                               {booking.time}
                                                        </span>
                                                        <span className={cn(
                                                               "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md",
                                                               booking.paymentStatus === 'paid' ? "bg-brand-green/10 text-brand-green" :
                                                                      booking.paymentStatus === 'partial' ? "bg-orange-500/10 text-orange-400" : "bg-red-500/10 text-red-400"
                                                        )}>
                                                               {booking.paymentStatus === 'paid' ? 'Pagado' : (booking.paymentStatus === 'partial' ? 'Seña' : 'Impago')}
                                                        </span>
                                                 </div>

                                                 <h4 className="font-bold text-white text-sm mb-0.5 line-clamp-1">{booking.title}</h4>
                                                 <p className="text-xs text-text-grey mb-2">{booking.courtName}</p>

                                                 <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                        <div className="text-xs font-mono text-white/50">
                                                               ${booking.price.toLocaleString()}
                                                        </div>
                                                        <div className="bg-white/5 p-1 rounded-full">
                                                               <ArrowRight className="w-3 h-3 text-white/50" />
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            )
                     })}
              </div>
       )
}
