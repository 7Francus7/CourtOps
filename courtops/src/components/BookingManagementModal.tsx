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
                     // toast.success('Jugadores actualizados')
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

       if (!booking || !adaptedBooking) return null

       const { client, schedule, pricing } = adaptedBooking
       const formattedDate = format(schedule.startTime, "EEE d MMM", { locale: es })
       const formattedTime = format(schedule.startTime, "HH:mm")
       const balance = pricing.balance
       const isPaid = balance <= 0

       return (
              <div className="fixed inset-0 z-[60] bg-black/95 sm:bg-black/80 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
                     <div className="w-full max-w-md bg-[#0a0a0b] text-white h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[32px] flex flex-col overflow-hidden relative shadow-2xl">

                            {/* HEADER - PHOTO & NAME */}
                            <header className="p-6 pb-2 space-y-4">
                                   <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-4">
                                                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1ea2ff] to-[#0d59f2] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
                                                        {client.name.charAt(0).toUpperCase()}
                                                 </div>
                                                 <div>
                                                        <h1 className="text-2xl font-black tracking-tight">{client.name}</h1>
                                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">ID: {client.id || '32325352'}</p>
                                                 </div>
                                          </div>
                                          <button
                                                 onClick={onClose}
                                                 className="p-2.5 bg-[#161618] rounded-full hover:bg-white/5 transition-colors"
                                                 aria-label="Cerrar modal"
                                          >
                                                 <X className="w-5 h-5 text-slate-400" />
                                          </button>
                                   </div>

                                   {/* TAGS */}
                                   <div className="flex gap-2">
                                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase">
                                                 <AlertTriangle className="w-3.5 h-3.5" />
                                                 SALDO: ${balance.toLocaleString()}
                                          </div>
                                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase font-mono">
                                                 <Calendar className="w-3.5 h-3.5" />
                                                 TURNO HOY
                                          </div>
                                   </div>

                                   {/* INFO CARDS */}
                                   <div className="grid grid-cols-3 gap-2">
                                          <div className="bg-[#161618] p-3 rounded-2xl border border-[#27272a] flex flex-col items-center gap-1">
                                                 <Trophy className="text-[#3b82f6] w-4 h-4 mb-0.5" />
                                                 <span className="text-[8px] uppercase font-black text-slate-500 tracking-tighter">Cancha</span>
                                                 <span className="font-black text-xs">{schedule.courtName}</span>
                                          </div>
                                          <div className="bg-[#161618] p-3 rounded-2xl border border-[#27272a] flex flex-col items-center gap-1">
                                                 <Calendar className="text-[#3b82f6] w-4 h-4 mb-0.5" />
                                                 <span className="text-[8px] uppercase font-black text-slate-500 tracking-tighter">Fecha</span>
                                                 <span className="font-black text-xs capitalize">{formattedDate}</span>
                                          </div>
                                          <div className="bg-[#161618] p-3 rounded-2xl border border-[#27272a] flex flex-col items-center gap-1">
                                                 <Clock className="text-[#3b82f6] w-4 h-4 mb-0.5" />
                                                 <span className="text-[8px] uppercase font-black text-slate-500 tracking-tighter">Hora</span>
                                                 <span className="font-black text-xs">{formattedTime}</span>
                                          </div>
                                   </div>

                                   {/* WHATSAPP BUTTON */}
                                   <button
                                          onClick={() => {
                                                 const phone = client.phone?.replace(/\D/g, '')
                                                 if (phone) window.open(`https://wa.me/${phone}`, '_blank')
                                          }}
                                          className="w-full h-14 bg-[#12c48b] hover:bg-[#0fa978] text-white rounded-[20px] font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/10 active:scale-[0.98]"
                                   >
                                          <MessageCircle className="w-6 h-6 fill-current" />
                                          ENVIAR WHATSAPP
                                   </button>
                            </header>

                            {/* NAV TABS */}
                            <nav className="flex px-6 border-b border-[#161618] mt-2">
                                   {[
                                          { id: 'gestion', icon: Banknote, label: 'GESTIÓN' },
                                          { id: 'kiosco', icon: Store, label: 'KIOSCO' },
                                          { id: 'jugadores', icon: Users, label: 'JUGADORES' }
                                   ].map(tab => (
                                          <button
                                                 key={tab.id}
                                                 onClick={() => setActiveTab(tab.id as any)}
                                                 className={cn(
                                                        "flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black transition-all border-b-2",
                                                        activeTab === tab.id ? "border-[#3b82f6] text-[#3b82f6]" : "border-transparent text-slate-500"
                                                 )}
                                          >
                                                 <tab.icon className="w-4 h-4" />
                                                 {tab.label}
                                          </button>
                                   ))}
                            </nav>

                            {/* MAIN CONTENT */}
                            <main className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                                   {activeTab === 'gestion' && (
                                          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                 <div className="bg-[#161618] rounded-[28px] p-6 border border-[#27272a]">
                                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Detalle de Cobro</h3>
                                                        <div className="space-y-5">
                                                               <div className="flex justify-between items-center text-sm">
                                                                      <span className="text-slate-300 font-bold">Precio turno</span>
                                                                      <span className="font-black">${pricing.basePrice.toLocaleString()}</span>
                                                               </div>
                                                               {pricing.kioskExtras > 0 && (
                                                                      <div className="flex justify-between items-center text-sm">
                                                                             <span className="text-slate-300 font-bold">Kiosco</span>
                                                                             <span className="font-black">${pricing.kioskExtras.toLocaleString()}</span>
                                                                      </div>
                                                               )}
                                                               <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                                      <span className="text-lg font-black tracking-tight">Total</span>
                                                                      <span className="text-xl font-black">${pricing.total.toLocaleString()}</span>
                                                               </div>
                                                               <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10 flex justify-between items-center">
                                                                      <span className="text-amber-500 text-xs font-black uppercase tracking-widest">Falta Pagar</span>
                                                                      <span className="text-2xl font-black text-amber-500">${balance.toLocaleString()}</span>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 {balance > 0 && (
                                                        <div className="space-y-6">
                                                               <button
                                                                      onClick={() => handlePayment(balance)}
                                                                      className="w-full h-20 bg-[#ccff00] rounded-[28px] shadow-lg shadow-[#ccff00]/10 flex items-center justify-between px-6 group transition-all active:scale-[0.98]"
                                                               >
                                                                      <div className="text-left">
                                                                             <p className="text-[8px] font-black text-black/50 uppercase tracking-[0.2em] mb-1">Acción sugerida</p>
                                                                             <h2 className="text-2xl font-black text-black tracking-tighter">COBRAR TODO</h2>
                                                                      </div>
                                                                      <div className="bg-black/10 px-4 py-2 rounded-xl text-black font-black text-xl">
                                                                             ${balance}
                                                                      </div>
                                                               </button>

                                                               <div className="flex items-center gap-3">
                                                                      <div className="h-px flex-1 bg-white/5"></div>
                                                                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">O PAGO PARCIAL</span>
                                                                      <div className="h-px flex-1 bg-white/5"></div>
                                                               </div>

                                                               <div className="flex gap-2">
                                                                      <div className="relative flex-1">
                                                                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</span>
                                                                             <input
                                                                                    value={paymentAmount}
                                                                                    onChange={e => setPaymentAmount(e.target.value)}
                                                                                    type="number"
                                                                                    placeholder="Monto"
                                                                                    className="w-full h-14 pl-8 bg-[#161618] border-none rounded-2xl font-black text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                                     aria-label="Monto a pagar"
                                                                             />
                                                                      </div>
                                                                      <div className="relative flex-1">
                                                                             <select
                                                                                    value={paymentMethod}
                                                                                    onChange={e => setPaymentMethod(e.target.value)}
                                                                                    className="w-full h-14 pl-4 bg-[#161618] border-none rounded-2xl font-black text-white outline-none appearance-none"
                                                     aria-label="Método de pago"
                                                                             >
                                                                                    <option value="CASH">Efectivo 💵</option>
                                                                                    <option value="TRANSFER">Transfer 📲</option>
                                                                                    <option value="MP">MP 📱</option>
                                                                             </select>
                                                                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                                                      </div>
                                                                      <button
                                                                             onClick={() => handlePayment()}
                                                                             className="w-14 h-14 bg-[#3b82f6] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-90 transition-all shrink-0"
                                              aria-label="Confirmar pago"
                                                                      >
                                                                             <ArrowRight className="w-6 h-6 text-white" />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>
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
                            </main>

                            {/* FOOTER */}
                            <footer className="p-4 px-6 border-t border-[#161618] flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                   <div className="flex gap-4">
                                          <span>ID: #{booking.id}</span>
                                          <span>CREADO: {format(new Date(booking.createdAt), "dd/MM HH:mm")}</span>
                                   </div>
                                   <button onClick={onClose} className="cursor-pointer hover:text-slate-400 transition-colors">
                                          CERRAR <span className="bg-white/5 px-1.5 py-0.5 rounded ml-1">[ESC]</span>
                                   </button>
                            </footer>
                     </div>
              </div>
       )
}
