'use client'

import React from 'react'
import Link from 'next/link'
import { Zap, Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react'

export default function LandingFooter() {
       const currentYear = new Date().getFullYear()

       return (
              <footer className="pt-24 pb-12 px-6 bg-slate-50 dark:bg-[#050505] transition-colors duration-700 border-t border-slate-200/50 dark:border-white/5">
                     <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

                                   {/* Brand & Mission */}
                                   <div className="col-span-2 lg:col-span-1 space-y-6">
                                          <Link href="/" className="inline-block group transition-opacity hover:opacity-80 pb-2">
                                                 <img src="/logo.png" alt="CourtOps Logo" className="h-9 w-auto object-contain" />
                                          </Link>
                                          <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed max-w-xs">
                                                 Elevando el estándar en la gestión de complejos deportivos con tecnología de clase mundial.
                                          </p>
                                          <div className="flex items-center gap-4 text-slate-400 dark:text-zinc-600">
                                                 <Link href="#" className="hover:text-emerald-500 transition-colors"><Instagram size={18} /></Link>
                                                 <Link href="#" className="hover:text-emerald-500 transition-colors"><Facebook size={18} /></Link>
                                                 <Link href="#" className="hover:text-emerald-500 transition-colors"><Twitter size={18} /></Link>
                                          </div>
                                   </div>

                                   {/* Product Links */}
                                   <div className="space-y-6">
                                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Producto</h4>
                                          <ul className="space-y-4">
                                                 <li><Link href="#features" className="text-sm text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">Funciones</Link></li>
                                                 <li><Link href="#pricing" className="text-sm text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">Precios</Link></li>
                                                 <li><Link href="/register" className="text-sm text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">Comenzar ahora</Link></li>
                                          </ul>
                                   </div>

                                   {/* Legal Links */}
                                   <div className="space-y-6">
                                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Legal</h4>
                                          <ul className="space-y-4">
                                                 <li><Link href="#" className="text-sm text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">Términos de servicio</Link></li>
                                                 <li><Link href="#" className="text-sm text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">Privacidad</Link></li>
                                                 <li><Link href="#" className="text-sm text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">Cookies</Link></li>
                                          </ul>
                                   </div>

                                   {/* Contact Info */}
                                   <div className="space-y-6">
                                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Contacto</h4>
                                          <ul className="space-y-4">
                                                 <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-500">
                                                        <Mail size={16} /> hola@courtops.com
                                                 </li>
                                                 <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-500">
                                                        <MapPin size={16} /> Córdoba, Argentina
                                                 </li>
                                                 <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-500">
                                                        <Phone size={16} /> +54 9 3524 421497
                                                 </li>
                                          </ul>
                                   </div>
                            </div>

                            {/* Bottom Bar */}
                            <div className="pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest">
                                   <div>© {currentYear} CourtOps. Todos los derechos reservados.</div>
                                   <div className="flex items-center gap-6">
                                          <span>Made with ❤️ for Padel Enthusiasts</span>
                                          <div className="flex items-center gap-1">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                 System Status: Normal
                                          </div>
                                   </div>
                            </div>
                     </div>
              </footer>
       )
}
