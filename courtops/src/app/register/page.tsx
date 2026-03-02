'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Loader2, Store, User, Mail, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, Zap, Star } from 'lucide-react'
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

       // --- PLANS DATA ---
       const PLANS = [
              {
                     id: 'Arranque',
                     name: 'Arranque',
                     price: '$45.000',
                     period: '/mes',
                     description: 'Ideal para clubes pequeños que recién comienzan su digitalización.',
                     features: [
                            'Hasta 2 Canchas',
                            'Turnero Digital Inteligente',
                            'Caja Básica',
                            'Soporte por Email L-V'
                     ],
                     color: 'bg-blue-500',
                     popular: false
              },
              {
                     id: 'Élite',
                     name: 'Élite',
                     price: '$85.000',
                     period: '/mes',
                     description: 'Perfecto para clubes en expansión que buscan automatización total.',
                     features: [
                            'Hasta 8 Canchas',
                            'Kiosco / POS Integrado',
                            'Gestión de Torneos Pro',
                            'Control de Stock Avanzado',
                            'Reportes Financieros',
                            'Soporte Prioritario 24/7'
                     ],
                     color: 'bg-emerald-500',
                     popular: true
              },
              {
                     id: 'VIP',
                     name: 'VIP',
                     price: '$150.000',
                     period: '/mes',
                     description: 'Potencia absoluta y escalabilidad sin límites para complejos grandes.',
                     features: [
                            'Canchas Ilimitadas',
                            'Multi-Sede Centralizada',
                            'Acceso a API y Webhooks',
                            'Roles Personalizados',
                            'Gestión de Clientes Web',
                            'Ejecutivo Dedicado'
                     ],
                     color: 'bg-violet-500',
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
                     toast.success('¡Cuenta creada con éxito! Bienvenido a CourtOps.')
                     router.push('/login?registered=true')
              } else {
                     toast.error(res.error || 'Error al registrarse')
              }
       }

       return (
              <div className="min-h-screen bg-[#02040A] text-foreground font-sans flex flex-col selection:bg-emerald-500/30">
                     {/* Ambient background effect */}
                     <div className="fixed inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]" />
                     </div>

                     {/* HEADER */}
                     <header className="py-6 px-4 md:px-8 border-b border-white/[0.05] flex justify-between items-center bg-black/40 backdrop-blur-xl sticky top-0 z-50">
                            <div className="flex items-center gap-4">
                                   <Link href="/" className="group flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                                 <Zap size={18} className="text-emerald-500" fill="currentColor" />
                                          </div>
                                          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                                                 COURT<span className="text-emerald-500">OPS</span>
                                          </h1>
                                   </Link>
                            </div>
                            <div className="flex items-center gap-6">
                                   <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">
                                          ¿Ya eres cliente? <Link href="/login" className="text-white hover:text-emerald-500 transition-colors ml-2">Iniciar Sesión</Link>
                                   </div>
                                   <ThemeToggle />
                            </div>
                     </header>

                     <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 relative z-10">
                            <AnimatePresence mode="wait">
                                   {step === 'PLANS' ? (
                                          <motion.div
                                                 key="plans"
                                                 initial={{ opacity: 0, y: 20 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 exit={{ opacity: 0, scale: 0.95 }}
                                                 className="max-w-6xl w-full mx-auto"
                                          >
                                                 <div className="text-center mb-16 space-y-4">
                                                        <motion.div
                                                               initial={{ opacity: 0, scale: 0.9 }}
                                                               animate={{ opacity: 1, scale: 1 }}
                                                               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]"
                                                        >
                                                               <Check size={10} /> Prueba de 7 días gratis
                                                        </motion.div>
                                                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">
                                                               Escala tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">imperio.</span>
                                                        </h2>
                                                        <p className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto">
                                                               Selecciona el plan que se adapte al tamaño actual de tu complejo. Puedes cambiarlo en cualquier momento.
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
                                                                             "relative p-8 rounded-[32px] border transition-all duration-500 group flex flex-col",
                                                                             plan.popular
                                                                                    ? 'bg-white/[0.03] border-emerald-500/50 shadow-[0_0_80px_rgba(16,185,129,0.1)] scale-105 z-10'
                                                                                    : 'bg-white/[0.01] border-white/[0.05] hover:border-white/20'
                                                                      )}
                                                               >
                                                                      {plan.popular && (
                                                                             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-xl">
                                                                                    Recomendado
                                                                             </div>
                                                                      )}

                                                                      <div className="mb-8">
                                                                             <h3 className={cn("text-xs font-black uppercase tracking-[0.3em] mb-4", plan.popular ? 'text-emerald-500' : 'text-zinc-500')}>{plan.name}</h3>
                                                                             <div className="flex items-baseline gap-2">
                                                                                    <span className="text-4xl font-black text-white">{plan.price}</span>
                                                                                    <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">{plan.period}</span>
                                                                             </div>
                                                                      </div>

                                                                      <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed h-[40px]">{plan.description}</p>

                                                                      <button
                                                                             onClick={() => handlePlanSelect(plan.id)}
                                                                             className={cn(
                                                                                    "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] mb-10 transition-all active:scale-95 shadow-xl",
                                                                                    plan.popular
                                                                                           ? 'bg-white text-black hover:bg-zinc-200'
                                                                                           : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'
                                                                             )}
                                                                      >
                                                                             Empezar Ahora
                                                                      </button>

                                                                      <div className="space-y-4">
                                                                             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Características</p>
                                                                             {plan.features.map((feat, i) => (
                                                                                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                                                                                           <div className={cn("w-1.5 h-1.5 rounded-full", plan.popular ? 'bg-emerald-500' : 'bg-zinc-700')} />
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
                                                 className="w-full max-w-xl"
                                          >
                                                 <div className="mb-10 flex flex-col items-center text-center">
                                                        <button
                                                               onClick={() => setStep('PLANS')}
                                                               className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors mb-6"
                                                        >
                                                               <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver a los planes
                                                        </button>
                                                        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">Finaliza tu registro</h2>
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                                               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Configurando Plan: {selectedPlan}</span>
                                                        </div>
                                                 </div>

                                                 <form onSubmit={handleRegister} className="bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[40px] shadow-2xl backdrop-blur-3xl space-y-8 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                                               <ShieldCheck size={120} className="text-emerald-500" />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                               <div className="space-y-2">
                                                                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Nombre del Club</label>
                                                                      <div className="relative group">
                                                                             <Store className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                                             <input
                                                                                    type="text"
                                                                                    required
                                                                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white font-bold tracking-tight placeholder:text-zinc-800"
                                                                                    placeholder="Ej: Arena Padel"
                                                                                    value={formData.clubName}
                                                                                    onChange={e => setFormData({ ...formData, clubName: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>

                                                               <div className="space-y-2">
                                                                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Tu Nombre</label>
                                                                      <div className="relative group">
                                                                             <User className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                                             <input
                                                                                    type="text"
                                                                                    required
                                                                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white font-bold tracking-tight placeholder:text-zinc-800"
                                                                                    placeholder="Ej: Franco Rossi"
                                                                                    value={formData.userName}
                                                                                    onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Email Corporativo</label>
                                                               <div className="relative group">
                                                                      <Mail className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                                      <input
                                                                             type="email"
                                                                             required
                                                                             className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white font-bold tracking-tight placeholder:text-zinc-800"
                                                                             placeholder="admin@tuclub.com"
                                                                             value={formData.email}
                                                                             onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                      />
                                                               </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Contraseña Maestra</label>
                                                               <div className="relative group">
                                                                      <Lock className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                                      <input
                                                                             type={showPassword ? "text" : "password"}
                                                                             required
                                                                             className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-white font-bold tracking-tight placeholder:text-zinc-800"
                                                                             placeholder="••••••••"
                                                                             value={formData.password}
                                                                             onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                                      />
                                                                      <button
                                                                             type="button"
                                                                             onClick={() => setShowPassword(!showPassword)}
                                                                             className="absolute right-4 top-4 text-zinc-600 hover:text-white transition-colors"
                                                                      >
                                                                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                      </button>
                                                               </div>
                                                               <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-2 ml-1 flex items-center gap-1">
                                                                      <ShieldCheck size={10} className="text-emerald-500" /> Cifrada con Standard Bancario AES-256
                                                               </p>
                                                        </div>

                                                        <button
                                                               type="submit"
                                                               disabled={loading}
                                                               className="w-full relative overflow-hidden group/btn py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 active:scale-[0.98] disabled:opacity-50 mt-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
                                                        >
                                                               <span className="relative z-10 flex items-center justify-center gap-3">
                                                                      {loading ? <Loader2 className="animate-spin" /> : <>Finalizar y Entrar <ArrowRight size={18} /></>}
                                                               </span>
                                                               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-0 group-hover/btn:opacity-100 translate-x-[-100%] group-hover/btn:translate-x-0 transition-all duration-700 pointer-events-none" />
                                                        </button>

                                                        <p className="text-[9px] text-center text-zinc-500 font-bold uppercase tracking-widest">
                                                               Al continuar, aceptas los <Link href="/legal/terms" className="text-zinc-400 hover:text-white transition-colors">Términos del Servicio</Link>
                                                        </p>
                                                 </form>
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </main>

                     {/* FOOTER */}
                     <footer className="py-12 px-4 text-center opacity-30">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">CourtOps Engineering &bull; 2026</p>
                     </footer>
              </div>
       )
}
