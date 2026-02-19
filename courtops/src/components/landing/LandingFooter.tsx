
import React from 'react'
import Link from 'next/link'
import { Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

export default function LandingFooter() {
       return (
              <footer className="relative border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black text-slate-500 dark:text-zinc-500 overflow-hidden">

                     {/* Final CTA Banner */}
                     <div className="relative py-20 px-6 text-center bg-gradient-to-b from-white to-slate-50 dark:from-[#0a0a0a] dark:to-black">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                            <div className="max-w-3xl mx-auto relative z-10 space-y-6">
                                   <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                          ¿Listo para profesionalizar{' '}
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-300">
                                                 tu club?
                                          </span>
                                   </h2>
                                   <p className="text-lg text-slate-500 dark:text-zinc-400 font-medium max-w-xl mx-auto">
                                          Empezá hoy mismo con 14 días gratis. Sin tarjeta, sin riesgo.
                                   </p>
                                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                          <Link
                                                 href="/register"
                                                 className="group inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-500 transition-colors active:scale-95 shadow-lg shadow-emerald-500/20"
                                          >
                                                 Empezar Gratis
                                                 <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                          </Link>
                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20info%20sobre%20CourtOps"
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="inline-flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-sm transition-colors"
                                          >
                                                 O hablemos por WhatsApp →
                                          </a>
                                   </div>
                            </div>
                     </div>

                     {/* Main Footer Grid */}
                     <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
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
                                                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-pink-500 dark:hover:text-pink-400 hover:border-pink-300 dark:hover:border-pink-500/30 hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-all"
                                                        aria-label="Instagram de CourtOps"
                                                 >
                                                        <Instagram size={18} />
                                                 </a>
                                                 <a
                                                        href="mailto:soporte@courtops.com"
                                                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                                                        aria-label="Email de soporte"
                                                 >
                                                        <Mail size={18} />
                                                 </a>
                                                 <a
                                                        href="https://wa.me/5493524421497"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-green-500 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-500/30 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all"
                                                        aria-label="WhatsApp de CourtOps"
                                                 >
                                                        <Phone size={18} />
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
