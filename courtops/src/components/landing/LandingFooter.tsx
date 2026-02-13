
import React from 'react'
import Link from 'next/link'

export default function LandingFooter() {
       return (
              <footer className="py-12 px-6 border-t border-slate-200 bg-slate-50 text-slate-500" id="faq">
                     <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

                            <div className="text-center md:text-left">
                                   <h2 className="text-2xl font-black mb-2 tracking-tighter text-slate-900">
                                          COURT<span className="text-emerald-600">OPS</span>
                                   </h2>
                                   <p className="text-sm font-medium opacity-70 max-w-xs text-slate-600">
                                          Software de gestión para clubes deportivos. <br />Diseñado por dueños, para dueños.
                                   </p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 text-sm font-medium text-slate-600">
                                   <Link href="/legal/terms" className="hover:text-emerald-600 transition-colors">Términos y Condiciones</Link>
                                   <Link href="/legal/privacy" className="hover:text-emerald-600 transition-colors">Política de Privacidad</Link>
                                   <a href="mailto:soporte@courtops.com" className="hover:text-emerald-600 transition-colors">Soporte</a>
                            </div>

                            <div className="text-xs text-slate-400">
                                   © {new Date().getFullYear()} CourtOps SaaS. Todos los derechos reservados.
                            </div>
                     </div>
              </footer>
       )
}
