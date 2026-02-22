'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface KioscoSuccessOverlayProps {
       onReset: () => void
}

export function KioscoSuccessOverlay({ onReset }: KioscoSuccessOverlayProps) {
       return (
              <div className="fixed inset-0 z-[150] bg-white/90 dark:bg-[#030712]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
                     <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="bg-emerald-500 rounded-full p-8 mb-8 shadow-[0_0_80px_rgba(16,185,129,0.5)] border border-emerald-400"
                     >
                            <Sparkles className="w-24 h-24 text-white dark:text-black fill-white/20 dark:fill-black/20" />
                     </motion.div>

                     <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-300 dark:to-teal-600 uppercase tracking-tighter mb-4 text-center"
                     >
                            ¡Venta Exitosa!
                     </motion.h2>

                     <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-slate-600 dark:text-zinc-400 mb-12 text-lg font-medium text-center max-w-md"
                     >
                            La transacción ha sido registrada correctamente y el stock actualizado en el sistema.
                     </motion.p>

                     <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col w-full max-w-sm gap-4"
                     >
                            <button
                                   onClick={onReset}
                                   className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                            >
                                   Nueva Venta
                            </button>
                     </motion.div>
              </div>
       )
}
