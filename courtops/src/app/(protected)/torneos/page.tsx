'use client'

import React from 'react'
import { getTournaments } from '@/actions/tournaments'
import {
       Plus,
       Trophy,
       Calendar,
       Users,
       ChevronRight,
       Medal,
       Swords,
       LayoutGrid,
       ListFilter,
       Search
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useLanguage } from '@/contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function TournamentsPage() {
       const { t } = useLanguage()
       const [tournaments, setTournaments] = React.useState<any[]>([])
       const [loading, setLoading] = React.useState(true)
       const [filter, setFilter] = React.useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'COMPLETED'>('ALL')
       const [search, setSearch] = React.useState('')

       React.useEffect(() => {
              getTournaments().then(data => {
                     setTournaments(data)
                     setLoading(false)
              })
       }, [])

       // Stats Calculation
       const stats = React.useMemo(() => {
              const active = tournaments.filter(t => t.status === 'ACTIVE').length
              const totalTeams = tournaments.reduce((acc, t) => acc + (t._count?.teams || 0), 0)
              const upcoming = tournaments.filter(t => t.status === 'DRAFT').length
              return { active, totalTeams, upcoming }
       }, [tournaments])

       // Filter Logic
       const filteredTournaments = tournaments.filter(t => {
              const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
              const matchesFilter = filter === 'ALL' || t.status === filter
              return matchesSearch && matchesFilter
       })

       if (loading) {
              return (
                     <div className="flex h-[80vh] items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                   <div className="w-12 h-12 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                                   <p className="text-muted-foreground text-sm font-medium animate-pulse">{t('loading')}...</p>
                            </div>
                     </div>
              )
       }

       return (
              <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">

                     {/* HEADER SECTION */}
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                   <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                                 {t('tournaments')}
                                          </span>
                                          <Trophy className="text-yellow-500 fill-yellow-500/20 w-8 h-8 md:w-10 md:h-10" />
                                   </h1>
                                   <p className="text-muted-foreground mt-2 font-medium max-w-lg">
                                          Gestiona tus campeonatos, visualiza fixtures y sigue el progreso de tus competiciones en tiempo real.
                                   </p>
                            </div>
                            <Link
                                   href="/torneos/nuevo"
                                   className="group relative inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[#111] font-black uppercase tracking-wider text-sm rounded-xl overflow-hidden transition-all hover:brightness-110 shadow-lg shadow-[var(--primary)]/20 active:scale-95"
                            >
                                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                   <Plus size={18} className="relative z-10" />
                                   <span className="relative z-10">{t('create_tournament')}</span>
                            </Link>
                     </div>

                     {/* KPI STATS */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                   icon={<Swords className="w-5 h-5 text-blue-500" />}
                                   label="Torneos Activos"
                                   value={stats.active}
                                   color="bg-blue-500/10 text-blue-500"
                            />
                            <StatCard
                                   icon={<Users className="w-5 h-5 text-emerald-500" />}
                                   label="Equipos Inscritos"
                                   value={stats.totalTeams}
                                   color="bg-emerald-500/10 text-emerald-500"
                            />
                            <StatCard
                                   icon={<Calendar className="w-5 h-5 text-purple-500" />}
                                   label="Próximos Eventos"
                                   value={stats.upcoming}
                                   color="bg-purple-500/10 text-purple-500"
                            />
                     </div>

                     {/* CONTROLS & FILTERS */}
                     <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm p-2 rounded-2xl border border-border/50">
                            <div className="flex p-1 bg-muted/50 rounded-xl w-full md:w-auto overflow-x-auto">
                                   {(['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED'] as const).map((tab) => (
                                          <button
                                                 key={tab}
                                                 onClick={() => setFilter(tab)}
                                                 className={cn(
                                                        "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                                        filter === tab
                                                               ? "bg-background text-foreground shadow-sm"
                                                               : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                                 )}
                                          >
                                                 {tab === 'ALL' && 'Todos'}
                                                 {tab === 'ACTIVE' && 'En Curso'}
                                                 {tab === 'DRAFT' && 'Borradores'}
                                                 {tab === 'COMPLETED' && 'Finalizados'}
                                          </button>
                                   ))}
                            </div>

                            <div className="relative w-full md:w-64">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                   <input
                                          placeholder="Buscar torneo..."
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="w-full bg-background border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                                   />
                            </div>
                     </div>

                     {/* GRID */}
                     {filteredTournaments.length === 0 ? (
                            <EmptyState
                                   hasTournaments={tournaments.length > 0}
                                   isSearch={search.length > 0}
                            />
                     ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   <AnimatePresence mode="popLayout">
                                          {filteredTournaments.map((tournament) => (
                                                 <TournamentCard key={tournament.id} tournament={tournament} t={t} />
                                          ))}
                                   </AnimatePresence>
                            </div>
                     )}
              </div>
       )
}

