'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
       cancelBooking,
       updateBookingStatus,
       getBookingDetails,
       getProducts,
       addBookingItemWithPlayer,
       removeBookingItem,
       payBooking,
       updateBookingDetails,
       updateBookingNotes,
       manageSplitPlayers
} from '@/actions/manageBooking'
import { getCourts } from '@/actions/turnero'
import { cn } from '@/lib/utils'

type Props = {
       booking: any | null
       onClose: () => void
       onUpdate: () => void
}

export default function BookingManagementModal({ booking: initialBooking, onClose, onUpdate }: Props) {
       console.log('🟢 BookingManagementModal Rendered', { initialBooking })

       const [booking, setBooking] = useState<any>(null)
       const [loading, setLoading] = useState(false)
       const [products, setProducts] = useState<any[]>([])
       const [courts, setCourts] = useState<any[]>([])
       const [activeTab, setActiveTab] = useState<'gestion' | 'kiosco' | 'split'>('gestion')

       // Local states for inputs
       const [selectedProductId, setSelectedProductId] = useState<string>("")
       const [quantity, setQuantity] = useState(1)
       const [assignToPlayer, setAssignToPlayer] = useState<string>("")
       const [paymentAmount, setPaymentAmount] = useState<string>("")
       const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
       const [notes, setNotes] = useState("")

       // Split state
       const [playerCount, setPlayerCount] = useState(4)
       const [splitPlayers, setSplitPlayers] = useState<any[]>([])

       // Edit state
       const [isEditing, setIsEditing] = useState(false)
       const [editDate, setEditDate] = useState<string>("")
       const [editTime, setEditTime] = useState<string>("")
       const [editCourtId, setEditCourtId] = useState<number>(0)

       const [error, setError] = useState<string | null>(null)

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
                            // setNotes(b.notes || "") 
                            setNotes("")
                            // Safe check for players
                            setSplitPlayers((b as any).players || [])

                            const startStr = b.startTime.toString()
                            const d = new Date(startStr)
                            setEditDate(format(d, 'yyyy-MM-dd'))
                            setEditTime(format(d, 'HH:mm'))
                            setEditCourtId(b.courtId)
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

       if (error) {
              return (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
                            <div className="bg-[#111418] border border-white/10 p-8 rounded-2xl max-w-md text-center">
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

       if (!booking && loading) {
              return (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
                            <div className="flex flex-col items-center gap-4">
                                   <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
                                   <p className="text-white/50 text-xs font-black uppercase tracking-widest">Cargando reserva...</p>
                            </div>
                     </div>
              )
       }

       if (!booking) return null // Should not happen if loading is handled, but keep as fallback

       // Calculations
       const itemsTotal = booking.items?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0) || 0
       const totalCost = booking.price + itemsTotal
       const totalPaid = booking.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0
       const pendingBalance = totalCost - totalPaid

       const handleConfirm = async () => {
              setLoading(true)
              await updateBookingStatus(booking.id, { status: 'CONFIRMED' })
              await refreshData()
              onUpdate()
       }

       const handleAddItem = async () => {
              if (!selectedProductId) return
              setLoading(true)
              await addBookingItemWithPlayer(booking.id, Number(selectedProductId), quantity, assignToPlayer || undefined)
              setLoading(false)
              setSelectedProductId("")
              setQuantity(1)
              setAssignToPlayer("")
              await refreshData()
       }

       const handleRemoveItem = async (itemId: number) => {
              if (!confirm('¿Quitar el item?')) return
              setLoading(true)
              await removeBookingItem(itemId)
              setLoading(false)
              await refreshData()
       }

       const handlePayment = async (amountOverride?: number) => {
              const amount = amountOverride || Number(paymentAmount)
              if (!amount || amount <= 0) return alert('Ingrese un monto válido')

              setLoading(true)
              await payBooking(booking.id, amount, paymentMethod)
              setLoading(false)
              setPaymentAmount("")
              await refreshData()
              onUpdate()
       }

       const handleSaveNotes = async () => {
              setLoading(true)
              await updateBookingNotes(booking.id, notes)
              setLoading(false)
              await refreshData()
       }

       const handleUpdateDetails = async () => {
              const [h, m] = editTime.split(':').map(Number)
              const [year, month, day] = editDate.split('-').map(Number)
              const newStart = new Date(year, month - 1, day, h, m)

              setLoading(true)
              const res = await updateBookingDetails(booking.id, newStart, Number(editCourtId))
              setLoading(false)

              if (res.success) {
                     setIsEditing(false)
                     await refreshData()
                     onUpdate()
              } else {
                     alert(res.error)
              }
       }

       const handleCancel = async () => {
              if (!confirm('¿Seguro que deseas CANCELAR este turno?')) return
              setLoading(true)
              await cancelBooking(booking.id)
              setLoading(false)
              onUpdate()
              onClose()
       }

       const handleAutoSplit = () => {
              const perPlayer = Math.ceil(totalCost / playerCount)
              const newPlayers = Array.from({ length: playerCount }).map((_, i) => ({
                     name: i === 0 ? booking.client?.name || 'Cliente' : `Jugador ${i + 1}`,
                     amount: perPlayer,
                     isPaid: false
              }))
              setSplitPlayers(newPlayers)
       }

       const handleSaveSplit = async () => {
              setLoading(true)
              await manageSplitPlayers(booking.id, splitPlayers)
              setLoading(false)
              await refreshData()
       }

       const handlePlayerPay = async (index: number) => {
              const p = splitPlayers[index]
              if (!confirm(`¿Registrar pago de $${p.amount} para ${p.name}?`)) return

              // 1. Register Transaction
              setLoading(true)
              await payBooking(booking.id, p.amount, paymentMethod)

              // 2. Mark player as paid in the split table
              const newPlayers = [...splitPlayers]
              newPlayers[index] = { ...p, isPaid: true, paymentMethod }
              await manageSplitPlayers(booking.id, newPlayers)

              setLoading(false)
              await refreshData()
              onUpdate()
       }

       const dateObj = new Date(booking.startTime)
       const formattedDate = format(dateObj, "EEEE d 'de' MMMM", { locale: es })
       const formattedTime = format(dateObj, "HH:mm")

       return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
                     <div className="bg-[#111418] border-0 sm:border border-white/10 w-full max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-full sm:h-auto sm:max-h-[90vh]">

                            {/* Header Section */}
                            <div className={cn(
                                   "relative p-6 text-center border-b border-white/5 pb-8",
                                   booking.status === 'CANCELED' ? "bg-red-500/5" :
                                          pendingBalance <= 0 ? "bg-brand-green/5" : "bg-brand-blue/5"
                            )}>
                                   <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                   </button>

                                   <div className="flex flex-col items-center gap-2">
                                          <div className="flex items-center gap-3">
                                                 <h2 className="text-2xl sm:text-3xl font-black text-white capitalize tracking-tight">{booking.client?.name || '---'}</h2>
                                                 {booking.client?.phone && (
                                                        <a
                                                               href={`https://wa.me/${booking.client.phone.replace(/\D/g, '')}`}
                                                               target="_blank"
                                                               className="p-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all"
                                                               title="Enviar WhatsApp"
                                                        >
                                                               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                        </a>
                                                 )}
                                          </div>
                                          <p className="text-brand-blue font-bold uppercase tracking-widest text-[10px] bg-brand-blue/10 px-3 py-1 rounded-full">
                                                 {booking.court?.name || 'Cancha'} • {formattedDate} • {formattedTime} Hs
                                          </p>
                                   </div>

                                   <div className="flex items-center justify-center gap-3 mt-6">
                                          <span className={cn(
                                                 "text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-wider",
                                                 booking.status === 'CONFIRMED' ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" :
                                                        booking.status === 'PENDING' ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" :
                                                               "bg-red-500 text-white"
                                          )}>
                                                 {booking.status}
                                          </span>
                                          {pendingBalance <= 0 ? (
                                                 <span className="text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-wider bg-brand-green text-bg-dark shadow-lg shadow-brand-green/20">Pagado</span>
                                          ) : (
                                                 <span className="text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-wider bg-white/5 text-white/60 border border-white/10">Saldo: ${pendingBalance}</span>
                                          )}
                                   </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex border-b border-white/5 shrink-0 bg-[#0B0D10]">
                                   {[
                                          { id: 'gestion', label: 'Gestión', icon: '💰' },
                                          { id: 'kiosco', label: 'Kiosco', icon: '🛒' },
                                          { id: 'split', label: 'Jugadores', icon: '👥' }
                                   ].map(tab => (
                                          <button
                                                 key={tab.id}
                                                 onClick={() => setActiveTab(tab.id as any)}
                                                 className={cn(
                                                        "flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
                                                        activeTab === tab.id ? "text-brand-blue" : "text-white/30 hover:text-white/60"
                                                 )}
                                          >
                                                 {tab.icon} {tab.label}
                                                 {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-t-full shadow-[0_-4px_12px_rgba(59,130,246,0.4)]" />}
                                          </button>
                                   ))}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0B0D10]/50">
                                   <div className="p-4 sm:p-6 pb-24 sm:pb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                          {/* TAB 1: GESTION & PAGOS */}
                                          {activeTab === 'gestion' && (
                                                 <div className="space-y-6">
                                                        {/* Price Summary */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                               <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                                                      <div className="text-[10px] text-white/30 font-black uppercase mb-1">Precio Turno</div>
                                                                      <div className="text-2xl font-black text-white font-mono">${booking.price}</div>
                                                               </div>
                                                               <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                                                      <div className="text-[10px] text-white/30 font-black uppercase mb-1">Extras Kiosco</div>
                                                                      <div className="text-2xl font-black text-brand-green font-mono">${itemsTotal}</div>
                                                               </div>
                                                               <div className="bg-brand-blue/10 border border-brand-blue/20 p-4 rounded-2xl col-span-1 sm:col-span-2 flex justify-between items-center">
                                                                      <div>
                                                                             <div className="text-[10px] text-brand-blue font-black uppercase mb-1">Total a Cobrar</div>
                                                                             <div className="text-3xl font-black text-white font-mono">${totalCost}</div>
                                                                      </div>
                                                                      <div className="text-right">
                                                                             <div className="text-[10px] text-white/30 font-black uppercase mb-1">Pagado</div>
                                                                             <div className="text-xl font-black text-white/50 font-mono">${totalPaid}</div>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Main Actions */}
                                                        <div className="space-y-3">
                                                               <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Acciones de Cobro</h3>

                                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                      {booking.status === 'PENDING' && (
                                                                             <button onClick={handleConfirm} className="bg-brand-blue text-white font-black py-4 rounded-2xl hover:bg-brand-blue-secondary transition-all shadow-xl shadow-brand-blue/20 uppercase tracking-widest text-xs">Confirmar Turno</button>
                                                                      )}
                                                                      {pendingBalance > 0 && (
                                                                             <button onClick={() => handlePayment(pendingBalance)} className="bg-brand-green text-bg-dark font-black py-4 rounded-2xl hover:bg-brand-green-variant transition-all shadow-xl shadow-brand-green/20 uppercase tracking-widest text-xs">Cobrar Todo (${pendingBalance})</button>
                                                                      )}
                                                               </div>

                                                               {pendingBalance > 0 && (
                                                                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-4">
                                                                             <div className="flex gap-2">
                                                                                    <input
                                                                                           type="number"
                                                                                           className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono outline-none focus:border-brand-blue transition-all"
                                                                                           placeholder="Monto a cobrar..."
                                                                                           value={paymentAmount}
                                                                                           onChange={e => setPaymentAmount(e.target.value)}
                                                                                    />
                                                                                    <select
                                                                                           className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand-blue transition-all"
                                                                                           value={paymentMethod}
                                                                                           onChange={e => setPaymentMethod(e.target.value)}
                                                                                    >
                                                                                           <option value="CASH">Efectivo 💵</option>
                                                                                           <option value="TRANSFER">Transferencia 📱</option>
                                                                                           <option value="DEBIT">Dédito 💳</option>
                                                                                           <option value="CREDIT">Crédito 💳</option>
                                                                                           <option value="MP">Mercado Pago Ⓜ️</option>
                                                                                    </select>
                                                                             </div>
                                                                             <button onClick={() => handlePayment()} className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-3 rounded-xl transition-all uppercase tracking-widest text-[10px]">Registrar Pago Parcial</button>
                                                                      </div>
                                                               )}
                                                        </div>

                                                        {/* History */}
                                                        {booking.transactions && booking.transactions.length > 0 && (
                                                               <div className="space-y-2">
                                                                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Historial de Pagos</h3>
                                                                      <div className="space-y-1">
                                                                             {booking.transactions.map((t: any) => (
                                                                                    <div key={t.id} className="flex justify-between items-center bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                                                                           <div className="flex flex-col">
                                                                                                  <span className="text-[10px] text-white/60 font-black">{t.method}</span>
                                                                                                  <span className="text-[9px] text-white/20 capitalize font-medium">{format(new Date(t.createdAt), "HH:mm 'hs'")}</span>
                                                                                           </div>
                                                                                           <span className="font-mono text-brand-green font-black">+ ${t.amount}</span>
                                                                                    </div>
                                                                             ))}
                                                                      </div>
                                                               </div>
                                                        )}

                                                        {/* Notes */}
                                                        <div className="space-y-2 pt-4 border-t border-white/5">
                                                               <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Notas / Observaciones</h3>
                                                               <textarea
                                                                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white/80 outline-none focus:border-white/20 h-24 resize-none transition-all"
                                                                      placeholder="Escribe alguna nota sobre este turno..."
                                                                      value={notes}
                                                                      onChange={e => setNotes(e.target.value)}
                                                               />
                                                               <button onClick={handleSaveNotes} className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase transition-all">Guardar Notas</button>
                                                        </div>
                                                 </div>
                                          )}

                                          {/* TAB 2: KIOSCO */}
                                          {activeTab === 'kiosco' && (
                                                 <div className="space-y-6">
                                                        <div className="bg-brand-blue/5 border border-brand-blue/10 p-4 rounded-2xl mb-6">
                                                               <h3 className="text-sm font-black text-brand-blue uppercase mb-1">Agregar Consumo</h3>
                                                               <div className="flex flex-col gap-3">
                                                                      <div className="flex gap-2">
                                                                             <select
                                                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-brand-blue transition-all"
                                                                                    value={selectedProductId}
                                                                                    onChange={e => setSelectedProductId(e.target.value)}
                                                                             >
                                                                                    <option value="">Buscar producto...</option>
                                                                                    {products.map(p => (
                                                                                           <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                                                                                    ))}
                                                                             </select>
                                                                             <input
                                                                                    type="number"
                                                                                    min={1}
                                                                                    className="w-20 bg-black/40 border border-white/10 rounded-xl p-3 text-white text-center outline-none focus:border-brand-blue"
                                                                                    value={quantity}
                                                                                    onChange={e => setQuantity(Number(e.target.value))}
                                                                             />
                                                                      </div>
                                                                      <div className="flex gap-2">
                                                                             <select
                                                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white/50 outline-none"
                                                                                    value={assignToPlayer}
                                                                                    onChange={e => setAssignToPlayer(e.target.value)}
                                                                             >
                                                                                    <option value="">Asignar a... (Opcional)</option>
                                                                                    <option value={booking.client?.name}>{booking.client?.name} (Titular)</option>
                                                                                    {splitPlayers.map((p, i) => (
                                                                                           <option key={i} value={p.name}>{p.name}</option>
                                                                                    ))}
                                                                             </select>
                                                                             <button
                                                                                    onClick={handleAddItem}
                                                                                    disabled={!selectedProductId || loading}
                                                                                    className="bg-brand-blue text-white px-6 rounded-xl font-black text-lg disabled:opacity-50"
                                                                             >
                                                                                    +
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                               <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Resumen de Consumos</h3>
                                                               <div className="space-y-1">
                                                                      {booking.items?.map((item: any) => (
                                                                             <div key={item.id} className="flex justify-between items-center bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                                                                    <div className="flex items-center gap-3">
                                                                                           <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-xs font-black text-brand-blue">
                                                                                                  {item.quantity}x
                                                                                           </div>
                                                                                           <div>
                                                                                                  <div className="text-sm font-bold text-white leading-tight">{item.product?.name || 'Producto'}</div>
                                                                                                  {item.playerName && <div className="text-[9px] text-brand-blue/60 font-bold uppercase">{item.playerName}</div>}
                                                                                           </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4">
                                                                                           <span className="font-mono text-white/60 font-bold">${item.unitPrice * item.quantity}</span>
                                                                                           <button onClick={() => handleRemoveItem(item.id)} className="text-red-500/30 hover:text-red-500 p-2 transition-all">
                                                                                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                                                           </button>
                                                                                    </div>
                                                                             </div>
                                                                      ))}
                                                                      {!booking.items?.length && (
                                                                             <div className="text-center py-8 opacity-20">
                                                                                    <div className="text-4xl mb-2">🥤</div>
                                                                                    <div className="text-xs font-black uppercase">Sin consumos cargados</div>
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>
                                                 </div>
                                          )}

                                          {/* TAB 3: SPLIT */}
                                          {activeTab === 'split' && (
                                                 <div className="space-y-6">
                                                        <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-3xl text-center">
                                                               <h3 className="text-sm font-black text-orange-400 uppercase mb-4 tracking-widest">Dividir Pago</h3>
                                                               <div className="flex items-center justify-center gap-4 mb-6">
                                                                      <button onClick={() => setPlayerCount(Math.max(1, playerCount - 1))} className="w-10 h-10 rounded-xl bg-white/5 text-xl font-bold">-</button>
                                                                      <div className="flex flex-col">
                                                                             <span className="text-3xl font-black text-white">{playerCount}</span>
                                                                             <span className="text-[10px] text-white/30 font-black uppercase">Jugadores</span>
                                                                      </div>
                                                                      <button onClick={() => setPlayerCount(playerCount + 1)} className="w-10 h-10 rounded-xl bg-white/5 text-xl font-bold">+</button>
                                                               </div>
                                                               <div className="text-sm text-white/40 mb-4 font-medium">Total (${totalCost}) ÷ {playerCount} = <span className="text-white font-black">${Math.ceil(totalCost / playerCount).toLocaleString()} c/u</span></div>
                                                               <button onClick={handleAutoSplit} className="bg-orange-500 text-white font-black px-8 py-3 rounded-2xl shadow-xl shadow-orange-500/20 uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all">Aplicar División Automática</button>
                                                        </div>

                                                        {splitPlayers.length > 0 && (
                                                               <div className="space-y-3">
                                                                      <div className="flex justify-between items-center mb-2 px-2">
                                                                             <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Listado de Jugadores</h3>
                                                                             <button onClick={handleSaveSplit} className="text-brand-blue text-[10px] font-black uppercase hover:underline">Guardar Cambios</button>
                                                                      </div>
                                                                      <div className="space-y-2">
                                                                             {splitPlayers.map((p, i) => (
                                                                                    <div key={i} className={cn(
                                                                                           "bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center transition-all",
                                                                                           p.isPaid && "bg-brand-green/5 border-brand-green/20"
                                                                                    )}>
                                                                                           <input
                                                                                                  className="bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-brand-blue min-w-[140px] w-full sm:w-auto"
                                                                                                  value={p.name}
                                                                                                  onChange={e => {
                                                                                                         const n = [...splitPlayers]; n[i].name = e.target.value; setSplitPlayers(n);
                                                                                                  }}
                                                                                           />
                                                                                           <div className="flex flex-1 items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                                                                  <div className="flex items-center gap-2">
                                                                                                         <span className="text-[10px] text-white/30 font-black">$</span>
                                                                                                         <input
                                                                                                                type="number"
                                                                                                                className="bg-transparent border-b border-white/10 w-20 text-right font-mono text-white outline-none focus:border-brand-blue"
                                                                                                                value={p.amount}
                                                                                                                onChange={e => {
                                                                                                                       const n = [...splitPlayers]; n[i].amount = Number(e.target.value); setSplitPlayers(n);
                                                                                                                }}
                                                                                                         />
                                                                                                  </div>
                                                                                                  {p.isPaid ? (
                                                                                                         <div className="flex items-center gap-2 bg-brand-green/20 text-brand-green px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                                                                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                                                                                                                PAGADO
                                                                                                         </div>
                                                                                                  ) : (
                                                                                                         <button
                                                                                                                onClick={() => handlePlayerPay(i)}
                                                                                                                className="bg-brand-green text-bg-dark text-[10px] font-black px-4 py-1.5 rounded-full uppercase hover:bg-brand-green-variant"
                                                                                                         >
                                                                                                                Cobrar
                                                                                                         </button>
                                                                                                  )}
                                                                                           </div>
                                                                                    </div>
                                                                             ))}
                                                                      </div>
                                                               </div>
                                                        )}
                                                 </div>
                                          )}
                                   </div>
                            </div>

                            {/* Bottom Bar Settings Toggle / Secondary Actions */}
                            <div className="p-4 sm:p-6 bg-[#111418] border-t border-white/5 flex flex-wrap justify-between gap-3 shrink-0">
                                   <div className="flex gap-2">
                                          <button
                                                 onClick={() => setIsEditing(!isEditing)}
                                                 className={cn(
                                                        "p-3 rounded-2xl border border-white/5 transition-all text-xl",
                                                        isEditing ? "bg-brand-blue text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                                                 )}
                                                 title="Editar Detalles"
                                          >
                                                 ✏️
                                          </button>
                                          <button onClick={handleCancel} className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-xl hover:bg-red-500/10 transition-all shadow-lg shadow-red-500/5 group" title="Cancelar Turno">
                                                 <span className="group-hover:scale-110 block transition-transform">🗑️</span>
                                          </button>
                                   </div>

                                   <div className="flex gap-2">
                                          <button onClick={onClose} className="bg-white/5 hover:bg-white/10 text-white font-black px-6 py-3 rounded-2xl transition-all uppercase tracking-widest text-xs border border-white/10">Cerrar</button>
                                   </div>

                                   {isEditing && (
                                          <div className="w-full mt-4 p-6 bg-brand-blue/10 border border-brand-blue/20 rounded-3xl animate-in slide-in-from-top-4 duration-300">
                                                 <div className="grid grid-cols-2 gap-3 mb-4">
                                                        <div className="space-y-1">
                                                               <label className="text-[10px] font-black text-brand-blue uppercase ml-1">Fecha</label>
                                                               <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none active:border-brand-blue" />
                                                        </div>
                                                        <div className="space-y-1">
                                                               <label className="text-[10px] font-black text-brand-blue uppercase ml-1">Hora</label>
                                                               <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none" />
                                                        </div>
                                                        <div className="space-y-1 col-span-2">
                                                               <label className="text-[10px] font-black text-brand-blue uppercase ml-1">Cancha</label>
                                                               <select value={editCourtId} onChange={e => setEditCourtId(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                                                                      {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                               </select>
                                                        </div>
                                                 </div>
                                                 <button onClick={handleUpdateDetails} className="w-full bg-brand-blue text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-brand-blue/20">Guardar Cambios</button>
                                          </div>
                                   )}
                            </div>

                            {loading && (
                                   <div className="absolute inset-0 z-[100] bg-bg-dark/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                                          <div className="relative">
                                                 <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
                                                 <div className="absolute inset-x-0 -bottom-8 text-center text-[10px] font-black text-brand-blue uppercase tracking-widest animate-pulse">Cargando...</div>
                                          </div>
                                   </div>
                            )}
                     </div>
              </div>
       )
}
