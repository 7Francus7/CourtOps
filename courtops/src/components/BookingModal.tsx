'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createBooking } from '@/actions/createBooking'
import { cn } from '@/lib/utils'

type Props = {
       isOpen: boolean
       onClose: () => void
       onSuccess: () => void
       initialDate: Date
       initialTime?: string
       initialCourtId?: number
       courts: { id: number, name: string }[]
}

export default function BookingModal({ isOpen, onClose, onSuccess, initialDate, initialTime, initialCourtId, courts }: Props) {
       const [formData, setFormData] = useState({
              name: '',
              phone: '',
              email: '',
              time: initialTime || '14:00',
              courtId: initialCourtId || (courts[0]?.id || 0),
              notes: '',
              isMember: false,
              isRecurring: false,
              recurringEndDate: '',
              paymentType: 'none' as 'none' | 'full' | 'partial',
              depositAmount: ''
       })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [error, setError] = useState('')

       useEffect(() => {
              if (isOpen) {
                     setFormData(prev => ({
                            ...prev,
                            time: initialTime || '14:00',
                            courtId: initialCourtId || (courts[0]?.id || 0),
                            // Reset payment fields on open
                            paymentType: 'none',
                            depositAmount: ''
                     }))
              }
       }, [isOpen, initialTime, initialCourtId, courts])

       if (!isOpen) return null

       // Fixed time slots (1.5h duration) - CUSTOM RULES
       const timeOptions = [
              '14:00',
              '15:30',
              '17:00',
              '18:30',
              '20:00',
              '21:30',
              '23:00'
       ]

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setIsSubmitting(true)
              setError('')

              try {
                     const [hours, minutes] = formData.time.split(':').map(Number)
                     const startDate = new Date(initialDate)
                     startDate.setHours(hours, minutes, 0, 0)

                     let paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL' = 'UNPAID'
                     if (formData.paymentType === 'full') paymentStatus = 'PAID'
                     if (formData.paymentType === 'partial') paymentStatus = 'PARTIAL'

                     const res = await createBooking({
                            clientName: formData.name,
                            clientPhone: formData.phone,
                            clientEmail: formData.email || undefined,
                            courtId: Number(formData.courtId),
                            startTime: startDate,
                            paymentStatus: paymentStatus,
                            advancePaymentAmount: formData.paymentType === 'partial' ? Number(formData.depositAmount) : undefined,
                            notes: formData.notes,
                            isMember: formData.isMember,
                            recurringEndDate: formData.isRecurring && formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined
                     })

                     if (res.success) {
                            onSuccess()
                            onClose()
                     } else {
                            setError(res.error as string)
                     }
              } catch (err) {
                     setError('Error al crear reserva. Intente de nuevo.')
              } finally {
                     setIsSubmitting(false)
              }
       }

       return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
                     <div className="bg-[#111418] border-0 sm:border border-white/10 w-full max-w-lg sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh]">

                            {/* Brand Header */}
                            <div className="relative p-8 text-center bg-brand-blue/5 border-b border-white/5 pb-10">
                                   <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                   </button>

                                   <div className="flex flex-col items-center gap-3">
                                          <div className="w-16 h-16 bg-brand-blue/20 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-brand-blue/10 animate-bounce-slow">
                                                 🎾
                                          </div>
                                          <h2 className="text-3xl font-black text-white tracking-tight">Nueva Reserva</h2>
                                          <p className="text-brand-blue font-bold uppercase tracking-widest text-[10px] bg-brand-blue/10 px-4 py-1.5 rounded-full">
                                                 {format(initialDate, "EEEE d 'de' MMMM", { locale: es })}
                                          </p>
                                   </div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar bg-[#0B0D10]/50">

                                   {error && (
                                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-in slide-in-from-top-2 duration-300">
                                                 ⚠️ {error}
                                          </div>
                                   )}

                                   {/* Time & Court Selection */}
                                   <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Horario</label>
                                                 <select
                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-brand-blue transition-all appearance-none cursor-pointer"
                                                        value={formData.time}
                                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                 >
                                                        {timeOptions.map(t => <option key={t} value={t}>{t} Hs</option>)}
                                                        {/* Force include initialTime if not in options to avoid broken select state? 
                                                            Actually, typical behavior: if value not in options, select might show empty. 
                                                            We ensure initialTime logic in parent aligns or user picks one. 
                                                        */}
                                                 </select>
                                          </div>
                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Cancha</label>
                                                 <select
                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-brand-blue transition-all appearance-none cursor-pointer"
                                                        value={formData.courtId}
                                                        onChange={e => setFormData({ ...formData, courtId: Number(e.target.value) })}
                                                 >
                                                        {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                 </select>
                                          </div>
                                   </div>

                                   {/* Client Info */}
                                   <div className="space-y-4">
                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Nombre del Cliente</label>
                                                 <input
                                                        required
                                                        type="text"
                                                        placeholder="Escribe el nombre..."
                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-brand-blue transition-all placeholder:text-white/10"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                 />
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Teléfono / WhatsApp</label>
                                                 <div className="relative">
                                                        <input
                                                               required
                                                               type="tel"
                                                               placeholder="351 1234567"
                                                               className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-white font-mono outline-none focus:border-brand-blue transition-all placeholder:text-white/10"
                                                               value={formData.phone}
                                                               onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        />
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl grayscale opacity-30">📱</span>
                                                 </div>
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Email <span className="normal-case opacity-40 font-medium">(Opcional)</span></label>
                                                 <input
                                                        type="email"
                                                        placeholder="cliente@ejemplo.com"
                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-brand-blue transition-all placeholder:text-white/10 text-sm"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                 />
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Notas / Pedidos Especiales</label>
                                                 <textarea
                                                        placeholder="Jugadores traen sus paletas, requiere pelotas nuevas..."
                                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-medium outline-none focus:border-brand-blue transition-all placeholder:text-white/10 h-24 resize-none text-sm"
                                                        value={formData.notes}
                                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                 />
                                          </div>
                                   </div>

                                   {/* Membership Toggle */}
                                   <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                          <div className="flex flex-col">
                                                 <span className="text-xs font-bold text-white uppercase tracking-widest">¿Es Socio?</span>
                                                 <span className="text-[10px] text-white/40">Aplica tarifa preferencial si existe</span>
                                          </div>
                                          <button
                                                 type="button"
                                                 onClick={() => setFormData({ ...formData, isMember: !formData.isMember })}
                                                 className={cn(
                                                        "w-12 h-6 rounded-full transition-colors relative flex items-center",
                                                        formData.isMember ? "bg-brand-blue" : "bg-white/10"
                                                 )}
                                          >
                                                 <span className={cn(
                                                        "w-4 h-4 bg-white rounded-full shadow-md absolute transition-all",
                                                        formData.isMember ? "translate-x-7" : "translate-x-1"
                                                 )} />
                                          </button>
                                   </div>

                                   {/* Recurring Toggle */}
                                   <div className="space-y-3">
                                          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                                 <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-white uppercase tracking-widest">Turno Fijo</span>
                                                        <span className="text-[10px] text-white/40">Repetir esta reserva semanalmente</span>
                                                 </div>
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                                                        className={cn(
                                                               "w-12 h-6 rounded-full transition-colors relative flex items-center",
                                                               formData.isRecurring ? "bg-brand-blue" : "bg-white/10"
                                                        )}
                                                 >
                                                        <span className={cn(
                                                               "w-4 h-4 bg-white rounded-full shadow-md absolute transition-all",
                                                               formData.isRecurring ? "translate-x-7" : "translate-x-1"
                                                        )} />
                                                 </button>
                                          </div>

                                          {/* Recurring End Date Input */}
                                          {formData.isRecurring && (
                                                 <div className="p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/20 animate-in slide-in-from-top-2">
                                                        <label className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] ml-1 block mb-2">
                                                               Repetir hasta (Fecha fin)
                                                        </label>
                                                        <input
                                                               type="date"
                                                               required={formData.isRecurring}
                                                               className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-medium outline-none focus:border-brand-blue transition-all"
                                                               value={formData.recurringEndDate || ''}
                                                               onChange={e => setFormData({ ...formData, recurringEndDate: e.target.value })}
                                                               min={new Date().toISOString().split('T')[0]}
                                                        />
                                                        <p className="text-[10px] text-white/40 mt-2">
                                                               Se crearán reservas todos los <strong>{format(initialDate, "EEEE", { locale: es })}</strong> hasta la fecha seleccionada.
                                                        </p>
                                                 </div>
                                          )}
                                   </div>

                                   {/* Enhanced Payment Selector */}
                                   <div className="space-y-3 pt-2">
                                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Pago / Seña</label>
                                          <div className="grid grid-cols-3 gap-2">
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentType: 'none', depositAmount: '' })}
                                                        className={cn(
                                                               "p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                               formData.paymentType === 'none'
                                                                      ? "bg-white/10 border-white/20 text-white"
                                                                      : "bg-transparent border-white/5 text-white/40 hover:bg-white/5"
                                                        )}
                                                 >
                                                        Sin Pago
                                                 </button>
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentType: 'full', depositAmount: '' })}
                                                        className={cn(
                                                               "p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                               formData.paymentType === 'full'
                                                                      ? "bg-brand-green/20 border-brand-green text-brand-green"
                                                                      : "bg-transparent border-white/5 text-white/40 hover:bg-white/5"
                                                        )}
                                                 >
                                                        Pago Total
                                                 </button>
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentType: 'partial' })}
                                                        className={cn(
                                                               "p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                               formData.paymentType === 'partial'
                                                                      ? "bg-orange-500/20 border-orange-500 text-orange-500"
                                                                      : "bg-transparent border-white/5 text-white/40 hover:bg-white/5"
                                                        )}
                                                 >
                                                        Seña
                                                 </button>
                                          </div>

                                          {/* Partial Payment Input */}
                                          {formData.paymentType === 'partial' && (
                                                 <div className="space-y-2 animate-in slide-in-from-top-2">
                                                        <div className="relative">
                                                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold">$</span>
                                                               <input
                                                                      type="number"
                                                                      min="1"
                                                                      step="100"
                                                                      placeholder="Monto de la seña..."
                                                                      className="w-full bg-orange-500/5 border border-orange-500/30 rounded-2xl p-4 pl-8 text-white font-mono font-bold outline-none focus:border-orange-500 transition-all placeholder:text-white/20"
                                                                      value={formData.depositAmount}
                                                                      onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
                                                               />
                                                        </div>
                                                        <p className="text-[10px] text-white/40 ml-1">
                                                               Se registrará un ingreso parcial (caja) y la reserva quedará como PENDIENTE de saldo.
                                                        </p>
                                                 </div>
                                          )}

                                          {formData.paymentType === 'full' && (
                                                 <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl animate-in slide-in-from-top-2">
                                                        <p className="text-[10px] text-brand-green font-medium text-center">
                                                               Se marcará como PAGADA y se registrará el total en la caja diaria.
                                                        </p>
                                                 </div>
                                          )}
                                   </div>

                                   <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-12 sm:pb-4">
                                          <button
                                                 type="button"
                                                 onClick={onClose}
                                                 disabled={isSubmitting}
                                                 className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                                          >
                                                 Cancelar
                                          </button>
                                          <button
                                                 type="submit"
                                                 disabled={isSubmitting}
                                                 className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-brand-green text-bg-dark hover:bg-brand-green-variant transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50"
                                          >
                                                 {isSubmitting ? 'Guardando...' : 'Confirmar Reserva'}
                                          </button>
                                   </div>

                            </form>

                            {isSubmitting && (
                                   <div className="absolute inset-0 z-[100] bg-bg-dark/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                                          <div className="relative">
                                                 <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
                                                 <div className="absolute inset-x-0 -bottom-8 text-center text-[10px] font-black text-brand-blue uppercase tracking-widest animate-pulse">Procesando...</div>
                                          </div>
                                   </div>
                            )}
                     </div>
              </div>
       )
}
