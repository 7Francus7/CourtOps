
import React from 'react'
import Link from 'next/link'
import { Instagram, Mail, Phone, MapPin, ArrowRight, Zap } from 'lucide-react'

export default function LandingFooter() {
       return (
              <footer className="relative border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#030712] text-slate-500 dark:text-zinc-500 overflow-hidden">

                     {/* Floating background elements for cohesion */}
                     <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
                     <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

                     {/* Final CTA Banner */}
                     <div className="relative py-16 md:py-24 px-4 md:px-6 text-center border-b border-slate-200/50 dark:border-white/5">
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                            <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-2">
                                          <Zap size={14} fill="currentColor" />
                                          Impulsa Tu Negocio
                                   </div>
                                   <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                          ¿Listo para profesionalizar{' '}
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)] block md:inline mt-2 md:mt-0">
                                                 tu club?
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
                                          Únete a los clubes que ya automatizaron su gestión. Empieza hoy mismo con <span className="text-emerald-600 dark:text-emerald-400 font-bold">14 días gratis</span>. Sin tarjeta, sin riesgo.
                                   </p>
                                   <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
                                          <Link
                                                 href="/register"
                                                 className="relative group w-full sm:w-auto overflow-hidden rounded-2xl p-[1px]"
                                          >
                                                 {/* High-end button glow */}
                                                 <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-500 animate-gradient-xy" />
                                                 <div className="relative bg-slate-900 dark:bg-black text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3">
                                                        Comenzar Ahora
                                                        <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                                 </div>
                                          </Link>
                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola%2C%20quiero%20info%20sobre%20CourtOps"
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="group inline-flex items-center justify-center gap-2 bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-sm px-8 py-4 rounded-2xl hover:bg-white dark:hover:bg-white/5 backdrop-blur-md transition-all w-full sm:w-auto"
                                          >
                                                 O hablemos por WhatsApp
                                                 <ArrowRight size={18} className="opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                          </a>
                                   </div>
                            </div>
                     </div>

                     {/* Main Footer Grid */}
                     <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-8 relative z-10">
                            <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-14 mb-16">

                                   {/* Brand Column */}
                                   <div className="col-span-2 md:col-span-5 space-y-6 pr-0 md:pr-10">
                                          <Link href="/" className="inline-flex items-center gap-3 group">
                                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 group-hover:scale-105">
                                                        C
                                                 </div>
                                                 <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                                        Court<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Ops</span>
                                                 </span>
                                          </Link>
                                          <p className="text-base font-medium text-slate-600 dark:text-zinc-400 leading-relaxed">
                                                 Software de gestión todo en uno para dueños de clubes deportivos que buscan eficiencia operativa y excelencia en la experiencia del cliente.
                                          </p>
                                          <div className="flex items-center gap-3 pt-4">
                                                 <a
                                                        href="https://instagram.com/courtops.ok"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:scale-105 transition-all shadow-sm"
                                                        aria-label="Instagram de CourtOps"
                                                 >
                                                        <Instagram size={20} />
                                                 </a>
                                                 <a
                                                        href="mailto:soporte@courtops.com"
                                                        className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-teal-500 hover:border-teal-500/50 hover:bg-teal-500/5 hover:scale-105 transition-all shadow-sm"
                                                        aria-label="Email de soporte"
                                                 >
                                                        <Mail size={20} />
                                                 </a>
                                                 <a
                                                        href="https://wa.me/5493524421497"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-[#25D366] hover:border-[#25D366]/50 hover:bg-[#25D366]/5 hover:scale-105 transition-all shadow-sm"
                                                        aria-label="WhatsApp de CourtOps"
                                                 >
                                                        <Phone size={20} />
                                                 </a>
                                          </div>
                                   </div>

                                   {/* Product */}
                                   <div className="space-y-6 md:col-span-2">
                                          <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                                                 <span className="w-2 h-2 rounded-full bg-emerald-500" /> Producto
                                          </h3>
                                          <ul className="space-y-4">
                                                 <li><Link href="#features" className="text-base font-medium text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Características</Link></li>
                                                 <li><Link href="#pricing" className="text-base font-medium text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Precios</Link></li>
                                                 <li><Link href="/calculator" className="text-base font-medium text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Calculadora ROI</Link></li>
                                                 <li><Link href="#faq" className="text-base font-medium text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</Link></li>
                                          </ul>
                                   </div>

                                   {/* Legal */}
                                   <div className="space-y-6 md:col-span-2">
                                          <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                                                 <span className="w-2 h-2 rounded-full bg-teal-500" /> Legal
                                          </h3>
                                          <ul className="space-y-4">
                                                 <li><Link href="/legal/terms" className="text-base font-medium text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Términos del Servicio</Link></li>
                                                 <li><Link href="/legal/privacy" className="text-base font-medium text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacidad</Link></li>
                                          </ul>
                                   </div>

                                   {/* Contact */}
                                   <div className="space-y-6 col-span-2 md:col-span-3">
                                          <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                                                 <span className="w-2 h-2 rounded-full bg-blue-500" /> Contacto
                                          </h3>
                                          <ul className="space-y-5">
                                                 <li className="flex items-start gap-4 text-base font-medium text-slate-600 dark:text-zinc-400 group">
                                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                               <Phone size={16} />
                                                        </div>
                                                        <div className="pt-1">
                                                               <a href="https://wa.me/5493524421497" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                                                      +54 9 3524 42-1497
                                                               </a>
                                                        </div>
                                                 </li>
                                                 <li className="flex items-start gap-4 text-base font-medium text-slate-600 dark:text-zinc-400 group">
                                                        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                                               <Mail size={16} />
                                                        </div>
                                                        <div className="pt-1">
                                                               <a href="mailto:soporte@courtops.com" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                                                                      soporte@courtops.com
                                                               </a>
                                                        </div>
                                                 </li>
                                                 <li className="flex items-start gap-4 text-base font-medium text-slate-600 dark:text-zinc-400 group">
                                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                               <MapPin size={16} />
                                                        </div>
                                                        <div className="pt-1">
                                                               <span className="block">Córdoba, Argentina 🇦🇷</span>
                                                        </div>
                                                 </li>
                                          </ul>
                                   </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent mb-8" />

                            {/* Bottom Bar */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                   <div className="text-sm font-medium text-slate-500 dark:text-zinc-500">
                                          © {new Date().getFullYear()} CourtOps SaaS. Todos los derechos reservados.
                                   </div>
                                   <div className="flex items-center gap-6">
                                          <div className="flex items-center gap-2.5 text-xs uppercase tracking-widest font-black text-slate-500 dark:text-zinc-500 bg-slate-100 dark:bg-white/[0.03] px-4 py-2 rounded-lg border border-slate-200 dark:border-white/5 shadow-inner">
                                                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                                 Sistemas Operativos
                                          </div>
                                   </div>
                            </div>
                     </div>
              </footer>
       )
}
