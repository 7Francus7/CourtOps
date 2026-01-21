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
       manageSplitPlayers
} from '@/actions/manageBooking'
import { getCourts } from '@/actions/turnero'
import { cn } from '@/lib/utils'
import { KioskTab } from './booking/KioskTab'
import { PlayersTab } from './booking/PlayersTab'
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
       Loader2
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
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                     <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={onClose}
                     />
                     <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="relative z-10 w-full max-w-5xl h-[85vh] bg-[#09090B] rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row"
                     >
                            {/* SIDEBAR NAVIGATION */}
                            <div className="w-full md:w-72 bg-[#121214] border-r border-white/5 flex flex-col p-6 shrink-0">
                                   <div className="flex items-center gap-3 mb-8">
                                          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[var(--primary)]/20">
                                                 {client.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="min-w-0">
                                                 <h2 className="text-white font-bold truncate leading-tight">{client.name}</h2>
                                                 <div className="flex gap-2">
                                                        <span className="text-[10px] bg-white/5 text-zinc-400 px-2 rounded-full border border-white/5">
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
                                                               ? "bg-white/10 text-white shadow-inner"
                                                               : "text-zinc-500 hover:text-white hover:bg-white/5"
                                                 )}
                                          >
                                                 <Banknote className={cn("w-5 h-5", activeTab === 'gestion' ? "text-[var(--primary)]" : "text-zinc-500 group-hover:text-zinc-300")} />
                                                 Resumen y Pago
                                          </button>
                                          <button
                                                 onClick={() => setActiveTab('jugadores')}
                                                 className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                                        activeTab === 'jugadores'
                                                               ? "bg-white/10 text-white shadow-inner"
                                                               : "text-zinc-500 hover:text-white hover:bg-white/5"
                                                 )}
                                          >
                                                 <Users className={cn("w-5 h-5", activeTab === 'jugadores' ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-300")} />
                                                 Jugadores
                                          </button>
                                          <button
                                                 onClick={() => setActiveTab('kiosco')}
                                                 className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                                        activeTab === 'kiosco'
                                                               ? "bg-white/10 text-white shadow-inner"
                                                               : "text-zinc-500 hover:text-white hover:bg-white/5"
                                                 )}
                                          >
                                                 <Store className={cn("w-5 h-5", activeTab === 'kiosco' ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300")} />
                                                 Kiosco
                                          </button>
                                   </nav>

                                   <div className="mt-auto pt-6 border-t border-white/5">
                                          <div className="bg-[#18181b] rounded-xl p-4 border border-white/5">
                                                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Estado del Turno</p>
                                                 <div className="flex justify-between items-center mb-1">
                                                        <span className="text-zinc-400 text-xs">Pago</span>
                                                        <span className={cn("text-xs font-bold", isPaid ? "text-emerald-500" : "text-orange-500")}>
                                                               {isPaid ? "COMPLETADO" : "PENDIENTE"}
                                                        </span>
                                                 </div>
                                                 <div className="flex justify-between items-center">
                                                        <span className="text-zinc-400 text-xs">Total</span>
                                                        <span className="text-sm font-bold text-white">${pricing.total.toLocaleString()}</span>
                                                 </div>
                                          </div>

                                          <button
                                                 onClick={onClose}
                                                 className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-white py-3 hover:bg-white/5 rounded-xl transition-colors"
                                          >
                                                 <X size={14} />
                                                 CERRAR VENTANA
                                          </button>
                                   </div>
                            </div>

                            {/* MAIN CONTENT AREA */}
                            <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 overflow-hidden relative">

                                   {/* Header Info Bar */}
                                   <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#09090B]/50 backdrop-blur-md sticky top-0 z-20">
                                          <div className="flex items-center gap-6">
                                                 <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                                                        <Calendar className="w-4 h-4 text-[var(--primary)]" />
                                                        <span className="capitalize">{formattedDate}</span>
                                                 </div>
                                                 <div className="w-px h-4 bg-white/10" />
                                                 <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
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
                                   <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                          {activeTab === 'gestion' && (
                                                 <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="max-w-2xl mx-auto space-y-8"
                                                 >
                                                        {/* Big Balance Status */}
                                                        <div className="flex flex-col items-center justify-center py-6">
                                                               <span className="text-zinc-500 font-medium text-sm mb-2 uppercase tracking-widest">Saldo Pendiente</span>
                                                               <div className="relative">
                                                                      <span className={cn("text-6xl font-black tracking-tighter", balance > 0 ? "text-white" : "text-emerald-500")}>
                                                                             ${balance.toLocaleString()}
                                                                      </span>
                                                                      {balance > 0 && <span className="absolute -top-2 -right-6 flex h-4 w-4">
                                                                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                                             <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                                                                      </span>}
                                                               </div>
                                                               <p className="text-zinc-500 text-sm mt-2">
                                                                      {balance > 0 ? "El cliente debe abonar el monto restante." : "¡Todo al día! El turno está completamente pagado."}
                                                               </p>
                                                        </div>

                                                        {/* Payment Actions */}
                                                        {balance > 0 && (
                                                               <div className="bg-[#121214] border border-white/5 rounded-2xl p-6  shadow-xl shadow-black/20">
                                                                      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                                                             <Wallet className="text-[var(--primary)]" />
                                                                             Registrar Cobro
                                                                      </h3>

                                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                             {/* Quick Pay Full */}
                                                                             <button
                                                                                    onClick={() => handlePayment(balance)}
                                                                                    className="col-span-full bg-[var(--primary)] hover:opacity-90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg shadow-lg shadow-[var(--primary)]/20 active:scale-[0.99] transition-all"
                                                                             >
                                                                                    COBRAR TOTAL (${balance.toLocaleString()}) <ArrowRight size={20} />
                                                                             </button>

                                                                             <div className="col-span-full relative flex items-center gap-3 py-2">
                                                                                    <div className="h-px bg-white/10 flex-1"></div>
                                                                                    <span className="text-zinc-600 text-xs font-bold uppercase">Pago Parcial</span>
                                                                                    <div className="h-px bg-white/10 flex-1"></div>
                                                                             </div>

                                                                             <div className="relative">
                                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                                                                                    <input
                                                                                           type="number"
                                                                                           value={paymentAmount}
                                                                                           onChange={e => setPaymentAmount(e.target.value)}
                                                                                           className="w-full bg-[#18181B] border border-zinc-700/50 rounded-xl py-3 pl-8 pr-4 text-white font-bold outline-none focus:border-[var(--primary)] transition-colors"
                                                                                           placeholder="Monto parcial"
                                                                                    />
                                                                             </div>
                                                                             <div className="flex gap-2">
                                                                                    <select
                                                                                           value={paymentMethod}
                                                                                           onChange={e => setPaymentMethod(e.target.value)}
                                                                                           className="flex-1 bg-[#18181B] border border-zinc-700/50 rounded-xl px-4 text-white text-sm font-bold outline-none focus:border-[var(--primary)] cursor-pointer"
                                                                                    >
                                                                                           <option value="CASH">Efectivo</option>
                                                                                           <option value="TRANSFER">Transferencia</option>
                                                                                           <option value="MP">MercadoPago</option>
                                                                                           <option value="CARD">Tarjeta</option>
                                                                                    </select>
                                                                                    <button
                                                                                           onClick={() => handlePayment()}
                                                                                           className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-xl transition-colors border border-white/5"
                                                                                    >
                                                                                           <Check className="w-5 h-5" />
                                                                                    </button>
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        )}

                                                        {/* Detail Breakdown */}
                                                        <div className="space-y-3">
                                                               <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest pl-1">Detalle del Consumo</h3>
                                                               <div className="bg-[#121212]/50 rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5">
                                                                      <div className="p-4 flex justify-between items-center group hover:bg-white/5 transition-colors">
                                                                             <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                                                                           <Trophy size={16} />
                                                                                    </div>
                                                                                    <div>
                                                                                           <p className="text-white font-medium text-sm">Alquiler de Cancha</p>
                                                                                           <p className="text-zinc-500 text-xs">90 Minutos • {schedule.courtName}</p>
                                                                                    </div>
                                                                             </div>
                                                                             <span className="text-white font-bold">${pricing.basePrice.toLocaleString()}</span>
                                                                      </div>

                                                                      {adaptedBooking.products.map(item => (
                                                                             <div key={item.id} className="p-4 flex justify-between items-center group hover:bg-white/5 transition-colors">
                                                                                    <div className="flex items-center gap-3">
                                                                                           <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                                                                  <Store size={16} />
                                                                                           </div>
                                                                                           <div>
                                                                                                  <p className="text-white font-medium text-sm">{item.productName} (x{item.quantity})</p>
                                                                                                  <p className="text-zinc-500 text-xs">{item.playerName ? `Para: ${item.playerName}` : 'General'}</p>
                                                                                           </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4">
                                                                                           <span className="text-white font-bold">${item.subtotal.toLocaleString()}</span>
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
                                                                             <span className="text-white font-bold">TOTAL</span>
                                                                             <span className="text-xl font-black text-white">${pricing.total.toLocaleString()}</span>
                                                                      </div>
                                                               </div>
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
