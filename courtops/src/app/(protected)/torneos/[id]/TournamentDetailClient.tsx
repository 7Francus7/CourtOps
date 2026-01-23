'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Trophy, Users, Calendar, Settings, Plus, Trash2, Sword, LayoutGrid, Search, UserPlus, AlertCircle, ChevronsUpDown, Check, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { createCategory, deleteCategory, createTeam, deleteTeam, searchClients, createClientWithCategory, generateFixture, deleteFixture, setMatchResult } from '@/actions/tournaments'
import { motion, AnimatePresence } from 'framer-motion'

const getCategoryValue = (cat: string): number | null => {
       if (!cat) return null;
       const match = cat.match(/\d+/);
       return match ? parseInt(match[0], 10) : null;
};

const isAllowedToPlay = (playerCat: string, tournamentCat: string): { allowed: boolean; reason?: string } => {
       if (!playerCat || !tournamentCat) return { allowed: true };

       const pVal = getCategoryValue(playerCat);
       const tVal = getCategoryValue(tournamentCat);
       const isSumTournament = tournamentCat.toLowerCase().includes('suma');

       if (pVal !== null && tVal !== null) {
              if (isSumTournament) return { allowed: true };
              if (pVal < tVal) {
                     return {
                            allowed: false,
                            reason: `Nivel superior`
                     };
              }
              return { allowed: true };
       }

       const pLow = playerCat.toLowerCase();
       const tLow = tournamentCat.toLowerCase();

       if (!isSumTournament && pLow !== tLow && !pLow.includes(tLow) && !tLow.includes(pLow)) {
              return { allowed: false, reason: "Categoría no coincide" };
       }

       return { allowed: true };
};

const validateTeamSum = (p1Cat: string, p2Cat: string, tournamentCat: string): { allowed: boolean; reason?: string } => {
       if (!tournamentCat.toLowerCase().includes('suma')) return { allowed: true };

       const tLimit = getCategoryValue(tournamentCat);
       const v1 = getCategoryValue(p1Cat);
       const v2 = getCategoryValue(p2Cat);

       if (tLimit !== null && v1 !== null && v2 !== null) {
              const teamSum = v1 + v2;
              if (teamSum < tLimit) {
                     return {
                            allowed: false,
                            reason: `Suma ${teamSum} es superior al nivel permitido (mínimo ${tLimit})`
                     };
              }
       }
       return { allowed: true };
};

