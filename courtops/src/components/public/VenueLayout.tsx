'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Phone, 
  Instagram, 
  Facebook, 
  Twitter, 
  Wifi, 
  Utensils, 
  Car, 
  ShoppingBag, 
  DoorOpen,
  Calendar,
  Info,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Share2
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: club.name,
        text: `Mirá este club en CourtOps: ${club.name}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado al portapapeles')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <span className="font-bold text-sm tracking-tight truncate max-w-[200px]">{club.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="p-2 text-slate-500 hover:text-primary transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[240px] md:h-[320px] w-full overflow-hidden">
        {/* Abstract Background / Cover */}
        <div className="absolute inset-0">
          {club.coverUrl ? (
            <img src={club.coverUrl} alt={club.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col gap-3">
          <div className="flex items-end gap-4">
            {/* Logo */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative shrink-0"
            >
              <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl p-1 shadow-2xl border border-white/20">
                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                  {club.logoUrl ? (
                    <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary">{club.name[0]}</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Title & Location */}
            <div className="pb-1">
              <motion.h1 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-white tracking-tight leading-tight mb-1"
              >
                {club.name}
              </motion.h1>
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5 text-white/70 text-xs font-medium"
              >
                <MapPin size={12} className="text-primary" />
                <span className="truncate">{club.address || 'Ubicación no disponible'}</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Layout */}
      <div className="sticky top-14 z-40 bg-[#F8FAFC] dark:bg-zinc-950 border-b border-slate-200 dark:border-white/5">
        <div className="flex w-full max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('booking')}
            className={cn(
              "flex-1 py-4 text-[13px] font-bold tracking-wider transition-all relative",
              activeTab === 'booking' ? "text-primary" : "text-slate-400 dark:text-slate-500"
            )}
          >
            RESERVA
            {activeTab === 'booking' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('info')}
            className={cn(
              "flex-1 py-4 text-[13px] font-bold tracking-wider transition-all relative",
              activeTab === 'info' ? "text-primary" : "text-slate-400 dark:text-slate-500"
            )}
          >
            INFORMACIÓN
            {activeTab === 'info' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <main className="w-full max-w-md mx-auto px-4 py-6 pb-24">
        {activeTab === 'booking' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
            <div className="p-5 bg-primary/5 border border-primary/10 rounded-3xl space-y-3">
              <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Horarios de Atención
              </h4>
              <div className="flex justify-between items-end">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Lunes a Domingos</p>
                <p className="text-lg font-black text-primary tracking-tight">
                  {club.openTime} <span className="text-[10px] font-bold -ml-1 uppercase text-primary/60">a</span> {club.closeTime}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
