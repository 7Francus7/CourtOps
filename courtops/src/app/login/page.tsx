'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Rocket, Zap, Mail, Lock, ShieldCheck, Star, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePerformance } from '@/contexts/PerformanceContext'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
       const router = useRouter()
       const searchParams = useSearchParams()
       const { isLowEnd, reduceMotion } = usePerformance()
       const [email, setEmail] = useState('')
       const [password, setPassword] = useState('')
       const [error, setError] = useState('')
       const [isLoading, setIsLoading] = useState(false)

       useEffect(() => {
              if (searchParams.get('registered')) {
                     toast.success('¡Registro exitoso! Ya puedes iniciar sesión.')
              }
       }, [searchParams])

       async function handleSubmit(e: React.FormEvent) {
              e.preventDefault()
              setIsLoading(true)
              setError('')

              const result = await signIn('credentials', {
                     redirect: false,
                     email,
                     password
              })

              if (result?.error) {
                     setError('Credenciales inválidas. Por favor, revisa tus datos.')
                     setIsLoading(false)
              } else {
                     router.push('/dashboard')
                     router.refresh()
              }
       }

       return (
              <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col lg:flex-row overflow-hidden transition-colors duration-700 font-sans">

                     {/* LEFT SIDE: MINIMAL BRANDING CONTENT */}
                     <div className="hidden lg:flex lg:w-[45%] relative bg-slate-50 dark:bg-[#080808] overflow-hidden items-center justify-center border-r border-slate-200 dark:border-white/5">
                            {/* Subtle Pro Grid */}
                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                            </div>

                            {/* Refined Ambient Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

                            <div className="relative z-10 p-16 max-w-xl space-y-12">
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                                          className="space-y-6"
                                   >
                                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                                 SaaS v3.0 • Acceso Corporativo
                                          </div>

                                          <h1 className="text-5xl xl:text-7xl font-medium text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                                                 Tu Club, <br />
                                                 <span className="text-slate-400 dark:text-zinc-600">Bajo Control.</span>
                                          </h1>

                                          <p className="text-slate-500 dark:text-zinc-400 text-lg leading-relaxed opacity-80">
                                                 Ingresa a la plataforma de gestión más eficiente del mercado y optimiza tu operación hoy mismo.
                                          </p>
                                   </motion.div>

                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.4 }}
                                          className="space-y-10 border-t border-slate-200 dark:border-white/5 pt-10"
                                   >
                                          <div className="flex items-start gap-4 group">
                                                 <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-sm text-emerald-500">
                                                        <Zap size={20} />
                                                 </div>
                                                 <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Acceso Instantáneo</h4>
                                                        <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Sincronización en tiempo real con todas tus sedes.</p>
                                                 </div>
                                          </div>

                                          <div className="flex items-start gap-4 group">
                                                 <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-sm text-indigo-500">
                                                        <Globe size={20} />
                                                 </div>
                                                 <div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Gestión Omnicanal</h4>
                                                        <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Tu oficina global en cualquier lugar y dispositivo.</p>
                                                 </div>
                                          </div>
                                   </motion.div>
                            </div>
                     </div>

                     {/* RIGHT SIDE: MINIMAL LOGIN FORM */}
                     <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative z-10 bg-white dark:bg-[#050505] transition-colors duration-700">

                            <Link
                                   href="/"
                                   className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400 dark:hover:text-white transition-all group border border-slate-200 dark:border-white/5"
                            >
                                   <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>

                            <motion.div
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                                   className="w-full max-w-sm mx-auto"
                            >
                                   <div className="mb-12 flex flex-col items-center lg:items-start">
                                          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-6">
                                                 <Zap size={24} fill="currentColor" />
                                          </div>
                                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bienvenido de nuevo</h2>
                                          <p className="text-slate-500 dark:text-zinc-500 text-sm mt-2">Introduce tus credenciales para acceder.</p>
                                   </div>

                                   <form onSubmit={handleSubmit} className="space-y-6">
                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Corporativo</label>
                                                 <div className="relative group">
                                                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                        <input
                                                               type="email"
                                                               required
                                                               value={email}
                                                               onChange={e => setEmail(e.target.value)}
                                                               className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 font-medium"
                                                               placeholder="admin@tuclub.com"
                                                        />
                                                 </div>
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                                                 <div className="relative group">
                                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                        <input
                                                               type="password"
                                                               required
                                                               value={password}
                                                               onChange={e => setPassword(e.target.value)}
                                                               className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-700 font-medium"
                                                               placeholder="••••••••"
                                                        />
                                                 </div>
                                          </div>

                                          <AnimatePresence mode="wait">
                                                 {error && (
                                                        <motion.div
                                                               initial={{ opacity: 0, y: -5 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               exit={{ opacity: 0 }}
                                                               className="text-red-500 dark:text-red-400 text-xs font-semibold px-1"
                                                        >
                                                               {error}
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>

                                          <button
                                                 type="submit"
                                                 disabled={isLoading}
                                                 className={cn(
                                                        "w-full py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm",
                                                        isLoading
                                                               ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed"
                                                               : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-[0.98]"
                                                 )}
                                          >
                                                 {isLoading ? (
                                                        <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                                 ) : (
                                                        <>Entrar al Dashboard <ArrowRight size={16} /></>
                                                 )}
                                          </button>
                                   </form>

                                   <div className="mt-12 pt-12 border-t border-slate-100 dark:border-white/5 text-center">
                                          <p className="text-xs text-slate-400 dark:text-zinc-600 mb-6 font-medium uppercase tracking-[0.2em]">Infraestructura Protegida</p>
                                          <div className="flex justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
                                                 <ShieldCheck size={20} className="text-slate-400 dark:text-white" />
                                                 <div className="h-5 w-px bg-slate-200 dark:bg-white/10" />
                                                 <Lock size={20} className="text-slate-400 dark:text-white" />
                                                 <div className="h-5 w-px bg-slate-200 dark:bg-white/10" />
                                                 <Globe size={20} className="text-slate-400 dark:text-white" />
                                          </div>
                                   </div>
                            </motion.div>
                     </div>
              </div>
       )
}
