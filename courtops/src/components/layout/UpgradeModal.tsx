'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, TrendingUp, X } from 'lucide-react'
import Link from 'next/link'

interface UpgradeModalProps {
       isOpen: boolean
       onClose: () => void
       featureName: string
       requiredPlan?: string
}

export function UpgradeModal({ isOpen, onClose, featureName, requiredPlan = 'Pro' }: UpgradeModalProps) {
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
                                   initial={{ scale: 0.94, opacity: 0, y: 10 }}
                                   animate={{ scale: 1, opacity: 1, y: 0 }}
                                   exit={{ scale: 0.94, opacity: 0, y: 10 }}
                                   className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-zinc-900"
                                   onClick={e => e.stopPropagation()}
                            >
                                   <button
                                          onClick={onClose}
                                          className="absolute top-4 right-4 z-10 rounded-full bg-black/5 p-2 transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                                          aria-label="Cerrar"
                                   >
                                          <X size={16} />
                                   </button>

                                   <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-700">
                                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/30 blur-3xl" />
                                          <div className="relative z-10 flex flex-col items-center text-white">
                                                 <div className="mb-2 rounded-2xl bg-white/20 p-3 shadow-lg backdrop-blur-md">
                                                        <TrendingUp size={32} />
                                                 </div>
                                                 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                                                        Modulo de crecimiento
                                                 </p>
                                          </div>
                                   </div>

                                   <div className="p-7 text-center sm:p-8">
                                          <h2 className="mb-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                                 {featureName} puede pagar el upgrade
                                          </h2>
                                          <p className="mb-6 leading-relaxed text-slate-500 dark:text-zinc-400">
                                                 Esta funcion esta incluida en el plan <strong className="text-emerald-500">{requiredPlan}</strong>.
                                                 La idea es simple: vender mas turnos, cobrar mejor y operar con menos tareas manuales.
                                          </p>

                                          <div className="mb-6 grid grid-cols-3 gap-2">
                                                 <ValueTile label="Vender" value="Mas turnos" tone="emerald" />
                                                 <ValueTile label="Cobrar" value="Menos deuda" tone="sky" />
                                                 <ValueTile label="Operar" value="Mas rapido" tone="violet" />
                                          </div>

                                          <div className="mb-8 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left dark:border-white/5 dark:bg-white/5">
                                                 <Benefit>Canales publicos, QR y reservas compartibles</Benefit>
                                                 <Benefit>Funciones premium para aumentar ticket promedio</Benefit>
                                                 <Benefit>Reportes para decidir con datos, no intuicion</Benefit>
                                          </div>

                                          <Link
                                                 href="/dashboard/suscripcion"
                                                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98]"
                                                 onClick={onClose}
                                          >
                                                 Ver planes y activar <ArrowRight size={18} />
                                          </Link>

                                          <button
                                                 onClick={onClose}
                                                 className="mt-4 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-white"
                                          >
                                                 Quizas mas tarde
                                          </button>
                                   </div>
                            </motion.div>
                     </motion.div>
              </AnimatePresence>
       )
}

function Benefit({ children }: { children: React.ReactNode }) {
       return (
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                     <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                            <Check size={12} strokeWidth={3} />
                     </div>
                     {children}
              </div>
       )
}

function ValueTile({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'sky' | 'violet' }) {
       const toneClasses = {
              emerald: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
              sky: 'border-sky-500/15 bg-sky-500/10 text-sky-600 dark:text-sky-400',
              violet: 'border-violet-500/15 bg-violet-500/10 text-violet-600 dark:text-violet-400'
       }

       return (
              <div className={`rounded-2xl border p-3 ${toneClasses[tone]}`}>
                     <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
                     <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{value}</p>
              </div>
       )
}