export default function TournamentDetailClient({ tournament }: { tournament: any }) {
       const [activeTab, setActiveTab] = useState('overview')
       const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false)

       return (
              <div className="p-6 max-w-7xl mx-auto space-y-6">
                     {/* Header */}
                     <div className="flex flex-col gap-4">
                            <Link href="/torneos" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors w-fit">
                                   <ArrowLeft size={16} />
                                   Volver a Torneos
                            </Link>

                            <div className="flex justify-between items-start">
                                   <div>
                                          <div className="flex items-center gap-3 mb-2">
                                                 <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tournament.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                                                        tournament.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-500' :
                                                               'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                        {tournament.status === 'DRAFT' ? 'Borrador' : tournament.status === 'ACTIVE' ? 'En Curso' : 'Finalizado'}
                                                 </div>
                                                 <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        {format(new Date(tournament.startDate), "d 'de' MMMM, yyyy", { locale: es })}
                                                 </span>
                                          </div>
                                          <h1 className="text-4xl font-extrabold text-white tracking-tight">{tournament.name}</h1>
                                   </div>

                                   <button className="bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                          <Settings size={18} />
                                          Configurar
                                   </button>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto">
                                   <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutGrid} label="Resumen" />
                                   <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={Trophy} label="Categorías" />
                                   <TabButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} icon={Users} label="Inscripciones" />
                                   <TabButton active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} icon={Sword} label="Partidos" />
                            </div>
                     </div>

                     {/* Content Content */}
                     <div className="min-h-[400px]">
                            {activeTab === 'overview' && <OverviewTab tournament={tournament} />}
                            {activeTab === 'categories' && <CategoriesTab tournament={tournament} onAdd={() => setIsCreateCategoryModalOpen(true)} />}
                            {activeTab === 'teams' && <TeamsTab tournament={tournament} />}
                            {activeTab === 'matches' && <MatchesTab tournament={tournament} />}
                     </div>

                     <CreateCategoryModal
                            isOpen={isCreateCategoryModalOpen}
                            onClose={() => setIsCreateCategoryModalOpen(false)}
                            tournamentId={tournament.id}
                     />
              </div>
       )
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
       return (
              <button
                     onClick={onClick}
                     className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${active
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
                            }`}
              >
                     <Icon size={18} />
                     {label}
              </button>
       )
}

function OverviewTab({ tournament }: { tournament: any }) {
       return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <StatsCard label="Categorías" value={tournament.categories.length} icon={Trophy} color="text-yellow-500" />
                     {/* Simple count of teams across all categories */}
                     <StatsCard
                            label="Parejas Inscritas"
                            value={tournament.categories.reduce((acc: any, cat: any) => acc + cat.teams.length, 0)}
                            icon={Users}
                            color="text-blue-500"
                     />
                     <StatsCard label="Partidos Programados" value={tournament.matches?.length || 0} icon={Sword} color="text-green-500" />

                     <div className="col-span-full bg-[#18181b] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Estado del Torneo</h3>
                            {tournament.categories.length === 0 ? (
                                   <div className="text-center py-10 text-slate-500">
                                          <p>No hay categorías configuradas. Ve a la pestaña "Categorías" para comenzar.</p>
                                   </div>
                            ) : (
                                   <div className="space-y-4">
                                          {tournament.categories.map((cat: any) => (
                                                 <div key={cat.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                               <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 font-bold">
                                                                      {cat.name.substring(0, 2)}
                                                               </div>
                                                               <div>
                                                                      <h4 className="font-bold text-white">{cat.name}</h4>
                                                                      <p className="text-xs text-slate-400">{cat.teams.length} parejas • {cat.gender === 'MALE' ? 'Masculino' : cat.gender === 'FEMALE' ? 'Femenino' : 'Mixto'}</p>
                                                               </div>
                                                        </div>
                                                        <div className="text-right">
                                                               <span className="text-sm font-bold text-primary">${cat.price}</span>
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>
                            )}
                     </div>
              </div>
       )
}

function StatsCard({ label, value, icon: Icon, color }: any) {
       return (
              <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Icon size={80} />
                     </div>
                     <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
                            <p className={`text-4xl font-extrabold mt-2 ${color}`}>{value}</p>
                     </div>
              </div>
       )
}

function CategoriesTab({ tournament, onAdd }: { tournament: any, onAdd: () => void }) {
       const handleDelete = async (id: string) => {
              if (confirm('¿Estás seguro de eliminar esta categoría? Se borrarán todos los equipos asociados.')) {
                     const res = await deleteCategory(id)
                     if (res.success) {
                            toast.success('Categoría eliminada')
                     } else {
                            toast.error('Error al eliminar')
                     }
              }
       }

       return (
              <div className="space-y-6">
                     <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Categorías Habilitadas</h3>
                            <button
                                   onClick={onAdd}
                                   className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                   <Plus size={16} />
                                   Nueva Categoría
                            </button>
                     </div>

                     {tournament.categories.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                   <Trophy className="mx-auto text-white/20 mb-4" size={48} />
                                   <p className="text-slate-400 text-sm">No hay categorías creadas aún.</p>
                            </div>
                     ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {tournament.categories.map((cat: any) => (
                                          <div key={cat.id} className="bg-[#18181b] p-6 rounded-2xl border border-white/10 flex justify-between items-start group">
                                                 <div>
                                                        <h4 className="text-xl font-bold text-white">{cat.name}</h4>
                                                        <div className="flex gap-2 mt-2">
                                                               <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-white/70">
                                                                      {cat.gender}
                                                               </span>
                                                               <span className="text-[10px] font-bold bg-green-500/10 px-2 py-1 rounded text-green-500">
                                                                      ${cat.price}
                                                               </span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 mt-4 font-medium">
                                                               <Users size={14} className="inline mr-1" />
                                                               {cat.teams.length} Parejas inscritas
                                                        </p>
                                                 </div>
                                                 <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="text-slate-600 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                                                 >
                                                        <Trash2 size={18} />
                                                 </button>
                                          </div>
                                   ))}
                            </div>
                     )}
              </div>
       )
}

function TeamsTab({ tournament }: { tournament: any }) {
       const [selectedCategory, setSelectedCategory] = useState<string>(tournament.categories[0]?.id || '')
       const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false)

       // Ensure we have a valid selection or default to first
       const activeCategoryId = selectedCategory || tournament.categories[0]?.id
       const activeCategory = tournament.categories.find((c: any) => c.id === activeCategoryId)

       const handleDeleteTeam = async (teamId: string) => {
              if (confirm('¿Eliminar esta pareja?')) {
                     await deleteTeam(teamId)
                     toast.success('Pareja eliminada')
              }
       }

       if (tournament.categories.length === 0) {
              return (
                     <div className="text-center py-20">
                            <p className="text-slate-500">Primero debes crear una categoría para inscribir parejas.</p>
                     </div>
              )
       }

       return (
              <div className="space-y-6">
                     <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#18181b] p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                                   {tournament.categories.map((cat: any) => (
                                          <button
                                                 key={cat.id}
                                                 onClick={() => setSelectedCategory(cat.id)}
                                                 className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeCategoryId === cat.id
                                                        ? 'bg-white text-black'
                                                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                                        }`}
                                          >
                                                 {cat.name}
                                          </button>
                                   ))}
                            </div>
                            <button
                                   onClick={() => setIsAddTeamModalOpen(true)}
                                   className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                            >
                                   <Plus size={16} />
                                   Inscribir Pareja
                            </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {!activeCategory || activeCategory.teams.length === 0 ? (
                                   <div className="col-span-full text-center py-10 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                          <Users className="mx-auto text-white/20 mb-4" size={40} />
                                          <p className="text-slate-400 text-sm">No hay parejas inscritas en {activeCategory?.name || 'esta categoría'}.</p>
                                   </div>
                            ) : (
                                   activeCategory.teams.map((team: any) => (
                                          <div key={team.id} className="bg-[#18181b] p-5 rounded-xl border border-white/10 group hover:border-white/20 transition-colors">
                                                 <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                               <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">Pareja Inscrita</span>
                                                               <h4 className="font-bold text-white text-lg leading-tight">{team.player1Name} <span className="text-white/30">&</span> {team.player2Name}</h4>
                                                        </div>
                                                        <button onClick={() => handleDeleteTeam(team.id)} className="text-white/20 hover:text-red-500 transition-colors">
                                                               <Trash2 size={16} />
                                                        </button>
                                                 </div>
                                                 <div className="space-y-2">
                                                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                                                               <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">J1</div>
                                                               <div>
                                                                      <p className="text-sm font-bold text-white/90">{team.player1Name}</p>
                                                                      <p className="text-xs text-white/40">{team.player1Phone || 'Sin teléfono'}</p>
                                                               </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                                                               <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-xs">J2</div>
                                                               <div>
                                                                      <p className="text-sm font-bold text-white/90">{team.player2Name}</p>
                                                                      <p className="text-xs text-white/40">{team.player2Phone || 'Sin teléfono'}</p>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   ))
                            )}
                     </div>

                     <CreateTeamModal
                            isOpen={isAddTeamModalOpen}
                            onClose={() => setIsAddTeamModalOpen(false)}
                            categoryId={activeCategoryId}
                            categoryName={activeCategory?.name}
                     />
              </div>
       )
}

