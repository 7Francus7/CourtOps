import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { Booking, getStatusColor } from '@/types/booking'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

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
              <div className="relative p-4 pb-4 sm:p-6 sm:pb-8 bg-gradient-to-br from-brand-blue/5 via-white/50 to-brand-green/5 dark:from-blue-500/10 dark:via-zinc-900/50 dark:to-emerald-500/10 border-b border-border backdrop-blur-xl">

                     {/* Background Pattern */}
                     <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                            <div className="absolute inset-0" style={{
                                   backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                                   backgroundSize: '24px 24px'
                            }} />
                     </div>

                     <div className="relative">
                            {/* Top Row: Avatar + Name + Status */}
                            <div className="flex items-start justify-between mb-4 sm:mb-6">
                                   <div className="flex items-center gap-4 sm:gap-5">
                                          {/* Avatar */}
                                          <div className="group relative">
                                                 <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-brand-green rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                                 <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-green p-[2px]">
                                                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#121214] flex items-center justify-center">
                                                               <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-blue to-brand-green font-black text-lg sm:text-2xl">
                                                                      {initials}
                                                               </span>
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Client Info */}
                                          <div className="min-w-0 py-1">
                                                 <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight truncate">
                                                        {client.name}
                                                 </h2>
                                                 <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                                                        <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-500 dark:text-muted-foreground truncate border border-slate-200 dark:border-white/5">{client.phone}</span>
                                                        {client.email && (
                                                               <span className="text-slate-400 dark:text-muted-foreground/60 hidden sm:inline">{client.email}</span>
                                                        )}
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Status Badge */}
                                   <div className={cn(
                                          "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg flex-shrink-0 backdrop-blur-md",
                                          getStatusColor(status)
                                   )}>
                                          {t(`status_${status}`)}
                                   </div>
                            </div>

                            {/* Alert Badges */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                   {pricing.balance > 0 && (
                                          <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                 {t('pending_balance_alert')}: ${pricing.balance.toLocaleString()}
                                          </div>
                                   )}

                                   {isToday && (
                                          <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center gap-2">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                 {t('booking_today')}
                                          </div>
                                   )}

                                   {isPast && status !== 'COMPLETED' && status !== 'CANCELED' && (
                                          <div className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                 {t('booking_expired')}
                                          </div>
                                   )}
                            </div>

                            {/* Schedule Info */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 backdrop-blur-sm">
                                   <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
                                          <div className="flex items-center gap-2.5">
                                                 <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-brand-blue">
                                                        🎾
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider">Cancha</p>
                                                        <p className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{schedule.courtName}</p>
                                                 </div>
                                          </div>

                                          <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-white/10" />

                                          <div className="flex items-center gap-2.5">
                                                 <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-emerald-500/10 flex items-center justify-center text-brand-green">
                                                        📅
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider">Fecha</p>
                                                        <p className="font-bold text-slate-700 dark:text-slate-200 capitalize truncate">
                                                               {format(schedule.date, "EEE d MMM", { locale: dateLocale })}
                                                        </p>
                                                 </div>
                                          </div>

                                          <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-white/10" />

                                          <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                                                 <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                        ⏰
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-wider">Horario</p>
                                                        <p className="font-bold text-slate-700 dark:text-slate-200 border-b border-dashed border-slate-300 dark:border-slate-600">
                                                               {format(schedule.startTime, 'HH:mm')} - {format(booking.schedule.endTime, 'HH:mm')} <span className="text-slate-400 dark:text-muted-foreground font-medium">({schedule.duration} min)</span>
                                                        </p>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* WhatsApp Button */}
                                   {onWhatsAppClick && (
                                          <button
                                                 onClick={onWhatsAppClick}
                                                 className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 hover:border-[#25D366]/40 rounded-xl text-[#25D366] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group hover:shadow-lg hover:shadow-[#25D366]/10"
                                          >
                                                 <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
                                                 WhatsApp
                                          </button>
                                   )}
                            </div>
                     </div>
              </div>
       )
}
