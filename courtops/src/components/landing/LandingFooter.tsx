'use client'

import React from 'react'
import Link from 'next/link'
import { Instagram, Mail, Phone, MapPin, ArrowRight, Zap, Shield, Globe, Cpu } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function LandingFooter() {
       return (
              <footer className="relative border-t border-slate-200 dark:border-white/5 bg-white dark:bg-black text-slate-500 dark:text-zinc-500 overflow-hidden">

                     {/* Final CTA Banner - High Impact */}
                     <div className="relative py-24 md:py-32 px-4 md:px-8 border-b border-slate-200 dark:border-white/5 overflow-hidden">
                            {/* Cinematic Background */}
                            <div className="absolute inset-0 z-0">
                                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_100%)]" />
                                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
                            </div>

                            <motion.div
                                   initial={{ opacity: 0, y: 40 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   className="max-w-6xl mx-auto relative z-10 text-center space-y-12"
                            >
                                   <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-3xl shadow-xl">
                                          <Cpu size={14} className="animate-pulse" />
                                          Infraestructura de Élite
                                   </div>

                                   <h2 className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] uppercase italic">
                                          Domina el <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500">Mercado Ya.</span>
                                   </h2>

                                   <p className="text-xl md:text-3xl text-slate-500 dark:text-zinc-500 font-medium max-w-3xl mx-auto leading-tight italic opacity-80">
                                          Únete a los clubes que ya automatizaron su rentabilidad. Empieza con <span className="text-slate-900 dark:text-white underline decoration-emerald-500 decoration-4">14 días de prueba élite</span> sin compromiso.
                                   </p>

                                   <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-8">
                                          <Link href="/register" className="group relative py-7 px-16 rounded-[2.5rem] bg-emerald-500 text-white font-black text-xl uppercase tracking-[0.3em] shadow-[0_30px_60px_-15px_rgba(16,185,129,0.4)] hover:scale-[1.05] transition-all duration-500 overflow-hidden">
                                                 <span className="relative z-10 flex items-center gap-4">
                                                        Empezar Gratis <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                                                 </span>
                                                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                          </Link>

                                          <a
                                                 href="https://wa.me/5493524421497"
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-3 border-b-2 border-transparent hover:border-emerald-500 pb-2"
                                          >
                                                 Consultoría Técnica <ArrowRight size={16} />
                                          </a>
                                   </div>
                            </motion.div>
                     </div>

                     {/* Main Footer Grid */}
                     <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">

                                   {/* Brand Column */}
                                   <div className="md:col-span-5 space-y-10 group">
                                          <Link href="/" className="inline-flex items-center gap-5">
                                                 <div className="relative">
                                                        <div className="absolute -inset-2 bg-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <div className="relative w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-black text-3xl shadow-2xl transition-transform group-hover:rotate-12">
                                                               C
                                                        </div>
                                                 </div>
                                                 <div className="flex flex-col">
                                                        <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                                                               Court<span className="text-emerald-500">Ops</span>
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 dark:text-zinc-600 mt-1">Digital Turf</span>
                                                 </div>
                                          </Link>

                                          <p className="text-xl font-medium text-slate-500 dark:text-zinc-400 leading-tight max-w-sm italic opacity-80">
                                                 Ingeniería de software para complejos deportivos de alto nivel. Operaciones fluidas, rentabilidad máxima.
                                          </p>

                                          <div className="flex items-center gap-4">
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
                                                               className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                                                        >
                                                               <social.icon size={20} />
                                                        </a>
                                                 ))}
                                          </div>
                                   </div>

                                   {/* Links Grid */}
                                   <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                                          <div className="space-y-8">
                                                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Explorar</h3>
                                                 <ul className="space-y-5">
                                                        <li><Link href="#features" className="text-sm font-bold text-slate-500 dark:text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-widest">Características</Link></li>
                                                        <li><Link href="#pricing" className="text-sm font-bold text-slate-500 dark:text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-widest">Precios</Link></li>
                                                        <li><Link href="/calculator" className="text-sm font-bold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-widest">Calculadora ROI</Link></li>
                                                 </ul>
                                          </div>

                                          <div className="space-y-8">
                                                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Legal</h3>
                                                 <ul className="space-y-5">
                                                        <li><Link href="/legal/terms" className="text-sm font-bold text-slate-500 dark:text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-widest">Términos</Link></li>
                                                        <li><Link href="/legal/privacy" className="text-sm font-bold text-slate-500 dark:text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-widest">Privacidad</Link></li>
                                                 </ul>
                                          </div>

                                          <div className="col-span-2 md:col-span-1 space-y-8">
                                                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Contacto</h3>
                                                 <div className="space-y-6">
                                                        <div className="flex flex-col gap-2">
                                                               <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">HQ</span>
                                                               <span className="text-sm font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-tighter">Córdoba, Argentina 🇦🇷</span>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                               <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Support</span>
                                                               <span className="text-sm font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-tighter">courtops.saas@gmail.com</span>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {/* Divider & Bottom Bar */}
                            <div className="pt-12 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                                   <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                          © {new Date().getFullYear()} CourtOps SaaS. Todos los derechos reservados.
                                   </div>

                                   <div className="flex items-center gap-8">
                                          <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 shadow-inner">
                                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Sistemas Operativos Activos</span>
                                          </div>

                                          <div className="flex items-center gap-3">
                                                 <Globe size={14} className="text-slate-400" />
                                                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Global Edition</span>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </footer>
       )
}
