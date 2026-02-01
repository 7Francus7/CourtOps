'use client'

import React, { useState } from 'react'
import { addMovement } from '@/actions/cash-register'
import { toast } from 'sonner'
import { ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MovementModalProps {
       isOpen: boolean
       onClose: () => void
       onSuccess: () => void
}

type MovementType = 'INCOME' | 'EXPENSE'

export default function MovementModal({ isOpen, onClose, onSuccess }: MovementModalProps) {
       const [type, setType] = useState<MovementType>('EXPENSE')
       const [amount, setAmount] = useState('')
       const [description, setDescription] = useState('')
       const [loading, setLoading] = useState(false)

       if (!isOpen) return null

       async function handleSubmit(e: React.FormEvent) {
              e.preventDefault()
              setLoading(true)

              try {
                     const numericAmount = parseFloat(amount)
                     if (isNaN(numericAmount) || numericAmount <= 0) {
                            toast.error('Ingrese un monto válido')
                            setLoading(false)
                            return
                     }

                     const res = await addMovement(
                            numericAmount,
                            type,
                            description || (type === 'INCOME' ? 'Ingreso manual' : 'Gasto vario'),
                            type === 'INCOME' ? 'MANUAL_INCOME' : 'MANUAL_EXPENSE'
                     )

                     if (!res.success) throw new Error(res.error)

                     toast.success('Movimiento registrado')
                     onSuccess()
                     onClose()
              } catch (error) {
                     console.error(error)
                     toast.error('Error al registrar movimiento')
              } finally {
                     setLoading(false)
              }
       }

       return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                     <div className="bg-[#111418] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                   <h2 className="text-lg font-bold text-white">Registrar Movimiento</h2>
                                   <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                   {/* Type Selector */}
                                   <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-xl">
                                          <button
                                                 type="button"
                                                 onClick={() => setType('INCOME')}
                                                 className={cn(
                                                        "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all",
                                                        type === 'INCOME' ? "bg-emerald-500/20 text-emerald-500 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                                 )}
                                          >
                                                 <ArrowUpCircle size={18} />
                                                 Ingreso
                                          </button>
                                          <button
                                                 type="button"
                                                 onClick={() => setType('EXPENSE')}
                                                 className={cn(
                                                        "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all",
                                                        type === 'EXPENSE' ? "bg-red-500/20 text-red-400 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                                 )}
                                          >
                                                 <ArrowDownCircle size={18} />
                                                 Gasto / Retiro
                                          </button>
                                   </div>

                                   {/* Amount */}
                                   <div>
                                          <label className="text-xs uppercase text-zinc-500 font-bold block mb-2">Monto ($)</label>
                                          <input
                                                 type="number"
                                                 value={amount}
                                                 onChange={e => setAmount(e.target.value)}
                                                 className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-4 text-2xl font-bold text-white outline-none focus:ring-2 focus:ring-slate-700 transition-all placeholder:text-zinc-700"
                                                 placeholder="0.00"
                                                 autoFocus
                                                 required
                                          />
                                   </div>

                                   {/* Description */}
                                   <div>
                                          <label className="text-xs uppercase text-zinc-500 font-bold block mb-2">Descripción</label>
                                          <textarea
                                                 value={description}
                                                 onChange={e => setDescription(e.target.value)}
                                                 className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-slate-700 transition-all resize-none h-24 placeholder:text-zinc-700"
                                                 placeholder={type === 'INCOME' ? "Ej: Ajuste de caja, cambio inicial..." : "Ej: Limpieza, compra de insumos, retiro..."}
                                          />
                                   </div>

                                   <button
                                          type="submit"
                                          disabled={loading || !amount}
                                          className={cn(
                                                 "w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                                                 loading ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" :
                                                        type === 'INCOME' ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" :
                                                               "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                          )}
                                   >
                                          {loading && <Loader2 className="animate-spin" size={16} />}
                                          {type === 'INCOME' ? 'Registrar Ingreso' : 'Registrar Gasto'}
                                   </button>
                            </form>
                     </div>
              </div>
       )
}
