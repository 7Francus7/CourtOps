'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cancelBooking, updateBookingStatus, getBookingDetails, getProducts, addBookingItem, removeBookingItem, payBooking, updateBookingDetails } from '@/actions/manageBooking'
import { getCourts } from '@/actions/turnero'
import { cn } from '@/lib/utils'

type BookingDetails = {
       id: number
       clientName: string
       startTime: string
       courtName: string
       status: string
       paymentStatus: string
       price: number
       // Expanded fields
       items?: any[]
       transactions?: any[]
       client?: {
              name: string
              phone: string
              email?: string
       }
}

type Props = {
       booking: BookingDetails | null
       onClose: () => void
       onUpdate: () => void
}

export default function BookingManagementModal({ booking: initialBooking, onClose, onUpdate }: Props) {
       const [booking, setBooking] = useState<any>(initialBooking)
       const [loading, setLoading] = useState(false)
       const [products, setProducts] = useState<any[]>([])

       // Add Item State
       const [selectedProductId, setSelectedProductId] = useState<string>("")
       const [quantity, setQuantity] = useState(1)

       // Payment State
       const [paymentAmount, setPaymentAmount] = useState<string>("")

       // Edit State
       const [isEditing, setIsEditing] = useState(false)
       const [editDate, setEditDate] = useState<string>("")
       const [editTime, setEditTime] = useState<string>("")
       const [editCourtId, setEditCourtId] = useState<number>(0)
       const [courts, setCourts] = useState<any[]>([])

       // Fetch detailed data on mount
       useEffect(() => {
              if (initialBooking?.id) {
                     refreshData()
                     getProducts().then(setProducts)
              }
       }, [initialBooking?.id])

       async function refreshData() {
              if (!initialBooking?.id) return
              const res = await getBookingDetails(initialBooking.id)
              if (res.success && res.booking) {
                     setBooking({
                            ...initialBooking,
                            ...res.booking,
                            clientName: res.booking.client?.name || initialBooking.clientName
                     })
              }
       }



       useEffect(() => {
              if (booking) {
                     const d = new Date(booking.startTime)
                     setEditDate(format(d, 'yyyy-MM-dd'))
                     setEditTime(format(d, 'HH:mm'))
                     if (booking.courtId) setEditCourtId(booking.courtId)
              }
       }, [booking])

       useEffect(() => {
              if (isEditing && courts.length === 0) {
                     getCourts().then(setCourts)
              }
       }, [isEditing])

       if (!booking) return null

       // Calculations
       const itemsTotal = booking.items?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0) || 0
       const totalCost = booking.price + itemsTotal
       const totalPaid = booking.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0
       const pendingBalance = totalCost - totalPaid

       const handleConfirm = async () => {
              setLoading(true)
              await updateBookingStatus(booking.id, { status: 'CONFIRMED' })
              setLoading(false)
              await refreshData()
              onUpdate()
       }

       const handleAddItem = async () => {
              if (!selectedProductId) return
              setLoading(true)
              await addBookingItem(booking.id, Number(selectedProductId), quantity)
              setLoading(false)
              setSelectedProductId("")
              setQuantity(1)
              await refreshData()
       }

       const handleRemoveItem = async (itemId: number) => {
              if (!confirm('¿Quitar el item?')) return
              setLoading(true)
              await removeBookingItem(itemId)
              setLoading(false)
              await refreshData()
       }

       const handlePayment = async () => {
              const amount = Number(paymentAmount)
              if (!amount || amount <= 0) return alert('Ingrese un monto válido')
              if (amount > pendingBalance + 1) { // Tolerance
                     if (!confirm('El monto supera la deuda. ¿Registrar igual?')) return
              }

              setLoading(true)
              await payBooking(booking.id, amount, 'CASH') // Default CASH for now
              setLoading(false)
              setPaymentAmount("")
              await refreshData()
              onUpdate() // Update grid
       }

       const handleCancel = async () => {
              if (!confirm('¿Seguro que deseas CANCELAR este turno?')) return
              setLoading(true)
              await cancelBooking(booking.id)
              setLoading(false)
              onUpdate()
              onClose()
       }

       const handleUpdateDetails = async () => {
              if (!editDate || !editTime || !editCourtId) return alert("Completa los campos")

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

       const dateObj = new Date(booking.startTime)

       return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                     <div className="bg-bg-card border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className={cn("p-4 text-center shrink-0 relative group/header transition-colors",
                                   isEditing ? "bg-brand-blue/20" :
                                          booking.status === 'CANCELED' ? "bg-red-500/10" :
                                                 pendingBalance <= 0 ? "bg-brand-green/10" :
                                                        "bg-brand-blue/10"
                            )}>
                                   {!isEditing ? (
                                          <>
                                                 <button
                                                        onClick={() => setIsEditing(true)}
                                                        className="absolute top-2 right-2 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                                        title="Editar Reserva"
                                                 >
                                                        ✏️
                                                 </button>
                                                 <div className="flex items-center justify-center gap-2">
                                                        <h2 className="text-xl font-bold text-white">{booking.clientName}</h2>
                                                        {booking.client?.phone && (
                                                               <a
                                                                      href={`https://wa.me/${booking.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${booking.clientName}, te escribo por tu reserva en el club para el ${format(dateObj, 'EEEE d/M', { locale: es })} a las ${format(dateObj, 'HH:mm')}hs.`)}`}
                                                                      target="_blank"
                                                                      rel="noreferrer"
                                                                      className="bg-[#25D366] hover:bg-[#128C7E] text-white p-1.5 rounded-full transition-colors shadow-lg"
                                                                      title="Enviar WhatsApp"
                                                               >
                                                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                                               </a>
                                                        )}
                                                 </div>
                                                 <p className="text-sm font-medium opacity-80 uppercase tracking-wide">
                                                        {format(dateObj, 'EEEE d', { locale: es })} - {format(dateObj, 'HH:mm')} hs
                                                 </p>
                                                 <div className="flex items-center justify-center gap-2 mt-2">
                                                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                                                               booking.status === 'CONFIRMED' ? "bg-brand-blue text-white" : "bg-orange-500 text-white"
                                                        )}>
                                                               {booking.status === 'CONFIRMED' ? 'Confirmado' : 'Pendiente'}
                                                        </span>
                                                        {pendingBalance <= 0 ? (
                                                               <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-brand-green text-bg-dark">Pagado</span>
                                                        ) : (
                                                               <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-red-500 text-white">Debe: ${pendingBalance.toLocaleString()}</span>
                                                        )}
                                                 </div>
                                          </>
                                   ) : (
                                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                 <div className="flex gap-2">
                                                        <input
                                                               type="date"
                                                               className="bg-black/20 border border-white/10 rounded-lg p-2 text-white outline-none w-full text-center"
                                                               value={editDate}
                                                               onChange={e => setEditDate(e.target.value)}
                                                        />
                                                        <input
                                                               type="time"
                                                               className="bg-black/20 border border-white/10 rounded-lg p-2 text-white outline-none w-full text-center"
                                                               value={editTime}
                                                               onChange={e => setEditTime(e.target.value)}
                                                        />
                                                 </div>
                                                 <select
                                                        className="bg-black/20 border border-white/10 rounded-lg p-2 text-white outline-none w-full text-center"
                                                        value={editCourtId}
                                                        onChange={e => setEditCourtId(Number(e.target.value))}
                                                 >
                                                        {courts.map(c => (
                                                               <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                 </select>
                                                 <div className="flex gap-2 justify-center pt-2">
                                                        <button
                                                               onClick={() => setIsEditing(false)}
                                                               className="px-3 py-1 rounded-lg bg-white/10 text-xs font-bold hover:bg-white/20 text-white"
                                                        >
                                                               Cancelar
                                                        </button>
                                                        <button
                                                               onClick={handleUpdateDetails}
                                                               className="px-3 py-1 rounded-lg bg-brand-blue text-xs font-bold hover:bg-brand-blue-secondary shadow-lg shadow-brand-blue/20 text-white"
                                                        >
                                                               Guardar Cambios
                                                        </button>
                                                 </div>
                                          </div>
                                   )}
                            </div>

                            {/* Scrollable Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                                   {/* 1. FINANCIAL SUMMARY */}
                                   <div className="grid grid-cols-2 gap-4">
                                          <div className="bg-bg-surface p-3 rounded-xl border border-white/5">
                                                 <span className="text-xs text-text-grey uppercase">Cancha</span>
                                                 <div className="text-lg font-bold text-white font-mono">${booking.price.toLocaleString()}</div>
                                          </div>
                                          <div className="bg-bg-surface p-3 rounded-xl border border-white/5">
                                                 <span className="text-xs text-text-grey uppercase">Extras</span>
                                                 <div className="text-lg font-bold text-white font-mono">${itemsTotal.toLocaleString()}</div>
                                          </div>
                                   </div>

                                   {/* 2. EXTRAS / ITEMS */}
                                   <div className="space-y-3">
                                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Consumos / Extras</h3>

                                          {/* List */}
                                          <div className="space-y-2">
                                                 {booking.items?.map((item: any) => (
                                                        <div key={item.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                                                               <div className="flex items-center gap-2">
                                                                      <div className="w-6 h-6 rounded bg-brand-blue/20 flex items-center justify-center text-xs font-bold text-brand-blue">
                                                                             {item.quantity}
                                                                      </div>
                                                                      <span className="text-sm text-white">{item.product?.name || item.productId}</span>
                                                               </div>
                                                               <div className="flex items-center gap-3">
                                                                      <span className="text-sm font-mono text-zinc-400">${(item.unitPrice * item.quantity).toLocaleString()}</span>
                                                                      <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300 px-1">✕</button>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>

                                          {/* Add Form */}
                                          <div className="flex gap-2">
                                                 <select
                                                        className="flex-1 input-dark text-sm p-2"
                                                        value={selectedProductId}
                                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                                 >
                                                        <option value="">+ Agregar Producto</option>
                                                        {products.map(p => (
                                                               <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                                                        ))}
                                                 </select>
                                                 <input
                                                        type="number"
                                                        className="w-16 input-dark text-sm p-2 text-center"
                                                        min={1}
                                                        value={quantity}
                                                        onChange={e => setQuantity(Number(e.target.value))}
                                                 />
                                                 <button
                                                        onClick={handleAddItem}
                                                        disabled={!selectedProductId}
                                                        className="bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue font-bold px-3 rounded-lg text-lg"
                                                 >
                                                        +
                                                 </button>
                                          </div>
                                   </div>

                                   {/* 3. PAYMENTS */}
                                   <div className="space-y-3 pt-2 border-t border-white/5">
                                          <div className="flex justify-between items-center">
                                                 <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pagos</h3>
                                                 <div className="text-xs text-text-grey">
                                                        Total a Pagar: <span className="text-white font-bold">${totalCost.toLocaleString()}</span>
                                                 </div>
                                          </div>

                                          {/* Transactions List */}
                                          {booking.transactions && booking.transactions.length > 0 && (
                                                 <div className="space-y-1 mb-2">
                                                        {booking.transactions.map((t: any) => (
                                                               <div key={t.id} className="flex justify-between text-xs text-zinc-400 px-2">
                                                                      <span>{new Date(t.createdAt).toLocaleTimeString()} - {t.method}</span>
                                                                      <span className="text-green-400 font-mono">+ ${t.amount.toLocaleString()}</span>
                                                               </div>
                                                        ))}
                                                        <div className="border-t border-white/5 mt-1 pt-1 flex justify-between text-xs font-bold text-white px-2">
                                                               <span>Total Pagado</span>
                                                               <span>${totalPaid.toLocaleString()}</span>
                                                        </div>
                                                 </div>
                                          )}

                                          {pendingBalance > 0 ? (
                                                 <div className="bg-bg-surface p-3 rounded-xl border border-white/5 flex gap-2">
                                                        <input
                                                               type="number"
                                                               className="flex-1 bg-bg-dark border border-white/10 rounded-lg px-3 text-white font-mono focus:border-brand-green outline-none"
                                                               placeholder={`Monto (Restante: $${pendingBalance})`}
                                                               value={paymentAmount}
                                                               onChange={(e) => setPaymentAmount(e.target.value)}
                                                        />
                                                        <button
                                                               onClick={handlePayment}
                                                               disabled={loading}
                                                               className="bg-brand-green hover:bg-brand-green-variant text-bg-dark font-bold px-4 rounded-lg text-sm disabled:opacity-50"
                                                        >
                                                               Cobrar
                                                        </button>
                                                 </div>
                                          ) : (
                                                 <div className="bg-brand-green/10 text-brand-green text-center p-2 rounded-lg text-sm font-bold border border-brand-green/20">
                                                        ¡Todo Pagado!
                                                 </div>
                                          )}
                                   </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-bg-surface border-t border-white/5 flex justify-between gap-3 shrink-0">
                                   <button
                                          onClick={handleCancel}
                                          className="text-red-400 hover:text-red-300 text-sm font-bold hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                                   >
                                          Cancelar
                                   </button>
                                   <div className="flex gap-2">
                                          {booking.status === 'PENDING' && (
                                                 <button
                                                        onClick={handleConfirm}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-sm"
                                                 >
                                                        Confirmar
                                                 </button>
                                          )}
                                          <button
                                                 onClick={onClose}
                                                 className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-lg text-sm"
                                          >
                                                 Cerrar
                                          </button>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
