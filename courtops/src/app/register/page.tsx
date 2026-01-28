'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Loader2, Store, User, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { registerClub } from '@/actions/auth/register'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RegisterPage() {
       const router = useRouter()
       const [step, setStep] = useState<'PLANS' | 'FORM'>('PLANS')
       const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
       const [loading, setLoading] = useState(false)

       // Form State
       const [formData, setFormData] = useState({
              clubName: '',
              userName: '',
              email: '',
              password: ''
       })

       // --- PLANS DATA ---
       const PLANS = [
              {
                     id: 'OFFICIAL',
                     name: 'Plan Oficial',
                     price: '$40.000',
                     period: '/mes',
                     description: 'La solución definitiva para tu club. Todo incluido en un solo lugar.',
                     features: [
                            'Inscripción Única: $200.000',
                            'Canchas Ilimitadas',
                            'Gestión de Torneos',
                            'Kiosco & Inventario',
                            'Reportes Financieros',
                            'Soporte Prioritario 24/7',
                            'Backup Diario'
                     ],
                     color: 'bg-emerald-500',
                     popular: true
              }
       ]

       const handlePlanSelect = (planId: string) => {
              setSelectedPlan(planId)
              setStep('FORM')
       }

       const handleRegister = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!selectedPlan) return
              setLoading(true)

              const data = new FormData()
              data.append('clubName', formData.clubName)
              data.append('userName', formData.userName)
              data.append('email', formData.email)
              data.append('password', formData.password)
              data.append('plan', selectedPlan)

              const res = await registerClub(data)
              setLoading(false)

              if (res.success) {
                     toast.success('¡Cuenta creada con éxito! Inicia sesión para comenzar.')
                     router.push('/login?registered=true')
              } else {
                     toast.error(res.error || 'Error al registrarse')
              }
       }

       return (
              <div className="min-h-screen bg-[#09090b] text-white font-sans flex flex-col">
                     {/* HEADER */}
                     <header className="py-6 px-4 md:px-8 border-b border-white/5 flex justify-between items-center bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
                            <h1 className="text-2xl font-black tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
                                   COURT<span className="text-emerald-500">OPS</span>
                            </h1>
                            <div className="text-sm font-medium text-zinc-400">
                                   ¿Ya tienes cuenta? <Link href="/login" className="text-white hover:text-emerald-400 transition-colors ml-1">Iniciar Sesión</Link>
                            </div>
                     </header>

                     <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
                            {/* Ambient Lights */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

                            <AnimatePresence mode="wait">
                                   {step === 'PLANS' ? (
                                          <motion.div
                                                 key="plans"
                                                 initial={{ opacity: 0, y: 20 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 exit={{ opacity: 0, x: -50 }}
                                                 className="max-w-6xl w-full mx-auto"
                                          >
                                                 <div className="text-center mb-12 space-y-4">
                                                        <span className="text-emerald-500 font-bold tracking-widest text-xs uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                                               Prueba Gratis por 7 Días
                                                        </span>
                                                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Elige el plan perfecto para tu club</h2>
                                                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                                                               Sin compromisos. Cancela cuando quieras. Todos los planes incluyen actualizaciones de por vida.
                                                        </p>
                                                 </div>

                                                 <div className="flex flex-wrap justify-center gap-8">
                                                        {PLANS.map((plan) => (
                                                               <div
                                                                      key={plan.id}
                                                                      className={`relative w-full max-w-md p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 group
                      ${plan.popular ? 'bg-zinc-900/80 border-emerald-500/50 shadow-2xl shadow-emerald-500/10' : 'bg-black/40 border-white/10 hover:border-white/20'}
                    `}
                                                               >
                                                                      {plan.popular && (
                                                                             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wide">
                                                                                    Más Popular
                                                                             </div>
                                                                      )}

                                                                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                                                      <div className="flex items-baseline gap-1 mb-4">
                                                                             <span className="text-4xl font-black">{plan.price}</span>
                                                                             <span className="text-zinc-500">{plan.period}</span>
                                                                      </div>
                                                                      <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>

                                                                      <button
                                                                             onClick={() => handlePlanSelect(plan.id)}
                                                                             className={`w-full py-3 rounded-xl font-bold mb-8 transition-all active:scale-95
                        ${plan.popular ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-white/10 hover:bg-white/20 text-white'}
                      `}
                                                                      >
                                                                             Comenzar Prueba Gratis
                                                                      </button>

                                                                      <div className="space-y-3">
                                                                             {plan.features.map((feat, i) => (
                                                                                    <div key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                                                                           <Check size={16} className={`mt-0.5 shrink-0 ${plan.popular ? 'text-emerald-500' : 'text-zinc-500'}`} />
                                                                                           {feat}
                                                                                    </div>
                                                                             ))}
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </motion.div>
                                   ) : (
                                          <motion.div
                                                 key="form"
                                                 initial={{ opacity: 0, x: 50 }}
                                                 animate={{ opacity: 1, x: 0 }}
                                                 exit={{ opacity: 0, x: 50 }}
                                                 className="w-full max-w-md"
                                          >
                                                 <div className="mb-8">
                                                        <button
                                                               onClick={() => setStep('PLANS')}
                                                               className="text-sm text-zinc-500 hover:text-white mb-4 flex items-center gap-1 transition-colors"
                                                        >
                                                               ← Volver a planes
                                                        </button>
                                                        <h2 className="text-3xl font-bold">Crea tu cuenta</h2>
                                                        <p className="text-zinc-400">Configura tu club en segundos.</p>
                                                 </div>

                                                 <form onSubmit={handleRegister} className="space-y-4 bg-zinc-900/50 p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm">

                                                        <div className="space-y-4">
                                                               <div className="space-y-1">
                                                                      <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nombre del Club</label>
                                                                      <div className="relative">
                                                                             <Store className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                                                                             <input
                                                                                    type="text"
                                                                                    required
                                                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
                                                                                    placeholder="Ej: Padel Center"
                                                                                    value={formData.clubName}
                                                                                    onChange={e => setFormData({ ...formData, clubName: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>

                                                               <div className="space-y-1">
                                                                      <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Tu Nombre</label>
                                                                      <div className="relative">
                                                                             <User className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                                                                             <input
                                                                                    type="text"
                                                                                    required
                                                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
                                                                                    placeholder="Ej: Juan Pérez"
                                                                                    value={formData.userName}
                                                                                    onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>

                                                               <div className="space-y-1">
                                                                      <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email</label>
                                                                      <div className="relative">
                                                                             <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                                                                             <input
                                                                                    type="email"
                                                                                    required
                                                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
                                                                                    placeholder="juan@ejemplo.com"
                                                                                    value={formData.email}
                                                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>

                                                               <div className="space-y-1">
                                                                      <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Contraseña</label>
                                                                      <div className="relative">
                                                                             <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                                                                             <input
                                                                                    type="password"
                                                                                    required
                                                                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600"
                                                                                    placeholder="••••••••"
                                                                                    value={formData.password}
                                                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        <button
                                                               type="submit"
                                                               disabled={loading}
                                                               className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl mt-6 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                                        >
                                                               {loading ? <Loader2 className="animate-spin" /> : <>Crear Cuenta <ArrowRight size={20} /></>}
                                                        </button>

                                                        <p className="text-xs text-center text-zinc-500 mt-4">
                                                               Al registrarte, aceptas nuestros términos y condiciones.
                                                        </p>
                                                 </form>
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </main>
              </div>
       )
}
