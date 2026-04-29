'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Banknote, Landmark, CreditCard, NotebookPen, Loader2, Plus, Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Client } from './types'

interface Payment {
       method: string
       amount: number
}

interface CheckoutOverlayProps {
       total: number
       selectedClient: Client | null
       onClose: () => void
       onFinalize: (payments: Payment[]) => void
       processing: boolean
       allowCredit?: boolean
}

const METHOD_LABELS: Record<string, string> = {
       CASH: 'Efectivo',
       TRANSFER: 'Transferencia',
       CREDIT: 'Tarjeta',
       ACCOUNT: 'A Cuenta',
}

export function CheckoutOverlay({ total, selectedClient, onClose, onFinalize, processing, allowCredit = true }: CheckoutOverlayProps) {
       const [receivedAmount, setReceivedAmount] = useState<string>('')
       const [paymentLines, setPaymentLines] = useState<Payment[]>([])
       const [selectedMethod, setSelectedMethod] = useState<string>('CASH')

       useEffect(() => { setReceivedAmount('') }, [selectedMethod])

       const paidSoFar = paymentLines.reduce((acc, p) => acc + p.amount, 0)
       const remaining = Math.max(0, total - paidSoFar)
       const enteredAmount = parseFloat(receivedAmount) || 0
       const isSplitMode = paymentLines.length > 0
       const change = selectedMethod === 'CASH' && enteredAmount > remaining ? enteredAmount - remaining : 0
       const missingAmount = enteredAmount > 0 && enteredAmount < remaining ? remaining - enteredAmount : 0
       const exceedsAmount = selectedMethod !== 'CASH' && enteredAmount > remaining ? enteredAmount - remaining : 0
       const isFullyCovered = isSplitMode && remaining === 0

       const methods = [
              { id: 'CASH', label: 'Efectivo', icon: Banknote },
              { id: 'TRANSFER', label: 'Transferencia', icon: Landmark },
              { id: 'CREDIT', label: 'Tarjeta', icon: CreditCard },
              ...(allowCredit ? [{ id: 'ACCOUNT', label: 'A Cuenta', icon: NotebookPen, reqClient: true as const }] : []),
       ]

       const addPaymentLine = (amount: number) => {
              if (amount <= 0) return
              const capped = Math.min(amount, remaining)
              setPaymentLines(prev => [...prev, { method: selectedMethod, amount: capped }])
              setReceivedAmount('')
       }

       const handlePayRemaining = () => {
              addPaymentLine(remaining)
       }

       const handleFinalizeClick = () => {
              if (!isSplitMode) {
                     onFinalize([{ method: selectedMethod, amount: total }])
              } else {
                     onFinalize(paymentLines)
              }
       }

       return (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                     <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl"
                            onClick={onClose}
                     />
                     <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                     >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-slate-900 relative z-20">
                                   <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                          <Landmark className="text-emerald-600 dark:text-emerald-500 w-5 h-5" />
                                          FINALIZAR VENTA
                                   </h3>
                                   <button onClick={onClose} className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 p-2.5 rounded-full text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                                          <X size={20} />
                                   </button>
                            </div>

                            <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar relative z-20">

                                   {/* Total / Remaining */}
                                   <div className="flex flex-col items-center">
                                          <p className="text-emerald-600 dark:text-emerald-500 text-xs uppercase tracking-[0.2em] font-bold mb-1">
                                                 {isSplitMode && remaining > 0 ? 'Resta Pagar' : 'Total a Pagar'}
                                          </p>
                                          <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-zinc-400 tracking-tighter">
                                                 ${(isSplitMode ? remaining : total).toLocaleString()}
                                          </span>
                                          {isSplitMode && (
                                                 <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-1">
                                                        Total: ${total.toLocaleString()} · Pagado: ${paidSoFar.toLocaleString()}
                                                 </p>
                                          )}
                                   </div>

                                   {/* Payment lines */}
                                   <AnimatePresence>
                                          {paymentLines.length > 0 && (
                                                 <motion.div
                                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-1.5 overflow-hidden"
                                                 >
                                                        <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest">Pagos registrados</p>
                                                        {paymentLines.map((pl, i) => (
                                                               <div key={i} className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                                                      <span className="text-slate-600 dark:text-zinc-300 font-medium text-sm">{METHOD_LABELS[pl.method] ?? pl.method}</span>
                                                                      <div className="flex items-center gap-2">
                                                                             <span className="text-emerald-600 dark:text-emerald-400 font-bold">${pl.amount.toLocaleString()}</span>
                                                                             <button
                                                                                    onClick={() => setPaymentLines(prev => prev.filter((_, idx) => idx !== i))}
                                                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                                             >
                                                                                    <X size={14} />
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                        ))}
                                                        {isFullyCovered && (
                                                               <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs py-1">
                                                                      <Check size={13} /> Pago completo
                                                               </div>
                                                        )}
                                                 </motion.div>
                                          )}
                                   </AnimatePresence>

                                   {/* Input section — hide when fully covered */}
                                   {!isFullyCovered && (
                                          <>
                                                 {/* Method selector */}
                                                 <div className="grid grid-cols-2 gap-2.5">
                                                        {methods.map(m => (
                                                               <button
                                                                      key={m.id}
                                                                      onClick={() => setSelectedMethod(m.id)}
                                                                      disabled={'reqClient' in m && m.reqClient && !selectedClient}
                                                                      className={cn(
                                                                             "p-4 rounded-2xl border font-bold text-sm transition-all flex flex-col items-center gap-2.5 group",
                                                                             selectedMethod === m.id
                                                                                    ? "bg-emerald-500 text-white dark:text-black border-emerald-400 shadow-sm"
                                                                                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:text-slate-900 dark:hover:text-white",
                                                                             'reqClient' in m && m.reqClient && !selectedClient && "opacity-30 cursor-not-allowed"
                                                                      )}
                                                               >
                                                                      <m.icon className={cn("w-6 h-6", selectedMethod === m.id ? "text-white dark:text-black" : "text-slate-400 dark:text-zinc-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400")} />
                                                                      {m.label}
                                                               </button>
                                                        ))}
                                                 </div>

                                                 {/* Amount input */}
                                                 <div className="bg-slate-50/50 dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
                                                        <label className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest block">
                                                               Monto en {METHOD_LABELS[selectedMethod] ?? selectedMethod}
                                                        </label>
                                                        <div className="relative group">
                                                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-lg group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors pointer-events-none font-bold">$</span>
                                                               <input
                                                                      type="number"
                                                                      autoFocus
                                                                      className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-10 pr-4 text-slate-900 dark:text-white text-3xl font-black tracking-tight outline-none focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 dark:focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-700 shadow-sm"
                                                                      placeholder={remaining.toString()}
                                                                      value={receivedAmount}
                                                                      onChange={e => setReceivedAmount(e.target.value)}
                                                                      onKeyDown={e => {
                                                                             if (e.key === 'Enter' && enteredAmount > 0 && enteredAmount < remaining) addPaymentLine(enteredAmount)
                                                                      }}
                                                               />
                                                        </div>

                                                        <AnimatePresence mode="wait">
                                                               {enteredAmount > 0 && (
                                                                      <motion.div
                                                                             key={
                                                                                    change > 0
                                                                                           ? 'change'
                                                                                           : missingAmount > 0
                                                                                                  ? 'missing'
                                                                                                  : exceedsAmount > 0
                                                                                                         ? 'exceeds'
                                                                                                         : 'exact'
                                                                             }
                                                                             initial={{ height: 0, opacity: 0 }}
                                                                             animate={{ height: 'auto', opacity: 1 }}
                                                                             exit={{ height: 0, opacity: 0 }}
                                                                             className="overflow-hidden"
                                                                      >
                                                                             {missingAmount > 0 ? (
                                                                                    <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-500/10 p-3.5 rounded-xl border border-amber-100 dark:border-amber-500/20">
                                                                                           <span className="text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">Faltan para completar</span>
                                                                                           <span className="text-amber-700 dark:text-amber-300 font-black text-2xl">${missingAmount.toLocaleString()}</span>
                                                                                    </div>
                                                                             ) : change > 0 ? (
                                                                                    <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                                                                           <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">Vuelto a entregar</span>
                                                                                           <span className="text-emerald-600 dark:text-emerald-400 font-black text-2xl">${change.toLocaleString()}</span>
                                                                                    </div>
                                                                             ) : exceedsAmount > 0 ? (
                                                                                    <div className="flex justify-between items-center bg-sky-50 dark:bg-sky-500/10 p-3.5 rounded-xl border border-sky-100 dark:border-sky-500/20">
                                                                                           <span className="text-sky-700 dark:text-sky-300 font-bold text-xs uppercase tracking-wider">Excede el cobro</span>
                                                                                           <span className="text-sky-700 dark:text-sky-300 font-black text-2xl">${exceedsAmount.toLocaleString()}</span>
                                                                                    </div>
                                                                             ) : (
                                                                                    <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                                                                           <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">Pago exacto</span>
                                                                                           <span className="text-emerald-600 dark:text-emerald-400 font-black text-base">Sin diferencia</span>
                                                                                    </div>
                                                                             )}
                                                                      </motion.div>
                                                               )}
                                                        </AnimatePresence>

                                                        {/* Add partial — shows when entered amount < remaining */}
                                                        <AnimatePresence>
                                                               {enteredAmount > 0 && enteredAmount < remaining && (
                                                                      <motion.button
                                                                             initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                                                                             onClick={() => addPaymentLine(enteredAmount)}
                                                                             className="w-full bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 font-bold py-3 rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center gap-2 transition-all"
                                                                      >
                                                                             <Plus className="w-4 h-4" />
                                                                             Agregar ${enteredAmount.toLocaleString()} en {METHOD_LABELS[selectedMethod]}
                                                                             <span className="text-slate-400 dark:text-zinc-500 font-normal">· resta ${(remaining - enteredAmount).toLocaleString()}</span>
                                                                      </motion.button>
                                                               )}
                                                        </AnimatePresence>

                                                        {/* Pay remaining shortcut — shows in split mode with no amount entered */}
                                                        <AnimatePresence>
                                                               {isSplitMode && remaining > 0 && enteredAmount === 0 && (
                                                                      <motion.button
                                                                             initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                                                                             onClick={handlePayRemaining}
                                                                             className="w-full bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold py-3 rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center gap-2 transition-all"
                                                                      >
                                                                             <ArrowRight className="w-4 h-4" />
                                                                             Pagar ${remaining.toLocaleString()} restantes en {METHOD_LABELS[selectedMethod]}
                                                                      </motion.button>
                                                               )}
                                                        </AnimatePresence>
                                                 </div>
                                          </>
                                   )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 relative z-20">
                                   <button
                                          onClick={handleFinalizeClick}
                                          disabled={processing || (isSplitMode && !isFullyCovered)}
                                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-black py-4 rounded-xl text-lg uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] border border-emerald-400"
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
