'use client'

/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, MessageCircle, RefreshCw, Share2, Sparkles, X, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'

interface FlyerGeneratorProps {
    isOpen: boolean
    onClose: () => void
    slotTime: string
    courtName: string
    clubName: string
    logoUrl?: string | null
    clubSlug?: string
}

type PackId = 'photo-premium' | 'editorial-clean' | 'sport-performance' | 'club-identity'

type ThemeId =
    | 'midnight-photo'
    | 'courtside-luxe'
    | 'sunset-editorial'
    | 'matchday-collage'
    | 'club-minimal'
    | 'poster-split'
    | 'linen-card'
    | 'glass-night'
    | 'scoreboard'
    | 'baseline-energy'
    | 'court-blueprint'
    | 'neon-grid'

interface VisualPack {
    id: PackId
    label: string
    desc: string
}

interface ThemeOption {
    id: ThemeId
    packId: PackId
    label: string
    desc: string
    accent: string
    chip: string
    preview: string
    usesPhoto?: boolean
}

type FlyerCanvasProps = Omit<FlyerGeneratorProps, 'isOpen' | 'onClose'> & {
    bgUrl: string
    storyUrl: string | null
}

const STORY_WIDTH = 270
const STORY_HEIGHT = 480
const IMAGE_PRELOAD_TIMEOUT_MS = 5000

function waitForImageLoad(img: HTMLImageElement, timeoutMs = IMAGE_PRELOAD_TIMEOUT_MS): Promise<void> {
    if (img.complete) return Promise.resolve()

    return new Promise((resolve) => {
        let settled = false
        let timeoutId: number | null = null

        const finish = () => {
            if (settled) return
            settled = true
            if (timeoutId !== null) window.clearTimeout(timeoutId)
            img.removeEventListener('load', finish)
            img.removeEventListener('error', finish)
            resolve()
        }

        timeoutId = window.setTimeout(finish, timeoutMs)
        img.addEventListener('load', finish, { once: true })
        img.addEventListener('error', finish, { once: true })
    })
}

const VISUAL_PACKS: VisualPack[] = [
    {
        id: 'photo-premium',
        label: 'Foto premium',
        desc: 'Historias hero con cancha real, profundidad y look mas aspiracional.',
    },
    {
        id: 'editorial-clean',
        label: 'Editorial clean',
        desc: 'Layouts sobrios, premium y faciles de publicar sin verse genericos.',
    },
    {
        id: 'sport-performance',
        label: 'Sport performance',
        desc: 'Mas energia, mas contraste y piezas que empujan accion inmediata.',
    },
    {
        id: 'club-identity',
        label: 'Club identity',
        desc: 'Modelos con lenguaje visual propio para que el club se vea mas marca.',
    },
]

const THEMES: ThemeOption[] = [
    {
        id: 'midnight-photo',
        packId: 'photo-premium',
        label: 'Midnight Hero',
        desc: 'Foto nocturna con foco en el horario y CTA limpio.',
        accent: '#49e3d2',
        chip: 'Hero',
        preview: 'linear-gradient(135deg, #0a1420 0%, #0e2232 48%, #49e3d2 140%)',
        usesPhoto: true,
    },
    {
        id: 'courtside-luxe',
        packId: 'photo-premium',
        label: 'Courtside Luxe',
        desc: 'Panel alto impacto con recorte premium y detalles de producto.',
        accent: '#7ef5c4',
        chip: 'Luxe',
        preview: 'linear-gradient(135deg, #07120d 0%, #113326 42%, #7ef5c4 150%)',
        usesPhoto: true,
    },
    {
        id: 'sunset-editorial',
        packId: 'photo-premium',
        label: 'Sunset',
        desc: 'Mas calido y aspiracional, con sensacion de club cuidado.',
        accent: '#ffb36b',
        chip: 'Warm',
        preview: 'linear-gradient(135deg, #1a100a 0%, #754220 52%, #ffb36b 145%)',
        usesPhoto: true,
    },
    {
        id: 'matchday-collage',
        packId: 'photo-premium',
        label: 'Matchday Collage',
        desc: 'Composicion con dos recortes y look de story curada a mano.',
        accent: '#1f9dff',
        chip: 'Photo',
        preview: 'linear-gradient(135deg, #0f1d2c 0%, #d6dedf 52%, #1f9dff 145%)',
        usesPhoto: true,
    },
    {
        id: 'club-minimal',
        packId: 'editorial-clean',
        label: 'Studio',
        desc: 'Editorial claro, premium y muy facil de usar para todo club.',
        accent: '#ff7a00',
        chip: 'Clean',
        preview: 'linear-gradient(135deg, #f6efe7 0%, #ffffff 58%, #ff7a00 170%)',
        usesPhoto: true,
    },
    {
        id: 'poster-split',
        packId: 'editorial-clean',
        label: 'Poster Split',
        desc: 'Composicion de poster con bloque editorial y tira fotografica.',
        accent: '#86b6ff',
        chip: 'Poster',
        preview: 'linear-gradient(135deg, #08131f 0%, #132338 52%, #86b6ff 160%)',
        usesPhoto: true,
    },
    {
        id: 'linen-card',
        packId: 'editorial-clean',
        label: 'Linen Card',
        desc: 'Paleta piedra y panel central refinado, listo para publicar.',
        accent: '#2a9d8f',
        chip: 'Soft',
        preview: 'linear-gradient(135deg, #ede4d6 0%, #f8f4ed 56%, #2a9d8f 155%)',
        usesPhoto: true,
    },
    {
        id: 'glass-night',
        packId: 'sport-performance',
        label: 'Glass Night',
        desc: 'Oscuro, nitido y con mucho contraste para vender urgencia.',
        accent: '#73c7ff',
        chip: 'Glass',
        preview: 'linear-gradient(135deg, #06111b 0%, #102235 46%, #73c7ff 155%)',
        usesPhoto: true,
    },
    {
        id: 'scoreboard',
        packId: 'sport-performance',
        label: 'Score',
        desc: 'Inspirado en tableros deportivos, directo y funcional.',
        accent: '#c6ff4d',
        chip: 'Sport',
        preview: 'linear-gradient(135deg, #070d07 0%, #1a260a 48%, #c6ff4d 165%)',
    },
    {
        id: 'baseline-energy',
        packId: 'sport-performance',
        label: 'Baseline',
        desc: 'Mas tension visual, diagonales y ritmo para destacar la accion.',
        accent: '#19e0ff',
        chip: 'Fast',
        preview: 'linear-gradient(135deg, #06111a 0%, #0d2540 46%, #19e0ff 165%)',
        usesPhoto: true,
    },
    {
        id: 'court-blueprint',
        packId: 'club-identity',
        label: 'Blueprint',
        desc: 'Geometria de cancha y lenguaje mas propio del club.',
        accent: '#69f0d1',
        chip: 'Grid',
        preview: 'linear-gradient(135deg, #04131a 0%, #0b2634 48%, #69f0d1 165%)',
    },
    {
        id: 'neon-grid',
        packId: 'club-identity',
        label: 'Neon Grid',
        desc: 'Identidad mas marca con reticula, foco y photo cut premium.',
        accent: '#ff68c7',
        chip: 'Brand',
        preview: 'linear-gradient(135deg, #11111b 0%, #25143a 48%, #ff68c7 165%)',
        usesPhoto: true,
    },
]