function MatchesTab({ tournament }: { tournament: any }) {
       const [generating, setGenerating] = useState<string | null>(null)
       const [zonesInput, setZonesInput] = useState<{ [key: string]: number }>({})
       const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null)

       const [editingMatch, setEditingMatch] = useState<any>(null)
       const [isResultModalOpen, setIsResultModalOpen] = useState(false)

       // Set default active tab
       React.useEffect(() => {
              if (!activeCategoryTab && tournament.categories.length > 0) {
                     setActiveCategoryTab(tournament.categories[0].id)
              }
       }, [tournament.categories, activeCategoryTab])

       const handleGenerate = async (categoryId: string) => {
              if (generating) return
              const zones = zonesInput[categoryId] || 1

              setGenerating(categoryId)
              try {
                     const res = await generateFixture(categoryId, zones)
                     if (res.success) {
                            toast.success('Fixture generado exitosamente')
                     } else {
                            toast.error(res.error || 'Error al generar fixture')
                     }
              } catch (e) {
                     toast.error('Error inesperado')
              } finally {
                     setGenerating(null)
              }
       }

       const handleDeleteFixture = async (categoryId: string) => {
              if (!confirm('¿Estás seguro de eliminar TODO el fixture de esta categoría? Se borrarán los partidos.')) return

              setGenerating(categoryId)
              try {
                     const res = await deleteFixture(categoryId)
                     if (res.success) {
                            toast.success('Fixture eliminado')
                     } else {
                            toast.error('Error al eliminar')
                     }
              } catch (e) {
                     toast.error('Error inesperado')
              } finally {
                     setGenerating(null)
              }
       }

       return (
              <div className="space-y-6">
                     {/* Category Selector if multiple */}
                     {tournament.categories.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                   {tournament.categories.map((cat: any) => (
                                          <button
                                                 key={cat.id}
                                                 onClick={() => setActiveCategoryTab(cat.id)}
                                                 className={cn(
                                                        "px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border",
                                                        activeCategoryTab === cat.id
                                                               ? "bg-white text-black border-white"
                                                               : "bg-transparent text-slate-400 border-white/10 hover:border-white/30"
                                                 )}
                                          >
                                                 {cat.name}
                                          </button>
                                   ))}
                            </div>
                     )}

                     {tournament.categories.map((cat: any) => {
                            if (activeCategoryTab && cat.id !== activeCategoryTab) return null

                            const catMatches = tournament.matches?.filter((m: any) => m.categoryId === cat.id) || []
                            const hasFixture = catMatches.length > 0
                            const teamCount = cat.teams.length
                            const groups = cat.groups || []

                            return (
                                   <div key={cat.id} className="space-y-6 animate-in fade-in duration-300">
                                          {/* Header / Actions */}
                                          <div className="flex justify-between items-end">
                                                 <div className="flex items-center gap-3">
                                                        <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                                                        {hasFixture && (
                                                               <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Fixture Activo</span>
                                                        )}
                                                 </div>
                                                 {hasFixture && (
                                                        <button
                                                               onClick={() => handleDeleteFixture(cat.id)}
                                                               className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
                                                        >
                                                               <Trash2 size={12} /> Reiniciar Fixture
                                                        </button>
                                                 )}
                                          </div>

                                          {!hasFixture ? (
                                                 <div className="bg-[#18181b] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center">
                                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                                               <LayoutGrid className="text-white/20" size={32} />
                                                        </div>
                                                        <h4 className="text-lg font-bold text-white mb-2">Generar Fixture</h4>
                                                        <p className="text-slate-400 text-sm max-w-md mb-8">
                                                               Crea automáticamente las zonas y partidos para las {teamCount} parejas inscritas.
                                                        </p>

                                                        {teamCount < 2 ? (
                                                               <div className="text-orange-400 text-xs font-bold bg-orange-500/10 px-4 py-2 rounded-lg">
                                                                      Insuficientes parejas (Mínimo 2)
                                                               </div>
                                                        ) : (
                                                               <div className="flex items-center gap-4 bg-white/5 p-2 pr-2 rounded-xl border border-white/5">
                                                                      <div className="flex items-center gap-3 px-3">
                                                                             <span className="text-xs font-bold text-slate-400 uppercase">Zonas:</span>
                                                                             <div className="flex items-center gap-2">
                                                                                    <button
                                                                                           onClick={() => setZonesInput({ ...zonesInput, [cat.id]: Math.max(1, (zonesInput[cat.id] || 1) - 1) })}
                                                                                           className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                                                                                    >-</button>
                                                                                    <span className="font-mono font-bold text-white w-4 text-center">{zonesInput[cat.id] || 1}</span>
                                                                                    <button
                                                                                           onClick={() => setZonesInput({ ...zonesInput, [cat.id]: (zonesInput[cat.id] || 1) + 1 })}
                                                                                           className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                                                                                    >+</button>
                                                                             </div>
                                                                      </div>
                                                                      <button
                                                                             onClick={() => handleGenerate(cat.id)}
                                                                             disabled={generating === cat.id}
                                                                             className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                                                                      >
                                                                             {generating === cat.id ? 'Generando...' : 'Generar'}
                                                                      </button>
                                                               </div>
                                                        )}
                                                 </div>
                                          ) : (
                                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                        {groups.length > 0 ? (
                                                               groups.map((group: any) => {
                                                                      const groupTeamIds = group.teams.map((t: any) => t.id)
                                                                      const groupMatches = catMatches.filter((m: any) => groupTeamIds.includes(m.homeTeamId) || groupTeamIds.includes(m.awayTeamId))

                                                                      // Sort teams by points descending
                                                                      const sortedTeams = [...group.teams].sort((a: any, b: any) => b.points - a.points)

                                                                      return (
                                                                             <div key={group.id} className="space-y-4">
                                                                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                                                                           <h4 className="font-bold text-xl text-white flex items-center gap-2">
                                                                                                  <span className="w-2 h-6 bg-primary rounded-full" />
                                                                                                  {group.name}
                                                                                           </h4>
                                                                                    </div>

                                                                                    {/* Standings Table - REAL DATA */}
                                                                                    <div className="bg-[#18181b] rounded-xl border border-white/10 overflow-hidden">
                                                                                           <table className="w-full text-sm">
                                                                                                  <thead className="bg-white/5 text-xs text-slate-400 font-bold uppercase">
                                                                                                         <tr>
                                                                                                                <th className="px-4 py-2 text-left">Pareja</th>
                                                                                                                <th className="px-2 py-2 text-center w-12">PTS</th>
                                                                                                                <th className="px-2 py-2 text-center w-10">PJ</th>
                                                                                                         </tr>
                                                                                                  </thead>
                                                                                                  <tbody className="divide-y divide-white/5">
                                                                                                         {sortedTeams.map((team: any, i: number) => (
                                                                                                                <tr key={team.id}>
                                                                                                                       <td className="px-4 py-2 text-white font-medium flex items-center gap-2">
                                                                                                                              <span className={cn("font-mono text-xs w-4", i === 0 ? "text-yellow-500 font-bold" : "text-slate-600")}>{i + 1}</span>
                                                                                                                              <span className="truncate max-w-[120px]">{team.name}</span>
                                                                                                                       </td>
                                                                                                                       <td className="px-2 py-2 text-center font-bold text-primary">{team.points}</td>
                                                                                                                       <td className="px-2 py-2 text-center text-slate-400">{team.matchesPlayed}</td>
                                                                                                                </tr>
                                                                                                         ))}
                                                                                                  </tbody>
                                                                                           </table>
                                                                                    </div>

                                                                                    {/* Matches */}
                                                                                    <div className="flex flex-col gap-2">
                                                                                           {groupMatches.map((match: any) => (
                                                                                                  <MatchCard
                                                                                                         key={match.id}
                                                                                                         match={match}
                                                                                                         onEdit={() => { setEditingMatch(match); setIsResultModalOpen(true); }}
                                                                                                  />
                                                                                           ))}
                                                                                    </div>
                                                                             </div>
                                                                      )
                                                               })
                                                        ) : (
                                                               // Fallback (No groups, just matches)
                                                               <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                      {catMatches.map((match: any) => (
                                                                             <MatchCard
                                                                                    key={match.id}
                                                                                    match={match}
                                                                                    onEdit={() => { setEditingMatch(match); setIsResultModalOpen(true); }}
                                                                             />
                                                                      ))}
                                                               </div>
                                                        )}
                                                 </div>
                                          )}
                                   </div>
                            )
                     })}

                     <MatchResultModal
                            isOpen={isResultModalOpen}
                            onClose={() => setIsResultModalOpen(false)}
                            match={editingMatch}
                     />

                     {tournament.categories.length === 0 && (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                   <Trophy size={48} className="mx-auto text-white/20 mb-4" />
                                   <p className="text-slate-400">No hay categorías configuradas.</p>
                            </div>
                     )}
              </div>
       )
}

