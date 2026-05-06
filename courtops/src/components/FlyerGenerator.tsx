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

const STORY_WIDTH = 258
const STORY_HEIGHT = 493

const THEMES: ThemeOption[] = [
    {
        id: 'midnight-photo',
        label: 'Midnight',
        desc: 'Foto nocturna · premium',
        accent: '#4de2d1',
        chip: 'Hero',
    },
    {
        id: 'club-minimal',
        label: 'Studio',
        desc: 'Limpio · editorial claro',
        accent: '#ff7a00',
        chip: 'Clean',
    },
    {
        id: 'glass-night',
        label: 'Glass',
        desc: 'Vidrio · moderno',
        accent: '#73c7ff',
        chip: 'Glass',
    },
    {
        id: 'scoreboard',
        label: 'Score',
        desc: 'Sport · tablero',
        accent: '#c6ff4d',
        chip: 'Sport',
    },
    {
        id: 'sunset-editorial',
        label: 'Sunset',
        desc: 'Calido · aspiracional',
        accent: '#ffb36b',
        chip: 'Warm',
    },
    {
        id: 'court-blueprint',
        label: 'Blueprint',
        desc: 'Geometrico · cancha',
        accent: '#69f0d1',
        chip: 'Grid',
    },
]

const COURT_PATTERN = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="258" height="493" viewBox="0 0 258 493" fill="none">
  <rect x="15" y="15" width="228" height="463" rx="24" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  <rect x="48" y="74" width="162" height="345" rx="14" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
  <line x1="129" y1="74" x2="129" y2="419" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
  <line x1="48" y1="246.5" x2="210" y2="246.5" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
  <line x1="15" y1="38" x2="243" y2="38" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
  <line x1="15" y1="455" x2="243" y2="455" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
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
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function getStoryUrl(clubSlug?: string): string | null {
    return clubSlug ? `courtops.com/p/${clubSlug}` : null
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
    const secondary = darkText ? 'rgba(13,23,38,0.56)' : 'rgba(255,255,255,0.58)'

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {absLogo ? (
                <img
                    src={absLogo}
                    alt={clubName}
                    style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 12 }}
                />
            ) : (
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: darkText ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.12)',
                        border: `1px solid ${darkText ? 'rgba(13,23,38,0.12)' : 'rgba(255,255,255,0.18)'}`,
                        color: accent,
                        fontSize: 16,
                        fontWeight: 900,
                    }}
                >
                    {getClubInitial(clubName)}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                    style={{
                        fontSize: 8,
                        fontWeight: 800,
                        letterSpacing: '0.34em',
                        textTransform: 'uppercase',
                        color: secondary,
                    }}
                >
                    Club de padel
                </span>
                <span
                    style={{
                        fontSize: 15,
                        fontWeight: 800,
                        lineHeight: 1.1,
                        color: primary,
                    }}
                >
                    {clubName}
                </span>
            </div>
        </div>
    )
}

function StoryLink({
    storyUrl,
    color,
    align = 'left',
}: {
    storyUrl: string | null
    color: string
    align?: React.CSSProperties['textAlign']
}) {
    if (!storyUrl) return null

    return (
        <p
            style={{
                margin: 0,
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color,
                textAlign: align,
            }}
        >
            {storyUrl}
        </p>
    )
}