const COURT_PATTERN = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="270" height="480" viewBox="0 0 270 480" fill="none">
  <rect x="18" y="18" width="234" height="444" rx="22" stroke="rgba(105,240,209,0.22)" stroke-width="1.5"/>
  <rect x="50" y="72" width="170" height="336" rx="12" stroke="rgba(105,240,209,0.14)" stroke-width="1.5"/>
  <line x1="135" y1="72" x2="135" y2="408" stroke="rgba(105,240,209,0.12)" stroke-width="1.5"/>
  <line x1="50" y1="240" x2="220" y2="240" stroke="rgba(105,240,209,0.12)" stroke-width="1.5"/>
  <line x1="18" y1="40" x2="252" y2="40" stroke="rgba(105,240,209,0.08)" stroke-width="1.5"/>
  <line x1="18" y1="440" x2="252" y2="440" stroke="rgba(105,240,209,0.08)" stroke-width="1.5"/>
  <circle cx="135" cy="240" r="30" stroke="rgba(105,240,209,0.12)" stroke-width="1.5" fill="none"/>
</svg>
`)}` 

const NET_PATTERN = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none">
  <path d="M0 20H120M0 60H120M0 100H120M20 0V120M60 0V120M100 0V120" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
</svg>
`)}` 

const DOT_PATTERN = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
  <circle cx="12" cy="12" r="1.8" fill="rgba(255,255,255,0.18)"/>
  <circle cx="52" cy="32" r="1.8" fill="rgba(255,255,255,0.18)"/>
  <circle cx="92" cy="14" r="1.8" fill="rgba(255,255,255,0.18)"/>
  <circle cx="132" cy="40" r="1.8" fill="rgba(255,255,255,0.18)"/>
  <circle cx="24" cy="74" r="1.8" fill="rgba(255,255,255,0.18)"/>
  <circle cx="74" cy="92" r="1.8" fill="rgba(255,255,255,0.18)"/>
  <circle cx="122" cy="78" r="1.8" fill="rgba(255,255,255,0.18)"/>
  <circle cx="34" cy="132" r="1.8" fill="rgba(255,255,255,0.18)"/>
  <circle cx="96" cy="124" r="1.8" fill="rgba(255,255,255,0.18)"/>
  <circle cx="140" cy="142" r="1.8" fill="rgba(255,255,255,0.18)"/>
</svg>
`)}` 

function toAbsoluteUrl(url: string): string {
    if (!url) return url
    if (url.startsWith('data:') || url.startsWith('http')) return url
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
}

function getClubInitial(clubName: string): string {
    return clubName.trim().charAt(0).toUpperCase() || 'C'
}

function getSafeFilename(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function getStoryUrl(clubSlug?: string): string | null {
    return clubSlug ? `courtops.com/p/${clubSlug}` : null
}

function getPack(packId: PackId): VisualPack {
    return VISUAL_PACKS.find(pack => pack.id === packId) ?? VISUAL_PACKS[0]
}

function BrandBlock({
    clubName,
    logoUrl,
    accent,
    darkText = false,
}: {
    clubName: string
    logoUrl?: string | null
    accent: string
    darkText?: boolean
}) {
    const absLogo = logoUrl ? toAbsoluteUrl(logoUrl) : null
    const primary = darkText ? '#0d1726' : '#ffffff'
    const secondary = darkText ? 'rgba(13,23,38,0.52)' : 'rgba(255,255,255,0.54)'

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {absLogo ? (
                <img
                    src={absLogo}
                    alt={clubName}
                    style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 11 }}
                />
            ) : (
                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: darkText ? 'rgba(13,23,38,0.10)' : 'rgba(255,255,255,0.14)',
                        border: `1px solid ${darkText ? 'rgba(13,23,38,0.14)' : 'rgba(255,255,255,0.20)'}`,
                        color: accent,
                        fontSize: 15,
                        fontWeight: 900,
                    }}
                >
                    {getClubInitial(clubName)}
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span
                    style={{
                        fontSize: 7,
                        fontWeight: 800,
                        letterSpacing: '0.34em',
                        textTransform: 'uppercase',
                        color: secondary,
                    }}
                >
                    Club de padel
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.15, color: primary }}>
                    {clubName}
                </span>
            </div>
        </div>
    )
}

function UrlLine({ storyUrl, color }: { storyUrl: string | null; color: string }) {
    if (!storyUrl) return null
    return (
        <p
            style={{
                margin: 0,
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color,
            }}
        >
            {storyUrl}
        </p>
    )
}

function StorySurface({
    children,
    background,
    color = '#fff',
}: {
    children: React.ReactNode
    background: string
    color?: string
}) {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                background,
                color,
                fontFamily: '"Space Grotesk","Inter",system-ui,sans-serif',
            }}
        >
            {children}
        </div>
    )
}

function PhotoLayer({
    src,
    opacity = 1,
    position = 'center',
    scale = 1,
    inset = 0,
    radius = 0,
    overlay,
    style,
}: {
    src: string
    opacity?: number
    position?: string
    scale?: number
    inset?: number
    radius?: number
    overlay?: string
    style?: React.CSSProperties
}) {
    return (
        <div
            style={{
                position: 'absolute',
                inset,
                overflow: 'hidden',
                borderRadius: radius,
                ...style,
            }}
        >
            <img
                src={src}
                alt=""
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: position,
                    opacity,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center',
                }}
            />
            {overlay ? <div style={{ position: 'absolute', inset: 0, background: overlay }} /> : null}
        </div>
    )
}

