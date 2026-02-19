'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UpgradeModalProps {
       isOpen: boolean
       onClose: () => void
       featureName: string
       requiredPlan?: string
}

export function UpgradeModal({ isOpen, onClose, featureName, requiredPlan = 'Profesional' }: UpgradeModalProps) {
       if (!isOpen) return null

       return (
              <AnimatePresence>
                     <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={onClose}
                     >
                            <motion.div
                                   initial={{ scale: 0.9, opacity: 0 }}
                                   animate={{ scale: 1, opacity: 1 }}
                                   exit={{ scale: 0.9, opacity: 0 }}
                                   className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative"
                                   onClick={e => e.stopPropagation()}
                            >
                                   {/* Close Button */}
                                   <button
                                          onClick={onClose}
                                          className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors z-10"
                                   >
                                          <X size={16} />
                                   </button>

                                   {/* Header Image / Gradient */}
                                   <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden flex items-center justify-center">
                                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                          <div className="relative z-10 flex flex-col items-center text-white">
                                                 <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md mb-2 shadow-lg">
                                                        <Sparkles size={32} />
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Content */}
                                   <div className="p-8 text-center">
                                          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                                 Desbloquea {featureName}
                                          </h2>
                                          <p className="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
                                                 Esta función está disponible exclusivamente en el plan <strong className="text-emerald-500">{requiredPlan}</strong>.
                                                 Mejora tu cuenta para acceder a ella y mucho más.
                                          </p>

                                          <div className="space-y-3 mb-8 text-left bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                                 <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                                                               <Check size={12} strokeWidth={3} />
                                                        </div>
                                                        Gestión completa de Torneos
                                                 </div>
                                                 <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                                                               <Check size={12} strokeWidth={3} />
                                                        </div>
                                                        Punto de Venta (Kiosco)
                                                 </div>
                                                 <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                                                               <Check size={12} strokeWidth={3} />
                                                        </div>
                                                        Reportes Avanzados
                                                 </div>
                                          </div>

                                          <Link
                                                 href="/dashboard/suscripcion"
                                                 className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                                 onClick={onClose}
                                          >
                                                 Ver Planes y Precios <ArrowRight size={18} />
                                          </Link>

                                          <button
                                                 onClick={onClose}
                                                 className="mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors font-medium"
                                          >
                                                 Quizás más tarde
                                          </button>
                                   </div>
                            </motion.div>
                     </motion.div>
              </AnimatePresence>
       )
}
