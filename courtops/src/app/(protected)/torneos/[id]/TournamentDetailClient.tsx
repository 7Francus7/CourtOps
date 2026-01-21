'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy, Users, Calendar, Settings, Plus, Trash2, Sword, LayoutGrid, Search, UserPlus, AlertCircle, ChevronsUpDown, Check } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { createCategory, deleteCategory, createTeam, deleteTeam, searchClients, createClientWithCategory } from '@/actions/tournaments'
import { motion, AnimatePresence } from 'framer-motion'

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
                            label="Equipos Inscritos"
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
                                                                      <p className="text-xs text-slate-400">{cat.teams.length} equipos • {cat.gender === 'MALE' ? 'Masculino' : cat.gender === 'FEMALE' ? 'Femenino' : 'Mixto'}</p>
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
                                                               {cat.teams.length} Equipos inscritos
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
              if (confirm('¿Eliminar equipo?')) {
                     await deleteTeam(teamId)
                     toast.success('Equipo eliminado')
              }
       }

       if (tournament.categories.length === 0) {
              return (
                     <div className="text-center py-20">
                            <p className="text-slate-500">Primero debes crear una categoría para inscribir equipos.</p>
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
                                   Inscribir Equipo
                            </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {!activeCategory || activeCategory.teams.length === 0 ? (
                                   <div className="col-span-full text-center py-10 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                          <Users className="mx-auto text-white/20 mb-4" size={40} />
                                          <p className="text-slate-400 text-sm">No hay equipos inscritos en {activeCategory?.name || 'esta categoría'}.</p>
                                   </div>
                            ) : (
                                   activeCategory.teams.map((team: any) => (
                                          <div key={team.id} className="bg-[#18181b] p-5 rounded-xl border border-white/10 group hover:border-white/20 transition-colors">
                                                 <div className="flex justify-between items-start mb-3">
                                                        <h4 className="font-bold text-white text-lg">{team.name}</h4>
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
       // Placeholder
       return (
              <div className="text-center py-20 bg-[#18181b] border border-white/10 rounded-2xl">
                     <Sword className="mx-auto text-white/20 mb-4" size={48} />
                     <h3 className="text-white text-lg font-bold mb-2">Fixture y Partidos</h3>
                     <p className="text-slate-500 max-w-sm mx-auto">Próximamente podrás generar zonas, sorteos y cargar resultados.</p>
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
       const [teamName, setTeamName] = useState('')

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
              if (!teamName) {
                     toast.error('Ingresa nombre del equipo')
                     return
              }

              setLoading(true)
              try {
                     await createTeam(categoryId, {
                            name: teamName,
                            player1Id: selectedP1.id,
                            player2Id: selectedP2.id
                     })
                     toast.success('Equipo inscrito correctamente')
                     onClose()
                     // Reset everything
                     setTeamName(''); setSelectedP1(null); setSelectedP2(null); setP1Search(''); setP2Search('')
              } catch (error) {
                     toast.error('Error al inscribir')
              } finally {
                     setLoading(false)
              }
       }

       // Checking validation
       const p1Invalid = selectedP1 && selectedP1.category && selectedP1.category !== categoryName
       const p2Invalid = selectedP2 && selectedP2.category && selectedP2.category !== categoryName

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
                                          <h3 className="text-xl font-bold text-white mb-6">Inscribir Equipo - Categoría {categoryName}</h3>
                                          <form onSubmit={handleSubmit} className="space-y-6">
                                                 <div>
                                                        <label className="text-xs font-bold text-slate-400 uppercase">Nombre del Equipo</label>
                                                        <input
                                                               value={teamName} onChange={e => setTeamName(e.target.value)}
                                                               placeholder="Ej. Los Reyes del Padel"
                                                               className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mt-1 outline-none focus:border-primary font-bold text-lg"
                                                               required
                                                        />
                                                 </div>

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
                                                                                    {p1Results.map(client => (
                                                                                           <div
                                                                                                  key={client.id}
                                                                                                  onClick={() => { setSelectedP1(client); setP1Search(client.name); setP1Results([]); }}
                                                                                                  className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                                                                                           >
                                                                                                  <p className="font-bold text-white text-sm">{client.name}</p>
                                                                                                  <p className="text-xs text-slate-400 flex justify-between">
                                                                                                         {client.phone}
                                                                                                         {client.category && <span className="text-blue-400 font-bold bg-blue-500/10 px-1 rounded">{client.category}</span>}
                                                                                                  </p>
                                                                                           </div>
                                                                                    ))}
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
                                                                             {p1Invalid && <p className="text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={12} /> Categoría incorrecta</p>}
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
                                                                                    {p2Results.map(client => (
                                                                                           <div
                                                                                                  key={client.id}
                                                                                                  onClick={() => { setSelectedP2(client); setP2Search(client.name); setP2Results([]); }}
                                                                                                  className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                                                                                           >
                                                                                                  <p className="font-bold text-white text-sm">{client.name}</p>
                                                                                                  <p className="text-xs text-slate-400 flex justify-between">
                                                                                                         {client.phone}
                                                                                                         {client.category && <span className="text-purple-400 font-bold bg-purple-500/10 px-1 rounded">{client.category}</span>}
                                                                                                  </p>
                                                                                           </div>
                                                                                    ))}
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
                                                                             {p2Invalid && <p className="text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={12} /> Categoría incorrecta</p>}
                                                                      </div>
                                                               )}
                                                        </div>
                                                 </div>

                                                 <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                                                        <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                                                        <button disabled={loading || !selectedP1 || !selectedP2} className="flex-[2] py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                                                               {loading ? 'Guardando...' : 'Inscribir Equipo'}
                                                        </button>
                                                 </div>
                                          </form>
                                   </>
                            )}
                     </div>
              </div>
       )
}
