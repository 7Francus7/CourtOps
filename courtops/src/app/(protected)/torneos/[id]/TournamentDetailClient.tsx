'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy, Users, Calendar, Settings, Plus, Trash2, Sword, LayoutGrid } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { createCategory, deleteCategory, createTeam, deleteTeam } from '@/actions/tournaments'
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

function CreateTeamModal({ isOpen, onClose, categoryId }: any) {
       const [loading, setLoading] = useState(false)
       const [formData, setFormData] = useState({
              name: '',
              player1Name: '',
              player1Phone: '',
              player2Name: '',
              player2Phone: ''
       })

       if (!isOpen) return null

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setLoading(true)
              if (!categoryId) {
                     toast.error('Categoría no seleccionada')
                     return
              }
              try {
                     await createTeam(categoryId, formData)
                     toast.success('Equipo inscrito')
                     onClose()
                     setFormData({ name: '', player1Name: '', player1Phone: '', player2Name: '', player2Phone: '' })
              } catch (error) {
                     toast.error('Error al inscribir')
              } finally {
                     setLoading(false)
              }
       }

       return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                     <div className="bg-[#18181b] w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-white mb-6">Inscribir Equipo</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                   <div>
                                          <label className="text-xs font-bold text-slate-400 uppercase">Nombre del Equipo</label>
                                          <input
                                                 value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                 placeholder="Ej. Los Reyes del Padel"
                                                 className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-white mt-1 outline-none focus:border-primary"
                                                 required
                                          />
                                   </div>

                                   <div className="bg-white/5 p-4 rounded-xl space-y-4 border border-white/5">
                                          <p className="text-xs font-bold text-primary uppercase">Jugador 1</p>
                                          <div className="grid grid-cols-2 gap-4">
                                                 <input
                                                        value={formData.player1Name} onChange={e => setFormData({ ...formData, player1Name: e.target.value })}
                                                        placeholder="Nombre Completo"
                                                        className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary"
                                                        required
                                                 />
                                                 <input
                                                        value={formData.player1Phone} onChange={e => setFormData({ ...formData, player1Phone: e.target.value })}
                                                        placeholder="Teléfono"
                                                        className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary"
                                                 />
                                          </div>
                                   </div>

                                   <div className="bg-white/5 p-4 rounded-xl space-y-4 border border-white/5">
                                          <p className="text-xs font-bold text-purple-500 uppercase">Jugador 2</p>
                                          <div className="grid grid-cols-2 gap-4">
                                                 <input
                                                        value={formData.player2Name} onChange={e => setFormData({ ...formData, player2Name: e.target.value })}
                                                        placeholder="Nombre Completo"
                                                        className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary"
                                                        required
                                                 />
                                                 <input
                                                        value={formData.player2Phone} onChange={e => setFormData({ ...formData, player2Phone: e.target.value })}
                                                        placeholder="Teléfono"
                                                        className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary"
                                                 />
                                          </div>
                                   </div>

                                   <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                                          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white">Cancelar</button>
                                          <button disabled={loading} className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50">
                                                 {loading ? 'Guardando...' : 'Inscribir Equipo'}
                                          </button>
                                   </div>
                            </form>
                     </div>
              </div>
       )
}
