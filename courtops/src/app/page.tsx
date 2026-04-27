import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Newsreader, Nunito, Space_Grotesk } from "next/font/google"
import {
  ArrowRight,
  Banknote,
  BarChart3,
  CalendarCheck,
  Check,
  ChevronRight,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import CookieConsent from "@/components/CookieConsent"
import WhatsAppButton from "@/components/WhatsAppButton"
import MobileNavMenu from "@/components/landing/MobileNavMenu"

const fontSerif = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader" })
const fontSans = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })
const fontLogo = Nunito({ subsets: ["latin"], weight: ["400", "800"] })

export const dynamic = "force-dynamic"

const navLinks = [
  { href: "#experiencia", label: "Experiencia" },
  { href: "#operacion", label: "Operación" },
  { href: "#impacto", label: "Impacto" },
  { href: "#planes", label: "Planes" },
]

const liveRows = [
  { court: "Cancha 1", time: "18:00", client: "Seba + equipo", status: "Seña paga", tone: "emerald" },
  { court: "Cancha 2", time: "19:30", client: "Partido abierto", status: "2 cupos", tone: "cyan" },
  { court: "Cancha 3", time: "21:00", client: "Torneo mixto", status: "Confirmado", tone: "amber" },
]

const operatingFlow = [
  {
    title: "Reserva",
    text: "El jugador elige cancha, horario y método de pago desde el celular.",
    icon: Smartphone,
  },
  {
    title: "Recepción",
    text: "El staff ve estado, deuda, seña y cliente sin revisar chats.",
    icon: Users,
  },
  {
    title: "Caja",
    text: "Cada cobro entra al cierre diario con trazabilidad y responsable.",
    icon: Banknote,
  },
  {
    title: "Decisión",
    text: "Los dueños miran ocupación, ingresos y deudores en tiempo real.",
    icon: BarChart3,
  },
]

const features = [
  { title: "Turnero visual", text: "Disponibilidad, estados, precios y huecos de agenda en una grilla rápida.", icon: CalendarCheck },
  { title: "Caja diaria", text: "Apertura, movimientos, productos, alquileres y cierre sin planillas paralelas.", icon: ReceiptText },
  { title: "Clientes vivos", text: "Historial, deudas, membresías, referidos, asistencia y contactos centralizados.", icon: Users },
  { title: "WhatsApp y pagos", text: "Recordatorios, señas, links de pago y automatizaciones para bajar ausencias.", icon: MessageCircle },
  { title: "Torneos", text: "Inscripción pública, categorías, zonas, fixtures y gestión del evento.", icon: Trophy },
  { title: "Control seguro", text: "Roles, auditoría, multi-tenant y trazabilidad por usuario y club.", icon: ShieldCheck },
]

const metrics = [
  ["-42%", "mensajes repetidos para confirmar turnos"],
  ["+31%", "ocupación visible en horarios valle"],
  ["0", "cierres de caja sin responsable"],
  ["24/7", "reservas online con disponibilidad real"],
]

const plans = [
  {
    name: "Básico",
    price: "$45.000",
    text: "Para ordenar reservas, clientes y caja sin complejidad.",
    items: ["Hasta 4 canchas", "Turnero visual", "Caja diaria", "Clientes y deudas"],
    href: "/register?plan=basico",
  },
  {
    name: "Élite",
    price: "$85.000",
    text: "Para clubes con alto movimiento, cobros y operación diaria.",
    items: ["Canchas ilimitadas", "Kiosco POS", "WhatsApp", "Torneos y reportes"],
    href: "/register?plan=elite",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$150.000",
    text: "Para complejos con varias sedes o necesidades premium.",
    items: ["Multi-sucursal", "Academia", "Marca blanca", "Soporte prioritario"],
    href: "mailto:ventas@courtops.net",
  },
]

function CourtOpsMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" className={className} aria-hidden="true">
      <g transform="translate(5, 10)">
        <path d="M 25 5 A 15 15 0 1 0 25 35" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <circle cx="32" cy="20" r="12" fill="none" stroke="#00e676" strokeWidth="6" />
        <circle cx="32" cy="20" r="4" fill="currentColor" />
      </g>
    </svg>
  )
}

function CourtOpsLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="CourtOps">
      <CourtOpsMark className="h-11 w-11 shrink-0 text-zinc-950 dark:text-white" />
      <span className={`${fontLogo.className} text-[1.9rem] font-extrabold leading-none tracking-[-0.03em] text-zinc-950 dark:text-white`}>
        Court<span className="font-normal text-[#00e676]">Ops</span>
      </span>
    </span>
  )
}

