'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Loader2, Store, User, Mail, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, Zap, Globe } from 'lucide-react'
import Link from 'next/link'
import { registerClub } from '@/actions/auth/register'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
       const router = useRouter()
       const [step, setStep] = useState<'PLANS' | 'FORM'>('PLANS')
       const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
       const [loading, setLoading] = useState(false)
       const [showPassword, setShowPassword] = useState(false)

       // Form State
       const [formData, setFormData] = useState({
              clubName: '',
              userName: '',
              email: '',
              password: ''
       })

       const PLANS = [
              {
                     id: 'Arranque',
                     name: 'Arranque',
                     price: '$45.000',
                     period: '/mes',
                     description: 'Para clubes que dan el primer salto digital.',
                     features: ['Hasta 2 Canchas', 'Turnero Digital Pro', 'Caja Básica'],
                     popular: false
              },
              {
                     id: 'Élite',
                     name: 'Élite',
                     price: '$85.000',
                     period: '/mes',
                     description: 'Automatización total para clubes en crecimiento.',
                     features: ['Hasta 8 Canchas', 'POS / Kiosco Full', 'Gestión de Torneos', 'Analítica Avanzada'],
                     popular: true
              },
              {
                     id: 'VIP',
                     name: 'VIP',
                     price: '$150.000',
                     period: '/mes',
                     description: 'Potencia sin límites para complejos grandes.',
                     features: ['Canchas Ilimitadas', 'Multi-Sede Central', 'API / Webhooks', 'Ejecutivo Dedicado'],
                     popular: false
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
                     toast.success('¡Cuenta creada con éxito!')
                     router.push('/login?registered=true')
              } else {
                     toast.error(res.error || 'Error al registrarse')
              }
       }

       return (
              <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white font-sans flex flex-col transition-colors duration-700">

                     {/* HEADER */}
                     <header className="py-6 px-6 md:px-12 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                            <Link href="/" className="flex items-center group transition-opacity hover:opacity-80">
                                   <img src="/logo.png" alt="CourtOps Logo" className="h-9 w-auto object-contain" />
                            </Link>
                            <div className="flex items-center gap-6">
                                   <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 hidden sm:block">
                                          ¿Ya eres cliente? <Link href="/login" className="text-slate-900 dark:text-white hover:text-emerald-500 transition-colors ml-2 font-black">LOGIN</Link>
                                   </div>
                                   <ThemeToggle />
                            </div>
                     </header>

                     <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-24 relative overflow-hidden">
                            {/* Subtle Pro Grid and Glow */}
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

                            <AnimatePresence mode="wait">
                                   {step === 'PLANS' ? (
                                          <motion.div
                                                 key="plans"
                                                 initial={{ opacity: 0, y: 20 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 exit={{ opacity: 0, scale: 0.95 }}
                                                 className="max-w-6xl w-full mx-auto relative z-10"
                                          >
                                                 <div className="text-center mb-20 space-y-4">
                                                        <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-slate-900 dark:text-white leading-none">
                                                               Elige tu <span className="text-slate-400 dark:text-zinc-600">Plan.</span>
                                                        </h2>
                                                        <p className="text-slate-500 dark:text-zinc-500 text-lg max-w-xl mx-auto">
                                                               Escala a medida que tu complejo crece. Sin compromisos a largo plazo.
                                                        </p>
                                                 </div>

                                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        {PLANS.map((plan, i) => (
                                                               <motion.div
                                                                      key={plan.id}
                                                                      initial={{ opacity: 0, y: 30 }}
                                                                      animate={{ opacity: 1, y: 0 }}
                                                                      transition={{ delay: i * 0.1 }}
                                                                      className={cn(
                                                                             "relative p-8 rounded-3xl border transition-all duration-500 flex flex-col bg-white dark:bg-[#0a0a0a] shadow-sm",
                                                                             plan.popular ? "border-emerald-500 ring-4 ring-emerald-500/5 dark:ring-emerald-500/10 scale-105 z-10" : "border-slate-100 dark:border-white/5"
                                                                      )}
                                                               >
                                                                      {plan.popular && (
                                                                             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-bold text-[9px] px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                                                                    POPULAR
                                                                             </div>
                                                                      )}

                                                                      <div className="mb-8">
                                                                             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{plan.name}</h3>
                                                                             <div className="flex items-baseline gap-1">
                                                                                    <span className="text-4xl font-bold dark:text-white text-slate-900">{plan.price}</span>
                                                                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">{plan.period}</span>
                                                                             </div>
                                                                      </div>

                                                                      <p className="text-slate-500 dark:text-zinc-500 text-sm mb-8 leading-relaxed h-12">{plan.description}</p>

                                                                      <button
                                                                             onClick={() => handlePlanSelect(plan.id)}
                                                                             className={cn(
                                                                                    "w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest mb-10 transition-all active:scale-95",
                                                                                    plan.popular ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" : "bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                                                                             )}
                                                                      >
                                                                             Seleccionar
                                                                      </button>

                                                                      <div className="space-y-4">
                                                                             {plan.features.map((feat, i) => (
                                                                                    <div key={i} className="flex items-center gap-3 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                                                                                           <Check size={14} className="text-emerald-500" />
                                                                                           {feat}
                                                                                    </div>
                                                                             ))}
                                                                      </div>
                                                               </motion.div>
                                                        ))}
                                                 </div>
                                          </motion.div>
                                   ) : (
                                          <motion.div
                                                 key="form"
                                                 initial={{ opacity: 0, x: 20 }}
                                                 animate={{ opacity: 1, x: 0 }}
                                                 exit={{ opacity: 0, x: -20 }}
                                                 className="w-full max-w-sm relative z-10"
                                          >
                                                 <div className="mb-12 flex flex-col items-center">
                                                        <button
                                                               onClick={() => setStep('PLANS')}
                                                               className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
                                                        >
                                                               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a los planes
                                                        </button>
                                                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Confirma tu Club</h2>
                                                        <div className="mt-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                               <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Plan: {selectedPlan}</span>
                                                        </div>
                                                 </div>

                                                 <form onSubmit={handleRegister} className="space-y-6">
                                                        <div className="space-y-2">
                                                               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Club</label>
                                                               <div className="relative group">
                                                                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                                      <input
                                                                             type="text"
                                                                             required
                                                                             className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                                                             placeholder="Ej: Arena Padel"
                                                                             value={formData.clubName}
                                                                             onChange={e => setFormData({ ...formData, clubName: e.target.value })}
                                                                      />
                                                               </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tu Nombre</label>
                                                               <div className="relative group">
                                                                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                                      <input
                                                                             type="text"
                                                                             required
                                                                             className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                                                             placeholder="Franco Rossi"
                                                                             value={formData.userName}
                                                                             onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                                                      />
                                                               </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Corporativo</label>
                                                               <div className="relative group">
                                                                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                                      <input
                                                                             type="email"
                                                                             required
                                                                             className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                                                             placeholder="admin@tuclub.com"
                                                                             value={formData.email}
                                                                             onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                      />
                                                               </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                                                               <div className="relative group">
                                                                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                                      <input
                                                                             type={showPassword ? "text" : "password"}
                                                                             required
                                                                             className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-12 text-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                                                             placeholder="••••••••"
                                                                             value={formData.password}
                                                                             onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                                      />
                                                                      <button
                                                                             type="button"
                                                                             onClick={() => setShowPassword(!showPassword)}
                                                                             className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                                      >
                                                                             {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                      </button>
                                                               </div>
                                                        </div>

                                                        <button
                                                               type="submit"
                                                               disabled={loading}
                                                               className={cn(
                                                                      "w-full py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm",
                                                                      loading
                                                                             ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed"
                                                                             : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-[0.98] mt-4 shadow-xl"
                                                               )}
                                                        >
                                                               {loading ? (
                                                                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                                               ) : (
                                                                      <>Finalizar Registro <ArrowRight size={16} /></>
                                                               )}
                                                        </button>
                                                 </form>
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </main>

                     {/* FOOTER */}
                     <footer className="py-12 px-6 border-t border-slate-100 dark:border-white/5 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">CourtOps Engineering • {new Date().getFullYear()}</p>
                     </footer>
              </div>
       )
}
