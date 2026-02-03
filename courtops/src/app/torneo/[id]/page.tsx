'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { getPublicTournament, registerPublicTeam } from '@/actions/public-tournaments'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
       Trophy, Calendar, MapPin, Users, ChevronRight, Share2,
       CheckCircle2, Clock, ShieldCheck, UserPlus, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function PublicTournamentPage({ params }: { params: Promise<{ id: string }> }) {
       // Unwrap params using React.use() or await in async component. 
       // Since this is a client component, we use Unwrap in useEffect or async wrapper if this was RSC.
       // Actually, in Next 15 `params` is a Promise. But I marked 'use client', so I need to unwrap it or use `use`.
       // Let's use `useEffect` to fetch data, ignoring the params promise complexity in client components for a sec
       // or just use `React.use(params)` if available, but let's stick to safe prop usage.

       // Wait, Next.js 15 Client Components receive params as a Promise too? 
       // Yes. Let's handle it safely.

       const [tournamentId, setTournamentId] = useState<string | null>(null)
       const [tournament, setTournament] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [selectedCategory, setSelectedCategory] = useState<any>(null)
       const [showForm, setShowForm] = useState(false)

       // Form State
       const [formData, setFormData] = useState({
              p1Name: '', p1Phone: '',
              p2Name: '', p2Phone: '',
              teamName: ''
       })
       const [submitting, setSubmitting] = useState(false)

       useEffect(() => {
              // Unwrap params
              params.then(p => {
                     setTournamentId(p.id)
                     loadTournament(p.id)
              })
       }, [params])

       const loadTournament = async (id: string) => {
              setLoading(true)
              const data = await getPublicTournament(id)
              if (data) {
                     setTournament(data)
              }
              setLoading(false)
       }

       const handleRegister = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!selectedCategory || !tournamentId) return

              setSubmitting(true)
              const res = await registerPublicTeam(selectedCategory.id, {
                     player1Name: formData.p1Name,
                     player1Phone: formData.p1Phone,
                     player2Name: formData.p2Name,
                     player2Phone: formData.p2Phone,
                     teamName: formData.teamName
              })

              if (res.success) {
                     toast.success(`¡Inscripción exitosa!`, {
                            description: 'Te hemos registrado correctamente. Pronto te contactaremos.'
                     })
                     setShowForm(false)
                     setFormData({ p1Name: '', p1Phone: '', p2Name: '', p2Phone: '', teamName: '' })
                     loadTournament(tournamentId) // Refresh counts
              } else {
                     toast.error('Error al inscribirse', { description: res.error })
              }
              setSubmitting(false)
       }

       const handleShare = () => {
              if (navigator.share) {
                     navigator.share({
                            title: tournament?.name || 'Torneo de Padel',
                            text: `¡Inscribite al torneo ${tournament?.name}!`,
                            url: window.location.href
                     })
              } else {
                     navigator.clipboard.writeText(window.location.href)
                     toast.success('Link copiado al portapapeles')
              }
       }

       if (loading) {
              return (
                     <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-muted-foreground animate-pulse">Cargando torneo...</p>
                     </div>
              )
       }

       if (!tournament) {
              return (
                     <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                            <Trophy size={64} className="text-muted-foreground mb-4 opacity-50" />
                            <h1 className="text-2xl font-bold mb-2">Torneo no encontrado</h1>
                            <p className="text-muted-foreground">El link podría ser incorrecto o el torneo ha finalizado.</p>
                     </div>
              )
       }

       return (
              <div className="min-h-screen bg-background font-sans text-foreground pb-20">

                     {/* HERO SECTION */}
                     <div className="relative bg-black text-white overflow-hidden">
                            {/* Background Gradient/Image */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-purple-900 opacity-90"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                            <div className="relative z-10 container mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">

                                   {tournament.club?.logoUrl && (
                                          <div className="relative w-20 h-20 mb-6 rounded-full border-2 border-white/20 shadow-xl overflow-hidden">
                                                 <Image
                                                        src={tournament.club.logoUrl}
                                                        alt={tournament.club.name}
                                                        fill
                                                        className="object-cover"
                                                 />
                                          </div>
                                   )}

                                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-4">
                                          <CheckCircle2 size={12} className="text-green-400" />
                                          Inscripciones Abiertas
                                   </div>

                                   <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                                          {tournament.name}
                                   </h1>

                                   <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base text-gray-300 mb-8">
                                          <div className="flex items-center gap-2">
                                                 <Calendar size={18} className="text-primary" />
                                                 {format(new Date(tournament.startDate), "d 'de' MMMM", { locale: es })}
                                          </div>
                                          <div className="flex items-center gap-2">
                                                 <MapPin size={18} className="text-primary" />
                                                 {tournament.club?.name || 'Club'}
                                          </div>
                                          <div className="flex items-center gap-2">
                                                 <Clock size={18} className="text-primary" />
                                                 Cierre Inscripción: {tournament.endDate ? format(new Date(tournament.endDate), "d MMM", { locale: es }) : 'N/A'}
                                          </div>
                                   </div>

                                   <button onClick={handleShare} className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm font-bold backdrop-blur-sm">
                                          <Share2 size={16} /> Compartir Torneo
                                   </button>
                            </div>
                     </div>

                     {/* CONTENT SECTION */}
                     <div className="container mx-auto px-4 -mt-8 relative z-20">
                            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl">

                                   <div className="mb-8">
                                          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                 <ShieldCheck className="text-primary" />
                                                 Categorías Disponibles
                                          </h2>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                 {tournament.categories.map((cat: any) => (
                                                        <div key={cat.id} className="group relative bg-secondary/30 hover:bg-secondary/50 border border-border rounded-2xl p-5 transition-all hover:shadow-lg">
                                                               <div className="flex justify-between items-start mb-4">
                                                                      <div>
                                                                             <h3 className="text-lg font-black text-foreground">{cat.name}</h3>
                                                                             <p className="text-xs font-bold text-muted-foreground uppercase">{cat.gender === 'MALE' ? 'Caballeros' : cat.gender === 'FEMALE' ? 'Damas' : 'Mixto'}</p>
                                                                      </div>
                                                                      <span className="bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-lg">
                                                                             ${cat.price?.toLocaleString() || '-'}
                                                                      </span>
                                                               </div>

                                                               <div className="flex items-center justify-between mt-6">
                                                                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                                             <Users size={14} />
                                                                             {cat._count.teams} Equipos
                                                                      </div>
                                                                      <button
                                                                             onClick={() => { setSelectedCategory(cat); setShowForm(true) }}
                                                                             className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 hover:bg-black/90"
                                                                      >
                                                                             Inscribirse <ArrowRight size={14} />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>

                                   <div>
                                          <h2 className="text-xl font-bold mb-4">Información</h2>
                                          <p className="text-muted-foreground leading-relaxed">
                                                 Bienvenido a la página oficial de inscripción. Selecciona tu categoría y completa el formulario para reservar tu lugar.
                                                 El pago de la inscripción se coordinará directamente con el club una vez confirmada tu plaza.
                                          </p>
                                   </div>

                            </div>
                     </div>

                     {/* REGISTRATION FORM COMPONENT (Modal) */}
                     {showForm && selectedCategory && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                                   <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">

                                          {/* Modal Header */}
                                          <div className="bg-primary/10 p-6 flex justify-between items-center border-b border-primary/10">
                                                 <div>
                                                        <h3 className="text-xl font-black text-foreground">Inscripción</h3>
                                                        <p className="text-sm text-primary font-bold">Categoría {selectedCategory.name}</p>
                                                 </div>
                                                 <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                                                        Cerrar
                                                 </button>
                                          </div>

                                          {/* Modal Body (Scrollable) */}
                                          <div className="p-6 overflow-y-auto custom-scrollbar">
                                                 <form onSubmit={handleRegister} className="space-y-6">

                                                        {/* Player 1 */}
                                                        <div className="space-y-3">
                                                               <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                                                      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">1</div>
                                                                      Jugador 1 (Vos)
                                                               </div>
                                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                      <input
                                                                             required
                                                                             placeholder="Nombre y Apellido"
                                                                             className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 ring-primary outline-none"
                                                                             value={formData.p1Name}
                                                                             onChange={e => setFormData({ ...formData, p1Name: e.target.value })}
                                                                      />
                                                                      <input
                                                                             required
                                                                             placeholder="Teléfono/WhatsApp"
                                                                             type="tel"
                                                                             className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 ring-primary outline-none"
                                                                             value={formData.p1Phone}
                                                                             onChange={e => setFormData({ ...formData, p1Phone: e.target.value })}
                                                                      />
                                                               </div>
                                                        </div>

                                                        {/* Player 2 */}
                                                        <div className="space-y-3">
                                                               <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                                                      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">2</div>
                                                                      Jugador 2 (Compañero)
                                                               </div>
                                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                      <input
                                                                             required
                                                                             placeholder="Nombre y Apellido"
                                                                             className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 ring-primary outline-none"
                                                                             value={formData.p2Name}
                                                                             onChange={e => setFormData({ ...formData, p2Name: e.target.value })}
                                                                      />
                                                                      <input
                                                                             required
                                                                             placeholder="Teléfono/WhatsApp"
                                                                             type="tel"
                                                                             className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 ring-primary outline-none"
                                                                             value={formData.p2Phone}
                                                                             onChange={e => setFormData({ ...formData, p2Phone: e.target.value })}
                                                                      />
                                                               </div>
                                                        </div>

                                                        {/* Extras */}
                                                        <div className="pt-2">
                                                               <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nombre del Equipo (Opcional)</label>
                                                               <input
                                                                      placeholder="Ej: Los Invencibles"
                                                                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 ring-primary outline-none"
                                                                      value={formData.teamName}
                                                                      onChange={e => setFormData({ ...formData, teamName: e.target.value })}
                                                               />
                                                        </div>

                                                        <div className="pt-4 flex gap-3">
                                                               <button
                                                                      type="button"
                                                                      onClick={() => setShowForm(false)}
                                                                      className="flex-1 py-3 rounded-xl font-bold border border-border hover:bg-secondary transition-colors"
                                                               >
                                                                      Cancelar
                                                               </button>
                                                               <button
                                                                      type="submit"
                                                                      disabled={submitting}
                                                                      className="flex-[2] py-3 rounded-xl bg-black text-white font-bold shadow-lg shadow-black/20 hover:bg-black/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                               >
                                                                      {submitting ? 'Inscribiendo...' : 'Confirmar Inscripción'}
                                                                      {!submitting && <UserPlus size={18} />}
                                                               </button>
                                                        </div>

                                                 </form>
                                          </div>
                                   </div>
                            </div>
                     )}

              </div>
       )
}