function MatchCard({ match, onEdit }: { match: any, onEdit?: () => void }) {
       return (
              <div className="bg-[#09090b] group hover:bg-[#121215] border border-white/5 hover:border-white/10 rounded-xl p-0 overflow-hidden transition-all duration-300 shadow-sm relative flex">
                     <div className={cn("w-1.5 transition-colors", match.status === 'COMPLETED' ? "bg-green-500" : "bg-white/5 group-hover:bg-primary")} />
                     <div className="flex-1 p-4">
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
                                   <span>{match.round || 'Fase de Grupos'}</span>
                                   <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${match.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700/30 text-slate-400'}`}>
                                          {match.status === 'COMPLETED' ? (
                                                 <><Check size={10} /> Finalizado</>
                                          ) : (
                                                 <><Clock size={10} /> Programado</>
                                          )}
                                   </div>
                            </div>

                            <div className="space-y-3">
                                   {/* Home Team */}
                                   <div className="flex justify-between items-center group/team">
                                          <div className="flex items-center gap-3">
                                                 <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", match.winnerId === match.homeTeamId ? "bg-green-500 text-black" : "bg-blue-500/10 text-blue-500")}>1</div>
                                                 <p className={cn("font-bold text-sm transition-colors", match.winnerId === match.homeTeamId ? "text-green-400" : "text-white group-hover/team:text-blue-400")}>{match.homeTeam?.name || 'Pareja 1'}</p>
                                          </div>
                                          <span className={cn("font-mono text-lg font-bold", match.homeScore ? "text-white" : "text-slate-700")}>{match.homeScore || '0'}</span>
                                   </div>

                                   <div className="h-px bg-white/5 w-full my-1" />

                                   {/* Away Team */}
                                   <div className="flex justify-between items-center group/team">
                                          <div className="flex items-center gap-3">
                                                 <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", match.winnerId === match.awayTeamId ? "bg-green-500 text-black" : "bg-pink-500/10 text-pink-500")}>2</div>
                                                 <p className={cn("font-bold text-sm transition-colors", match.winnerId === match.awayTeamId ? "text-green-400" : "text-white group-hover/team:text-pink-400")}>{match.awayTeam?.name || 'Pareja 2'}</p>
                                          </div>
                                          <span className={cn("font-mono text-lg font-bold", match.awayScore ? "text-white" : "text-slate-700")}>{match.awayScore || '0'}</span>
                                   </div>
                            </div>
                     </div>

                     {/* Action Button Area */}
                     <button onClick={onEdit} className="w-12 border-l border-white/5 flex items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.04] cursor-pointer hover:bg-primary/10 transition-colors">
                            <Settings size={16} className="text-slate-600 group-hover:text-primary transition-colors" />
                     </button>
              </div>
       )
}

function MatchResultModal({ isOpen, onClose, match }: any) {
       const [loading, setLoading] = useState(false)
       const [score, setScore] = useState('')
       const [winner, setWinner] = useState<string | null>(null)

       // Pre-fill
       React.useEffect(() => {
              if (match) {
                     setScore(match.homeScore ? `${match.homeScore}${match.awayScore ? ' ' + match.awayScore : ''}` : '')
                     setWinner(match.winnerId)
              }
       }, [match])

       if (!isOpen || !match) return null

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!winner) {
                     toast.error('Selecciona un ganador')
                     return
              }
              setLoading(true)
              try {
                     await setMatchResult(match.id, {
                            homeScore: score,
                            awayScore: '',
                            winnerId: winner
                     })
                     toast.success('Resultado guardado')
                     onClose()
              } catch (error) {
                     toast.error('Error al guardar')
              } finally {
                     setLoading(false)
              }
       }

       return (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="bg-[#18181b] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-white mb-6">Cargar Resultado</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                   {/* Winner Selection */}
                                   <div className="space-y-3">
                                          <label className="text-xs font-bold text-slate-400 uppercase">¿Quién ganó?</label>
                                          <div className="grid grid-cols-2 gap-3">
                                                 <div
                                                        onClick={() => setWinner(match.homeTeamId)}
                                                        className={cn(
                                                               "p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2",
                                                               winner === match.homeTeamId ? "bg-primary/20 border-primary text-white" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                                        )}
                                                 >
                                                        <span className="font-bold text-sm text-center">{match.homeTeam?.name}</span>
                                                        {winner === match.homeTeamId && <Check size={16} />}
                                                 </div>
                                                 <div
                                                        onClick={() => setWinner(match.awayTeamId)}
                                                        className={cn(
                                                               "p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2",
                                                               winner === match.awayTeamId ? "bg-primary/20 border-primary text-white" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                                        )}
                                                 >
                                                        <span className="font-bold text-sm text-center">{match.awayTeam?.name}</span>
                                                        {winner === match.awayTeamId && <Check size={16} />}
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Score Input */}
                                   <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">Resultado (Sets)</label>
                                          <input
                                                 value={score}
                                                 onChange={e => setScore(e.target.value)}
                                                 placeholder="Ej: 6-3 6-4"
                                                 className="w-full bg-[#09090b] border border-white/10 rounded-lg p-4 text-white font-mono text-lg text-center mt-1 outline-none focus:border-primary placeholder:text-slate-600"
                                          />
                                          <p className="text-[10px] text-slate-500 mt-2 text-center">Ingresa el marcador completo de los sets.</p>
                                   </div>

                                   <div className="flex gap-3 pt-4">
                                          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                                          <button disabled={loading || !winner} className="flex-[2] py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50">
                                                 {loading ? 'Guardando...' : 'Guardar Resultado'}
                                          </button>
                                   </div>
                            </form>
                     </div>
              </div>
       )
}

