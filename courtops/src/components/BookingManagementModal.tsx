'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { format, differenceInMinutes } from 'date-fns'
import {
       cancelBooking,
       updateBookingStatus,
       getBookingDetails,
       getProducts,
       addBookingItemWithPlayer,
       removeBookingItem,
       payBooking,
       // updateBookingDetails, // Not used yet
       // updateBookingNotes, // Disbaled
       manageSplitPlayers
} from '@/actions/manageBooking'
import { getCourts } from '@/actions/turnero'
import { cn } from '@/lib/utils'
import BookingHeader from './booking/BookingHeader'
import PricingPanel from './booking/PricingPanel'
import { KioskTab } from './booking/KioskTab'
import { PlayersTab } from './booking/PlayersTab'
import { Booking, BookingStatus } from '@/types/booking'

type Props = {
       booking: any | null
       onClose: () => void
       onUpdate: () => void
}

export default function BookingManagementModal({ booking: initialBooking, onClose, onUpdate }: Props) {
       console.log('🟢 BookingManagementModal Rendered', { initialBooking })

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
                     getProducts().then(setProducts).catch(e => console.error("Error fetching products", e))
                     getCourts().then(setCourts).catch(e => console.error("Error fetching courts", e))
              }
       }, [initialBooking?.id])

       async function refreshData() {
              if (!initialBooking?.id) return
              setLoading(true)
              setError(null)

              try {
                     console.log('Fetching details for:', initialBooking.id)
                     const res = await getBookingDetails(initialBooking.id)
                     console.log('Fetch result:', res)

                     if (res.success && res.booking) {
                            const b = res.booking
                            setBooking(b)
                            setSplitPlayers((b as any).players || [])

                            // Initialize payment amount with remaining balance if open
                            // const balance = calculateBalance(b)
                            // if (balance > 0) setPaymentAmount(balance.toString())
                     } else {
                            setError(res.error || 'Error al cargar detalles del turno')
                     }
              } catch (err: any) {
                     console.error('Refresh error:', err)
                     setError(err.message || 'Error de conexión')
              } finally {
                     setLoading(false)
              }
       }

       // --- ACTIONS ---

       const handleConfirm = async () => {
              setLoading(true)
              await updateBookingStatus(booking.id, { status: 'CONFIRMED' })
              await refreshData()
              onUpdate()
       }

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

              // Optional: Remove confirm or keep it? Keeping it for safety.
              if (!confirm(`¿Registrar pago de $${amount}?`)) return

              setLoading(true)
              const res = await payBooking(booking.id, amount, paymentMethod)
              setLoading(false)

              if (res.success) {
                     if (res.warning) {
                            toast.warning('Pago registrado parcialmente', {
                                   description: res.warning
                            })
                     } else {
                            toast.success(`Pago de $${amount} registrado exitosamente`, {
                                   description: 'El estado de la reserva ha sido actualizado.'
                            })
                     }
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
              // Also update status if all paid?
              setLoading(false)
              await refreshData()
       }

       // --- ADAPTER ---

       const adaptedBooking: Booking | null = useMemo(() => {
              if (!booking) return null

              const itemsTotal = booking.items?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0) || 0
              const totalPaid = booking.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0

              const start = new Date(booking.startTime)
              const end = new Date(booking.endTime)
              const duration = differenceInMinutes(end, start) || 90

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
                     items: booking.items || [],
                     transactions: booking.transactions || [],
                     players: splitPlayers || [], // Use local state for players
                     products: [],
                     metadata: {
                            createdAt: new Date(booking.createdAt),
                            updatedAt: new Date(booking.updatedAt || booking.createdAt)
                     }
              }
       }, [booking, splitPlayers])


       // --- RENDER ---

       if (error) {
              return (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
                            <div className="bg-[#111418] border border-white/10 p-8 rounded-2xl max-w-md text-center relative">
                                   <button
                                          onClick={onClose}
                                          className="absolute top-4 right-4 text-white/20 hover:text-white"
                                   >
                                          ✕
                                   </button>
                                   <div className="text-red-500 text-4xl mb-4">⚠️</div>
                                   <h3 className="text-xl font-bold text-white mb-2">Error al cargar datos</h3>
                                   <p className="text-white/60 mb-6 font-mono text-sm">{error}</p>
                                   <div className="flex justify-center gap-3">
                                          <button onClick={() => refreshData()} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">Reintentar</button>
                                          <button onClick={onClose} className="px-4 py-2 bg-brand-blue text-white rounded-lg">Cerrar</button>
                                   </div>
                            </div>
                     </div>
              )
       }

       if (loading) {
              return (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
                            <div className="flex flex-col items-center gap-4 relative">
                                   <button
                                          onClick={onClose}
                                          className="absolute -top-12 right-0 text-white/20 hover:text-white mb-4 text-xs font-bold uppercase tracking-widest bg-white/5 py-2 px-4 rounded-full border border-white/10 hover:bg-white/10 transition-all"
                                   >
                                          Cancelar
                                   </button>
                                   <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
                                   <p className="text-white/50 text-xs font-black uppercase tracking-widest">Cargando reserva...</p>
                            </div>
                     </div>
              )
       }

       if (!booking || !adaptedBooking) {
              return (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
                            <div className="bg-[#111418] border border-white/10 p-8 rounded-2xl max-w-md text-center">
                                   <div className="text-gray-500 text-4xl mb-4">🔍</div>
                                   <h3 className="text-xl font-bold text-white mb-2">No se encontraron datos</h3>
                                   <p className="text-white/60 mb-6 font-mono text-sm">
                                          La reserva parece no existir.
                                   </p>

                                   {/* DEBUG INFO */}
                                   <div className="bg-black/50 p-4 rounded-lg border border-white/5 mb-6 text-left overflow-hidden">
                                          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-bold">Información Técnica:</p>
                                          <code className="text-xs font-mono text-brand-blue block">
                                                 ID Buscado: {initialBooking?.id ? `#${initialBooking.id}` : 'UNDEFINED'}<br />
                                                 Tipo ID: {typeof initialBooking?.id}<br />
                                                 Error: {error || 'Ninguno'}
                                          </code>
                                   </div>

                                   <div className="flex justify-center gap-3">
                                          <button onClick={() => refreshData()} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">Reintentar</button>
                                          <button onClick={onClose} className="px-4 py-2 bg-brand-blue text-white rounded-lg">Cerrar</button>
                                   </div>
                            </div>
                     </div>
              )
       }

       const { pricing } = adaptedBooking

       return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
                     <div className="bg-[#111418] border-0 sm:border border-white/10 w-full max-w-4xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative h-[100dvh] sm:h-auto sm:max-h-[90vh]">

                            {/* CLOSE BUTTON (Mobile optimized) */}
                            <button
                                   onClick={onClose}
                                   aria-label="Cerrar modal"
                                   className="absolute top-2 right-2 sm:top-6 sm:right-6 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-colors backdrop-blur-sm"
                            >
                                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                            </button>

                            {/* 1. PROFESSIONAL HEADER */}
                            <BookingHeader
                                   booking={adaptedBooking}
                                   onWhatsAppClick={() => {
                                          const phone = booking.client?.phone?.replace(/\D/g, '')
                                          if (phone) window.open(`https://wa.me/${phone}`, '_blank')
                                   }}
                            />

                            {/* 2. TABS NAVIGATION */}
                            <div className="flex border-b border-white/5 shrink-0 bg-[#0B0D10] px-4 pt-2 gap-2">
                                   {[
                                          { id: 'gestion', label: '💰 Gestión', icon: '' },
                                          { id: 'kiosco', label: '🍿 Kiosco', icon: '' },
                                          { id: 'jugadores', label: '👥 Jugadores', icon: '' },
                                   ].map(tab => (
                                          <button
                                                 key={tab.id}
                                                 onClick={() => setActiveTab(tab.id as any)}
                                                 className={cn(
                                                        "px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
                                                        activeTab === tab.id
                                                               ? "text-brand-blue"
                                                               : "text-white/40 hover:text-white hover:bg-white/5 rounded-t-xl"
                                                 )}
                                          >
                                                 {tab.label}
                                                 {activeTab === tab.id && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                 )}
                                          </button>
                                   ))}
                            </div>

                            {/* 3. CONTENT AREA */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0D10]/50 relative custom-scrollbar">

                                   {/* TAB: GESTION (Main) */}
                                   {activeTab === 'gestion' && (
                                          <div className="space-y-6 max-w-2xl mx-auto">

                                                 {/* Pricing Breakdown */}
                                                 <PricingPanel
                                                        pricing={adaptedBooking.pricing}
                                                 />

                                                 {/* Payment Actions */}
                                                 {pricing.balance > 0 ? (
                                                        <div className="bg-bg-card border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                                               <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-green/5 rounded-full blur-3xl group-hover:bg-brand-green/10 transition-all" />

                                                               <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">Acciones de Cobro</h3>

                                                               <button
                                                                      onClick={() => handlePayment(pricing.balance)}
                                                                      disabled={loading}
                                                                      className="w-full bg-brand-green text-bg-dark font-black py-4 rounded-xl shadow-lg shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider mb-4 border-2 border-transparent hover:border-brand-green-variant"
                                                               >
                                                                      Cobrar Todo (${pricing.balance})
                                                               </button>

                                                               <div className="flex gap-2 isolate">
                                                                      <div className="relative flex-1">
                                                                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">$</span>
                                                                             <input
                                                                                    id="payment-input"
                                                                                    type="number"
                                                                                    aria-label="Monto a cobrar"
                                                                                    placeholder="Monto a cobrar..."
                                                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold outline-none focus:border-brand-green focus:bg-black/60 transition-all placeholder:text-white/10"
                                                                                    value={paymentAmount}
                                                                                    onChange={e => setPaymentAmount(e.target.value)}
                                                                             />
                                                                      </div>
                                                                      <select
                                                                             value={paymentMethod}
                                                                             aria-label="Método de pago"
                                                                             onChange={e => setPaymentMethod(e.target.value)}
                                                                             className="bg-black/40 border border-white/10 rounded-xl px-4 text-white font-bold outline-none focus:border-brand-green cursor-pointer hover:bg-white/5 transition-all text-sm"
                                                                      >
                                                                             <option value="CASH">Efectivo 💵</option>
                                                                             <option value="TRANSFER">Transferencia 🏦</option>
                                                                             <option value="DEBIT">Débito 💳</option>
                                                                             <option value="CREDIT">Crédito 💳</option>
                                                                             <option value="MERCADOPAGO">MercadoPago 📱</option>
                                                                      </select>
                                                               </div>
                                                               <button
                                                                      onClick={() => handlePayment()}
                                                                      disabled={!paymentAmount || loading}
                                                                      className="w-full mt-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 hover:border-white/20"
                                                               >
                                                                      Registrar Pago Parcial
                                                               </button>
                                                        </div>
                                                 ) : (
                                                        <div className="bg-brand-green/10 border border-brand-green/20 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-500">
                                                               <div className="text-4xl mb-4 animate-bounce">✨</div>
                                                               <h3 className="text-xl font-black text-brand-green uppercase tracking-wider mb-2">¡Todo Pagado!</h3>
                                                               <p className="text-brand-green/60 text-sm font-medium">Esta reserva no tiene saldo pendiente.</p>
                                                        </div>
                                                 )}

                                                 {/* Quick Actions Footer */}
                                                 <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                                                        <button
                                                               onClick={() => setActiveTab('kiosco')}
                                                               className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/5 hover:border-white/20"
                                                        >
                                                               <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🍿</span>
                                                               <span className="text-[10px] font-black uppercase text-white tracking-widest">Ir al Kiosco</span>
                                                        </button>
                                                        <button
                                                               onClick={handleCancel}
                                                               className="flex flex-col items-center justify-center p-4 bg-red-500/5 rounded-2xl hover:bg-red-500/10 transition-all group border border-red-500/10 hover:border-red-500/30 text-red-400"
                                                        >
                                                               <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🗑️</span>
                                                               <span className="text-[10px] font-black uppercase tracking-widest">Cancelar Turno</span>
                                                        </button>
                                                 </div>
                                          </div>
                                   )}

                                   {/* TAB: KIOSCO */}
                                   {activeTab === 'kiosco' && (
                                          <KioskTab
                                                 products={products}
                                                 items={booking.items || []}
                                                 loading={loading}
                                                 onAddItem={handleAddItem}
                                                 onRemoveItem={handleRemoveItem}
                                                 players={[adaptedBooking.client.name, ...splitPlayers.map(p => p.name)]}
                                          />
                                   )}

                                   {/* TAB: JUGADORES */}
                                   {activeTab === 'jugadores' && (
                                          <PlayersTab
                                                 totalAmount={adaptedBooking.pricing.total}
                                                 players={splitPlayers}
                                                 setPlayers={setSplitPlayers}
                                                 onSave={handleSaveSplit}
                                                 loading={loading}
                                          />
                                   )}

                            </div>

                            {/* 4. FOOTER STATUS BAR */}
                            <div className="p-4 bg-[#0B0D10] border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                   <div className="flex gap-4">
                                          <span>ID: #{booking.id}</span>
                                          <span className="hidden sm:inline">Creado: {format(new Date(booking.createdAt), 'dd/MM HH:mm')}</span>
                                   </div>
                                   <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">Cerrar [ESC]</button>
                            </div>
                     </div>
              </div>
       )
}
