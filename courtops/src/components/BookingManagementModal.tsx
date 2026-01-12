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

       return (
              <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
                     {/* CONTAINER - Responsive Width */}
                     <div
                            className="w-full sm:max-w-xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-[#0a0a0b] text-slate-100 min-h-[90vh] sm:min-h-0 sm:h-[80vh] sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200"
                     >
                            {/* HEADER - Single column on mobile, split on desktop */}
                            <header className="p-5 md:p-8 space-y-6 bg-[#0a0a0b] border-b border-[#27272a] shrink-0">
                                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                          {/* Client Profile */}
                                          <div className="flex items-center gap-5">
                                                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-[#3b82f6] flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#3b82f6]/20 shrink-0">
                                                        {client.name.charAt(0).toUpperCase()}
                                                 </div>
                                                 <div>
                                                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1">{client.name}</h1>
                                                        <div className="flex items-center gap-3">
                                                               <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Reserva #{booking.id}</p>
                                                               <span className={cn(
                                                                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm",
                                                                      isPaid ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                               )}>
                                                                      {isPaid ? 'Pagado Total' : 'Saldo Pendiente'}
                                                               </span>
                                                        </div>
                                                 </div>
                                          </div>

                                          {/* Quick Actions & Info */}
                                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                                 <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                                                        <div className="flex flex-col items-center px-4 py-2">
                                                               <Trophy className="text-[#3b82f6] w-5 h-5 mb-1" />
                                                               <span className="text-[9px] uppercase font-bold text-slate-500">Cancha</span>
                                                               <span className="font-bold text-sm text-white">{schedule.courtName}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center px-4 py-2 border-x border-white/5">
                                                               <Calendar className="text-[#3b82f6] w-5 h-5 mb-1" />
                                                               <span className="text-[9px] uppercase font-bold text-slate-500">Fecha</span>
                                                               <span className="font-bold text-sm text-white capitalize">{formattedDate}</span>
                                                        </div>
                                                        <div className="flex flex-col items-center px-4 py-2">
                                                               <Clock className="text-[#3b82f6] w-5 h-5 mb-1" />
                                                               <span className="text-[9px] uppercase font-bold text-slate-500">Hora</span>
                                                               <span className="font-bold text-sm text-white">{formattedTime}</span>
                                                        </div>
                                                 </div>

                                                 <div className="flex gap-2">
                                                        <button
                                                               onClick={() => {
                                                                      const phone = client.phone?.replace(/\D/g, '')
                                                                      if (phone) window.open(`https://wa.me/${phone}`, '_blank')
                                                               }}
                                                               className="flex-1 sm:flex-none h-full px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 py-4 sm:py-0"
                                                        >
                                                               <MessageCircle className="w-5 h-5 fill-current" />
                                                               <span className="sm:hidden lg:inline">WHATSAPP</span>
                                                        </button>
                                                        <button onClick={onClose} className="bg-[#27272a] p-4 rounded-2xl hover:bg-white/10 transition-colors shrink-0">
                                                               <X className="w-6 h-6 text-white" />
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            </header>

                            {/* NAVIGATION - Sticky and centered/proportional */}
                            <nav className="flex px-5 md:px-8 border-b border-[#27272a] bg-[#0a0a0b] sticky top-0 z-20 shrink-0">
                                   <div className="flex w-full md:max-w-2xl gap-2">
                                          {[
                                                 { id: 'gestion', icon: Banknote, label: 'GESTIÓN' },
                                                 { id: 'kiosco', icon: Store, label: 'KIOSCO' },
                                                 { id: 'jugadores', icon: Users, label: 'JUGADORES' }
                                          ].map((tab) => (
                                                 <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id as any)}
                                                        className={cn(
                                                               "flex-1 md:flex-none md:min-w-[140px] py-5 text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all border-b-2 outline-none",
                                                               activeTab === tab.id
                                                                      ? "border-[#3b82f6] text-[#3b82f6]"
                                                                      : "border-transparent text-slate-500 hover:text-white"
                                                        )}
                                                 >
                                                        <tab.icon className="w-5 h-5" />
                                                        {tab.label}
                                                 </button>
                                          ))}
                                   </div>
                            </nav>

                            {/* MAIN CONTENT AREA */}
                            <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a0b]">
                                   <div className="p-5 md:p-8 max-w-7xl mx-auto h-full">

                                          {/* === TAB: GESTION === */}
                                          {activeTab === 'gestion' && (
                                                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                        {/* Summary & Price Column */}
                                                        <div className="lg:col-span-7 space-y-6">
                                                               <div className="bg-[#161618] rounded-[32px] p-8 border border-[#27272a] shadow-xl relative overflow-hidden">
                                                                      <div className="absolute top-0 right-0 p-8 text-slate-700/20">
                                                                             <Banknote size={120} />
                                                                      </div>
                                                                      <h3 className="text-xs font-black text-[#3b82f6] uppercase tracking-[0.2em] mb-8">Detalle de Operación</h3>
                                                                      <div className="space-y-6 relative z-10">
                                                                             <div className="flex justify-between items-center pb-4 border-b border-white/[0.03]">
                                                                                    <span className="text-slate-400 font-bold text-lg">Turno de Cancha</span>
                                                                                    <span className="font-bold text-white text-xl">${pricing.basePrice.toLocaleString()}</span>
                                                                             </div>
                                                                             {pricing.kioskExtras > 0 && (
                                                                                    <div className="flex justify-between items-center pb-4 border-b border-white/[0.03]">
                                                                                           <span className="text-slate-400 font-bold text-lg">Consumos Kiosco</span>
                                                                                           <span className="font-bold text-white text-xl">${pricing.kioskExtras.toLocaleString()}</span>
                                                                                    </div>
                                                                             )}
                                                                             <div className="flex justify-between items-center py-4">
                                                                                    <span className="text-white font-black text-2xl">Total General</span>
                                                                                    <span className="font-black text-white text-3xl">${pricing.total.toLocaleString()}</span>
                                                                             </div>
                                                                             {pricing.paid > 0 && (
                                                                                    <div className="flex justify-between items-center px-4 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                                                                           <span className="font-black text-emerald-500 uppercase tracking-widest text-sm">Ya Pagado</span>
                                                                                           <span className="font-black text-emerald-500 text-lg">-${pricing.paid.toLocaleString()}</span>
                                                                                    </div>
                                                                             )}
                                                                             <div className="mt-4 p-8 bg-amber-500/5 rounded-3xl border-2 border-dashed border-amber-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                                                    <div>
                                                                                           <p className="text-amber-500 font-black text-sm uppercase tracking-widest mb-1">{balance <= 0 ? 'ESTADO' : 'SALDO POR COBRAR'}</p>
                                                                                           <h2 className="text-white font-black text-4xl">{balance <= 0 ? 'COMPLETADO' : `$${balance.toLocaleString()}`}</h2>
                                                                                    </div>
                                                                                    <div className="text-5xl">{balance <= 0 ? '✅' : '⏳'}</div>
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Actions Column */}
                                                        <div className="lg:col-span-5 space-y-6">
                                                               {balance > 0 ? (
                                                                      <div className="space-y-6">
                                                                             <button
                                                                                    onClick={() => handlePayment(balance)}
                                                                                    className="w-full p-8 bg-[#ccff00] rounded-[32px] shadow-[0_20px_50px_rgba(204,255,0,0.15)] flex items-center justify-between group active:scale-[0.98] transition-all hover:-translate-y-1"
                                                                             >
                                                                                    <div className="text-left">
                                                                                           <p className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em]">Liquidación rápida</p>
                                                                                           <h2 className="text-3xl font-black text-black">COBRAR TODO</h2>
                                                                                    </div>
                                                                                    <div className="bg-black/10 px-5 py-3 rounded-2xl text-black font-black text-2xl">
                                                                                           ${balance.toLocaleString()}
                                                                                    </div>
                                                                             </button>

                                                                             <div className="flex items-center gap-4 py-2">
                                                                                    <div className="h-[1px] flex-1 bg-[#27272a]"></div>
                                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">O PAGO PARCIAL</span>
                                                                                    <div className="h-[1px] flex-1 bg-[#27272a]"></div>
                                                                             </div>

                                                                             <div className="bg-[#161618] p-6 rounded-[32px] border border-[#27272a] space-y-4">
                                                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                                                           <div className="relative flex-1">
                                                                                                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-black text-xl">$</span>
                                                                                                  <input
                                                                                                         value={paymentAmount}
                                                                                                         onChange={(e) => setPaymentAmount(e.target.value)}
                                                                                                         type="number"
                                                                                                         className="w-full pl-10 pr-4 py-5 bg-[#0a0a0b] border-none rounded-2xl font-black focus:ring-2 focus:ring-[#3b82f6] text-xl text-white placeholder:text-slate-700 outline-none"
                                                                                                         placeholder="Monto..."
                                                                                                  />
                                                                                           </div>
                                                                                           <div className="relative sm:min-w-[160px]">
                                                                                                  <select
                                                                                                         value={paymentMethod}
                                                                                                         onChange={(e) => setPaymentMethod(e.target.value)}
                                                                                                         className="w-full pl-5 pr-12 py-5 bg-[#0a0a0b] border-none rounded-2xl font-black appearance-none focus:ring-2 focus:ring-[#3b82f6] text-white outline-none cursor-pointer text-lg"
                                                                                                  >
                                                                                                         <option value="CASH">EFECTIVO</option>
                                                                                                         <option value="TRANSFER">TRANSF.</option>
                                                                                                         <option value="CARD">TARJETA</option>
                                                                                                         <option value="MP">MP</option>
                                                                                                  </select>
                                                                                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 w-6 h-6" />
                                                                                           </div>
                                                                                    </div>
                                                                                    <button
                                                                                           onClick={() => handlePayment()}
                                                                                           className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                                                                                    >
                                                                                           CONFIRMAR PAGO <ArrowRight className="w-6 h-6" />
                                                                                    </button>
                                                                             </div>
                                                                      </div>
                                                               ) : (
                                                                      <div className="p-10 text-center bg-[#161618] rounded-[32px] border border-[#27272a] flex flex-col items-center justify-center h-full min-h-[300px]">
                                                                             <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                                                                                    <div className="text-4xl">✨</div>
                                                                             </div>
                                                                             <h3 className="text-white font-black text-2xl mb-2">¡Operación Liquidada!</h3>
                                                                             <p className="text-slate-500 text-sm font-medium px-8">No hay saldos pendientes para esta reserva.</p>
                                                                      </div>
                                                               )}

                                                               <div className="pt-4">
                                                                      <button
                                                                             onClick={handleCancel}
                                                                             className="w-full py-5 text-red-500/50 hover:text-red-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500/5 rounded-2xl transition-all border border-dashed border-red-500/10"
                                                                      >
                                                                             Cancelar Reserva Definitivamente
                                                                      </button>
                                                               </div>
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

                                   </div>
                            </main>

                            {/* FOOTER - Professional Meta Info */}
                            <footer className="bg-[#161618] border-t border-[#27272a] px-5 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0 safe-area-bottom">
                                   <div className="flex flex-wrap justify-center gap-6">
                                          <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">UID: <span className="text-slate-300">#{booking.id}</span></span>
                                          <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">REGISTRO: <span className="text-slate-300">{format(new Date(booking.createdAt), "dd MMM yyyy - HH:mm", { locale: es })}</span></span>
                                   </div>
                                   <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group" onClick={onClose}>
                                          PRESIONA <kbd className="bg-[#27272a] px-2 py-1 rounded text-slate-400 group-hover:text-white group-hover:bg-[#3b82f6] transition-colors">ESC</kbd> PARA CERRAR
                                   </div>
                            </footer>
                     </div>
              </div>
       )
}
