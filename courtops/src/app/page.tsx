import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Newsreader, Space_Grotesk } from "next/font/google"
import { ThemeToggle } from "@/components/ThemeToggle"
import CookieConsent from "@/components/CookieConsent"
import WhatsAppButton from "@/components/WhatsAppButton"
import PricingKinetic from "@/components/landing/PricingKinetic"
import MobileNavMenu from "@/components/landing/MobileNavMenu"

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
        <div className="relative flex justify-between items-center px-6 md:px-12 py-4 max-w-[1400px] mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-green-700 dark:text-[#72ff70] font-serif italic">CourtOps</div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#stats">Beneficios</a>
            <a className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#cimiento">Sistema</a>
            <a className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#inteligencia">Control</a>
            <a className="text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#pricing">Planes</a>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden md:inline-block px-6 py-2.5 bg-green-600 text-white dark:bg-[#72ff70] dark:text-[#006012] font-bold rounded-lg transition-all duration-300 ease-out active:scale-95 hover:bg-green-700 dark:hover:bg-[#72ff70]/90 border border-transparent shadow-md dark:shadow-[0_0_15px_rgba(114,255,112,0.2)]">
               Iniciar sesión
            </Link>
            <MobileNavMenu />
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] md:min-h-[92vh] flex items-center overflow-hidden px-6 md:px-12">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/80 to-transparent dark:from-[#0e0e10] dark:via-[#0e0e10]/80 dark:to-transparent z-10"></div>
            <img className="w-full h-full object-cover opacity-60 dark:opacity-40 select-none" alt="modern stadium" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy2QOZdE3Efok9smljAWUA4iETcCrd3cQsDU28tto5lwvejLbo0wrMk-akjrZBDGemJ3KiQHC7kcXfhpxAaH0SXBk8F1YOsQijYUp3Bi8XzJhQUdQZOQ-Lo_h7yYuCI94Lup4WPnCOSceDwi1DTkSeNCdU3_t6W5wm8r8oK2m_bYbwJfF69Czm9ZkB7uUgzqBFlZSJGTR9SJCopNVQ-uH0JZ5UAF2JAkLHWY-NPnFK1wDn3ih5p3yBURkSuTx-GYJ3cNTBBRqAYM8"/>
          </div>
          <div className="relative z-20 max-w-[1400px] mx-auto w-full">
            <div className="max-w-4xl">
              <span className="inline-block px-4 py-1.5 mb-6 bg-green-600/10 border border-green-600/20 text-green-700 dark:bg-[#72ff70]/10 dark:border-[#72ff70]/20 dark:text-[#72ff70] text-xs font-bold uppercase tracking-[0.2em] rounded-full">
                Gestión simple para clubes de pádel
              </span>
              <h1 className="text-[2.8rem] sm:text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-bold mb-6 md:mb-8 leading-[0.9] tracking-tighter text-zinc-900 dark:text-white">
                Reservas, caja <br/>
                <span className="italic font-serif text-green-600 dark:text-[#72ff70]">y clientes en orden</span>
              </h1>
              <p className="text-base md:text-xl lg:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-8 md:mb-12 font-light leading-relaxed">
                CourtOps centraliza turnos online, cobros, caja diaria, clientes y reportes para que tu club opere sin planillas ni mensajes perdidos.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/register" className="px-10 py-5 bg-green-600 text-white dark:bg-[#72ff70] dark:text-[#006012] font-bold rounded-xl text-lg transition-all dark:hover:shadow-[0_0_25px_rgba(114,255,112,0.4)] hover:scale-[1.02] active:scale-95 text-center">
                  Probar gratis
                </Link>
                <Link href="#cimiento" className="px-10 py-5 bg-white dark:bg-[#262528] text-green-700 dark:text-[#72ff70] border-2 border-green-600/20 dark:border-[#72ff70]/20 font-bold rounded-xl text-lg transition-all dark:hover:bg-[#72ff70]/5 hover:bg-green-50 active:scale-95 text-center shadow-sm">
                  Ver como funciona
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-16 md:py-24 border-y border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#131315]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16">
              <div className="flex flex-col">
                <span className="text-6xl font-bold text-green-600 dark:text-[#72ff70] mb-3">24/7</span>
                <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-[#adaaad]">Reservas online</span>
                <p className="mt-4 text-zinc-600 dark:text-zinc-500 text-base leading-relaxed">Tus jugadores reservan desde el celular y el club ve disponibilidad, pagos y estado del turno al instante.</p>
              </div>
              <div className="flex flex-col">
                <span className="text-6xl font-bold text-green-600 dark:text-[#72ff70] mb-3">100%</span>
                <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-[#adaaad]">Caja transparente</span>
                <p className="mt-4 text-zinc-600 dark:text-zinc-500 text-base leading-relaxed">Alquileres, señas, productos y movimientos quedan en un cierre diario claro para evitar diferencias.</p>
              </div>
              <div className="flex flex-col">
                <span className="text-6xl font-bold text-green-600 dark:text-[#72ff70] mb-3">1</span>
                <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-[#adaaad]">Panel operativo</span>
                <p className="mt-4 text-zinc-600 dark:text-zinc-500 text-base leading-relaxed">Recepción, administración y dueños trabajan sobre la misma información, también desde mobile.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cimientos Estructurales (Bento Grid) */}
        <section id="cimiento" className="py-16 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
          <div className="mb-10 md:mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter italic font-serif">Lo que ordena CourtOps</h2>
            <div className="h-1.5 w-32 bg-green-600 dark:bg-[#72ff70] rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
            <div className="lg:col-span-8 bg-zinc-100 dark:bg-[#1f1f22] rounded-3xl p-6 md:p-10 flex flex-col justify-end relative overflow-hidden group shadow-sm border border-zinc-200 dark:border-transparent">
              <img className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-30 group-hover:scale-105 transition-transform duration-700" alt="abstract architecture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASeG6d3vtF_kTa2LLLnksKEJ_lj1-eis6T1mqn8i5eU04Vorl7M4R5P0r-fru-jmWWE_L_zlaWyS8qORt1XM3Si9NL5DgDfTwD3zif5sOQ-N7ssEoib8fd56lhn2vMBL_S8tNONVVxvdaoqZz_rt5U9szfScT51Jsr0XlqSCV5wTqSgWXiUA5xGRohsWUi-Rxx1fKs0jmE1wLfPTDg7oBZhC2UFy5gOzwDhHKDRRbYlTo9aRqevI7qZLhxtItcxISqMWVs0rvjQE4"/>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-lg mb-6 text-green-600 dark:text-[#72ff70]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="text-4xl font-bold mb-4 tracking-tight">Grilla visual de reservas</h3>
                <p className="text-zinc-600 dark:text-[#adaaad] text-lg max-w-md">Agenda turnos, cambia estados, detecta huecos y aplica precios por cancha, horario o temporada sin depender de Excel.</p>
              </div>
            </div>
            <div className="lg:col-span-4 bg-green-600 dark:bg-[#72ff70] p-6 md:p-10 rounded-3xl flex flex-col justify-between text-white dark:text-[#006012] shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <div>
                <h3 className="text-3xl font-bold mb-4 italic font-serif">Kiosco y cobros</h3>
                <p className="text-green-50 dark:text-[#006012]/80 text-lg">Vende bebidas, paletas o productos de recepción y sincroniza cada cobro con la caja del día.</p>
              </div>
            </div>
            
            <div className="lg:col-span-4 bg-zinc-800 dark:bg-[#262528] text-white p-6 md:p-10 rounded-3xl border border-zinc-700 dark:border-white/5 flex flex-col justify-between shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 dark:text-[#72ff70]"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              <div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Roles y reportes</h3>
                <p className="text-zinc-400 text-base">Administra permisos para staff, revisa deudores y exporta resúmenes diarios para tomar decisiones con datos.</p>
              </div>
            </div>
            
            <div className="lg:col-span-8 bg-zinc-900 rounded-3xl p-1 shadow-2xl bg-gradient-to-br from-green-500/30 dark:from-[#72ff70]/20 to-transparent">
              <div className="bg-white dark:bg-[#19191c] rounded-[22px] h-full p-6 md:p-10 flex items-center justify-between">
                <div className="max-w-md">
                  <h3 className="text-3xl font-bold mb-4 italic font-serif text-zinc-900 dark:text-white">Señas, deudas y cancelaciones</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-lg">Integra MercadoPago, controla pagos pendientes y define reglas de cancelación para reducir ausencias de último minuto.</p>
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

        {/* Operational control */}
        <section id="inteligencia" className="py-16 md:py-32 bg-white dark:bg-[#0e0e10] border-t border-zinc-100 dark:border-zinc-800/30">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative z-10 rounded-[2rem] bg-zinc-950 p-5 shadow-2xl border border-zinc-800 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,197,94,0.28),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(114,255,112,0.18),transparent_28%)]" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-green-300">Hoy</p>
                      <h3 className="text-2xl font-bold">Panel del club</h3>
                    </div>
                    <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-black text-green-950">Online</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4 text-white">
                      <p className="text-xs text-zinc-400">Turnos</p>
                      <p className="text-3xl font-bold">18</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 text-white">
                      <p className="text-xs text-zinc-400">Caja</p>
                      <p className="text-3xl font-bold">$312k</p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-zinc-950">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-bold">Cancha 1</span>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Disponible</span>
                    </div>
                    <div className="space-y-2">
										{['18:00 Reserva confirmada', '19:30 Seña abonada', '21:00 Partido abierto'].map((item) => (
                        <div key={item} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700">{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-green-500/20 dark:bg-[#72ff70]/10 rounded-full blur-[60px] z-0 pointer-events-none"></div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 tracking-tighter leading-[1.1] italic font-serif">Control claro <br/> en horas pico</h2>
              <p className="text-base md:text-xl text-zinc-600 dark:text-[#adaaad] mb-8 md:mb-12 leading-relaxed">
                Cuando entran reservas, pagos y ventas al mismo tiempo, CourtOps mantiene todo visible: quién reservó, cuánto pagó, qué falta cobrar y qué caja queda abierta.
              </p>
              <ul className="space-y-8">
                <li className="flex items-start gap-5">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-[#72ff70]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                  <div>
                    <h4 className="font-bold text-2xl tracking-tight mb-2">Operación rápida</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">Carga reservas, cobra señas, vende productos y consulta disponibilidad desde una interfaz pensada para recepción.</p>
                  </div>
                </li>
                <li className="flex items-start gap-5">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-[#72ff70]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                  <div>
                    <h4 className="font-bold text-2xl tracking-tight mb-2">Información segura</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">Cada acción queda asociada al club y al usuario correcto para reducir errores, deudas perdidas y accesos indebidos.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-16 md:py-32 bg-zinc-50 dark:bg-[#131315] relative overflow-hidden border-y border-zinc-200 dark:border-transparent">
          <div className="absolute top-0 left-0 text-[20rem] md:text-[30rem] font-serif italic text-zinc-200 dark:text-white/[0.02] -translate-x-12 -translate-y-[20%] select-none pointer-events-none leading-none overflow-hidden">"</div>
          <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center relative z-10">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-green-600 dark:text-[#72ff70] mb-6 md:mb-8 block">Pensado para clubes reales</span>
            <blockquote className="text-2xl md:text-4xl lg:text-5xl font-serif italic mb-10 md:mb-16 leading-[1.2] text-zinc-800 dark:text-white">
              "Pasamos de anotar turnos por WhatsApp y controlar caja a mano, a tener reservas, cobros y deudores en un mismo lugar."
            </blockquote>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full mb-5 border-4 border-white dark:border-[#131315] shadow-[0_0_0_2px_rgba(34,197,94,1)] dark:shadow-[0_0_0_2px_rgba(114,255,112,1)] bg-zinc-900 text-green-300 flex items-center justify-center font-black tracking-tight">
                CO
              </div>
              <span className="font-bold text-xl text-zinc-900 dark:text-white">Club demo de pádel</span>
              <span className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Operación diaria, reservas y caja</span>
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
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Software de gestión para clubes</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mb-8 md:mb-0">
            <Link className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-[#72ff70] transition-colors" href="/legal/privacy">Privacidad</Link>
            <Link className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-[#72ff70] transition-colors" href="/legal/terms">Términos</Link>
            <Link className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 hover:text-green-600 dark:hover:text-[#72ff70] transition-colors" href="/legal/terms">Contacto</Link>
          </div>
          <div className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-widest text-center md:text-right">
            © {new Date().getFullYear()} CourtOps. Gestión centralizada.
          </div>
        </div>
      </footer>
      <CookieConsent />
      <WhatsAppButton />
    </div>
  )
}
