'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { format, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import {
       cancelBooking,
       getBookingDetails,
       getProducts,
       addBookingItemWithPlayer,
       removeBookingItem,
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
import { createPortal } from 'react-dom'
import {
       X,
       AlertTriangle,
       Calendar,
       Clock,
       Trophy,
       ChevronDown,
       ArrowRight,
       Store,
       Users,
       Banknote,
       MessageCircle,
       Check,
       CreditCard,
       Smartphone,
       Wallet,
       Loader2,
       Trash2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
       booking: any | null
       onClose: () => void
       onUpdate: () => void
}

export default function BookingManagementModal({ booking: initialBooking, onClose, onUpdate }: Props) {
       // Global State
       const [booking, setBooking] = useState<any>(null)
       const [loading, setLoading] = useState(false)
       const [error, setError] = useState<string | null>(null)

       // Data Cache
       const [products, setProducts] = useState<any[]>([])
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
              if (initialBooking?.id) {
                     refreshData()
                     getProducts().then(setProducts).catch(e => console.error(e))
                     getCourts().then(setCourts).catch(e => console.error(e))
              }
              return () => setMounted(false)
       }, [initialBooking?.id])

       useEffect(() => {
              if (booking) {
                     setIsOpenMatch(booking.isOpenMatch || false)
                     setMatchDetails({
                            level: booking.matchLevel || '7ma',
                            gender: booking.matchGender || 'Masculino',
                            missing: 1
                     })
              }
       }, [booking])

       const handleToggleOpenMatch = async () => {
              setLoading(true)
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
                            // Update local state immediately for responsiveness, though refreshData will also run
                            if (result.booking) {
                                   setBooking(result.booking)
                            }
                            onUpdate()
                     } else {
                            toast.error('Error al actualizar estado')
                     }
              } catch (err) {
                     toast.error('Ocurrió un error inesperado')
              } finally {
                     setLoading(false)
              }
       }

       async function refreshData() {
              if (!initialBooking?.id) return
              setLoading(true)
              setError(null)

              try {
                     const res = await getBookingDetails(initialBooking.id)
                     if (res.success && res.booking) {
                            const b = res.booking
                            setBooking(b)
                            const existingPlayers = (b as any).players || []
                            if (existingPlayers.length > 0) {
                                   setSplitPlayers(existingPlayers)
                            } else {
                                   setSplitPlayers([
                                          { name: b.client?.name || 'Titular', amount: 0, isPaid: false },
                                          { name: 'Jugador 2', amount: 0, isPaid: false },
                                          { name: 'Jugador 3', amount: 0, isPaid: false },
                                          { name: 'Jugador 4', amount: 0, isPaid: false }
                                   ])
                            }
                     } else {
                            setError(res.error || 'Error al cargar detalles del turno')
                            toast.error(res.error || 'Error al cargar detalles')
                     }
              } catch (err: any) {
                     setError(err.message || 'Error de conexión')
              } finally {
                     setLoading(false)
              }
       }

       const handleCancel = async () => {
              if (!booking?.id) return
              if (!confirm('¿Estás seguro de que deseas cancelar este turno? Esta acción no se puede deshacer.')) return

              setLoading(true)
              try {
                     const res = await cancelBooking(booking.id)
                     if (res.success) {
                            toast.success('Reserva cancelada exitosamente')
                            onUpdate()
                            onClose()
                     } else {
                            toast.error(res.error || 'Error al cancelar la reserva')
                     }
              } catch (error) {
                     toast.error('Error de conexión al cancelar')
              } finally {
                     setLoading(false)
              }
       }

       // --- ACTIONS ---
       const handleAddItem = async (productId: number, quantity: number, playerName?: string) => {
              setLoading(true)
              const res = await addBookingItemWithPlayer(booking.id, productId, quantity, playerName)
              setLoading(false)
              if (res.success) {
                     toast.success('Producto agregado')
                     await refreshData()
              } else {
                     toast.error(res.error || 'Error al agregar producto')
              }
       }

       const handleRemoveItem = async (itemId: number) => {
              setLoading(true)
              const res = await removeBookingItem(itemId)
              setLoading(false)
              if (res.success) {
                     toast.success('Item eliminado')
                     await refreshData()
              } else {
                     toast.error(res.error || 'Error al eliminar item')
              }
       }

       const handlePayment = async (amountOverride?: number) => {
              const amount = amountOverride || Number(paymentAmount)
              if (!amount || amount <= 0) return toast.warning('Ingrese un monto válido')

              setLoading(true)
              const res = await payBooking(booking.id, amount, paymentMethod)
              setLoading(false)

              if (res.success) {
                     toast.success(`Pago de $${amount} registrado exitosamente`)
                     setPaymentAmount("")
                     await refreshData()
                     onUpdate()
              } else {
                     toast.error((res as any).error || 'Error al procesar el pago')
              }
       }

       const handleSaveSplit = async (updatedPlayers: any[]) => {
              setLoading(true)
              const res = await manageSplitPlayers(booking.id, updatedPlayers)
              setLoading(false)
              if (res.success) {
                     toast.success('Jugadores actualizados')
                     await refreshData()
              }
       }

       const handleGenerateLink = async (amount: number) => {
              if (!amount || amount <= 0) return toast.warning('Monto inválido')
              setLoading(true)
              const res = await generatePaymentLink(booking.id, amount)
              setLoading(false)
              if (res.success && res.url) {
                     navigator.clipboard.writeText(res.url)
                     toast.success("Link copiado al portapapeles")
              } else {
                     toast.error(res.error || "Error al generar link")
              }
       }

       // --- ADAPTER ---
       const adaptedBooking: Booking | null = useMemo(() => {
              if (!booking) return null

              const itemsTotal = booking.items?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0) || 0
              const totalPaid = booking.transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0

              const start = new Date(booking.startTime)
              const end = new Date(booking.endTime)
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
                            className="relative z-10 w-full md:max-w-5xl h-[100dvh] md:h-[85vh] bg-background md:rounded-3xl shadow-2xl overflow-hidden border-t md:border border-border flex flex-col md:flex-row"
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
                            <div className="hidden md:flex w-72 bg-[#121214] border-r border-white/5 flex-col p-6 shrink-0">
                                   <div className="flex items-center gap-3 mb-8">
                                          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-foreground text-xl font-bold shadow-lg shadow-[var(--primary)]/20">
                                                 {client.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="min-w-0">
                                                 <h2 className="text-foreground font-bold truncate leading-tight">{client.name}</h2>
                                                 <div className="flex gap-2">
                                                        <span className="text-[10px] bg-white/5 text-muted-foreground/60 px-2 rounded-full border border-white/5">
                                                               {schedule.courtName}
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>

                                   <nav className="flex-1 space-y-2">
                                          <button
                                                 onClick={() => setActiveTab('gestion')}
                                                 className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                                        activeTab === 'gestion'
                                                               ? "bg-white/10 text-foreground shadow-inner"
                                                               : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                                 )}
                                          >
                                                 <Banknote className={cn("w-5 h-5", activeTab === 'gestion' ? "text-[var(--primary)]" : "text-muted-foreground group-hover:text-zinc-300")} />
                                                 Resumen y Pago
                                          </button>
                                          <button
                                                 onClick={() => setActiveTab('jugadores')}
                                                 className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                                        activeTab === 'jugadores'
                                                               ? "bg-white/10 text-foreground shadow-inner"
                                                               : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                                 )}
                                          >
                                                 <Users className={cn("w-5 h-5", activeTab === 'jugadores' ? "text-purple-400" : "text-muted-foreground group-hover:text-zinc-300")} />
                                                 Jugadores
                                          </button>
                                          <button
                                                 onClick={() => setActiveTab('kiosco')}
                                                 className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                                        activeTab === 'kiosco'
                                                               ? "bg-white/10 text-foreground shadow-inner"
                                                               : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                                 )}
                                          >
                                                 <Store className={cn("w-5 h-5", activeTab === 'kiosco' ? "text-emerald-400" : "text-muted-foreground group-hover:text-zinc-300")} />
                                                 Kiosco
                                          </button>
                                   </nav>

                                   <div className="mt-auto pt-6 border-t border-white/5">
                                          <div className="bg-[#18181b] rounded-xl p-4 border border-white/5">
                                                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Estado del Turno</p>
                                                 <div className="flex justify-between items-center mb-1">
                                                        <span className="text-muted-foreground/60 text-xs text font-bold">Estado</span>
                                                        {pricing.total === 0 ? (
                                                               <span className="text-xs font-bold text-blue-400">SIN CARGO</span>
                                                        ) : (
                                                               <span className={cn("text-xs font-bold", isPaid ? "text-emerald-500" : "text-orange-500")}>
                                                                      {isPaid ? "COMPLETADO" : "PENDIENTE"}
                                                               </span>
                                                        )}
                                                 </div>
                                                 <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground/60 text-xs">Total</span>
                                                        <span className="text-sm font-bold text-foreground">${pricing.total.toLocaleString()}</span>
                                                 </div>
                                          </div>

                                          <button
                                                 onClick={handleCancel}
                                                 disabled={loading}
                                                 className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:text-foreground py-3 hover:bg-red-500 rounded-xl transition-all border border-red-500/10 disabled:opacity-50"
                                          >
                                                 {loading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                                 CANCELAR TURNO
                                          </button>

                                          <button
                                                 onClick={onClose}
                                                 className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground py-3 hover:bg-white/5 rounded-xl transition-colors"
                                          >
                                                 <X size={14} />
                                                 CERRAR VENTANA
                                          </button>
                                   </div>
                            </div>

                            {/* MAIN CONTENT AREA */}
                            <div className="flex-1 bg-background flex flex-col min-w-0 overflow-hidden relative">

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
                                                        <div className="bg-card rounded-2xl p-6 border border-border/50 mb-8">
                                                               <div className="flex items-center justify-between mb-2">
                                                                      <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Estado de Pago</span>
                                                                      {pricing.total === 0 ? (
                                                                             <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                                                                                    SIN CARGO
                                                                             </span>
                                                                      ) : (
                                                                             <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", isPaid ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20")}>
                                                                                    {isPaid ? "COMPLETADO" : "PENDIENTE"}
                                                                             </span>
                                                                      )}
                                                               </div>
                                                               <div className="flex items-baseline gap-1">
                                                                      <span className="text-3xl font-black text-foreground tracking-tighter">
                                                                             ${balance.toLocaleString()}
                                                                      </span>
                                                                      <span className="text-muted-foreground font-bold text-sm">restantes</span>
                                                               </div>
                                                               <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden relative">
                                                                      {pricing.total > 0 && (
                                                                             <div
                                                                                    className={cn("h-full rounded-full transition-all duration-500", isPaid ? "bg-emerald-500" : "bg-orange-500")}
                                                                                    style={{ width: `${Math.min((pricing.paid / pricing.total) * 100, 100)}%` }}
                                                                             />
                                                                      )}
                                                                      {pricing.total === 0 && (
                                                                             <div className="h-full w-full bg-blue-500/50 rounded-full" />
                                                                      )}
                                                               </div>
                                                               <p className="text-muted-foreground text-sm mt-2">
                                                                      {pricing.total === 0
                                                                             ? "Esta reserva no tiene costo asociado (Gratis)."
                                                                             : (balance > 0 ? "El cliente debe abonar el monto restante." : "¡Todo al día! El turno está completamente pagado.")
                                                                      }
                                                               </p>
                                                        </div>

                                                        {/* Payment Actions */}
                                                        {balance > 0 && (
                                                               <PaymentActions
                                                                      bookingId={adaptedBooking.id}
                                                                      balance={balance}
                                                                      onPaymentSuccess={() => {
                                                                             refreshData()
                                                                             onUpdate()
                                                                      }}
                                                               />
                                                        )}

                                                        {/* OPEN MATCH / PARTIDO ABIERTO */}
                                                        <div className={cn("border rounded-2xl p-6 transition-all mb-8", isOpenMatch ? "bg-blue-500/10 border-blue-500/50" : "bg-card border-border/50")}>
                                                               <div className="flex items-center justify-between mb-4">
                                                                      <h3 className={cn("font-bold text-lg flex items-center gap-2", isOpenMatch ? "text-blue-400" : "text-foreground")}>
                                                                             <Users className={cn("w-5 h-5", isOpenMatch ? "text-blue-400" : "text-muted-foreground")} />
                                                                             Partido Abierto
                                                                      </h3>
                                                                      <div className="flex items-center gap-2">
                                                                             <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{isOpenMatch ? 'VISIBLE' : 'OCULTO'}</span>
                                                                             <button
                                                                                    onClick={handleToggleOpenMatch}
                                                                                    disabled={loading}
                                                                                    className={cn("w-12 h-6 rounded-full relative transition-colors", isOpenMatch ? "bg-blue-500" : "bg-zinc-700")}
                                                                             >
                                                                                    <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm", isOpenMatch ? "left-7" : "left-1")} />
                                                                             </button>
                                                                      </div>
                                                               </div>

                                                               {isOpenMatch ? (
                                                                      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                                             <div className="space-y-1">
                                                                                    <label className="text-xs text-blue-300/70 font-bold uppercase">Nivel</label>
                                                                                    <select
                                                                                           className="w-full bg-[#09090B] border border-blue-500/30 rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-blue-500"
                                                                                           value={matchDetails.level}
                                                                                           onChange={(e) => setMatchDetails({ ...matchDetails, level: e.target.value })}
                                                                                    >
                                                                                           {['8va', '7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra'].map(l => (
                                                                                                  <option key={l} value={l}>{l}</option>
                                                                                           ))}
                                                                                    </select>
                                                                             </div>
                                                                             <div className="space-y-1">
                                                                                    <label className="text-xs text-blue-300/70 font-bold uppercase">Género</label>
                                                                                    <select
                                                                                           className="w-full bg-[#09090B] border border-blue-500/30 rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-blue-500"
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
                                                                                           className="w-full bg-blue-500 hover:bg-blue-600 text-foreground font-bold py-2 rounded-lg text-sm transition-colors"
                                                                                    >
                                                                                           Actualizar Datos
                                                                                    </button>
                                                                             </div>
                                                                      </div>
                                                               ) : (
                                                                      <p className="text-muted-foreground text-sm">Activa esta opción si faltan jugadores. El partido aparecerá en la sección pública para que otros se sumen.</p>
                                                               )}
                                                        </div>

                                                        {/* Detail Breakdown */}
                                                        <div className="space-y-3">
                                                               <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest pl-1">Detalle del Consumo</h3>
                                                               <div className="bg-muted/30 rounded-xl overflow-hidden border border-border/50 divide-y divide-border/50">
                                                                      <div className="p-4 flex justify-between items-center group hover:bg-white/5 transition-colors">
                                                                             <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                                                                           <Trophy size={16} />
                                                                                    </div>
                                                                                    <div>
                                                                                           <p className="text-foreground font-medium text-sm">Alquiler de Cancha</p>
                                                                                           <p className="text-muted-foreground text-xs">90 Minutos • {schedule.courtName}</p>
                                                                                    </div>
                                                                             </div>
                                                                             <span className="text-foreground font-bold">${pricing.basePrice.toLocaleString()}</span>
                                                                      </div>

                                                                      {adaptedBooking.products.map(item => (
                                                                             <div key={item.id} className="p-4 flex justify-between items-center group hover:bg-white/5 transition-colors">
                                                                                    <div className="flex items-center gap-3">
                                                                                           <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                                                                  <Store size={16} />
                                                                                           </div>
                                                                                           <div>
                                                                                                  <p className="text-foreground font-medium text-sm">{item.productName} (x{item.quantity})</p>
                                                                                                  <p className="text-muted-foreground text-xs">{item.playerName ? `Para: ${item.playerName}` : 'General'}</p>
                                                                                           </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4">
                                                                                           <span className="text-foreground font-bold">${item.subtotal.toLocaleString()}</span>
                                                                                           <button
                                                                                                  onClick={() => handleRemoveItem(item.id)}
                                                                                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                                                                                           >
                                                                                                  <X size={14} />
                                                                                           </button>
                                                                                    </div>
                                                                             </div>
                                                                      ))}

                                                                      <div className="p-4 bg-white/5 flex justify-between items-center">
                                                                             <span className="text-foreground font-bold">TOTAL</span>
                                                                             <span className="text-xl font-black text-foreground">${pricing.total.toLocaleString()}</span>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Mobile Cancel Button */}
                                                        <div className="md:hidden pt-4 pb-8">
                                                               <button
                                                                      onClick={handleCancel}
                                                                      disabled={loading}
                                                                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                                               >
                                                                      {loading ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                                                      CANCELAR TURNO
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
