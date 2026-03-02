'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Rocket, Zap, Clock, Trophy, Mail, Lock, ShieldCheck, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { usePerformance } from '@/contexts/PerformanceContext'

const Particle = ({ delay, x, y, size, reduceMotion }: { delay: number; x: string; y: string; size: number, reduceMotion?: boolean }) => {
       if (reduceMotion) return null;
       return (
              <motion.div
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{
                            opacity: [0, 0.5, 0],
                            scale: [0, 1.5, 0],
                            y: ["0%", "-100%"]
                     }}
                     transition={{
                            duration: 3 + Math.random() * 2,
                            delay,
                            repeat: Infinity,
                            ease: "easeOut"
                     }}
                     className="absolute bg-primary/40 rounded-full blur-sm pointer-events-none"
                     style={{ left: x, top: y, width: size, height: size }}
              />
       )
}

import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
       const router = useRouter()
       const searchParams = useSearchParams()
       const { isLowEnd, isTV, reduceMotion } = usePerformance()
       const [email, setEmail] = useState('')
       const [password, setPassword] = useState('')
       const [error, setError] = useState('')
       const [isLoading, setIsLoading] = useState(false)
       const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

       useEffect(() => {
              if (searchParams.get('registered')) {
                     toast.success('¡Registro exitoso! Ya puedes iniciar sesión.')
              }
       }, [searchParams])

       useEffect(() => {
              // Disable mouse tracking on TV or low-end to save layout cycles
              if (isLowEnd || isTV) return;

              const handleMouseMove = (e: MouseEvent) => {
                     setMousePos({ x: e.clientX, y: e.clientY })
              }
              window.addEventListener('mousemove', handleMouseMove)
              return () => window.removeEventListener('mousemove', handleMouseMove)
       }, [isLowEnd, isTV])

       async function handleSubmit(e: React.FormEvent) {
              e.preventDefault()
              setIsLoading(true)
              setError('')

              // Visual delay only for high-end feel
              if (!isLowEnd) {
                     await new Promise(resolve => setTimeout(resolve, 600))
              }

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
              <div className="min-h-screen bg-[#02040A] flex flex-col lg:flex-row overflow-hidden selection:bg-primary/30 font-sans">
                     {/* LEFT SIDE: IMMERSIVE BRANDING */}
                     <div className="hidden lg:flex lg:w-[55%] relative bg-[#02040A] overflow-hidden items-center justify-center border-r border-white/5">
                            {/* Animated Background Elements - Advanced Physics */}
                            {!isLowEnd && (
                                   <>
                                          <motion.div
                                                 animate={{
                                                        x: (mousePos.x / 40) - 200,
                                                        y: (mousePos.y / 40) - 200,
                                                 }}
                                                 className="absolute top-[-20%] right-[-10%] w-[120%] h-[120%] bg-primary/10 rounded-full blur-[180px] opacity-60 pointer-events-none"
                                          />
                                          <motion.div
                                                 animate={{
                                                        x: -(mousePos.x / 30) + 100,
                                                        y: -(mousePos.y / 30) + 100,
                                                 }}
                                                 className="absolute bottom-[-10%] left-[-10%] w-[90%] h-[90%] bg-indigo-500/10 rounded-full blur-[140px] opacity-50 pointer-events-none"
                                          />
                                   </>
                            )}

                            {/* Noise & Grid Overlay */}
                            <div className="absolute inset-0 noise z-0 opacity-[0.03]" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />

                            {/* Floating Particles */}
                            {!isLowEnd && Array.from({ length: 15 }).map((_, i) => (
                                   <Particle
                                          key={i}
                                          delay={i * 0.4}
                                          x={`${10 + Math.random() * 80}%`}
                                          y={`${10 + Math.random() * 80}%`}
                                          size={2 + Math.random() * 4}
                                          reduceMotion={reduceMotion}
                                   />
                            ))}

                            <div className="relative z-10 p-16 max-w-2xl space-y-16">
                                   <motion.div
                                          initial={{ opacity: 0, y: 30 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                          className="space-y-6"
                                   >
                                          <div className="flex items-center gap-4 mb-4">
                                                 <div className="h-[2px] w-12 bg-primary rounded-full" />
                                                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">SaaS v4.0 Active</span>
                                          </div>

                                          <h1 className="text-7xl xl:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase italic text-balance">
                                                 Define el <br />
                                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-white/90">ritmo</span> <br />
                                                 de tu club.
                                          </h1>

                                          <p className="text-zinc-400 text-xl font-medium tracking-tight max-w-lg leading-relaxed opacity-80">
                                                 La ingeniería definitiva para la gestión de complejos deportivos de alto nivel.
                                          </p>
                                   </motion.div>

                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ delay: 0.4, duration: 0.8 }}
                                          className="grid grid-cols-2 gap-10 border-t border-white/[0.05] pt-12"
                                   >
                                          <div className="space-y-4 group cursor-default">
                                                 <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.3em] group-hover:text-primary transition-colors">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 transition-all group-hover:scale-110 group-hover:border-primary/20">
                                                               <Zap size={14} className="text-primary" />
                                                        </div>
                                                        Velocidad
                                                 </div>
                                                 <p className="text-zinc-500 text-sm leading-snug">Interacciones en milisegundos, experiencia instantánea.</p>
                                          </div>
                                          <div className="space-y-4 group cursor-default">
                                                 <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.3em] group-hover:text-indigo-400 transition-colors">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 transition-all group-hover:scale-110 group-hover:border-indigo-400/20">
                                                               <Trophy size={14} className="text-indigo-400" />
                                                        </div>
                                                        Potencia
                                                 </div>
                                                 <p className="text-zinc-500 text-sm leading-snug">Analítica profunda y control financiero total.</p>
                                          </div>
                                   </motion.div>
                            </div>
                     </div>

                     {/* RIGHT SIDE: LOGIN FORM */}
                     <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative z-10 bg-[#02040A] lg:bg-transparent">
                            {/* Mobile Branded Header */}
                            <div className="lg:hidden mb-12 flex flex-col items-center">
                                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4 animate-pulse">
                                          <Star size={24} className="text-primary fill-primary" />
                                   </div>
                                   <h2 className="text-3xl font-black text-white tracking-widest uppercase">CourtOps</h2>
                            </div>

                            <Link
                                   href="/"
                                   className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all group border border-white/5 active:scale-90"
                            >
                                   <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>

                            <motion.div
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                   className="w-full max-w-md mx-auto relative"
                            >
                                   {/* Decorative background for the card area */}
                                   <div className="absolute -inset-10 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />

                                   <div className="space-y-4 mb-16 relative">
                                          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                                                 C<span className="text-primary">O</span>URT<span className="text-primary">O</span>PS
                                          </h2>
                                          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] leading-none ml-1">Inicia sesión en tu cuenta</p>
                                   </div>

                                   <form onSubmit={handleSubmit} className="space-y-8 relative">
                                          <div className="space-y-3 group/field">
                                                 <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] group-focus-within/field:text-primary transition-colors">Email Corporativo</label>
                                                        <Mail size={12} className="text-zinc-700 group-focus-within/field:text-primary transition-colors" />
                                                 </div>
                                                 <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:ring-1 focus:ring-primary focus:border-primary/50 text-sm outline-none transition-all placeholder:text-zinc-700 font-bold tracking-tight shadow-xl"
                                                        placeholder="admin@tuclub.com"
                                                 />
                                          </div>

                                          <div className="space-y-3 group/field">
                                                 <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] group-focus-within/field:text-primary transition-colors">Contraseña</label>
                                                        <Lock size={12} className="text-zinc-700 group-focus-within/field:text-primary transition-colors" />
                                                 </div>
                                                 <input
                                                        type="password"
                                                        required
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:ring-1 focus:ring-primary focus:border-primary/50 text-sm outline-none transition-all placeholder:text-zinc-700 font-bold tracking-tight shadow-xl"
                                                        placeholder="••••••••"
                                                 />
                                          </div>

                                          <AnimatePresence mode="wait">
                                                 {error && (
                                                        <motion.div
                                                               initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                               animate={{ opacity: 1, y: 0, scale: 1 }}
                                                               exit={{ opacity: 0, scale: 0.95 }}
                                                               className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center flex items-center justify-center gap-2"
                                                        >
                                                               <div className="w-1 h-1 bg-red-400 rounded-full animate-ping" />
                                                               {error}
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>

                                          <button
                                                 type="submit"
                                                 disabled={isLoading}
                                                 className={cn(
                                                        "w-full relative overflow-hidden group/btn py-5 px-6 rounded-2xl transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] active:scale-[0.98] disabled:opacity-50",
                                                        isLoading
                                                               ? "bg-zinc-800 text-zinc-500 animate-pulse"
                                                               : "bg-white text-black hover:shadow-primary/20 hover:scale-[1.02]"
                                                 )}
                                          >
                                                 <span className="relative z-10 flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-[0.3em]">
                                                        {isLoading ? (
                                                               <>Autenticando <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" /></>
                                                        ) : (
                                                               <>Entrar al Dashboard <Rocket size={14} className="group-hover/btn:translate-y-[-2px] group-hover/btn:translate-x-[2px] transition-transform" /></>
                                                        )}
                                                 </span>
                                                 {!isLoading && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover/btn:opacity-100 translate-x-[-100%] group-hover/btn:translate-x-0 transition-all duration-700 pointer-events-none" />
                                                 )}
                                          </button>
                                   </form>

                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.8 }}
                                          className="pt-12 mt-12 border-t border-white/[0.03] space-y-6"
                                   >
                                          <div className="flex flex-col items-center">
                                                 <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] mb-4">Plataforma Profesional</p>
                                                 <div className="flex gap-2">
                                                        <div className="h-[3px] w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                                        <div className="h-[3px] w-3 bg-zinc-900 rounded-full group-hover:bg-zinc-800 transition-colors" />
                                                        <div className="h-[3px] w-3 bg-zinc-900 rounded-full group-hover:bg-zinc-800 transition-colors" />
                                                 </div>
                                          </div>

                                          <div className="flex justify-center gap-8 opacity-40">
                                                 <ShieldCheck size={16} className="text-white hover:text-primary transition-colors cursor-help" />
                                                 <Lock size={16} className="text-white hover:text-primary transition-colors cursor-help" />
                                                 <Clock size={16} className="text-white hover:text-primary transition-colors cursor-help" />
                                          </div>
                                   </motion.div>
                            </motion.div>
                     </div>
              </div>
       )
}
