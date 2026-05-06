'use client'

/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Share2, X, Zap, RefreshCw, MessageCircle } from 'lucide-react'
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

type ThemeId =
    | 'midnight-photo'
    | 'club-minimal'
    | 'glass-night'
    | 'scoreboard'
    | 'sunset-editorial'
    | 'court-blueprint'

interface ThemeOption {
    id: ThemeId
    label: string
    desc: string
    accent: string
    chip: string
}

type FlyerCanvasProps = Omit<FlyerGeneratorProps, 'isOpen' | 'onClose'> & {
    bgUrl: string
    storyUrl: string | null
}

// 9:16 exacto → ×4 = 1080×1920 (Instagram Story nativo)
const STORY_WIDTH = 270
const STORY_HEIGHT = 480

const THEMES: ThemeOption[] = [
    { id: 'midnight-photo', label: 'Midnight',  desc: 'Foto nocturna · premium',     accent: '#4de2d1', chip: 'Hero'  },
    { id: 'club-minimal',   label: 'Studio',    desc: 'Limpio · editorial claro',     accent: '#ff7a00', chip: 'Clean' },
    { id: 'glass-night',    label: 'Glass',     desc: 'Oscuro · panel nítido',         accent: '#73c7ff', chip: 'Glass' },
    { id: 'scoreboard',     label: 'Score',     desc: 'Sport · tablero',               accent: '#c6ff4d', chip: 'Sport' },
    { id: 'sunset-editorial', label: 'Sunset', desc: 'Cálido · aspiracional',          accent: '#ffb36b', chip: 'Warm'  },
    { id: 'court-blueprint', label: 'Blueprint', desc: 'Geométrico · cancha',          accent: '#69f0d1', chip: 'Grid'  },
]

// ─── Court SVG pattern ─────────────────────────────────────────────────────────
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

// ─── Utilities ─────────────────────────────────────────────────────────────────
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

// ─── Shared sub-components ────────────────────────────────────────────────────
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
    const primary   = darkText ? '#0d1726' : '#ffffff'
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
                        width: 38, height: 38, borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: darkText ? 'rgba(13,23,38,0.10)' : 'rgba(255,255,255,0.14)',
                        border: `1px solid ${darkText ? 'rgba(13,23,38,0.14)' : 'rgba(255,255,255,0.20)'}`,
                        color: accent, fontSize: 15, fontWeight: 900,
                    }}
                >
                    {getClubInitial(clubName)}
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.34em', textTransform: 'uppercase', color: secondary }}>
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
        <p style={{ margin: 0, fontSize: 8, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color }}>
            {storyUrl}
        </p>
    )
}

// Surface wrapper — sets font, clipping, base background
function StorySurface({ children, background, color = '#fff' }: {
    children: React.ReactNode
    background: string
    color?: string
}) {
    return (
        <div
            style={{
                position: 'absolute', inset: 0, overflow: 'hidden',
                background, color,
                fontFamily: '"Space Grotesk","Inter",system-ui,sans-serif',
            }}
        >
            {children}
        </div>
    )
}

