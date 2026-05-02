'use client'

import React from 'react'
import { getTournaments } from '@/actions/tournaments'
import {
       Plus,
       Trophy,
       Calendar,
       Users,
       ChevronRight,
       Swords,
       Search,
       GitBranch
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useLanguage } from '@/contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TournamentRecord {
       id: string | number
       name: string
       status: string
       startDate: string | Date
       _count?: { categories?: number; teams?: number; matches?: number }
       [key: string]: unknown
}

export default function TournamentsPage() {
       const { t } = useLanguage()
       const [tournaments, setTournaments] = React.useState<TournamentRecord[]>([])
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
              const active = tournaments.filter((t: TournamentRecord) => t.status === 'ACTIVE').length
              const totalTeams = tournaments.reduce((acc: number, t: TournamentRecord) => acc + (t._count?.teams || 0), 0)
              const upcoming = tournaments.filter((t: TournamentRecord) => t.status === 'DRAFT').length
              return { active, totalTeams, upcoming }
       }, [tournaments])

       // Filter Logic
       const filteredTournaments = tournaments.filter((t: TournamentRecord) => {
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
              <div className="p-4 md:p-8 space-y-4 md:space-y-8 max-w-7xl mx-auto overflow-x-hidden">

                     {/* HEADER SECTION */}
                     <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                   <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight flex items-center gap-2 md:gap-3">
                                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent pb-1 truncate">
                                                 {t('tournaments')}
                                          </span>
                                          <Trophy className="text-yellow-500 fill-yellow-500/20 w-7 h-7 md:w-10 md:h-10 shrink-0" />
                                   </h1>
                                   <p className="text-muted-foreground mt-1 font-medium text-sm md:text-base hidden sm:block">
                                          {t('tournaments_subtitle')}
                                   </p>
                            </div>
                            <Link
                                   href="/torneos/nuevo"
                                   className="group relative inline-flex items-center gap-1.5 px-4 py-2.5 md:px-6 md:py-3 bg-primary text-primary-foreground font-black uppercase tracking-wider text-xs md:text-sm rounded-xl overflow-hidden transition-all hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 shrink-0"
                            >
                                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                   <Plus size={16} className="relative z-10" />
                                   <span className="relative z-10 hidden sm:inline">{t('create_tournament')}</span>
                                   <span className="relative z-10 sm:hidden">Nuevo</span>
                            </Link>
                     </div>

                     {/* KPI STATS */}
                     <div className="grid grid-cols-3 gap-2 md:gap-4">
                            <StatCard
                                   icon={<Swords className="w-5 h-5 text-blue-500" />}
                                   label={t('active_tournaments')}
                                   value={stats.active}
                                   color="bg-blue-500/10 text-blue-500"
                            />
                            <StatCard
                                   icon={<Users className="w-5 h-5 text-emerald-500" />}
                                   label={t('registered_teams')}
                                   value={stats.totalTeams}
                                   color="bg-emerald-500/10 text-emerald-500"
                            />
                            <StatCard
                                   icon={<Calendar className="w-5 h-5 text-purple-500" />}
                                   label={t('upcoming_events')}
                                   value={stats.upcoming}
                                   color="bg-purple-500/10 text-purple-500"
                            />
                     </div>

                     {/* CONTROLS & FILTERS */}
                     <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center justify-between bg-card/50 backdrop-blur-sm p-2 rounded-xl md:rounded-2xl border border-border/50">
                            <div className="flex p-1 bg-muted/50 rounded-xl w-full md:w-auto overflow-x-auto">
                                   {(['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED'] as const).map((tab) => (
                                          <button
                                                 key={tab}
                                                 onClick={() => setFilter(tab)}
                                                 className={cn(
                                                        "flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                                        filter === tab
                                                               ? "bg-background text-foreground shadow-sm"
                                                               : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                                 )}
                                          >
                                                 {tab === 'ALL' && t('all')}
                                                 {tab === 'ACTIVE' && t('active')}
                                                 {tab === 'DRAFT' && t('draft')}
                                                 {tab === 'COMPLETED' && t('completed')}
                                          </button>
                                   ))}
                            </div>

                            <div className="relative w-full md:w-64">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                   <input
                                          placeholder={t('search_tournament')}
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
                                   t={t}
                            />
                     ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   <AnimatePresence mode="popLayout">
                                          {filteredTournaments.map((tournament: TournamentRecord) => (
                                                 <TournamentCard key={String(tournament.id)} tournament={tournament} t={t} />
                                          ))}
                                   </AnimatePresence>
                            </div>
                     )}
              </div>
       )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
       return (
              <div className="bg-card border border-border/50 p-3 md:p-5 rounded-xl md:rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-4 shadow-sm hover:shadow-md transition-shadow text-center md:text-left">
                     <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0", color)}>
                            {icon}
                     </div>
                     <div className="min-w-0">
                            <p className="text-muted-foreground text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-tight">{label}</p>
                            <p className="text-xl md:text-2xl font-black text-foreground tabular-nums">{value}</p>
                     </div>
              </div>
       )
}

