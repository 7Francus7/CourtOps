'use client'

import React from 'react'
import { getTournaments } from '@/actions/tournaments'
import { Plus, Trophy, Calendar, Users, ChevronRight, Sword } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useLanguage } from '@/contexts/LanguageContext'

export default function TournamentsPage() {
       const { t } = useLanguage()
       const [tournaments, setTournaments] = React.useState<any[]>([])
       const [loading, setLoading] = React.useState(true)

       React.useEffect(() => {
              getTournaments().then(data => {
                     setTournaments(data)
                     setLoading(false)
              })
       }, [])

       if (loading) return <div className="p-10 text-center text-muted-foreground">{t('loading')}...</div>

       return (
              <div className="p-6 space-y-6 max-w-7xl mx-auto">
                     <header className="flex justify-between items-center">
                            <div>
                                   <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                          <Trophy className="text-yellow-500" />
                                          {t('tournaments')}
                                   </h1>
                                   <p className="text-muted-foreground mt-2 md:text-base text-sm">{t('tournaments_desc')}</p>
                            </div>
                            <Link
                                   href="/torneos/nuevo"
                                   className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                   <Plus size={20} />
                                   {t('create_tournament')}
                            </Link>
                     </header>

                     {tournaments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-border/50 rounded-3xl text-center">
                                   <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                          <Trophy size={40} className="text-muted-foreground/50" />
                                   </div>
                                   <h2 className="text-xl font-bold text-foreground mb-2">{t('no_tournaments')}</h2>
                                   <p className="text-muted-foreground max-w-sm mb-8">{t('no_tournaments_desc')}</p>
                            </div>
                     ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   {tournaments.map((tournament: any) => (
                                          <Link
                                                 key={tournament.id}
                                                 href={`/torneos/${tournament.id}`}
                                                 // IMPROVED LIGHT MODE: Added shadow-sm, hover:shadow-xl, stronger border
                                                 className="bg-card group border border-border/60 hover:border-primary/50 rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
                                          >
                                                 <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                                        <Trophy size={100} />
                                                 </div>

                                                 <div className="relative z-10">
                                                        <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-4 ${tournament.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-500' :
                                                               tournament.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-500' :
                                                                      'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-500'
                                                               }`}>
                                                               {tournament.status === 'DRAFT' && t('draft')}
                                                               {tournament.status === 'ACTIVE' && t('active')}
                                                               {tournament.status === 'COMPLETED' && t('completed')}
                                                        </span>

                                                        <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{tournament.name}</h3>
                                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                                                               <Calendar size={14} />
                                                               {format(new Date(tournament.startDate), "d 'de' MMMM", { locale: es })}
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 py-4 border-t border-border/50">
                                                               <div className="text-center">
                                                                      <span className="block text-lg font-bold text-foreground">{tournament._count?.categories || 0}</span>
                                                                      <span className="text-[10px] text-muted-foreground uppercase font-bold">{t('categories')}</span>
                                                               </div>
                                                               <div className="text-center border-l border-border/50">
                                                                      <span className="block text-lg font-bold text-foreground">{tournament._count?.teams || 0}</span>
                                                                      <span className="text-[10px] text-muted-foreground uppercase font-bold">{t('teams')}</span>
                                                               </div>
                                                               <div className="text-center border-l border-border/50">
                                                                      <span className="block text-lg font-bold text-foreground">{tournament._count?.matches || 0}</span>
                                                                      <span className="text-[10px] text-muted-foreground uppercase font-bold">{t('matches')}</span>
                                                               </div>
                                                        </div>

                                                        <div className="mt-4 flex items-center justify-between text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                                               <span>{t('manage_tournament')}</span>
                                                               <ChevronRight size={16} />
                                                        </div>
                                                 </div>
                                          </Link>
                                   ))}
                            </div>
                     )}
              </div>
       )
}
