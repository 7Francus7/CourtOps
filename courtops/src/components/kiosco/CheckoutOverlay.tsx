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
                            className="absolute inset-0 bg-muted/60 backdrop-blur-md"
                            onClick={onClose}
                     />
                     <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="relative z-10 bg-muted border border-border w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/50"
                     >
                            <div className="p-6 border-b border-border flex justify-between items-center bg-muted">
                                   <h3 className="text-xl font-bold text-foreground tracking-tight">Finalizar Venta</h3>
                                   <button onClick={onClose} className="bg-muted hover:bg-muted/50 p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                                          <X size={20} />
                                   </button>
                            </div>

                            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                   <div className="flex flex-col items-center">
                                          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold mb-2">Total a Pagar</p>
                                          <div className="relative">
                                                 <span className="text-6xl font-black text-foreground tracking-tighter">${localPendingToPay.toLocaleString()}</span>
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
                                                               "p-4 rounded-2xl border font-bold text-sm transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                                                               selectedMethod === m.id
                                                                      ? "bg-primary border-primary text-foreground shadow-lg shadow-blue-600/20"
                                                                      : "bg-card border-border text-muted-foreground hover:bg-muted hover:border-border",
                                                               m.reqClient && !selectedClient && "opacity-30 cursor-not-allowed grayscale"
                                                        )}
                                                 >
                                                        <m.icon className={cn("w-6 h-6", selectedMethod === m.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                                        {m.label}
                                                        {selectedMethod === m.id && (
                                                               <motion.div layoutId="active-ring" className="absolute inset-0 border-2 border-border rounded-2xl" />
                                                        )}
                                                 </button>
                                          ))}
                                   </div>

                                   <div className="bg-card p-5 rounded-2xl border border-border space-y-4">
                                          <div>
                                                 <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Monto Recibido</label>
                                                 <div className="relative group">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg group-focus-within:text-primary transition-colors">$</span>
                                                        <input
                                                               type="number"
                                                               autoFocus
                                                               className="w-full bg-background border border-border rounded-xl py-4 pl-8 pr-4 text-foreground text-2xl outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
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
                                                               <div className="flex justify-between items-center bg-[D4FF00]/5 p-4 rounded-xl border border-[#D4FF00]/20">
                                                                      <span className="text-[#D4FF00] font-bold text-xs uppercase tracking-wider">Vuelto a entregar</span>
                                                                      <span className="text-[#D4FF00] font-black text-2xl">${change.toLocaleString()}</span>
                                                               </div>
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>
                                   </div>
                            </div>

                            <div className="p-6 border-t border-border bg-card">
                                   {localPendingToPay > 0 && parseFloat(receivedAmount) > 0 && parseFloat(receivedAmount) < localPendingToPay && (
                                          <motion.button
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 onClick={() => addPaymentLine(selectedMethod, parseFloat(receivedAmount))}
                                                 className="w-full mb-3 bg-muted hover:bg-muted/50 text-zinc-300 font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide border border-border hover:border-border"
                                          >
                                                 + Agregar Pago Parcial
                                          </motion.button>
                                   )}
                                   <button
                                          onClick={handleFinalizeClick}
                                          disabled={processing || (paymentLines.length > 0 && localPendingToPay > 0)}
                                          className="w-full bg-[D4FF00] hover:bg-[b0d100] text-black font-black py-4 rounded-xl text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,255,0,0.2)] hover:shadow-[0_0_30px_rgba(212,255,0,0.4)] active:scale-[0.98]"
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
