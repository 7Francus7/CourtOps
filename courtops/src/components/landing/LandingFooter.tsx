'use client'

import React from 'react'
import Link from 'next/link'
import { Instagram, Mail, Phone, ArrowRight, Zap, Globe, Cpu, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function LandingFooter() {
       return (
              <footer className="relative border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#02040A] text-slate-500 dark:text-zinc-500 overflow-hidden transition-colors duration-1000">

                     {/* Cinematic CTA Banner */}
                     <div className="relative py-32 md:py-48 px-6 md:px-12 overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]" />
                                   <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-50" />
                            </div>

                            <motion.div
                                   initial={{ opacity: 0, y: 50 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                   className="max-w-7xl mx-auto relative z-10 text-center space-y-16"
                            >
                                   <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] backdrop-blur-3xl shadow-xl">
                                          <Cpu size={14} className="animate-pulse" />
                                          Potencia Operativa Sin Límites
                                   </div>

                                   <h2 className="text-6xl md:text-9xl lg:text-[130px] font-black text-slate-950 dark:text-white tracking-tighter leading-[0.8] uppercase italic">
                                          Domina tu <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-600 dark:from-emerald-400 dark:to-indigo-500 pb-4">
                                                 Sede Hoy.
                                          </span>
                                   </h2>

                                   <p className="text-xl md:text-3xl text-slate-500 dark:text-zinc-500 font-bold max-w-4xl mx-auto leading-tight italic opacity-80">
                                          Únete a los clubes élite que ya automatizaron su rentabilidad. Empieza tu prueba de 14 días <span className="text-slate-950 dark:text-white underline decoration-emerald-500/50 decoration-4">sin tarjetas, sin fricción.</span>
                                   </p>

                                   <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-10">
                                          <Link href="/register" className="group relative py-8 px-20 rounded-[3rem] bg-emerald-500 text-white font-black text-sm uppercase tracking-[0.4em] shadow-[0_30px_70px_-15px_rgba(16,185,129,0.5)] hover:scale-[1.05] transition-all duration-700 overflow-hidden active:scale-95">
                                                 <span className="relative z-10 flex items-center gap-4">
                                                        Activar Ahora <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                                                 </span>
                                                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                          </Link>

                                          <a
                                                 href="https://wa.me/5493524421497"
                                                 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 hover:text-slate-950 dark:hover:text-white transition-all flex items-center gap-4 border-b-2 border-slate-200 dark:border-white/10 hover:border-emerald-500 pb-3"
                                          >
                                                 Consultoría Técnica Gratis <ArrowRight size={18} />
                                          </a>
                                   </div>
                            </motion.div>
                     </div>

                     {/* Footer Grid */}
                     <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-16 relative z-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">

                                   {/* Brand Cluster */}
                                   <div className="lg:col-span-5 space-y-12">
                                          <Link href="/" className="inline-flex items-center gap-5 group">
                                                 <div className="relative">
                                                        <div className="absolute -inset-2 bg-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <div className="relative w-16 h-16 rounded-2xl bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-black font-black text-3xl shadow-2xl transition-transform group-hover:rotate-12 group-hover:scale-110">
                                                               <Zap size={28} fill="currentColor" />
                                                        </div>
                                                 </div>
                                                 <div className="flex flex-col">
                                                        <span className="text-3xl font-black tracking-tighter text-slate-950 dark:text-white leading-none uppercase italic">
                                                               Court<span className="text-emerald-500">Ops</span>
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-zinc-600 mt-1">SaaS Engineering</span>
                                                 </div>
                                          </Link>

                                          <p className="text-2xl font-bold text-slate-500 dark:text-zinc-400 leading-tight italic max-w-sm opacity-80">
                                                 Infraestructura de software para complejos deportivos de alto nivel. Operaciones fluidas. Rentabilidad máxima.
                                          </p>

                                          <div className="flex items-center gap-6">
                                                 {[
                                                        { icon: Instagram, href: "https://instagram.com/courtops.ok" },
                                                        { icon: Mail, href: "mailto:courtops.saas@gmail.com" },
                                                        { icon: Phone, href: "https://wa.me/5493524421497" }
                                                 ].map((social, i) => (
                                                        <a
                                                               key={i}
                                                               href={social.href}
                                                               target="_blank"
                                                               rel="noopener noreferrer"
                                                               className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-transparent transition-all shadow-sm active:scale-90"
                                                        >
                                                               <social.icon size={24} strokeWidth={1.5} />
                                                        </a>
                                                 ))}
                                          </div>
                                   </div>

                                   {/* Link Columns */}
                                   <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-16">
                                          <div className="space-y-10">
                                                 <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-950 dark:text-white">Explorar</h3>
                                                 <ul className="space-y-6">
                                                        <li><Link href="#features" className="text-xs font-black text-slate-500 dark:text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">Funciones</Link></li>
                                                        <li><Link href="#pricing" className="text-xs font-black text-slate-500 dark:text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">Precios</Link></li>
                                                        <li><Link href="/calculator" className="text-xs font-black text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-[0.2em]">Calculadora ROI</Link></li>
                                                 </ul>
                                          </div>

                                          <div className="space-y-10">
                                                 <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-950 dark:text-white">Legal</h3>
                                                 <ul className="space-y-6">
                                                        <li><Link href="/legal/terms" className="text-xs font-black text-slate-500 dark:text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">Términos</Link></li>
                                                        <li><Link href="/legal/privacy" className="text-xs font-black text-slate-500 dark:text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">Privacidad</Link></li>
                                                 </ul>
                                          </div>

                                          <div className="col-span-2 md:col-span-1 space-y-10">
                                                 <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-950 dark:text-white">Conexión</h3>
                                                 <div className="space-y-8">
                                                        <div className="flex flex-col gap-2">
                                                               <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Headquarters</span>
                                                               <span className="text-sm font-black text-slate-800 dark:text-zinc-300 uppercase tracking-tighter">Córdoba, Argentina 🇦🇷</span>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                               <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Direct Contact</span>
                                                               <span className="text-sm font-black text-slate-800 dark:text-zinc-300 uppercase tracking-tighter">courtops.saas@gmail.com</span>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {/* Divider & Bottom Section */}
                            <div className="pt-16 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
                                   <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                          © {new Date().getFullYear()} CourtOps SaaS Edition.
                                   </div>

                                   <div className="flex items-center gap-12">
                                          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 shadow-inner">
                                                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sistemas Operativos 100% On-line</span>
                                          </div>

                                          <div className="flex items-center gap-4 group cursor-default">
                                                 <Globe size={16} className="text-slate-400 transition-transform group-hover:rotate-180 duration-1000" />
                                                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Edición Global</span>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </footer>
       )
}
