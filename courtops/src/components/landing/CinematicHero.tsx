"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Check, Play } from "lucide-react"

const EASE = [0.19, 1, 0.22, 1] as const

const TRUST_ITEMS = ["Reservas", "Pagos", "Torneos", "WhatsApp", "Métricas"]

const VIDEO_SRC = "/landing/hero.mp4"
const POSTER_SRC = "/landing/hero-poster.png"

export default function CinematicHero() {
  const reducedMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mounted, setMounted] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  // El video se monta recién en el cliente: el SSR sirve solo el poster,
  // así el LCP es la imagen y el video nunca bloquea el primer render.
  useEffect(() => {
    setMounted(true)
  }, [])

  const { scrollY } = useScroll()
  const contentOpacity = useTransform(scrollY, [0, 480], [1, 0.1])
  const contentY = useTransform(scrollY, [0, 480], [0, -56])
  const mediaScale = useTransform(scrollY, [0, 900], [1, 1.14])

  const showVideo = mounted && !reducedMotion && !videoFailed

  return (
    <section className="sticky top-0 z-0 flex h-[100svh] flex-col overflow-hidden bg-[#040810] text-white">
      {/* ── Capa de medios ─────────────────────────────────────────── */}
      <motion.div className="absolute inset-0" style={{ scale: reducedMotion ? undefined : mediaScale }}>
        {/* Ken Burns: zoom lentísimo en loop sobre poster + video */}
        <motion.div
          className="absolute inset-0"
          animate={reducedMotion ? undefined : { scale: [1, 1.07] }}
          transition={
            reducedMotion
              ? undefined
              : { duration: 26, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
          }
        >
          <img
            src={POSTER_SRC}
            alt=""
            aria-hidden
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {showVideo && (
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                videoReady ? "opacity-100" : "opacity-0"
              }`}
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
            />
          )}
        </motion.div>

        {/* Overlays: legibilidad garantizada sin matar el video */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,8,16,0.18)_0%,rgba(4,8,16,0.62)_78%,rgba(4,8,16,0.85)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040810]/72 via-[#040810]/28 to-[#040810]" />
      </motion.div>

      {/* ── Contenido ──────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pb-12 pt-[calc(6.5rem+env(safe-area-inset-top))] md:px-10"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Badge — arriba a la izquierda */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="self-start"
        >
          <span className="inline-flex items-center gap-2.5 rounded-full border border-cyan-300/25 bg-white/[0.06] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>
            Sistema operativo para clubes de pádel
          </span>
        </motion.div>

        {/* Centro — titular + subtítulo + CTAs */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
            className="max-w-5xl text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl xl:text-[6.5rem]"
          >
            Manejá todo tu club
            <span className="block bg-gradient-to-r from-cyan-200 via-sky-300 to-cyan-200 bg-clip-text font-serif italic leading-[1.08] text-transparent">
              desde una sola plataforma.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.28, ease: EASE }}
            className="mt-7 max-w-[700px] text-pretty text-lg leading-8 text-zinc-300 md:text-xl"
          >
            Reservas, pagos, torneos, WhatsApp y la operación diaria del club, centralizados en un solo lugar y medidos en tiempo real.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.44, ease: EASE }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/register"
              className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-black text-zinc-950 shadow-[0_8px_40px_rgba(103,232,249,0.25)] transition hover:bg-cyan-100 hover:shadow-[0_8px_50px_rgba(103,232,249,0.4)] active:scale-[0.98]"
            >
              Reservar una demo
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#experiencia"
              className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.07] px-8 py-4 text-base font-bold text-white backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.12] active:scale-[0.98]"
            >
              <Play size={16} className="fill-current" />
              Ver el producto
            </a>
          </motion.div>

          {/* Indicadores de confianza — aparición escalonada */}
          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.65 } },
            }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
          >
            {TRUST_ITEMS.map((item) => (
              <motion.li
                key={item}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                }}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-300"
              >
                <Check size={15} className="text-cyan-300" strokeWidth={3} />
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Indicador de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex justify-center"
          aria-hidden
        >
          <div className="flex h-9 w-[22px] items-start justify-center rounded-full border border-white/25 p-1.5">
            <motion.span
              className="h-2 w-1 rounded-full bg-cyan-300"
              animate={reducedMotion ? undefined : { y: [0, 10, 0], opacity: [1, 0.2, 1] }}
              transition={reducedMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