function CreateCategoryModal({ isOpen, onClose, tournamentId }: any) {
       const [loading, setLoading] = useState(false)
       const [name, setName] = useState('')
       const [price, setPrice] = useState('')
       const [gender, setGender] = useState('MALE')

       if (!isOpen) return null

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setLoading(true)
              try {
                     await createCategory(tournamentId, {
                            name,
                            price: Number(price),
                            gender: gender as any
                     })
                     toast.success('Categoría creada')
                     onClose()
                     setName('')
                     setPrice('')
              } catch (error) {
                     toast.error('Error al crear')
              } finally {
                     setLoading(false)
              }
       }

       return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="bg-[#18181b] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-6">Nueva Categoría</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                   <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
                                          <input
                                                 value={name} onChange={e => setName(e.target.value)}
                                                 placeholder="Ej. 7ma Categoría"
                                                 className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-white mt-1 outline-none focus:border-primary"
                                                 required
                                          />
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                          <div>
                                                 <label className="text-xs font-bold text-slate-400 uppercase">Precio Inscripción</label>
                                                 <input
                                                        type="number"
                                                        value={price} onChange={e => setPrice(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-white mt-1 outline-none focus:border-primary"
                                                        required
                                                 />
                                          </div>
                                          <div>
                                                 <label className="text-xs font-bold text-slate-400 uppercase">Género</label>
                                                 <select
                                                        value={gender} onChange={e => setGender(e.target.value)}
                                                        className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-white mt-1 outline-none focus:border-primary"
                                                 >
                                                        <option value="MALE">Masculino</option>
                                                        <option value="FEMALE">Femenino</option>
                                                        <option value="MIXED">Mixto</option>
                                                 </select>
                                          </div>
                                   </div>




                                   <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                                          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                                          <button disabled={loading} className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50">
                                                 {loading ? 'Guardando...' : 'Crear Categoría'}
                                          </button>
                                   </div>
                            </form>
                     </div>
              </div>
       )
}

