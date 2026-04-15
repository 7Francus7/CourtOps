'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { format, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { useBookingManagement } from '@/hooks/useBookingManagement'
import {
       manageSplitPlayers,
       updateBookingClient,
       sendManualReminder,
       chargePlayer
} from '@/actions/manageBooking'
import { markNoShow, revertNoShow } from '@/actions/no-show'
import { toggleOpenMatch } from '@/actions/matchmaking'
import { useConfirmation } from '@/components/providers/ConfirmationProvider'
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
       Share2,
       Pencil,
       Save,
       Phone,
       Mail,
       Check,
       EyeOff,
       User,
       Plus,
       Repeat,
       Wallet,
       RefreshCw,
       ChevronRight,
       CircleDollarSign,
       Bell,
       BellOff,
        Shield,
        Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface BookingItem {
       id: number
       productId?: number
       product?: { name: string }
       quantity: number
       unitPrice: number
       playerName?: string
}

type Props = {
       booking: Record<string, unknown> | null
       onClose: () => void
       onUpdate: () => void
}

export default function BookingManagementModal({ booking: initialBooking, onClose, onUpdate }: Props) {
       const { t } = useLanguage()
       const confirm = useConfirmation()

       const {
              booking,
              products,
              loading: hookLoading,
              refreshBooking,
              actions: { cancel, cancelSeries, addItem, removeItem }
       } = useBookingManagement(initialBooking?.id as number | undefined, initialBooking)

       const [localLoading, setLocalLoading] = useState(false)
       const loading = hookLoading || localLoading

       const [, setCourts] = useState<Record<string, unknown>[]>([])
       const [isOpenMatch, setIsOpenMatch] = useState(false)
       const [matchDetails, setMatchDetails] = useState({
              level: '7ma',
              gender: 'Masculino',
              missing: 1
       })

       const [activeTab, setActiveTab] = useState<'gestion' | 'kiosco' | 'jugadores'>('gestion')
       const [mounted, setMounted] = useState(false)
       const [splitPlayers, setSplitPlayers] = useState<{ id: string; name: string; amount: number; isPaid: boolean }[]>([])
       const [isEditingClient, setIsEditingClient] = useState(false)
       const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '' })
       const [playerPaymentModal, setPlayerPaymentModal] = useState<{ id: string, name: string, amount: number } | null>(null)

       useEffect(() => {
              setMounted(true)
              getCourts().then(setCourts).catch(e => console.error(e))
              if (initialBooking?.id) {
                     refreshBooking()
              }
              return () => setMounted(false)
       }, [initialBooking?.id, refreshBooking])

       useEffect(() => {
              if (booking) {
                     setIsOpenMatch(booking.isOpenMatch || false)
                     setMatchDetails({
                            level: booking.matchLevel || '7ma',
                            gender: booking.matchGender || 'Masculino',
                            missing: 1
                     })

                     const bookingRec = booking as Record<string, unknown>
                     const existingPlayers = (bookingRec.players as { id?: string; name: string; amount: number; isPaid: boolean }[]) || []
                     if (existingPlayers.length > 0) {
                            setSplitPlayers(existingPlayers.map((p) => ({ ...p, id: p.id || crypto.randomUUID() })))
                     } else {
                            setSplitPlayers([
                                   { id: crypto.randomUUID(), name: booking.client?.name || booking.guestName || 'Titular', amount: 0, isPaid: false },
                                   { id: crypto.randomUUID(), name: 'Jugador 2', amount: 0, isPaid: false },
                                   { id: crypto.randomUUID(), name: 'Jugador 3', amount: 0, isPaid: false },
                                   { id: crypto.randomUUID(), name: 'Jugador 4', amount: 0, isPaid: false }
                            ])
                     }

                     setClientForm({
                            name: booking.client?.name || booking.guestName || '',
                            phone: booking.client?.phone || booking.guestPhone || '',
                            email: booking.client?.email || ''
                     })
              }
       }, [booking])

       const handleUpdateClient = async () => {
              if (!booking?.id) return
              setLocalLoading(true)
              try {
                     const res = await updateBookingClient(booking.id, clientForm)
                     if (res.success) {
                            toast.success('Información del cliente actualizada')
                            setIsEditingClient(false)
                            refreshBooking()
                            onUpdate()
                     } else {
                            toast.error(res.error || 'Error al actualizar cliente')
                     }
              } catch {
                     toast.error('Ocurrió un error inesperado')
              } finally {
                     setLocalLoading(false)
              }
       }

       const handleSendReminder = async () => {
              if (!booking?.id) return
              setLocalLoading(true)
              try {
                     const res = await sendManualReminder(booking.id)
                     if (res.success) {
                            toast.success('Recordatorio enviado correctamente')
                            refreshBooking()
                     } else {
                            toast.error(res.error || 'Error al enviar recordatorio')
                     }
              } catch {
                     toast.error('Ocurrió un error inesperado')
              } finally {
                     setLocalLoading(false)
              }
       }

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
                     }
              } catch {
                     toast.error('Ocurrió un error inesperado')
              } finally {
                     setLocalLoading(false)
              }
       }

       const handleCancel = async () => {
              if (!booking?.id) return
              if (!await confirm({ title: '¿Cancelar reserva?', description: 'Se liberará el horario y se notificará al cliente.', variant: 'destructive', confirmLabel: 'Sí, cancelar' })) return
              const success = await cancel()
              if (success) {
                     onUpdate()
                     onClose()
              }
       }

       const handleCancelSeries = async () => {
              if (!booking?.id) return
              if (!await confirm({ title: '¿Eliminar turno fijo?', description: 'Se cancelarán este y todos los turnos futuros de esta serie. Esta acción no se puede deshacer.', variant: 'destructive', confirmLabel: 'Eliminar serie' })) return
              setLocalLoading(true)
              const success = await cancelSeries()
              if (success) {
                     onUpdate()
                     onClose()
              }
              setLocalLoading(false)
       }

       const handleNoShow = async () => {
              if (!booking?.id) return
              setLocalLoading(true)
              try {
                     if (booking.status === 'NO_SHOW') {
                            const res = await revertNoShow(booking.id)
                            if (res.success) {
                                   toast.success('No-show revertido')
                                   refreshBooking()
                                   onUpdate()
                            } else {
                                   toast.error(res.error || 'Error')
                            }
                     } else {
                            if (!await confirm({ title: '¿Marcar como No-Show?', description: 'Se registrará que el cliente no se presentó a esta reserva.', confirmLabel: 'Marcar No-Show' })) {
                                   setLocalLoading(false)
                                   return
                            }
                            const res = await markNoShow(booking.id)
                            if (res.success) {
                                   toast.success('Reserva marcada como No-Show')
                                   refreshBooking()
                                   onUpdate()
                            } else {
                                   toast.error(res.error || 'Error')
                            }
                     }
              } catch {
                     toast.error('Error inesperado')
              } finally {
                     setLocalLoading(false)
              }
       }

       const handleAddItem = async (productId: number, quantity: number, playerName?: string) => {
              await addItem(productId, quantity, playerName)
       }

       const handleRemoveItem = async (itemId: number) => {
              await removeItem(itemId)
       }

       const handleSaveSplit = async (updatedPlayers: { id: string; name: string; amount: number; isPaid: boolean }[]) => {
              setLocalLoading(true)
              const res = await manageSplitPlayers(booking.id, updatedPlayers)
              setLocalLoading(false)
              if (res.success) {
                     toast.success('Jugadores actualizados')
                     refreshBooking()
              }
       }

       const handleRecalculateSplits = async () => {
              if (!booking) return
              const bookingRecord = booking as Record<string, unknown>
              const items = (bookingRecord.items as BookingItem[] | undefined) || []
              const sharedKioskTotal = items
                     .filter((i: BookingItem) => !i.playerName || i.playerName === 'General' || i.playerName === t('everyone'))
                     .reduce((acc: number, curr: BookingItem) => acc + (curr.unitPrice * curr.quantity), 0)

              const sharedTotal = ((booking as Record<string, unknown>).price as number || 0) + sharedKioskTotal
              const splitAmount = sharedTotal / Math.max(splitPlayers.length, 1)

              const updatedPlayers = splitPlayers.map(p => {
                     if (p.isPaid) return p
                     const individualKioskTotal = items
                            .filter((i: BookingItem) => i.playerName === p.name)
                            .reduce((acc: number, curr: BookingItem) => acc + (curr.unitPrice * curr.quantity), 0)
                     return { ...p, amount: Math.ceil(splitAmount + individualKioskTotal) }
              })

              setSplitPlayers(updatedPlayers)
              await handleSaveSplit(updatedPlayers)
       }

       const adaptedBooking = useMemo((): Booking | null => {
              if (!booking) return null
              const bookingRec = booking as Record<string, unknown>
              const bookingItems = (bookingRec.items as BookingItem[] | undefined) || []
              const bookingTransactions = (bookingRec.transactions as { amount?: number }[] | undefined) || []
              const itemsTotal = bookingItems.reduce((sum: number, item: BookingItem) => sum + (item.unitPrice * item.quantity), 0)
              const totalPaid = bookingTransactions.reduce((sum: number, tx: { amount?: number }) => sum + (tx.amount || 0), 0)

              const start = new Date(booking.startTime)
              const end = new Date(booking.endTime)
              if (isNaN(start.getTime()) || isNaN(end.getTime())) return null

              const duration = differenceInMinutes(end, start) || 90
              const mappedProducts = bookingItems.map((item: BookingItem) => ({
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
                     client: {
                            id: booking.clientId || 0,
                            name: booking.client?.name || booking.guestName || 'Cliente',
                            phone: booking.client?.phone || booking.guestPhone || '',
                            email: booking.client?.email || ''
                     },
                     schedule: {
                            date: start,
                            startTime: start,
                            endTime: end,
                            duration,
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
                     status: booking.status as Booking['status'],
                     paymentStatus: booking.paymentStatus as Booking['paymentStatus'],
                     transactions: bookingTransactions as unknown as Booking['transactions'],
                     products: mappedProducts,
                     players: (splitPlayers || []) as unknown as Booking['players'],
                     metadata: {
                            createdAt: new Date(booking.createdAt),
                            updatedAt: new Date(booking.updatedAt || booking.createdAt),
                            reminderSent: booking.reminderSent
                     }
              }
       }, [booking, splitPlayers])

       const handleShareMatch = () => {
              if (!adaptedBooking) return
              const { schedule, players } = adaptedBooking
              const formattedDate = format(schedule.startTime, "EEEE d 'de' MMMM", { locale: es })
              const formattedTime = format(schedule.startTime, "HH:mm")
              const playerList = players.map((p) => `- ${p.name || 'Jugador'}`).join('\n')
              const text = `🎾 *PARTIDO CONFIRMADO* 🎾\n\n📅 *Fecha:* ${formattedDate}\n⏰ *Hora:* ${formattedTime}hs\n📍 *Cancha:* ${schedule.courtName}\n\n👥 *Jugadores:*\n${playerList}\n\n¡Nos vemos en la cancha! 🚀`
              navigator.clipboard.writeText(text)
              toast.success('¡Invitación copiada al portapapeles!')
              Haptics.success()
       }

       const handleWhatsApp = () => {
              if (!adaptedBooking) return
              const { client, schedule, pricing } = adaptedBooking
              const phone = client.phone
              if (phone) {
                     const firstName = client.name.split(' ')[0]
                     const baseUrl = window.location.origin
                     const formattedDate = format(schedule.startTime, "EEEE d 'de' MMMM", { locale: es })
                     const formattedTime = format(schedule.startTime, "HH:mm")
                     const text = `Hola ${firstName}! 👋 Te dejo los detalles de tu reserva:\n\n📅 *${formattedDate}*\n⏰ *${formattedTime}hs*\n📍 *${schedule.courtName}*\n💰 *Total: $${pricing.total.toLocaleString()}*\n⚠️ *Falta abonar: $${pricing.balance.toLocaleString()}*\n\n📲 *Confirmá tu turno acá:*\n${baseUrl}/pay/${adaptedBooking.id}`
                     const url = MessagingService.getWhatsAppUrl(phone, text)
                     window.open(url, '_blank')
              } else {
                     toast.error('No hay teléfono registrado')
              }
       }

       if (!mounted) return null

       if (loading && (!booking || !adaptedBooking)) {
              return createPortal(
                     <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4 pb-[env(safe-area-inset-bottom)]">
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   exit={{ opacity: 0 }}
                                   className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <div className="relative z-10 w-full md:max-w-sm p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                          <Loader2 className="animate-spin text-primary" size={24} />
                                   </div>
                                   <span className="font-bold text-slate-900 dark:text-white text-sm">Cargando reserva...</span>
                            </div>
                     </div>,
                     document.body
              )
       }

       if (!booking || !adaptedBooking) return null

       const { client, schedule, pricing } = adaptedBooking
       const formattedDate = format(schedule.startTime, "EEEE d 'de' MMMM", { locale: es })
       const formattedTime = format(schedule.startTime, "HH:mm")
       const balance = pricing.balance
       const isPaid = balance <= 0
       const paymentPercent = pricing.total > 0 ? Math.min((pricing.paid / pricing.total) * 100, 100) : 100
       const durationLabel = `${schedule.duration} min`

       const tabs = [
              { key: 'gestion' as const, label: t('overview'), icon: Banknote, color: 'primary' },
              { key: 'jugadores' as const, label: t('players'), icon: Users, color: 'violet' },
              { key: 'kiosco' as const, label: t('kiosk'), icon: Store, color: 'emerald' },
       ]

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
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="relative z-10 w-full md:max-w-6xl h-[96dvh] md:h-[90vh] bg-white dark:bg-zinc-950 rounded-t-[2rem] md:rounded-2xl shadow-2xl overflow-hidden border-t md:border border-slate-200/80 dark:border-white/[0.06] flex flex-col md:flex-row"
                     >
                            {/* MOBILE DRAG HANDLE */}
                            <div className="md:hidden w-full flex justify-center py-2.5 absolute top-0 left-0 z-20 pointer-events-none">
                                   <div className="w-10 h-1 bg-slate-300 dark:bg-white/15 rounded-full" />
                            </div>

                            {/* MOBILE HEADER */}
                            <div className="md:hidden flex items-center justify-between px-5 pt-9 pb-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl relative z-10 border-b border-slate-100 dark:border-white/[0.04]">
                                   <div className="flex items-center gap-3.5 min-w-0">
                                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/10 dark:to-white/5 flex items-center justify-center font-black text-lg text-slate-700 dark:text-white shrink-0">
                                                 {client.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="min-w-0">
                                                 <h2 className="text-slate-900 dark:text-white font-bold text-sm truncate">{client.name}</h2>
                                                 <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-primary font-semibold">{schedule.courtName}</span>
                                                        <span className="text-[10px] text-slate-400 dark:text-zinc-600">•</span>
                                                        <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">{formattedTime}hs</span>
                                                 </div>
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-2 shrink-0">
                                          <button
                                                 onClick={handleWhatsApp}
                                                 className="w-9 h-9 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                                          >
                                                 <MessageCircle size={16} />
                                          </button>
                                          <button onClick={onClose} className="w-9 h-9 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-500 rounded-xl flex items-center justify-center active:scale-90 transition-all">
                                                 <X size={16} />
                                          </button>
                                   </div>
                            </div>

                            {/* MOBILE TABS */}
                            <div className="md:hidden flex bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-100 dark:border-white/[0.04] sticky top-0 z-20 px-1">
                                   {tabs.map((tab) => (
                                          <button
                                                 key={tab.key}
                                                 onClick={() => setActiveTab(tab.key)}
                                                 className={cn(
                                                        "flex-1 py-3 text-[10px] font-semibold uppercase tracking-wider transition-all relative",
                                                        activeTab === tab.key ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-600"
                                                 )}
                                          >
                                                 {tab.label}
                                                 {activeTab === tab.key && (
                                                        <motion.div
                                                               layoutId="modalTabIndicator"
                                                               className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                                                        />
                                                 )}
                                          </button>
                                   ))}
                            </div>

                            {/* ═══════════════════════════════════════════════════ */}
                            {/* SIDEBAR (Desktop) */}
                            {/* ═══════════════════════════════════════════════════ */}
                            <div className="hidden md:flex w-[280px] bg-slate-50/80 dark:bg-zinc-900 border-r border-slate-200/80 dark:border-white/[0.06] flex-col shrink-0 overflow-y-auto custom-scrollbar">
                                   {/* Profile */}
                                   <div className="p-5 pb-6">
                                          <AnimatePresence mode="wait">
                                                 {isEditingClient ? (
                                                        <motion.div
                                                               key="editing"
                                                               initial={{ opacity: 0, scale: 0.98 }}
                                                               animate={{ opacity: 1, scale: 1 }}
                                                               exit={{ opacity: 0, scale: 0.98 }}
                                                               className="space-y-2.5 bg-white dark:bg-white/[0.03] p-4 rounded-xl border border-slate-200 dark:border-white/[0.06]"
                                                        >
                                                               <div>
                                                                      <label className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block">Nombre</label>
                                                                      <input
                                                                             autoFocus
                                                                             value={clientForm.name}
                                                                             onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                                                                             className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-slate-900 dark:text-white"
                                                                             placeholder="Nombre del cliente"
                                                                      />
                                                               </div>
                                                               <div>
                                                                      <label className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block">Teléfono</label>
                                                                      <div className="relative">
                                                                             <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                                                                             <input
                                                                                    value={clientForm.phone}
                                                                                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                                                                                    className="w-full pl-10 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-slate-900 dark:text-white"
                                                                                    placeholder="Teléfono"
                                                                             />
                                                                      </div>
                                                               </div>
                                                               <div>
                                                                      <label className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block">Email</label>
                                                                      <div className="relative">
                                                                             <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                                                                             <input
                                                                                    value={clientForm.email}
                                                                                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                                                                                    className="w-full pl-10 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-slate-900 dark:text-white"
                                                                                    placeholder="Email (opcional)"
                                                                             />
                                                                      </div>
                                                               </div>
                                                               <div className="flex gap-2 pt-1.5">
                                                                      <button
                                                                             onClick={handleUpdateClient}
                                                                             disabled={loading}
                                                                             className="flex-1 bg-primary hover:brightness-110 text-primary-foreground font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                                                                      >
                                                                             {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                                                                             Guardar
                                                                      </button>
                                                                      <button
                                                                             onClick={() => {
                                                                                    setIsEditingClient(false)
                                                                                    setClientForm({ name: client.name, phone: client.phone, email: client.email || '' })
                                                                             }}
                                                                             disabled={loading}
                                                                             className="px-3.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 rounded-lg flex items-center justify-center transition-all"
                                                                      >
                                                                             <X className="w-4 h-4" />
                                                                      </button>
                                                               </div>
                                                        </motion.div>
                                                 ) : (
                                                        <motion.div
                                                               key="view"
                                                               initial={{ opacity: 0 }}
                                                               animate={{ opacity: 1 }}
                                                               exit={{ opacity: 0 }}
                                                               className="flex items-center gap-3.5"
                                                        >
                                                               <div
                                                                      onClick={() => setIsEditingClient(true)}
                                                                      className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-slate-700 dark:text-white text-xl font-black relative group cursor-pointer overflow-hidden transition-transform hover:scale-105 active:scale-95"
                                                               >
                                                                      {client.name.charAt(0).toUpperCase()}
                                                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                             <Pencil className="w-4 h-4 text-white" />
                                                                      </div>
                                                               </div>
                                                               <div className="min-w-0 flex-1">
                                                                      <h2 className="text-slate-900 dark:text-white font-bold tracking-tight truncate text-[15px]">{client.name}</h2>
                                                                      <div className="flex items-center gap-1.5 mt-1">
                                                                             <span className="text-[11px] font-semibold text-primary">{schedule.courtName}</span>
                                                                             {client.phone && (
                                                                                    <>
                                                                                           <span className="text-slate-300 dark:text-zinc-700 text-[10px]">•</span>
                                                                                           <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium truncate">{client.phone}</span>
                                                                                    </>
                                                                             )}
                                                                      </div>
                                                               </div>
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>
                                   </div>

                                   {/* Nav Tabs */}
                                   <nav className="px-3 space-y-1">
                                          {tabs.map((tab) => {
                                                 const isActive = activeTab === tab.key
                                                 return (
                                                        <button
                                                               key={tab.key}
                                                               onClick={() => setActiveTab(tab.key)}
                                                               className={cn(
                                                                      "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-semibold transition-all group",
                                                                      isActive
                                                                             ? "bg-white dark:bg-white/[0.06] text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/[0.06]"
                                                                             : "text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.03] border border-transparent"
                                                               )}
                                                        >
                                                               <div className={cn(
                                                                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                                      isActive
                                                                             ? tab.color === 'primary' ? "bg-primary/10 text-primary" : tab.color === 'violet' ? "bg-violet-500/10 text-violet-500" : "bg-emerald-500/10 text-emerald-500"
                                                                             : "bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-600 group-hover:text-slate-600 dark:group-hover:text-zinc-400"
                                                               )}>
                                                                      <tab.icon size={15} />
                                                               </div>
                                                               {tab.label}
                                                               {isActive && <ChevronRight size={14} className="ml-auto text-slate-300 dark:text-zinc-600" />}
                                                        </button>
                                                 )
                                          })}
                                   </nav>

                                   {/* Sidebar Info & Actions */}
                                   <div className="mt-auto p-4 space-y-4">
                                          {/* Payment Status Mini Card */}
                                          <div className="bg-white dark:bg-white/[0.03] rounded-xl p-4 border border-slate-200/80 dark:border-white/[0.06]">
                                                 <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('status')}</span>
                                                        {pricing.total === 0 ? (
                                                               <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
                                                                      {t('free')}
                                                               </span>
                                                        ) : (
                                                               <span className={cn(
                                                                      "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                                                                      isPaid
                                                                             ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                                             : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                                               )}>
                                                                      {isPaid ? t('completed_status') : t('pending_status')}
                                                               </span>
                                                        )}
                                                 </div>

                                                 <div className="flex items-baseline justify-between mb-3">
                                                        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('total')}</span>
                                                        <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">${pricing.total.toLocaleString()}</span>
                                                 </div>

                                                 {/* Mini progress */}
                                                 <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                                                        <motion.div
                                                               initial={{ width: 0 }}
                                                               animate={{ width: `${paymentPercent}%` }}
                                                               transition={{ duration: 1, ease: "easeOut" }}
                                                               className={cn(
                                                                      "h-full rounded-full",
                                                                      isPaid ? "bg-emerald-500" : "bg-amber-500"
                                                               )}
                                                        />
                                                 </div>
                                                 {!isPaid && (
                                                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 font-medium">
                                                               Resta: <span className="text-amber-600 dark:text-amber-400 font-semibold">${balance.toLocaleString()}</span>
                                                        </p>
                                                 )}
                                          </div>

                                          {/* Reminder */}
                                          <div className="bg-white dark:bg-white/[0.03] rounded-xl p-3.5 border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
                                                 <div className="flex items-center gap-2.5">
                                                        <div className={cn(
                                                               "w-7 h-7 rounded-lg flex items-center justify-center",
                                                               adaptedBooking.metadata.reminderSent
                                                                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                                                                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-500"
                                                        )}>
                                                               {adaptedBooking.metadata.reminderSent ? <Bell size={13} /> : <BellOff size={13} />}
                                                        </div>
                                                        <div>
                                                               <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400 block leading-tight">Recordatorio</span>
                                                               <span className="text-[9px] text-slate-400 dark:text-zinc-600 font-medium">WhatsApp</span>
                                                        </div>
                                                 </div>
                                                 {adaptedBooking.metadata.reminderSent ? (
                                                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                                                               <Check size={10} strokeWidth={3} /> Enviado
                                                        </span>
                                                 ) : (
                                                        <button
                                                               onClick={handleSendReminder}
                                                               disabled={loading}
                                                               className="text-[9px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-md flex items-center gap-1 transition-all active:scale-95"
                                                        >
                                                               {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle size={10} />}
                                                               Enviar
                                                        </button>
                                                 )}
                                          </div>

                                          {/* Recurring Badge */}
                                          {booking.recurringId && (
                                                 <div className="bg-primary/5 dark:bg-primary/[0.06] rounded-xl p-3.5 border border-primary/10 dark:border-primary/[0.12]">
                                                        <div className="flex items-center gap-2 mb-2.5">
                                                               <Repeat size={12} className="text-primary" />
                                                               <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Turno Fijo</span>
                                                        </div>
                                                        <button
                                                               onClick={handleCancelSeries}
                                                               disabled={loading}
                                                               className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[10px] font-semibold transition-all active:scale-[0.97]"
                                                        >
                                                               Eliminar Serie Completa
                                                        </button>
                                                 </div>
                                          )}

                                          {/* Actions */}
                                          <div className="space-y-1.5">
                                                 {booking.status !== 'CANCELED' && (
                                                        <button
                                                               onClick={handleNoShow}
                                                               disabled={loading}
                                                               className={cn(
                                                                      "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[11px] font-medium transition-all border",
                                                                      booking.status === 'NO_SHOW'
                                                                             ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                                                                             : "bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 border-slate-200/80 dark:border-white/[0.06] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 hover:border-amber-200 dark:hover:border-amber-500/10"
                                                               )}
                                                        >
                                                               {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <EyeOff size={14} />}
                                                               {booking.status === 'NO_SHOW' ? 'Revertir Ausencia' : 'Marcar Ausente'}
                                                        </button>
                                                 )}

                                                 <button
                                                        onClick={handleCancel}
                                                        disabled={loading}
                                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[11px] font-medium bg-white dark:bg-white/[0.03] text-slate-500 dark:text-zinc-500 border border-slate-200/80 dark:border-white/[0.06] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-500/5 hover:border-red-200 dark:hover:border-red-500/10 transition-all"
                                                 >
                                                        {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Trash2 size={14} />}
                                                        {t('cancel_booking')}
                                                 </button>
                                          </div>

                                          <button
                                                 onClick={onClose}
                                                 className="w-full py-2.5 text-[10px] font-medium text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400 transition-colors uppercase tracking-wider"
                                          >
                                                 {t('close_window')}
                                          </button>
                                   </div>
                            </div>

                            {/* ═══════════════════════════════════════════════════ */}
                            {/* MAIN CONTENT AREA */}
                            {/* ═══════════════════════════════════════════════════ */}
                            <div className="flex-1 bg-white dark:bg-zinc-950 flex flex-col min-w-0 overflow-hidden">

                                   {/* Desktop Header */}
                                   <div className="hidden md:flex h-14 border-b border-slate-100 dark:border-white/[0.04] items-center justify-between px-6 bg-slate-50/50 dark:bg-white/[0.015] shrink-0">
                                          <div className="flex items-center gap-6">
                                                 <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 text-[13px] font-medium">
                                                        <Calendar className="w-4 h-4 text-primary/70" />
                                                        <span className="capitalize">{formattedDate}</span>
                                                 </div>
                                                 <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 text-[13px] font-medium">
                                                        <Clock className="w-4 h-4 text-primary/70" />
                                                        <span>{formattedTime}hs</span>
                                                 </div>
                                                 <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-600 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md">{durationLabel}</span>
                                          </div>

                                          <div className="flex gap-2">
                                                 <button
                                                        onClick={handleShareMatch}
                                                        className="flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] rounded-lg transition-all active:scale-95 border border-slate-200/80 dark:border-white/[0.06]"
                                                 >
                                                        <Share2 size={13} /> Invitación
                                                 </button>
                                                 <button
                                                        onClick={handleWhatsApp}
                                                        className="flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition-all active:scale-95 border border-emerald-200/80 dark:border-emerald-500/20"
                                                 >
                                                        <MessageCircle size={13} /> WhatsApp
                                                 </button>
                                          </div>
                                   </div>

                                   {/* Scrollable Content */}
                                   <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-24 md:pb-6">
                                          {activeTab === 'gestion' && (
                                                 <motion.div
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="max-w-2xl mx-auto space-y-5"
                                                 >
                                                        {/* ── Payment Status Hero ── */}
                                                        <div className="bg-slate-50 dark:bg-white/[0.02] rounded-2xl p-6 md:p-8 border border-slate-200/60 dark:border-white/[0.04] relative overflow-hidden">
                                                               {/* Subtle accent */}
                                                               {isPaid && <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px] -mr-20 -mt-20" />}

                                                               <div className="flex items-center justify-between mb-6">
                                                                      <div className="flex items-center gap-2.5">
                                                                             <div className={cn(
                                                                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                                                                    isPaid ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                                             )}>
                                                                                    {isPaid ? <Shield size={16} /> : <CircleDollarSign size={16} />}
                                                                             </div>
                                                                             <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">{t('payment_status')}</span>
                                                                      </div>
                                                                      <span className={cn(
                                                                             "text-[10px] font-semibold px-2.5 py-1 rounded-lg",
                                                                             isPaid
                                                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                                                                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                                                                      )}>
                                                                             {isPaid ? 'PAGADO' : 'PENDIENTE'}
                                                                      </span>
                                                               </div>

                                                               {/* Balance Display */}
                                                               <div className="flex items-end gap-3 mb-6 relative z-10">
                                                                      <span className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                                                             ${balance.toLocaleString()}
                                                                      </span>
                                                                      <span className="text-sm text-slate-400 dark:text-zinc-500 font-medium mb-2">{t('remaining')}</span>
                                                               </div>

                                                               {/* Progress Bar */}
                                                               <div className="w-full bg-slate-200/80 dark:bg-white/[0.06] h-2 rounded-full overflow-hidden mb-3">
                                                                      <motion.div
                                                                             initial={{ width: 0 }}
                                                                             animate={{ width: `${paymentPercent}%` }}
                                                                             transition={{ duration: 1.2, ease: "easeOut" }}
                                                                             className={cn(
                                                                                    "h-full rounded-full transition-colors",
                                                                                    isPaid ? "bg-emerald-500" : paymentPercent > 50 ? "bg-amber-400" : "bg-amber-500"
                                                                             )}
                                                                      />
                                                               </div>

                                                               <div className="flex items-center justify-between text-[11px]">
                                                                      <span className="text-slate-400 dark:text-zinc-500 font-medium">
                                                                             Abonado: <span className="text-slate-600 dark:text-zinc-300 font-semibold">${pricing.paid.toLocaleString()}</span>
                                                                      </span>
                                                                      <span className="text-slate-400 dark:text-zinc-500 font-medium">
                                                                             Total: <span className="text-slate-600 dark:text-zinc-300 font-semibold">${pricing.total.toLocaleString()}</span>
                                                                      </span>
                                                               </div>
                                                        </div>

                                                        {/* ── Payment Actions ── */}
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

                                                         {/* ── Open Match / Partido Abierto ── */}
                                                        <div className={cn(
                                                               "rounded-2xl border transition-all p-5 md:p-6",
                                                               isOpenMatch
                                                                      ? "bg-blue-50/50 dark:bg-blue-500/[0.04] border-blue-200/60 dark:border-blue-500/10"
                                                                      : "bg-slate-50 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.04]"
                                                        )}>
                                                               <div className="flex items-center justify-between mb-4">
                                                                      <div className="flex items-center gap-3">
                                                                             <div className={cn(
                                                                                    "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                                                                                    isOpenMatch
                                                                                           ? "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                                                                           : "bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-zinc-500"
                                                                             )}>
                                                                                    <Zap size={16} />
                                                                             </div>
                                                                             <div>
                                                                                    <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white">Partido Abierto</h3>
                                                                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
                                                                                           {isOpenMatch ? 'Visible en el portal público' : 'Partido privado'}
                                                                                    </p>
                                                                             </div>
                                                                      </div>

                                                                      <button
                                                                             onClick={handleToggleOpenMatch}
                                                                             disabled={loading}
                                                                             className={cn(
                                                                                    "relative w-12 h-7 rounded-full transition-all duration-300 p-0.5",
                                                                                    isOpenMatch ? "bg-blue-500" : "bg-slate-200 dark:bg-zinc-700"
                                                                             )}
                                                                      >
                                                                             <motion.div
                                                                                    animate={{ x: isOpenMatch ? 20 : 0 }}
                                                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                                                    className="h-6 w-6 rounded-full bg-white dark:bg-zinc-100 shadow-md"
                                                                             />
                                                                      </button>
                                                               </div>

                                                               <AnimatePresence>
                                                                      {isOpenMatch && (
                                                                             <motion.div
                                                                                    initial={{ height: 0, opacity: 0 }}
                                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                                    exit={{ height: 0, opacity: 0 }}
                                                                                    transition={{ duration: 0.2 }}
                                                                                    className="overflow-hidden"
                                                                             >
                                                                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                                                                           <div>
                                                                                                  <label className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium mb-1.5 block">{t('level')}</label>
                                                                                                  <select
                                                                                                         className="w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2.5 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-blue-300 dark:focus:border-blue-500/30 transition-all appearance-none"
                                                                                                         value={matchDetails.level}
                                                                                                         onChange={(e) => setMatchDetails({ ...matchDetails, level: e.target.value })}
                                                                                                  >
                                                                                                         {['8va', '7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra'].map(l => (
                                                                                                                <option key={l} value={l}>{l}</option>
                                                                                                         ))}
                                                                                                  </select>
                                                                                           </div>
                                                                                           <div>
                                                                                                  <label className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium mb-1.5 block">{t('gender')}</label>
                                                                                                  <select
                                                                                                         className="w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg px-3 py-2.5 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-blue-300 dark:focus:border-blue-500/30 transition-all appearance-none"
                                                                                                         value={matchDetails.gender}
                                                                                                         onChange={(e) => setMatchDetails({ ...matchDetails, gender: e.target.value })}
                                                                                                  >
                                                                                                         <option value="Masculino">Masculino</option>
                                                                                                         <option value="Femenino">Femenino</option>
                                                                                                         <option value="Mixto">Mixto</option>
                                                                                                  </select>
                                                                                           </div>
                                                                                           <div className="col-span-2">
                                                                                                  <button
                                                                                                         onClick={handleToggleOpenMatch}
                                                                                                         className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-all active:scale-[0.98]"
                                                                                                  >
                                                                                                         {t('update_data')}
                                                                                                  </button>
                                                                                           </div>
                                                                                    </div>
                                                                             </motion.div>
                                                                      )}
                                                               </AnimatePresence>

                                                               {!isOpenMatch && (
                                                                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium leading-relaxed mt-1">
                                                                             Activá esta opción si faltan jugadores. El partido aparecerá en el portal público.
                                                                      </p>
                                                               )}
                                                        </div>

                                                        {/* ── Consumption Breakdown ── */}
                                                        <div className="space-y-3">
                                                               <h3 className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1">{t('consumption_details')}</h3>

                                                               <div className="bg-slate-50 dark:bg-white/[0.02] rounded-xl overflow-hidden border border-slate-200/60 dark:border-white/[0.04] divide-y divide-slate-100 dark:divide-white/[0.04]">
                                                                      {/* Court Rental */}
                                                                      <div className="p-4 flex justify-between items-center">
                                                                             <div className="flex items-center gap-3">
                                                                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                                           <Trophy size={16} />
                                                                                    </div>
                                                                                    <div>
                                                                                           <p className="text-[13px] font-medium text-slate-800 dark:text-white">{t('court_rental')}</p>
                                                                                           <div className="flex items-center gap-2 mt-0.5">
                                                                                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{durationLabel}</span>
                                                                                                  <span className="text-[10px] text-primary font-medium">{schedule.courtName}</span>
                                                                                           </div>
                                                                                    </div>
                                                                             </div>
                                                                             <span className="text-[15px] font-semibold text-slate-800 dark:text-white tracking-tight">${pricing.basePrice.toLocaleString()}</span>
                                                                      </div>

                                                                      {/* Kiosk Items */}
                                                                      {adaptedBooking.products.map(item => (
                                                                             <div key={item.id} className="p-4 flex justify-between items-center group">
                                                                                    <div className="flex items-center gap-3">
                                                                                           <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                                                                                  <Store size={16} />
                                                                                           </div>
                                                                                           <div>
                                                                                                  <div className="flex items-center gap-2">
                                                                                                         <p className="text-[13px] font-medium text-slate-800 dark:text-white">{item.productName}</p>
                                                                                                         <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">x{item.quantity}</span>
                                                                                                  </div>
                                                                                                  <div className="flex items-center gap-1.5 mt-0.5">
                                                                                                         <User size={9} className="text-slate-400 dark:text-zinc-600" />
                                                                                                         <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{item.playerName || t('general')}</span>
                                                                                                  </div>
                                                                                           </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3">
                                                                                           <span className="text-[15px] font-semibold text-slate-800 dark:text-white tracking-tight">${item.subtotal.toLocaleString()}</span>
                                                                                           <button
                                                                                                  onClick={() => handleRemoveItem(item.id)}
                                                                                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 dark:text-zinc-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                                                           >
                                                                                                  <X size={14} />
                                                                                           </button>
                                                                                    </div>
                                                                             </div>
                                                                      ))}

                                                                      {/* Total Row */}
                                                                      <div className="p-4 bg-slate-100/80 dark:bg-white/[0.03] flex justify-between items-center">
                                                                             <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('total')}</span>
                                                                             <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">${pricing.total.toLocaleString()}</span>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Mobile Cancel */}
                                                        <div className="md:hidden pt-2 pb-8">
                                                               <button
                                                                      onClick={handleCancel}
                                                                      disabled={loading}
                                                                      className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 py-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 active:scale-[0.98]"
                                                               >
                                                                      {loading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                                                      {t('cancel_booking')}
                                                               </button>
                                                        </div>
                                                 </motion.div>
                                          )}

                                          {activeTab === 'jugadores' && (
                                                 <PlayersTab
                                                        bookingId={booking.id}
                                                        totalAmount={booking.price + (((booking as Record<string, unknown>).items as BookingItem[] | undefined) || []).reduce((acc: number, i: BookingItem) => acc + (i.unitPrice * i.quantity), 0)}
                                                        baseBookingPrice={booking.price}
                                                        kioskItems={((booking as Record<string, unknown>).items as BookingItem[] | undefined) || []}
                                                        players={splitPlayers}
                                                        setPlayers={setSplitPlayers}
                                                        onSave={() => handleSaveSplit(splitPlayers)}
                                                        onRecalculate={handleRecalculateSplits}
                                                        loading={loading}
                                                 />
                                          )}

                                          {activeTab === 'kiosco' && (
                                                 <KioskTab
                                                        products={products}
                                                        items={((booking as Record<string, unknown>).items as BookingItem[] | undefined) || []}
                                                        loading={loading}
                                                        onAddItem={handleAddItem}
                                                        onRemoveItem={handleRemoveItem}
                                                        onRecalculate={handleRecalculateSplits}
                                                        onCollectPayment={(p) => setPlayerPaymentModal({ id: p.id, name: p.name, amount: p.amount })}
                                                        players={splitPlayers}
                                                 />
                                          )}
                                   </div>
                            </div>
                     </motion.div>

                     {/* Player Payment Modal */}
                     <AnimatePresence>
                            {playerPaymentModal && (
                                   <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                                          <motion.div
                                                 initial={{ scale: 0.95, opacity: 0 }}
                                                 animate={{ scale: 1, opacity: 1 }}
                                                 exit={{ scale: 0.95, opacity: 0 }}
                                                 className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-2xl"
                                          >
                                                 <div className="flex items-center justify-between mb-6">
                                                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Registrar Pago</h4>
                                                        <button onClick={() => setPlayerPaymentModal(null)} className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white transition-colors p-1">
                                                               <X size={16} />
                                                        </button>
                                                 </div>

                                                 <div className="text-center mb-8 py-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/[0.04]">
                                                        <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 mb-1">{playerPaymentModal.name}</p>
                                                        <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${playerPaymentModal.amount.toLocaleString()}</p>
                                                 </div>

                                                 <div className="space-y-2">
                                                        {[
                                                               { method: 'CASH', label: 'Efectivo', icon: Wallet },
                                                               { method: 'TRANSFER', label: 'Transferencia', icon: RefreshCw },
                                                               { method: 'MP', label: 'MercadoPago', icon: Zap },
                                                        ].map(({ method, label, icon: Icon }) => (
                                                               <button
                                                                      key={method}
                                                                      onClick={async () => {
                                                                             const res = await chargePlayer(booking.id, playerPaymentModal.name, playerPaymentModal.amount, method)
                                                                             if (res.success) {
                                                                                    toast.success("Pago registrado")
                                                                                    setPlayerPaymentModal(null)
                                                                                    refreshBooking()
                                                                                    onUpdate()
                                                                             } else {
                                                                                    toast.error("Error al registrar pago")
                                                                             }
                                                                      }}
                                                                      className="w-full py-3.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl text-[12px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
                                                               >
                                                                      <Icon size={14} />
                                                                      {label}
                                                               </button>
                                                        ))}
                                                 </div>
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>
              </div>,
              document.body
       )
}
