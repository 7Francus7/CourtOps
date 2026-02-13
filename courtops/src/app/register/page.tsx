'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Loader2, Store, User, Mail, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { registerClub } from '@/actions/auth/register'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ThemeToggle'

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
                     id: 'INITIAL',
                     name: 'Plan Inicial',
                     price: '$35.000',
                     period: '/mes',
                     description: 'Todo lo necesario para organizar tu club.',
                     features: [
                            'Inscripción Única: $200.000',
                            'Gestión de Reservas y Señas',
                            'Control de Caja Simple',
                            'Base de Datos de Clientes',
                            'Soporte Estándar'
                     ],
                     color: 'bg-blue-500',
                     popular: false
              },
              {
                     id: 'PROFESSIONAL',
                     name: 'Plan Profesional',
                     price: '$50.000',
                     period: '/mes',
                     description: 'Potencia tu club con herramientas avanzadas.',
                     features: [
                            'Inscripción Única: $300.000',
                            'Todo lo del Plan Inicial',
                            'Gestión de Torneos y Ligas',
                            'Kiosco, Stock e Inventario',
                            'Reportes Financieros Avanzados',
                            'Soporte Prioritario 24/7'
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
              <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
                     {/* HEADER */}
                     <header className="py-6 px-4 md:px-8 border-b border-border flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-50">
                            <div className="flex items-center gap-4">
                                   <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Volver al inicio">
                                          <ArrowLeft size={20} />
                                   </Link>
                                   <h1 className="text-2xl font-black tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
                                          COURT<span className="text-emerald-500">OPS</span>
                                   </h1>
                            </div>
                            <div className="flex items-center gap-6">
                                   <div className="text-sm font-medium text-muted-foreground hidden sm:block">
                                          ¿Ya tienes cuenta? <Link href="/login" className="text-foreground hover:text-emerald-500 transition-colors ml-1 font-bold">Iniciar Sesión</Link>
                                   </div>
                                   <ThemeToggle />
                            </div>
                     </header>

                     <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
                            {/* Ambient Lights */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none opacity-50 dark:opacity-100" />

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
                                                        <span className="text-emerald-600 dark:text-emerald-500 font-bold tracking-widest text-xs uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                                               Prueba Gratis por 7 Días
                                                        </span>
                                                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Elige el plan perfecto para tu club</h2>
                                                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                                               Sin compromisos. Cancela cuando quieras. Todos los planes incluyen actualizaciones de por vida.
                                                        </p>
                                                 </div>

                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                                        {PLANS.map((plan) => (
                                                               <div
                                                                      key={plan.id}
                                                                      className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 group
                                                                             ${plan.popular
                                                                                    ? 'bg-card border-emerald-500/50 shadow-2xl shadow-emerald-500/10'
                                                                                    : 'bg-card/40 border-border hover:border-border/80'
                                                                             }
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
                                                                             <span className="text-muted-foreground">{plan.period}</span>
                                                                      </div>
                                                                      <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">{plan.description}</p>

                                                                      <button
                                                                             onClick={() => handlePlanSelect(plan.id)}
                                                                             className={`w-full py-3 rounded-xl font-bold mb-8 transition-all active:scale-95
                                                                                    ${plan.popular ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-muted hover:bg-muted/80 text-foreground'}
                                                                             `}
                                                                      >
                                                                             Comenzar Prueba Gratis
                                                                      </button>

                                                                      <div className="space-y-3">
                                                                             {plan.features.map((feat, i) => (
                                                                                    <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                                                           <Check size={16} className={`mt-0.5 shrink-0 ${plan.popular ? 'text-emerald-500' : 'text-muted-foreground/50'}`} />
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
                                                               className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
                                                        >
                                                               ← Volver a planes
                                                        </button>
                                                        <h2 className="text-3xl font-bold">Crea tu cuenta</h2>
                                                        <p className="text-muted-foreground">Configura tu club en segundos.</p>
                                                 </div>

                                                 <form onSubmit={handleRegister} className="space-y-4 bg-card/50 p-6 md:p-8 rounded-3xl border border-border shadow-2xl backdrop-blur-sm">

                                                        <div className="space-y-4">
                                                               <div className="space-y-1">
                                                                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Nombre del Club</label>
                                                                      <div className="relative">
                                                                             <Store className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                                                                             <input
                                                                                    type="text"
                                                                                    required
                                                                                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-muted-foreground/50"
                                                                                    placeholder="Ej: Padel Center"
                                                                                    value={formData.clubName}
                                                                                    onChange={e => setFormData({ ...formData, clubName: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>

                                                               <div className="space-y-1">
                                                                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Tu Nombre</label>
                                                                      <div className="relative">
                                                                             <User className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                                                                             <input
                                                                                    type="text"
                                                                                    required
                                                                                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-muted-foreground/50"
                                                                                    placeholder="Ej: Juan Pérez"
                                                                                    value={formData.userName}
                                                                                    onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>

                                                               <div className="space-y-1">
                                                                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Email</label>
                                                                      <div className="relative">
                                                                             <Mail className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                                                                             <input
                                                                                    type="email"
                                                                                    required
                                                                                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-muted-foreground/50"
                                                                                    placeholder="juan@ejemplo.com"
                                                                                    value={formData.email}
                                                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>

                                                               <div className="space-y-1">
                                                                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Contraseña</label>
                                                                      <div className="relative">
                                                                             <Lock className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                                                                             <input
                                                                                    type="password"
                                                                                    required
                                                                                    className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-muted-foreground/50"
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

                                                        <p className="text-xs text-center text-muted-foreground mt-4">
                                                               Al registrarte, aceptas nuestros <Link href="/legal/terms" className="underline hover:text-foreground">Términos y Condiciones</Link> y <Link href="/legal/privacy" className="underline hover:text-foreground">Política de Privacidad</Link>.
                                                        </p>
                                                 </form>
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </main>
              </div>
       )
}
