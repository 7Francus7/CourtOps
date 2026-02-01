'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { format, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { useBookingManagement } from '@/hooks/useBookingManagement'
import {
       payBooking,
       manageSplitPlayers,
       generatePaymentLink
} from '@/actions/manageBooking'
import { toggleOpenMatch } from '@/actions/matchmaking'
import { getCourts } from '@/actions/turnero'
import { cn } from '@/lib/utils'
import { KioskTab } from './booking/KioskTab'
import { PlayersTab } from './booking/PlayersTab'
import { PaymentActions } from './booking/PaymentActions'
import { Booking } from '@/types/booking'
import { MessagingService } from '@/lib/messaging'
import { Haptics } from '@/lib/haptics'
import { createPortal } from 'react-dom'
import {
       X,
       AlertTriangle,
       Calendar,
       Clock,
       Trophy,
       Users,
       Banknote,
       MessageCircle,
       Store,
       Loader2,
       Trash2,
       Share2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

type Props = {
       booking: any | null
       onClose: () => void
       onUpdate: () => void
}

export default function BookingManagementModal({ booking: initialBooking, onClose, onUpdate }: Props) {
       const { t } = useLanguage()

       // Use Custom Hook
       const {
              booking,
              products,
              loading: hookLoading,
              error: hookError,
              refreshBooking,
              actions: { cancel, addItem, removeItem }
       } = useBookingManagement(initialBooking?.id, initialBooking)

       // Local loading state for actions not covered by hook (payments, etc)
       const [localLoading, setLocalLoading] = useState(false)
       const loading = hookLoading || localLoading

       // Global State
       const [courts, setCourts] = useState<any[]>([])

       const [isOpenMatch, setIsOpenMatch] = useState(false)
       const [matchDetails, setMatchDetails] = useState({
              level: '7ma',
              gender: 'Masculino',
              missing: 1
       })

       // UI State
       const [activeTab, setActiveTab] = useState<'gestion' | 'kiosco' | 'jugadores'>('gestion')
       const [paymentAmount, setPaymentAmount] = useState<string>("")
       const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
       const [mounted, setMounted] = useState(false)

       // Split Players State
       const [splitPlayers, setSplitPlayers] = useState<any[]>([])

       // Initial Load
       useEffect(() => {
              setMounted(true)
              getCourts().then(setCourts).catch(e => console.error(e))
              if (initialBooking?.id) {
                     refreshBooking()
              }
              return () => setMounted(false)
       }, [initialBooking?.id, refreshBooking])

       // Sync state from booking update
       useEffect(() => {
              if (booking) {
                     // Sync Open Match State
                     setIsOpenMatch(booking.isOpenMatch || false)
                     setMatchDetails({
                            level: booking.matchLevel || '7ma',
                            gender: booking.matchGender || 'Masculino',
                            missing: 1
                     })

                     // Sync Players
                     const existingPlayers = (booking as any).players || []
                     if (existingPlayers.length > 0) {
                            setSplitPlayers(existingPlayers)
                     } else {
                            setSplitPlayers([
                                   { name: booking.client?.name || 'Titular', amount: 0, isPaid: false },
                                   { name: 'Jugador 2', amount: 0, isPaid: false },
                                   { name: 'Jugador 3', amount: 0, isPaid: false },
                                   { name: 'Jugador 4', amount: 0, isPaid: false }
                            ])
                     }
              }
       }, [booking])

       const handleToggleOpenMatch = async () => {
              setLocalLoading(true)
              try {
                     const newStatus = !isOpenMatch
                     const result = await toggleOpenMatch(booking.id, newStatus, {
                            matchLevel: matchDetails.level,
                            matchGender: matchDetails.gender,
                            description: `Partido de ${matchDetails.gender} - Categ. ${matchDetails.level}`
                     })

                     if (result.success) {
                            setIsOpenMatch(newStatus)
                            toast.success(newStatus ? 'Partido abierto al público' : 'Partido cerrado')
                            refreshBooking()
                            onUpdate()
                     } else {
                            toast.error('Error al actualizar estado')
                            setLocalLoading(false) // revert local loading if error
                     }
              } catch (err) {
                     toast.error('Ocurrió un error inesperado')
              } finally {
                     setLocalLoading(false)
              }
       }

       const handleCancel = async () => {
              if (!booking?.id) return
              if (!confirm(t('confirm_cancel'))) return

              const success = await cancel()
              if (success) {
                     onUpdate()
                     onClose()
              }
       }

       // --- ACTIONS ---
       const handleAddItem = async (productId: number, quantity: number, playerName?: string) => {
              await addItem(productId, quantity, playerName)
       }

       const handleRemoveItem = async (itemId: number) => {
              await removeItem(itemId)
       }

       const handlePayment = async (amountOverride?: number) => {
              const amount = amountOverride || Number(paymentAmount)
              if (!amount || amount <= 0) return toast.warning(t('invalid_amount'))

              setLocalLoading(true)
              const res = await payBooking(booking.id, amount, paymentMethod)
              setLocalLoading(false)

              if (res.success) {
                     toast.success(`${t('payment_success')}: $${amount}`)
                     setPaymentAmount("")
                     refreshBooking()
                     onUpdate()
              } else {
                     toast.error((res as any).error || t('error_processing_payment'))
              }
       }

       const handleSaveSplit = async (updatedPlayers: any[]) => {
              setLocalLoading(true)
              const res = await manageSplitPlayers(booking.id, updatedPlayers)
              setLocalLoading(false)
              if (res.success) {
                     toast.success('Jugadores actualizados')
                     refreshBooking()
              }
       }

       const handleGenerateLink = async (amount: number) => {
              if (!amount || amount <= 0) return toast.warning(t('invalid_amount'))
              setLocalLoading(true)
              const res = await generatePaymentLink(booking.id, amount)
              setLocalLoading(false)
              if (res.success && res.url) {
                     navigator.clipboard.writeText(res.url)
                     toast.success(t('link_copied'))
              } else {
                     toast.error(res.error || t('error_generating_link'))
              }
       }

       // --- ADAPTER ---
       const adaptedBooking: Booking | null = useMemo(() => {
              if (!booking) return null

              const itemsTotal = booking.items?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0) || 0
              const totalPaid = booking.transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0

              const start = new Date(booking.startTime)
              const end = new Date(booking.endTime)

              if (isNaN(start.getTime()) || isNaN(end.getTime())) return null

              const duration = differenceInMinutes(end, start) || 90

              const mappedProducts = (booking.items || []).map((item: any) => ({
                     id: item.id,
                     productId: item.productId || 0,
                     productName: item.product?.name || 'Producto',
                     quantity: item.quantity,
                     unitPrice: item.unitPrice,
                     playerName: item.playerName,
                     subtotal: item.unitPrice * item.quantity
              }))

              return {
                     id: booking.id,
                     clientId: booking.clientId || 0,
                     courtId: booking.courtId,
                     client: {
                            id: booking.clientId || 0,
                            name: booking.client?.name || 'Cliente',
                            phone: booking.client?.phone || '',
                            email: booking.client?.email || ''
                     },
                     schedule: {
                            date: start,
                            startTime: start,
                            endTime: end,
                            duration: duration,
                            courtId: booking.courtId,
                            courtName: booking.court?.name || `Cancha ${booking.courtId}`
                     },
                     pricing: {
                            basePrice: booking.price,
                            kioskExtras: itemsTotal,
                            total: booking.price + itemsTotal,
                            paid: totalPaid,
                            balance: (booking.price + itemsTotal) - totalPaid
                     },
                     status: booking.status as any,
                     paymentStatus: booking.paymentStatus as any,
                     transactions: booking.transactions || [],
                     products: mappedProducts,
                     players: splitPlayers || [],
                     metadata: {
                            createdAt: new Date(booking.createdAt),
                            updatedAt: new Date(booking.updatedAt || booking.createdAt)
                     }
              }
       }, [booking, splitPlayers])

       const handleShareMatch = () => {
              if (!adaptedBooking) return

              const { schedule, players } = adaptedBooking
              const formattedDate = format(schedule.startTime, "EEEE d 'de' MMMM", { locale: es })
              const formattedTime = format(schedule.startTime, "HH:mm")

              const playerList = players.map((p: any) => `- ${p.name || 'Jugador'}`).join('\n')

              const text = `🎾 *PARTIDO CONFIRMADO* 🎾\n\n📅 *Fecha:* ${formattedDate}\n⏰ *Hora:* ${formattedTime}hs\n📍 *Cancha:* ${schedule.courtName}\n\n👥 *Jugadores:*\n${playerList}\n\n¡Nos vemos en la cancha! 🚀`

              navigator.clipboard.writeText(text)
              toast.success('¡Invitación copiada al portapapeles!')
              Haptics.success()
       }

       if (!booking || !adaptedBooking || !mounted) return null

       const { client, schedule, pricing } = adaptedBooking
       const formattedDate = format(schedule.startTime, "EEEE d 'de' MMMM", { locale: es })
       const formattedTime = format(schedule.startTime, "HH:mm")
       const balance = pricing.balance
       const isPaid = balance <= 0

       return createPortal(
              <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4">
                     <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={onClose}
                     />
                     <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative z-10 w-full md:max-w-5xl h-[100dvh] md:h-[85vh] bg-background dark:bg-background md:rounded-3xl shadow-2xl overflow-hidden border-t md:border border-border/80 flex flex-col md:flex-row"
                     >
                            {/* MOBILE HEADER (Visible only on small screens) */}
                            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#121214]">
                                   <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-foreground font-bold shadow-lg">
                                                 {client.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                                 <h2 className="text-foreground font-bold text-sm truncate max-w-[150px]">{client.name}</h2>
                                                 <span className="text-[10px] text-muted-foreground/60 block">{schedule.courtName} • {formattedTime}hs</span>
                                          </div>
                                   </div>
                                   <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-muted-foreground/60 hover:text-foreground">
                                          <X size={20} />
                                   </button>
                            </div>

                            {/* MOBILE TABS (Visible only on small screens) */}
                            <div className="md:hidden flex overflow-x-auto border-b border-white/5 bg-[#09090B]">
                                   <button onClick={() => setActiveTab('gestion')} className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors", activeTab === 'gestion' ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-muted-foreground")}>
                                          Resumen
                                   </button>
                                   <button onClick={() => setActiveTab('jugadores')} className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors", activeTab === 'jugadores' ? "border-purple-500 text-purple-500" : "border-transparent text-muted-foreground")}>
                                          Jugadores
                                   </button>
                                   <button onClick={() => setActiveTab('kiosco')} className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors", activeTab === 'kiosco' ? "border-emerald-500 text-emerald-500" : "border-transparent text-muted-foreground")}>
                                          Kiosco
                                   </button>
                            </div>
                            {/* SIDEBAR NAVIGATION (Desktop Only) */}
                            <div className="hidden md:flex w-72 bg-slate-50/50 dark:bg-[#121214] border-r border-slate-200 dark:border-white/10 flex-col p-6 shrink-0 relative overflow-hidden backdrop-blur-xl">
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                                   <div className="flex items-center gap-4 mb-10 relative z-10">
                                          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-[var(--primary)]/20 uppercase ring-4 ring-white dark:ring-white/5">
                                                 {client.name.charAt(0)}
                                          </div>
                                          <div className="min-w-0">
                                                 <h2 className="text-slate-900 dark:text-foreground font-black tracking-tight truncate leading-tight text-lg">{client.name}</h2>
                                                 <div className="flex gap-2 mt-1">
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-widest leading-none bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                                               {schedule.courtName}
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>

                                   <nav className="flex-1 space-y-2.5 relative z-10">
                                          <button
                                                 onClick={() => setActiveTab('gestion')}
                                                 className={cn(
                                                        "w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all group border",
                                                        activeTab === 'gestion'
                                                               ? "bg-white dark:bg-white/5 text-slate-900 dark:text-foreground shadow-lg shadow-slate-200/50 dark:shadow-none border-slate-200/50 dark:border-white/10"
                                                               : "border-transparent text-slate-400 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                                 )}
                                          >
                                                 <Banknote size={18} className={cn("transition-colors", activeTab === 'gestion' ? "text-[var(--primary)]" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300")} />
                                                 {t('summary_payment')}
                                          </button>
                                          <button
                                                 onClick={() => setActiveTab('jugadores')}
                                                 className={cn(
                                                        "w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all group border",
                                                        activeTab === 'jugadores'
                                                               ? "bg-white dark:bg-white/5 text-slate-900 dark:text-foreground shadow-lg shadow-slate-200/50 dark:shadow-none border-slate-200/50 dark:border-white/10"
                                                               : "border-transparent text-slate-400 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                                 )}
                                          >
                                                 <Users size={18} className={cn("transition-colors", activeTab === 'jugadores' ? "text-purple-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300")} />
                                                 {t('players')}
                                          </button>
                                          <button
                                                 onClick={() => setActiveTab('kiosco')}
                                                 className={cn(
                                                        "w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all group border",
                                                        activeTab === 'kiosco'
                                                               ? "bg-white dark:bg-white/5 text-slate-900 dark:text-foreground shadow-lg shadow-slate-200/50 dark:shadow-none border-slate-200/50 dark:border-white/10"
                                                               : "border-transparent text-slate-400 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                                 )}
                                          >
                                                 <Store size={18} className={cn("transition-colors", activeTab === 'kiosco' ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300")} />
                                                 {t('kiosco')}
                                          </button>
                                   </nav>

                                   <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10 relative z-10">
                                          <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
                                                 <p className="text-[10px] text-slate-400 dark:text-muted-foreground font-black uppercase tracking-[0.2em] mb-4">{t('booking_status')}</p>
                                                 <div className="flex justify-between items-center mb-2">
                                                        <span className="text-slate-400 dark:text-muted-foreground/60 text-[10px] font-black uppercase tracking-wider">{t('status')}</span>
                                                        {pricing.total === 0 ? (
                                                               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{t('free')}</span>
                                                        ) : (
                                                               <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border", isPaid ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20")}>
                                                                      {isPaid ? t('completed_status') : t('pending_status')}
                                                               </span>
                                                        )}
                                                 </div>
                                                 <div className="flex justify-between items-center">
                                                        <span className="text-slate-400 dark:text-muted-foreground/60 text-[10px] font-black uppercase tracking-wider">{t('total')}</span>
                                                        <span className="text-lg font-black text-slate-900 dark:text-foreground tracking-tighter">${pricing.total.toLocaleString()}</span>
                                                 </div>
                                          </div>

                                          <button
                                                 onClick={handleCancel}
                                                 disabled={loading}
                                                 className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/20 disabled:opacity-50"
                                          >
                                                 {loading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                                 {t('cancel_booking')}
                                          </button>

                                          <button
                                                 onClick={onClose}
                                                 className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground py-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                          >
                                                 <X size={14} />
                                                 {t('close_window')}
                                          </button>
                                   </div>
                            </div>

                            {/* MAIN CONTENT AREA */}
                            <div className="flex-1 bg-[#F8FAFC] dark:bg-background flex flex-col min-w-0 overflow-hidden relative">

                                   {/* Header Info Bar (Desktop Only) */}
                                   <div className="hidden md:flex h-16 border-b border-white/5 items-center justify-between px-8 bg-[#09090B]/50 backdrop-blur-md sticky top-0 z-20">
                                          <div className="flex items-center gap-6">
                                                 <div className="flex items-center gap-2 text-muted-foreground/60 text-sm font-medium">
                                                        <Calendar className="w-4 h-4 text-[var(--primary)]" />
                                                        <span className="capitalize">{formattedDate}</span>
                                                 </div>
                                                 <div className="w-px h-4 bg-white/10" />
                                                 <div className="flex items-center gap-2 text-muted-foreground/60 text-sm font-medium">
                                                        <Clock className="w-4 h-4 text-[var(--primary)]" />
                                                        <span>{formattedTime}hs</span>
                                                 </div>
                                          </div>

                                          <div className="flex gap-2">
                                                 <button
                                                        onClick={handleShareMatch}
                                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-indigo-200 dark:border-indigo-500/20"
                                                 >
                                                        <Share2 size={14} /> Invitación
                                                 </button>
                                                 <button
                                                        onClick={() => {
                                                               const phone = client.phone
                                                               if (phone && adaptedBooking) {
                                                                      const text = MessagingService.generateBookingMessage(adaptedBooking, 'reminder')
                                                                      const url = MessagingService.getWhatsAppUrl(phone, text)
                                                                      window.open(url, '_blank')
                                                               } else {
                                                                      toast.error('No hay teléfono registrado')
                                                               }
                                                        }}
                                                        className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                                                 >
                                                        <MessageCircle size={14} /> WhatsApp
                                                 </button>
                                          </div>
                                   </div>

                                   {/* Content Scrollable */}
                                   <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24 md:pb-8">
                                          {activeTab === 'gestion' && (
                                                 <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="max-w-2xl mx-auto space-y-8"
                                                 >
                                                        {/* Status Card */}
                                                        <div className="bg-white dark:bg-card rounded-3xl p-8 border border-slate-200 dark:border-white/5 mb-8 shadow-sm">
                                                               <div className="flex items-center justify-between mb-4">
                                                                      <span className="text-slate-400 dark:text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em]">{t('payment_status')}</span>
                                                                      {pricing.total === 0 ? (
                                                                             <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20">
                                                                                    {t('free')}
                                                                             </span>
                                                                      ) : (
                                                                             <span className={cn("px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border", isPaid ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-200 dark:border-emerald-500/20" : "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-200 dark:border-orange-500/20")}>
                                                                                    {isPaid ? t('completed_status') : t('pending_status')}
                                                                             </span>
                                                                      )}
                                                               </div>
                                                               <div className="flex items-baseline gap-2">
                                                                      <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                                             ${balance.toLocaleString()}
                                                                      </span>
                                                                      <span className="text-slate-400 dark:text-muted-foreground font-bold text-sm uppercase tracking-wider">{t('remaining')}</span>
                                                               </div>
                                                               <div className="w-full bg-slate-100 dark:bg-black/40 h-4 rounded-full mt-6 overflow-hidden relative shadow-inner p-1">
                                                                      {pricing.total > 0 && (
                                                                             <div
                                                                                    className={cn("h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden", isPaid ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-orange-400 to-orange-600")}
                                                                                    style={{ width: `${Math.min((pricing.paid / pricing.total) * 100, 100)}%` }}
                                                                             >
                                                                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                                                                             </div>
                                                                      )}
                                                                      {pricing.total === 0 && (
                                                                             <div className="h-full w-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
                                                                      )}
                                                               </div>
                                                               <p className="text-slate-500 dark:text-muted-foreground text-xs mt-4 font-medium">
                                                                      {pricing.total === 0
                                                                             ? t('no_cost_booking')
                                                                             : (balance > 0 ? t('client_owes') : t('fully_paid'))
                                                                      }
                                                               </p>
                                                        </div>

                                                        {/* Payment Actions */}
                                                        {balance > 0 && (
                                                               <PaymentActions
                                                                      bookingId={adaptedBooking.id}
                                                                      balance={balance}
                                                                      onPaymentSuccess={() => {
                                                                             refreshBooking()
                                                                             onUpdate()
                                                                      }}
                                                               />
                                                        )}

                                                        {/* OPEN MATCH / PARTIDO ABIERTO */}
                                                        <div className={cn("border rounded-3xl p-6 transition-all mb-8 relative overflow-hidden", isOpenMatch ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20" : "bg-white dark:bg-card border-slate-200 dark:border-white/5")}>
                                                               {isOpenMatch && (
                                                                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                                                               )}
                                                               <div className="flex items-center justify-between mb-6 relative z-10">
                                                                      <h3 className={cn("font-black text-sm uppercase tracking-widest flex items-center gap-2", isOpenMatch ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-muted-foreground")}>
                                                                             <Users className={cn("w-4 h-4", isOpenMatch ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-muted-foreground")} />
                                                                             {t('open_match')}
                                                                      </h3>
                                                                      <div className="flex items-center gap-3">
                                                                             <span className={cn("text-[10px] uppercase font-black tracking-widest", isOpenMatch ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-muted-foreground")}>{isOpenMatch ? t('visible') : t('hidden')}</span>
                                                                             <button
                                                                                    onClick={handleToggleOpenMatch}
                                                                                    disabled={loading}
                                                                                    className={cn("w-12 h-6 rounded-full relative transition-all shadow-inner", isOpenMatch ? "bg-blue-500" : "bg-slate-200 dark:bg-white/10")}
                                                                             >
                                                                                    <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm", isOpenMatch ? "left-7" : "left-1")} />
                                                                             </button>
                                                                      </div>
                                                               </div>

                                                               {isOpenMatch ? (
                                                                      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 relative z-10">
                                                                             <div className="space-y-1.5">
                                                                                    <label className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider">{t('level')}</label>
                                                                                    <select
                                                                                           className="w-full bg-white dark:bg-[#09090B] border border-blue-200 dark:border-blue-500/20 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                                                                                           value={matchDetails.level}
                                                                                           onChange={(e) => setMatchDetails({ ...matchDetails, level: e.target.value })}
                                                                                    >
                                                                                           {['8va', '7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra'].map(l => (
                                                                                                  <option key={l} value={l}>{l}</option>
                                                                                           ))}
                                                                                    </select>
                                                                             </div>
                                                                             <div className="space-y-1.5">
                                                                                    <label className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider">{t('gender')}</label>
                                                                                    <select
                                                                                           className="w-full bg-white dark:bg-[#09090B] border border-blue-200 dark:border-blue-500/20 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                                                                                           value={matchDetails.gender}
                                                                                           onChange={(e) => setMatchDetails({ ...matchDetails, gender: e.target.value })}
                                                                                    >
                                                                                           <option value="Masculino">Masculino</option>
                                                                                           <option value="Femenino">Femenino</option>
                                                                                           <option value="Mixto">Mixto</option>
                                                                                    </select>
                                                                             </div>
                                                                             <div className="col-span-2 mt-2">
                                                                                    <button
                                                                                           onClick={handleToggleOpenMatch}
                                                                                           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                                                                                    >
                                                                                           {t('update_data')}
                                                                                    </button>
                                                                             </div>
                                                                      </div>
                                                               ) : (
                                                                      <p className="text-slate-500 dark:text-muted-foreground text-xs font-medium leading-relaxed">Activa esta opción si faltan jugadores. El partido aparecerá en la sección pública para que otros se sumen.</p>
                                                               )}
                                                        </div>

                                                        {/* Detail Breakdown */}
                                                        <div className="space-y-4">
                                                               <h3 className="text-slate-400 dark:text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] pl-1">{t('consumption_details')}</h3>
                                                               <div className="bg-white dark:bg-card rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 divide-y divide-slate-100 dark:divide-white/5 shadow-sm">
                                                                      <div className="p-5 flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                                             <div className="flex items-center gap-4">
                                                                                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
                                                                                           <Trophy size={18} />
                                                                                    </div>
                                                                                    <div>
                                                                                           <p className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-tight">{t('court_rental')}</p>
                                                                                           <p className="text-slate-400 dark:text-muted-foreground text-[10px] font-bold uppercase tracking-wider mt-0.5">90 {t('minutes')} • {schedule.courtName}</p>
                                                                                    </div>
                                                                             </div>
                                                                             <span className="text-slate-900 dark:text-white font-black text-lg tracking-tighter">${pricing.basePrice.toLocaleString()}</span>
                                                                      </div>

                                                                      {adaptedBooking.products.map(item => (
                                                                             <div key={item.id} className="p-5 flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                                                    <div className="flex items-center gap-4">
                                                                                           <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                                                                                  <Store size={18} />
                                                                                           </div>
                                                                                           <div>
                                                                                                  <p className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-tight">{item.productName} <span className="text-purple-500 ml-1">x{item.quantity}</span></p>
                                                                                                  <p className="text-slate-400 dark:text-muted-foreground text-[10px] font-bold uppercase tracking-wider mt-0.5">{item.playerName ? `${t('for')}: ${item.playerName}` : t('general')}</p>
                                                                                           </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4">
                                                                                           <span className="text-slate-900 dark:text-white font-black text-lg tracking-tighter">${item.subtotal.toLocaleString()}</span>
                                                                                           <button
                                                                                                  onClick={() => handleRemoveItem(item.id)}
                                                                                                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                                                           >
                                                                                                  <Trash2 size={16} />
                                                                                           </button>
                                                                                    </div>
                                                                             </div>
                                                                      ))}

                                                                      <div className="p-6 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                                                                             <span className="text-slate-500 dark:text-muted-foreground font-black tracking-[0.2em] text-[10px] uppercase">{t('total').toUpperCase()}</span>
                                                                             <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">${pricing.total.toLocaleString()}</span>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Mobile Cancel Button */}
                                                        <div className="md:hidden pt-4 pb-8">
                                                               <button
                                                                      onClick={handleCancel}
                                                                      disabled={loading}
                                                                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                                               >
                                                                      {loading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                                                      {t('cancel_booking')}
                                                               </button>
                                                        </div>
                                                 </motion.div>
                                          )}

                                          {activeTab === 'kiosco' && (
                                                 <KioskTab
                                                        products={products}
                                                        items={adaptedBooking.products.map(p => ({
                                                               id: p.id,
                                                               product: { id: p.productId, name: p.productName, price: p.unitPrice, category: '', stock: 0 },
                                                               quantity: p.quantity,
                                                               unitPrice: p.unitPrice,
                                                               playerName: p.playerName
                                                        }))}
                                                        loading={loading}
                                                        onAddItem={handleAddItem}
                                                        onRemoveItem={handleRemoveItem}
                                                        players={splitPlayers.map(p => p.name)}
                                                 />
                                          )}

                                          {activeTab === 'jugadores' && (
                                                 <PlayersTab
                                                        bookingId={booking.id}
                                                        totalAmount={pricing.total}
                                                        baseBookingPrice={pricing.basePrice}
                                                        kioskItems={adaptedBooking.products}
                                                        players={splitPlayers}
                                                        setPlayers={setSplitPlayers}
                                                        onSave={async () => {
                                                               await handleSaveSplit(splitPlayers)
                                                        }}
                                                        loading={loading}
                                                 />
                                          )}
                                   </div>
                            </div>
                     </motion.div>
              </div>,
              document.body
       )
}
