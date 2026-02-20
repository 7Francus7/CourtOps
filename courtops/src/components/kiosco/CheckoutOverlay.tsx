'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
       X, Banknote, Landmark, CreditCard, NotebookPen,
       Loader2,
       Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Client } from './types'

interface Payment {
       method: string
       amount: number
}

interface CheckoutOverlayProps {
       total: number
       pendingToPay: number
       selectedClient: Client | null
       onClose: () => void
       onFinalize: (payments: Payment[], method: string) => void
       processing: boolean
       allowCredit?: boolean
}

export function CheckoutOverlay({ total, pendingToPay, selectedClient, onClose, onFinalize, processing, allowCredit = true }: CheckoutOverlayProps) {
       const [receivedAmount, setReceivedAmount] = useState<string>('')
       const [paymentLines, setPaymentLines] = useState<Payment[]>([])
       const [selectedMethod, setSelectedMethod] = useState<string>('CASH')

       // Derived state inside component just for UI handling if needed, 
       // but the parent passed pendingToPay which might be what we want to track against?
       // Actually, the parent calculates pendingToPay based on ITS state of paymentLines. 
       // If we move paymentLines state here, we need to be careful.
       // The original code had paymentLines in the parent. Let's KEEP paymentLines in this component 
       // to isolate the complexity of "Partial Payments" to this modal if possible?
       // OR, if the parent needs to know about payments for the final submission, we should pass the final list up.

       // Let's refactor slightly: 
       // The parent controls "Sale Process". But the definition of "How it is paid" (split payments) can live here 
       // until the user clicks "Finalize".
       // So we will manage paymentLines LOCALLY here, and when clicking finalize, pass the result to parent.

       const localTotalInPayments = paymentLines.reduce((acc, p) => acc + p.amount, 0)
       const localPendingToPay = Math.max(0, total - localTotalInPayments)

       const change = useMemo(() => {
              const received = parseFloat(receivedAmount) || 0
              if (received <= localPendingToPay) return 0
              return received - localPendingToPay
       }, [receivedAmount, localPendingToPay])

       const addPaymentLine = (method: string, amount: number) => {
              if (amount <= 0) return
              setPaymentLines(prev => [...prev, { method, amount }])
              setReceivedAmount('')
       }

       const handleFinalizeClick = () => {
              // If there are partial payments, use them.
              // If no partial payments, use the selectedMethod and the Full Amount (assuming simple pay)
              // logic from original:
              const finalPayments = paymentLines.length > 0 ? paymentLines : [{ method: selectedMethod, amount: total }]
              onFinalize(finalPayments, selectedMethod)
       }

       return (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                     <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#030712]/80 backdrop-blur-xl"
                            onClick={onClose}
                     />
                     <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="relative z-10 bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                     >
                            {/* Inner ambient glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a] relative z-20">
                                   <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                          <Landmark className="text-emerald-500 w-5 h-5" />
                                          FINALIZAR VENTA
                                   </h3>
                                   <button onClick={onClose} className="bg-white/5 hover:bg-white/10 p-2.5 rounded-full text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                                          <X size={20} />
                                   </button>
                            </div>

                            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar relative z-20">
                                   <div className="flex flex-col items-center">
                                          <p className="text-emerald-500 text-xs uppercase tracking-[0.2em] font-bold mb-2">Total a Pagar</p>
                                          <div className="relative">
                                                 <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 tracking-tighter drop-shadow-sm">${localPendingToPay.toLocaleString()}</span>
                                          </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-3">
                                          {[
                                                 { id: 'CASH', label: 'Efectivo', icon: Banknote },
                                                 { id: 'TRANSFER', label: 'Transferencia', icon: Landmark },
                                                 { id: 'CREDIT', label: 'Tarjeta', icon: CreditCard },
                                                 { id: 'ACCOUNT', label: 'A Cuenta', icon: NotebookPen, reqClient: true, hidden: !allowCredit }
                                          ].filter(m => !m.hidden).map(m => (
                                                 <button
                                                        key={m.id}
                                                        onClick={() => setSelectedMethod(m.id)}
                                                        disabled={m.reqClient && !selectedClient}
                                                        className={cn(
                                                               "p-4 rounded-2xl border font-bold text-sm transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden group backdrop-blur-md z-10",
                                                               selectedMethod === m.id
                                                                      ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                                                      : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:border-emerald-500/30 hover:text-white",
                                                               m.reqClient && !selectedClient && "opacity-30 cursor-not-allowed grayscale"
                                                        )}
                                                 >
                                                        <m.icon className={cn("w-6 h-6", selectedMethod === m.id ? "text-black" : "text-zinc-500 group-hover:text-emerald-400")} />
                                                        {m.label}
                                                 </button>
                                          ))}
                                   </div>

                                   <div className="bg-[#030712] p-6 rounded-2xl border border-white/10 space-y-4 shadow-inner">
                                          <div>
                                                 <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Monto Recibido</label>
                                                 <div className="relative group">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg group-focus-within:text-emerald-400 transition-colors pointer-events-none font-bold">$</span>
                                                        <input
                                                               type="number"
                                                               autoFocus
                                                               className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white text-3xl font-black tracking-tight outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white/10 transition-all placeholder:text-zinc-700 font-sans shadow-sm"
                                                               placeholder={localPendingToPay.toString()}
                                                               value={receivedAmount}
                                                               onChange={e => setReceivedAmount(e.target.value)}
                                                        />
                                                 </div>
                                          </div>
                                          <AnimatePresence>
                                                 {selectedMethod === 'CASH' && parseFloat(receivedAmount) > localPendingToPay && (
                                                        <motion.div
                                                               initial={{ height: 0, opacity: 0 }}
                                                               animate={{ height: "auto", opacity: 1 }}
                                                               exit={{ height: 0, opacity: 0 }}
                                                               className="overflow-hidden"
                                                        >
                                                               <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 backdrop-blur-sm shadow-inner mt-4">
                                                                      <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Vuelto a entregar</span>
                                                                      <span className="text-emerald-400 font-black text-3xl tracking-tight drop-shadow-md">${change.toLocaleString()}</span>
                                                               </div>
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>
                                   </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-[#0f172a] relative z-20">
                                   {localPendingToPay > 0 && parseFloat(receivedAmount) > 0 && parseFloat(receivedAmount) < localPendingToPay && (
                                          <motion.button
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 onClick={() => addPaymentLine(selectedMethod, parseFloat(receivedAmount))}
                                                 className="w-full mb-3 bg-white/5 hover:bg-white/10 text-emerald-400 font-bold py-4 rounded-xl transition-colors text-sm uppercase tracking-wide border border-white/10 hover:border-emerald-500/30 flex items-center justify-center gap-2 shadow-sm"
                                          >
                                                 <Plus className="w-4 h-4" /> Agregar Pago Parcial
                                          </motion.button>
                                   )}
                                   <button
                                          onClick={handleFinalizeClick}
                                          disabled={processing || (paymentLines.length > 0 && localPendingToPay > 0)}
                                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl text-lg uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98] border border-emerald-400"
                                   >
                                          {processing ? (
                                                 <span className="flex items-center justify-center gap-2 font-black">
                                                        <Loader2 className="animate-spin w-5 h-5" /> PROCESANDO...
                                                 </span>
                                          ) : 'COMPLETAR COBRO'}
                                   </button>
                            </div>
                     </motion.div>
              </div>
       )
}