function StatCard({ icon, label, value, color }: any) {
       return (
              <div className="bg-card border border-border/50 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                     <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
                            {icon}
                     </div>
                     <div>
                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{label}</p>
                            <p className="text-2xl font-black text-foreground tabular-nums">{value}</p>
                     </div>
              </div>
       )
}

function TournamentCard({ tournament, t }: any) {
       const statusColors = {
              DRAFT: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
              ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
              COMPLETED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
       }

       const statusLabels = {
              DRAFT: 'Borrador',
              ACTIVE: 'En Curso',
              COMPLETED: 'Finalizado'
       }

       return (
              <motion.div
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     whileHover={{ y: -4 }}
                     transition={{ duration: 0.2 }}
              >
                     <Link
                            href={`/torneos/${tournament.id}`}
                            className="block group bg-card border border-border/60 rounded-3xl overflow-hidden hover:border-[var(--primary)]/50 transition-all shadow-sm hover:shadow-xl h-full flex flex-col"
                     >
                            {/* Card Header Image/Pattern */}
                            <div className="h-32 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                                   <div className="absolute top-4 right-4">
                                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md", statusColors[tournament.status as keyof typeof statusColors])}>
                                                 {statusLabels[tournament.status as keyof typeof statusLabels]}
                                          </span>
                                   </div>
                                   <div className="absolute -bottom-6 -left-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500">
                                          <Trophy size={120} />
                                   </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex-1 flex flex-col relative">
                                   <div className="mb-4">
                                          <h3 className="text-xl font-black text-foreground mb-1 group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                                                 {tournament.name}
                                          </h3>
                                          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                                                 <Calendar size={12} />
                                                 {format(new Date(tournament.startDate), "EEEE d 'de' MMMM", { locale: es })}
                                          </div>
                                   </div>

                                   <div className="grid grid-cols-3 gap-2 py-4 border-t border-border/50 mt-auto">
                                          <div className="text-center group/stat">
                                                 <span className="block text-lg font-black text-foreground group-hover/stat:text-[var(--primary)] transition-colors">{tournament._count?.categories || 0}</span>
                                                 <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Categ.</span>
                                          </div>
                                          <div className="text-center border-l border-border/50 group/stat">
                                                 <span className="block text-lg font-black text-foreground group-hover/stat:text-[var(--primary)] transition-colors">{tournament._count?.teams || 0}</span>
                                                 <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Equipos</span>
                                          </div>
                                          <div className="text-center border-l border-border/50 group/stat">
                                                 <span className="block text-lg font-black text-foreground group-hover/stat:text-[var(--primary)] transition-colors">{tournament._count?.matches || 0}</span>
                                                 <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Partidos</span>
                                          </div>
                                   </div>

                                   <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                                          <div className="flex -space-x-2">
                                                 {/* Avatars Placeholder */}
                                                 {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                                               <Users size={10} />
                                                        </div>
                                                 ))}
                                          </div>
                                          <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground group-hover:text-[var(--primary)] transition-colors uppercase tracking-wider">
                                                 Gestionar
                                                 <ChevronRight size={14} />
                                          </div>
                                   </div>
                            </div>
                     </Link>
              </motion.div>
       )
}

function EmptyState({ hasTournaments, isSearch }: { hasTournaments: boolean, isSearch: boolean }) {
       if (hasTournaments && isSearch) {
              return (
                     <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <Search className="text-muted-foreground" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">No se encontraron resultados</h3>
                            <p className="text-muted-foreground text-sm">Prueba con otro término de búsqueda.</p>
                     </div>
              )
       }

       return (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-card/30 border border-dashed border-border/50 rounded-3xl text-center group">
                     <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-8 ring-[var(--primary)]/5">
                            <Trophy size={48} className="text-[var(--primary)]" />
                     </div>
                     <h2 className="text-2xl font-black text-foreground mb-2">Comienza tu Primer Torneo</h2>
                     <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                            Organiza campeonatos profesionales, gestiona inscripciones, genera fixtures automáticos y lleva el control de resultados en tiempo real.
                     </p>
                     <Link
                            href="/torneos/nuevo"
                            className="px-8 py-4 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xl"
                     >
                            <Plus size={18} />
                            Crear Torneo
                     </Link>
              </div>
       )
}