function CreateTeamModal({ isOpen, onClose, categoryId, categoryName }: any) {
       const [loading, setLoading] = useState(false)

       // Player 1 State
       const [p1Search, setP1Search] = useState('')
       const [p1Results, setP1Results] = useState<any[]>([])
       const [selectedP1, setSelectedP1] = useState<any>(null)
       const [showP1Create, setShowP1Create] = useState(false)

       // Player 2 State
       const [p2Search, setP2Search] = useState('')
       const [p2Results, setP2Results] = useState<any[]>([])
       const [selectedP2, setSelectedP2] = useState<any>(null)
       const [showP2Create, setShowP2Create] = useState(false)

       // New Client Form State
       const [newClientName, setNewClientName] = useState('')
       const [newClientPhone, setNewClientPhone] = useState('')
       const [newClientCategory, setNewClientCategory] = useState('')
       const [creatingFor, setCreatingFor] = useState<'P1' | 'P2' | null>(null)

       // Search Effects
       React.useEffect(() => {
              const timer = setTimeout(async () => {
                     if (p1Search.length >= 2 && !selectedP1) {
                            const res = await searchClients(p1Search)
                            setP1Results(res)
                     } else {
                            setP1Results([])
                     }
              }, 300)
              return () => clearTimeout(timer)
       }, [p1Search, selectedP1])

       React.useEffect(() => {
              const timer = setTimeout(async () => {
                     if (p2Search.length >= 2 && !selectedP2) {
                            const res = await searchClients(p2Search)
                            setP2Results(res)
                     } else {
                            setP2Results([])
                     }
              }, 300)
              return () => clearTimeout(timer)
       }, [p2Search, selectedP2])

       if (!isOpen) return null

       const handleCreateClient = async () => {
              if (!newClientName || !newClientPhone || !newClientCategory) return

              const res = await createClientWithCategory({
                     name: newClientName,
                     phone: newClientPhone,
                     category: newClientCategory
              })

              if (res.success && res.client) {
                     toast.success('Jugador creado')
                     if (creatingFor === 'P1') {
                            setSelectedP1(res.client)
                            setP1Search(res.client.name)
                            setShowP1Create(false)
                     } else {
                            setSelectedP2(res.client)
                            setP2Search(res.client.name)
                            setShowP2Create(false)
                     }
                     // Reset form
                     setNewClientName(''); setNewClientPhone(''); setNewClientCategory(''); setCreatingFor(null)
              } else {
                     toast.error('Error al crear jugador')
              }
       }

       const openCreate = (slot: 'P1' | 'P2') => {
              setCreatingFor(slot)
              setNewClientCategory(categoryName || '') // default to current tournament category
              if (slot === 'P1') { setShowP1Create(true); setShowP2Create(false); }
              else { setShowP2Create(true); setShowP1Create(false); }
       }

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!selectedP1 || !selectedP2) {
                     toast.error('Debes seleccionar 2 jugadores')
                     return
              }

              if (p1Invalid || p2Invalid || teamInvalid) {
                     toast.error(teamValidation.reason || 'Nivel no permitido')
                     return
              }

              setLoading(true)
              try {
                     await createTeam(categoryId, {
                            name: `${selectedP1.name} / ${selectedP2.name}`,
                            player1Id: selectedP1.id,
                            player2Id: selectedP2.id
                     })
                     toast.success('Pareja inscrita correctamente')
                     onClose()
                     // Reset everything
                     setSelectedP1(null); setSelectedP2(null); setP1Search(''); setP2Search('')
              } catch (error) {
                     toast.error('Error al inscribir')
              } finally {
                     setLoading(false)
              }
       }

       // Checking validation
       const p1Validation = selectedP1 ? isAllowedToPlay(selectedP1.category, categoryName) : { allowed: true }
       const p2Validation = selectedP2 ? isAllowedToPlay(selectedP2.category, categoryName) : { allowed: true }
       const p1Invalid = !p1Validation.allowed;
       const p2Invalid = !p2Validation.allowed;
       const teamValidation = (selectedP1 && selectedP2) ? validateTeamSum(selectedP1.category, selectedP2.category, categoryName) : { allowed: true };
       const teamInvalid = !teamValidation.allowed;
       const v1 = selectedP1 ? getCategoryValue(selectedP1.category) : null;
       const v2 = selectedP2 ? getCategoryValue(selectedP2.category) : null;
       const currentSum = (v1 !== null && v2 !== null) ? (v1 + v2) : null;

       return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="bg-[#18181b] w-full max-w-2xl rounded-2xl border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

                            {/* Create New Client Sub-Modal Overlay could be here, or just inline form. Inline is better UX. */}
                            {(showP1Create || showP2Create) ? (
                                   <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                                          <div className="flex justify-between items-center mb-4">
                                                 <h3 className="text-xl font-bold text-white">Nuevo Jugador</h3>
                                                 <button onClick={() => { setShowP1Create(false); setShowP2Create(false); }} className="text-slate-400 hover:text-white">Cancelar</button>
                                          </div>
                                          <div className="space-y-4">
                                                 <div>
                                                        <label className="text-xs font-bold text-slate-400 uppercase">Nombre Completo</label>
                                                        <input value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-primary" />
                                                 </div>
                                                 <div>
                                                        <label className="text-xs font-bold text-slate-400 uppercase">Teléfono</label>
                                                        <input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-primary" />
                                                 </div>
                                                 <div>
                                                        <label className="text-xs font-bold text-slate-400 uppercase">Categoría</label>
                                                        <input value={newClientCategory} onChange={e => setNewClientCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-primary" placeholder="Ej. 7ma" />
                                                 </div>
                                                 <button onClick={handleCreateClient} className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90">Guardar Jugador</button>
                                          </div>
                                   </div>
                            ) : (
                                   <>
                                          <h3 className="text-xl font-bold text-white mb-6">Inscribir Pareja - Categoría {categoryName}</h3>
                                          <form onSubmit={handleSubmit} className="space-y-6">
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Player 1 Selection */}
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-bold text-blue-400 uppercase">Jugador 1</label>
                                                               <div className="relative">
                                                                      <div className="absolute left-3 top-3 text-slate-500"><Search size={18} /></div>
                                                                      <input
                                                                             value={p1Search}
                                                                             onChange={e => { setP1Search(e.target.value); setSelectedP1(null); }}
                                                                             placeholder="Buscar J1..."
                                                                             className={`w-full bg-[#09090b] border ${selectedP1 ? 'border-blue-500/50 text-blue-500 font-bold' : 'border-white/10 text-white'} rounded-xl pl-10 pr-3 py-3 outline-none focus:border-blue-500`}
                                                                      />
                                                                      {/* Dropdown Results */}
                                                                      {p1Results.length > 0 && !selectedP1 && (
                                                                             <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden max-h-40 overflow-y-auto">
                                                                                    {p1Results.map(client => {
                                                                                           const validation = isAllowedToPlay(client.category, categoryName);
                                                                                           return (
                                                                                                  <div
                                                                                                         key={client.id}
                                                                                                         onClick={() => {
                                                                                                                if (!validation.allowed) return;
                                                                                                                setSelectedP1(client);
                                                                                                                setP1Search(client.name);
                                                                                                                setP1Results([]);
                                                                                                         }}
                                                                                                         className={cn(
                                                                                                                "p-3 border-b border-white/5 last:border-0 flex justify-between items-center transition-colors",
                                                                                                                validation.allowed ? "hover:bg-white/5 cursor-pointer" : "opacity-40 cursor-not-allowed grayscale bg-red-500/5"
                                                                                                         )}
                                                                                                  >
                                                                                                         <div>
                                                                                                                <p className="font-bold text-white text-sm">{client.name}</p>
                                                                                                                <p className="text-xs text-slate-400">
                                                                                                                       {client.phone} • {(client.category || 'Sin Cat.')}
                                                                                                                </p>
                                                                                                         </div>
                                                                                                         {!validation.allowed && <AlertCircle size={14} className="text-red-500" />}
                                                                                                  </div>
                                                                                           );
                                                                                    })}
                                                                             </div>
                                                                      )}
                                                                      {/* Create New Button if no results or typing */}
                                                                      {!selectedP1 && p1Search.length > 1 && p1Results.length === 0 && (
                                                                             <button type='button' onClick={() => openCreate('P1')} className="absolute right-2 top-2 p-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white flex items-center gap-1 transition-colors">
                                                                                    <UserPlus size={14} /> Nuevo
                                                                             </button>
                                                                      )}
                                                               </div>
                                                               {selectedP1 && (
                                                                      <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-xs">
                                                                             <div className="flex justify-between">
                                                                                    <span className="text-slate-400">Categoría:</span>
                                                                                    <span className={`font-bold ${p1Invalid ? 'text-red-500' : 'text-white'}`}>{selectedP1.category || 'Sin Cat.'}</span>
                                                                             </div>
                                                                             {p1Invalid && <p className="text-red-400 mt-1 flex flex-col gap-0.5"><span className="flex items-center gap-1 font-bold italic"><AlertCircle size={12} /> Nivel no permitido</span> <span className="text-[10px] opacity-80">{p1Validation.reason}</span></p>}
                                                                      </div>
                                                               )}
                                                        </div>

                                                        {/* Player 2 Selection */}
                                                        <div className="space-y-2">
                                                               <label className="text-xs font-bold text-purple-400 uppercase">Jugador 2</label>
                                                               <div className="relative">
                                                                      <div className="absolute left-3 top-3 text-slate-500"><Search size={18} /></div>
                                                                      <input
                                                                             value={p2Search}
                                                                             onChange={e => { setP2Search(e.target.value); setSelectedP2(null); }}
                                                                             placeholder="Buscar J2..."
                                                                             className={`w-full bg-[#09090b] border ${selectedP2 ? 'border-purple-500/50 text-purple-500 font-bold' : 'border-white/10 text-white'} rounded-xl pl-10 pr-3 py-3 outline-none focus:border-purple-500`}
                                                                      />
                                                                      {p2Results.length > 0 && !selectedP2 && (
                                                                             <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden max-h-40 overflow-y-auto">
                                                                                    {p2Results.map(client => {
                                                                                           const validation = isAllowedToPlay(client.category, categoryName);
                                                                                           return (
                                                                                                  <div
                                                                                                         key={client.id}
                                                                                                         onClick={() => {
                                                                                                                if (!validation.allowed) return;
                                                                                                                setSelectedP2(client);
                                                                                                                setP2Search(client.name);
                                                                                                                setP2Results([]);
                                                                                                         }}
                                                                                                         className={cn(
                                                                                                                "p-3 border-b border-white/5 last:border-0 flex justify-between items-center transition-colors",
                                                                                                                validation.allowed ? "hover:bg-white/5 cursor-pointer" : "opacity-40 cursor-not-allowed grayscale bg-red-500/5"
                                                                                                         )}
                                                                                                  >
                                                                                                         <div>
                                                                                                                <p className="font-bold text-white text-sm">{client.name}</p>
                                                                                                                <p className="text-xs text-slate-400">
                                                                                                                       {client.phone} • {(client.category || 'Sin Cat.')}
                                                                                                                </p>
                                                                                                         </div>
                                                                                                         {!validation.allowed && <AlertCircle size={14} className="text-red-500" />}
                                                                                                  </div>
                                                                                           );
                                                                                    })}
                                                                             </div>
                                                                      )}
                                                                      {!selectedP2 && p2Search.length > 1 && p2Results.length === 0 && (
                                                                             <button type='button' onClick={() => openCreate('P2')} className="absolute right-2 top-2 p-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white flex items-center gap-1 transition-colors">
                                                                                    <UserPlus size={14} /> Nuevo
                                                                             </button>
                                                                      )}
                                                               </div>
                                                               {selectedP2 && (
                                                                      <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 text-xs">
                                                                             <div className="flex justify-between">
                                                                                    <span className="text-slate-400">Categoría:</span>
                                                                                    <span className={`font-bold ${p2Invalid ? 'text-red-500' : 'text-white'}`}>{selectedP2.category || 'Sin Cat.'}</span>
                                                                             </div>
                                                                             {p2Invalid && <p className="text-red-400 mt-1 flex flex-col gap-0.5"><span className="flex items-center gap-1 font-bold italic"><AlertCircle size={12} /> Nivel no permitido</span> <span className="text-[10px] opacity-80">{p2Validation.reason}</span></p>}
                                                                      </div>
                                                               )}
                                                        </div>
                                                 </div>


                                                 {selectedP1 && selectedP2 && (
                                                        <div className={cn(
                                                               "p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1",
                                                               teamInvalid ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"
                                                        )}>
                                                               <span className="text-[10px] items-center flex gap-1 font-bold uppercase tracking-wider text-slate-400">
                                                                      Suma de Categorías
                                                               </span>
                                                               <div className="flex items-center gap-3">
                                                                      <span className="text-2xl font-black text-white">{currentSum}</span>
                                                                      {teamInvalid ? (
                                                                             <AlertCircle size={20} className="text-red-500" />
                                                                      ) : (
                                                                             <Check size={20} className="text-emerald-500" />
                                                                      )}
                                                               </div>
                                                               {teamInvalid && <p className="text-[11px] font-bold text-red-400 text-center">{teamValidation.reason}</p>}
                                                        </div>
                                                 )}

                                                 <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                                                        <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                                                        <button disabled={loading || !selectedP1 || !selectedP2 || p1Invalid || p2Invalid || teamInvalid} className="flex-[2] py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                                                               {loading ? 'Guardando...' : 'Inscribir Pareja'}
                                                        </button>
                                                 </div>
                                          </form>
                                   </>
                            )}
                     </div>
              </div>
       )
}