function Badge({
    text,
    accent,
    dark = false,
}: {
    text: string
    accent: string
    dark?: boolean
}) {
    return (
        <div
            style={{
                padding: '7px 11px',
                borderRadius: 999,
                background: dark ? 'rgba(13,23,38,0.08)' : `${accent}20`,
                border: dark ? '1px solid rgba(13,23,38,0.10)' : `1px solid ${accent}38`,
                color: dark ? '#304152' : '#ffffff',
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
            }}
        >
            {text}
        </div>
    )
}

function SectionLabel({ text, color }: { text: string; color: string }) {
    return (
        <p
            style={{
                margin: 0,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.30em',
                textTransform: 'uppercase',
                color,
            }}
        >
            {text}
        </p>
    )
}

function ActionChip({
    text,
    background,
    color,
}: {
    text: string
    background: string
    color: string
}) {
    return (
        <div
            style={{
                padding: '10px 16px',
                borderRadius: 999,
                background,
                color,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
            }}
        >
            {text}
        </div>
    )
}

function TemplateFooter({
    storyUrl,
    color,
    text,
}: {
    storyUrl: string | null
    color: string
    text: string
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p
                style={{
                    margin: 0,
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                    color,
                }}
            >
                {text}
            </p>
            <UrlLine storyUrl={storyUrl} color={color} />
        </div>
    )
}