function StorySurface({
    children,
    background,
    border,
    color = '#fff',
}: {
    children: React.ReactNode
    background: string
    border?: string
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
                fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
                border: border ?? 'none',
            }}
        >
            {children}
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
            <img
                src={bgUrl}
                alt=""
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.9,
                    transform: 'scale(1.12)',
                    filter: 'saturate(0.95) contrast(1.05)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(180deg, rgba(5,10,18,0.22) 0%, rgba(4,9,16,0.76) 42%, rgba(2,6,11,0.96) 100%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: -60,
                    right: -50,
                    width: 220,
                    height: 220,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(77,226,209,0.35) 0%, rgba(77,226,209,0) 70%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 18,
                    borderRadius: 28,
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '24px 22px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#4de2d1" />
                    <div
                        style={{
                            padding: '9px 12px',
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.09)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: '0.24em',
                            textTransform: 'uppercase',
                            color: '#d8fffb',
                        }}
                    >
                        Turno libre
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.32em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.72)',
                            }}
                        >
                            Disponible hoy
                        </p>
                        <h2
                            style={{
                                margin: '10px 0 0',
                                fontSize: 84,
                                lineHeight: 0.88,
                                fontWeight: 900,
                                letterSpacing: '-0.08em',
                            }}
                        >
                            {slotTime}
                        </h2>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            padding: '18px 18px 16px',
                            borderRadius: 24,
                            background: 'rgba(10,18,28,0.55)',
                            backdropFilter: 'blur(14px)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 18px 60px rgba(0,0,0,0.35)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                            <div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 8,
                                        fontWeight: 800,
                                        letterSpacing: '0.28em',
                                        textTransform: 'uppercase',
                                        color: 'rgba(255,255,255,0.52)',
                                    }}
                                >
                                    Cancha
                                </p>
                                <p style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 800 }}>{courtName}</p>
                            </div>
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#061015',
                                    background: '#4de2d1',
                                    fontWeight: 900,
                                    fontSize: 20,
                                }}
                            >
                                +
                            </div>
                        </div>

                        <div
                            style={{
                                padding: '14px 16px',
                                borderRadius: 18,
                                background: '#ffffff',
                                color: '#0b1320',
                                fontSize: 12,
                                fontWeight: 900,
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                textAlign: 'center',
                            }}
                        >
                            Reserva desde el link
                        </div>
                    </div>

                    <StoryLink storyUrl={storyUrl} color="rgba(255,255,255,0.44)" />
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
    return (
        <StorySurface background="#f3ecde" color="#0d1726">
            <div
                style={{
                    position: 'absolute',
                    inset: 12,
                    borderRadius: 28,
                    background: '#fbf7ef',
                    boxShadow: '0 22px 60px rgba(16,20,26,0.16)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: '12px 12px auto 12px',
                    height: 178,
                    overflow: 'hidden',
                    borderRadius: '28px 28px 22px 22px',
                }}
            >
                <img
                    src={bgUrl}
                    alt=""
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'saturate(0.95) brightness(1.02)',
                        transform: 'scale(1.16)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(7,12,18,0.12) 0%, rgba(7,12,18,0.56) 100%)',
                    }}
                />
            </div>

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '26px 22px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div
                        style={{
                            padding: '8px 10px',
                            borderRadius: 999,
                            background: 'rgba(255,255,255,0.82)',
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing: '0.24em',
                            textTransform: 'uppercase',
                            color: '#6a5946',
                        }}
                    >
                        Story lista
                    </div>
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: '#ff7a00',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 900,
                            letterSpacing: '0.1em',
                        }}
                    >
                        09
                    </div>
                </div>

                <div style={{ marginTop: 116 }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#ff7a00" darkText />
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: 12,
                            alignItems: 'end',
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 10,
                                    fontWeight: 800,
                                    letterSpacing: '0.26em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(13,23,38,0.54)',
                                }}
                            >
                                Horario libre
                            </p>
                            <h2
                                style={{
                                    margin: '6px 0 0',
                                    fontSize: 78,
                                    lineHeight: 0.9,
                                    fontWeight: 900,
                                    letterSpacing: '-0.08em',
                                }}
                            >
                                {slotTime}
                            </h2>
                        </div>

                        <div
                            style={{
                                padding: '12px 12px 10px',
                                borderRadius: 18,
                                background: '#0d1726',
                                color: '#fff',
                                minWidth: 82,
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 8,
                                    fontWeight: 700,
                                    letterSpacing: '0.24em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.48)',
                                }}
                            >
                                Cancha
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 800 }}>{courtName}</p>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: 12,
                            paddingTop: 14,
                            borderTop: '1px solid rgba(13,23,38,0.12)',
                            alignItems: 'center',
                        }}
                    >
                        <StoryLink storyUrl={storyUrl} color="rgba(13,23,38,0.46)" />
                        <div
                            style={{
                                padding: '10px 14px',
                                borderRadius: 999,
                                background: '#ff7a00',
                                color: '#fff',
                                fontSize: 9,
                                fontWeight: 900,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Reservar
                        </div>
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
            <img
                src={bgUrl}
                alt=""
                style={{
                    position: 'absolute',
                    inset: -20,
                    width: 'calc(100% + 40px)',
                    height: 'calc(100% + 40px)',
                    objectFit: 'cover',
                    filter: 'blur(8px) saturate(1.05)',
                    opacity: 0.7,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(180deg, rgba(5,12,22,0.42) 0%, rgba(4,10,19,0.74) 28%, rgba(5,10,18,0.96) 100%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    right: 16,
                    bottom: 16,
                    borderRadius: 30,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    backdropFilter: 'blur(12px)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 48,
                    right: -44,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(115,199,255,0.32) 0%, rgba(115,199,255,0) 72%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '26px 24px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#73c7ff" />
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.24)',
                            color: '#d7f3ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                        }}
                    >
                        +
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 40,
                        padding: '18px 18px 16px',
                        borderRadius: 26,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.62)',
                        }}
                    >
                        Turno disponible
                    </p>
                    <h2
                        style={{
                            margin: '14px 0 10px',
                            fontSize: 82,
                            lineHeight: 0.88,
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
                            borderTop: '1px solid rgba(255,255,255,0.14)',
                            paddingTop: 14,
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 8,
                                    fontWeight: 700,
                                    letterSpacing: '0.24em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.5)',
                                }}
                            >
                                Cancha
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div
                            style={{
                                padding: '10px 14px',
                                borderRadius: 999,
                                background: '#73c7ff',
                                color: '#071019',
                                fontSize: 9,
                                fontWeight: 900,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Link listo
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            padding: '16px 18px',
                            borderRadius: 24,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.46)',
                            }}
                        >
                            Compartilo en historias
                        </p>
                        <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 700, color: '#f4fbff' }}>
                            Visual limpio, noche de club y lectura inmediata.
                        </p>
                    </div>
                    <StoryLink storyUrl={storyUrl} color="rgba(255,255,255,0.44)" />
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
        <StorySurface background="linear-gradient(180deg, #091109 0%, #050805 100%)">
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    opacity: 0.34,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 18,
                    borderRadius: 28,
                    border: '1px solid rgba(198,255,77,0.28)',
                    boxShadow: 'inset 0 0 0 1px rgba(198,255,77,0.08)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 42,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 190,
                    height: 190,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(198,255,77,0.15) 0%, rgba(198,255,77,0) 72%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '24px 22px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: 12,
                        alignItems: 'center',
                    }}
                >
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#c6ff4d" />
                    <div
                        style={{
                            padding: '8px 10px',
                            borderRadius: 12,
                            border: '1px solid rgba(198,255,77,0.28)',
                            color: '#e7ffc1',
                            fontSize: 9,
                            fontWeight: 900,
                            letterSpacing: '0.16em',
                        }}
                    >
                        LIVE
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 34,
                        padding: '16px 18px 18px',
                        borderRadius: 24,
                        background: 'rgba(4,7,4,0.74)',
                        border: '1px solid rgba(198,255,77,0.18)',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: '0.34em',
                            textTransform: 'uppercase',
                            color: 'rgba(198,255,77,0.68)',
                        }}
                    >
                        Turno libre
                    </p>
                    <div
                        style={{
                            marginTop: 14,
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                padding: '14px 12px 8px',
                                borderRadius: 18,
                                background: '#0b0f0b',
                                border: '1px solid rgba(198,255,77,0.14)',
                                textAlign: 'center',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                                    fontSize: 74,
                                    lineHeight: 0.92,
                                    letterSpacing: '-0.08em',
                                    color: '#d4ff79',
                                    fontWeight: 800,
                                    textShadow: '0 0 22px rgba(198,255,77,0.18)',
                                }}
                            >
                                {slotTime}
                            </div>
                            <p
                                style={{
                                    margin: '10px 0 0',
                                    fontSize: 8,
                                    fontWeight: 800,
                                    letterSpacing: '0.32em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.42)',
                                }}
                            >
                                Disponible para reservar
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                padding: '14px 14px 12px',
                                borderRadius: 20,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 8,
                                    fontWeight: 700,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.44)',
                                }}
                            >
                                Cancha
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div
                            style={{
                                padding: '14px 14px 12px',
                                borderRadius: 20,
                                background: '#c6ff4d',
                                color: '#091109',
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 8,
                                    fontWeight: 800,
                                    letterSpacing: '0.24em',
                                    textTransform: 'uppercase',
                                    opacity: 0.72,
                                }}
                            >
                                Accion
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 900 }}>Reserva ya</p>
                        </div>
                    </div>
                    <StoryLink storyUrl={storyUrl} color="rgba(255,255,255,0.38)" />
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
        <StorySurface background="#140c09">
            <img
                src={bgUrl}
                alt=""
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.62,
                    transform: 'scale(1.18)',
                    filter: 'sepia(0.18) saturate(1.05)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'linear-gradient(180deg, rgba(255,183,107,0.22) 0%, rgba(91,42,18,0.28) 24%, rgba(18,10,7,0.82) 62%, rgba(10,7,6,0.98) 100%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: -70,
                    left: -30,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,179,107,0.45) 0%, rgba(255,179,107,0) 72%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '24px 22px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#ffb36b" />

                <div style={{ marginTop: 36 }}>
                    <p
                        style={{
                            margin: 0,
                            maxWidth: 140,
                            fontSize: 12,
                            lineHeight: 1.35,
                            color: 'rgba(255,240,224,0.86)',
                        }}
                    >
                        Una historia calida para mostrar turnos libres sin ruido visual.
                    </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: 12,
                            alignItems: 'end',
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 10,
                                    fontWeight: 800,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,222,191,0.68)',
                                }}
                            >
                                Hoy hay lugar
                            </p>
                            <h2
                                style={{
                                    margin: '8px 0 0',
                                    fontSize: 84,
                                    lineHeight: 0.88,
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
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: '0.32em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,222,191,0.56)',
                            }}
                        >
                            Disponible
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '18px 18px 16px',
                            borderRadius: 24,
                            background: 'rgba(255,245,234,0.10)',
                            border: '1px solid rgba(255,255,255,0.14)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontSize: 8,
                                fontWeight: 800,
                                letterSpacing: '0.26em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,222,191,0.56)',
                            }}
                        >
                            Cancha asignada
                        </p>
                        <p style={{ margin: '7px 0 14px', fontSize: 24, fontWeight: 800 }}>{courtName}</p>
                        <div
                            style={{
                                display: 'inline-flex',
                                padding: '10px 14px',
                                borderRadius: 999,
                                background: '#ffb36b',
                                color: '#2a140a',
                                fontSize: 9,
                                fontWeight: 900,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Reserva en segundos
                        </div>
                    </div>

                    <StoryLink storyUrl={storyUrl} color="rgba(255,228,205,0.52)" />
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
        <StorySurface background="linear-gradient(180deg, #06141b 0%, #082029 100%)">
            <img
                src={COURT_PATTERN}
                alt=""
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.88,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 40,
                    right: -40,
                    width: 170,
                    height: 170,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(105,240,209,0.26) 0%, rgba(105,240,209,0) 72%)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: 70,
                    left: -30,
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(105,240,209,0.16) 0%, rgba(105,240,209,0) 72%)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    height: '100%',
                    padding: '24px 22px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                    <BrandBlock clubName={clubName} logoUrl={logoUrl} accent="#69f0d1" />
                    <div
                        style={{
                            padding: '8px 10px',
                            borderRadius: 999,
                            background: 'rgba(105,240,209,0.10)',
                            border: '1px solid rgba(105,240,209,0.24)',
                            color: '#b9fff0',
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing: '0.26em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Court map
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 54,
                        padding: '18px 18px 16px',
                        borderRadius: 28,
                        background: 'rgba(5,18,24,0.76)',
                        border: '1px solid rgba(255,255,255,0.10)',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: 8,
                            fontWeight: 800,
                            letterSpacing: '0.34em',
                            textTransform: 'uppercase',
                            color: 'rgba(185,255,240,0.68)',
                        }}
                    >
                        Slot libre
                    </p>
                    <h2
                        style={{
                            margin: '12px 0 10px',
                            fontSize: 80,
                            lineHeight: 0.88,
                            fontWeight: 900,
                            letterSpacing: '-0.08em',
                        }}
                    >
                        {slotTime}
                    </h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: 12,
                            alignItems: 'center',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            paddingTop: 14,
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 8,
                                    fontWeight: 700,
                                    letterSpacing: '0.24em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.42)',
                                }}
                            >
                                Cancha
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 21, fontWeight: 800 }}>{courtName}</p>
                        </div>
                        <div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 14,
                                background: '#69f0d1',
                                color: '#082029',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: 18,
                            }}
                        >
                            +
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                padding: '14px 14px 12px',
                                borderRadius: 20,
                                border: '1px solid rgba(255,255,255,0.10)',
                                background: 'rgba(255,255,255,0.04)',
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 8,
                                    fontWeight: 800,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.44)',
                                }}
                            >
                                Ideal para
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 700 }}>Historia rapida</p>
                        </div>
                        <div
                            style={{
                                padding: '14px 14px 12px',
                                borderRadius: 20,
                                background: '#ffffff',
                                color: '#082029',
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 8,
                                    fontWeight: 800,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    opacity: 0.56,
                                }}
                            >
                                CTA
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 900 }}>Reserva online</p>
                        </div>
                    </div>
                    <StoryLink storyUrl={storyUrl} color="rgba(255,255,255,0.38)" />
                </div>
            </div>
        </StorySurface>
    )
}

