'use client'

import { useState, useEffect } from 'react'
import { getClients, updateClient, deleteClient } from '@/actions/clients'
import { MessagingService } from '@/lib/messaging'
import { Users, Search, AlertCircle, CheckCircle2, MessageCircle, RefreshCw, Pencil, Trash2, X, Save, Loader2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
       initialData?: any[]
}

export default function ClientsDashboard({ initialData = [] }: Props) {
       const [clients, setClients] = useState<any[]>(initialData)
       const [loading, setLoading] = useState(initialData.length === 0)
       const [search, setSearch] = useState('')
       const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RISK' | 'LOST'>('ALL')
       const [categoryFilter, setCategoryFilter] = useState<string>('')

       // Edit State
       const [editingClient, setEditingClient] = useState<any | null>(null)
       const [actionLoading, setActionLoading] = useState(false)

       useEffect(() => {
              if (initialData.length === 0) {
                     loadClients()
              }
       }, [])

       const loadClients = async () => {
              setLoading(true)
              const res = await getClients()
              if (res.success && res.data) {
                     setClients(res.data)
              }
              setLoading(false)
       }

       const handleDelete = async (id: number) => {
              if (!confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) return

              const toastId = toast.loading('Eliminando...')
              const res = await deleteClient(id)

              if (res.success) {
                     toast.success('Cliente eliminado', { id: toastId })
                     loadClients()
              } else {
                     toast.error(res.error || 'Error al eliminar', { id: toastId })
              }
       }

       const handleUpdate = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!editingClient) return

              setActionLoading(true)
              const res = await updateClient(editingClient.id, {
                     name: editingClient.name,
                     phone: editingClient.phone,
                     email: editingClient.email,
                     category: editingClient.category,
                     notes: editingClient.notes
              })
              setActionLoading(false)

              if (res.success) {
                     toast.success('Cliente actualizado correctamente')
                     setEditingClient(null)
                     loadClients()
              } else {
                     toast.error(res.error || 'Error al actualizar')
              }
       }

       const filtered = clients.filter(c => {
              const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                     c.phone.includes(search)
              const matchesFilter = filter === 'ALL' || c.status === filter
              const matchesCategory = categoryFilter === '' || c.category === categoryFilter
              return matchesSearch && matchesFilter && matchesCategory
       })

       // Stats
       const total = clients.length
       const active = clients.filter(c => c.status === 'ACTIVE' || c.status === 'NEW').length
       const risk = clients.filter(c => c.status === 'RISK').length
       const lost = clients.filter(c => c.status === 'LOST').length

       const getStatusBadge = (status: string) => {
              switch (status) {
                     case 'ACTIVE': return <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/20">Activo</span>
                     case 'NEW': return <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-blue-500/20">Nuevo</span>
                     case 'RISK': return <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/20">En Riesgo</span>
                     case 'LOST': return <span className="bg-red-500/10 text-red-500 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-red-500/20">Inactivo</span>
                     default: return null
              }
       }

       const CATEGORIES = ['8va', '7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra']

       return (
              <div className="space-y-6 animate-in fade-in duration-500 relative">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                   <h1 className="text-2xl font-black text-foreground tracking-tight">CRM Clientes</h1>
                                   <p className="text-muted-foreground text-sm">Gestiona tu base de jugadores y recupera los inactivos.</p>
                            </div>
                            <button onClick={loadClients} className="p-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                                   <RefreshCw size={16} className={cn("text-muted-foreground", loading && "animate-spin")} />
                            </button>
                     </div>

                     {/* STATS CARDS */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard title="Total Clientes" value={total} icon={Users} color="text-slate-500" />
                            <StatCard title="Activos (30d)" value={active} icon={CheckCircle2} color="text-emerald-500" />
                            <StatCard title="En Riesgo (30-90d)" value={risk} icon={AlertCircle} color="text-amber-500" />
                            <StatCard title="Inactivos (+90d)" value={lost} icon={AlertCircle} color="text-red-500" />
                     </div>

                     {/* FILTERS */}
                     <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                   <input
                                          type="text"
                                          placeholder="Buscar por nombre o teléfono..."
                                          className="w-full pl-10 h-10 bg-card border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                   />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 items-center">
                                   <select
                                          value={categoryFilter}
                                          onChange={(e) => setCategoryFilter(e.target.value)}
                                          className="h-9 px-3 rounded-xl bg-card border border-border text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                   >
                                          <option value="">Todas las Categorías</option>
                                          {CATEGORIES.map(cat => (
                                                 <option key={cat} value={cat}>{cat}</option>
                                          ))}
                                   </select>
                                   <div className="w-px h-6 bg-border mx-1" />
                                   {(['ALL', 'ACTIVE', 'RISK', 'LOST'] as const).map(f => (
                                          <button
                                                 key={f}
                                                 onClick={() => setFilter(f)}
                                                 className={cn(
                                                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all",
                                                        filter === f
                                                               ? "bg-foreground text-background border-foreground"
                                                               : "bg-card text-muted-foreground border-border hover:bg-secondary"
                                                 )}
                                          >
                                                 {f === 'ALL' ? 'Todos' : f}
                                          </button>
                                   ))}
                            </div>
                     </div>

                     {/* TABLE */}
                     <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
                            <div className="overflow-x-auto">
                                   <table className="w-full text-left border-collapse">
                                          <thead>
                                                 <tr className="border-b border-border/50 bg-secondary/20">
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Cliente</th>
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Categoría</th>
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Estado</th>
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Última Reserva</th>
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Reservas Totales</th>
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-right">Acciones</th>
                                                 </tr>
                                          </thead>
                                          <tbody className="divide-y divide-border/50">
                                                 {loading ? (
                                                        <tr>
                                                               <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">Cargando clientes...</td>
                                                        </tr>
                                                 ) : filtered.length === 0 ? (
                                                        <tr>
                                                               <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">No se encontraron clientes.</td>
                                                        </tr>
                                                 ) : filtered.map(client => (
                                                        <tr key={client.id} className="group hover:bg-secondary/20 transition-colors">
                                                               <td className="p-4">
                                                                      <div className="flex flex-col">
                                                                             <span className="font-bold text-sm text-foreground">{client.name}</span>
                                                                             <span className="text-xs text-muted-foreground">{client.phone}</span>
                                                                      </div>
                                                               </td>
                                                               <td className="p-4">
                                                                      {client.category ? (
                                                                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                                                                                    <Trophy size={10} />
                                                                                    {client.category}
                                                                             </span>
                                                                      ) : (
                                                                             <span className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">-</span>
                                                                      )}
                                                               </td>
                                                               <td className="p-4">
                                                                      {getStatusBadge(client.status)}
                                                               </td>
                                                               <td className="p-4 text-xs font-medium text-muted-foreground">
                                                                      {client.lastBooking
                                                                             ? format(new Date(client.lastBooking), "d MMM yyyy", { locale: es })
                                                                             : 'Nunca'}
                                                               </td>
                                                               <td className="p-4 align-middle">
                                                                      <div className="flex justify-center">
                                                                             <span className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500 text-white text-[10px] font-bold shadow-sm">
                                                                                    {client.totalBookings}
                                                                             </span>
                                                                      </div>
                                                               </td>
                                                               <td className="p-4">
                                                                      <div className="flex items-center justify-end gap-1">
                                                                             {/* EDIT ACTION */}
                                                                             <button
                                                                                    onClick={() => setEditingClient(client)}
                                                                                    className="p-2 text-muted-foreground hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                                                                                    title="Editar"
                                                                             >
                                                                                    <Pencil size={14} />
                                                                             </button>

                                                                             {/* DELETE ACTION */}
                                                                             <button
                                                                                    onClick={() => handleDelete(client.id)}
                                                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                                    title="Eliminar"
                                                                             >
                                                                                    <Trash2 size={14} />
                                                                             </button>

                                                                             {/* WHATSAPP ACTION */}
                                                                             {(client.status === 'RISK' || client.status === 'LOST') && client.phone && (
                                                                                    <button
                                                                                           onClick={() => {
                                                                                                  const text = MessagingService.generateRecoveryMessage(client.name)
                                                                                                  const url = MessagingService.getWhatsAppUrl(client.phone, text)
                                                                                                  window.open(url, '_blank')
                                                                                           }}
                                                                                           className="ml-2 inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg text-xs font-bold transition-all border border-[#25D366]/20 hover:border-[#25D366]/40"
                                                                                    >
                                                                                           <MessageCircle size={14} /> Recuperar
                                                                                    </button>
                                                                             )}
                                                                             {client.status === 'ACTIVE' && client.phone && (
                                                                                    <button
                                                                                           onClick={() => {
                                                                                                  const url = `https://wa.me/${client.phone.replace(/\D/g, '')}`
                                                                                                  window.open(url, '_blank')
                                                                                           }}
                                                                                           className="p-2 text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors"
                                                                                           title="WhatsApp"
                                                                                    >
                                                                                           <MessageCircle size={14} />
                                                                                    </button>
                                                                             )}
                                                                      </div>
                                                               </td>
                                                        </tr>
                                                 ))}
                                          </tbody>
                                   </table>
                            </div>
                     </div>

                     {/* EDIT MODAL */}
                     <AnimatePresence>
                            {editingClient && (
                                   <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 onClick={() => setEditingClient(null)}
                                                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                          />
                                          <motion.div
                                                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                                 exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                 className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-xl overflow-hidden"
                                          >
                                                 <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
                                                        <h3 className="font-bold text-lg">Editar Cliente</h3>
                                                        <button onClick={() => setEditingClient(null)} className="p-1 text-muted-foreground hover:text-foreground">
                                                               <X size={20} />
                                                        </button>
                                                 </div>
                                                 <form onSubmit={handleUpdate} className="p-4 space-y-4">
                                                        <div className="space-y-1.5">
                                                               <label className="text-xs font-bold text-muted-foreground uppercase">Nombre</label>
                                                               <input
                                                                      required
                                                                      value={editingClient.name}
                                                                      onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                                                                      className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                                      placeholder="Nombre completo"
                                                               />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                               <label className="text-xs font-bold text-muted-foreground uppercase">Teléfono</label>
                                                               <input
                                                                      required
                                                                      value={editingClient.phone}
                                                                      onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                                                                      className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                                      placeholder="Teléfono"
                                                               />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               <div className="space-y-1.5">
                                                                      <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
                                                                      <input
                                                                             type="email"
                                                                             value={editingClient.email || ''}
                                                                             onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                                                                             className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                                             placeholder="Email (opcional)"
                                                                      />
                                                               </div>
                                                               <div className="space-y-1.5">
                                                                      <label className="text-xs font-bold text-muted-foreground uppercase">Categoría</label>
                                                                      <select
                                                                             value={editingClient.category || ''}
                                                                             onChange={(e) => setEditingClient({ ...editingClient, category: e.target.value })}
                                                                             className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                                      >
                                                                             <option value="">Sin Categoría</option>
                                                                             {CATEGORIES.map(cat => (
                                                                                    <option key={cat} value={cat}>{cat}</option>
                                                                             ))}
                                                                      </select>
                                                               </div>
                                                        </div>
                                                        <div className="pt-2 flex gap-3">
                                                               <button
                                                                      type="button"
                                                                      onClick={() => setEditingClient(null)}
                                                                      className="flex-1 h-10 rounded-xl font-bold text-sm text-muted-foreground hover:bg-secondary transition-colors"
                                                               >
                                                                      Cancelar
                                                               </button>
                                                               <button
                                                                      type="submit"
                                                                      disabled={actionLoading}
                                                                      className="flex-1 h-10 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                                               >
                                                                      {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                                                      Guardar
                                                               </button>
                                                        </div>
                                                 </form>
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>
              </div>
       )
}

function StatCard({ title, value, icon: Icon, color }: any) {
       return (
              <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between h-24 relative overflow-hidden group hover:border-[var(--primary)]/30 transition-colors">
                     <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                            <Icon size={48} />
                     </div>
                     <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground z-10">{title}</span>
                     <div className="flex items-end gap-2 z-10">
                            <span className="text-3xl font-black text-foreground tracking-tighter">{value}</span>
                     </div>
              </div>
       )
}
