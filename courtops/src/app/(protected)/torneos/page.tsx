import { getTournaments } from '@/actions/tournaments'
import { Plus, Trophy, Calendar, Users, ChevronRight, Sword } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function TournamentsPage() {
       const tournaments = await getTournaments()

       return (
              <div className="p-6 space-y-6 max-w-7xl mx-auto">
                     <header className="flex justify-between items-center">
                            <div>
                                   <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                          <Trophy className="text-yellow-500" />
                                          Torneos y Ligas
                                   </h1>
                                   <p className="text-slate-400 mt-2">Gestiona campeonatos, zonas, fixtures y resultados.</p>
                            </div>
                            <Link
                                   href="/torneos/nuevo"
                                   className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                   <Plus size={20} />
                                   Crear Torneo
                            </Link>
                     </header>

                     {tournaments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/5 rounded-3xl text-center">
                                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                          <Trophy size={40} className="text-white/20" />
                                   </div>
                                   <h2 className="text-xl font-bold text-white mb-2">No tienes torneos activos</h2>
                                   <p className="text-slate-400 max-w-sm mb-8">Crea tu primer torneo para empezar a gestionar inscripciones y partidos.</p>
                            </div>
                     ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   {tournaments.map((tournament: any) => (
                                          <Link
                                                 key={tournament.id}
                                                 href={`/torneos/${tournament.id}`}
                                                 className="bg-[#18181b] group border border-white/10 hover:border-primary/50 rounded-2xl p-6 transition-all hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] relative overflow-hidden"
                                          >
                                                 <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                                        <Trophy size={100} />
                                                 </div>

                                                 <div className="relative z-10">
                                                        <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-4 ${tournament.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                                                                      tournament.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-500' :
                                                                             'bg-yellow-500/20 text-yellow-500'
                                                               }`}>
                                                               {tournament.status === 'DRAFT' && 'Borrador'}
                                                               {tournament.status === 'ACTIVE' && 'En Curso'}
                                                               {tournament.status === 'COMPLETED' && 'Finalizado'}
                                                        </span>

                                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{tournament.name}</h3>
                                                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                                                               <Calendar size={14} />
                                                               {format(new Date(tournament.startDate), "d 'de' MMMM", { locale: es })}
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 py-4 border-t border-white/5">
                                                               <div className="text-center">
                                                                      <span className="block text-lg font-bold text-white">{tournament._count?.categories || 0}</span>
                                                                      <span className="text-[10px] text-slate-500 uppercase font-bold">Categ.</span>
                                                               </div>
                                                               <div className="text-center border-l border-white/5">
                                                                      <span className="block text-lg font-bold text-white">{tournament._count?.teams || 0}</span>
                                                                      <span className="text-[10px] text-slate-500 uppercase font-bold">Equipos</span>
                                                               </div>
                                                               <div className="text-center border-l border-white/5">
                                                                      <span className="block text-lg font-bold text-white">{tournament._count?.matches || 0}</span>
                                                                      <span className="text-[10px] text-slate-500 uppercase font-bold">Partidos</span>
                                                               </div>
                                                        </div>

                                                        <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-500 group-hover:text-white transition-colors">
                                                               <span>Gestionar Torneo</span>
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