function BookingBoard() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/12 bg-zinc-950/80 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-3 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Ahora en recepción</p>
          <h2 className="mt-1 text-xl font-bold text-white">Turnero del club</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-emerald-950">
          <span className="h-2 w-2 rounded-full bg-emerald-950" />
          Vivo
        </div>
      </div>

      <div className="grid grid-cols-[76px_1fr] gap-2 px-3 py-4 text-xs text-zinc-400">
        {["18:00", "19:30", "21:00", "22:30"].map((time) => (
          <div key={time} className="contents">
            <div className="py-4 font-mono">{time}</div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((court) => {
                const active = liveRows.find((row) => row.time === time && row.court === `Cancha ${court + 1}`)
                return (
                  <div
                    key={`${time}-${court}`}
                    className={`min-h-16 rounded-xl border p-3 ${
                      active
                        ? active.tone === "cyan"
                          ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-50"
                          : active.tone === "amber"
                            ? "border-amber-300/35 bg-amber-300/15 text-amber-50"
                            : "border-emerald-300/35 bg-emerald-300/15 text-emerald-50"
                        : "border-white/8 bg-white/[0.03]"
                    }`}
                  >
                    {active ? (
                      <>
                        <p className="text-[11px] font-black uppercase tracking-[0.12em]">{active.court}</p>
                        <p className="mt-2 text-sm font-bold leading-tight">{active.client}</p>
                        <p className="mt-2 text-[11px] text-white/70">{active.status}</p>
                      </>
                    ) : (
                      <span className="text-[11px] text-zinc-600">Libre</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-white/10 p-3">
        {[
          ["18", "turnos"],
          ["$312k", "caja"],
          ["7", "deudores"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl bg-white/[0.06] p-3">
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect("/dashboard")
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CourtOps",
    url: "https://courtops.net",
  }

  return (
    <div className={`${fontSans.variable} ${fontSerif.variable} min-h-screen bg-[#f4faf7] font-sans text-zinc-950 selection:bg-emerald-300/30 selection:text-zinc-950 dark:bg-[#07090b] dark:text-white dark:selection:text-white`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-zinc-950/10 bg-white/78 backdrop-blur-2xl dark:border-white/10 dark:bg-[#07090b]/72">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <Link href="/" className="flex items-center" aria-label="CourtOps">
            <CourtOpsLogo />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-semibold text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/8 dark:hover:text-white md:inline-flex">
              Iniciar sesión
            </Link>
            <Link href="/register" className="hidden items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-black text-emerald-950 transition hover:bg-emerald-200 md:inline-flex">
              Probar gratis
              <ArrowRight size={16} />
            </Link>
            <MobileNavMenu />
          </div>
        </div>
      </nav>

      <main>
        <section className="relative flex min-h-[100svh] items-end overflow-hidden px-5 pb-10 pt-28 md:px-10 md:pb-14">
          <img
            src="https://images.pexels.com/photos/32474981/pexels-photo-32474981.jpeg?auto=compress&cs=tinysrgb&w=2200"
            alt="Cancha de pádel indoor con piso azul"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,11,0.98)_0%,rgba(7,9,11,0.86)_44%,rgba(7,9,11,0.48)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#07090b] to-transparent" />

          <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-end gap-10 lg:grid-cols-[1fr_560px]">
            <div className="max-w-5xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                <Sparkles size={14} />
                SaaS operativo para clubes de pádel
              </div>
              <h1 className="max-w-6xl text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-6xl md:text-8xl xl:text-[8.5rem]">
                Que tu club se sienta
                <span className="block font-serif italic text-emerald-300">imposible de olvidar.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                Reservas, caja, clientes, pagos, torneos y reportes en una experiencia que ordena la recepción y hace que cada jugador vuelva.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-7 py-4 text-base font-black text-emerald-950 transition hover:bg-emerald-200">
                  Crear mi club
                  <ArrowRight size={19} />
                </Link>
                <a href="#experiencia" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/8 px-7 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/12">
                  Ver experiencia
                  <ChevronRight size={19} />
                </a>
              </div>
            </div>
            <BookingBoard />
          </div>
        </section>

        <section id="experiencia" className="border-y border-zinc-950/10 bg-white dark:border-white/10 dark:bg-[#0b1014]">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-zinc-950/10 dark:bg-white/10 md:grid-cols-4">
            {metrics.map(([value, label]) => (
              <div key={label} className="bg-white px-5 py-8 dark:bg-[#0b1014] md:px-8 md:py-10">
                <p className="text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-300 md:text-5xl">{value}</p>
                <p className="mt-3 max-w-52 text-sm font-semibold leading-6 text-zinc-600 dark:text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#f4faf7] px-5 py-20 dark:bg-[#07090b] md:px-10 md:py-32">
          <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="lg:sticky lg:top-28 lg:h-fit">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">Scroll que vende</p>
              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Cada sección muestra una parte real de la operación.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-700 dark:text-zinc-400">
                La landing no explica con humo: enseña cómo el club respira en hora pico, cómo cobra, cómo reduce errores y cómo ve el negocio completo.
              </p>
            </div>

            <div className="space-y-6">
              {operatingFlow.map((item, index) => (
                <div key={item.title} className="group grid gap-6 rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm transition hover:border-emerald-500/40 hover:bg-emerald-50/60 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:hover:border-emerald-300/40 dark:hover:bg-white/[0.06] md:grid-cols-[88px_1fr] md:p-8">
                  <div className="flex items-center gap-4 md:block">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-zinc-950 text-emerald-300 dark:bg-white dark:text-zinc-950">
                      <item.icon size={30} />
                    </div>
                    <span className="font-mono text-sm text-zinc-500">0{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-700 dark:text-zinc-400">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="operacion" className="overflow-hidden bg-[#e9f2ef] text-zinc-950">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:px-10 md:py-32 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">Operación premium</p>
              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                El sistema tiene que sentirse rápido antes de que el cliente pregunte.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
                Recepción necesita menos pasos, administración necesita menos dudas y los dueños necesitan ver números claros. CourtOps junta esas tres realidades.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-zinc-950/10 bg-white p-6 shadow-sm">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-zinc-950 text-emerald-300">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="impacto" className="relative overflow-hidden bg-[#eff7f3] px-5 py-20 dark:bg-[#080b0e] md:px-10 md:py-32">
          <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-white/10">
              <img
                src="https://images.pexels.com/photos/35248374/pexels-photo-35248374.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Jugadora de pádel preparando el saque"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">Experiencia del jugador</p>
                <h3 className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
                  Reservar tiene que sentirse tan simple como entrar a la cancha.
                </h3>
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200">Menos fricción</p>
              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Una landing que hace desear el producto, no solo entenderlo.
              </h2>
              <div className="mt-8 space-y-5">
                {[
                  "Visuales grandes desde el primer viewport.",
                  "Secciones con contraste para que el scroll no se sienta repetido.",
                  "Mockups funcionales que muestran turnero, caja y métricas sin depender de capturas viejas.",
                ].map((item) => (
                  <div key={item} className="flex gap-4 rounded-2xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                    <Check className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-300" size={22} />
                    <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="planes" className="bg-white px-5 py-20 text-zinc-950 md:px-10 md:py-32">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">Planes</p>
                <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">Arrancá simple. Escalá cuando el club lo pida.</h2>
              </div>
              <p className="max-w-md text-lg leading-8 text-zinc-600">7 días de prueba gratuita. Sin tarjeta de crédito en los planes de entrada.</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className={`rounded-2xl border p-6 md:p-8 ${plan.highlighted ? "border-zinc-950 bg-zinc-950 text-white shadow-2xl" : "border-zinc-200 bg-white text-zinc-950 shadow-sm"}`}>
                  {plan.highlighted && (
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-950">
                      <Zap size={14} />
                      Recomendado
                    </div>
                  )}
                  <h3 className="text-3xl font-black tracking-tight">{plan.name}</h3>
                  <p className={`mt-3 min-h-14 leading-7 ${plan.highlighted ? "text-zinc-300" : "text-zinc-600"}`}>{plan.text}</p>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                    <span className={plan.highlighted ? "mb-2 text-zinc-400" : "mb-2 text-zinc-500"}>/mes</span>
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <Check className="mt-0.5 shrink-0 text-emerald-500" size={20} />
                        <span className={plan.highlighted ? "text-zinc-200" : "text-zinc-700"}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={`mt-9 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-center font-black transition ${plan.highlighted ? "bg-emerald-300 text-emerald-950 hover:bg-emerald-200" : "bg-zinc-950 text-white hover:bg-zinc-800"}`}>
                    Elegir plan
                    <ArrowRight size={18} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-zinc-950 px-5 py-16 text-white dark:bg-[#07090b] md:px-10 md:py-24">
          <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">CourtOps</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Convertí tu club en una operación que se ve, se cobra y se controla.
              </h2>
            </div>
            <Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-black text-zinc-950 transition hover:bg-emerald-200">
              Empezar ahora
              <ArrowRight size={19} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-950/10 bg-white px-5 py-10 dark:border-white/10 dark:bg-[#07090b] md:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 text-sm text-zinc-600 dark:text-zinc-500 md:flex-row md:items-center">
          <div>
            <CourtOpsLogo />
            <p className="mt-2">Software de gestión para clubes deportivos.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/legal/privacy" className="transition hover:text-zinc-950 dark:hover:text-white">Privacidad</Link>
            <Link href="/legal/terms" className="transition hover:text-zinc-950 dark:hover:text-white">Términos</Link>
            <Link href="mailto:ventas@courtops.net" className="transition hover:text-zinc-950 dark:hover:text-white">Contacto</Link>
          </div>
          <p>© {new Date().getFullYear()} CourtOps.</p>
        </div>
      </footer>

      <CookieConsent />
      <WhatsAppButton />
    </div>
  )
}
