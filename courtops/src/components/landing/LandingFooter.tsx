
import React from 'react'
import Link from 'next/link'

export default function LandingFooter() {
       return (
              <footer className="py-12 px-6 border-t border-white/10 bg-[#0a0a0a] text-zinc-400" id="faq">
                     <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

                            <div className="text-center md:text-left">
                                   <h2 className="text-2xl font-black mb-2 tracking-tighter text-white">
                                          COURT<span className="text-emerald-500">OPS</span>
                                   </h2>
                                   <p className="text-sm font-medium opacity-70 max-w-xs">
                                          Software de gestión para clubes deportivos. <br />Diseñado por dueños, para dueños.
                                   </p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 text-sm text-muted-foreground font-medium">
                                   <Link href="/legal/terms" className="hover:text-foreground transition-colors">Términos y Condiciones</Link>
                                   <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Política de Privacidad</Link>
                                   <a href="mailto:soporte@courtops.com" className="hover:text-foreground transition-colors">Soporte</a>
                            </div>

                            <div className="text-xs text-muted-foreground/50">
                                   © {new Date().getFullYear()} CourtOps SaaS. Todos los derechos reservados.
                            </div>
                     </div>
              </footer>
       )
}
