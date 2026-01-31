'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getPublicAvailability, createPublicBooking, getPublicClient, getPublicBooking } from '@/actions/public-booking'
import { createPreference } from '@/actions/mercadopago'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { OpenMatch } from '@/actions/open-matches'
import OpenMatchesFeed from './OpenMatchesFeed'
import {
       CalendarDays,
       MapPin,
       User,
       Settings,
       Star,
       Wallet,
       History,
       Zap,
       ChevronRight,
       ArrowRight,
       ArrowLeft,
       LogIn,
       CheckCircle2,
       Download,
       Home,
       Clock,
       Ticket,
       Trophy,
       Calendar,
       Users,
       GripHorizontal,
       Activity,
       ShieldCheck,
       CreditCard,
       MessageCircle,
       Phone,
       Search,
       Loader2,
       AlertCircle,
       ExternalLink,
       Copy,
       Check
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

type Props = {
       club: {
              id: string
              name: string
              logoUrl?: string | null
              slug: string
              mpAlias?: string | null
              mpCvu?: string | null
              mpAccessToken?: string | null
              mpPublicKey?: string | null
              bookingDeposit?: number | null
              phone?: string | null
              themeColor?: string | null
              address?: string | null
              slotDuration?: number | null
       }
       initialDateStr: string
       openMatches?: OpenMatch[]
}

function hexToRgb(hex: string) {
       const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
       return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '34, 197, 94';
}

type BookingMode = 'guest' | 'premium' | null

export default function PublicBookingWizard({ club, initialDateStr, openMatches = [] }: Props) {
       const today = useMemo(() => new Date(initialDateStr), [initialDateStr])
       const primaryColor = club.themeColor || '#22c55e'
       const primaryRgb = hexToRgb(primaryColor)

       // Payment Return Handler
       const searchParams = useSearchParams()
       useEffect(() => {
              const status = searchParams.get('status')
              const externalRef = searchParams.get('external_reference')

              if (status === 'approved' && externalRef) {
                     getPublicBooking(Number(externalRef)).then(booking => {
                            if (booking && booking.court) {
                                   setStep(3)
                                   setCreatedBookingId(booking.id)
                                   setMode(booking.guestName ? 'guest' : 'premium')
                                   const date = new Date(booking.startTime)
                                   setSelectedDate(date)
                                   setSelectedSlot({
                                          time: format(date, 'HH:mm'),
                                          price: Number(booking.price),
                                          courtId: booking.courtId,
                                          courtName: booking.court.name
                                   })
                                   confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
                            }
                     }).catch(console.error)
              }
       }, [searchParams])

       const [step, setStep] = useState<number | 'register' | 'login' | 'matchmaking'>(0)
       const [mode, setMode] = useState<BookingMode>(null)
       const [selectedDate, setSelectedDate] = useState<Date>(today)
       const [slots, setSlots] = useState<any[]>([])
       const [loading, setLoading] = useState(true)
       const [selectedSlot, setSelectedSlot] = useState<{ time: string, price: number, courtId: number, courtName: string } | null>(null)
       const [clientData, setClientData] = useState({ name: '', lastname: '', phone: '', email: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)
       const [isPaying, setIsPaying] = useState(false)
       const [createOpenMatch, setCreateOpenMatch] = useState(false)
       const [matchLevel, setMatchLevel] = useState('6ta')
       const [matchGender, setMatchGender] = useState('Masculino')
       const [copied, setCopied] = useState(false)

       useEffect(() => {
              if (step !== 1) return
              const fetchSlots = async () => {
                     setLoading(true)
                     setSelectedSlot(null)
                     try {
                            const data = await getPublicAvailability(club.id, selectedDate)
                            setSlots(data)
                     } catch (error) {
                            console.error(error)
                     } finally {
                            setLoading(false)
                     }
              }
              fetchSlots()
       }, [selectedDate, club.id, step])

       const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today])

       const handleLogin = async (e: React.FormEvent) => {
              e.preventDefault()
              setIsSubmitting(true)
              try {
                     const client = await getPublicClient(club.id, clientData.phone)
                     if (client) {
                            const parts = client.name.split(' ')
                            const name = parts[0]
                            const lastname = parts.slice(1).join(' ') || ''
                            setClientData({ name, lastname, phone: client.phone, email: client.email || '' })
                            setMode('premium')
                            setStep(1)
                     } else {
                            alert('No encontramos una cuenta con este número. Por favor regístrate.')
                            setStep('register')
                     }
              } catch (error) {
                     console.error(error)
                     alert('Ocurrió un error al buscar tu cuenta.')
              } finally {
                     setIsSubmitting(false)
              }
       }

       const handleRegisterSubmit = (e: React.FormEvent) => {
              e.preventDefault()
              if (clientData.name && clientData.lastname && clientData.phone) {
                     setStep(1)
              }
       }

       const handleBooking = async (e: React.FormEvent) => {
              if (e) e.preventDefault()
              if (!selectedSlot) return
              setIsSubmitting(true)

              const fullName = mode === 'premium'
                     ? `${clientData.name} ${clientData.lastname}`.trim()
                     : clientData.name

              const res = await createPublicBooking({
                     clubId: club.id,
                     courtId: selectedSlot.courtId,
                     dateStr: format(selectedDate, 'yyyy-MM-dd'),
                     timeStr: selectedSlot.time,
                     clientName: fullName,
                     clientPhone: clientData.phone,
                     email: clientData.email,
                     isGuest: mode === 'guest',
                     isOpenMatch: createOpenMatch,
                     matchLevel: createOpenMatch ? matchLevel : undefined,
                     matchGender: createOpenMatch ? matchGender : undefined
              })

              if (res.success && res.bookingId) {
                     setCreatedBookingId(res.bookingId)
                     setStep(3)
                     confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
              } else {
                     alert("Error: " + res.error)
              }
              setIsSubmitting(false)
       }

       const handlePayment = async () => {
              if (!createdBookingId) return
              setIsPaying(true)
              const res = await createPreference(createdBookingId, `/p/${club.slug}`)
              setIsPaying(false)
              if (res.success && res.init_point) {
                     window.location.href = res.init_point
              } else {
                     alert("Error al generar pago: " + (res.error || 'Desconocido'))
              }
       }

       const PageWrapper = ({ children, hideHeader = false }: { children: React.ReactNode, hideHeader?: boolean }) => (
              <div
                     className="min-h-screen bg-[#F0F2F5] dark:bg-[#0A0B0E] text-[#1E293B] dark:text-[#F1F5F9] font-sans relative flex flex-col overflow-x-hidden transition-colors duration-300"
                     style={{ '--primary': primaryColor, '--primary-rgb': primaryRgb } as React.CSSProperties}
              >
                     {/* Premium Background Elements - Darker in Light Mode for contrast */}
                     <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10 opacity-60 dark:opacity-30" />

                     {!hideHeader && (
                            <header className="sticky top-0 z-50 bg-white dark:bg-[#101216]/95 backdrop-blur-xl border-b border-gray-300 dark:border-white/5 px-6 py-4 flex items-center justify-between shadow-sm">
                                   <div className="flex items-center gap-3">
                                          {(step !== 0) && (
                                                 <button
                                                        onClick={() => {
                                                               if (step === 3) setStep(0)
                                                               else if (step === 2) setStep(1)
                                                               else if (step === 1) setStep(0)
                                                               else if (step === 'matchmaking') setStep(0)
                                                               else if (step === 'login' || step === 'register') setStep(0)
                                                        }}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 transition-all active:scale-95"
                                                 >
                                                        <ArrowLeft size={20} />
                                                 </button>
                                          )}
                                          <div className="flex flex-col">
                                                 <span className="font-black text-xs uppercase tracking-[0.2em] text-primary">{club.name}</span>
                                                 <span className="text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-widest leading-none mt-0.5">Reservas Online</span>
                                          </div>
                                   </div>
                                   <ThemeToggle />
                            </header>
                     )}
                     <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 py-8 relative z-10">
                            {children}
                     </main>
              </div>
       )

       // --- STEP 0: LANDING ---
       if (step === 0) {
              return (
                     <PageWrapper hideHeader>
                            <div className="flex flex-col items-center flex-1">
                                   <div className="flex justify-end w-full mb-4">
                                          <ThemeToggle />
                                   </div>

                                   {/* Club Brand Section */}
                                   <header className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                                          <div className="relative group mb-6">
                                                 <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full scale-125 opacity-0 group-hover:opacity-70 transition-all duration-700"></div>
                                                 <div className="relative w-24 h-24 bg-white dark:bg-[#1A1F26] rounded-3xl flex items-center justify-center shadow-2xl border border-gray-300 dark:border-white/5 overflow-hidden">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                               <span className="text-primary text-4xl font-black">{club.name.substring(0, 1)}</span>
                                                        )}
                                                 </div>
                                          </div>
                                          <h2 className="text-3xl font-black tracking-tighter text-center leading-none mb-3 text-[#0F172A] dark:text-white">{club.name}</h2>
                                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-600/20">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                                 <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-800 dark:text-emerald-400">Club Abierto</span>
                                          </div>
                                   </header>

                                   <div className="w-full space-y-4 mb-10">
                                          <p className="text-center text-xs font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.2em] mb-6 px-10">Gestiona tu juego</p>

                                          <motion.button
                                                 whileHover={{ scale: 1.02, y: -2 }}
                                                 whileTap={{ scale: 0.98 }}
                                                 onClick={() => { setMode('guest'); setStep(1); }}
                                                 className="w-full p-6 rounded-[2.5rem] bg-white dark:bg-[#161B22] border border-gray-300 dark:border-white/5 shadow-xl shadow-gray-300/40 dark:shadow-black/20 flex items-center justify-between group relative overflow-hidden"
                                          >
                                                 <div className="absolute top-0 right-0 p-4 opacity-[0.05] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                                        <Calendar size={80} />
                                                 </div>
                                                 <div className="flex flex-col items-start gap-4 relative z-10 text-left">
                                                        <div className="bg-primary/20 p-2.5 rounded-2xl">
                                                               <Calendar size={28} className="text-primary" />
                                                        </div>
                                                        <div>
                                                               <h3 className="text-2xl font-black tracking-tight leading-none mb-1 text-[#0F172A] dark:text-white">Reservar</h3>
                                                               <p className="text-[#475569] dark:text-[#94A3B8] text-sm font-bold">Buscar turno disponible</p>
                                                        </div>
                                                 </div>
                                                 <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 relative z-10 shadow-sm border border-gray-200 dark:border-transparent">
                                                        <ChevronRight size={24} />
                                                 </div>
                                          </motion.button>

                                          <motion.button
                                                 whileHover={{ scale: 1.02, y: -2 }}
                                                 whileTap={{ scale: 0.98 }}
                                                 onClick={() => setStep('matchmaking')}
                                                 className="w-full p-6 rounded-[2.5rem] bg-white dark:bg-[#161B22] border border-gray-300 dark:border-white/5 shadow-xl shadow-gray-300/40 dark:shadow-black/20 flex items-center justify-between group relative overflow-hidden"
                                          >
                                                 <div className="absolute top-0 right-0 p-4 opacity-[0.05] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                                        <Trophy size={80} />
                                                 </div>
                                                 <div className="flex flex-col items-start gap-4 relative z-10 text-left">
                                                        <div className="flex items-center gap-3">
                                                               <div className="bg-primary/20 p-2.5 rounded-2xl">
                                                                      <Trophy size={28} className="text-primary" />
                                                               </div>
                                                               {openMatches.length > 0 && (
                                                                      <span className="bg-primary text-white text-[8px] font-black px-2.5 py-1 rounded-full animate-pulse tracking-widest uppercase shadow-lg shadow-primary/30">
                                                                             {openMatches.length} Jugando
                                                                      </span>
                                                               )}
                                                        </div>
                                                        <div>
                                                               <h3 className="text-2xl font-black tracking-tight leading-none mb-1 text-[#0F172A] dark:text-white">Partidos</h3>
                                                               <p className="text-[#475569] dark:text-[#94A3B8] text-sm font-bold">Sumate a un grupo abierto</p>
                                                        </div>
                                                 </div>
                                                 <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 relative z-10 shadow-sm border border-gray-200 dark:border-transparent">
                                                        <ChevronRight size={24} />
                                                 </div>
                                          </motion.button>
                                   </div>

                                   {/* MEMBER ACCESS */}
                                   <div className="w-full mt-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                                          <div className="bg-white/60 dark:bg-[#161B22]/40 backdrop-blur-md border border-gray-300 dark:border-white/5 rounded-[2.5rem] p-6 text-center shadow-lg">
                                                 <div className="flex items-center justify-center gap-4 mb-6">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-200/50 dark:bg-white/5 flex items-center justify-center text-[#475569] dark:text-[#94A3B8] border border-gray-300 dark:border-white/5">
                                                               <User size={24} />
                                                        </div>
                                                        <div className="text-left">
                                                               <h4 className="text-lg font-black tracking-tight text-[#1E293B] dark:text-white">Acceso Miembros</h4>
                                                               <p className="text-[9px] text-[#64748B] dark:text-[#94A3B8] font-black uppercase tracking-widest mt-0.5">Mis reservas y beneficios</p>
                                                        </div>
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                               onClick={() => { setMode('premium'); setStep('login'); }}
                                                               className="py-4 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all active:scale-95 shadow-sm text-[#334155] dark:text-[#CBD5E1]"
                                                        >
                                                               Login
                                                        </button>
                                                        <button
                                                               onClick={() => { setMode('premium'); setStep('register'); }}
                                                               className="py-4 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all active:scale-95 shadow-sm text-[#334155] dark:text-[#CBD5E1]"
                                                        >
                                                               Registro
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 'matchmaking') {
              return (
                     <PageWrapper>
                            <div className="space-y-6">
                                   <div className="flex flex-col gap-1">
                                          <h2 className="text-3xl font-black tracking-tighter">Partidos Abiertos</h2>
                                          <p className="text-muted-foreground text-sm font-medium">Busca nivel compatible y súmate al juego.</p>
                                   </div>
                                   <OpenMatchesFeed matches={openMatches} />
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 'login') {
              return (
                     <PageWrapper>
                            <div className="flex flex-col flex-1">
                                   <div className="mb-10 pt-4">
                                          <h2 className="text-4xl font-black tracking-tighter leading-tight mb-4 text-[#0F172A] dark:text-white">Bienvenido</h2>
                                          <p className="text-[#64748B] dark:text-[#94A3B8] text-lg font-bold">Ingresa tu número para acceder.</p>
                                   </div>

                                   <form onSubmit={handleLogin} className="space-y-6">
                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest ml-1">Teléfono</label>
                                                 <input
                                                        required
                                                        autoFocus
                                                        type="text"
                                                        value={clientData.phone}
                                                        onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                        className="w-full h-16 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-300 dark:border-white/10 px-6 text-lg font-bold outline-none ring-primary/20 focus:ring-4 focus:border-primary transition-all placeholder:text-gray-400 shadow-sm"
                                                        placeholder="Ej: 351..."
                                                 />
                                          </div>

                                          <button
                                                 type="submit"
                                                 disabled={isSubmitting}
                                                 className="w-full h-18 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                          >
                                                 {isSubmitting ? <Loader2 className="animate-spin" /> : <>Ingresar <ArrowRight size={22} /></>}
                                          </button>

                                          <p className="text-center text-sm text-[#64748B] dark:text-[#94A3B8] font-bold">¿No tienes cuenta? <button onClick={() => setStep('register')} type="button" className="text-primary font-black uppercase tracking-widest ml-1">Regístrate</button></p>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 'register') {
              return (
                     <PageWrapper>
                            <div className="flex flex-col flex-1">
                                   <div className="mb-8 pt-4">
                                          <h2 className="text-4xl font-black tracking-tighter leading-tight mb-3 text-[#0F172A] dark:text-white">Únete</h2>
                                          <p className="text-[#64748B] dark:text-[#94A3B8] text-lg font-bold leading-tight">Crea tu perfil en el Club.</p>
                                   </div>

                                   <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                                 <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest ml-1">Nombre</label>
                                                        <input required value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })} className="w-full h-15 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-300 dark:border-white/10 px-5 font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" />
                                                 </div>
                                                 <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest ml-1">Apellido</label>
                                                        <input required value={clientData.lastname} onChange={e => setClientData({ ...clientData, lastname: e.target.value })} className="w-full h-15 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-300 dark:border-white/10 px-5 font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" />
                                                 </div>
                                          </div>
                                          <div className="space-y-1">
                                                 <label className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest ml-1">WhatsApp</label>
                                                 <input required value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} className="w-full h-15 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-300 dark:border-white/10 px-5 font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" placeholder="Ej: 351..." />
                                          </div>
                                          <div className="space-y-1">
                                                 <label className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest ml-1">Email <span className="text-[8px] opacity-30">(Opcional)</span></label>
                                                 <input type="email" value={clientData.email} onChange={e => setClientData({ ...clientData, email: e.target.value })} className="w-full h-15 rounded-2xl bg-white dark:bg-[#161B22] border border-gray-300 dark:border-white/10 px-5 font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" />
                                          </div>

                                          <div className="mt-8 p-6 bg-primary/10 rounded-[2.2rem] border border-primary/20 flex gap-4 shadow-sm">
                                                 <div className="bg-primary text-white p-2.5 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                                        <ShieldCheck size={24} />
                                                 </div>
                                                 <div className="text-left">
                                                        <p className="text-sm font-black uppercase tracking-tight text-[#0F172A] dark:text-white">Cuenta Verificada</p>
                                                        <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-bold mt-1 leading-relaxed">Tu historial se habilitará automáticamente.</p>
                                                 </div>
                                          </div>

                                          <button type="submit" className="w-full h-18 bg-primary text-white rounded-[1.8rem] font-black text-lg uppercase tracking-widest shadow-2xml shadow-primary/30 mt-6 active:scale-95 transition-all">
                                                 Crear Mi Perfil
                                          </button>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 1) {
              return (
                     <PageWrapper>
                            <div className="space-y-8 pb-32">
                                   <div className="flex items-center justify-between px-1">
                                          <div className="flex items-center gap-2">
                                                 <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-md"></div>
                                                 <span className="text-[11px] font-black uppercase tracking-[0.1em] text-primary">
                                                        {mode === 'guest' ? 'Reserva de Invitado' : `Jugador: ${clientData.name}`}
                                                 </span>
                                          </div>
                                          <span className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest opacity-60">Paso 1 / 2</span>
                                   </div>

                                   <section>
                                          <div className="flex items-center gap-2 mb-4 px-1 text-[#334155] dark:text-[#94A3B8]">
                                                 <Calendar size={15} />
                                                 <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">Selecciona Fecha</h2>
                                          </div>
                                          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 snap-x -mx-6 px-6">
                                                 {days.map(d => {
                                                        const active = isSameDay(d, selectedDate)
                                                        return (
                                                               <motion.button
                                                                      key={d.toString()}
                                                                      whileTap={{ scale: 0.94 }}
                                                                      onClick={() => setSelectedDate(d)}
                                                                      className={cn(
                                                                             "flex-shrink-0 w-[76px] h-[104px] flex flex-col items-center justify-center rounded-[1.8rem] transition-all duration-300 snap-center border-2",
                                                                             active
                                                                                    ? "bg-primary border-primary text-white shadow-2xl shadow-primary/40 scale-105 z-10"
                                                                                    : "bg-white dark:bg-[#161B22] border-gray-300 dark:border-white/10 text-[#64748B] dark:text-[#94A3B8] shadow-md"
                                                                      )}
                                                               >
                                                                      <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1.5", active ? "opacity-90" : "opacity-60")}>
                                                                             {format(d, 'EEE', { locale: es })}
                                                                      </span>
                                                                      <span className="text-3xl font-black tracking-tighter">
                                                                             {format(d, 'd')}
                                                                      </span>
                                                               </motion.button>
                                                        )
                                                 })}
                                          </div>
                                   </section>

                                   <section className="space-y-6">
                                          <div className="flex items-center gap-2 mb-2 px-1 text-[#334155] dark:text-[#94A3B8]">
                                                 <Clock size={15} />
                                                 <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">Horarios Libres</h2>
                                          </div>

                                          {loading ? (
                                                 <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                        <Loader2 className="animate-spin text-primary" size={48} />
                                                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Sincronizando...</p>
                                                 </div>
                                          ) : slots.length === 0 ? (
                                                 <div className="text-center py-20 bg-white/60 dark:bg-[#161B22]/30 rounded-[2.8rem] border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center gap-5 shadow-inner">
                                                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-700 shadow-sm"><Search size={32} /></div>
                                                        <p className="text-sm font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em]">Sin turnos hoy</p>
                                                 </div>
                                          ) : (
                                                 <div className="space-y-6">
                                                        {slots.map((slot, idx) => (
                                                               <motion.div
                                                                      initial={{ opacity: 0, y: 10 }}
                                                                      whileInView={{ opacity: 1, y: 0 }}
                                                                      transition={{ delay: idx * 0.05 }}
                                                                      key={idx}
                                                                      className="bg-white dark:bg-[#161B22] border border-gray-300 dark:border-white/20 rounded-[2.8rem] p-8 shadow-2xl shadow-gray-300/60 dark:shadow-black/30 overflow-hidden relative group"
                                                               >
                                                                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/15 rounded-full blur-3xl -mr-12 -mt-12"></div>
                                                                      <div className="flex justify-between items-end mb-8 relative z-10">
                                                                             <div className="flex flex-col">
                                                                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1.5 px-2 py-0.5 bg-primary/5 rounded-full w-fit">Horario</span>
                                                                                    <span className="text-5xl font-black tracking-tighter leading-none text-[#0F172A] dark:text-white uppercase">{slot.time}</span>
                                                                             </div>
                                                                             <div className="text-right">
                                                                                    <span className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.2em] mb-2 block font-bold">Total</span>
                                                                                    <span className="text-3xl font-black text-primary leading-none shadow-sm">${slot.price}</span>
                                                                             </div>
                                                                      </div>
                                                                      <div className="grid grid-cols-2 gap-4 relative z-10">
                                                                             {slot.courts.map((court: any) => (
                                                                                    <button
                                                                                           key={court.id}
                                                                                           onClick={() => {
                                                                                                  setSelectedSlot({ time: slot.time, price: slot.price, courtId: court.id, courtName: court.name })
                                                                                                  setStep(2)
                                                                                           }}
                                                                                           className="h-15 bg-gray-50 dark:bg-white/5 hover:bg-primary hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center px-5 text-center leading-tight shadow-md border border-gray-200 dark:border-transparent hover:border-primary/50 text-[#334155] dark:text-[#E2E8F0]"
                                                                                    >
                                                                                           {court.name}
                                                                                    </button>
                                                                             ))}
                                                                      </div>
                                                               </motion.div>
                                                        ))}
                                                 </div>
                                          )}
                                   </section>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 2 && selectedSlot) {
              return (
                     <PageWrapper>
                            <div className="space-y-8 pb-32 animate-in slide-in-from-right duration-500">
                                   <div className="bg-white dark:bg-[#161B22] rounded-[2.8rem] p-9 border-2 border-primary/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                                          <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase text-[#0F172A] dark:text-white">Confirmar</h2>
                                          <p className="text-[#64748B] dark:text-[#94A3B8] text-[11px] font-black uppercase tracking-[0.3em] mb-10 border-b border-gray-100 dark:border-white/10 pb-4">Detalle del turno</p>

                                          <div className="space-y-8 text-left">
                                                 <div className="flex items-center gap-5">
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary border border-gray-300 dark:border-white/10 shrink-0 shadow-lg">
                                                               <Calendar size={28} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[10px] text-[#94A3B8] uppercase font-black tracking-[0.2em] mb-1 opacity-80">Selección</p>
                                                               <p className="font-black text-xl capitalize text-[#1E293B] dark:text-white">{format(selectedDate, 'EEEE d MMMM', { locale: es })}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center justify-between bg-primary/5 dark:bg-primary/10 p-5 rounded-[2rem] border border-primary/20">
                                                        <div className="flex items-center gap-5">
                                                               <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-black/20 flex items-center justify-center text-primary border border-primary/20 shrink-0 shadow-inner">
                                                                      <Clock size={32} />
                                                               </div>
                                                               <div>
                                                                      <p className="text-[10px] text-primary/60 uppercase font-black tracking-[0.2em] mb-1">Hora</p>
                                                                      <p className="font-black text-3xl tracking-tighter text-[#1E293B] dark:text-white">{selectedSlot.time} HS</p>
                                                               </div>
                                                        </div>
                                                        <div className="text-right">
                                                               <p className="text-[10px] text-primary/60 uppercase font-black tracking-[0.2em] mb-1">Costo</p>
                                                               <p className="font-black text-3xl text-primary tracking-tighter">${selectedSlot.price}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center gap-5">
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary border border-gray-300 dark:border-white/10 shrink-0 shadow-lg">
                                                               <MapPin size={28} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[10px] text-[#94A3B8] uppercase font-black tracking-[0.2em] mb-1 opacity-80">Cancha</p>
                                                               <p className="font-black text-xl uppercase tracking-tight text-[#1E293B] dark:text-white">{selectedSlot.courtName}</p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   <form onSubmit={handleBooking} className="space-y-6">
                                          {mode === 'guest' ? (
                                                 <div className="space-y-4">
                                                        <div className="p-7 bg-[#FFF2E2] dark:bg-[#1C1610] border-2 border-[#FFD8A8] dark:border-[#3D2B1F] rounded-[2.8rem] flex gap-5 text-left shadow-xl shadow-orange-500/10">
                                                               <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">
                                                                      <CreditCard size={28} />
                                                               </div>
                                                               <div>
                                                                      <p className="text-base font-black uppercase tracking-tight text-orange-900 dark:text-orange-300">Reserva con Seña</p>
                                                                      <p className="text-xs text-orange-900/80 dark:text-orange-200/50 font-bold mt-1 leading-relaxed">
                                                                             Deberás abonar <b>${club.bookingDeposit || 0}</b> para que el turno sea bloqueado en la grilla.
                                                                      </p>
                                                               </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                               <input required className="w-full h-18 rounded-[1.5rem] bg-white dark:bg-[#161B22] border-2 border-gray-300 dark:border-white/10 px-6 font-bold outline-none ring-primary/20 focus:ring-4 focus:border-primary transition-all text-sm shadow-md placeholder:text-gray-400" placeholder="NOMBRE COMPLETO" value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })} />
                                                               <input required type="tel" className="w-full h-18 rounded-[1.5rem] bg-white dark:bg-[#161B22] border-2 border-gray-300 dark:border-white/10 px-6 font-bold outline-none ring-primary/20 focus:ring-4 focus:border-primary transition-all text-sm shadow-md placeholder:text-gray-400" placeholder="TELÉFONO DE CONTACTO" value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} />
                                                        </div>
                                                 </div>
                                          ) : (
                                                 <div className="bg-white dark:bg-[#161B22] p-7 rounded-[2.8rem] border-2 border-primary/20 flex items-center justify-between shadow-2xl shadow-primary/10 transition-all hover:bg-primary/5">
                                                        <div className="flex gap-5 items-center">
                                                               <div className="w-16 h-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center font-black uppercase text-xl shadow-xl shadow-primary/30 border-2 border-white/20">{clientData.name[0]}</div>
                                                               <div className="text-left">
                                                                      <p className="font-black text-2xl leading-none text-[#0F172A] dark:text-white">{clientData.name} {clientData.lastname}</p>
                                                                      <p className="text-xs text-primary font-black mt-2.5 uppercase tracking-[0.2em]">{clientData.phone}</p>
                                                               </div>
                                                        </div>
                                                        <div className="bg-primary/20 p-2.5 rounded-2xl text-primary border border-primary/20" title="Cuenta Confirmada">
                                                               <ShieldCheck size={32} />
                                                        </div>
                                                 </div>
                                          )}

                                          {/* OPEN MATCH OPTION */}
                                          <div className="p-8 bg-white dark:bg-[#161B22] border-2 border-gray-200 dark:border-white/10 rounded-[2.8rem] space-y-6 shadow-2xl shadow-gray-300/50 dark:shadow-black/20 text-left relative overflow-hidden group">
                                                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-all group-hover:bg-primary/10"></div>
                                                 <div className="flex items-center justify-between relative z-10">
                                                        <div className="flex items-center gap-5 cursor-pointer" onClick={() => setCreateOpenMatch(!createOpenMatch)}>
                                                               <div className={cn("w-15 h-8.5 rounded-full px-1.5 flex items-center transition-all duration-300 shadow-inner", createOpenMatch ? "bg-primary" : "bg-gray-200 dark:bg-white/10")}>
                                                                      <div className={cn("w-6.5 h-6.5 rounded-full bg-white shadow-xl transition-all duration-300 transform", createOpenMatch ? "translate-x-6.5" : "translate-x-0")}></div>
                                                               </div>
                                                               <span className="text-[14px] font-black uppercase tracking-tight text-[#1E293B] dark:text-white">Partido Abierto</span>
                                                        </div>
                                                        <Trophy size={32} className={cn("transition-all", createOpenMatch ? "text-primary scale-110" : "text-gray-300 dark:text-white/10")} />
                                                 </div>
                                                 <AnimatePresence>
                                                        {createOpenMatch && (
                                                               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ opacity: 0 }} className="pt-6 space-y-6 border-t-2 border-dashed border-gray-100 dark:border-white/10 overflow-hidden">
                                                                      <div className="flex items-center gap-3 bg-primary/10 p-3 rounded-2xl border border-primary/20">
                                                                             <Zap size={18} className="text-primary animate-pulse" />
                                                                             <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-relaxed">Súmate a la tabla de rivales</p>
                                                                      </div>
                                                                      <div className="grid grid-cols-2 gap-5">
                                                                             <div className="space-y-2">
                                                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-1 opacity-60">Nivel</label>
                                                                                    <select value={matchLevel} onChange={e => setMatchLevel(e.target.value)} className="w-full h-14 bg-gray-50 dark:bg-black/20 border-2 border-transparent rounded-2xl text-[11px] font-black px-5 focus:ring-4 focus:ring-primary/20 focus:border-primary/30 appearance-none shadow-inner text-[#1E293B] dark:text-white">
                                                                                           <option value="8va">8VA (INICIAL)</option>
                                                                                           <option value="7ma">7MA</option>
                                                                                           <option value="6ta">6TA</option>
                                                                                           <option value="5ta">5TA</option>
                                                                                           <option value="4ta">4TA</option>
                                                                                    </select>
                                                                             </div>
                                                                             <div className="space-y-2">
                                                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-1 opacity-60">Modalidad</label>
                                                                                    <select value={matchGender} onChange={e => setMatchGender(e.target.value)} className="w-full h-14 bg-gray-50 dark:bg-black/20 border-2 border-transparent rounded-2xl text-[11px] font-black px-5 focus:ring-4 focus:ring-primary/20 focus:border-primary/30 appearance-none shadow-inner text-[#1E293B] dark:text-white">
                                                                                           <option value="Masculino">MASCULINO</option>
                                                                                           <option value="Femenino">FEMENINO</option>
                                                                                           <option value="Mixto">MIXTO</option>
                                                                                    </select>
                                                                             </div>
                                                                      </div>
                                                               </motion.div>
                                                        )}
                                                 </AnimatePresence>
                                          </div>

                                          <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#F0F2F5] dark:from-[#0A0B0E] via-[#F0F2F5]/90 dark:via-[#0A0B0E]/90 to-transparent pointer-events-none max-w-md mx-auto z-50">
                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] shadow-[0_25px_50px_-12px_rgba(var(--primary-rgb),0.5)] pointer-events-auto active:scale-[0.96] transition-all flex items-center justify-center gap-4 disabled:opacity-50 hover:brightness-110"
                                                 >
                                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <>Reservar Ahora <ArrowRight size={24} /></>}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 3 && selectedSlot) {
              const bookingLabel = mode === 'guest' ? 'Reserva en Espera' : '¡Reserva Completada!'
              const statusColor = mode === 'guest' ? 'text-orange-700 bg-orange-600/10 border-orange-500/30' : 'text-emerald-700 bg-emerald-600/10 border-emerald-500/30'

              return (
                     <PageWrapper>
                            <div className="flex flex-col items-center flex-1 animate-in zoom-in-95 duration-1000">
                                   <div className="relative mb-14 pt-16">
                                          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 opacity-80"></div>
                                          <div className="relative w-48 h-48 rounded-[4rem] bg-white dark:bg-[#161B22] border-4 border-primary/10 flex items-center justify-center text-primary shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-black/50 overflow-hidden group">
                                                 <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                                                 {mode === 'guest' ? <Clock size={110} strokeWidth={2} /> : <CheckCircle2 size={110} strokeWidth={2} />}
                                          </div>
                                          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary rounded-3xl border-8 border-[#F0F2F5] dark:border-[#0A0B0E] flex items-center justify-center text-white shadow-2xl scale-110">
                                                 <Trophy size={36} />
                                          </div>
                                   </div>

                                   <div className={cn("px-6 py-2 rounded-full border-2 text-[11px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm", statusColor)}>
                                          {bookingLabel}
                                   </div>

                                   <h2 className="text-5xl font-black tracking-tighter text-center mb-5 uppercase text-[#0F172A] dark:text-white leading-[0.9]">
                                          {mode === 'guest' ? 'Falta un Paso' : '¡Confirmado!'}
                                   </h2>

                                   <p className="text-[#334155] dark:text-[#94A3B8] text-base font-bold text-center max-w-[340px] mb-14 leading-relaxed px-4">
                                          {mode === 'guest'
                                                 ? 'Tu turno NO está asegurado aún. Para confirmarlo, debés abonar la seña ahora mismo.'
                                                 : 'La cancha ya está separada para vos. ¡Nos vemos pronto en el club!'}
                                   </p>

                                   <div className="w-full space-y-5 mb-16">
                                          <div className="bg-white dark:bg-[#161B22] border-2 border-gray-200 dark:border-white/10 rounded-[3rem] p-9 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] flex items-center justify-between text-left relative overflow-hidden group">
                                                 <div className="absolute top-0 left-0 w-3 h-full bg-primary/40 group-hover:bg-primary transition-all"></div>
                                                 <div className="flex items-center gap-6">
                                                        <div className="w-18 h-18 rounded-[1.8rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary/40 dark:text-primary/20 border border-gray-100 dark:border-white/10 shadow-inner">
                                                               <Calendar size={36} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[11px] font-black uppercase text-[#94A3B8] tracking-[0.2em] mb-2">{format(selectedDate, 'EEEE d MMMM', { locale: es })}</p>
                                                               <p className="font-black text-3xl uppercase tracking-tighter leading-none text-[#1E293B] dark:text-white">{selectedSlot.time}H — <span className="text-primary">{selectedSlot.courtName}</span></p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {mode === 'guest' && (
                                          <div className="w-full space-y-8 pt-12 border-t-2 border-gray-300 dark:border-white/10 relative">
                                                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F0F2F5] dark:bg-[#0A0B0E] px-6 py-1.5 flex items-center gap-3 border-2 border-orange-500 rounded-full shadow-lg">
                                                        <AlertCircle size={18} className="text-orange-500 animate-bounce" />
                                                        <span className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.3em]">Pagar para Reservar</span>
                                                 </div>

                                                 {club.mpAccessToken && (
                                                        <button
                                                               onClick={handlePayment}
                                                               disabled={isPaying}
                                                               className="w-full h-22 bg-[#009EE3] text-white rounded-[2.2rem] font-black text-xl uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(0,158,227,0.4)] flex items-center justify-center gap-5 active:scale-[0.96] transition-all hover:brightness-105"
                                                        >
                                                               {isPaying ? <Loader2 className="animate-spin" /> : <>Mercado Pago <ExternalLink size={28} /></>}
                                                        </button>
                                                 )}

                                                 <div className="p-9 bg-white dark:bg-[#161B22] border-2 border-primary/30 rounded-[3.2rem] shadow-2xl text-left relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-6 text-primary/10 group-hover:text-primary transition-all duration-700 pointer-events-none">
                                                               <Wallet size={120} />
                                                        </div>
                                                        <p className="text-[12px] font-black text-primary uppercase tracking-[0.4em] mb-6 inline-flex items-center gap-2">
                                                               <CreditCard size={18} /> Transferencia
                                                        </p>

                                                        <div className="space-y-6 relative z-10">
                                                               <div className="p-6 bg-gray-50 dark:bg-black/30 rounded-3xl border-2 border-gray-100 dark:border-white/5 space-y-4">
                                                                      <div>
                                                                             <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-2">Alias / CVU</p>
                                                                             <div className="flex items-center justify-between gap-4">
                                                                                    <p className="text-2xl font-black text-[#1E293B] dark:text-white tracking-tight break-all">{club.mpAlias || 'CONSULTAR'}</p>
                                                                                    <button
                                                                                           onClick={() => {
                                                                                                  navigator.clipboard.writeText(club.mpAlias || '')
                                                                                                  setCopied(true)
                                                                                                  setTimeout(() => setCopied(false), 2000)
                                                                                           }}
                                                                                           className="shrink-0 w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-white/10 active:scale-90 transition-all text-primary"
                                                                                    >
                                                                                           {copied ? <Check size={20} /> : <Copy size={20} />}
                                                                                    </button>
                                                                             </div>
                                                                      </div>
                                                                      {club.mpCvu && (
                                                                             <div>
                                                                                    <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-1">CBU/CVU Alternativo</p>
                                                                                    <p className="text-sm text-[#475569] dark:text-gray-400 font-bold select-all tracking-wider">{club.mpCvu}</p>
                                                                             </div>
                                                                      )}
                                                               </div>

                                                               <div className="pt-2">
                                                                      <a
                                                                             href={`https://wa.me/${club.phone}?text=${encodeURIComponent(`¡Hola! Ya transferí la seña para el turno de las ${selectedSlot.time}hs el ${format(selectedDate, 'd/M')}. Aquí mi comprobante.`)}`}
                                                                             target="_blank"
                                                                             rel="noreferrer"
                                                                             className="w-full h-18 bg-[#25D366] text-white rounded-[1.6rem] font-black text-[13px] uppercase tracking-[0.1em] flex items-center justify-center gap-4 shadow-[0_15px_30px_-10px_rgba(37,211,102,0.4)] hover:brightness-105 active:scale-[0.96] transition-all"
                                                                      >
                                                                             <Phone size={24} /> ENVIAR COMPROBANTE AHORA
                                                                      </a>
                                                                      <p className="text-center text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mt-4 animate-pulse">Este paso es obligatorio para asegurar el turno</p>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   )}

                                   {mode === 'premium' && (
                                          <div className="w-full grid grid-cols-2 gap-5">
                                                 <button
                                                        onClick={() => {
                                                               const text = `¡Sacamos cancha! Reservé en ${club.name} para el ${format(selectedDate, 'EEEE d', { locale: es })} a las ${selectedSlot.time}hs. ¿Quién juega? 🎾`
                                                               window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                                                        }}
                                                        className="h-20 bg-[#25D366] text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-green-600/20 active:scale-[0.94] transition-all"
                                                 >
                                                        <MessageCircle size={28} /> Invitar
                                                 </button>
                                                 <button
                                                        onClick={() => {
                                                               const start = selectedDate.toISOString().replace(/-|:|\.\d\d\d/g, "")
                                                               const duration = club.slotDuration || 90
                                                               const endDate = new Date(selectedDate.getTime() + duration * 60000)
                                                               const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")
                                                               const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Padel en ${club.name}`)}&dates=${start}/${end}&details=${encodeURIComponent(`Cancha: ${selectedSlot.courtName}`)}`
                                                               window.open(url, '_blank')
                                                        }}
                                                        className="h-20 bg-white dark:bg-[#161B22] border-2 border-gray-300 dark:border-white/10 text-[#1E293B] dark:text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl active:scale-[0.94] transition-all"
                                                 >
                                                        <Calendar size={28} /> Agendar
                                                 </button>
                                          </div>
                                   )}

                                   <button
                                          onClick={() => setStep(0)}
                                          className="mt-16 mb-12 text-[12px] font-black text-[#94A3B8] uppercase tracking-[1em] hover:text-primary transition-all duration-700 hover:opacity-100"
                                   >
                                          Finalizar
                                   </button>
                            </div>
                     </PageWrapper>
              )
       }

       return null
}
