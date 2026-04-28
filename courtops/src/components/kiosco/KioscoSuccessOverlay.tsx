'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Receipt } from 'lucide-react'

interface KioscoSuccessOverlayProps {
       onReset: () => void
}

export function KioscoSuccessOverlay({ onReset }: KioscoSuccessOverlayProps) {
       return (
              <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
                     <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"
                     >
                            <div className="flex items-start gap-4">
                                   <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                                          <CheckCircle2 className="h-7 w-7" />
                                   </div>

                                   <div className="min-w-0 flex-1">
                                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                                                 Cobro confirmado
                                          </p>
                                          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                                 Venta registrada
                                          </h2>
                                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                                                 El pago se guardó correctamente y el stock ya fue actualizado.
                                          </p>
                                   </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                                   <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
                                          <Receipt className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                                          La venta quedó lista para continuar con una nueva operación.
                                   </div>
                            </div>

                            <div className="mt-6">
                                   <button
                                          onClick={onReset}
                                          className="w-full rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600 dark:text-black"
                                   >
                                          Nueva venta
                                   </button>
                            </div>
                     </motion.div>
              </div>
       )
}
