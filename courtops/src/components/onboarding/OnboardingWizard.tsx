'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Clock, DollarSign, LayoutGrid, Loader2 } from 'lucide-react'
import { finishOnboarding } from '@/actions/onboarding'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function OnboardingWizard() {
       const router = useRouter()
       const [step, setStep] = useState(1)
       const [loading, setLoading] = useState(false)
       const [data, setData] = useState({
              courtCount: 2,
              openTime: '08:00',
              closeTime: '23:00',
              price: 15000
       })

       // Handlers
       const handleFinish = async () => {
              setLoading(true)
              try {
                     const res = await finishOnboarding(data)
                     if (res.success) {
                            toast.success("¡Bienvenido! Tu club está listo.")
                            router.refresh()
                     } else {
                            toast.error("Error al configurar: " + res.error)
                            setLoading(false)
                     }
              } catch (e) {
                     toast.error("Error de conexión")
                     setLoading(false)
              }
       }

       return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                     <div className="bg-[#09090b] border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
                                   <div className="h-full bg-brand-green transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
                            </div>

                            <div className="mb-8 text-center">
                                   <h2 className="text-2xl font-black text-white mb-2">¡Bienvenido a CourtOps! 🚀</h2>
                                   <p className="text-zinc-400">Configuremos tu club en menos de 1 minuto.</p>
                            </div>

                            <AnimatePresence mode="wait">
                                   {step === 1 && (
                                          <motion.div
                                                 key="step1"
                                                 initial={{ opacity: 0, x: 20 }}
                                                 animate={{ opacity: 1, x: 0 }}
                                                 exit={{ opacity: 0, x: -20 }}
                                                 className="space-y-6"
                                          >
                                                 <div className="space-y-3">
                                                        <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                                               <LayoutGrid size={16} className="text-brand-green" />
                                                               ¿Cuántas canchas tienes?
                                                        </label>
                                                        <div className="grid grid-cols-4 gap-3">
                                                               {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                                      <button
                                                                             key={num}
                                                                             onClick={() => setData({ ...data, courtCount: num })}
                                                                             className={`py-3 rounded-xl border font-bold text-lg transition-all ${data.courtCount === num
                                                                                           ? 'bg-brand-green text-black border-brand-green'
                                                                                           : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                                                                                    }`}
                                                                      >
                                                                             {num}
                                                                      </button>
                                                               ))}
                                                        </div>
                                                 </div>

                                                 <button onClick={() => setStep(2)} className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
                                                        Siguiente <ArrowRight size={18} />
                                                 </button>
                                          </motion.div>
                                   )}

                                   {step === 2 && (
                                          <motion.div
                                                 key="step2"
                                                 initial={{ opacity: 0, x: 20 }}
                                                 animate={{ opacity: 1, x: 0 }}
                                                 exit={{ opacity: 0, x: -20 }}
                                                 className="space-y-6"
                                          >
                                                 <div className="space-y-3">
                                                        <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                                               <Clock size={16} className="text-brand-green" />
                                                               Horarios de Atención
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               <div>
                                                                      <span className="text-xs text-zinc-500 mb-1 block">Apertura</span>
                                                                      <input
                                                                             type="time"
                                                                             value={data.openTime}
                                                                             onChange={e => setData({ ...data, openTime: e.target.value })}
                                                                             className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-brand-green"
                                                                      />
                                                               </div>
                                                               <div>
                                                                      <span className="text-xs text-zinc-500 mb-1 block">Cierre</span>
                                                                      <input
                                                                             type="time"
                                                                             value={data.closeTime}
                                                                             onChange={e => setData({ ...data, closeTime: e.target.value })}
                                                                             className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-brand-green"
                                                                      />
                                                               </div>
                                                        </div>
                                                 </div>

                                                 <div className="flex gap-3">
                                                        <button onClick={() => setStep(1)} className="w-1/3 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold">
                                                               Atrás
                                                        </button>
                                                        <button onClick={() => setStep(3)} className="w-2/3 btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
                                                               Siguiente <ArrowRight size={18} />
                                                        </button>
                                                 </div>
                                          </motion.div>
                                   )}

                                   {step === 3 && (
                                          <motion.div
                                                 key="step3"
                                                 initial={{ opacity: 0, x: 20 }}
                                                 animate={{ opacity: 1, x: 0 }}
                                                 exit={{ opacity: 0, x: -20 }}
                                                 className="space-y-6"
                                          >
                                                 <div className="space-y-3">
                                                        <label className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                                               <DollarSign size={16} className="text-brand-green" />
                                                               Precio Base (Hora)
                                                        </label>
                                                        <div className="relative">
                                                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                                                               <input
                                                                      type="number"
                                                                      value={data.price}
                                                                      onChange={e => setData({ ...data, price: Number(e.target.value) })}
                                                                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-8 text-white outline-none focus:border-brand-green font-mono text-lg"
                                                                      placeholder="15000"
                                                               />
                                                        </div>
                                                        <p className="text-xs text-zinc-500">
                                                               Podrás configurar precios diferenciados por horario más adelante.
                                                        </p>
                                                 </div>

                                                 <div className="flex gap-3">
                                                        <button onClick={() => setStep(2)} className="w-1/3 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold">
                                                               Atrás
                                                        </button>
                                                        <button
                                                               onClick={handleFinish}
                                                               disabled={loading}
                                                               className="w-2/3 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                                        >
                                                               {loading ? <Loader2 className="animate-spin" /> : <>Finalizar <Check size={18} /></>}
                                                        </button>
                                                 </div>
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </div>
              </div>
       )
}
