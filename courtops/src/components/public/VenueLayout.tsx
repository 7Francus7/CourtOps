'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  ArrowRight,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  Facebook,
  Info,
  Instagram,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Utensils,
  Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type VenueClub = {
  name: string
  amenities?: string | null
  coverUrl?: string | null
  logoUrl?: string | null
  subscriptionStatus?: string | null
  address?: string | null
  openTime?: string | null
  closeTime?: string | null
  description?: string | null
  phone?: string | null
  socialInstagram?: string | null
  socialFacebook?: string | null
}

type VenueBookingMeta = {
  firstAvailableTime?: string | null
  totalSlots?: number
  totalAvailableCourts?: number
  slotDuration?: number | null
  depositLabel?: string | null
  whatsappHref?: string | null
  trafficSource?: string | null
  isLoading?: boolean
}

interface VenueLayoutProps {
  club: VenueClub
  activeTab: 'booking' | 'info'
  setActiveTab: (_tab: 'booking' | 'info') => void
  children: React.ReactNode
  onBack?: () => void
  bookingMeta?: VenueBookingMeta
}

const amenityIcons: Record<string, React.ElementType> = {
  Bar: Utensils,
  Restaurante: Utensils,
  Buffet: Utensils,
  Kiosco: Utensils,
  Parrilla: Utensils,
  Quincho: DoorOpen,
  'Wi-Fi': Wifi,
  Estacionamiento: Car,
  Parking: Car,
  'Pro Shop': ShoppingBag,
  'Venta de Equipo': ShoppingBag,
  Vestuarios: DoorOpen,
  Duchas: MapPin,
  'Iluminacion LED': Info,
  'Canchas Panoramicas': MapPin,
  Gimnasio: Info,
  Seguridad: ShieldCheck,
  Climatizado: Info,
}

function getInstagramHandle(value?: string | null) {
  if (!value) return null
  return value
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
    .trim() || null
}

function getSocialHref(value?: string | null, base?: string) {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `${base}${value.replace(/^@/, '')}`
}

function getTrafficCopy(source?: string | null) {
  const normalized = source?.toLowerCase() || 'direct'

  if (normalized.includes('instagram')) {
    return {
      badge: 'Llegaste desde Instagram',
      title: 'Mira el club y pasa directo a los horarios reales',
      description: 'Todo esta pensado para que revises datos clave y reserves sin friccion desde el celular.',
    }
  }

  if (normalized.includes('whatsapp')) {
    return {
      badge: 'Llegaste desde WhatsApp',
      title: 'Segui desde aca y confirma tu turno sin vueltas',
      description: 'Tenes disponibilidad real, contacto directo y una reserva clara para cerrar rapido.',
    }
  }

  return {
    badge: 'Reserva oficial del club',
    title: 'Reserva tu cancha con una experiencia simple y confiable',
    description: 'Horarios reales, contacto visible y una portada clara para convertir mejor en mobile.',
  }
}

