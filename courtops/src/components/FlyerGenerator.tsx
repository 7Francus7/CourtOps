'use client'

import React, { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Check, Download, Share2, X, Instagram, Image as ImageIcon, ChevronRight } from 'lucide-react'
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
                            <div className="absolute inset-0 flex flex-col items-center justify-between py-16 px-8 text-center text-white">
                                {/* Club Header (Minimalist) */}
                                <div className="space-y-4">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt={clubName} className="w-16 h-16 mx-auto object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/10">
                                            <span className="text-white text-xl font-bold">{clubName[0]}</span>
                                        </div>
                                    )}
                                    <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/50">{clubName}</h3>
                                </div>

                                {/* Main Body (Minimalist & Legible) */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="space-y-0 text-center">
                                        <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary/80 mb-2">Turno</p>
                                        <h1 className="text-7xl font-black tracking-tighter leading-none">
                                            {slotTime}
                                        </h1>
                                        <p className="text-xl font-black tracking-[0.2em] uppercase mt-2">DISPONIBLE</p>
                                    </div>
                                    
                                    <div className="h-0.5 w-12 bg-primary/40 rounded-full mt-4" />
                                </div>

                                {/* Details & Action */}
                                <div className="w-full space-y-8">
                                    {/* Court Name (Clean Badge) */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">En la cancha</span>
                                        <span className="text-sm font-black tracking-widest uppercase">{courtName}</span>
                                    </div>

                                    {/* Minimalist Button Effect */}
                                    <div className="relative group mx-auto max-w-[240px]">
                                        <div className="absolute inset-0 bg-white blur-2xl opacity-10 rounded-full" />
                                        <div className="relative py-4 bg-white text-black rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl">
                                            <span>RESERVAR</span>
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>

                                    {/* Website Link */}
                                    {clubSlug && (
                                        <div className="pt-4 opacity-40">
                                            <p className="text-[9px] font-bold tracking-[0.3em] uppercase">courtops.com/p/{clubSlug}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Corner Accents (Subtle) */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
