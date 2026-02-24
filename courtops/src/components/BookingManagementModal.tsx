'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { format, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { useBookingManagement } from '@/hooks/useBookingManagement'
import {
       payBooking,
       manageSplitPlayers,
       generatePaymentLink,
       updateBookingClient,
       sendManualReminder
} from '@/actions/manageBooking'
import { markNoShow, revertNoShow } from '@/actions/no-show'
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
       Share2,
       Pencil,     // Added Pencil icon
       Save,       // Added Save icon
       Phone,      // Added Phone icon
       Mail,       // Added Mail icon
       Check,
       EyeOff,      // No-Show icon
       User,
       Plus,
       Repeat
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
              actions: { cancel, cancelSeries, addItem, removeItem }
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

       // Client Editing State
       const [isEditingClient, setIsEditingClient] = useState(false)
       const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '' })


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

                     // Sync Client Form
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
              } catch (error) {
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
              } catch (error) {
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

       const handleCancelSeries = async () => {
              if (!booking?.id) return
              if (!confirm('¿Estás seguro de que deseas ELIMINAR EL TURNO FIJO? Se cancelarán este y todos los turnos futuros de esta serie.')) return

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
                            if (!confirm('¿Marcar esta reserva como No-Show? El cliente no se presentó.')) return
                            const res = await markNoShow(booking.id)
                            if (res.success) {
                                   toast.success('Reserva marcada como No-Show')
                                   refreshBooking()
                                   onUpdate()
                            } else {
                                   toast.error(res.error || 'Error')
                            }
                     }
              } catch (error) {
                     toast.error('Error inesperado')
              } finally {
                     setLocalLoading(false)
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
                            name: booking.client?.name || booking.guestName || 'Cliente',
                            phone: booking.client?.phone || booking.guestPhone || '',
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

              const playerList = players.map((p: any) => `- ${p.name || 'Jugador'}`).join('\n')

              const text = `🎾 *PARTIDO CONFIRMADO* 🎾\n\n📅 *Fecha:* ${formattedDate}\n⏰ *Hora:* ${formattedTime}hs\n📍 *Cancha:* ${schedule.courtName}\n\n👥 *Jugadores:*\n${playerList}\n\n¡Nos vemos en la cancha! 🚀`

              navigator.clipboard.writeText(text)
              toast.success('¡Invitación copiada al portapapeles!')
              Haptics.success()
       }

       // If the component is not yet mounted, avoid rendering anything.
       // If mounted but booking is still loading, render a loading modal so users get feedback.
       if (!mounted) return null

       if (loading && (!booking || !adaptedBooking)) {
              return createPortal(
                     <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4">
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   exit={{ opacity: 0 }}
                                   className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <div className="relative z-10 w-full md:max-w-md p-6 bg-background rounded-2xl shadow-2xl border border-border/60 flex items-center justify-center">
                                   <Loader2 className="animate-spin mr-3" />
                                   <span className="font-medium">Cargando reserva...</span>
                            </div>
                     </div>,
                     document.body
              )
       }

       // Ensure we have booking data before attempting to render details
       if (!booking || !adaptedBooking) return null

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
                            className="relative z-10 w-full md:max-w-4xl h-[94dvh] md:h-[80vh] bg-background dark:bg-background rounded-t-[1.5rem] md:rounded-2xl shadow-2xl overflow-hidden border-t md:border border-border/80 flex flex-col md:flex-row shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
                     >
                            {/* MOBILE DRAG HANDLE */}
                            <div className="md:hidden w-full flex justify-center py-2 absolute top-0 left-0 z-20 pointer-events-none">
                                   <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full" />
                            </div>

                            {/* MOBILE HEADER (Visible only on small screens) */}
                            <div className="md:hidden flex items-center justify-between p-6 pt-10 border-b border-border/50 bg-card/50 backdrop-blur-xl relative z-10">
                                   <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black shadow-2xl scale-110">
                                                 {client.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="flex flex-col">
                                                 <h2 className="text-white font-black text-base tracking-tighter leading-none">{client.name}</h2>
                                                 <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{schedule.courtName} • {formattedTime}hs</span>
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                          <button
                                                 onClick={() => {
                                                        const phone = client.phone
                                                        if (phone && adaptedBooking) {
                                                               const firstName = client.name.split(' ')[0]
                                                               const baseUrl = window.location.origin
                                                               const text = `Hola ${firstName}! 👋 Te dejo los detalles de tu reserva:\n\n📅 *${formattedDate}*\n⏰ *${formattedTime}hs*\n📍 *${schedule.courtName}*\n💰 *Total: $${pricing.total}*\n⚠️ *Falta abonar: $${balance}*\n\n📲 *Confirmá tu turno acá:*\n${baseUrl}/pay/${adaptedBooking.id}`

                                                               const url = MessagingService.getWhatsAppUrl(phone, text)
                                                               window.open(url, '_blank')
                                                        } else {
                                                               toast.error('No hay teléfono registrado')
                                                        }
                                                 }}
                                                 className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center active:scale-90 transition-all border border-emerald-500/20"
                                          >
                                                 <MessageCircle size={20} />
                                          </button>
                                          <button onClick={onClose} className="w-10 h-10 bg-zinc-800/50 text-zinc-500 rounded-full flex items-center justify-center active:scale-90 transition-all border border-zinc-700/30">
                                                 <X size={20} />
                                          </button>
                                   </div>
                            </div>

                            {/* MOBILE TABS (Visible only on small screens) */}
                            <div className="md:hidden flex bg-card/50 backdrop-blur-xl border-b border-border/50 sticky top-0 z-20">
                                   {(['gestion', 'jugadores', 'kiosco'] as const).map((tab) => (
                                          <button
                                                 key={tab}
                                                 onClick={() => setActiveTab(tab)}
                                                 className={cn(
                                                        "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden",
                                                        activeTab === tab ? "text-white" : "text-zinc-500"
                                                 )}
                                          >
                                                 {tab === 'gestion' ? t('overview') : tab === 'jugadores' ? t('players') : t('kiosk')}
                                                 {activeTab === tab && (
                                                        <motion.div
                                                               layoutId="modalTabIndicator"
                                                               className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                                                        />
                                                 )}
                                          </button>
                                   ))}
                            </div>
                            {/* SIDEBAR NAVIGATION (Desktop Only) */}
                            <div className="hidden md:flex w-64 bg-slate-50/50 dark:bg-[#121214] border-r border-slate-200 dark:border-white/10 flex-col p-5 shrink-0 relative overflow-y-auto custom-scrollbar backdrop-blur-xl">
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                                   <div className="mb-10 relative z-10">
                                          <AnimatePresence mode="wait">
                                                 {isEditingClient ? (
                                                        <motion.div
                                                               key="editing"
                                                               initial={{ opacity: 0, x: -20 }}
                                                               animate={{ opacity: 1, x: 0 }}
                                                               exit={{ opacity: 0, x: 20 }}
                                                               className="space-y-3 bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none"
                                                        >
                                                               <div className="space-y-1">
                                                                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 mb-1 block">Nombre</label>
                                                                      <input
                                                                             autoFocus
                                                                             value={clientForm.name}
                                                                             onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                                                                             className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                                                             placeholder="Nombre del cliente"
                                                                      />
                                                               </div>
                                                               <div className="space-y-1">
                                                                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 mb-1 block">Teléfono</label>
                                                                      <div className="relative">
                                                                             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                             <input
                                                                                    value={clientForm.phone}
                                                                                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                                                                                    className="w-full pl-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                                                                    placeholder="Teléfono"
                                                                             />
                                                                      </div>
                                                               </div>
                                                               <div className="space-y-1">
                                                                      <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 mb-1 block">Email</label>
                                                                      <div className="relative">
                                                                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                             <input
                                                                                    value={clientForm.email}
                                                                                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                                                                                    className="w-full pl-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                                                                    placeholder="Email (opcional)"
                                                                             />
                                                                      </div>
                                                               </div>
                                                               <div className="flex gap-2 pt-2">
                                                                      <button
                                                                             onClick={handleUpdateClient}
                                                                             disabled={loading}
                                                                             className="flex-1 bg-primary hover:brightness-110 text-primary-foreground font-black py-3 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                                                                      >
                                                                             {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                                                             Guardar
                                                                      </button>
                                                                      <button
                                                                             onClick={() => {
                                                                                    setIsEditingClient(false)
                                                                                    setClientForm({
                                                                                           name: client.name,
                                                                                           phone: client.phone,
                                                                                           email: client.email || ''
                                                                                    })
                                                                             }}
                                                                             disabled={loading}
                                                                             className="px-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200 dark:border-white/10"
                                                                      >
                                                                             <X className="w-5 h-5" />
                                                                      </button>
                                                               </div>
                                                        </motion.div>
                                                 ) : (
                                                        <motion.div
                                                               key="view"
                                                               initial={{ opacity: 0, x: 20 }}
                                                               animate={{ opacity: 1, x: 0 }}
                                                               exit={{ opacity: 0, x: -20 }}
                                                               className="flex items-center gap-4"
                                                        >
                                                               <div
                                                                      onClick={() => setIsEditingClient(true)}
                                                                      className="w-16 h-16 shrink-0 rounded-[1.25rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white text-3xl font-black shadow-xl dark:shadow-2xl relative group cursor-pointer overflow-hidden transition-all hover:scale-105 active:scale-95"
                                                               >
                                                                      {client.name.charAt(0).toUpperCase()}
                                                                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                             <Pencil className="w-5 h-5 text-white" />
                                                                      </div>
                                                               </div>
                                                               <div className="min-w-0 flex-1">
                                                                      <h2 className="text-slate-950 dark:text-white font-black tracking-tight truncate leading-tight text-lg uppercase">{client.name}</h2>
                                                                      <div className="flex flex-col gap-1 mt-1.5">
                                                                             <span className="text-[10px] font-black text-primary/80 uppercase tracking-[0.2em] leading-none">
                                                                                    {schedule.courtName}
                                                                             </span>
                                                                             {client.phone && <span className="text-[10px] text-zinc-500 font-bold tracking-wider">{client.phone}</span>}
                                                                      </div>
                                                               </div>
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>
                                   </div>

                                   <nav className="flex-1 space-y-3 relative z-10">
                                          <button
                                                 onClick={() => setActiveTab('gestion')}
                                                 className={cn(
                                                        "w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group border",
                                                        activeTab === 'gestion'
                                                               ? "bg-white dark:bg-white/5 text-slate-900 dark:text-white shadow-xl dark:shadow-2xl border-slate-200 dark:border-white/10"
                                                               : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                                 )}
                                          >
                                                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg", activeTab === 'gestion' ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300")}>
                                                        <Banknote size={18} />
                                                 </div>
                                                 {t('overview')}
                                          </button>
                                          <button
                                                 onClick={() => setActiveTab('jugadores')}
                                                 className={cn(
                                                        "w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group border",
                                                        activeTab === 'jugadores'
                                                               ? "bg-white dark:bg-white/5 text-slate-900 dark:text-white shadow-xl dark:shadow-2xl border-slate-200 dark:border-white/10"
                                                               : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                                 )}
                                          >
                                                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg", activeTab === 'jugadores' ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300")}>
                                                        <Users size={18} />
                                                 </div>
                                                 {t('players')}
                                          </button>
                                          <button
                                                 onClick={() => setActiveTab('kiosco')}
                                                 className={cn(
                                                        "w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group border",
                                                        activeTab === 'kiosco'
                                                               ? "bg-white dark:bg-white/5 text-slate-900 dark:text-white shadow-xl dark:shadow-2xl border-slate-200 dark:border-white/10"
                                                               : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                                                 )}
                                          >
                                                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg", activeTab === 'kiosco' ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300")}>
                                                        <Store size={18} />
                                                 </div>
                                                 {t('kiosk')}
                                          </button>
                                   </nav>

                                   <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 relative z-10">
                                          <div className="bg-white dark:bg-zinc-900/40 rounded-[2rem] p-5 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl relative overflow-hidden group">
                                                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

                                                 <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-black uppercase tracking-[0.4em] mb-4 relative z-10">{t('booking_status')}</p>

                                                 <div className="flex justify-between items-center mb-3 relative z-10">
                                                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{t('status')}</span>
                                                        {pricing.total === 0 ? (
                                                               <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                                                                      {t('free')}
                                                               </span>
                                                        ) : (
                                                               <span className={cn(
                                                                      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border shadow-lg",
                                                                      isPaid
                                                                             ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/5"
                                                                             : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 shadow-orange-500/5"
                                                               )}>
                                                                      {isPaid ? t('completed_status') : t('pending_status')}
                                                               </span>
                                                        )}
                                                 </div>

                                                 <div className="flex justify-between items-center relative z-10">
                                                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{t('total')}</span>
                                                        <div className="text-right">
                                                               <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter block">${pricing.total.toLocaleString()}</span>
                                                        </div>
                                                 </div>

                                                 <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex justify-between items-center relative z-10">
                                                        <div className="space-y-1">
                                                               <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Recordatorio</span>
                                                               <p className="text-[9px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-widest">WhatsApp automático</p>
                                                        </div>
                                                        {adaptedBooking.metadata.reminderSent ? (
                                                               <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                                      <Check size={12} strokeWidth={3} /> {t('sent')}
                                                               </div>
                                                        ) : (
                                                               <button
                                                                      onClick={handleSendReminder}
                                                                      disabled={loading}
                                                                      className="bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-blue-600/20 flex items-center gap-2 active:scale-95 shadow-md shadow-blue-500/5 dark:shadow-blue-600/5"
                                                               >
                                                                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle size={12} />}
                                                                      {t('send')}
                                                               </button>
                                                        )}
                                                 </div>
                                          </div>

                                          <div className="mt-6 space-y-2 relative z-10">
                                                 {booking.status !== 'CANCELED' && (
                                                        <button
                                                               onClick={handleNoShow}
                                                               disabled={loading}
                                                               className={cn(
                                                                      "w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group border",
                                                                      booking.status === 'NO_SHOW'
                                                                             ? "bg-amber-600/10 text-amber-600 dark:text-amber-500 border-amber-600/20 hover:bg-amber-600 hover:text-white shadow-md shadow-amber-500/10"
                                                                             : "bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-white/5 hover:bg-orange-600/10 hover:text-orange-600 dark:hover:text-orange-500 hover:border-orange-600/20 shadow-sm"
                                                               )}
                                                        >
                                                               <div className="flex items-center gap-3">
                                                                      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <EyeOff size={16} />}
                                                                      <span>{booking.status === 'NO_SHOW' ? 'Revertir No-Show' : 'Marcar No-Show'}</span>
                                                               </div>
                                                               <AlertTriangle size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                 )}

                                                 {booking.recurringId && (
                                                        <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
                                                               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none"></div>
                                                               <div className="relative z-10">
                                                                      <div className="flex items-center gap-2 mb-3">
                                                                             <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                                                                    <Repeat size={12} />
                                                                             </div>
                                                                             <span className="text-[10px] font-black uppercase tracking-widest text-primary">Turno Fijo</span>
                                                                      </div>
                                                                      <button
                                                                             onClick={handleCancelSeries}
                                                                             disabled={loading}
                                                                             className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                                                      >
                                                                             Eliminar Fijo (Serie)
                                                                      </button>
                                                                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-2 text-center opacity-70">
                                                                             Cancela todas las fechas futuras
                                                                      </p>
                                                               </div>
                                                        </div>
                                                 )}

                                                 <button
                                                        onClick={handleCancel}
                                                        disabled={loading}
                                                        className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-white/5 hover:bg-red-600/10 hover:text-red-600 dark:hover:text-red-500 hover:border-red-600/20 transition-all group shadow-sm"
                                                 >
                                                        <div className="flex items-center gap-3">
                                                               {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={16} />}
                                                               <span>{t('cancel_booking')}</span>
                                                        </div>
                                                        <X size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                 </button>
                                          </div>

                                          <button
                                                 onClick={onClose}
                                                 className="w-full mt-6 py-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-600 hover:text-slate-900 dark:hover:text-zinc-400 transition-colors"
                                          >
                                                 {t('close_window')}
                                          </button>
                                   </div>
                            </div>

                            {/* MAIN CONTENT AREA */}
                            <div className="flex-1 bg-[#F8FAFC] dark:bg-background flex flex-col min-w-0 overflow-hidden relative" >

                                   {/* Header Info Bar (Desktop Only) */}
                                   <div className="hidden md:flex h-20 border-b border-slate-200 dark:border-white/5 items-center justify-between px-10 bg-white/80 dark:bg-black/60 backdrop-blur-2xl sticky top-0 z-20" >
                                          <div className="flex items-center gap-10">
                                                 <div className="flex items-center gap-3 text-slate-900 dark:text-zinc-300 text-sm font-black uppercase tracking-widest">
                                                        <Calendar className="w-5 h-5 text-primary" />
                                                        <span>{formattedDate}</span>
                                                 </div>
                                                 <div className="flex items-center gap-3 text-slate-900 dark:text-zinc-300 text-sm font-black uppercase tracking-widest">
                                                        <Clock className="w-5 h-5 text-primary" />
                                                        <span>{formattedTime}HS</span>
                                                 </div>
                                          </div>

                                          <div className="flex gap-4">
                                                 <button
                                                        onClick={handleShareMatch}
                                                        className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-indigo-600/20 flex items-center gap-2.5 active:scale-95 shadow-lg shadow-indigo-600/5"
                                                 >
                                                        <Share2 size={16} /> Invitación
                                                 </button>
                                                 <button
                                                        onClick={() => {
                                                               const phone = client.phone
                                                               if (phone && adaptedBooking) {
                                                                      const firstName = client.name.split(' ')[0]
                                                                      const baseUrl = window.location.origin
                                                                      const text = `Hola ${firstName}! 👋 Te dejo los detalles de tu reserva:\n\n📅 *${formattedDate}*\n⏰ *${formattedTime}hs*\n📍 *${schedule.courtName}*\n💰 *Total: $${pricing.total}*\n⚠️ *Falta abonar: $${balance}*\n\n📲 *Confirmá tu turno acá:*\n${baseUrl}/pay/${adaptedBooking.id}`

                                                                      const url = MessagingService.getWhatsAppUrl(phone, text)
                                                                      window.open(url, '_blank')
                                                               } else {
                                                                      toast.error('No hay teléfono registrado')
                                                               }
                                                        }}
                                                        className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-emerald-600/20 flex items-center gap-2.5 active:scale-95 shadow-lg shadow-emerald-600/5"
                                                 >
                                                        <MessageCircle size={16} /> WhatsApp
                                                 </button>
                                          </div>
                                   </div>

                                   {/* Content Scrollable */}
                                   <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24 md:pb-8" >
                                          {activeTab === 'gestion' && (
                                                 <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="max-w-2xl mx-auto space-y-8"
                                                 >
                                                        {/* Status Card */}
                                                        <div className="bg-card/40 rounded-[2.5rem] p-8 md:p-10 border border-border/50 mb-8 shadow-2xl relative overflow-hidden group">
                                                               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-colors"></div>

                                                               <div className="flex items-center justify-between mb-10 relative z-10">
                                                                      <span className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em]">{t('payment_status')}</span>
                                                                      <span className={cn(
                                                                             "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg",
                                                                             isPaid
                                                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5"
                                                                                    : "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/5"
                                                                      )}>
                                                                             {isPaid ? 'COMPLETADO' : 'PENDIENTE'}
                                                                      </span>
                                                               </div>
                                                               <div className="flex items-center gap-4 relative z-10 mb-8">
                                                                      <span className="text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                                                                             ${balance.toLocaleString()}
                                                                      </span>
                                                                      <span className="text-zinc-500 font-black text-xs uppercase tracking-widest mt-6">{t('remaining')}</span>
                                                               </div>

                                                               <div className="w-full bg-zinc-900/50 h-3 rounded-full overflow-hidden relative border border-white/5 mb-8">
                                                                      <motion.div
                                                                             initial={{ width: 0 }}
                                                                             animate={{ width: `${Math.min((pricing.paid / pricing.total) * 100, 100)}%` }}
                                                                             transition={{ duration: 1.5, ease: "easeOut" }}
                                                                             className={cn(
                                                                                    "h-full rounded-full bg-gradient-to-r",
                                                                                    isPaid ? "from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "from-orange-400 to-orange-600"
                                                                             )}
                                                                      />
                                                               </div>

                                                               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em] relative z-10 text-center leading-relaxed">
                                                                      {isPaid ? '¡TODO AL DÍA! EL TURNO ESTÁ COMPLETAMENTE PAGADO.' : 'TURNO PARCIALMENTE ABONADO.'}
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
                                                        <div className={cn(
                                                               "group relative overflow-hidden rounded-2xl border transition-all duration-500 shadow-xl p-6 md:p-8 mb-6",
                                                               isOpenMatch
                                                                      ? "bg-blue-600/5 border-blue-600/20"
                                                                      : "bg-card/40 border-border/50"
                                                        )}>
                                                               <div className="flex items-center justify-between mb-6 relative z-10">
                                                                      <div className="flex items-center gap-4">
                                                                             <div className={cn(
                                                                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all bg-zinc-900 border border-white/5 text-zinc-500",
                                                                                    isOpenMatch && "text-blue-500 border-blue-500/20"
                                                                             )}>
                                                                                    <Users size={22} />
                                                                             </div>
                                                                             <div className="flex flex-col">
                                                                                    <h3 className={cn("text-[10px] font-black uppercase tracking-[0.3em]", isOpenMatch ? "text-blue-500" : "text-white")}>
                                                                                           PARTIDO ABIERTO
                                                                                    </h3>
                                                                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                                                                                           {isOpenMatch ? 'VISIBLE EN EL PORTAL' : 'PARTIDO PRIVADO'}
                                                                                    </p>
                                                                             </div>
                                                                      </div>

                                                                      <button
                                                                             onClick={handleToggleOpenMatch}
                                                                             disabled={loading}
                                                                             className={cn(
                                                                                    "relative w-16 h-10 rounded-full transition-all duration-300 p-1.5",
                                                                                    isOpenMatch ? "bg-blue-600 shadow-lg shadow-blue-600/20" : "bg-zinc-800"
                                                                             )}
                                                                      >
                                                                             <motion.div
                                                                                    animate={{ x: isOpenMatch ? 24 : 0 }}
                                                                                    className="h-7 w-7 rounded-full bg-white shadow-xl"
                                                                             />
                                                                      </button>
                                                               </div>

                                                               {isOpenMatch ? (
                                                                      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 relative z-10">
                                                                             <div className="space-y-3">
                                                                                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] ml-1">{t('level')}</label>
                                                                                    <select
                                                                                           className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 text-white text-xs font-black outline-none focus:border-blue-500/50 transition-all appearance-none"
                                                                                           value={matchDetails.level}
                                                                                           onChange={(e) => setMatchDetails({ ...matchDetails, level: e.target.value })}
                                                                                    >
                                                                                           {['8va', '7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra'].map(l => (
                                                                                                  <option key={l} value={l}>{l}</option>
                                                                                           ))}
                                                                                    </select>
                                                                             </div>
                                                                             <div className="space-y-3">
                                                                                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] ml-1">{t('gender')}</label>
                                                                                    <select
                                                                                           className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 text-white text-xs font-black outline-none focus:border-blue-500/50 transition-all appearance-none"
                                                                                           value={matchDetails.gender}
                                                                                           onChange={(e) => setMatchDetails({ ...matchDetails, gender: e.target.value })}
                                                                                    >
                                                                                           <option value="Masculino">Masculino</option>
                                                                                           <option value="Femenino">Femenino</option>
                                                                                           <option value="Mixto">Mixto</option>
                                                                                    </select>
                                                                             </div>
                                                                             <div className="col-span-2 pt-4">
                                                                                    <button
                                                                                           onClick={handleToggleOpenMatch}
                                                                                           className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95"
                                                                                    >
                                                                                           {t('update_data')}
                                                                                    </button>
                                                                             </div>
                                                                      </div>
                                                               ) : (
                                                                      <div className="mt-4 p-6 bg-zinc-950/50 rounded-[1.5rem] border border-white/5 flex gap-4">
                                                                             <div className="w-10 h-10 shrink-0 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500 border border-white/5">
                                                                                    <AlertTriangle size={20} />
                                                                             </div>
                                                                             <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                                                                    Activa esta opción si faltan jugadores. El partido aparecerá en el portal público automáticamente.
                                                                             </p>
                                                                      </div>
                                                               )}
                                                        </div>

                                                        {/* Consumption Details Breakdown */}
                                                        <div className="space-y-6">
                                                               <div className="flex items-center gap-4 px-2">
                                                                      <div className="w-12 h-px bg-white/5"></div>
                                                                      <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">{t('consumption_details')}</h3>
                                                                      <div className="flex-1 h-px bg-white/5"></div>
                                                               </div>

                                                               <div className="bg-card/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-border/40 divide-y divide-white/5 shadow-xl relative">
                                                                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                                                      <div className="p-5 flex justify-between items-center group hover:bg-white/5 transition-all relative z-10">
                                                                             <div className="flex items-center gap-4">
                                                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-lg">
                                                                                           <Trophy size={18} />
                                                                                    </div>
                                                                                    <div>
                                                                                           <p className="text-white font-black text-xs uppercase tracking-widest">{t('court_rental')}</p>
                                                                                           <div className="flex items-center gap-2 mt-0.5">
                                                                                                  <span className="text-zinc-500 text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">90m</span>
                                                                                                  <span className="text-primary text-[8px] font-black uppercase tracking-widest">{schedule.courtName}</span>
                                                                                           </div>
                                                                                    </div>
                                                                             </div>
                                                                             <div className="text-right">
                                                                                    <span className="text-lg font-black text-white tracking-tighter block">${pricing.basePrice.toLocaleString()}</span>
                                                                             </div>
                                                                      </div>

                                                                      {adaptedBooking.products.map(item => (
                                                                             <div key={item.id} className="p-5 flex justify-between items-center group hover:bg-white/5 transition-all relative z-10">
                                                                                    <div className="flex items-center gap-4">
                                                                                           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20 shadow-lg">
                                                                                                  <Store size={18} />
                                                                                           </div>
                                                                                           <div>
                                                                                                  <p className="text-white font-black text-xs uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
                                                                                                         {item.productName}
                                                                                                         <span className="text-emerald-500 ml-2 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[8px]">x{item.quantity}</span>
                                                                                                  </p>
                                                                                                  <div className="flex items-center gap-1.5 mt-0.5">
                                                                                                         <User size={8} className="text-zinc-600" />
                                                                                                         <span className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">{item.playerName || t('general')}</span>
                                                                                                  </div>
                                                                                           </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4">
                                                                                           <span className="text-lg font-black text-white tracking-tighter">${item.subtotal.toLocaleString()}</span>
                                                                                           <button
                                                                                                  onClick={() => handleRemoveItem(item.id)}
                                                                                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                                                                                           >
                                                                                                  <Plus size={18} className="rotate-45" />
                                                                                           </button>
                                                                                    </div>
                                                                             </div>
                                                                      ))}

                                                                      <div className="p-6 bg-black/40 flex justify-between items-end relative z-10">
                                                                             <div className="space-y-1">
                                                                                    <span className="text-zinc-600 font-black tracking-[0.4em] text-[8px] uppercase">{t('total')}</span>
                                                                             </div>
                                                                             <div className="text-right">
                                                                                    <span className="text-3xl font-black text-white tracking-tighter block">${pricing.total.toLocaleString()}</span>
                                                                             </div>
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

                                          {
                                                 activeTab === 'kiosco' && (
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
                                                 )
                                          }

                                          {
                                                 activeTab === 'jugadores' && (
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
                                                 )
                                          }
                                   </div>
                            </div>
                     </motion.div>
              </div>,
              document.body
       )
}