export default function VenueLayout({
  club,
  activeTab,
  setActiveTab,
  children,
  onBack,
  bookingMeta,
}: VenueLayoutProps) {
  const amenities = useMemo(
    () => (club.amenities ? club.amenities.split(',').map((item: string) => item.trim()).filter(Boolean) : []),
    [club.amenities]
  )
  const [shareCopied, setShareCopied] = useState(false)
  const [themeMounted, setThemeMounted] = useState(false)
  const [scrollToBooking, setScrollToBooking] = useState(false)
  const bookingAnchorRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme, setTheme } = useTheme()

  const trafficCopy = useMemo(() => getTrafficCopy(bookingMeta?.trafficSource), [bookingMeta?.trafficSource])
  const instagramHandle = useMemo(() => getInstagramHandle(club.socialInstagram), [club.socialInstagram])
  const instagramHref = useMemo(
    () => getSocialHref(instagramHandle, 'https://instagram.com/'),
    [instagramHandle]
  )
  const facebookHref = useMemo(
    () => getSocialHref(club.socialFacebook, 'https://facebook.com/'),
    [club.socialFacebook]
  )
  const mapsHref = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.address || club.name)}`,
    [club.address, club.name]
  )
  const bookingCtaLabel = bookingMeta?.isLoading
    ? 'Consultando horarios'
    : bookingMeta?.firstAvailableTime
      ? `Ver ${bookingMeta.firstAvailableTime} hs`
      : 'Ver horarios'
  const bookingCtaSummary = bookingMeta?.isLoading
    ? 'Estamos buscando disponibilidad del dia.'
    : (bookingMeta?.totalSlots || 0) > 0
      ? `${bookingMeta?.totalSlots} horario${bookingMeta?.totalSlots === 1 ? '' : 's'} online y ${bookingMeta?.totalAvailableCourts || 0} opcion${bookingMeta?.totalAvailableCourts === 1 ? '' : 'es'} para elegir.`
      : 'Revisa la disponibilidad actual o habla con el club si buscas una franja puntual.'
  const keyFacts = [
    {
      label: 'Ubicacion',
      value: club.address?.split(',')[0] || 'Consulta la direccion',
    },
    {
      label: 'Horarios',
      value: club.openTime && club.closeTime ? `${club.openTime} a ${club.closeTime}` : 'Todos los dias',
    },
    {
      label: 'Turnos',
      value: bookingMeta?.slotDuration ? `${bookingMeta.slotDuration} min por bloque` : 'Turnos online',
    },
    {
      label: 'Reserva',
      value: bookingMeta?.depositLabel || 'Confirmacion clara desde el celu',
    },
  ]

  useEffect(() => {
    setThemeMounted(true)
  }, [])

  useEffect(() => {
    if (activeTab !== 'booking' || !scrollToBooking) return

    const frame = window.requestAnimationFrame(() => {
      bookingAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setScrollToBooking(false)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeTab, scrollToBooking])

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: club.name,
          text: `Reserva tu cancha en ${club.name}`,
          url: window.location.href,
        })
        .catch(() => {})
      return
    }

    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 2000)
    })
  }

  const goToBooking = () => {
    setScrollToBooking(true)
    setActiveTab('booking')
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-slate-900 font-sans selection:bg-primary/20 dark:bg-zinc-950 dark:text-slate-100">
      <header className="sticky top-0 z-[70] flex min-h-14 items-center justify-between border-b border-slate-200/70 bg-white/82 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-2xl transition-colors duration-300 dark:border-white/[0.06] dark:bg-zinc-950/78">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 transition-all active:scale-95 dark:border-white/[0.07] dark:bg-white/[0.05]"
            >
              <ChevronLeft size={18} strokeWidth={2.5} className="text-slate-500 dark:text-white/70" />
            </button>
          )}
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
              Portada publica
            </p>
            <p className="truncate text-sm font-black text-slate-800 dark:text-white">{club.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-500 transition-all dark:border-white/[0.07] dark:bg-white/[0.05] dark:text-slate-400"
            aria-label="Cambiar tema"
          >
            {themeMounted ? (
              resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />
            ) : (
              <div className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-primary transition-all dark:border-white/[0.07] dark:bg-white/[0.05]"
            aria-label="Compartir"
          >
            {shareCopied ? <Check size={15} strokeWidth={3} className="text-primary" /> : <Share2 size={16} strokeWidth={2.5} />}
            {shareCopied && (
              <span className="absolute -bottom-7 right-0 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
                Copiado
              </span>
            )}
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden pb-6">
        <div className="absolute inset-x-0 top-0 h-[320px] overflow-hidden md:h-[380px]">
          <div className="absolute inset-0 bg-slate-950" />
          {club.coverUrl && (
            <img
              src={club.coverUrl}
              alt={club.name}
              className="absolute inset-0 h-full w-full scale-105 object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb,99,102,241),0.35),transparent_38%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-md px-4 pt-5">
          <div className="h-[220px] md:h-[280px]" />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative -mt-14 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/94 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/88"
          >
            <div className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-slate-200/70 blur-3xl dark:bg-white/[0.05]" />

            <div className="relative z-10 space-y-5 p-5">
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.08, type: 'spring', damping: 16 }}
                  className="shrink-0"
                >
                  <div className="h-[4.75rem] w-[4.75rem] rounded-[1.5rem] border border-white/30 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-zinc-900">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.15rem] bg-slate-950 dark:bg-zinc-900">
                      {club.logoUrl ? (
                        <>
                          <img
                            src={club.logoUrl}
                            alt={club.name}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                              event.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                          <span className="hidden text-2xl font-black text-primary">{club.name[0]}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-black text-primary">{club.name[0]}</span>
                      )}
                    </div>
                  </div>
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                      {trafficCopy.badge}
                    </span>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white dark:bg-white/[0.08]">
                      {club.subscriptionStatus === 'ACTIVE' ? 'Club verificado' : 'Reserva online'}
                    </span>
                  </div>
                  <h1 className="mt-3 text-[1.9rem] font-black tracking-tight text-slate-950 dark:text-white">
                    {club.name}
                  </h1>
                  <p className="mt-1 text-[15px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                    {trafficCopy.title}
                  </p>
                </div>
              </div>

              <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                {trafficCopy.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {keyFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/90 px-3.5 py-3 dark:border-white/[0.07] dark:bg-white/[0.04]"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                      {fact.label}
                    </p>
                    <p className="mt-1 text-[13px] font-black leading-snug text-slate-800 dark:text-slate-100">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.4rem] border border-primary/12 bg-primary/[0.05] p-3.5 dark:border-primary/15 dark:bg-primary/[0.08]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                      CTA principal
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                      {bookingCtaSummary}
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary shadow-sm dark:bg-zinc-900">
                    {bookingMeta?.slotDuration ? `${bookingMeta.slotDuration} min` : 'Mobile first'}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={goToBooking}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg transition-all active:scale-[0.98] dark:bg-primary dark:text-primary-foreground"
                  >
                    {bookingMeta?.isLoading ? 'Consultando' : bookingCtaLabel}
                    {!bookingMeta?.isLoading && <ArrowRight size={15} strokeWidth={3} />}
                  </button>

                  {bookingMeta?.whatsappHref ? (
                    <a
                      href={bookingMeta.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition-all active:scale-[0.98] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                    >
                      <MessageCircle size={15} />
                      WhatsApp
                    </a>
                  ) : (
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition-all active:scale-[0.98] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                    >
                      <MapPin size={15} />
                      Como llegar
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Disponibilidad real', 'Proceso simple', 'Contacto visible'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="sticky top-14 z-[60] border-b border-slate-200/80 bg-[#F6F7FB]/86 backdrop-blur-2xl dark:border-white/[0.06] dark:bg-zinc-950/84">
        <div className="mx-auto w-full max-w-md px-4 py-3">
          <div className="flex rounded-2xl bg-slate-200/60 p-1 dark:bg-white/[0.05]">
            <button
              onClick={() => setActiveTab('booking')}
              className={cn(
                'relative flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-[0.16em] transition-all',
                activeTab === 'booking'
                  ? 'bg-white text-primary shadow-sm dark:bg-zinc-900'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              Reservar
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                'relative flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-[0.16em] transition-all',
                activeTab === 'info'
                  ? 'bg-white text-primary shadow-sm dark:bg-zinc-900'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              Conocer el club
            </button>
          </div>
        </div>
      </div>

      <main
        className={cn(
          'mx-auto w-full max-w-md px-4 py-6',
          activeTab === 'info' ? 'pb-36' : 'pb-24'
        )}
      >
        {activeTab === 'booking' ? (
          <div ref={bookingAnchorRef} className="scroll-mt-32 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                    Transicion a reserva
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                    Entra, elige horario y confirma desde el celular.
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  3 pasos
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  '1. Fecha',
                  '2. Horario',
                  '3. Confirmacion',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {children}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                  Datos clave
                </h2>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-[0.16em] text-primary"
                >
                  Ver mapa
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {keyFacts.map((fact) => (
                  <div
                    key={`info-${fact.label}`}
                    className="rounded-[1.45rem] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                      {fact.label}
                    </p>
                    <p className="mt-2 text-sm font-black leading-snug text-slate-800 dark:text-white">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {club.description && (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                  <Info size={14} />
                  Sobre el club
                </h3>
                <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                    {club.description}
                  </p>
                </div>
              </section>
            )}

            {amenities.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                  Que vas a encontrar
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((item: string) => {
                    const Icon = amenityIcons[item] || ShieldCheck
                    return (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {instagramHref && instagramHandle && (
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-[2rem] bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] p-[1px] shadow-[0_20px_60px_rgba(225,48,108,0.18)]"
              >
                <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-zinc-950 p-5">
                  <div className="absolute inset-y-0 right-0 w-1/2">
                    {club.coverUrl ? (
                      <img
                        src={club.coverUrl}
                        alt={club.name}
                        className="h-full w-full object-cover opacity-30 transition-transform duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,#E1306C,transparent_55%)] opacity-40" />
                    )}
                  </div>

                  <div className="relative z-10 max-w-[78%]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
                        <Instagram size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">@{instagramHandle}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                          Instagram del club
                        </p>
                      </div>
                    </div>

                    <h3 className="mt-4 text-xl font-black tracking-tight text-white">
                      Refuerza la confianza antes de reservar
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
                      Si llegaste por una historia o un reel, desde aca puedes volver al perfil del club y ver el ambiente, novedades y comunidad.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {['Comunidad', 'Novedades', 'Ambiente real'].map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/75"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-950">
                      Abrir Instagram
                      <ChevronRight size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </a>
            )}

            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                Contacto
              </h3>

              <div className="space-y-3">
                {club.phone && (
                  <a
                    href={`tel:${club.phone}`}
                    className="flex items-center justify-between rounded-[1.6rem] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Telefono</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white">{club.phone}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </a>
                )}

                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-[1.6rem] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Direccion</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">
                        {club.address || 'Abrir ubicacion del club'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </a>

                {facebookHref && (
                  <a
                    href={facebookHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-[1.6rem] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/10">
                        <Facebook size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Facebook</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white">Abrir perfil del club</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </a>
                )}
              </div>
            </section>

            {(club.openTime || club.closeTime) && (
              <section className="relative overflow-hidden rounded-[2.25rem] border border-slate-700 bg-slate-900 p-6 shadow-2xl dark:border-white/[0.06] dark:bg-zinc-900">
                <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/18 blur-3xl" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Clock size={19} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Horarios</p>
                      <p className="text-xs font-bold text-white/45">Planea rapido antes de reservar</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Abre</p>
                      <p className="mt-1 text-3xl font-black tracking-tight text-white">
                        {club.openTime || '--:--'}
                      </p>
                    </div>
                    <div className="mb-2 h-px flex-1 bg-white/10" />
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">Cierra</p>
                      <p className="mt-1 text-3xl font-black tracking-tight text-white">
                        {club.closeTime || '--:--'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <button
              type="button"
              onClick={goToBooking}
              className="group relative w-full overflow-hidden rounded-[2rem] bg-primary px-5 py-4 text-left text-primary-foreground shadow-[0_18px_44px_hsl(var(--primary)/0.24)] transition-all active:scale-[0.98]"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-75">
                    Siguiente paso
                  </p>
                  <p className="mt-1 text-lg font-black tracking-tight">
                    Pasa a la agenda y elige el turno
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 transition-transform group-active:translate-x-1">
                  <ChevronRight size={20} strokeWidth={3} />
                </div>
              </div>
            </button>
          </div>
        )}
      </main>

      {activeTab === 'info' && (
        <div className="fixed inset-x-0 bottom-0 z-[65] px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="mx-auto max-w-md rounded-[1.75rem] border border-slate-200/80 bg-white/94 p-3 shadow-[0_26px_60px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/88">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                  Reserva online
                </p>
                <p className="truncate text-sm font-black text-slate-800 dark:text-white">
                  {bookingMeta?.firstAvailableTime
                    ? `Primer horario sugerido: ${bookingMeta.firstAvailableTime} hs`
                    : 'Mira disponibilidad y reserva desde el celular'}
                </p>
              </div>
              <button
                type="button"
                onClick={goToBooking}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all active:scale-[0.98] dark:bg-primary dark:text-primary-foreground"
              >
                Reservar
                <ArrowRight size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
