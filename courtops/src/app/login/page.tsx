'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Rocket, Zap, Clock, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
       const router = useRouter()
       const [email, setEmail] = useState('')
       const [password, setPassword] = useState('')
       const [error, setError] = useState('')
       const [isLoading, setIsLoading] = useState(false)

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
                     setError('Credenciales inválidas. Intente nuevamente.')
                     setIsLoading(false)
              } else {
                     router.push('/')
                     router.refresh()
              }
       }

       return (
              <div className="min-h-screen bg-[#030712] flex overflow-hidden selection:bg-primary/30">
                     {/* LEFT SIDE: IMMERSIVE BRANDING */}
                     <div className="hidden lg:flex lg:w-3/5 relative bg-[#030712] overflow-hidden items-center justify-center border-r border-white/5">
                            {/* Animated Background Elements */}
                            <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
                            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse" />
                            <div className="absolute inset-0 noise z-0" />

                            <div className="relative z-10 p-16 max-w-2xl space-y-12">
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="space-y-4"
                                   >
                                          <div className="h-1 w-24 bg-primary rounded-full mb-6" />
                                          <h1 className="text-7xl font-black text-white tracking-tighter leading-tight uppercase italic">
                                                 Define el <span className="text-primary italic">ritmo</span> <br /> de tu club.
                                          </h1>
                                          <p className="text-zinc-400 text-xl font-medium tracking-tight">
                                                 La plataforma definitiva para la gestión de complejos deportivos de alto nivel.
                                          </p>
                                   </motion.div>

                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.3 }}
                                          className="grid grid-cols-2 gap-8"
                                   >
                                          <div className="space-y-2">
                                                 <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest">
                                                        <Zap size={16} className="text-primary" />
                                                        Velocidad
                                                 </div>
                                                 <p className="text-zinc-500 text-sm">Reservas en 3 segundos, interfaz instantánea.</p>
                                          </div>
                                          <div className="space-y-2">
                                                 <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest">
                                                        <Trophy size={16} className="text-primary" />
                                                        Potencia
                                                 </div>
                                                 <p className="text-zinc-500 text-sm">Finanzas y analítica pro bajo tu control.</p>
                                          </div>
                                   </motion.div>
                            </div>
                     </div>

                     {/* RIGHT SIDE: LOGIN FORM */}
                     <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 relative z-10">
                            <Link
                                   href="/"
                                   className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all group"
                            >
                                   <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>

                            <motion.div
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   className="w-full max-w-md mx-auto space-y-12"
                            >
                                   <div className="space-y-2">
                                          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
                                                 C<span className="text-primary">O</span>URT<span className="text-primary">O</span>PS
                                          </h2>
                                          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-none">Inicia sesión en tu cuenta</p>
                                   </div>

                                   <form onSubmit={handleSubmit} className="space-y-6">
                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Email Corporativo</label>
                                                 <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-zinc-700 font-bold"
                                                        placeholder="admin@tuclub.com"
                                                 />
                                          </div>

                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Contraseña</label>
                                                 <input
                                                        type="password"
                                                        required
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-zinc-700 font-bold"
                                                        placeholder="••••••••"
                                                 />
                                          </div>

                                          {error && (
                                                 <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center"
                                                 >
                                                        {error}
                                                 </motion.div>
                                          )}

                                          <button
                                                 type="submit"
                                                 disabled={isLoading}
                                                 className="w-full bg-white text-black font-black py-4 px-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:pointer-events-none text-xs uppercase tracking-[0.2em]"
                                          >
                                                 {isLoading ? 'Autenticando...' : 'Entrar al Dashboard'}
                                          </button>
                                   </form>

                                   <div className="pt-8 border-t border-white/5 flex flex-col items-center">
                                          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-4">Plataforma Profesional</p>
                                          <div className="flex gap-1.5">
                                                 <div className="h-1 w-8 bg-primary rounded-full" />
                                                 <div className="h-1 w-2 bg-zinc-800 rounded-full" />
                                                 <div className="h-1 w-2 bg-zinc-800 rounded-full" />
                                          </div>
                                   </div>
                            </motion.div>
                     </div>
              </div>
       )
}
