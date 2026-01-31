import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Booking, getStatusColor, getStatusLabel } from '@/types/booking'
import { cn } from '@/lib/utils'

interface BookingHeaderProps {
       booking: Booking
       onWhatsAppClick?: () => void
}

export default function BookingHeader({ booking, onWhatsAppClick }: BookingHeaderProps) {
       const { client, schedule, pricing, status } = booking

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

       return (
              <div className="relative p-4 pb-4 sm:p-6 sm:pb-8 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-green/5 border-b border-white/10">

                     {/* Background Pattern */}
                     <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                   backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                   backgroundSize: '24px 24px'
                            }} />
                     </div>

                     <div className="relative">
                            {/* Top Row: Avatar + Name + Status */}
                            <div className="flex items-start justify-between mb-2 sm:mb-4">
                                   <div className="flex items-center gap-3 sm:gap-4">
                                          {/* Avatar */}
                                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white font-black text-sm sm:text-lg shadow-xl shadow-brand-blue/20 flex-shrink-0">
                                                 {initials}
                                          </div>

                                          {/* Client Info */}
                                          <div className="min-w-0">
                                                 <h2 className="text-lg sm:text-2xl font-black text-white mb-0.5 sm:mb-1 tracking-tight truncate">
                                                        {client.name}
                                                 </h2>
                                                 <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                                        <span className="text-white/40 truncate">{client.phone}</span>
                                                        {client.email && (
                                                               <span className="text-white/40 text-xs hidden sm:inline">| {client.email}</span>
                                                        )}
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Status Badge */}
                                   <div className={cn(
                                          "px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg flex-shrink-0",
                                          getStatusColor(status)
                                   )}>
                                          {getStatusLabel(status)}
                                   </div>
                            </div>

                            {/* Alert Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                   {pricing.balance > 0 && (
                                          <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-xs font-bold flex items-center gap-2">
                                                 <span className="text-base">⚠️</span>
                                                 Saldo pendiente: ${pricing.balance.toLocaleString()}
                                          </div>
                                   )}

                                   {isToday && (
                                          <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-bold flex items-center gap-2">
                                                 <span className="text-base">📅</span>
                                                 Turno hoy
                                          </div>
                                   )}

                                   {isPast && status !== 'COMPLETED' && status !== 'CANCELED' && (
                                          <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                                                 <span className="text-base">🔴</span>
                                                 Turno vencido
                                          </div>
                                   )}
                            </div>

                            {/* Schedule Info */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                                   <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
                                          <div className="flex items-center gap-2 text-white/60">
                                                 <span className="text-brand-blue font-black">🎾</span>
                                                 <span className="font-bold truncate max-w-[100px] sm:max-w-none">{schedule.courtName}</span>
                                          </div>

                                          <div className="hidden sm:block w-px h-4 bg-white/10" />

                                          <div className="flex items-center gap-2 text-white/60">
                                                 <span className="text-brand-green font-black">📅</span>
                                                 <span className="font-bold capitalize truncate">
                                                        {format(schedule.date, "EEE d MMM", { locale: es })}
                                                 </span>
                                          </div>

                                          <div className="hidden sm:block w-px h-4 bg-white/10" />

                                          <div className="flex items-center gap-2 text-white/60 col-span-2 sm:col-span-1">
                                                 <span className="text-yellow-400 font-black">⏰</span>
                                                 <span className="font-bold">
                                                        {format(schedule.startTime, 'HH:mm')} - {format(booking.schedule.endTime, 'HH:mm')} ({schedule.duration} min)
                                                 </span>
                                          </div>
                                   </div>

                                   {/* WhatsApp Button */}
                                   {onWhatsAppClick && (
                                          <button
                                                 onClick={onWhatsAppClick}
                                                 className="w-full sm:w-auto px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group"
                                          >
                                                 <span className="text-base group-hover:scale-110 transition-transform">💬</span>
                                                 WhatsApp
                                          </button>
                                   )}
                            </div>
                     </div>
              </div>
       )
}
