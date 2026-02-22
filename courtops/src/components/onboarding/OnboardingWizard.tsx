'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Clock, DollarSign, LayoutGrid, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { finishOnboarding } from '@/actions/onboarding'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function OnboardingWizard() {
       const router = useRouter()
       const [step, setStep] = useState(1)
       const [loading, setLoading] = useState(false)
       const [isCelebration, setIsCelebration] = useState(false)
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
                            setIsCelebration(true)
                            setTimeout(() => {
                                   toast.success("¡Bienvenido! Tu club está listo.")
                                   router.refresh()
                            }, 3000)
                     } else {
                            toast.error("Error al configurar: " + res.error)
                            setLoading(false)
                     }
              } catch (e) {
                     toast.error("Error de conexión")
                     setLoading(false)
              }
       }

       if (isCelebration) {
              return (
                     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl overflow-hidden">
                            <motion.div
                                   initial={{ scale: 0.8, opacity: 0 }}
                                   animate={{ scale: 1, opacity: 1 }}
                                   className="text-center space-y-8"
                            >
                                   <div className="relative">
                                          <motion.div
                                                 animate={{
                                                        scale: [1, 1.2, 1],
                                                        rotate: [0, 5, -5, 0]
                                                 }}
                                                 transition={{ repeat: Infinity, duration: 2 }}
                                                 className="w-32 h-32 bg-brand-green rounded-full mx-auto flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.6)]"
                                          >
                                                 <Check size={64} className="text-black" />
                                          </motion.div>
                                          {/* Sparkling particles effect placeholder */}
                                          <div className="absolute inset-0 animate-pulse">
                                                 <Sparkles className="absolute -top-4 -left-4 text-brand-green w-8 h-8" />
                                                 <Sparkles className="absolute -bottom-4 -right-4 text-brand-green w-8 h-8" />
                                          </div>
                                   </div>
                                   <div className="space-y-4">
                                          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">¡VAMOS!</h1>
                                          <p className="text-zinc-400 text-xl font-medium max-w-md mx-auto">
                                                 Estamos preparando tu tablero de control. Todo está listo para que empieces a gestionar tu club como un profesional.
                                          </p>
                                   </div>
                                   <div className="flex justify-center gap-2">
                                          <span className="w-2 h-2 bg-brand-green rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                          <span className="w-2 h-2 bg-brand-green rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                          <span className="w-2 h-2 bg-brand-green rounded-full animate-bounce"></span>
                                   </div>
                            </motion.div>
                     </div>
              )
       }

       return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
                     <div className="bg-[#09090b] border border-white/10 p-1 md:p-1.5 rounded-[40px] w-full max-w-2xl shadow-2xl relative overflow-hidden group">

                            {/* Inner Container */}
                            <div className="bg-[#09090b] border border-white/5 rounded-[36px] p-8 md:p-12 relative overflow-hidden">

                                   {/* Decorative background elements */}
                                   <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                                   {/* Progress bar */}
                                   <div className="flex gap-2 mb-12 relative z-10">
                                          {[1, 2, 3].map(i => (
                                                 <div
                                                        key={i}
                                                        className={cn(
                                                               "h-1.5 flex-1 rounded-full transition-all duration-500",
                                                               step >= i ? "bg-brand-green shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10"
                                                        )}
                                                 />
                                          ))}
                                   </div>

                                   <div className="mb-10 relative z-10">
                                          <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                                 <Sparkles size={12} /> Onboarding Fast-Track
                                          </div>
                                          <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-2 uppercase">CourtOps Premium</h2>
                                          <p className="text-zinc-500 text-lg font-medium">Configura tu imperio deportivo en segundos.</p>
                                   </div>

                                   <AnimatePresence mode="wait">
                                          {step === 1 && (
                                                 <motion.div
                                                        key="step1"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        className="space-y-8 relative z-10"
                                                 >
                                                        <div className="space-y-4">
                                                               <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                                      <LayoutGrid size={16} className="text-brand-green" />
                                                                      Capacidad Instalada
                                                               </label>
                                                               <div className="grid grid-cols-4 gap-4">
                                                                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                                             <button
                                                                                    key={num}
                                                                                    onClick={() => setData({ ...data, courtCount: num })}
                                                                                    className={cn(
                                                                                           "aspect-square rounded-2xl border-2 font-black text-2xl transition-all flex items-center justify-center",
                                                                                           data.courtCount === num
                                                                                                  ? 'bg-brand-green text-black border-brand-green shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                                                                                                  : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/20 hover:text-white'
                                                                                    )}
                                                                             >
                                                                                    {num}
                                                                             </button>
                                                                      ))}
                                                               </div>
                                                               <p className="text-xs text-zinc-500 text-center mt-4">¿Tienes más? Podrás agregarlas después en Configuración.</p>
                                                        </div>

                                                        <button
                                                               onClick={() => setStep(2)}
                                                               className="w-full bg-brand-green hover:bg-[#149a6a] active:scale-[0.98] transition-all text-black h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-lg shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                                                        >
                                                               CONTINUAR <ArrowRight size={22} />
                                                        </button>
                                                 </motion.div>
                                          )}

                                          {step === 2 && (
                                                 <motion.div
                                                        key="step2"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        className="space-y-8 relative z-10"
                                                 >
                                                        <div className="space-y-6">
                                                               <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                                      <Clock size={16} className="text-brand-green" />
                                                                      Disponibilidad Horaria
                                                               </label>
                                                               <div className="grid grid-cols-2 gap-6">
                                                                      <div className="space-y-3">
                                                                             <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Apertura</span>
                                                                             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 focus-within:border-brand-green/50 transition-colors">
                                                                                    <Clock size={18} className="text-zinc-600" />
                                                                                    <input
                                                                                           type="time"
                                                                                           value={data.openTime}
                                                                                           onChange={e => setData({ ...data, openTime: e.target.value })}
                                                                                           className="bg-transparent text-white outline-none w-full font-bold text-lg"
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                                      <div className="space-y-3">
                                                                             <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Cierre</span>
                                                                             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 focus-within:border-brand-green/50 transition-colors">
                                                                                    <Clock size={18} className="text-zinc-600" />
                                                                                    <input
                                                                                           type="time"
                                                                                           value={data.closeTime}
                                                                                           onChange={e => setData({ ...data, closeTime: e.target.value })}
                                                                                           className="bg-transparent text-white outline-none w-full font-bold text-lg"
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        <div className="flex gap-4">
                                                               <button onClick={() => setStep(1)} className="w-1/3 border border-white/10 hover:bg-white/5 text-white h-16 rounded-2xl font-black transition-all">
                                                                      Atrás
                                                               </button>
                                                               <button onClick={() => setStep(3)} className="w-2/3 bg-brand-green hover:bg-[#149a6a] transition-all text-black h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-lg">
                                                                      CONTINUAR <ArrowRight size={22} />
                                                               </button>
                                                        </div>
                                                 </motion.div>
                                          )}

                                          {step === 3 && (
                                                 <motion.div
                                                        key="step3"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        className="space-y-8 relative z-10"
                                                 >
                                                        <div className="space-y-6">
                                                               <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                                      <DollarSign size={16} className="text-brand-green" />
                                                                      Estrategia de Precios
                                                               </label>
                                                               <div className="bg-white/5 border-2 border-brand-green/30 rounded-[32px] p-8 relative overflow-hidden group/price">
                                                                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/price:opacity-20 transition-opacity">
                                                                             <DollarSign size={80} className="text-brand-green" />
                                                                      </div>
                                                                      <span className="text-xs font-bold text-brand-green uppercase tracking-[0.3em] block mb-2">Precio Base x Hora</span>
                                                                      <div className="flex items-center">
                                                                             <span className="text-4xl font-light text-zinc-600 mr-2">$</span>
                                                                             <input
                                                                                    type="number"
                                                                                    value={data.price}
                                                                                    onChange={e => setData({ ...data, price: Number(e.target.value) })}
                                                                                    className="bg-transparent text-5xl font-black text-white w-full outline-none placeholder:text-zinc-800"
                                                                                    placeholder="0"
                                                                             />
                                                                      </div>
                                                               </div>
                                                               <p className="text-sm text-zinc-500 leading-relaxed pl-2 italic">
                                                                      CourtOps aplicará este precio por defecto a todos tus horarios. Podrás personalizarlo para "Horas Pico" en el panel de administración.
                                                               </p>
                                                        </div>

                                                        <div className="flex gap-4">
                                                               <button onClick={() => setStep(2)} className="w-1/3 border border-white/10 hover:bg-white/5 text-white h-16 rounded-2xl font-black transition-all">
                                                                      Atrás
                                                               </button>
                                                               <button
                                                                      onClick={handleFinish}
                                                                      disabled={loading}
                                                                      className="w-2/3 bg-brand-green hover:bg-[#149a6a] transition-all text-black h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-lg disabled:opacity-50"
                                                               >
                                                                      {loading ? <Loader2 className="animate-spin" /> : <>COMPLETAR <Check size={22} /></>}
                                                               </button>
                                                        </div>
                                                 </motion.div>
                                          )}
                                   </AnimatePresence>
                            </div>
                     </div>
              </div>
       )
}
