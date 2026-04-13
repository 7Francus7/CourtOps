import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Newsreader, Space_Grotesk } from "next/font/google"
import { ThemeToggle } from "@/components/ThemeToggle"
import CookieConsent from "@/components/CookieConsent"
import WhatsAppButton from "@/components/WhatsAppButton"
import PricingKinetic from "@/components/landing/PricingKinetic"

const fontSerif = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-newsreader' })
const fontSans = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect('/dashboard')
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CourtOps',
    url: 'https://courtops.net',
  }

  return (
    <div className={`min-h-screen ${fontSans.variable} ${fontSerif.variable} font-sans transition-colors duration-300 bg-zinc-50 text-zinc-900 dark:bg-[#0e0e10] dark:text-[#f9f5f8] selection:bg-green-600/20 selection:text-green-700 dark:selection:bg-[#72ff70]/20 dark:selection:text-[#72ff70]`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-b border-zinc-200 dark:border-zinc-800/30">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-[1400px] mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-green-700 dark:text-[#72ff70] font-serif italic">CourtOps</div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#stats">Velocidad</a>
            <a className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#cimiento">Táctica</a>
            <a className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#inteligencia">Inteligencia</a>
            <a className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#pricing">Planes</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline-block px-6 py-2.5 bg-green-600 text-white dark:bg-[#72ff70] dark:text-[#006012] font-bold rounded-lg transition-all duration-300 ease-out active:scale-95 hover:bg-green-700 dark:hover:bg-[#72ff70]/90 border border-transparent shadow-md dark:shadow-[0_0_15px_rgba(114,255,112,0.2)]">
               Acceso Sistema
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[92vh] flex items-center overflow-hidden px-6 md:px-12">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/80 to-transparent dark:from-[#0e0e10] dark:via-[#0e0e10]/80 dark:to-transparent z-10"></div>
            <img className="w-full h-full object-cover opacity-60 dark:opacity-40 select-none" alt="modern stadium" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy2QOZdE3Efok9smljAWUA4iETcCrd3cQsDU28tto5lwvejLbo0wrMk-akjrZBDGemJ3KiQHC7kcXfhpxAaH0SXBk8F1YOsQijYUp3Bi8XzJhQUdQZOQ-Lo_h7yYuCI94Lup4WPnCOSceDwi1DTkSeNCdU3_t6W5wm8r8oK2m_bYbwJfF69Czm9ZkB7uUgzqBFlZSJGTR9SJCopNVQ-uH0JZ5UAF2JAkLHWY-NPnFK1wDn3ih5p3yBURkSuTx-GYJ3cNTBBRqAYM8"/>
          </div>
          <div className="relative z-20 max-w-[1400px] mx-auto w-full">
            <div className="max-w-4xl">
              <span className="inline-block px-4 py-1.5 mb-6 bg-green-600/10 border border-green-600/20 text-green-700 dark:bg-[#72ff70]/10 dark:border-[#72ff70]/20 dark:text-[#72ff70] text-xs font-bold uppercase tracking-[0.2em] rounded-full">
                Manifiesto Kinético
              </span>
              <h1 className="text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-bold mb-8 leading-[0.9] tracking-tighter text-zinc-900 dark:text-white">
                La Arquitectura <br/>
                <span className="italic font-serif text-green-600 dark:text-[#72ff70]">de la Velocidad</span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12 font-light leading-relaxed">
                Sistemas de alto rendimiento diseñados para la élite deportiva. Transformamos el caos del club en control táctico definitivo.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/login?tab=register" className="px-10 py-5 bg-green-600 text-white dark:bg-[#72ff70] dark:text-[#006012] font-bold rounded-xl text-lg transition-all dark:hover:shadow-[0_0_25px_rgba(114,255,112,0.4)] hover:scale-[1.02] active:scale-95 text-center">
                  Solicitar Acceso
                </Link>
                <Link href="#cimiento" className="px-10 py-5 bg-white dark:bg-[#262528] text-green-700 dark:text-[#72ff70] border-2 border-green-600/20 dark:border-[#72ff70]/20 font-bold rounded-xl text-lg transition-all dark:hover:bg-[#72ff70]/5 hover:bg-green-50 active:scale-95 text-center shadow-sm">
                  Explorar Sistema
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-24 border-y border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#131315]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="flex flex-col">
                <span className="text-6xl font-bold text-green-600 dark:text-[#72ff70] mb-3">#1</span>
                <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-[#adaaad]">Gestión Simplificada</span>
                <p className="mt-4 text-zinc-600 dark:text-zinc-500 text-base leading-relaxed">Turnos online, kiosco POS y cobros en un solo ecosistema optimizado para canchas deportivas.</p>
              </div>
              <div className="flex flex-col">
                <span className="text-6xl font-bold text-green-600 dark:text-[#72ff70] mb-3">100%</span>
                <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-[#adaaad]">Transparencia de Caja</span>
                <p className="mt-4 text-zinc-600 dark:text-zinc-500 text-base leading-relaxed">Cierres diarios perfectos donde alquileres y bebidas se cruzan sin error y en tiempo real.</p>
              </div>
              <div className="flex flex-col">
                <span className="text-6xl font-bold text-green-600 dark:text-[#72ff70] mb-3">&lt; 3</span>
                <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-[#adaaad]">Clics por Operación</span>
                <p className="mt-4 text-zinc-600 dark:text-zinc-500 text-base leading-relaxed">Infraestructura mobile-first y arquitectura de alta velocidad para operar eficientemente bajo máxima presión.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cimientos Estructurales (Bento Grid) */}
        <section id="cimiento" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter italic font-serif">Cimientos Estructurales</h2>
            <div className="h-1.5 w-32 bg-green-600 dark:bg-[#72ff70] rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
            <div className="lg:col-span-8 bg-zinc-100 dark:bg-[#1f1f22] rounded-3xl p-10 flex flex-col justify-end relative overflow-hidden group shadow-sm border border-zinc-200 dark:border-transparent">
              <img className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-30 group-hover:scale-105 transition-transform duration-700" alt="abstract architecture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASeG6d3vtF_kTa2LLLnksKEJ_lj1-eis6T1mqn8i5eU04Vorl7M4R5P0r-fru-jmWWE_L_zlaWyS8qORt1XM3Si9NL5DgDfTwD3zif5sOQ-N7ssEoib8fd56lhn2vMBL_S8tNONVVxvdaoqZz_rt5U9szfScT51Jsr0XlqSCV5wTqSgWXiUA5xGRohsWUi-Rxx1fKs0jmE1wLfPTDg7oBZhC2UFy5gOzwDhHKDRRbYlTo9aRqevI7qZLhxtItcxISqMWVs0rvjQE4"/>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-lg mb-6 text-green-600 dark:text-[#72ff70]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="text-4xl font-bold mb-4 tracking-tight">Motor Quirúrgico de Reservas</h3>
                <p className="text-zinc-600 dark:text-[#adaaad] text-lg max-w-md">Grilla visual de última generación. Establece reglas de precios dinámicas por temporada o cortes de luz sin fricción.</p>
              </div>
            </div>
            <div className="lg:col-span-4 bg-green-600 dark:bg-[#72ff70] p-10 rounded-3xl flex flex-col justify-between text-white dark:text-[#006012] shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <div>
                <h3 className="text-3xl font-bold mb-4 italic font-serif">Kiosco POS Unificado</h3>
                <p className="text-green-50 dark:text-[#006012]/80 text-lg">Facturación de alquileres, cobro de señas y venta de productos, sincronizados en un solo cierre monetario.</p>
              </div>
            </div>
            
            <div className="lg:col-span-4 bg-zinc-800 dark:bg-[#262528] text-white p-10 rounded-3xl border border-zinc-700 dark:border-white/5 flex flex-col justify-between shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 dark:text-[#72ff70]"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              <div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Inteligencia Global</h3>
                <p className="text-zinc-400 text-base">Terminales de recepción sincronizados bajo roles de administrador, staff y dueños con resúmenes diarios exportables.</p>
              </div>
            </div>
            
            <div className="lg:col-span-8 bg-zinc-900 rounded-3xl p-1 shadow-2xl bg-gradient-to-br from-green-500/30 dark:from-[#72ff70]/20 to-transparent">
              <div className="bg-white dark:bg-[#19191c] rounded-[22px] h-full p-10 flex items-center justify-between">
                <div className="max-w-md">
                  <h3 className="text-3xl font-bold mb-4 italic font-serif text-zinc-900 dark:text-white">Pagos & Regla 6H</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-lg">Señas mediante MercadoPago, reportes de deudores y un sistema blindado que evita cancelaciones de último minuto por parte del jugador.</p>
                </div>
                <div className="hidden sm:flex items-center justify-center p-8">
                  <div className="w-32 h-32 rounded-full border-4 border-green-600/20 dark:border-[#72ff70]/20 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-green-500 dark:border-[#72ff70]/50 animate-pulse bg-green-50 dark:bg-transparent shadow-[0_0_30px_rgba(34,197,94,0.3)] dark:shadow-[0_0_30px_rgba(114,255,112,0.3)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Controla el Caos */}
        <section id="inteligencia" className="py-32 bg-white dark:bg-[#0e0e10] border-t border-zinc-100 dark:border-zinc-800/30">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square bg-zinc-100 dark:bg-[#262528] rounded-full overflow-hidden border-[12px] border-white dark:border-[#19191c] shadow-2xl relative z-10">
                <img className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700" alt="athlete intense gaze" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl2l-iopMZx7cgMRd9cU1vP-Tg03jMwG89hEHS8Jis24cwbKwSCZffKfAyeEw4l9oOUOcV4AZS2kH-mq4b7Bc1wvTLWxgV7Z7XfWM2C8ez0ICAFMHpqi1FNVbnit1H_tBeOpLmQUtuoslZiGLX_HRTX1UuQZEz5AmC49KtcNtAYIUmRw4NrhUBWsSobUyYrMXQeCfCOykHAIhurx0KnyexehkcBFuyXM0czxDToKYbq8ezhssroZDXygZ1N_-DSf8gIcP8u54nIEE"/>
              </div>
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-green-500/20 dark:bg-[#72ff70]/10 rounded-full blur-[60px] z-0 pointer-events-none"></div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter leading-[1.1] italic font-serif">Controla el Caos <br/> en Alta Frecuencia</h2>
              <p className="text-xl text-zinc-600 dark:text-[#adaaad] mb-12 leading-relaxed">
                Durante las horas pico, la claridad no es un lujo, es tu única defensa. CourtOps digiere flujos densos de concurrencia y pagos para entregarte un tablero de mandos incuestionable.
              </p>
              <ul className="space-y-8">
                <li className="flex items-start gap-5">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-[#72ff70]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                  <div>
                    <h4 className="font-bold text-2xl tracking-tight mb-2">Respuesta Neural</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">Carga de reservas, cierre de turnos y venta de artículos ejecutados a la velocidad del pensamiento.</p>
                  </div>
                </li>
                <li className="flex items-start gap-5">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-[#72ff70]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                  <div>
                    <h4 className="font-bold text-2xl tracking-tight mb-2">Protocolos Blindados</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">Información transaccional fortificada. Evita fugas financieras y mantén la bóveda sellada.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-32 bg-zinc-50 dark:bg-[#131315] relative overflow-hidden border-y border-zinc-200 dark:border-transparent">
          <div className="absolute top-0 left-0 text-[30rem] font-serif italic text-zinc-200 dark:text-white/[0.02] -translate-x-12 -translate-y-[20%] select-none pointer-events-none leading-none">"</div>
          <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center relative z-10">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-600 dark:text-[#72ff70] mb-8 block">Reportes desde el Frente</span>
            <blockquote className="text-3xl md:text-5xl lg:text-6xl font-serif italic mb-16 leading-[1.2] text-zinc-800 dark:text-white">
              "CourtOps destriza la fricción operativa. Reemplaza el caos intermitente con precisión implacable, convirtiendo a nuestro complejo en una máquina que nunca duerme."
            </blockquote>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-5 border-4 border-white dark:border-[#131315] shadow-[0_0_0_2px_rgba(34,197,94,1)] dark:shadow-[0_0_0_2px_rgba(114,255,112,1)]">
                <img className="w-full h-full object-cover" alt="sports director" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIzOkq43u4Fr6RSzLBI0h4K4GhqQ3O7VIGMMu2x4qop_GFCbL0K29RNctWbb5T5qf8B4IrY3To7SoD88NDiT1SAb3pNpB3V3vFghhcg4R0kjT8v50JZ9fQaXQrRXNknlmB9lbxaC9FUoxCDYr_nSZA3jtTUOvierUXvtOxL360W4mhSjPUHLJcLQ6XIiPqgVA5BdekdGUGz98UFDhcZcrIYqXDiHYXLjQ_I9n1O7TaQaujSs5MLW1zPpQQ5R9XRB6T6hR4Ou0U4lE"/>
              </div>
              <span className="font-bold text-xl text-zinc-900 dark:text-white">Julian Vance</span>
              <span className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Director Técnico de Elite Global</span>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingKinetic />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 w-full border-t border-zinc-200 dark:border-zinc-800/30">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-12 w-full max-w-[1400px] mx-auto">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <span className="text-2xl font-serif italic text-zinc-900 dark:text-zinc-100 block mb-2">CourtOps</span>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Tecnología Militar para Clubes</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-8 md:mb-0">
            <Link className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-[#72ff70] transition-colors" href="/legal/privacy">Intel Privada</Link>
            <Link className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-[#72ff70] transition-colors" href="/legal/terms">Reglas del Ring</Link>
            <Link className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-[#72ff70] transition-colors" href="/legal/terms">Contacto</Link>
          </div>
          <div className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-widest text-center md:text-right">
            © {new Date().getFullYear()} CourtOps. Comando Central.
          </div>
        </div>
      </footer>
      <CookieConsent />
      <WhatsAppButton />
    </div>
  )
}