const STATUS_GRADIENT: Record<string, string> = {
       DRAFT: 'from-amber-950 via-yellow-900/60 to-slate-900',
       ACTIVE: 'from-emerald-950 via-emerald-900/60 to-slate-900',
       COMPLETED: 'from-blue-950 via-blue-900/60 to-slate-900',
}

const STATUS_BADGE: Record<string, string> = {
       DRAFT: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
       ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
       COMPLETED: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
}

function TournamentCard({ tournament, t }: { tournament: TournamentRecord, t: (_key: string) => string }) {
       const getStatusLabel = (status: string) => {
              switch (status) {
                     case 'DRAFT': return t('draft')
                     case 'ACTIVE': return t('active')
                     case 'COMPLETED': return t('completed')
                     default: return status
              }
       }

       const gradient = STATUS_GRADIENT[tournament.status] || STATUS_GRADIENT.DRAFT
       const badge = STATUS_BADGE[tournament.status] || STATUS_BADGE.DRAFT
       const hasMatches = (tournament._count?.matches || 0) > 0

       return (
              <motion.div
                     layout
                     initial={{ opacity: 0, y: 16 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     whileHover={{ y: -4 }}
                     transition={{ duration: 0.2 }}
              >
                     <Link
                            href={`/torneos/${tournament.id}`}
                            className="block group bg-card border border-border/60 rounded-3xl overflow-hidden hover:border-[var(--primary)]/40 transition-all shadow-sm hover:shadow-2xl h-full flex flex-col"
                     >
                            {/* Card Header */}
                            <div className={cn("h-36 bg-gradient-to-br relative overflow-hidden", gradient)}>
                                   <div className="absolute inset-0 opacity-[0.07]"
                                          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                                   {/* Decorative circles */}
                                   <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-700" />
                                   <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

                                   <div className="absolute top-4 right-4 flex items-center gap-2">
                                          {tournament.status === 'ACTIVE' && (
                                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                          )}
                                          <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md", badge)}>
                                                 {getStatusLabel(tournament.status)}
                                          </span>
                                   </div>

                                   <div className="absolute bottom-4 left-5">
                                          <h3 className="text-xl font-black text-white drop-shadow-md line-clamp-1 group-hover:text-white/90 transition-colors">
                                                 {tournament.name}
                                          </h3>
                                          <div className="flex items-center gap-1.5 text-white/60 text-xs font-medium mt-1">
                                                 <Calendar size={11} />
                                                 {format(new Date(tournament.startDate as string | Date), "d 'de' MMMM yyyy", { locale: es })}
                                          </div>
                                   </div>

                                   <div className="absolute top-4 left-5">
                                          <Trophy size={20} className="text-white/20 group-hover:text-white/30 transition-colors" />
                                   </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 divide-x divide-border/50 border-b border-border/50">
                                   {[
                                          { val: tournament._count?.categories || 0, label: t('categories') },
                                          { val: tournament._count?.teams || 0, label: t('teams') },
                                          { val: tournament._count?.matches || 0, label: t('matches') },
                                   ].map(({ val, label }) => (
                                          <div key={label} className="py-3 text-center">
                                                 <span className="block text-base font-black text-foreground">{val}</span>
                                                 <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{label}</span>
                                          </div>
                                   ))}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3 flex items-center justify-between">
                                   <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          {hasMatches ? (
                                                 <><GitBranch size={13} className="text-[var(--primary)]" /><span className="font-bold text-[var(--primary)]">Fixture activo</span></>
                                          ) : (
                                                 <><Swords size={13} /><span className="font-medium">Sin fixture</span></>
                                          )}
                                   </div>
                                   <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground group-hover:text-[var(--primary)] transition-colors">
                                          {t('manage_tournament')} <ChevronRight size={13} />
                                   </div>
                            </div>
                     </Link>
              </motion.div>
       )
}

function EmptyState({ hasTournaments, isSearch, t }: { hasTournaments: boolean, isSearch: boolean, t: (_key: string) => string }) {
       if (hasTournaments && isSearch) {
              return (
                     <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                   <Search className="text-muted-foreground" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">{t('no_results')}</h3>
                            <p className="text-muted-foreground text-sm">{t('try_another_search')}</p>
                     </div>
              )
       }

       return (
              <div className="col-span-full flex flex-col items-center justify-center py-12 md:py-24 px-4 bg-card/30 border border-dashed border-border/50 rounded-2xl md:rounded-3xl text-center group">
                     <div className="w-16 h-16 md:w-24 md:h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 ring-4 md:ring-8 ring-[var(--primary)]/5">
                            <Trophy size={32} className="md:hidden text-[var(--primary)]" />
                            <Trophy size={48} className="hidden md:block text-[var(--primary)]" />
                     </div>
                     <h2 className="text-xl md:text-2xl font-black text-foreground mb-2">{t('start_first_tournament')}</h2>
                     <p className="text-muted-foreground max-w-md mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                            {t('start_tournament_desc')}
                     </p>
                     <Link
                            href="/torneos/nuevo"
                            className="px-8 py-4 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xl"
                     >
                            <Plus size={18} />
                            {t('create_tournament')}
                     </Link>
              </div>
       )
}
