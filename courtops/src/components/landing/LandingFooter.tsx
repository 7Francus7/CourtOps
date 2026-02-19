
import React from 'react'
import Link from 'next/link'
import { Instagram, Mail, Phone, MapPin } from 'lucide-react'

export default function LandingFooter() {
       return (
              <footer className="pt-16 pb-8 px-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black text-slate-500 dark:text-zinc-500">
                     <div className="max-w-6xl mx-auto">
                            {/* Main Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                                   {/* Brand Column */}
                                   <div className="md:col-span-1 space-y-4">
                                          <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                                                 COURT<span className="text-emerald-600 dark:text-emerald-500">OPS</span>
                                          </h2>
                                          <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 leading-relaxed">
                                                 Software de gestión para clubes deportivos. <br />Diseñado por dueños, para dueños.
                                          </p>
                                          <div className="flex items-center gap-3 pt-2">
                                                 <a
                                                        href="https://instagram.com/courtops.ok"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-pink-500 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-500/30 transition-all"
                                                        aria-label="Instagram de CourtOps"
                                                 >
                                                        <Instagram size={16} />
                                                 </a>
                                                 <a
                                                        href="mailto:soporte@courtops.com"
                                                        className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all"
                                                        aria-label="Email de soporte"
                                                 >
                                                        <Mail size={16} />
                                                 </a>
                                                 <a
                                                        href="https://wa.me/5493524421497"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-green-500 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-500/30 transition-all"
                                                        aria-label="WhatsApp de CourtOps"
                                                 >
                                                        <Phone size={16} />
                                                 </a>
                                          </div>
                                   </div>

                                   {/* Product */}
                                   <div className="space-y-4">
                                          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white">Producto</h3>
                                          <ul className="space-y-3">
                                                 <li><Link href="#features" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Características</Link></li>
                                                 <li><Link href="#pricing" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Precios</Link></li>
                                                 <li><Link href="/calculator" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Calculadora ROI</Link></li>
                                                 <li><Link href="#faq" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Preguntas Frecuentes</Link></li>
                                          </ul>
                                   </div>

                                   {/* Legal */}
                                   <div className="space-y-4">
                                          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white">Legal</h3>
                                          <ul className="space-y-3">
                                                 <li><Link href="/legal/terms" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Términos y Condiciones</Link></li>
                                                 <li><Link href="/legal/privacy" className="text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Política de Privacidad</Link></li>
                                          </ul>
                                   </div>

                                   {/* Contact */}
                                   <div className="space-y-4">
                                          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white">Contacto</h3>
                                          <ul className="space-y-3">
                                                 <li className="flex items-center gap-2 text-sm font-medium">
                                                        <Phone size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <a href="https://wa.me/5493524421497" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                                               +54 3524 42 1497
                                                        </a>
                                                 </li>
                                                 <li className="flex items-center gap-2 text-sm font-medium">
                                                        <Mail size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <a href="mailto:soporte@courtops.com" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                                               soporte@courtops.com
                                                        </a>
                                                 </li>
                                                 <li className="flex items-start gap-2 text-sm font-medium">
                                                        <MapPin size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                        <span>Córdoba, Argentina 🇦🇷</span>
                                                 </li>
                                          </ul>
                                   </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent mb-8" />

                            {/* Bottom Bar */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                   <div className="text-xs text-slate-400 dark:text-zinc-600">
                                          © {new Date().getFullYear()} CourtOps SaaS. Todos los derechos reservados.
                                   </div>
                                   <div className="flex items-center gap-4">
                                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-zinc-600">
                                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                 Todos los sistemas operativos
                                          </div>
                                   </div>
                            </div>
                     </div>
              </footer>
       )
}
