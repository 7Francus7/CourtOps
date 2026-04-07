'use client'

import React, { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Check, Download, Share2, X, Instagram, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FlyerGeneratorProps {
    isOpen: boolean
    onClose: () => void
    slotTime: string
    courtName: string
    clubName: string
    logoUrl?: string | null
    clubSlug?: string
}

export default function FlyerGenerator({
    isOpen,
    onClose,
    slotTime,
    courtName,
    clubName,
    logoUrl,
    clubSlug
}: FlyerGeneratorProps) {
    const flyerRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)

    const handleGenerate = async () => {
        if (!flyerRef.current) return
        
        setIsGenerating(true)
        try {
            // Wait a bit for font/images to load just in case (optional but helpful)
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const dataUrl = await toPng(flyerRef.current, {
                quality: 0.95,
                pixelRatio: 2, // Better resolution for social media
                cacheBust: true,
            })
            
            setGeneratedImage(dataUrl)
            toast.success('Flyer generado correctamente! ✨')
        } catch (err) {
            console.error('Error al generar flyer:', err)
            toast.error('No se pudo generar el flyer. Reintente.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        if (!generatedImage) return
        const link = document.createElement('a')
        link.download = `Flyer-${slotTime}-${courtName}.png`
        link.href = generatedImage
        link.click()
    }

    const handleShare = async () => {
        if (!generatedImage) return
        
        try {
            // Convert dataURL to blob for sharing
            const res = await fetch(generatedImage)
            const blob = await res.blob()
            const file = new File([blob], `Turno-${slotTime}.png`, { type: 'image/png' })
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Turno disponible - ${clubName}`,
                    text: `Reserva tu turno de las ${slotTime} en ${clubName}!`,
                })
            } else {
                // Fallback to download or copy Link
                handleDownload()
                toast.info('Link descargado. ¡Ya puedes compartirlo!')
            }
        } catch (err) {
            console.error('Error al compartir:', err)
            handleDownload()
        }
    }

    const reset = () => {
        setGeneratedImage(null)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-card border border-border/50 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative"
                >
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 z-[10] p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>

                    {/* Preview Sidebar / Controls */}
                    <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 justify-center">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-foreground">Flyer de Turno Libres</h2>
                            <p className="text-muted-foreground font-medium">Promociona tus horarios disponibles en historias de Instagram o WhatsApp.</p>
                        </div>

                        <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Horario</span>
                                <span className="text-lg font-black text-primary">{slotTime}hs</span>
                            </div>
                            <div className="h-px bg-border/20" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Cancha</span>
                                <span className="text-lg font-black text-foreground">{courtName}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {!generatedImage ? (
                                <button 
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <div className="w-6 h-6 border-4 border-current/20 border-t-current rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ImageIcon size={22} />
                                            Generar Story
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={handleShare}
                                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        <Share2 size={22} />
                                        Compartir / Compartir
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={handleDownload}
                                            className="py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download size={18} />
                                            Descargar
                                        </button>
                                        <button 
                                            onClick={reset}
                                            className="py-3 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <X size={18} />
                                            Nueva
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Flyer Canvas (The Instagram Story format) */}
                    <div className="bg-[#111] p-6 md:p-10 flex items-center justify-center border-l border-border/50">
                        {/* THE FLYER TARGET */}
                        <div 
                            ref={flyerRef}
                            className="relative w-[340px] h-[600px] overflow-hidden shadow-2xl rounded-3xl bg-black select-none"
                            style={{ aspectRatio: '9/16' }}
                        >
                            {/* Background Image with Overlay */}
                            <img 
                                src="/flyer-bg.png" 
                                alt="Background" 
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />

                            {/* Content Overlays */}
                            <div className="absolute inset-0 flex flex-col items-center justify-between p-10 text-center">
                                {/* Club Header */}
                                <div className="space-y-4 w-full">
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
                                        {logoUrl ? (
                                            <div className="p-1 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
                                                <img src={logoUrl} alt={clubName} className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                                                <span className="text-white text-2xl font-black">{clubName[0]}</span>
                                            </div>
                                        )}
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
                                    </div>
                                    <div className="px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 inline-block shadow-sm">
                                        <span className="text-[11px] font-black tracking-[0.4em] text-white/90 uppercase">{clubName}</span>
                                    </div>
                                </div>

                                {/* Main Text & Court */}
                                <div className="space-y-6 w-full px-4">
                                    <div className="space-y-1">
                                        <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-[0.85] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                                            Turno<br/>
                                            <span className="text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">Disponible</span>
                                        </h1>
                                        <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full mt-4 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                                    </div>

                                    {/* Court Name Badge */}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg group">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-sm font-black text-white/80 uppercase tracking-widest">{courtName}</span>
                                    </div>
                                </div>

                                {/* Time Display */}
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150 animate-pulse" />
                                    <div className="relative space-y-0">
                                        <div className="text-[120px] font-black text-white tracking-tighter leading-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] filter brightness-125">
                                            {slotTime}
                                        </div>
                                        <div className="text-3xl font-black text-white/90 uppercase tracking-[0.3em] mt-[-1rem] drop-shadow-md">
                                            hs.
                                        </div>
                                    </div>
                                </div>

                                {/* Button (Visual Only) */}
                                <div className="space-y-6 w-full pt-4">
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-emerald-400/50 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                                        <div className="relative w-full py-5 bg-white text-black rounded-full font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl overflow-hidden">
                                            <span className="relative z-10">🔥 Reservar Ahora</span>
                                            <div className="absolute inset-x-0 h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[30deg] animate-[shimmer_3s_infinite]" />
                                        </div>
                                    </div>
                                    
                                    {clubSlug && (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="text-white/40 text-[9px] font-bold tracking-[0.3em] uppercase">
                                                Reserva online en
                                            </div>
                                            <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/60 text-[10px] font-black tracking-widest uppercase">
                                                courtops.com/p/{clubSlug}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Decorative Accents */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -ml-32 -mb-32" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12 pointer-events-none" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