// ─── Template 1: Midnight Photo ───────────────────────────────────────────────
function FlyerMidnightPhoto({ slotTime, courtName, clubName, logoUrl, bgUrl, storyUrl }: FlyerCanvasProps) {
    return (
        <StorySurface background="#06090f">
            {/* Background photo — no transform, overflow hidden handles crop */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <img
                    src={bgUrl} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.88 }}
                />
            </div>
            {/* Gradient overlay — top light, bottom heavy */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(5,10,18,0.18) 0%, rgba(4,9,16,0.55) 38%, rgba(2,6,11,0.96) 100%)',
            }} />
            {/* Accent glow top-right */}
            <div style={{
                position: 'absolute', top: -60, right: -50, width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(77,226,209,0.30) 0%, rgba(77,226,209,0) 70%)',
            }} />
            {/* Inner border */}
            <div style={{ position: 'absolute', inset: 16, borderRadius: 26, border: '1px solid rgba(255,255,255,0.08)' }} />

            <div style={{ position: 'relative', height: '100%', padding: '22px 20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {/* Top: brand + badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#4de2d1" />
                    <div style={{
                        padding: '8px 11px', borderRadius: 999,
                        background: 'rgba(77,226,209,0.14)', border: '1px solid rgba(77,226,209,0.28)',
                        fontSize: 8, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
                        color: '#c0fff8',
                    }}>
                        Turno libre
                    </div>
                </div>

                {/* Bottom content block */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Label */}
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.30em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
                        Disponible hoy
                    </p>
                    {/* BIG time */}
                    <h2 style={{ margin: 0, fontSize: 88, lineHeight: 0.86, fontWeight: 900, letterSpacing: '-0.08em', color: '#ffffff' }}>
                        {slotTime}
                    </h2>

                    {/* Info card — solid background, NO backdropFilter */}
                    <div style={{
                        padding: '16px 16px 14px',
                        borderRadius: 22,
                        background: 'rgba(5,12,22,0.90)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.40)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div>
                                <p style={{ margin: 0, fontSize: 7, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.44)' }}>
                                    Cancha
                                </p>
                                <p style={{ margin: '5px 0 0', fontSize: 22, fontWeight: 800, color: '#fff' }}>{courtName}</p>
                            </div>
                            <div style={{
                                padding: '10px 16px', borderRadius: 999,
                                background: '#4de2d1', color: '#03141a',
                                fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
                            }}>
                                Reservar
                            </div>
                        </div>
                        {storyUrl && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                                <UrlLine storyUrl={storyUrl} color="rgba(255,255,255,0.40)" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StorySurface>
    )
}

// ─── Template 2: Club Minimal / Studio ────────────────────────────────────────
function FlyerClubMinimal({ slotTime, courtName, clubName, logoUrl, bgUrl, storyUrl }: FlyerCanvasProps) {
    const photoH = 200
    return (
        <StorySurface background="#f5f0e8" color="#0d1726">
            {/* Photo section — top 42% */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: photoH, overflow: 'hidden', borderRadius: '0 0 0 0' }}>
                <img
                    src={bgUrl} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
                {/* Subtle bottom gradient on photo */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(7,12,18,0.08) 0%, rgba(7,12,18,0.48) 100%)',
                }} />
                {/* Brand block inside photo */}
                <div style={{ position: 'absolute', top: 18, left: 20 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#ff7a00" />
                </div>
                {/* Pill badge top-right */}
                <div style={{
                    position: 'absolute', top: 18, right: 20,
                    padding: '7px 11px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.88)',
                    fontSize: 8, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#7a5a3a',
                }}>
                    Hoy
                </div>
            </div>

            {/* White content card */}
            <div style={{
                position: 'absolute', top: photoH - 18, left: 14, right: 14, bottom: 14,
                borderRadius: 24,
                background: '#ffffff',
                boxShadow: '0 -4px 32px rgba(16,20,26,0.12)',
                padding: '22px 20px 18px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
                {/* Top label */}
                <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(13,23,38,0.42)' }}>
                    Horario libre
                </p>

                {/* Big time */}
                <h2 style={{ margin: 0, fontSize: 82, lineHeight: 0.88, fontWeight: 900, letterSpacing: '-0.07em', color: '#0d1726' }}>
                    {slotTime}
                </h2>

                {/* Court + CTA */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ padding: '12px 14px', borderRadius: 16, background: '#0d1726', minWidth: 90 }}>
                            <p style={{ margin: 0, fontSize: 7, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)' }}>
                                Cancha
                            </p>
                            <p style={{ margin: '5px 0 0', fontSize: 15, fontWeight: 800, color: '#fff' }}>{courtName}</p>
                        </div>
                        <div style={{
                            padding: '14px 18px', borderRadius: 999,
                            background: '#ff7a00', color: '#fff',
                            fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
                            flex: 1, textAlign: 'center',
                        }}>
                            Reservar ya
                        </div>
                    </div>
                    <UrlLine storyUrl={storyUrl} color="rgba(13,23,38,0.36)" />
                </div>
            </div>
        </StorySurface>
    )
}

// ─── Template 3: Glass Night ──────────────────────────────────────────────────
// NO backdropFilter — panel usa background sólido rgba
function FlyerGlassNight({ slotTime, courtName, clubName, logoUrl, bgUrl, storyUrl }: FlyerCanvasProps) {
    return (
        <StorySurface background="#08111a">
            {/* BG photo full bleed */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <img
                    src={bgUrl} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.55 }}
                />
            </div>
            {/* Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(5,12,22,0.38) 0%, rgba(4,10,19,0.68) 30%, rgba(5,10,18,0.94) 100%)',
            }} />
            {/* Glow */}
            <div style={{
                position: 'absolute', top: 30, right: -40, width: 180, height: 180, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(115,199,255,0.28) 0%, rgba(115,199,255,0) 72%)',
            }} />

            <div style={{ position: 'relative', height: '100%', padding: '22px 20px 20px', display: 'flex', flexDirection: 'column' }}>
                {/* Top brand */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#73c7ff" />
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        border: '1px solid rgba(115,199,255,0.30)',
                        background: 'rgba(115,199,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#c2e8ff', fontWeight: 900, fontSize: 17,
                    }}>+</div>
                </div>

                {/* Main card — solid background, NO backdropFilter */}
                <div style={{
                    marginTop: 32,
                    padding: '20px 18px 16px',
                    borderRadius: 26,
                    background: 'rgba(6,14,24,0.92)',
                    border: '1px solid rgba(115,199,255,0.20)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                }}>
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.30em', textTransform: 'uppercase', color: 'rgba(115,199,255,0.68)' }}>
                        Turno disponible
                    </p>
                    <h2 style={{ margin: '12px 0 10px', fontSize: 84, lineHeight: 0.86, fontWeight: 900, letterSpacing: '-0.08em', color: '#ffffff' }}>
                        {slotTime}
                    </h2>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                        borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 14,
                    }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 7, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)' }}>
                                Cancha
                            </p>
                            <p style={{ margin: '5px 0 0', fontSize: 19, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div style={{
                            padding: '10px 16px', borderRadius: 999,
                            background: '#73c7ff', color: '#071019',
                            fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
                        }}>
                            Reservar
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Accent strip */}
                    <div style={{
                        padding: '14px 16px',
                        borderRadius: 20,
                        background: 'rgba(115,199,255,0.10)',
                        border: '1px solid rgba(115,199,255,0.18)',
                    }}>
                        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(115,199,255,0.62)' }}>
                            Reservá desde el link del club
                        </p>
                    </div>
                    <UrlLine storyUrl={storyUrl} color="rgba(255,255,255,0.38)" />
                </div>
            </div>
        </StorySurface>
    )
}

// ─── Template 4: Scoreboard ───────────────────────────────────────────────────
function FlyerScoreboard({ slotTime, courtName, clubName, logoUrl, storyUrl }: FlyerCanvasProps) {
    return (
        <StorySurface background="#070d07">
            {/* Grid lines */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }} />
            {/* Inner border */}
            <div style={{ position: 'absolute', inset: 16, borderRadius: 26, border: '1px solid rgba(198,255,77,0.24)' }} />
            {/* Glow center */}
            <div style={{
                position: 'absolute', top: 60, left: '50%',
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(198,255,77,0.12) 0%, rgba(198,255,77,0) 70%)',
                transform: 'translateX(-50%)',
            }} />

            <div style={{ position: 'relative', height: '100%', padding: '22px 20px 20px', display: 'flex', flexDirection: 'column' }}>
                {/* Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#c6ff4d" />
                    <div style={{
                        padding: '7px 10px', borderRadius: 10,
                        border: '1px solid rgba(198,255,77,0.30)',
                        color: '#e7ffc1', fontSize: 8, fontWeight: 900, letterSpacing: '0.18em',
                    }}>LIVE</div>
                </div>

                {/* Score-style time box */}
                <div style={{
                    marginTop: 28,
                    padding: '18px 18px 16px',
                    borderRadius: 24,
                    background: 'rgba(3,6,3,0.80)',
                    border: '1px solid rgba(198,255,77,0.18)',
                }}>
                    <p style={{ margin: 0, fontSize: 8, fontWeight: 800, letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(198,255,77,0.65)' }}>
                        Turno libre
                    </p>
                    {/* Monospaced time */}
                    <div style={{
                        marginTop: 12,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                        fontSize: 80, lineHeight: 0.90,
                        letterSpacing: '-0.04em',
                        color: '#d4ff79',
                        fontWeight: 800,
                        textShadow: '0 0 28px rgba(198,255,77,0.22)',
                    }}>
                        {slotTime}
                    </div>
                    <p style={{ margin: '12px 0 0', fontSize: 8, fontWeight: 800, letterSpacing: '0.30em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.36)' }}>
                        Disponible para reservar
                    </p>
                </div>

                {/* Bottom cards */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{
                            flex: 1, padding: '13px 13px 11px', borderRadius: 18,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <p style={{ margin: 0, fontSize: 7, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>
                                Cancha
                            </p>
                            <p style={{ margin: '5px 0 0', fontSize: 17, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div style={{
                            flex: 1, padding: '13px 13px 11px', borderRadius: 18,
                            background: '#c6ff4d', color: '#091109',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        }}>
                            <p style={{ margin: 0, fontSize: 7, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.68 }}>
                                Acción
                            </p>
                            <p style={{ margin: '5px 0 0', fontSize: 15, fontWeight: 900 }}>Reserva ya</p>
                        </div>
                    </div>
                    <UrlLine storyUrl={storyUrl} color="rgba(255,255,255,0.34)" />
                </div>
            </div>
        </StorySurface>
    )
}

// ─── Template 5: Sunset Editorial ─────────────────────────────────────────────
function FlyerSunsetEditorial({ slotTime, courtName, clubName, logoUrl, bgUrl, storyUrl }: FlyerCanvasProps) {
    return (
        <StorySurface background="#130c08">
            {/* BG photo full bleed — no scale transform */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <img
                    src={bgUrl} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.70 }}
                />
            </div>
            {/* Warm gradient overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(255,178,90,0.18) 0%, rgba(88,40,14,0.26) 22%, rgba(16,9,6,0.76) 58%, rgba(8,5,4,0.97) 100%)',
            }} />
            {/* Warm glow top-left */}
            <div style={{
                position: 'absolute', top: -60, left: -30, width: 180, height: 180, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,172,80,0.40) 0%, rgba(255,172,80,0) 72%)',
            }} />

            <div style={{ position: 'relative', height: '100%', padding: '22px 20px 20px', display: 'flex', flexDirection: 'column' }}>
                {/* Top brand */}
                <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#ffb36b" />

                {/* Time section */}
                <div style={{ marginTop: 'auto', marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,214,170,0.72)' }}>
                        Hoy hay lugar
                    </p>
                    <h2 style={{ margin: 0, fontSize: 90, lineHeight: 0.84, fontWeight: 900, letterSpacing: '-0.08em', color: '#fff6ec' }}>
                        {slotTime}
                    </h2>
                </div>

                {/* Info card — solid background, NO backdropFilter */}
                <div style={{
                    padding: '16px 16px 14px',
                    borderRadius: 22,
                    background: 'rgba(245,235,220,0.12)',
                    border: '1px solid rgba(255,200,140,0.22)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.30)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 7, fontWeight: 800, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(255,210,160,0.60)' }}>
                                Cancha
                            </p>
                            <p style={{ margin: '5px 0 0', fontSize: 22, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div style={{
                            padding: '11px 16px', borderRadius: 999,
                            background: '#ffb36b', color: '#2a140a',
                            fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
                        }}>
                            Reservar
                        </div>
                    </div>
                    {storyUrl && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,200,140,0.16)' }}>
                            <UrlLine storyUrl={storyUrl} color="rgba(255,220,180,0.50)" />
                        </div>
                    )}
                </div>
            </div>
        </StorySurface>
    )
}

// ─── Template 6: Court Blueprint ──────────────────────────────────────────────
function FlyerCourtBlueprint({ slotTime, courtName, clubName, logoUrl, storyUrl }: FlyerCanvasProps) {
    return (
        <StorySurface background="#05121a">
            {/* Vertical gradient */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #06141b 0%, #08202c 100%)' }} />
            {/* Court SVG pattern */}
            <img
                src={COURT_PATTERN} alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />
            {/* Glow spots */}
            <div style={{
                position: 'absolute', top: 36, right: -36, width: 160, height: 160, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(105,240,209,0.22) 0%, rgba(105,240,209,0) 72%)',
            }} />
            <div style={{
                position: 'absolute', bottom: 80, left: -28, width: 130, height: 130, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(105,240,209,0.14) 0%, rgba(105,240,209,0) 72%)',
            }} />

            <div style={{ position: 'relative', height: '100%', padding: '22px 20px 20px', display: 'flex', flexDirection: 'column' }}>
                {/* Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#69f0d1" />
                    <div style={{
                        padding: '7px 10px', borderRadius: 999,
                        background: 'rgba(105,240,209,0.10)',
                        border: '1px solid rgba(105,240,209,0.24)',
                        color: '#b9fff0', fontSize: 8, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase',
                    }}>
                        Court map
                    </div>
                </div>

                {/* Main card */}
                <div style={{
                    marginTop: 44,
                    padding: '18px 18px 16px',
                    borderRadius: 26,
                    background: 'rgba(4,16,22,0.86)',
                    border: '1px solid rgba(105,240,209,0.18)',
                }}>
                    <p style={{ margin: 0, fontSize: 8, fontWeight: 800, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(185,255,240,0.64)' }}>
                        Slot libre
                    </p>
                    <h2 style={{ margin: '12px 0 10px', fontSize: 82, lineHeight: 0.86, fontWeight: 900, letterSpacing: '-0.08em', color: '#ffffff' }}>
                        {slotTime}
                    </h2>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                        borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14,
                    }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 7, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
                                Cancha
                            </p>
                            <p style={{ margin: '5px 0 0', fontSize: 20, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div style={{
                            width: 40, height: 40, borderRadius: 13,
                            background: '#69f0d1', color: '#08202c',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: 20,
                        }}>+</div>
                    </div>
                </div>

                {/* Bottom */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{
                            flex: 1, padding: '12px 14px', borderRadius: 18,
                            border: '1px solid rgba(105,240,209,0.14)',
                            background: 'rgba(105,240,209,0.06)',
                        }}>
                            <p style={{ margin: 0, fontSize: 8, fontWeight: 800, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(185,255,240,0.54)' }}>
                                Reservá online
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 700 }}>Sin llamadas</p>
                        </div>
                        <div style={{
                            flex: 1, padding: '12px 14px', borderRadius: 18,
                            background: '#ffffff', color: '#08202c',
                        }}>
                            <p style={{ margin: 0, fontSize: 8, fontWeight: 800, letterSpacing: '0.20em', textTransform: 'uppercase', opacity: 0.52 }}>
                                CTA
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 900 }}>Reservar ya</p>
                        </div>
                    </div>
                    <UrlLine storyUrl={storyUrl} color="rgba(185,255,240,0.36)" />
                </div>
            </div>
        </StorySurface>
    )
}

// ─── Template registry ────────────────────────────────────────────────────────
const TEMPLATE_COMPONENTS: Record<ThemeId, React.ComponentType<FlyerCanvasProps>> = {
    'midnight-photo':    FlyerMidnightPhoto,
    'club-minimal':      FlyerClubMinimal,
    'glass-night':       FlyerGlassNight,
    'scoreboard':        FlyerScoreboard,
    'sunset-editorial':  FlyerSunsetEditorial,
    'court-blueprint':   FlyerCourtBlueprint,
}

// ─── Phone Mockup ─────────────────────────────────────────────────────────────
function PhoneMockup({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            width: 304,
            padding: 13,
            borderRadius: 44,
            background: 'linear-gradient(180deg, #191919 0%, #060606 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 32px 96px rgba(0,0,0,0.76), inset 0 0 0 1px rgba(255,255,255,0.04)',
            position: 'relative',
        }}>
            {/* Notch */}
            <div style={{
                position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                width: 88, height: 26, background: '#111', borderRadius: 18, zIndex: 10,
            }} />
            {/* Screen */}
            <div style={{ borderRadius: 32, overflow: 'hidden', background: '#000' }}>
                {children}
            </div>
            {/* Home bar */}
            <div style={{
                position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
                width: 88, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.22)',
            }} />
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FlyerGenerator({
    isOpen, onClose, slotTime, courtName, clubName, logoUrl, clubSlug,
}: FlyerGeneratorProps) {
    const flyerRef       = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [theme, setTheme]  = useState<ThemeId>('midnight-photo')

    const activeTheme  = THEMES.find(t => t.id === theme) ?? THEMES[0]
    const FlyerCanvas  = TEMPLATE_COMPONENTS[theme]
    const bgUrl        = toAbsoluteUrl('/flyer-bg.png')
    const storyUrl     = getStoryUrl(clubSlug)

    const handleGenerate = async () => {
        if (!flyerRef.current) return
        setIsGenerating(true)
        try {
            // Wait for all images inside the canvas to finish loading
            const imgs = Array.from(flyerRef.current.querySelectorAll('img'))
            await Promise.all(
                imgs.map(img =>
                    img.complete
                        ? Promise.resolve()
                        : new Promise<void>(res => {
                              img.onload  = () => res()
                              img.onerror = () => res()
                          }),
                ),
            )
            // Two animation frames to let the browser repaint
            await new Promise<void>(res => requestAnimationFrame(() => requestAnimationFrame(() => res())))
            await new Promise(res => setTimeout(res, 120))

            // pixelRatio 4 → 1080×1920 nativo para Instagram
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
        const a = document.createElement('a')
        a.download = `story-${getSafeFilename(slotTime)}-${getSafeFilename(courtName)}.png`
        a.href = generatedImage
        a.click()
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
        } catch { handleDownload() }
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
        } catch { handleDownload() }
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
                    className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden md:flex-row"
                    style={{
                        background: 'linear-gradient(180deg, #0c1016 0%, #080b10 100%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '2rem',
                        boxShadow: '0 40px 120px rgba(0,0,0,0.72)',
                    }}
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 z-20 flex items-center justify-center transition-colors"
                        style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.56)',
                        }}
                    >
                        <X size={16} />
                    </button>

                    {/* ── Left panel: controls ── */}
                    <div className="flex-1 overflow-y-auto p-8 md:p-10">
                        <div className="mx-auto flex max-w-xl flex-col gap-8">

                            {/* Header */}
                            <div className="flex flex-col gap-3">
                                <div style={{
                                    display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 10,
                                    padding: '8px 12px', borderRadius: 999,
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeTheme.accent, boxShadow: `0 0 14px ${activeTheme.accent}` }} />
                                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.30em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.44)' }}>
                                        Story generator
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                                    Historias para Instagram
                                </h2>
                                <p className="max-w-sm text-sm leading-6 text-white/50">
                                    6 plantillas premium listas para postear. Elegí un estilo y generá la story en un clic.
                                </p>
                            </div>

                            {/* Slot info */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 18 }}>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {[
                                        { label: 'Horario', value: `${slotTime}hs` },
                                        { label: 'Cancha',  value: courtName },
                                        { label: 'Club',    value: clubName  },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/32">{label}</p>
                                            <p className="mt-1.5 text-base font-black text-white">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Theme picker */}
                            <div>
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.30em] text-white/32">Modelos visuales</p>
                                    <p className="text-xs text-white/35">6 estilos disponibles</p>
                                </div>
                                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                                    {THEMES.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => { setTheme(option.id); setGeneratedImage(null) }}
                                            className="rounded-2xl p-3.5 text-left transition-all"
                                            style={{
                                                background: theme === option.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                                border: theme === option.id ? `1.5px solid ${option.accent}` : '1px solid rgba(255,255,255,0.06)',
                                                boxShadow: theme === option.id ? `0 14px 36px ${option.accent}18` : 'none',
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: 14,
                                                    background: `linear-gradient(135deg, ${option.accent} 0%, rgba(255,255,255,0.06) 100%)`,
                                                    opacity: theme === option.id ? 1 : 0.78,
                                                }} />
                                                <span style={{
                                                    padding: '6px 8px', borderRadius: 999,
                                                    background: 'rgba(255,255,255,0.04)',
                                                    color: theme === option.id ? '#fff' : 'rgba(255,255,255,0.42)',
                                                    fontSize: 8, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
                                                }}>
                                                    {option.chip}
                                                </span>
                                            </div>
                                            <div className="mt-3">
                                                <p className="text-sm font-black text-white">{option.label}</p>
                                                <p className="mt-1 text-xs leading-5 text-white/42">{option.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* CTA buttons */}
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
                                            <><Zap size={18} strokeWidth={2.5} />Generar story</>
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
                                                <Share2 size={16} strokeWidth={2.5} />Compartir
                                            </button>
                                            <button
                                                onClick={handleWhatsApp}
                                                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white transition-all"
                                            >
                                                <MessageCircle size={16} strokeWidth={2.5} />WhatsApp
                                            </button>
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <button
                                                onClick={handleDownload}
                                                className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white/72 transition-all"
                                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            >
                                                <Download size={15} />Descargar
                                            </button>
                                            <button
                                                onClick={() => setGeneratedImage(null)}
                                                className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white/50 transition-all"
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                            >
                                                <RefreshCw size={15} />Otro modelo
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right panel: preview ── */}
                    <div className="flex items-center justify-center border-l border-white/5 bg-[#05070b] p-8 md:w-[400px] md:p-10">
                        <AnimatePresence mode="wait">
                            {generatedImage ? (
                                <motion.div
                                    key="generated"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.20 }}
                                >
                                    <PhoneMockup>
                                        <img
                                            src={generatedImage}
                                            alt="Story generada"
                                            style={{ width: STORY_WIDTH, height: STORY_HEIGHT, display: 'block' }}
                                        />
                                    </PhoneMockup>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.20 }}
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
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
