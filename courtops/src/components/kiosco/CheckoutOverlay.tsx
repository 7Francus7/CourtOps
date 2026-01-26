'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Banknote, Landmark, CreditCard, NotebookPen, Loader2 } from 'lucide-react'
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
}

export function CheckoutOverlay({ total, pendingToPay, selectedClient, onClose, onFinalize, processing }: CheckoutOverlayProps) {
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
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={onClose}
                     />
                     <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="relative z-10 bg-[#18181B] border border-white/5 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/50"
                     >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#18181B]">
                                   <h3 className="text-xl font-bold text-white tracking-tight">Finalizar Venta</h3>
                                   <button onClick={onClose} className="bg-white/5 hover:bg-white/10 p-2 rounded-full text-zinc-400 hover:text-white transition-colors">
                                          <X size={20} />
                                   </button>
                            </div>

                            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                   <div className="flex flex-col items-center">
                                          <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] font-bold mb-2">Total a Pagar</p>
                                          <div className="relative">
                                                 <span className="text-6xl font-black text-white tracking-tighter">${localPendingToPay.toLocaleString()}</span>
                                          </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-3">
                                          {[
                                                 { id: 'CASH', label: 'Efectivo', icon: Banknote },
                                                 { id: 'TRANSFER', label: 'Transferencia', icon: Landmark },
                                                 { id: 'CREDIT', label: 'Tarjeta', icon: CreditCard },
                                                 { id: 'ACCOUNT', label: 'A Cuenta', icon: NotebookPen, reqClient: true }
                                          ].map(m => (
                                                 <button
                                                        key={m.id}
                                                        onClick={() => setSelectedMethod(m.id)}
                                                        disabled={m.reqClient && !selectedClient}
                                                        className={cn(
                                                               "p-4 rounded-2xl border font-bold text-sm transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                                                               selectedMethod === m.id
                                                                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                                                                      : "bg-[#121214] border-white/5 text-zinc-400 hover:bg-[#1C1C1F] hover:border-white/10",
                                                               m.reqClient && !selectedClient && "opacity-30 cursor-not-allowed grayscale"
                                                        )}
                                                 >
                                                        <m.icon className={cn("w-6 h-6", selectedMethod === m.id ? "text-white" : "text-zinc-500 group-hover:text-white")} />
                                                        {m.label}
                                                        {selectedMethod === m.id && (
                                                               <motion.div layoutId="active-ring" className="absolute inset-0 border-2 border-white/20 rounded-2xl" />
                                                        )}
                                                 </button>
                                          ))}
                                   </div>

                                   <div className="bg-[#121214] p-5 rounded-2xl border border-white/5 space-y-4">
                                          <div>
                                                 <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-2">Monto Recibido</label>
                                                 <div className="relative group">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg group-focus-within:text-blue-500 transition-colors">$</span>
                                                        <input
                                                               type="number"
                                                               autoFocus
                                                               className="w-full bg-[#09090B] border border-white/5 rounded-xl py-4 pl-8 pr-4 text-white font-mono text-2xl outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
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
                                                               <div className="flex justify-between items-center bg-[#D4FF00]/5 p-4 rounded-xl border border-[#D4FF00]/20">
                                                                      <span className="text-[#D4FF00] font-bold text-xs uppercase tracking-wider">Vuelto a entregar</span>
                                                                      <span className="text-[#D4FF00] font-mono font-black text-2xl">${change.toLocaleString()}</span>
                                                               </div>
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>
                                   </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-[#121214]">
                                   {localPendingToPay > 0 && parseFloat(receivedAmount) > 0 && parseFloat(receivedAmount) < localPendingToPay && (
                                          <motion.button
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 onClick={() => addPaymentLine(selectedMethod, parseFloat(receivedAmount))}
                                                 className="w-full mb-3 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide border border-white/5 hover:border-white/10"
                                          >
                                                 + Agregar Pago Parcial
                                          </motion.button>
                                   )}
                                   <button
                                          onClick={handleFinalizeClick}
                                          disabled={processing || (paymentLines.length > 0 && localPendingToPay > 0)}
                                          className="w-full bg-[#D4FF00] hover:bg-[#b0d100] text-black font-black py-4 rounded-xl text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,255,0,0.2)] hover:shadow-[0_0_30px_rgba(212,255,0,0.4)] active:scale-[0.98]"
                                   >
                                          {processing ? (
                                                 <span className="flex items-center justify-center gap-2">
                                                        <Loader2 className="animate-spin w-5 h-5" /> PROCESANDO...
                                                 </span>
                                          ) : 'COMPLETAR COBRO'}
                                   </button>
                            </div>
                     </motion.div>
              </div>
       )
}
