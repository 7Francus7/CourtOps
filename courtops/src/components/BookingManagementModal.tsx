'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { format, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import {
       cancelBooking,
       updateBookingStatus,
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
       MessageCircle
} from 'lucide-react'

// Custom colors from user snippet
const COLORS = {
       backgroundDark: "#0a0a0b",
       cardDark: "#161618",
       borderDark: "#27272a",
       primary: "#3b82f6",
       accent: "#ccff00",
}

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

       // Split Players State
       const [splitPlayers, setSplitPlayers] = useState<any[]>([])

       // Initial Load
       useEffect(() => {
              if (initialBooking?.id) {
                     refreshData()
                     getProducts().then(setProducts).catch(e => console.error(e))
                     getCourts().then(setCourts).catch(e => console.error(e))
              }
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
                            setSplitPlayers((b as any).players || [])
                     } else {
                            setError(res.error || 'Error al cargar detalles del turno')
                     }
              } catch (err: any) {
                     setError(err.message || 'Error de conexión')
              } finally {
                     setLoading(false)
              }
       }

       // --- ACTIONS ---
       const handleCancel = async () => {
              if (!confirm('¿Seguro que deseas CANCELAR este turno?')) return
              setLoading(true)
              const res = await cancelBooking(booking.id)
              setLoading(false)
              if (res.success) {
                     toast.success('Reserva cancelada correctamente')
                     onUpdate()
                     onClose()
              } else {
                     toast.error(res.error || 'No se pudo cancelar la reserva')
              }
       }

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
              if (!confirm('¿Quitar el item?')) return
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
              if (!confirm(`¿Registrar pago de $${amount}?`)) return

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

       const handleSaveSplit = async () => {
              setLoading(true)
              await manageSplitPlayers(booking.id, splitPlayers)
              setLoading(false)
              await refreshData()
       }

       // --- ADAPTER ---
       const adaptedBooking: Booking | null = useMemo(() => {
              if (!booking) return null

              const itemsTotal = booking.items?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0) || 0
              const totalPaid = booking.transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0

              const start = new Date(booking.startTime)
              const end = new Date(booking.endTime)
              const duration = differenceInMinutes(end, start) || 90

              // Map items to products according to Booking interface
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

       if (!booking || !adaptedBooking) return null

       // --- FORMAT HELPERS ---
       const { client, schedule, pricing } = adaptedBooking
       const formattedDate = format(schedule.startTime, "EEE d MMM", { locale: es })
       const formattedTime = format(schedule.startTime, "HH:mm")

       const balance = pricing.balance
       const isPaid = balance <= 0
       const displayBalance = balance > 0 ? `$${balance.toLocaleString()}` : 'Pagado'

       return (
              <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
                     {/* CONTAINER */}
                     <div
                            className="w-full max-w-md bg-[#0a0a0b] text-slate-100 min-h-[90vh] sm:min-h-0 sm:h-auto sm:max-h-[90vh] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200"
                     >
                            {/* HEADER */}
                            <header className="p-5 space-y-4 bg-[#0a0a0b] sticky top-0 z-10">
                                   <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-4">
                                                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-[#3b82f6] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#3b82f6]/20">
                                                        {client.name.charAt(0).toUpperCase()}
                                                 </div>
                                                 <div>
                                                        <h1 className="text-2xl font-extrabold tracking-tight text-white">{client.name}</h1>
                                                        <p className="text-slate-400 text-sm font-medium">ID: {booking.id}</p>
                                                 </div>
                                          </div>
                                          <div className="flex gap-2">
                                                 <button onClick={onClose} className="bg-[#27272a] p-2 rounded-full hover:bg-white/10 transition-colors">
                                                        <X className="w-5 h-5 text-white" />
                                                 </button>
                                          </div>
                                   </div>

                                   <div className="flex flex-wrap gap-2">
                                          {balance > 0 && (
                                                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        Faltan: ${balance.toLocaleString()}
                                                 </div>
                                          )}
                                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider">
                                                 <Calendar className="w-4 h-4" />
                                                 Turno Hoy
                                          </div>
                                   </div>

                                   <div className="grid grid-cols-3 gap-2">
                                          <div className="bg-[#161618] p-3 rounded-2xl border border-[#27272a] flex flex-col items-center gap-1">
                                                 <Trophy className="text-[#3b82f6] w-6 h-6" />
                                                 <span className="text-[10px] uppercase font-bold text-slate-400">Cancha</span>
                                                 <span className="font-bold text-sm text-white">{schedule.courtName}</span>
                                          </div>
                                          <div className="bg-[#161618] p-3 rounded-2xl border border-[#27272a] flex flex-col items-center gap-1">
                                                 <Calendar className="text-[#3b82f6] w-6 h-6" />
                                                 <span className="text-[10px] uppercase font-bold text-slate-400">Fecha</span>
                                                 <span className="font-bold text-sm text-white capitalize">{formattedDate}</span>
                                          </div>
                                          <div className="bg-[#161618] p-3 rounded-2xl border border-[#27272a] flex flex-col items-center gap-1">
                                                 <Clock className="text-[#3b82f6] w-6 h-6" />
                                                 <span className="text-[10px] uppercase font-bold text-slate-400">Hora</span>
                                                 <span className="font-bold text-sm text-white">{formattedTime}</span>
                                          </div>
                                   </div>

                                   <button
                                          onClick={() => {
                                                 const phone = client.phone?.replace(/\D/g, '')
                                                 if (phone) window.open(`https://wa.me/${phone}`, '_blank')
                                          }}
                                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                   >
                                          <MessageCircle className="w-5 h-5 fill-current" />
                                          ENVIAR WHATSAPP
                                   </button>
                            </header>

                            {/* NAV */}
                            <nav className="flex px-5 border-b border-[#27272a] sticky top-[280px] bg-[#0a0a0b] z-10 shrink-0">
                                   <button
                                          onClick={() => setActiveTab('gestion')}
                                          className={cn("flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2", activeTab === 'gestion' ? "border-[#3b82f6] text-[#3b82f6]" : "border-transparent text-slate-400 hover:text-white")}
                                   >
                                          <Banknote className="w-5 h-5" />
                                          GESTIÓN
                                   </button>
                                   <button
                                          onClick={() => setActiveTab('kiosco')}
                                          className={cn("flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2", activeTab === 'kiosco' ? "border-[#3b82f6] text-[#3b82f6]" : "border-transparent text-slate-400 hover:text-white")}
                                   >
                                          <Store className="w-5 h-5" />
                                          KIOSCO
                                   </button>
                                   <button
                                          onClick={() => setActiveTab('jugadores')}
                                          className={cn("flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2", activeTab === 'jugadores' ? "border-[#3b82f6] text-[#3b82f6]" : "border-transparent text-slate-400 hover:text-white")}
                                   >
                                          <Users className="w-5 h-5" />
                                          JUGADORES
                                   </button>
                            </nav>

                            {/* MAIN CONTENT */}
                            <main className="p-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar">

                                   {/* === TAB: GESTION === */}
                                   {activeTab === 'gestion' && (
                                          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                 {/* Detalle de Cobro */}
                                                 <div className="bg-[#161618] rounded-3xl p-6 border border-[#27272a] shadow-sm">
                                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Detalle de Cobro</h3>
                                                        <div className="space-y-4">
                                                               <div className="flex justify-between items-center pb-4 border-b border-[#27272a]">
                                                                      <span className="text-slate-400 font-medium">Precio turno</span>
                                                                      <span className="font-bold text-white">${pricing.basePrice.toLocaleString()}</span>
                                                               </div>
                                                               {pricing.kioskExtras > 0 && (
                                                                      <div className="flex justify-between items-center pb-4 border-b border-[#27272a]">
                                                                             <span className="text-slate-400 font-medium">Kiosco</span>
                                                                             <span className="font-bold text-white">${pricing.kioskExtras.toLocaleString()}</span>
                                                                      </div>
                                                               )}
                                                               <div className="flex justify-between items-center text-lg">
                                                                      <span className="font-bold text-white">Total</span>
                                                                      <span className="font-black text-white">${pricing.total.toLocaleString()}</span>
                                                               </div>
                                                               {pricing.paid > 0 && (
                                                                      <div className="flex justify-between items-center text-sm text-green-500">
                                                                             <span className="font-bold">Pagado</span>
                                                                             <span className="font-bold">-${pricing.paid.toLocaleString()}</span>
                                                                      </div>
                                                               )}
                                                               <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 flex justify-between items-center">
                                                                      <span className="font-bold text-amber-500 uppercase tracking-tight">{balance <= 0 ? 'COMPLETADO' : 'FALTA PAGAR'}</span>
                                                                      <span className="text-2xl font-black text-amber-500">${balance > 0 ? balance.toLocaleString() : '0'}</span>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 {/* Actions */}
                                                 {balance > 0 ? (
                                                        <div className="space-y-4">
                                                               <button
                                                                      onClick={() => handlePayment(balance)}
                                                                      className="w-full p-6 bg-[#ccff00] rounded-3xl shadow-[0_8px_30px_rgba(204,255,0,0.2)] flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                                                               >
                                                                      <div className="text-left">
                                                                             <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Acción sugerida</p>
                                                                             <h2 className="text-2xl font-black text-black">COBRAR TODO</h2>
                                                                      </div>
                                                                      <div className="bg-black/10 px-4 py-2 rounded-xl text-black font-extrabold text-xl">
                                                                             ${balance.toLocaleString()}
                                                                      </div>
                                                               </button>

                                                               <div className="flex items-center gap-3 py-2">
                                                                      <div className="h-[1px] flex-1 bg-[#27272a]"></div>
                                                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">O Pago Parcial</span>
                                                                      <div className="h-[1px] flex-1 bg-[#27272a]"></div>
                                                               </div>

                                                               <div className="flex gap-2">
                                                                      <div className="relative flex-1">
                                                                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                                             <input
                                                                                    value={paymentAmount}
                                                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                                                    type="number"
                                                                                    className="w-full pl-8 pr-4 py-4 bg-[#161618] border-none rounded-2xl font-bold focus:ring-2 focus:ring-[#3b82f6] text-lg text-white placeholder:text-slate-600 outline-none"
                                                                                    placeholder="Monto..."
                                                                             />
                                                                      </div>
                                                                      <div className="relative min-w-[120px]">
                                                                             <select
                                                                                    value={paymentMethod}
                                                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                                                    className="w-full pl-4 pr-10 py-4 bg-[#161618] border-none rounded-2xl font-bold appearance-none focus:ring-2 focus:ring-[#3b82f6] text-white outline-none cursor-pointer"
                                                                             >
                                                                                    <option value="CASH">Efectivo 💵</option>
                                                                                    <option value="TRANSFER">Transf 📲</option>
                                                                                    <option value="CARD">Tarjeta 💳</option>
                                                                                    <option value="MP">MP 📱</option>
                                                                             </select>
                                                                             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-5 h-5" />
                                                                      </div>
                                                                      <button
                                                                             onClick={() => handlePayment()}
                                                                             className="bg-[#3b82f6] hover:bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-[#3b82f6]/20 active:scale-95"
                                                                      >
                                                                             <ArrowRight className="w-6 h-6" />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 ) : (
                                                        <div className="p-8 text-center bg-[#161618] rounded-3xl border border-[#27272a]">
                                                               <div className="text-4xl mb-4">✨</div>
                                                               <h3 className="text-white font-bold text-xl">¡Todo Pagado!</h3>
                                                               <p className="text-slate-400 text-sm mt-2">Esta reserva no tiene saldo pendiente.</p>
                                                        </div>
                                                 )}

                                                 <div className="pt-8">
                                                        <button
                                                               onClick={handleCancel}
                                                               className="w-full py-4 text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 rounded-xl transition-colors"
                                                        >
                                                               Cancelar Reserva
                                                        </button>
                                                 </div>
                                          </div>
                                   )}

                                   {/* === TAB: KIOSCO === */}
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
                                                 players={[adaptedBooking.client.name, ...splitPlayers.map(p => p.name)]}
                                          />
                                   )}

                                   {/* === TAB: JUGADORES === */}
                                   {activeTab === 'jugadores' && (
                                          <PlayersTab
                                                 totalAmount={pricing.total}
                                                 players={splitPlayers}
                                                 setPlayers={setSplitPlayers}
                                                 onSave={handleSaveSplit}
                                                 loading={loading}
                                          />
                                   )}

                            </main>

                            {/* FOOTER */}
                            <footer className="bg-[#161618] border-t border-[#27272a] px-5 py-3 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0 safe-area-bottom">
                                   <div className="flex gap-4">
                                          <span>ID: #{booking.id}</span>
                                          <span>CREADO: {format(new Date(booking.createdAt), "dd/MM HH:mm")}</span>
                                   </div>
                                   <div className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={onClose}>
                                          Cerrar <span className="bg-[#27272a] px-1 rounded text-slate-400">[ESC]</span>
                                   </div>
                            </footer>
                     </div>
              </div>
       )
}
