import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { Booking, getStatusColor } from '@/types/booking'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { Phone, Calendar, Clock, Trophy, MessageCircle } from 'lucide-react'

interface BookingHeaderProps {
       booking: Booking
       onWhatsAppClick?: () => void
}

export default function BookingHeader({ booking, onWhatsAppClick }: BookingHeaderProps) {
       const { client, schedule, pricing, status } = booking
       const { t, language } = useLanguage()

       const initials = client.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

       const isToday = format(schedule.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
       const dateLocale = language === 'es' ? es : enUS

       return (
              <div className="relative p-6 sm:p-8 border-b border-white/5 overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                     <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                   <div className="flex items-center gap-6">
                                          {/* Compact Avatar */}
                                          <div className="relative">
                                                 <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-xl">
                                                        <span className="text-xl font-black text-white tracking-widest">{initials}</span>
                                                 </div>
                                                 <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black",
                                                        status === 'CONFIRMED' ? "bg-emerald-500" : "bg-orange-500"
                                                 )}></div>
                                          </div>

                                          <div className="space-y-1">
                                                 <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{client.name}</h2>
                                                 <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                                                               <Phone size={10} className="text-zinc-500" />
                                                               <span className="text-zinc-400 font-bold text-[10px] tabular-nums">{client.phone}</span>
                                                        </div>
                                                        {status === 'CONFIRMED' && (
                                                               <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                                                      Confirmado
                                                               </span>
                                                        )}
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="flex items-center gap-3">
                                          {onWhatsAppClick && (
                                                 <button
                                                        onClick={onWhatsAppClick}
                                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider border border-white/10 transition-all flex items-center gap-2"
                                                 >
                                                        <MessageCircle size={14} />
                                                        WhatsApp
                                                 </button>
                                          )}
                                   </div>
                            </div>

                            {/* Minimal Stats Bar */}
                            <div className="grid grid-cols-3 gap-3 mt-8">
                                   <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl flex items-center gap-3">
                                          <Trophy size={14} className="text-zinc-500" />
                                          <div>
                                                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Cancha</p>
                                                 <p className="text-xs font-bold text-white truncate">{schedule.courtName}</p>
                                          </div>
                                   </div>
                                   <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl flex items-center gap-3">
                                          <Calendar size={14} className="text-zinc-500" />
                                          <div>
                                                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Fecha</p>
                                                 <p className="text-xs font-bold text-white capitalize">{format(schedule.date, "d MMM", { locale: dateLocale })}</p>
                                          </div>
                                   </div>
                                   <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl flex items-center gap-3">
                                          <Clock size={14} className="text-zinc-500" />
                                          <div>
                                                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Horario</p>
                                                 <p className="text-xs font-bold text-white">{format(schedule.startTime, 'HH:mm')}</p>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