function FlyerMidnightPhoto({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="#06090f">
            <PhotoLayer
                src={bgUrl}
                opacity={0.86}
                scale={1.08}
                overlay="linear-gradient(180deg, rgba(5,10,18,0.12) 0%, rgba(3,8,14,0.48) 40%, rgba(2,6,11,0.96) 100%)"
            />
            <div
                style={{
                    position: 'absolute',
                    top: -60,
                    right: -50,
                    width: 210,
                    height: 210,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(73,227,210,0.30) 0%, rgba(73,227,210,0) 72%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 16,
                    borderRadius: 28,
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#49e3d2" />
                    <Badge text="Prime night" accent="#49e3d2" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SectionLabel text="Turno libre hoy" color="rgba(255,255,255,0.66)" />
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 88,
                            lineHeight: 0.86,
                            fontWeight: 900,
                            letterSpacing: '-0.08em',
                        }}
                    >
                        {slotTime}
                    </h2>

                    <div
                        style={{
                            padding: '16px 16px 14px',
                            borderRadius: 22,
                            background: 'rgba(6,12,20,0.92)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.40)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div>
                                <SectionLabel text="Cancha" color="rgba(255,255,255,0.42)" />
                                <p style={{ margin: '5px 0 0', fontSize: 22, fontWeight: 800 }}>{courtName}</p>
                            </div>
                            <ActionChip text="Reserva web" background="#49e3d2" color="#03141a" />
                        </div>
                        {storyUrl ? (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                                <UrlLine storyUrl={storyUrl} color="rgba(255,255,255,0.38)" />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerCourtsideLuxe({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="#07100d">
            <PhotoLayer
                src={bgUrl}
                opacity={0.86}
                scale={1.24}
                position="center 78%"
                overlay="linear-gradient(180deg, rgba(6,13,11,0.18) 0%, rgba(6,14,12,0.46) 32%, rgba(5,12,10,0.90) 100%)"
            />
            <div
                style={{
                    position: 'absolute',
                    top: 34,
                    right: 22,
                    width: 72,
                    height: 112,
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.16)',
                    boxShadow: '0 18px 42px rgba(0,0,0,0.34)',
                }}
            >
                <PhotoLayer
                    src={bgUrl}
                    position="center 80%"
                    scale={1.42}
                    opacity={0.92}
                    overlay="linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.44) 100%)"
                />
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: -30,
                    left: -10,
                    width: 210,
                    height: 210,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(126,245,196,0.22) 0%, rgba(126,245,196,0) 72%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#7ef5c4" />
                    <Badge text="Peak slot" accent="#7ef5c4" />
                </div>

                <div
                    style={{
                        marginTop: 'auto',
                        padding: '18px',
                        borderRadius: 28,
                        background: 'rgba(7,14,12,0.88)',
                        border: '1px solid rgba(126,245,196,0.22)',
                        boxShadow: '0 20px 56px rgba(0,0,0,0.44)',
                    }}
                >
                    <SectionLabel text="Hora fuerte" color="rgba(126,245,196,0.72)" />
                    <h2
                        style={{
                            margin: '10px 0 12px',
                            fontSize: 82,
                            lineHeight: 0.86,
                            fontWeight: 900,
                            letterSpacing: '-0.08em',
                        }}
                    >
                        {slotTime}
                    </h2>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                            paddingTop: 14,
                            borderTop: '1px solid rgba(255,255,255,0.10)',
                        }}
                    >
                        <div>
                            <SectionLabel text="Cancha" color="rgba(255,255,255,0.40)" />
                            <p style={{ margin: '5px 0 0', fontSize: 20, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <ActionChip text="Reserva ya" background="#7ef5c4" color="#072117" />
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <TemplateFooter
                            storyUrl={storyUrl}
                            color="rgba(255,255,255,0.38)"
                            text="Lista para publicar en story"
                        />
                    </div>
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerSunsetEditorial({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="#120d08">
            <PhotoLayer
                src={bgUrl}
                opacity={0.74}
                scale={1.12}
                position="center 42%"
                overlay="linear-gradient(180deg, rgba(255,178,90,0.16) 0%, rgba(92,46,18,0.26) 24%, rgba(16,9,6,0.76) 58%, rgba(8,5,4,0.98) 100%)"
            />
            <div
                style={{
                    position: 'absolute',
                    top: -40,
                    left: -22,
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,179,107,0.38) 0%, rgba(255,179,107,0) 72%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#ffb36b" />
                    <Badge text="Golden hour" accent="#ffb36b" />
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <SectionLabel text="Hoy hay lugar" color="rgba(255,214,170,0.72)" />
                        <h2
                            style={{
                                margin: 0,
                                fontSize: 90,
                                lineHeight: 0.84,
                                fontWeight: 900,
                                letterSpacing: '-0.08em',
                                color: '#fff6ec',
                            }}
                        >
                            {slotTime}
                        </h2>
                    </div>

                    <div
                        style={{
                            padding: '16px 16px 14px',
                            borderRadius: 22,
                            background: 'rgba(245,235,220,0.12)',
                            border: '1px solid rgba(255,200,140,0.22)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.30)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div>
                                <SectionLabel text="Cancha" color="rgba(255,210,160,0.58)" />
                                <p style={{ margin: '5px 0 0', fontSize: 22, fontWeight: 800, color: '#fff2e3' }}>{courtName}</p>
                            </div>
                            <ActionChip text="Reservar" background="#ffb36b" color="#2a140a" />
                        </div>
                        {storyUrl ? (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,200,140,0.16)' }}>
                                <UrlLine storyUrl={storyUrl} color="rgba(255,220,180,0.50)" />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerMatchdayCollage({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="#efe7dc" color="#102033">
            <div
                style={{
                    position: 'absolute',
                    inset: 12,
                    borderRadius: 30,
                    background: '#f7f2ea',
                    boxShadow: '0 20px 50px rgba(24,34,48,0.16)',
                }}
            />
            <PhotoLayer
                src={bgUrl}
                inset={18}
                radius={28}
                opacity={0.96}
                scale={1.08}
                position="center 42%"
                overlay="linear-gradient(180deg, rgba(4,10,16,0.06) 0%, rgba(6,12,20,0.38) 54%, rgba(6,12,20,0.58) 100%)"
                style={{ bottom: 198 }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 198,
                    left: 28,
                    right: 96,
                    padding: '18px 18px 16px',
                    borderRadius: 24,
                    background: '#ffffff',
                    boxShadow: '0 18px 42px rgba(16,20,26,0.18)',
                }}
            >
                <SectionLabel text="Turno libre" color="rgba(16,32,51,0.42)" />
                <h2
                    style={{
                        margin: '10px 0 12px',
                        fontSize: 76,
                        lineHeight: 0.88,
                        fontWeight: 900,
                        letterSpacing: '-0.08em',
                        color: '#102033',
                    }}
                >
                    {slotTime}
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div>
                        <SectionLabel text="Cancha" color="rgba(16,32,51,0.40)" />
                        <p style={{ margin: '5px 0 0', fontSize: 18, fontWeight: 800 }}>{courtName}</p>
                    </div>
                    <ActionChip text="Reserva" background="#102033" color="#ffffff" />
                </div>
            </div>
            <div
                style={{
                    position: 'absolute',
                    top: 224,
                    right: 24,
                    width: 70,
                    height: 112,
                    borderRadius: 24,
                    overflow: 'hidden',
                    transform: 'rotate(6deg)',
                    boxShadow: '0 14px 34px rgba(16,20,26,0.18)',
                }}
            >
                <PhotoLayer src={bgUrl} position="center 82%" scale={1.34} opacity={0.92} />
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: 24,
                    left: 28,
                    right: 28,
                    padding: '16px 18px',
                    borderRadius: 24,
                    border: '1px solid rgba(16,32,51,0.10)',
                    background: 'rgba(255,255,255,0.66)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#1f9dff" darkText />
                    <Badge text="Curated" accent="#1f9dff" dark />
                </div>
                <div style={{ marginTop: 14 }}>
                    <TemplateFooter
                        storyUrl={storyUrl}
                        color="rgba(16,32,51,0.40)"
                        text="Visual con foto real de cancha"
                    />
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerClubMinimal({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    const photoHeight = 204

    return (
        <StorySurface background="#f5f0e8" color="#0d1726">
            <PhotoLayer
                src={bgUrl}
                opacity={1}
                inset={0}
                style={{ top: 0, left: 0, right: 0, height: photoHeight, bottom: undefined }}
                overlay="linear-gradient(180deg, rgba(7,12,18,0.06) 0%, rgba(7,12,18,0.42) 100%)"
            />

            <div style={{ position: 'absolute', top: 18, left: 20 }}>
                <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#ff7a00" />
            </div>
            <div style={{ position: 'absolute', top: 18, right: 20 }}>
                <Badge text="Hoy" accent="#ff7a00" dark />
            </div>

            <div
                style={{
                    position: 'absolute',
                    top: photoHeight - 18,
                    left: 14,
                    right: 14,
                    bottom: 14,
                    borderRadius: 24,
                    background: '#ffffff',
                    boxShadow: '0 -4px 32px rgba(16,20,26,0.12)',
                    padding: '22px 20px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <SectionLabel text="Horario libre" color="rgba(13,23,38,0.42)" />
                <h2
                    style={{
                        margin: 0,
                        fontSize: 82,
                        lineHeight: 0.88,
                        fontWeight: 900,
                        letterSpacing: '-0.07em',
                        color: '#0d1726',
                    }}
                >
                    {slotTime}
                </h2>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ padding: '12px 14px', borderRadius: 16, background: '#0d1726', minWidth: 96 }}>
                            <SectionLabel text="Cancha" color="rgba(255,255,255,0.42)" />
                            <p style={{ margin: '5px 0 0', fontSize: 15, fontWeight: 800, color: '#fff' }}>{courtName}</p>
                        </div>
                        <div
                            style={{
                                padding: '14px 18px',
                                borderRadius: 999,
                                background: '#ff7a00',
                                color: '#fff',
                                fontSize: 9,
                                fontWeight: 900,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                flex: 1,
                                textAlign: 'center',
                            }}
                        >
                            Reserva ya
                        </div>
                    </div>
                    <UrlLine storyUrl={storyUrl} color="rgba(13,23,38,0.36)" />
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerPosterSplit({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="#edf3f9" color="#07111d">
            <div
                style={{
                    position: 'absolute',
                    inset: 16,
                    borderRadius: 30,
                    background: '#f7fbff',
                    boxShadow: '0 20px 46px rgba(13,22,38,0.12)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bottom: 16,
                    width: 88,
                    borderRadius: '0 30px 30px 0',
                    overflow: 'hidden',
                }}
            >
                <PhotoLayer
                    src={bgUrl}
                    position="center 58%"
                    scale={1.28}
                    opacity={0.94}
                    overlay="linear-gradient(180deg, rgba(5,12,20,0.12) 0%, rgba(7,13,21,0.48) 100%)"
                />
            </div>
            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '28px 108px 24px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#86b6ff" darkText />
                </div>

                <div style={{ marginTop: 30 }}>
                    <Badge text="Poster pack" accent="#86b6ff" dark />
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <SectionLabel text="Turno libre" color="rgba(7,17,29,0.40)" />
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 82,
                            lineHeight: 0.86,
                            fontWeight: 900,
                            letterSpacing: '-0.08em',
                        }}
                    >
                        {slotTime}
                    </h2>
                    <div
                        style={{
                            padding: '16px',
                            borderRadius: 22,
                            background: '#07111d',
                            color: '#ffffff',
                        }}
                    >
                        <SectionLabel text="Cancha" color="rgba(255,255,255,0.40)" />
                        <p style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 800 }}>{courtName}</p>
                        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <ActionChip text="Reserva web" background="#86b6ff" color="#07111d" />
                            <UrlLine storyUrl={storyUrl} color="rgba(255,255,255,0.34)" />
                        </div>
                    </div>
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerLinenCard({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="linear-gradient(180deg, #efe5d6 0%, #f7f1e8 100%)" color="#183428">
            <div
                style={{
                    position: 'absolute',
                    inset: 18,
                    borderRadius: 28,
                    border: '1px solid rgba(24,52,40,0.08)',
                    background: 'rgba(255,255,255,0.48)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 28,
                    right: 28,
                    width: 86,
                    height: 116,
                    borderRadius: 22,
                    overflow: 'hidden',
                    boxShadow: '0 18px 34px rgba(29,44,37,0.14)',
                }}
            >
                <PhotoLayer
                    src={bgUrl}
                    position="center 64%"
                    scale={1.26}
                    opacity={0.94}
                    overlay="linear-gradient(180deg, rgba(12,18,16,0.08) 0%, rgba(12,18,16,0.34) 100%)"
                />
            </div>
            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '26px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#2a9d8f" darkText />
                    <Badge text="Soft premium" accent="#2a9d8f" dark />
                </div>

                <div
                    style={{
                        marginTop: 'auto',
                        padding: '20px 18px 18px',
                        borderRadius: 28,
                        background: '#ffffff',
                        border: '1px solid rgba(24,52,40,0.08)',
                        boxShadow: '0 18px 36px rgba(24,52,40,0.08)',
                    }}
                >
                    <SectionLabel text="Disponibilidad" color="rgba(24,52,40,0.44)" />
                    <h2
                        style={{
                            margin: '12px 0 16px',
                            fontSize: 76,
                            lineHeight: 0.88,
                            fontWeight: 900,
                            letterSpacing: '-0.08em',
                        }}
                    >
                        {slotTime}
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                            <SectionLabel text="Cancha" color="rgba(24,52,40,0.38)" />
                            <p style={{ margin: '5px 0 0', fontSize: 18, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <ActionChip text="Reservar" background="#183428" color="#ffffff" />
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <TemplateFooter
                            storyUrl={storyUrl}
                            color="rgba(24,52,40,0.42)"
                            text="Limpio, premium y listo para publicar"
                        />
                    </div>
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerGlassNight({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="#08111a">
            <PhotoLayer
                src={bgUrl}
                opacity={0.56}
                scale={1.12}
                overlay="linear-gradient(180deg, rgba(5,12,22,0.36) 0%, rgba(4,10,19,0.68) 30%, rgba(5,10,18,0.94) 100%)"
            />
            <div
                style={{
                    position: 'absolute',
                    top: 28,
                    right: -40,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(115,199,255,0.28) 0%, rgba(115,199,255,0) 72%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#73c7ff" />
                    <Badge text="Sharp" accent="#73c7ff" />
                </div>

                <div
                    style={{
                        marginTop: 32,
                        padding: '20px 18px 16px',
                        borderRadius: 26,
                        background: 'rgba(6,14,24,0.92)',
                        border: '1px solid rgba(115,199,255,0.20)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                    }}
                >
                    <SectionLabel text="Turno disponible" color="rgba(115,199,255,0.68)" />
                    <h2
                        style={{
                            margin: '12px 0 10px',
                            fontSize: 84,
                            lineHeight: 0.86,
                            fontWeight: 900,
                            letterSpacing: '-0.08em',
                        }}
                    >
                        {slotTime}
                    </h2>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                            borderTop: '1px solid rgba(255,255,255,0.10)',
                            paddingTop: 14,
                        }}
                    >
                        <div>
                            <SectionLabel text="Cancha" color="rgba(255,255,255,0.42)" />
                            <p style={{ margin: '5px 0 0', fontSize: 19, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <ActionChip text="Reservar" background="#73c7ff" color="#071019" />
                    </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div
                        style={{
                            padding: '14px 16px',
                            borderRadius: 20,
                            background: 'rgba(115,199,255,0.10)',
                            border: '1px solid rgba(115,199,255,0.18)',
                        }}
                    >
                        <TemplateFooter
                            storyUrl={storyUrl}
                            color="rgba(255,255,255,0.40)"
                            text="Reserva online desde la story del club"
                        />
                    </div>
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerScoreboard({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="#070d07">
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 16,
                    borderRadius: 26,
                    border: '1px solid rgba(198,255,77,0.24)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 60,
                    left: '50%',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(198,255,77,0.12) 0%, rgba(198,255,77,0) 70%)',
                    transform: 'translateX(-50%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#c6ff4d" />
                    <Badge text="Live" accent="#c6ff4d" />
                </div>

                <div
                    style={{
                        marginTop: 28,
                        padding: '18px 18px 16px',
                        borderRadius: 24,
                        background: 'rgba(3,6,3,0.80)',
                        border: '1px solid rgba(198,255,77,0.18)',
                    }}
                >
                    <SectionLabel text="Turno libre" color="rgba(198,255,77,0.65)" />
                    <div
                        style={{
                            marginTop: 12,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                            fontSize: 80,
                            lineHeight: 0.90,
                            letterSpacing: '-0.04em',
                            color: '#d4ff79',
                            fontWeight: 800,
                            textShadow: '0 0 28px rgba(198,255,77,0.22)',
                        }}
                    >
                        {slotTime}
                    </div>
                    <p
                        style={{
                            margin: '12px 0 0',
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing: '0.30em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.36)',
                        }}
                    >
                        Disponible para reservar
                    </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div
                            style={{
                                flex: 1,
                                padding: '13px 13px 11px',
                                borderRadius: 18,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <SectionLabel text="Cancha" color="rgba(255,255,255,0.40)" />
                            <p style={{ margin: '5px 0 0', fontSize: 17, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                padding: '13px 13px 11px',
                                borderRadius: 18,
                                background: '#c6ff4d',
                                color: '#091109',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <SectionLabel text="Accion" color="rgba(9,17,9,0.60)" />
                            <p style={{ margin: '5px 0 0', fontSize: 15, fontWeight: 900 }}>Reserva ya</p>
                        </div>
                    </div>
                    <UrlLine storyUrl={storyUrl} color="rgba(255,255,255,0.34)" />
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerBaselineEnergy({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="#06111a">
            <PhotoLayer
                src={bgUrl}
                opacity={0.28}
                scale={1.22}
                position="center 78%"
                overlay="linear-gradient(180deg, rgba(3,7,12,0.56) 0%, rgba(3,7,12,0.86) 100%)"
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("${DOT_PATTERN}")`,
                    opacity: 0.34,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 130,
                    left: -24,
                    width: 240,
                    height: 2,
                    background: 'linear-gradient(90deg, rgba(25,224,255,0) 0%, rgba(25,224,255,0.92) 48%, rgba(25,224,255,0) 100%)',
                    transform: 'rotate(-18deg)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 214,
                    right: -40,
                    width: 220,
                    height: 2,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,120,0,0.88) 48%, rgba(255,255,255,0) 100%)',
                    transform: 'rotate(-18deg)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#19e0ff" />
                    <Badge text="Fast move" accent="#19e0ff" />
                </div>

                <div
                    style={{
                        marginTop: 'auto',
                        padding: '18px 18px 16px',
                        borderRadius: 28,
                        background: 'rgba(8,18,28,0.90)',
                        border: '1px solid rgba(25,224,255,0.18)',
                        boxShadow: '0 18px 48px rgba(0,0,0,0.36)',
                    }}
                >
                    <SectionLabel text="Abri la story y llena la cancha" color="rgba(25,224,255,0.68)" />
                    <h2
                        style={{
                            margin: '12px 0 14px',
                            fontSize: 84,
                            lineHeight: 0.86,
                            fontWeight: 900,
                            letterSpacing: '-0.08em',
                        }}
                    >
                        {slotTime}
                    </h2>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div
                            style={{
                                flex: 1,
                                padding: '14px 14px 12px',
                                borderRadius: 18,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <SectionLabel text="Cancha" color="rgba(255,255,255,0.40)" />
                            <p style={{ margin: '5px 0 0', fontSize: 17, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div
                            style={{
                                width: 102,
                                padding: '14px 14px 12px',
                                borderRadius: 18,
                                background: '#19e0ff',
                                color: '#05131d',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <SectionLabel text="CTA" color="rgba(5,19,29,0.54)" />
                            <p style={{ margin: '5px 0 0', fontSize: 15, fontWeight: 900 }}>Reserva</p>
                        </div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <UrlLine storyUrl={storyUrl} color="rgba(255,255,255,0.34)" />
                    </div>
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerCourtBlueprint({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="#05121a">
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #06141b 0%, #08202c 100%)' }} />
            <img
                src={COURT_PATTERN}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 36,
                    right: -36,
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(105,240,209,0.22) 0%, rgba(105,240,209,0) 72%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: 80,
                    left: -28,
                    width: 130,
                    height: 130,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(105,240,209,0.14) 0%, rgba(105,240,209,0) 72%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#69f0d1" />
                    <Badge text="Court map" accent="#69f0d1" />
                </div>

                <div
                    style={{
                        marginTop: 44,
                        padding: '18px 18px 16px',
                        borderRadius: 26,
                        background: 'rgba(4,16,22,0.86)',
                        border: '1px solid rgba(105,240,209,0.18)',
                    }}
                >
                    <SectionLabel text="Slot libre" color="rgba(185,255,240,0.64)" />
                    <h2
                        style={{
                            margin: '12px 0 10px',
                            fontSize: 82,
                            lineHeight: 0.86,
                            fontWeight: 900,
                            letterSpacing: '-0.08em',
                        }}
                    >
                        {slotTime}
                    </h2>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            paddingTop: 14,
                        }}
                    >
                        <div>
                            <SectionLabel text="Cancha" color="rgba(255,255,255,0.38)" />
                            <p style={{ margin: '5px 0 0', fontSize: 20, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 13,
                                background: '#69f0d1',
                                color: '#08202c',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: 20,
                            }}
                        >
                            +
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div
                            style={{
                                flex: 1,
                                padding: '12px 14px',
                                borderRadius: 18,
                                border: '1px solid rgba(105,240,209,0.14)',
                                background: 'rgba(105,240,209,0.06)',
                            }}
                        >
                            <SectionLabel text="Reserva online" color="rgba(185,255,240,0.54)" />
                            <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700 }}>Sin llamadas</p>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                padding: '12px 14px',
                                borderRadius: 18,
                                background: '#ffffff',
                                color: '#08202c',
                            }}
                        >
                            <SectionLabel text="CTA" color="rgba(8,32,44,0.52)" />
                            <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 900 }}>Reserva ya</p>
                        </div>
                    </div>
                    <UrlLine storyUrl={storyUrl} color="rgba(185,255,240,0.36)" />
                </div>
            </div>
        </StorySurface>
    )
}

function FlyerNeonGrid({
    slotTime,
    courtName,
    clubName,
    logoUrl,
    bgUrl,
    storyUrl,
}: FlyerCanvasProps) {
    return (
        <StorySurface background="linear-gradient(180deg, #11111b 0%, #191427 100%)">
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("${NET_PATTERN}")`,
                    opacity: 0.34,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: -54,
                    right: -34,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,104,199,0.24) 0%, rgba(255,104,199,0) 72%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 90,
                    right: 24,
                    width: 94,
                    height: 94,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid rgba(255,104,199,0.28)',
                    boxShadow: '0 18px 42px rgba(0,0,0,0.28)',
                }}
            >
                <PhotoLayer src={bgUrl} position="center 78%" scale={1.24} opacity={0.92} />
            </div>

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '22px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#ff68c7" />
                    <Badge text="Brand mode" accent="#ff68c7" />
                </div>

                <div
                    style={{
                        marginTop: 36,
                        padding: '18px 18px 16px',
                        borderRadius: 28,
                        background: 'rgba(14,14,24,0.82)',
                        border: '1px solid rgba(255,104,199,0.22)',
                    }}
                >
                    <SectionLabel text="Slot premium" color="rgba(255,104,199,0.72)" />
                    <h2
                        style={{
                            margin: '12px 0 12px',
                            fontSize: 84,
                            lineHeight: 0.86,
                            fontWeight: 900,
                            letterSpacing: '-0.08em',
                        }}
                    >
                        {slotTime}
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                            <SectionLabel text="Cancha" color="rgba(255,255,255,0.40)" />
                            <p style={{ margin: '5px 0 0', fontSize: 20, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <ActionChip text="Reservar" background="#ff68c7" color="#1a0c19" />
                    </div>
                </div>

                <div style={{ marginTop: 'auto', padding: '14px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.04)' }}>
                    <TemplateFooter
                        storyUrl={storyUrl}
                        color="rgba(255,255,255,0.38)"
                        text="Pack marca para clubes que quieren verse mas premium"
                    />
                </div>
            </div>
        </StorySurface>
    )
}

const TEMPLATE_COMPONENTS: Record<ThemeId, React.ComponentType<FlyerCanvasProps>> = {
    'midnight-photo': FlyerMidnightPhoto,
    'courtside-luxe': FlyerCourtsideLuxe,
    'sunset-editorial': FlyerSunsetEditorial,
    'matchday-collage': FlyerMatchdayCollage,
    'club-minimal': FlyerClubMinimal,
    'poster-split': FlyerPosterSplit,
    'linen-card': FlyerLinenCard,
    'glass-night': FlyerGlassNight,
    'scoreboard': FlyerScoreboard,
    'baseline-energy': FlyerBaselineEnergy,
    'court-blueprint': FlyerCourtBlueprint,
    'neon-grid': FlyerNeonGrid,
}

function PhoneMockup({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                width: 304,
                padding: 13,
                borderRadius: 44,
                background: 'linear-gradient(180deg, #191919 0%, #060606 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 32px 96px rgba(0,0,0,0.76), inset 0 0 0 1px rgba(255,255,255,0.04)',
                position: 'relative',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 88,
                    height: 26,
                    background: '#111',
                    borderRadius: 18,
                    zIndex: 10,
                }}
            />
            <div style={{ borderRadius: 32, overflow: 'hidden', background: '#000' }}>{children}</div>
            <div
                style={{
                    position: 'absolute',
                    bottom: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 88,
                    height: 4,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.22)',
                }}
            />
        </div>
    )
}

export default function FlyerGenerator({
    isOpen,
    onClose,
    slotTime,
    courtName,
    clubName,
    logoUrl,
    clubSlug,
}: FlyerGeneratorProps) {
    const flyerRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [theme, setTheme] = useState<ThemeId>('midnight-photo')

    const activeTheme = THEMES.find(option => option.id === theme) ?? THEMES[0]
    const activePack = getPack(activeTheme.packId)
    const FlyerCanvas = TEMPLATE_COMPONENTS[theme]
    const bgUrl = toAbsoluteUrl('/flyer-bg.png')
    const storyUrl = getStoryUrl(clubSlug)

    const handleGenerate = async () => {
        if (!flyerRef.current) return
        setIsGenerating(true)

        try {
            const images = Array.from(flyerRef.current.querySelectorAll('img'))
            await Promise.all(images.map((img) => waitForImageLoad(img)))

            await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
            await new Promise(resolve => setTimeout(resolve, 120))

            const dataUrl = await toPng(flyerRef.current, {
                quality: 1,
                pixelRatio: 4,
                skipFonts: false,
            })

            setGeneratedImage(dataUrl)
            toast.success('Story lista para compartir')
        } catch (error) {
            console.error(error)
            toast.error('No se pudo generar la story. Reintenta.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        if (!generatedImage) return

        const link = document.createElement('a')
        link.download = `story-${getSafeFilename(slotTime)}-${getSafeFilename(courtName)}.png`
        link.href = generatedImage
        link.click()
        toast.success('Imagen descargada')
    }

    const handleShare = async () => {
        if (!generatedImage) return

        try {
            const blob = await (await fetch(generatedImage)).blob()
            const file = new File([blob], `story-${getSafeFilename(slotTime)}.png`, { type: 'image/png' })

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: `Turno libre ${slotTime} - ${clubName}` })
                return
            }

            handleDownload()
        } catch {
            handleDownload()
        }
    }

    const handleWhatsApp = async () => {
        if (!generatedImage) return

        try {
            const blob = await (await fetch(generatedImage)).blob()
            const file = new File([blob], `story-${getSafeFilename(slotTime)}.png`, { type: 'image/png' })

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] })
                return
            }

            handleDownload()
            window.open('https://web.whatsapp.com', '_blank')
        } catch {
            handleDownload()
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                style={{ background: 'rgba(3,5,8,0.92)', backdropFilter: 'blur(22px)' }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 24 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden md:flex-row"
                    style={{
                        background: 'linear-gradient(180deg, #0c1016 0%, #080b10 100%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '2rem',
                        boxShadow: '0 40px 120px rgba(0,0,0,0.72)',
                    }}
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 z-20 flex items-center justify-center transition-colors"
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.56)',
                        }}
                    >
                        <X size={16} />
                    </button>

                    <div className="flex-1 overflow-y-auto p-8 md:p-10">
                        <div className="mx-auto flex max-w-2xl flex-col gap-8">
                            <div className="flex flex-col gap-3">
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        width: 'fit-content',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '8px 12px',
                                        borderRadius: 999,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <Sparkles size={14} color={activeTheme.accent} />
                                    <span
                                        style={{
                                            fontSize: 9,
                                            fontWeight: 800,
                                            letterSpacing: '0.30em',
                                            textTransform: 'uppercase',
                                            color: 'rgba(255,255,255,0.44)',
                                        }}
                                    >
                                        Story generator premium
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                                    Historias mas vendibles y listas para publicar
                                </h2>
                                <p className="max-w-xl text-sm leading-6 text-white/50">
                                    12 modelos curados en 4 packs visuales. Mas variedad, mejor criterio visual y varias opciones foto-led
                                    para que cada story se vea premium.
                                </p>
                            </div>

                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 24,
                                    padding: 18,
                                }}
                            >
                                <div className="grid gap-4 md:grid-cols-3">
                                    {[
                                        { label: 'Horario', value: `${slotTime} hs` },
                                        { label: 'Cancha', value: courtName },
                                        { label: 'Club', value: clubName },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/32">{label}</p>
                                            <p className="mt-1.5 text-base font-black text-white">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${activeTheme.accent}26`,
                                    borderRadius: 24,
                                    padding: 18,
                                }}
                            >
                                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/32">Seleccion actual</p>
                                        <p className="mt-2 text-lg font-black text-white">{activeTheme.label}</p>
                                        <p className="mt-1 max-w-lg text-sm leading-6 text-white/48">{activeTheme.desc}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em]"
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                color: 'rgba(255,255,255,0.54)',
                                            }}
                                        >
                                            {activePack.label}
                                        </span>
                                        <span
                                            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em]"
                                            style={{
                                                background: `${activeTheme.accent}20`,
                                                border: `1px solid ${activeTheme.accent}42`,
                                                color: '#ffffff',
                                            }}
                                        >
                                            {activeTheme.chip}
                                        </span>
                                        {activeTheme.usesPhoto ? (
                                            <span
                                                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em]"
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    color: 'rgba(255,255,255,0.54)',
                                                }}
                                            >
                                                Foto real
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-5">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.30em] text-white/32">Packs visuales</p>
                                    <p className="text-xs text-white/35">12 modelos premium disponibles</p>
                                </div>

                                {VISUAL_PACKS.map(pack => {
                                    const packThemes = THEMES.filter(option => option.packId === pack.id)

                                    return (
                                        <div
                                            key={pack.id}
                                            className="rounded-[1.6rem] border border-white/6 bg-white/[0.02] p-4 md:p-5"
                                        >
                                            <div className="mb-4 flex flex-col gap-1">
                                                <p className="text-sm font-black text-white">{pack.label}</p>
                                                <p className="max-w-2xl text-sm leading-6 text-white/42">{pack.desc}</p>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                {packThemes.map(option => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => {
                                                            setTheme(option.id)
                                                            setGeneratedImage(null)
                                                        }}
                                                        className="rounded-[1.3rem] p-3.5 text-left transition-all"
                                                        style={{
                                                            background: theme === option.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                                            border:
                                                                theme === option.id
                                                                    ? `1.5px solid ${option.accent}`
                                                                    : '1px solid rgba(255,255,255,0.06)',
                                                            boxShadow: theme === option.id ? `0 14px 36px ${option.accent}18` : 'none',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                height: 84,
                                                                borderRadius: 18,
                                                                background: option.preview,
                                                                padding: 12,
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                justifyContent: 'space-between',
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    inset: 0,
                                                                    backgroundImage: `url("${DOT_PATTERN}")`,
                                                                    opacity: option.usesPhoto ? 0.24 : 0.16,
                                                                }}
                                                            />
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    right: -16,
                                                                    bottom: -16,
                                                                    width: 74,
                                                                    height: 74,
                                                                    borderRadius: theme === option.id ? 26 : 22,
                                                                    background: option.usesPhoto
                                                                        ? 'rgba(255,255,255,0.18)'
                                                                        : 'rgba(255,255,255,0.10)',
                                                                    border: '1px solid rgba(255,255,255,0.18)',
                                                                    transform: option.usesPhoto ? 'rotate(10deg)' : 'none',
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    position: 'relative',
                                                                    padding: '6px 8px',
                                                                    borderRadius: 999,
                                                                    background: 'rgba(0,0,0,0.18)',
                                                                    color: '#fff',
                                                                    fontSize: 8,
                                                                    fontWeight: 800,
                                                                    letterSpacing: '0.18em',
                                                                    textTransform: 'uppercase',
                                                                }}
                                                            >
                                                                {option.chip}
                                                            </span>
                                                            {option.usesPhoto ? (
                                                                <span
                                                                    style={{
                                                                        position: 'relative',
                                                                        padding: '6px 8px',
                                                                        borderRadius: 999,
                                                                        background: 'rgba(255,255,255,0.14)',
                                                                        color: '#fff',
                                                                        fontSize: 8,
                                                                        fontWeight: 800,
                                                                        letterSpacing: '0.18em',
                                                                        textTransform: 'uppercase',
                                                                    }}
                                                                >
                                                                    Photo
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        <div className="mt-3">
                                                            <p className="text-sm font-black text-white">{option.label}</p>
                                                            <p className="mt-1 text-xs leading-5 text-white/42">{option.desc}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex flex-col gap-2.5">
                                {!generatedImage ? (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-sm font-black uppercase tracking-[0.16em] transition-all disabled:opacity-50"
                                        style={{ background: activeTheme.accent, color: '#071019' }}
                                    >
                                        {isGenerating ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-black/20 border-t-black" />
                                        ) : (
                                            <>
                                                <Zap size={18} strokeWidth={2.5} />
                                                Generar story
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <button
                                                onClick={handleShare}
                                                className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black uppercase tracking-[0.12em] transition-all"
                                                style={{ background: activeTheme.accent, color: '#071019' }}
                                            >
                                                <Share2 size={16} strokeWidth={2.5} />
                                                Compartir
                                            </button>
                                            <button
                                                onClick={handleWhatsApp}
                                                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white transition-all"
                                            >
                                                <MessageCircle size={16} strokeWidth={2.5} />
                                                WhatsApp
                                            </button>
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <button
                                                onClick={handleDownload}
                                                className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white/72 transition-all"
                                                style={{
                                                    background: 'rgba(255,255,255,0.06)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                }}
                                            >
                                                <Download size={15} />
                                                Descargar
                                            </button>
                                            <button
                                                onClick={() => setGeneratedImage(null)}
                                                className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white/50 transition-all"
                                                style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                }}
                                            >
                                                <RefreshCw size={15} />
                                                Probar otro modelo
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center border-l border-white/5 bg-[#05070b] p-8 md:w-[430px] md:p-10">
                        <AnimatePresence mode="wait">
                            {generatedImage ? (
                                <motion.div
                                    key="generated"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <PhoneMockup>
                                        <img
                                            src={generatedImage}
                                            alt="Story generada"
                                            style={{ width: STORY_WIDTH, height: STORY_HEIGHT, display: 'block' }}
                                        />
                                    </PhoneMockup>
                                    <p className="max-w-[290px] text-center text-xs leading-5 text-white/44">
                                        Exportada en formato story 1080x1920 lista para compartir o descargar.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <PhoneMockup>
                                        <div
                                            ref={flyerRef}
                                            style={{
                                                width: STORY_WIDTH,
                                                height: STORY_HEIGHT,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                background: '#000',
                                            }}
                                        >
                                            <FlyerCanvas
                                                slotTime={slotTime}
                                                courtName={courtName}
                                                clubName={clubName}
                                                logoUrl={logoUrl}
                                                bgUrl={bgUrl}
                                                storyUrl={storyUrl}
                                                clubSlug={clubSlug}
                                            />
                                        </div>
                                    </PhoneMockup>
                                    <div className="max-w-[300px] rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/28">{activePack.label}</p>
                                        <p className="mt-2 text-sm font-black text-white">{activeTheme.label}</p>
                                        <p className="mt-1 text-xs leading-5 text-white/42">{activeTheme.desc}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
