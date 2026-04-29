'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  MapPin,
  Phone,
  Instagram,
  Facebook,
  Wifi,
  Utensils,
  Car,
  ShoppingBag,
  DoorOpen,
  Info,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Sun,
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VenueLayoutProps {
  club: any
  activeTab: 'booking' | 'info'
  setActiveTab: (tab: 'booking' | 'info') => void
  children: React.ReactNode
  onBack?: () => void
}

const amenityIcons: Record<string, any> = {
  'Bar': Utensils,
  'Restaurante': Utensils,
  'Buffet': Utensils,
  'Kiosco': Utensils,
  'Parrilla': Utensils,
  'Quincho': DoorOpen,
  'Wi-Fi': Wifi,
  'Estacionamiento': Car,
  'Parking': Car,
  'Pro Shop': ShoppingBag,
  'Venta de Equipo': ShoppingBag,
  'Vestuarios': DoorOpen,
  'Duchas': MapPin,
  'Iluminación LED': Info,
  'Canchas Panorámicas': MapPin,
  'Gimnasio': Info,
  'Seguridad': ShieldCheck,
  'Climatizado': Info,
}

export default function VenueLayout({ club, activeTab, setActiveTab, children, onBack }: VenueLayoutProps) {
  const amenities = club.amenities ? club.amenities.split(',').map((a: string) => a.trim()) : []
  const [shareCopied, setShareCopied] = useState(false)
  const [themeMounted, setThemeMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setThemeMounted(true)
  }, [])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: club.name,
        text: `Reservá tu cancha en ${club.name}`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20">
      {/* Sticky Header - Minimalist */}
      <header className="sticky top-0 z-[60] bg-white/80 dark:bg-zinc-950/20 backdrop-blur-3xl px-4 h-14 flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.03] transition-colors duration-300">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 border border-slate-200 dark:border-white/5"
            >
              <ChevronLeft size={18} strokeWidth={2.5} className="text-slate-500 dark:text-white/70" />
            </button>
          )}
          <span className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/50 truncate max-w-[150px]">{club.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400"
            aria-label="Cambiar tema"
          >
            {themeMounted ? (
              resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />
            ) : (
              <div className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button onClick={handleShare} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5 text-primary relative">
            {shareCopied ? <Check size={15} strokeWidth={3} className="text-primary" /> : <Share2 size={16} strokeWidth={2.5} />}
            {shareCopied && (
              <span className="absolute -bottom-7 right-0 text-[9px] font-black text-primary uppercase tracking-wider whitespace-nowrap bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-transparent px-2 py-0.5 rounded-md shadow-sm">
                ¡Copiado!
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section - Immersive Design */}
      <section className="relative h-[220px] md:h-[320px] w-full overflow-hidden">
        {/* Main Cover Image with Overlay */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-slate-900" />
          {club.coverUrl && (
            <img
              src={club.coverUrl}
              alt={club.name}
              className="absolute inset-0 w-full h-full object-cover scale-105"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          )}
          {/* Multi-layered gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 to-transparent" />
          
        </div>
        
        {/* Hero Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-5 md:p-6 flex flex-col gap-3">
          <div className="flex items-end gap-4">
            {/* Logo - Floating Effect */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative shrink-0"
            >
              <div className="w-[4.5rem] h-[4.5rem] md:w-[5.5rem] md:h-[5.5rem] bg-white dark:bg-zinc-900 rounded-[1.5rem] md:rounded-[2rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-sm">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-zinc-800 flex items-center justify-center">
                  {club.logoUrl ? (
                    <>
                      <img
                        src={club.logoUrl}
                        alt={club.name}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                          event.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <span className="hidden text-2xl md:text-3xl font-black text-primary">{club.name[0]}</span>
                    </>
                  ) : (
                    <span className="text-2xl md:text-3xl font-black text-primary">{club.name[0]}</span>
                  )}
                </div>
              </div>
            </motion.div> 

            {/* Title & Stats */}
            <div className="pb-1 space-y-1.5 flex-1 min-w-0">
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2"
              >
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none truncate">
                  {club.name}
                </h1>
                {club.subscriptionStatus === 'ACTIVE' && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center border border-white/20">
                    <Check size={8} strokeWidth={4} className="text-white" />
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3"
              >
                <div className="flex items-center gap-1 text-white/60 text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  <MapPin size={10} className="text-primary" />
                  <span className="truncate">{club.address?.split(',')[0] || 'Ubicación no disponible'}</span>
                </div>
                <div className="flex items-center gap-1 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <Clock size={10} />
                  <span>{club.openTime} - {club.closeTime}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Layout - Pill Style */}
      <div className="sticky top-14 z-40 bg-[#F8FAFC]/80 dark:bg-zinc-950/80 backdrop-blur-3xl border-b border-slate-200 dark:border-white/5">
        <div className="w-full max-w-md mx-auto px-4 py-3">
          <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('booking')}
              className={cn(
                "flex-1 py-2.5 text-xs font-black tracking-widest transition-all rounded-xl relative overflow-hidden",
                activeTab === 'booking' ? "text-primary bg-white dark:bg-zinc-900 shadow-sm" : "text-slate-400 dark:text-slate-500"
              )}
            >
              RESERVA
            </button>
            <button 
              onClick={() => setActiveTab('info')}
              className={cn(
                "flex-1 py-2.5 text-xs font-black tracking-widest transition-all rounded-xl relative overflow-hidden",
                activeTab === 'info' ? "text-primary bg-white dark:bg-zinc-900 shadow-sm" : "text-slate-400 dark:text-slate-500"
              )}
            >
              INFORMACIÓN
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <main className="w-full max-w-md mx-auto px-4 py-6 pb-24">
        {activeTab === 'booking' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-5 rounded-[1.75rem] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                    Reserva desde el celular
                  </p>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    Elegí horario, confirmá y seguí con tu día.
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  3 pasos
                </div>
              </div>
            </div>
            {children}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Description */}
            {club.description && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                  <Info size={14} /> Sobre nosotros
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {club.description}
                </p>
              </div>
            )}

            {/* Amenities Grid */}
            {amenities.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                  Comodidades
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((item: string) => {
                    const Icon = amenityIcons[item] || ShieldCheck
                    return (
                      <div key={item} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Social & Contact */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                Contacto
              </h3>
              <div className="space-y-3">
                {club.phone && (
                  <a href={`tel:${club.phone}`} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Phone size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono</p>
                        <p className="text-sm font-bold">{club.phone}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}

                <div className="flex gap-3 pt-2">
                  {club.socialInstagram && (
                    <a href={`https://instagram.com/${club.socialInstagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-4 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm hover:border-primary/40 transition-colors">
                      <Instagram size={20} className="text-[#E4405F]" />
                      <span className="text-xs font-bold">Instagram</span>
                    </a>
                  )}
                  {club.socialFacebook && (
                    <a href={`https://facebook.com/${club.socialFacebook}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-4 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl shadow-sm hover:border-blue-500/30 transition-colors">
                      <Facebook size={20} className="text-blue-500" />
                      <span className="text-xs font-bold">Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Open Hours */}
            <div className="relative overflow-hidden p-6 bg-slate-800 dark:bg-zinc-900 rounded-[2.5rem] border border-slate-700 dark:border-white/5 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -mr-16 -mt-16" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Clock size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Horarios de Atención</h4>
                    <p className="text-xs font-bold text-white/40">Lunes a Domingos</p>
                  </div>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <p className="text-4xl font-black text-white tracking-tighter">
                    {club.openTime} <span className="text-xs text-primary/60 mx-1 font-black uppercase">hs</span>
                  </p>
                  <div className="h-px flex-1 bg-white/5 mx-4 mb-2" />
                  <p className="text-4xl font-black text-white tracking-tighter">
                    {club.closeTime} <span className="text-xs text-primary/60 mx-1 font-black uppercase">hs</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
