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
       Check
} from 'lucide-react'

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
              // if (!confirm('¿Quitar el item?')) return
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
       const formattedDate = format(schedule.startTime, "EEE d MMM", { locale: es })
       const formattedTime = format(schedule.startTime, "HH:mm")
       const balance = pricing.balance
       const isPaid = balance <= 0

       return createPortal(
              <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 min-h-screen transition-colors duration-300 font-sans">

                     {/* OVERLAY BG */}
                     <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                            <div className="absolute inset-0 bg-black/40"></div>
                     </div>

                     <div className="relative z-10 w-full max-w-md bg-[#18181B] rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 transition-all duration-300 transform scale-100 flex flex-col max-h-[95vh]">

                            {/* HEADER */}
                            <div className="p-6 pb-4">
                                   <div className="flex items-start justify-between">
                                          <div className="flex gap-4">
                                                 <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                                                        {client.name.charAt(0).toUpperCase()}
                                                 </div>
                                                 <div>
                                                        <h2 className="text-xl font-bold text-white leading-tight">{client.name}</h2>
                                                        <p className="text-xs text-zinc-400 mt-0.5 tracking-wide">ID: {client.id}</p>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                               {balance > 0 && (
                                                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                                             <AlertTriangle className="w-3 h-3 mr-1" />
                                                                             SALDO: ${balance.toLocaleString()}
                                                                      </span>
                                                               )}
                                                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                      <Calendar className="w-3 h-3 mr-1" />
                                                                      TURNO HOY
                                                               </span>
                                                        </div>
                                                 </div>
                                          </div>
                                          <button
                                                 onClick={onClose}
                                                 className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400"
                                          >
                                                 <X className="w-5 h-5" />
                                          </button>
                                   </div>
                            </div>

                            {/* INFO GRID */}
                            <div className="px-6 grid grid-cols-3 gap-3">
                                   <div className="bg-[#27272A] p-3 rounded-xl border border-zinc-700/50 flex flex-col items-center text-center group hover:border-zinc-600 transition-colors">
                                          <Trophy className="w-5 h-5 text-blue-400 mb-1" />
                                          <span className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Cancha</span>
                                          <span className="text-sm font-bold text-gray-200">{schedule.courtName}</span>
                                   </div>
                                   <div className="bg-[#27272A] p-3 rounded-xl border border-zinc-700/50 flex flex-col items-center text-center group hover:border-zinc-600 transition-colors">
                                          <Calendar className="w-5 h-5 text-blue-400 mb-1" />
                                          <span className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Fecha</span>
                                          <span className="text-sm font-bold text-gray-200 capitalize">{formattedDate}</span>
                                   </div>
                                   <div className="bg-[#27272A] p-3 rounded-xl border border-zinc-700/50 flex flex-col items-center text-center group hover:border-zinc-600 transition-colors">
                                          <Clock className="w-5 h-5 text-blue-400 mb-1" />
                                          <span className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Hora</span>
                                          <span className="text-sm font-bold text-gray-200">{formattedTime}</span>
                                   </div>
                            </div>

                            {/* BIG ACTION BUTTON */}
                            <div className="px-6 mt-4">
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
                                          className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                                   >
                                          <MessageCircle className="w-5 h-5" />
                                          ENVIAR RECORDATORIO
                                   </button>
                            </div>

                            {/* TABS HEADER */}
                            <div className="px-6 mt-6 border-b border-zinc-800">
                                   <div className="flex gap-4">
                                          {[
                                                 { id: 'gestion', label: 'GESTIÓN', icon: Banknote },
                                                 { id: 'kiosco', label: 'KIOSCO', icon: Store },
                                                 { id: 'jugadores', label: 'JUGADORES', icon: Users },
                                          ].map(tab => (
                                                 <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id as any)}
                                                        className={cn(
                                                               "flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors",
                                                               activeTab === tab.id
                                                                      ? "border-blue-500 text-blue-400"
                                                                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                                                        )}
                                                 >
                                                        <tab.icon className="w-4 h-4" />
                                                        {tab.label}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            {/* TABS CONTENT */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#121214]">

                                   {/* === TAB GESTION === */}
                                   {activeTab === 'gestion' && (
                                          <div className="p-6">
                                                 <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Detalle de Cobro</h3>

                                                 <div className="space-y-3 mb-4">
                                                        <div className="flex justify-between items-center text-sm">
                                                               <span className="text-zinc-300">Precio turno</span>
                                                               <span className="font-semibold text-white">${pricing.basePrice.toLocaleString()}</span>
                                                        </div>
                                                        {pricing.kioskExtras > 0 && (
                                                               <div className="flex justify-between items-center text-sm">
                                                                      <span className="text-zinc-300">Kiosco</span>
                                                                      <span className="font-semibold text-white">${pricing.kioskExtras.toLocaleString()}</span>
                                                               </div>
                                                        )}
                                                        <div className="flex justify-between items-center text-sm pt-2 border-t border-zinc-800">
                                                               <span className="text-white font-bold text-lg">Total</span>
                                                               <span className="font-bold text-white text-lg">${pricing.total.toLocaleString()}</span>
                                                        </div>
                                                 </div>

                                                 {balance > 0 ? (
                                                        <>
                                                               <div className="p-4 rounded-xl bg-[#1E1A16] border border-orange-900/30 flex justify-between items-center mb-6">
                                                                      <span className="text-orange-500 font-bold text-sm tracking-wide">FALTA PAGAR</span>
                                                                      <span className="text-orange-500 font-bold text-xl">${balance.toLocaleString()}</span>
                                                               </div>

                                                               <div>
                                                                      <button
                                                                             onClick={() => handlePayment(balance)}
                                                                             className="group w-full bg-[#D2F602] hover:bg-[#c2e302] text-black rounded-2xl p-3 shadow-[0_0_20px_rgba(210,246,2,0.4)] transition-all duration-300 relative overflow-hidden active:scale-[0.99]"
                                                                      >
                                                                             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                                             <div className="relative flex flex-col items-center justify-center">
                                                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Acción Sugerida</span>
                                                                                    <div className="flex items-baseline gap-1">
                                                                                           <span className="text-xl font-black tracking-tight">COBRAR TODO</span>
                                                                                           <span className="text-xl font-black tracking-tight">${balance.toLocaleString()}</span>
                                                                                    </div>
                                                                             </div>
                                                                      </button>
                                                               </div>

                                                               <div className="mt-5 flex items-center justify-center gap-4">
                                                                      <div className="h-px bg-zinc-800 w-full"></div>
                                                                      <span className="px-3 text-xs font-medium text-zinc-500 uppercase whitespace-nowrap cursor-pointer hover:text-blue-400 transition-colors">O Pago Parcial</span>
                                                                      <div className="h-px bg-zinc-800 w-full"></div>
                                                               </div>

                                                               <div className="mt-4 flex gap-2">
                                                                      <div className="relative flex-1">
                                                                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                                                                             <input
                                                                                    type="number"
                                                                                    value={paymentAmount}
                                                                                    onChange={e => setPaymentAmount(e.target.value)}
                                                                                    className="w-full bg-[#18181B] border border-zinc-700 rounded-xl py-3 pl-8 pr-4 text-white font-bold focus:ring-1 focus:ring-[#D2F602] focus:border-[#D2F602] outline-none transition-all placeholder:text-zinc-600"
                                                                                    placeholder="Monto"
                                                                             />
                                                                      </div>
                                                                      <select
                                                                             value={paymentMethod}
                                                                             onChange={e => setPaymentMethod(e.target.value)}
                                                                             className="bg-[#18181B] border border-zinc-700 rounded-xl px-3 text-white text-sm font-bold focus:ring-1 focus:ring-[#D2F602] outline-none"
                                                                      >
                                                                             <option value="CASH">Efectivo</option>
                                                                             <option value="TRANSFER">Transfer</option>
                                                                             <option value="MP">MP</option>
                                                                      </select>
                                                                      <button
                                                                             onClick={() => handlePayment()}
                                                                             className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors"
                                                                      >
                                                                             <ArrowRight className="w-5 h-5" />
                                                                      </button>
                                                               </div>
                                                        </>
                                                 ) : (
                                                        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-center mt-4">
                                                               <Check className="w-12 h-12 text-emerald-500 mb-2" />
                                                               <h3 className="text-emerald-400 font-bold text-lg">Turno Pagado</h3>
                                                               <p className="text-emerald-500/60 text-xs mt-1">No se registran deudas pendientes</p>
                                                        </div>
                                                 )}
                                          </div>
                                   )}

                                   {/* === TAB KIOSCO === */}
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

                                   {/* === TAB JUGADORES === */}
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

                            {/* FOOTER */}
                            <div className="bg-[#18181B] px-6 py-3 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                                   <div className="flex gap-3">
                                          <span>ID: #{booking.id}</span>
                                          <span>CREADO: {format(new Date(booking.createdAt), "dd/MM HH:mm")}</span>
                                   </div>
                                   <button
                                          onClick={onClose}
                                          className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                                   >
                                          CERRAR <span className="bg-zinc-800 px-1 rounded text-[9px]">[ESC]</span>
                                   </button>
                            </div>

                     </div>
              </div>,
              document.body
       )
}
