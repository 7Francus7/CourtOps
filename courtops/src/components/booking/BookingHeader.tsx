import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { Booking, getStatusColor } from '@/types/booking'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { Phone, Calendar, Clock, Trophy, MapPin, MessageCircle } from 'lucide-react'

interface BookingHeaderProps {
       booking: Booking
       onWhatsAppClick?: () => void
}

export default function BookingHeader({ booking, onWhatsAppClick }: BookingHeaderProps) {
       const { client, schedule, pricing, status } = booking
       const { t, language } = useLanguage()

       // Get initials for avatar
       const initials = client.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

       // Check if booking is today or upcoming
       const isToday = format(schedule.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
       const isPast = schedule.date < new Date()

       const dateLocale = language === 'es' ? es : enUS

       return (
              <div className="relative p-8 sm:p-10 border-b border-white/5 overflow-hidden">
                     {/* Animated Background Gradients */}
                     <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>

                     <div className="relative z-10">
                            {/* Main Info Row */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                   <div className="flex items-center gap-8">
                                          {/* Avatar Section */}
                                          <div className="relative group">
                                                 <div className="absolute inset-0 bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                                 <div className="relative w-24 h-24 rounded-3xl bg-zinc-900 border border-white/10 p-1 shadow-2xl overflow-hidden group-hover:border-primary/50 transition-colors">
                                                        <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center">
                                                               <span className="text-4xl font-black text-white tracking-tighter">
                                                                      {initials}
                                                               </span>
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                 </div>
                                                 <div className="absolute -bottom-2 -right-2">
                                                        <div className={cn(
                                                               "w-6 h-6 rounded-full border-4 border-black animate-pulse shadow-lg",
                                                               status === 'CONFIRMED' ? "bg-emerald-500 shadow-emerald-500/50" : "bg-orange-500 shadow-orange-500/50"
                                                        )}></div>
                                                 </div>
                                          </div>

                                          {/* Client Details */}
                                          <div className="space-y-2">
                                                 <div className="flex items-center gap-4">
                                                        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none">
                                                               {client.name}
                                                        </h2>
                                                 </div>
                                                 <div className="flex flex-wrap items-center gap-3">
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                                                               <Phone size={14} className="text-zinc-500" />
                                                               <span className="text-zinc-300 font-bold text-xs tabular-nums tracking-widest">{client.phone}</span>
                                                        </div>
                                                        {client.email && (
                                                               <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                                                                      <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">{client.email}</span>
                                                               </div>
                                                        )}
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Status & Actions */}
                                   <div className="flex flex-col items-end gap-4">
                                          <div className={cn(
                                                 "px-8 py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-[0.3em] shadow-2xl backdrop-blur-xl transition-all hover:scale-105",
                                                 status === 'CONFIRMED' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-emerald-500/10" :
                                                        status === 'PENDING' ? "bg-orange-500/10 border-orange-500/50 text-orange-500 shadow-orange-500/10" :
                                                               "bg-zinc-900 border-white/10 text-zinc-500 shadow-black"
                                          )}>
                                                 {t(`status_${status}`)}
                                          </div>

                                          {onWhatsAppClick && (
                                                 <button
                                                        onClick={onWhatsAppClick}
                                                        className="flex items-center gap-3 px-6 py-3 bg-[#25D366] text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-[#25D366]/20 hover:brightness-110 active:scale-95 transition-all group"
                                                 >
                                                        <MessageCircle size={18} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                                                        WhatsApp
                                                 </button>
                                          )}
                                   </div>
                            </div>

                            {/* Alert Context Row */}
                            <div className="flex flex-wrap items-center gap-3 mt-10">
                                   {pricing.balance > 0 && (
                                          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-wider animate-pulse">
                                                 <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                 {t('pending_balance_alert')}: ${pricing.balance.toLocaleString()}
                                          </div>
                                   )}
                                   {isToday && (
                                          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-wider">
                                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                 {t('booking_today')}
                                          </div>
                                   )}
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                   <div className="group/stat p-6 bg-zinc-900/40 border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all hover:border-white/10">
                                          <div className="flex items-center gap-4">
                                                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover/stat:text-white group-hover/stat:bg-primary/20 transition-all">
                                                        <Trophy size={20} />
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover/stat:text-primary transition-colors">Cancha</p>
                                                        <p className="text-lg font-black text-white tracking-tight">{schedule.courtName}</p>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="group/stat p-6 bg-zinc-900/40 border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all hover:border-white/10">
                                          <div className="flex items-center gap-4">
                                                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover/stat:text-white group-hover/stat:bg-emerald-500/20 transition-all">
                                                        <Calendar size={20} />
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover/stat:text-emerald-500 transition-colors">Fecha</p>
                                                        <p className="text-lg font-black text-white tracking-tight capitalize">
                                                               {format(schedule.date, "EEE d MMMM", { locale: dateLocale })}
                                                        </p>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="group/stat p-6 bg-zinc-900/40 border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all hover:border-white/10">
                                          <div className="flex items-center gap-4">
                                                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover/stat:text-white group-hover/stat:bg-orange-500/20 transition-all">
                                                        <Clock size={20} />
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover/stat:text-orange-500 transition-colors">Horario</p>
                                                        <p className="text-lg font-black text-white tracking-tight">
                                                               {format(schedule.startTime, 'HH:mm')} - {format(booking.schedule.endTime, 'HH:mm')}
                                                               <span className="ml-2 text-xs text-zinc-600 font-bold">({schedule.duration}m)</span>
                                                        </p>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
