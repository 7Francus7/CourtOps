'use client'

import React, { useState } from 'react'
import { getCajaStats, closeCashRegister } from '@/actions/cash-register'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CloseRegisterModalProps {
       isOpen: boolean
       onClose: () => void
       initialStats: any
       onSuccess: () => void
}

export default function CloseRegisterModal({ isOpen, onClose, initialStats, onSuccess }: CloseRegisterModalProps) {
       const [step, setStep] = useState(1) // 1: Input, 2: Review
       const [realCash, setRealCash] = useState('')
       const [realTransfer, setRealTransfer] = useState('') // Optional verification
       const [loading, setLoading] = useState(false)

       if (!isOpen || !initialStats) return null

       const systemCash = initialStats.expectedCash || (initialStats.incomeCash - initialStats.expenses)
       const systemTransfer = initialStats.incomeTransfer

       // Calculate differences
       const enteredCash = parseFloat(realCash) || 0
       const dash = enteredCash - systemCash

       async function handleClose() {
              setLoading(true)
              const res = await closeCashRegister(initialStats.id, parseFloat(realCash) || 0)
              if (res.success) {
                     toast.success("Caja cerrada correctamente")
                     onSuccess()
                     onClose()
              } else {
                     toast.error("Error al cerrar caja")
              }
              setLoading(false)
       }

       return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                     <div className="bg-[#111418] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                            <div className="flex justify-between items-center mb-6">
                                   <h2 className="text-xl font-bold text-white">
                                          {step === 1 ? 'Arqueo de Caja' : 'Resumen de Cierre'}
                                   </h2>
                                   <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
                            </div>

                            {step === 1 && (
                                   <div className="space-y-6">
                                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                 <label className="text-xs uppercase text-white/50 font-bold block mb-2">Efectivo Físico en Caja</label>
                                                 <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">$</span>
                                                        <input
                                                               type="number"
                                                               autoFocus
                                                               className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white outline-none focus:border-brand-green transition-all"
                                                               placeholder="0.00"
                                                               value={realCash}
                                                               onChange={e => setRealCash(e.target.value)}
                                                        />
                                                 </div>
                                                 <p className="text-[10px] text-white/30 mt-2">Cuenta los billetes en el cajón e ingresa el total.</p>
                                          </div>

                                          {/* Optional transfer check if needed, but usually we trust digital */}
                                          <div className="bg-white/5 p-4 rounded-xl border border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                                                 <label className="text-xs uppercase text-white/50 font-bold block mb-2">Total Digital (Opcional)</label>
                                                 <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">$</span>
                                                        <input
                                                               type="number"
                                                               className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-lg font-bold text-white outline-none focus:border-brand-blue transition-all"
                                                               placeholder={systemTransfer.toString()}
                                                               value={realTransfer}
                                                               onChange={e => setRealTransfer(e.target.value)}
                                                        />
                                                 </div>
                                          </div>

                                          <button
                                                 onClick={() => setStep(2)}
                                                 disabled={!realCash}
                                                 className="w-full bg-brand-green text-bg-dark font-black py-4 rounded-xl hover:bg-brand-green-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                          >
                                                 Continuar
                                          </button>
                                   </div>
                            )}

                            {step === 2 && (
                                   <div className="space-y-6">
                                          <div className="grid grid-cols-2 gap-4">
                                                 <div className="bg-bg-dark p-4 rounded-xl text-center border border-white/5">
                                                        <div className="text-xs text-white/50 uppercase font-bold mb-1">Esperado (Sistema)</div>
                                                        <div className="text-xl font-bold text-white">${systemCash.toLocaleString()}</div>
                                                 </div>
                                                 <div className="bg-bg-dark p-4 rounded-xl text-center border border-white/5">
                                                        <div className="text-xs text-white/50 uppercase font-bold mb-1">Real (Ingresado)</div>
                                                        <div className="text-xl font-bold text-white">${enteredCash.toLocaleString()}</div>
                                                 </div>
                                          </div>

                                          <div className={cn(
                                                 "p-4 rounded-xl border flex items-center justify-between",
                                                 dash === 0 ? "bg-brand-green/10 border-brand-green/30" :
                                                        dash > 0 ? "bg-brand-blue/10 border-brand-blue/30" : "bg-red-500/10 border-red-500/30"
                                          )}>
                                                 <span className="font-bold text-sm text-white/80">Diferencia</span>
                                                 <span className={cn(
                                                        "font-black text-2xl",
                                                        dash === 0 ? "text-brand-green" :
                                                               dash > 0 ? "text-brand-blue" : "text-red-500"
                                                 )}>
                                                        {dash > 0 ? '+' : ''}{dash.toLocaleString()}
                                                 </span>
                                          </div>

                                          <div className="text-xs text-center text-white/40">
                                                 {dash === 0 ? "✨ La caja cuadra perfectamente." :
                                                        dash > 0 ? "⚠️ Hay dinero sobrante no registrado." :
                                                               "🚨 Falta dinero en la caja."}
                                          </div>

                                          <div className="flex gap-3">
                                                 <button
                                                        onClick={() => setStep(1)}
                                                        className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10"
                                                 >
                                                        Atrás
                                                 </button>
                                                 <button
                                                        onClick={handleClose}
                                                        disabled={loading}
                                                        className="flex-1 bg-white text-bg-dark font-black py-3 rounded-xl hover:bg-gray-200"
                                                 >
                                                        {loading ? 'Cerrando...' : 'Confirmar Cierre Z'}
                                                 </button>
                                          </div>
                                   </div>
                            )}
                     </div>
              </div>
       )
}
