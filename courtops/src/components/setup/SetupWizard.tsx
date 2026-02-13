'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Store, ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { completeSetup, SetupData } from '@/actions/setup'
import { cn } from '@/lib/utils'

export function SetupWizard({ initialData }: { initialData: any }) {
       const router = useRouter()
       const [step, setStep] = useState(0)
       const [isLoading, setIsLoading] = useState(false)

       const [formData, setFormData] = useState<SetupData>({
              clubName: initialData.clubName || '',
              courtCount: 2,
              courtSurface: 'Grass',
              openTime: initialData.openTime || '14:00',
              closeTime: initialData.closeTime || '00:30',
              basePrice: 10000
       })

       const steps = [
              {
                     title: "Bienvenido",
                     desc: "Configuremos tu club en segundos.",
                     icon: Store
              },
              {
                     title: "Tu Club",
                     desc: "¿Cómo se llama y a qué hora abres?",
                     icon: Store
              },
              {
                     title: "Canchas",
                     desc: "¿Cuántas tienes y de qué tipo?",
                     icon: Store
              },
              {
                     title: "Precios",
                     desc: "¿Cuánto cuesta el turno base?",
                     icon: Store
              }
       ]

       const handleNext = async () => {
              // Validation
              if (step === 1) {
                     if (!formData.clubName.trim()) return alert("Por favor ingresa el nombre del club")
                     if (!formData.openTime || !formData.closeTime) return alert("Por favor define los horarios")
              }
              if (step === 3) {
                     if (formData.basePrice <= 0) return alert("El precio base debe ser mayor a 0")
              }

              if (step < steps.length - 1) {
                     setStep(step + 1)
              } else {
                     await handleSubmit()
              }
       }

       const handleBack = () => {
              if (step > 0) setStep(step - 1)
       }

       const handleSubmit = async () => {
              setIsLoading(true)
              try {
                     const res = await completeSetup(formData)
                     if (res.success) {
                            router.push('/dashboard')
                            router.refresh()
                     } else {
                            alert("Error: " + res.error)
                     }
              } catch (e) {
                     console.error(e)
              } finally {
                     setIsLoading(false)
              }
       }

       return (
              <div className="fixed inset-0 z-50 bg-[#09090b] text-white flex items-center justify-center p-4">
                     {/* Background Glow */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/5 via-transparent to-brand-blue/5 pointer-events-none" />

                     <div className="w-full max-w-lg relative">
                            {/* Progress Bar */}
                            <div className="flex gap-2 mb-8">
                                   {steps.map((s, i) => (
                                          <div
                                                 key={i}
                                                 className={cn(
                                                        "h-1 flex-1 rounded-full transition-all duration-500",
                                                        i <= step ? "bg-brand-green shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"
                                                 )}
                                          />
                                   ))}
                            </div>

                            <AnimatePresence mode="wait">
                                   <motion.div
                                          key={step}
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -20 }}
                                          transition={{ duration: 0.3 }}
                                          className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6"
                                   >
                                          <div className="space-y-2">
                                                 <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                                                        {steps[step].title}
                                                 </h2>
                                                 <p className="text-zinc-400">{steps[step].desc}</p>
                                          </div>

                                          {/* STEP 0: WELCOME */}
                                          {step === 0 && (
                                                 <div className="space-y-4">
                                                        <div className="p-4 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green text-sm flex gap-3 items-start">
                                                               <Store className="shrink-0 mt-0.5" size={18} />
                                                               <p>CourtOps te ayuda a automatizar reservas, caja y clientes. Solo necesitamos unos datos básicos para empezar.</p>
                                                        </div>
                                                 </div>
                                          )}

                                          {/* STEP 1: CLUB INFO */}
                                          {step === 1 && (
                                                 <div className="space-y-4">
                                                        <div className="space-y-2">
                                                               <label className="text-xs uppercase font-bold text-zinc-500">Nombre del Club</label>
                                                               <input
                                                                      value={formData.clubName}
                                                                      onChange={e => setFormData({ ...formData, clubName: e.target.value })}
                                                                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-brand-green focus:outline-none transition-colors"
                                                                      placeholder="Ej. Padel Club Central"
                                                                      autoFocus
                                                               />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               <div className="space-y-2">
                                                                      <label className="text-xs uppercase font-bold text-zinc-500">Apertura</label>
                                                                      <input
                                                                             type="time"
                                                                             value={formData.openTime}
                                                                             onChange={e => setFormData({ ...formData, openTime: e.target.value })}
                                                                             className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                                                      />
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-xs uppercase font-bold text-zinc-500">Cierre</label>
                                                                      <input
                                                                             type="time"
                                                                             value={formData.closeTime}
                                                                             onChange={e => setFormData({ ...formData, closeTime: e.target.value })}
                                                                             className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                                                      />
                                                               </div>
                                                        </div>
                                                 </div>
                                          )}

                                          {/* STEP 2: COURTS */}
                                          {step === 2 && (
                                                 <div className="space-y-6">
                                                        <div className="space-y-2">
                                                               <label className="text-xs uppercase font-bold text-zinc-500">Cantidad de Canchas</label>
                                                               <div className="flex gap-2">
                                                                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                                             <button
                                                                                    key={num}
                                                                                    onClick={() => setFormData({ ...formData, courtCount: num })}
                                                                                    className={cn(
                                                                                           "w-10 h-10 rounded-lg font-bold transition-all",
                                                                                           formData.courtCount === num
                                                                                                  ? "bg-brand-green text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-110"
                                                                                                  : "bg-white/5 hover:bg-white/10 text-zinc-400"
                                                                                    )}
                                                                             >
                                                                                    {num}
                                                                             </button>
                                                                      ))}
                                                               </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                               <label className="text-xs uppercase font-bold text-zinc-500">Superficie</label>
                                                               <div className="grid grid-cols-2 gap-2">
                                                                      {['Césped Sintético', 'Cemento', 'Alfombra'].map(s => (
                                                                             <button
                                                                                    key={s}
                                                                                    onClick={() => setFormData({ ...formData, courtSurface: s })}
                                                                                    className={cn(
                                                                                           "p-3 rounded-lg text-sm font-medium text-left border transition-all",
                                                                                           formData.courtSurface === s
                                                                                                  ? "bg-brand-green/10 border-brand-green text-brand-green"
                                                                                                  : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10"
                                                                                    )}
                                                                             >
                                                                                    {s}
                                                                             </button>
                                                                      ))}
                                                               </div>
                                                        </div>
                                                 </div>
                                          )}

                                          {/* STEP 3: PRICE */}
                                          {step === 3 && (
                                                 <div className="space-y-4">
                                                        <div className="space-y-2">
                                                               <label className="text-xs uppercase font-bold text-zinc-500">Precio Base (1h 30m)</label>
                                                               <div className="relative">
                                                                      <span className="absolute left-4 top-3.5 text-zinc-500">$</span>
                                                                      <input
                                                                             type="number"
                                                                             value={formData.basePrice}
                                                                             onChange={e => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
                                                                             className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-8 text-white font-mono text-lg focus:border-brand-green focus:outline-none transition-colors"
                                                                             placeholder="10000"
                                                                             autoFocus
                                                                      />
                                                               </div>
                                                               <p className="text-xs text-zinc-500">
                                                                      * Este será el precio por defecto. Luego podrás crear reglas avanzadas (días, horarios, miembros) en Configuración.
                                                               </p>
                                                        </div>
                                                 </div>
                                          )}

                                          {/* ACTIONS */}
                                          <div className="flex justify-between pt-4 border-t border-white/5">
                                                 {step > 0 ? (
                                                        <button
                                                               onClick={handleBack}
                                                               className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                                                        >
                                                               <ArrowLeft size={16} /> Volver
                                                        </button>
                                                 ) : <div />}

                                                 <button
                                                        onClick={handleNext}
                                                        disabled={isLoading}
                                                        className="bg-brand-green text-black px-6 py-2 rounded-lg font-bold hover:bg-brand-green-variant transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                                                 >
                                                        {isLoading ? (
                                                               <Loader2 className="animate-spin" size={18} />
                                                        ) : (
                                                               <>
                                                                      {step === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                                                                      <ChevronRight size={18} />
                                                               </>
                                                        )}
                                                 </button>
                                          </div>
                                   </motion.div>
                            </AnimatePresence>
                     </div>
              </div>
       )
}