const TEMPLATE_COMPONENTS: Record<ThemeId, React.ComponentType<FlyerCanvasProps>> = {
    'midnight-photo': FlyerMidnightPhoto,
    'club-minimal': FlyerClubMinimal,
    'glass-night': FlyerGlassNight,
    scoreboard: FlyerScoreboard,
    'sunset-editorial': FlyerSunsetEditorial,
    'court-blueprint': FlyerCourtBlueprint,
}

function PhoneMockup({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                width: 292,
                padding: 10,
                borderRadius: 42,
                background: 'linear-gradient(180deg, #171717 0%, #050505 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 30px 90px rgba(0,0,0,0.72), inset 0 0 0 1px rgba(255,255,255,0.04)',
                position: 'relative',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 90,
                    height: 28,
                    background: '#101010',
                    borderRadius: 18,
                    zIndex: 10,
                }}
            />
            <div style={{ borderRadius: 34, overflow: 'hidden', background: '#000' }}>{children}</div>
            <div
                style={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 92,
                    height: 4,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.20)',
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

    const activeTheme = THEMES.find(item => item.id === theme) ?? THEMES[0]
    const FlyerCanvas = TEMPLATE_COMPONENTS[theme]
    const bgUrl = toAbsoluteUrl('/flyer-bg.png')
    const storyUrl = getStoryUrl(clubSlug)

    const handleGenerate = async () => {
        if (!flyerRef.current) return

        setIsGenerating(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            const dataUrl = await toPng(flyerRef.current, {
                quality: 1,
                pixelRatio: 3,
                cacheBust: true,
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
            const response = await fetch(generatedImage)
            const blob = await response.blob()
            const file = new File([blob], `story-${getSafeFilename(slotTime)}.png`, { type: 'image/png' })

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Turno libre ${slotTime} - ${clubName}`,
                })
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
            const response = await fetch(generatedImage)
            const blob = await response.blob()
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
                            <div className="flex flex-col gap-4">
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        width: 'fit-content',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '9px 12px',
                                        borderRadius: 999,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 9,
                                            height: 9,
                                            borderRadius: '50%',
                                            background: activeTheme.accent,
                                            boxShadow: `0 0 18px ${activeTheme.accent}`,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: 9,
                                            fontWeight: 800,
                                            letterSpacing: '0.3em',
                                            textTransform: 'uppercase',
                                            color: 'rgba(255,255,255,0.46)',
                                        }}
                                    >
                                        Story generator
                                    </span>
                                </div>

                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                                        Historias mucho mas fuertes
                                    </h2>
                                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                                        Seis plantillas limpias, mas editoriales y con mejor presencia para Instagram o
                                        WhatsApp. Elegi una base y genera la story en un click.
                                    </p>
                                </div>
                            </div>

                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 24,
                                    padding: 20,
                                }}
                            >
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
                                            Horario
                                        </p>
                                        <p className="mt-2 text-2xl font-black text-white">{slotTime}hs</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
                                            Cancha
                                        </p>
                                        <p className="mt-2 text-lg font-bold text-white">{courtName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
                                            Club
                                        </p>
                                        <p className="mt-2 text-lg font-bold text-white">{clubName}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">
                                        Modelos visuales
                                    </p>
                                    <p className="text-xs text-white/38">6 estilos listos para usar</p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {THEMES.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setTheme(option.id)
                                                setGeneratedImage(null)
                                            }}
                                            className="rounded-3xl p-4 text-left transition-all"
                                            style={{
                                                background:
                                                    theme === option.id
                                                        ? 'rgba(255,255,255,0.08)'
                                                        : 'rgba(255,255,255,0.03)',
                                                border:
                                                    theme === option.id
                                                        ? `1.5px solid ${option.accent}`
                                                        : '1px solid rgba(255,255,255,0.06)',
                                                boxShadow:
                                                    theme === option.id
                                                        ? `0 16px 40px ${option.accent}18`
                                                        : 'none',
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div
                                                    style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 16,
                                                        background: `linear-gradient(135deg, ${option.accent} 0%, rgba(255,255,255,0.08) 100%)`,
                                                        opacity: theme === option.id ? 1 : 0.82,
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        padding: '7px 9px',
                                                        borderRadius: 999,
                                                        background: 'rgba(255,255,255,0.04)',
                                                        color: theme === option.id ? '#fff' : 'rgba(255,255,255,0.46)',
                                                        fontSize: 9,
                                                        fontWeight: 800,
                                                        letterSpacing: '0.18em',
                                                        textTransform: 'uppercase',
                                                    }}
                                                >
                                                    {option.chip}
                                                </span>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-sm font-black text-white">{option.label}</p>
                                                <p className="mt-1 text-xs leading-5 text-white/45">{option.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 24,
                                    padding: 18,
                                }}
                            >
                                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
                                    Seleccion actual
                                </p>
                                <div className="mt-3 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-lg font-black text-white">{activeTheme.label}</p>
                                        <p className="mt-1 text-sm text-white/50">{activeTheme.desc}</p>
                                    </div>
                                    <div
                                        style={{
                                            minWidth: 54,
                                            height: 54,
                                            borderRadius: 18,
                                            background: `linear-gradient(135deg, ${activeTheme.accent} 0%, rgba(255,255,255,0.08) 100%)`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-3">
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
                                                className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white/78 transition-all"
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
                                                className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white/55 transition-all"
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

                    <div
                        className="flex items-center justify-center border-l border-white/5 bg-[#05070b] p-8 md:w-[420px] md:p-10"
                    >
                        <AnimatePresence mode="wait">
                            {generatedImage ? (
                                <motion.div
                                    key="generated"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.22 }}
                                >
                                    <PhoneMockup>
                                        <img
                                            src={generatedImage}
                                            alt="Story generada"
                                            style={{ width: '100%', display: 'block', height: STORY_HEIGHT }}
                                        />
                                    </PhoneMockup>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.22 }}
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
                                                clubSlug={clubSlug}
                                                bgUrl={bgUrl}
                                                storyUrl={storyUrl}
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
