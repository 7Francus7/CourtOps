'use client'

import React, { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Share2, X, Zap, RefreshCw, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlyerGeneratorProps {
    isOpen: boolean
    onClose: () => void
    slotTime: string
    courtName: string
    clubName: string
    logoUrl?: string | null
    clubSlug?: string
}

type ThemeId = 'obsidian' | 'neon' | 'aurora'

interface ThemeOption {
    id: ThemeId
    label: string
    desc: string
    accent: string
}

const THEMES: ThemeOption[] = [
    { id: 'obsidian', label: 'Obsidian', desc: 'Oscuro · Cyan',  accent: '#06b6d4' },
    { id: 'neon',     label: 'Neon',     desc: 'Sport · Verde',  accent: '#84cc16' },
    { id: 'aurora',   label: 'Aurora',   desc: 'Premium · Oro',  accent: '#f59e0b' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a relative URL to absolute so html-to-image can fetch it (new URL('/x') throws without base) */
function toAbsoluteUrl(url: string): string {
    if (!url) return url
    if (url.startsWith('data:') || url.startsWith('http')) return url
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
}

// ─── Flyer Canvases ───────────────────────────────────────────────────────────

type FlyerProps = Omit<FlyerGeneratorProps, 'isOpen' | 'onClose'> & { bgUrl: string }

/** THEME 1 — OBSIDIAN: court photo bg, heavy dark overlay, cyan accent */
function FlyerObsidian({ slotTime, courtName, clubName, logoUrl, clubSlug, bgUrl }: FlyerProps) {
    const absLogo = logoUrl ? toAbsoluteUrl(logoUrl) : null
    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '52px 32px 40px',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: '#fff',
            overflow: 'hidden',
        }}>
            {/* Photo bg */}
            <img src={bgUrl} alt="" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', opacity: 0.3,
            }} />
            {/* Gradient overlays */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.92) 100%)' }} />
            {/* Cyan top accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)' }} />

            {/* ── TOP: Club brand ── */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {absLogo ? (
                    <img src={absLogo} alt={clubName} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                ) : (
                    <div style={{
                        width: 42, height: 42, borderRadius: 10,
                        background: 'rgba(6,182,212,0.12)', border: '1.5px solid rgba(6,182,212,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 17, fontWeight: 900, color: '#06b6d4',
                    }}>{clubName[0]}</div>
                )}
                <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
                    {clubName}
                </p>
            </div>

            {/* ── CENTER: Time ── */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 1, background: 'rgba(6,182,212,0.5)' }} />
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.35em', color: '#06b6d4', textTransform: 'uppercase' }}>TURNO</p>
                    <div style={{ width: 28, height: 1, background: 'rgba(6,182,212,0.5)' }} />
                </div>
                <p style={{ margin: 0, fontSize: 100, fontWeight: 900, letterSpacing: '-5px', lineHeight: 0.9, color: '#fff' }}>
                    {slotTime}
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 16, fontWeight: 900, letterSpacing: '0.28em', textTransform: 'uppercase' }}>
                    DISPONIBLE
                </p>
                <div style={{ width: 48, height: 2, background: '#06b6d4', borderRadius: 99, marginTop: 14 }} />
            </div>

            {/* ── BOTTOM: Court + CTA ── */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                    padding: '10px 20px', textAlign: 'center', marginBottom: 20,
                }}>
                    <p style={{ margin: '0 0 2px', fontSize: 8, fontWeight: 700, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>EN LA CANCHA</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{courtName}</p>
                </div>

                <div style={{
                    width: '100%', background: '#fff', color: '#000', borderRadius: 999,
                    padding: '15px 0', textAlign: 'center', fontWeight: 900,
                    fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                }}>
                    RESERVAR →
                </div>

                {clubSlug && (
                    <p style={{ margin: '16px 0 0', fontSize: 8, fontWeight: 600, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
                        courtops.com/p/{clubSlug}
                    </p>
                )}
            </div>
        </div>
    )
}

/** THEME 2 — NEON: black bg, lime glow, sport energy, scoreboard aesthetic */
function FlyerNeon({ slotTime, courtName, clubName, logoUrl, clubSlug, bgUrl: _bgUrl }: FlyerProps) {
    const absLogo = logoUrl ? toAbsoluteUrl(logoUrl) : null
    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '52px 28px 40px',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: '#fff',
            overflow: 'hidden',
        }}>
            {/* Radial spotlight glow */}
            <div style={{
                position: 'absolute', top: '38%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 320, height: 320,
                background: 'radial-gradient(circle, rgba(132,204,22,0.12) 0%, transparent 70%)',
                borderRadius: '50%',
            }} />
            {/* Top horizontal line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#84cc16' }} />
            {/* Bottom horizontal line */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#84cc16' }} />
            {/* Corner accent — top left */}
            <div style={{ position: 'absolute', top: 2, left: 0, width: 3, height: 60, background: '#84cc16' }} />
            {/* Corner accent — top right */}
            <div style={{ position: 'absolute', top: 2, right: 0, width: 3, height: 60, background: '#84cc16' }} />
            {/* Corner accent — bottom left */}
            <div style={{ position: 'absolute', bottom: 2, left: 0, width: 3, height: 60, background: '#84cc16' }} />
            {/* Corner accent — bottom right */}
            <div style={{ position: 'absolute', bottom: 2, right: 0, width: 3, height: 60, background: '#84cc16' }} />

            {/* ── TOP: Club ── */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {absLogo ? (
                    <img src={absLogo} alt={clubName} style={{ width: 44, height: 44, objectFit: 'contain' }} />
                ) : (
                    <div style={{
                        width: 40, height: 40, border: '2px solid #84cc16',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 900, color: '#84cc16',
                    }}>{clubName[0]}</div>
                )}
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.38em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                    {clubName}
                </p>
            </div>

            {/* ── CENTER ── */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 800, letterSpacing: '0.4em', color: '#84cc16', textTransform: 'uppercase' }}>TURNO DISPONIBLE</p>
                <div style={{ height: 1, width: '100%', background: 'rgba(132,204,22,0.3)', margin: '6px 0 10px' }} />
                <p style={{
                    margin: 0, fontSize: 102, fontWeight: 900, letterSpacing: '-6px', lineHeight: 0.88,
                    color: '#84cc16',
                    textShadow: '0 0 40px rgba(132,204,22,0.6), 0 0 80px rgba(132,204,22,0.3)',
                }}>
                    {slotTime}
                </p>
                <div style={{ height: 1, width: '100%', background: 'rgba(132,204,22,0.3)', margin: '10px 0 6px' }} />
                <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                    HRS
                </p>
            </div>

            {/* ── BOTTOM ── */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 8, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>CANCHA</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{courtName}</p>
                    </div>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <div style={{
                    width: '100%', background: '#84cc16', color: '#000', borderRadius: 0,
                    padding: '14px 0', textAlign: 'center', fontWeight: 900,
                    fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase',
                }}>
                    ▶ RESERVAR AHORA
                </div>

                {clubSlug && (
                    <p style={{ margin: '14px 0 0', fontSize: 8, fontWeight: 600, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase' }}>
                        courtops.com/p/{clubSlug}
                    </p>
                )}
            </div>
        </div>
    )
}

/** THEME 3 — AURORA: dark bg, amber/gold luxury, elegant layout */
function FlyerAurora({ slotTime, courtName, clubName, logoUrl, clubSlug, bgUrl }: FlyerProps) {
    const absLogo = logoUrl ? toAbsoluteUrl(logoUrl) : null
    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, #0a0600 0%, #120d02 50%, #0a0600 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '52px 32px 40px',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: '#fff',
            overflow: 'hidden',
        }}>
            {/* Subtle court bg */}
            <img src={bgUrl} alt="" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', opacity: 0.08, filter: 'sepia(1) saturate(0.5)',
            }} />
            {/* Top radial glow (gold) */}
            <div style={{
                position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                width: 280, height: 200,
                background: 'radial-gradient(ellipse, rgba(245,158,11,0.18) 0%, transparent 70%)',
            }} />
            {/* Bottom radial glow */}
            <div style={{
                position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)',
                width: 280, height: 200,
                background: 'radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)',
            }} />
            {/* Gold frame lines */}
            <div style={{ position: 'absolute', top: 18, left: 18, right: 18, height: 1, background: 'rgba(245,158,11,0.35)' }} />
            <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18, height: 1, background: 'rgba(245,158,11,0.35)' }} />
            <div style={{ position: 'absolute', top: 18, bottom: 18, left: 18, width: 1, background: 'rgba(245,158,11,0.35)' }} />
            <div style={{ position: 'absolute', top: 18, bottom: 18, right: 18, width: 1, background: 'rgba(245,158,11,0.35)' }} />
            {/* Corner ornaments */}
            {[
                { top: 14, left: 14 }, { top: 14, right: 14 },
                { bottom: 14, left: 14 }, { bottom: 14, right: 14 },
            ].map((pos, i) => (
                <div key={i} style={{
                    position: 'absolute', ...pos,
                    width: 10, height: 10,
                    borderTop: i < 2 ? '2px solid #f59e0b' : undefined,
                    borderBottom: i >= 2 ? '2px solid #f59e0b' : undefined,
                    borderLeft: (i === 0 || i === 2) ? '2px solid #f59e0b' : undefined,
                    borderRight: (i === 1 || i === 3) ? '2px solid #f59e0b' : undefined,
                }} />
            ))}

            {/* ── TOP: Club brand ── */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {absLogo ? (
                    <img src={absLogo} alt={clubName} style={{ width: 46, height: 46, objectFit: 'contain' }} />
                ) : (
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        border: '1.5px solid rgba(245,158,11,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 900, color: '#f59e0b',
                        background: 'rgba(245,158,11,0.08)',
                    }}>{clubName[0]}</div>
                )}
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
                    {clubName}
                </p>
            </div>

            {/* ── CENTER ── */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Decorative ornament */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 20, height: 1, background: '#f59e0b', opacity: 0.6 }} />
                    <div style={{ width: 5, height: 5, background: '#f59e0b', borderRadius: '50%' }} />
                    <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.35em', color: '#f59e0b', textTransform: 'uppercase' }}>TURNO</p>
                    <div style={{ width: 5, height: 5, background: '#f59e0b', borderRadius: '50%' }} />
                    <div style={{ width: 20, height: 1, background: '#f59e0b', opacity: 0.6 }} />
                </div>
                <p style={{ margin: 0, fontSize: 98, fontWeight: 900, letterSpacing: '-5px', lineHeight: 0.88, color: '#fff' }}>
                    {slotTime}
                </p>
                <p style={{ margin: '14px 0 0', fontSize: 13, fontWeight: 700, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
                    DISPONIBLE
                </p>
            </div>

            {/* ── BOTTOM ── */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(245,158,11,0.2)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 8, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(245,158,11,0.5)', textTransform: 'uppercase' }}>EN LA CANCHA</p>
                        <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{courtName}</p>
                    </div>
                    <div style={{ flex: 1, height: 1, background: 'rgba(245,158,11,0.2)' }} />
                </div>

                <div style={{
                    width: '100%', background: 'rgba(245,158,11,1)', color: '#000', borderRadius: 6,
                    padding: '14px 0', textAlign: 'center', fontWeight: 900,
                    fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                }}>
                    RESERVAR AHORA
                </div>

                {clubSlug && (
                    <p style={{ margin: '16px 0 0', fontSize: 8, fontWeight: 600, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase' }}>
                        courtops.com/p/{clubSlug}
                    </p>
                )}
            </div>
        </div>
    )
}

// ─── Phone Mockup Frame ───────────────────────────────────────────────────────

function PhoneMockup({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            position: 'relative',
            width: 278,
            borderRadius: 46,
            background: '#111',
            padding: 10,
            boxShadow: '0 0 0 1.5px rgba(255,255,255,0.07), 0 30px 80px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
            {/* Volume buttons */}
            <div style={{ position: 'absolute', top: 90, left: -3, width: 3, height: 34, background: '#222', borderRadius: '3px 0 0 3px' }} />
            <div style={{ position: 'absolute', top: 134, left: -3, width: 3, height: 34, background: '#222', borderRadius: '3px 0 0 3px' }} />
            {/* Power button */}
            <div style={{ position: 'absolute', top: 110, right: -3, width: 3, height: 48, background: '#222', borderRadius: '0 3px 3px 0' }} />
            {/* Screen */}
            <div style={{ borderRadius: 38, overflow: 'hidden', background: '#000' }}>
                {/* Notch / Dynamic Island */}
                <div style={{
                    position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
                    width: 90, height: 28, background: '#111',
                    borderRadius: 20, zIndex: 10,
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                }} />
                {children}
            </div>
            {/* Home indicator */}
            <div style={{
                position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                width: 90, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99,
            }} />
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FlyerGenerator({
    isOpen, onClose, slotTime, courtName, clubName, logoUrl, clubSlug,
}: FlyerGeneratorProps) {
    const flyerRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [theme, setTheme] = useState<ThemeId>('obsidian')

    const handleGenerate = async () => {
        if (!flyerRef.current) return
        setIsGenerating(true)
        try {
            await new Promise(r => setTimeout(r, 400))
            const dataUrl = await toPng(flyerRef.current, {
                quality: 1,
                pixelRatio: 3,
                cacheBust: true,
            })
            setGeneratedImage(dataUrl)
            toast.success('Flyer listo para compartir')
        } catch (err) {
            console.error(err)
            toast.error('Error al generar. Reintentá.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        if (!generatedImage) return
        const a = document.createElement('a')
        a.download = `Story-${slotTime.replace(':', '-')}-${courtName}.png`
        a.href = generatedImage
        a.click()
        toast.success('Imagen descargada')
    }

    const handleShare = async () => {
        if (!generatedImage) return
        try {
            const res = await fetch(generatedImage)
            const blob = await res.blob()
            const file = new File([blob], `Story-${slotTime}.png`, { type: 'image/png' })
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: `Turno libre ${slotTime} - ${clubName}` })
            } else {
                handleDownload()
            }
        } catch {
            handleDownload()
        }
    }

    const handleWhatsApp = async () => {
        if (!generatedImage) return
        // On mobile, share directly; on desktop download + open WA web
        try {
            const res = await fetch(generatedImage)
            const blob = await res.blob()
            const file = new File([blob], `Story-${slotTime}.png`, { type: 'image/png' })
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] })
            } else {
                handleDownload()
                window.open('https://web.whatsapp.com', '_blank')
            }
        } catch {
            handleDownload()
        }
    }

    const activeTheme = THEMES.find(t => t.id === theme)!
    const bgUrl = toAbsoluteUrl('/flyer-bg.png')
    const FlyerCanvas = theme === 'obsidian' ? FlyerObsidian : theme === 'neon' ? FlyerNeon : FlyerAurora

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 28 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 28 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 340 }}
                    className="relative w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
                    style={{
                        background: '#0a0a0f',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '2rem',
                        boxShadow: '0 40px 120px rgba(0,0,0,0.9)',
                    }}
                >
                    {/* ── Close Button ── */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 flex items-center justify-center transition-colors"
                        style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                    >
                        <X size={16} />
                    </button>

                    {/* ══════════════════ LEFT PANEL ══════════════════ */}
                    <div className="flex-1 flex flex-col gap-7 p-8 md:p-10">

                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div style={{ width: 6, height: 20, borderRadius: 99, background: activeTheme.accent }} />
                                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Story Generator</span>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Turno Libre</h2>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>
                                Compartí en Instagram o WhatsApp en 1 click.
                            </p>
                        </div>

                        {/* Slot Info */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px 20px' }}>
                            <div className="flex items-center justify-between py-2">
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>Horario</span>
                                <span style={{ fontWeight: 900, fontSize: 17, color: activeTheme.accent }}>{slotTime}hs</span>
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                            <div className="flex items-center justify-between py-2">
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>Cancha</span>
                                <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>{courtName}</span>
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                            <div className="flex items-center justify-between py-2">
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>Club</span>
                                <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>{clubName}</span>
                            </div>
                        </div>

                        {/* Theme Selector */}
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', marginBottom: 10 }}>
                                Estilo visual
                            </p>
                            <div className="flex gap-2">
                                {THEMES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setTheme(t.id); setGeneratedImage(null) }}
                                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                                        style={{
                                            background: theme === t.id ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                                            border: theme === t.id ? `1.5px solid ${t.accent}` : '1.5px solid rgba(255,255,255,0.06)',
                                        }}
                                    >
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.accent, boxShadow: theme === t.id ? `0 0 8px ${t.accent}` : 'none' }} />
                                        <span style={{ fontSize: 11, fontWeight: 800, color: theme === t.id ? '#fff' : 'rgba(255,255,255,0.4)' }}>{t.label}</span>
                                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>{t.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 mt-auto">
                            {!generatedImage ? (
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all disabled:opacity-50"
                                    style={{ background: activeTheme.accent, color: '#000', fontSize: 13, letterSpacing: '0.1em' }}
                                >
                                    {isGenerating ? (
                                        <div className="w-5 h-5 border-[3px] border-black/20 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <><Zap size={18} strokeWidth={2.5} /> Generar Story</>
                                    )}
                                </button>
                            ) : (
                                <>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleShare}
                                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black transition-all"
                                            style={{ background: activeTheme.accent, color: '#000', fontSize: 12, letterSpacing: '0.08em' }}
                                        >
                                            <Share2 size={16} strokeWidth={2.5} /> Compartir
                                        </button>
                                        <button
                                            onClick={handleWhatsApp}
                                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black transition-all"
                                            style={{ background: '#25D366', color: '#fff', fontSize: 12, letterSpacing: '0.08em' }}
                                        >
                                            <MessageCircle size={16} strokeWidth={2.5} /> WhatsApp
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDownload}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12 }}
                                        >
                                            <Download size={15} /> Descargar
                                        </button>
                                        <button
                                            onClick={() => setGeneratedImage(null)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
                                            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 12 }}
                                        >
                                            <RefreshCw size={15} /> Nueva
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ══════════════════ RIGHT PANEL ══════════════════ */}
                    <div
                        className="flex items-center justify-center p-8 md:p-10"
                        style={{ background: '#050508', borderLeft: '1px solid rgba(255,255,255,0.04)' }}
                    >
                        {/* Generated image overlay */}
                        <AnimatePresence mode="wait">
                            {generatedImage ? (
                                <motion.div
                                    key="generated"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <PhoneMockup>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={generatedImage} alt="Flyer generado" style={{ width: '100%', display: 'block', height: 493 }} />
                                    </PhoneMockup>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <PhoneMockup>
                                        {/* The actual capture target */}
                                        <div
                                            ref={flyerRef}
                                            style={{ width: 258, height: 493, position: 'relative', overflow: 'hidden', background: '#000' }}
                                        >
                                            <FlyerCanvas
                                                slotTime={slotTime}
                                                courtName={courtName}
                                                clubName={clubName}
                                                logoUrl={logoUrl}
                                                clubSlug={clubSlug}
                                                bgUrl={bgUrl}
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
