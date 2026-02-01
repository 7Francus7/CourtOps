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

// Helper for visual differentiation
const getCourtColor = (name: string) => {
       const lower = name.toLowerCase()
       if (lower.includes('1') || lower.includes('uno')) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
       if (lower.includes('2') || lower.includes('dos')) return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
       if (lower.includes('3') || lower.includes('tres')) return 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
       if (lower.includes('4') || lower.includes('cuatro')) return 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
       if (lower.includes('5') || lower.includes('cinco')) return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400'
       if (lower.includes('futbol') || lower.includes('fútbol')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
       return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

export function MobileBookingTimeline({ bookings, onOpenBooking }: { bookings: TimelineBooking[], onOpenBooking: (id: number) => void }) {
       if (!bookings || bookings.length === 0) {
              return (
                     <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-muted-foreground/50 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 m-1">
                            <Clock className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Sin próximas reservas hoy</p>
                     </div>
              )
       }

       return (
              <div className="relative pl-4 space-y-4">
                     {/* Vertical Line */}
                     <div className="absolute top-2 bottom-4 left-[21px] w-px bg-gradient-to-b from-emerald-500/50 via-slate-200 dark:via-white/10 to-transparent" />

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
                                                 "relative z-10 flex items-center justify-center w-3 h-3 mt-4 rounded-full border-2 ring-4 ring-background transition-all duration-500",
                                                 isNext ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30 scale-110" : "bg-background border-slate-300 dark:border-white/30 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/20"
                                          )}>
                                                 {isNext && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />}
                                          </div>

                                          {/* Content */}
                                          <div className={cn(
                                                 "flex-1 rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden",
                                                 isNext
                                                        ? "bg-white dark:bg-white/5 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-emerald-500/5 dark:to-blue-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                                                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 shadow-sm"
                                          )}>
                                                 {/* Status Stripe */}
                                                 <div className={cn(
                                                        "absolute left-0 top-0 bottom-0 w-1 transition-all",
                                                        booking.paymentStatus === 'paid' ? "bg-emerald-500" :
                                                               booking.paymentStatus === 'partial' ? "bg-orange-500" : "bg-red-500"
                                                 )} />

                                                 <div className="flex justify-between items-start mb-2 pl-2">
                                                        <span className={cn(
                                                               "text-lg font-black tracking-tight",
                                                               isNext ? "text-emerald-600 dark:text-emerald-500" : "text-slate-600 dark:text-white/70"
                                                        )}>
                                                               {booking.time}
                                                        </span>
                                                        <span className={cn(
                                                               "text-[9px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider border",
                                                               booking.paymentStatus === 'paid' ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border-emerald-200 dark:border-emerald-500/20" :
                                                                      booking.paymentStatus === 'partial' ? "bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20" : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                                                        )}>
                                                               {booking.paymentStatus === 'paid' ? 'PAGADO' : (booking.paymentStatus === 'partial' ? 'SEÑA' : 'IMPAGO')}
                                                        </span>
                                                 </div>

                                                 <div className="pl-2">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                                                               {booking.title}
                                                        </h4>

                                                        {/* Court Badge */}
                                                        <div className="mb-3">
                                                               <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider border border-transparent dark:border-white/5", getCourtColor(booking.courtName))}>
                                                                      {booking.courtName}
                                                               </span>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                                                               <div className="flex flex-col">
                                                                      <span className="text-sm font-bold text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                                             ${booking.price.toLocaleString()}
                                                                      </span>
                                                                      {booking.balance > 0 && booking.paymentStatus !== 'paid' && (
                                                                             <span className="text-[10px] font-bold text-red-500 animate-pulse">
                                                                                    Debe: ${booking.balance.toLocaleString()}
                                                                             </span>
                                                                      )}
                                                               </div>
                                                               <div className={cn(
                                                                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                                                      isNext ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/30 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-600 dark:group-hover:text-white"
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
