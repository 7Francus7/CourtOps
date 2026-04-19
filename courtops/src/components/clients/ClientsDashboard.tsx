'use client'

import { useState, useEffect } from 'react'
import { getClients, updateClient, deleteClient, createClient } from '@/actions/clients'
import { MessagingService } from '@/lib/messaging'
import { Users, Search, AlertCircle, CheckCircle2, MessageCircle, RefreshCw, Pencil, Trash2, X, Save, Loader2, Trophy, ArrowLeft, Phone, Mail, MoreVertical, LayoutGrid, List, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useConfirmation } from '@/components/providers/ConfirmationProvider'

type Props = {
       initialData?: any[]
}

export default function ClientsDashboard({ initialData = [] }: Props) {
       const router = useRouter()
       const confirm = useConfirmation()
       const [clients, setClients] = useState<any[]>(initialData)
       const [loading, setLoading] = useState(initialData.length === 0)
       const [search, setSearch] = useState('')
       const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RISK' | 'LOST' | 'DEBT' | 'INACTIVE'>('ALL')
       const [categoryFilter, setCategoryFilter] = useState<string>('')
       const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

       // Edit State
       const [editingClient, setEditingClient] = useState<any | null>(null)
       const [actionLoading, setActionLoading] = useState(false)
       const [isCreating, setIsCreating] = useState(false)
       const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', category: '', notes: '' })

       const loadClients = async () => {
              setLoading(true)
              const res = await getClients()
              if (res.success && res.data) {
                     setClients(res.data)
              }
              setLoading(false)
       }

       useEffect(() => {
              if (initialData.length === 0) {
                     loadClients()
              }
       }, [])

       const handleDelete = async (id: number) => {
              if (!await confirm({ title: '¿Eliminar cliente?', description: 'Esta acción no se puede deshacer. Se eliminarán todos los datos asociados.', variant: 'destructive', confirmLabel: 'Eliminar' })) return

              const toastId = toast.loading('Eliminando...')
              const res = await deleteClient(id)

              if (res.success) {
                     toast.success('Cliente eliminado', { id: toastId })
                     loadClients()
              } else {
                     toast.error(res.error || 'Error al eliminar', { id: toastId })
              }
       }

       const handleCreate = async (e: React.FormEvent) => {
              e.preventDefault()
              setActionLoading(true)
              const res = await createClient(newClient)
              setActionLoading(false)

              if (res.success) {
                     toast.success('Cliente creado correctamente')
                     setIsCreating(false)
                     setNewClient({ name: '', phone: '', email: '', category: '', notes: '' })
                     loadClients()
              } else {
                     toast.error(res.error || 'Error al crear cliente')
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
               
               let matchesFilter = filter === 'ALL' || c.status === filter
               if (filter === 'DEBT') matchesFilter = (c.totalBookings || 0) === 0 && c.status === 'NEW'
               if (filter === 'INACTIVE') {
                      matchesFilter = c.status === 'LOST' || c.status === 'RISK'
               }
               
               const matchesCategory = categoryFilter === '' || c.category === categoryFilter
               return matchesSearch && matchesFilter && matchesCategory
        }).sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }))

        // Stats
        const total = clients.length
        const active = clients.filter(c => c.status === 'ACTIVE' || c.status === 'NEW').length
        const risk = clients.filter(c => c.status === 'RISK').length
        const lost = clients.filter(c => c.status === 'LOST').length
        const withDebt = clients.filter(c => c.status === 'NEW' && (c.totalBookings || 0) === 0).length
        const inactive = clients.filter(c => c.status === 'LOST' || c.status === 'RISK').length

       const CATEGORIES = ['8va', '7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra']

       return (
              <div className="flex flex-col flex-1 min-h-0 animate-in fade-in duration-500 relative">
{/* HEADER SECTION */}
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
                             <div>
                                    <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-foreground tracking-tight flex items-center gap-2">
                                           <span className="hidden sm:inline">Clientes</span>
                                           <span className="sm:hidden">Clientes</span>
                                           <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full border border-border/50">
                                                  {filtered.length}
                                           </span>
                                    </h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Gestiona tu base de jugadores y recupera los inactivos.</p>
                             </div>
                             <div className="flex items-center gap-2">
                                    <button
                                           onClick={() => setIsCreating(true)}
                                           className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-xs sm:text-sm"
                                    >
                                           <Users size={16} />
                                           <span className="hidden sm:inline">NUEVO CLIENTE</span>
                                           <span className="sm:hidden">Nuevo</span>
                                    </button>
                                   <button onClick={loadClients} className="p-2 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors border border-border/50">
                                          <RefreshCw size={18} className={cn("text-muted-foreground", loading && "animate-spin")} />
                                   </button>
                            </div>
                     </div>

{/* STATS SUMMARY BAR */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 shrink-0 mb-4 overflow-x-auto pb-2 -mx-2 px-2">
                             <QuickStat
                                    label="Total"
                                    value={total}
                                    icon={Users}
                                    variant="slate"
                                    isActive={filter === 'ALL'}
                                    onClick={() => setFilter('ALL')}
                             />
                             <QuickStat
                                    label="Activos"
                                    value={active}
                                    icon={CheckCircle2}
                                    variant="emerald"
                                    isActive={filter === 'ACTIVE'}
                                    onClick={() => setFilter('ACTIVE')}
                             />
                             <QuickStat
                                    label="Con Deuda"
                                    value={withDebt}
                                    icon={AlertCircle}
                                    variant="red"
                                    isActive={filter === 'DEBT'}
                                    onClick={() => setFilter('DEBT')}
                             />
                             <QuickStat
                                    label="Inactivos 30d"
                                    value={inactive}
                                    icon={Trash2}
                                    variant="amber"
                                    isActive={filter === 'INACTIVE'}
                                    onClick={() => setFilter('INACTIVE')}
                             />
                             <QuickStat
                                    label="En Riesgo"
                                    value={risk}
                                    icon={AlertCircle}
                                    variant="orange"
                                    isActive={filter === 'RISK'}
                                    onClick={() => setFilter('RISK')}
                             />
                             <QuickStat
                                    label="Perdidos"
                                    value={lost}
                                    icon={Trash2}
                                    variant="gray"
                                    isActive={filter === 'LOST'}
                                    onClick={() => setFilter('LOST')}
                             />
                      </div>

                     {/* UNIFIED FILTER BAR */}
                     <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 shrink-0 mb-4">
                            <div className="relative flex-1 w-full">
                                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                   <input
                                          type="text"
                                          placeholder="Buscar por nombre o teléfono..."
                                          className="w-full pl-10 h-10 bg-transparent border-none rounded-xl text-sm font-medium focus:ring-0 outline-none transition-all placeholder:text-muted-foreground/60"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                   />
                            </div>

                            <div className="h-6 w-px bg-border/50 hidden md:block" />

                            <div className="flex items-center gap-2 w-full md:w-auto p-1">
                                   <select
                                          value={categoryFilter}
                                          onChange={(e) => setCategoryFilter(e.target.value)}
                                          className="h-9 px-3 rounded-lg bg-secondary/30 border border-border/50 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-primary w-full md:w-32"
                                   >
                                          <option value="">Todos los Niveles</option>
                                          {CATEGORIES.map(cat => (
                                                 <option key={cat} value={cat}>{cat}</option>
                                          ))}
                                   </select>

                                   <div className="h-6 w-px bg-border/50 mx-1" />

                                   <div className="flex bg-secondary/50 rounded-lg p-1">
                                          <button
                                                 onClick={() => setViewMode('grid')}
                                                 className={cn(
                                                        "p-1.5 rounded-md transition-all",
                                                        viewMode === 'grid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                                 )}
                                          >
                                                 <LayoutGrid size={16} />
                                          </button>
                                          <button
                                                 onClick={() => setViewMode('list')}
                                                 className={cn(
                                                        "p-1.5 rounded-md transition-all",
                                                        viewMode === 'list' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                                 )}
                                          >
                                                 <List size={16} />
                                          </button>
                                   </div>
                            </div>
                     </div>

                     {/* CONTENT AREA */}
                     <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-4">
                     {filtered.length === 0 ? (
                            <div className="py-20 text-center bg-card/30 border border-dashed border-border/50 rounded-3xl">
                                   <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                                   <h3 className="text-lg font-bold text-foreground">No se encontraron clientes</h3>
                                   <p className="text-sm text-muted-foreground">Prueba ajustando los filtros o realiza una nueva búsqueda.</p>
                            </div>
                     ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                   {filtered.map(client => (
                                          <motion.div
                                                 layout
                                                 initial={{ opacity: 0, y: 20 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 key={client.id}
                                                 className="group bg-card hover:bg-secondary/10 border border-border/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col justify-between"
                                          >
                                                 <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                               <div className="flex gap-3">
                                                                      <div className={cn(
                                                                             "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg",
                                                                             client.status === 'ACTIVE' ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20" :
                                                                                    client.status === 'RISK' ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20" :
                                                                                           client.status === 'LOST' ? "bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/20" :
                                                                                                  "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/20"
                                                                      )}>
                                                                             {client.name.substring(0, 2).toUpperCase()}
                                                                      </div>
                                                                      <div className="space-y-1">
                                                                             <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{client.name}</h3>
                                                                             <div className="flex flex-wrap items-center gap-2">
                                                                                    {client.category && (
                                                                                           <span className="text-[10px] bg-secondary/80 px-2 py-0.5 rounded-md font-bold text-muted-foreground border border-border/50 uppercase flex items-center gap-1">
                                                                                                  <Trophy size={10} className="text-amber-500" />
                                                                                                  {client.category}
                                                                                           </span>
                                                                                    )}
                                                                                    {client.membershipStatus === 'ACTIVE' && (
                                                                                           <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md font-bold uppercase border border-emerald-500/20">
                                                                                                  Socio
                                                                                           </span>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                               <button onClick={() => setEditingClient(client)} className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                                      <Pencil size={14} />
                                                               </button>
                                                        </div>

                                                        <div className="space-y-2 mb-6">
                                                               <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                                                                      <Phone size={12} className="text-primary/50" />
                                                                      <span>{client.phone}</span>
                                                               </div>
                                                               <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                                                                      <Trophy size={12} className="text-primary/50" />
                                                                      <span>{client.totalBookings} {client.totalBookings === 1 ? 'Reserva realizada' : 'Reservas realizadas'}</span>
                                                               </div>
                                                               {client.lastBooking && (
                                                                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 italic">
                                                                             <span>Última visita: {format(new Date(client.lastBooking), "d 'de' MMMM", { locale: es })}</span>
                                                                      </div>
                                                               )}
                                                        </div>
                                                 </div>

                                                 <div className="flex gap-2">
                                                        {client.phone && (
                                                               <button
                                                                      onClick={() => {
                                                                             const url = `https://wa.me/${client.phone.replace(/\D/g, '')}`
                                                                             window.open(url, '_blank')
                                                                      }}
                                                                      className="flex-1 bg-[#25D366]/10 text-[#25D366] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-white transition-all border border-[#25D366]/20"
                                                               >
                                                                      <MessageCircle size={14} />
                                                                      WhatsApp
                                                               </button>
                                                        )}
                                                        {client.status === 'RISK' && (
                                                               <button
                                                                      onClick={() => {
                                                                             const text = MessagingService.generateRecoveryMessage(client.name)
                                                                             const url = MessagingService.getWhatsAppUrl(client.phone, text)
                                                                             window.open(url, '_blank')
                                                                      }}
                                                                      className="flex-1 bg-amber-500/10 text-amber-500 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20"
                                                               >
                                                                      <RefreshCw size={14} />
                                                                      Recuperar
                                                               </button>
                                                        )}
                                                 </div>
                                          </motion.div>
                                   ))}
                            </div>
                     ) : (
                            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
                                   <div className="overflow-x-auto">
                                          <table className="w-full text-left text-sm border-collapse">
                                                 <thead className="bg-secondary/30 text-muted-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border/50">
                                                        <tr>
                                                               <th className="px-6 py-4">Cliente</th>
                                                               <th className="px-6 py-4">Categoría</th>
                                                               <th className="px-6 py-4">Reservas</th>
                                                               <th className="px-6 py-4">Última Visita</th>
                                                               <th className="px-6 py-4">Estado</th>
                                                               <th className="px-6 py-4 text-right">Acciones</th>
                                                        </tr>
                                                 </thead>
                                                 <tbody className="divide-y divide-border/30">
                                                        {filtered.map(client => (
                                                               <tr key={client.id} className="hover:bg-secondary/10 transition-colors group">
                                                                      <td className="px-6 py-4">
                                                                             <div className="flex items-center gap-3">
                                                                                    <div className={cn(
                                                                                           "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white",
                                                                                           client.status === 'ACTIVE' ? "bg-emerald-500" :
                                                                                                  client.status === 'RISK' ? "bg-amber-500" :
                                                                                                         client.status === 'LOST' ? "bg-red-500" : "bg-blue-500"
                                                                                    )}>
                                                                                           {client.name.substring(0, 2).toUpperCase()}
                                                                                    </div>
                                                                                    <div>
                                                                                           <div className="font-bold text-foreground">{client.name}</div>
                                                                                           <div className="text-[10px] text-muted-foreground">{client.phone}</div>
                                                                                    </div>
                                                                             </div>
                                                                      </td>
                                                                      <td className="px-6 py-4">
                                                                             {client.category ? (
                                                                                    <span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-bold">{client.category}</span>
                                                                             ) : (
                                                                                    <span className="text-muted-foreground/50">-</span>
                                                                             )}
                                                                      </td>
                                                                      <td className="px-6 py-4">
                                                                             <div className="flex items-center gap-1 font-medium">
                                                                                    {client.totalBookings}
                                                                             </div>
                                                                      </td>
                                                                      <td className="px-6 py-4 text-[11px] text-muted-foreground">
                                                                             {client.lastBooking ? format(new Date(client.lastBooking), "dd/MM/yyyy") : 'N/A'}
                                                                      </td>
                                                                      <td className="px-6 py-4">
                                                                             <div className={cn(
                                                                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                                                                    client.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                                                           client.status === 'RISK' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                                                                  "bg-red-500/10 text-red-500 border-red-500/20"
                                                                             )}>
                                                                                    <span className={cn(
                                                                                           "w-1.5 h-1.5 rounded-full",
                                                                                           client.status === 'ACTIVE' ? "bg-emerald-500" :
                                                                                                  client.status === 'RISK' ? "bg-amber-500" : "bg-red-500"
                                                                                    )} />
                                                                                    {client.status === 'ACTIVE' ? 'Activo' : client.status === 'RISK' ? 'Riesgo' : 'Perdido'}
                                                                             </div>
                                                                      </td>
                                                                      <td className="px-6 py-4 text-right">
                                                                             <div className="flex items-center justify-end gap-2">
                                                                                    <button
                                                                                           onClick={() => {
                                                                                                  const url = `https://wa.me/${client.phone.replace(/\D/g, '')}`
                                                                                                  window.open(url, '_blank')
                                                                                           }}
                                                                                           className="p-2 text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors"
                                                                                    >
                                                                                           <MessageCircle size={16} />
                                                                                    </button>
                                                                                    <button onClick={() => setEditingClient(client)} className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors">
                                                                                           <Pencil size={16} />
                                                                                    </button>
                                                                             </div>
                                                                      </td>
                                                               </tr>
                                                        ))}
                                                 </tbody>
                                          </table>
                                   </div>
                            </div>
                     )}

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
                                                 className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-10"
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
                                                                      onClick={() => handleDelete(editingClient.id)}
                                                                      className="h-10 px-4 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-colors border border-red-200 dark:border-red-500/20 mr-auto"
                                                               >
                                                                      <Trash2 size={16} />
                                                               </button>
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
                                                                      className="flex-1 h-10 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all"
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
                     {/* CREATE MODAL */}
                     <AnimatePresence>
                            {isCreating && (
                                   <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 onClick={() => setIsCreating(false)}
                                                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                          />
                                          <motion.div
                                                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                                 exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                 className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-10"
                                          >
                                                 <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
                                                        <h3 className="font-bold text-lg">Nuevo Cliente</h3>
                                                        <button onClick={() => setIsCreating(false)} className="p-1 text-muted-foreground hover:text-foreground">
                                                               <X size={20} />
                                                        </button>
                                                 </div>
                                                 <form onSubmit={handleCreate} className="p-4 space-y-4">
                                                        <div className="space-y-1.5">
                                                               <label className="text-xs font-bold text-muted-foreground uppercase">Nombre</label>
                                                               <input
                                                                      required
                                                                      value={newClient.name}
                                                                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                                                      className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                                      placeholder="Nombre completo"
                                                               />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                               <label className="text-xs font-bold text-muted-foreground uppercase">Teléfono</label>
                                                               <input
                                                                      required
                                                                      value={newClient.phone}
                                                                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                                                      className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                                      placeholder="Teléfono"
                                                               />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               <div className="space-y-1.5">
                                                                      <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
                                                                      <input
                                                                             type="email"
                                                                             value={newClient.email || ''}
                                                                             onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                                                             className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                                                             placeholder="Email (opcional)"
                                                                      />
                                                               </div>
                                                               <div className="space-y-1.5">
                                                                      <label className="text-xs font-bold text-muted-foreground uppercase">Categoría</label>
                                                                      <select
                                                                             value={newClient.category || ''}
                                                                             onChange={(e) => setNewClient({ ...newClient, category: e.target.value })}
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
                                                                      onClick={() => setIsCreating(false)}
                                                                      className="flex-1 h-10 rounded-xl font-bold text-sm text-muted-foreground hover:bg-secondary transition-colors"
                                                               >
                                                                      Cancelar
                                                               </button>
                                                               <button
                                                                      type="submit"
                                                                      disabled={actionLoading}
                                                                      className="flex-1 h-10 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                                               >
                                                                      {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                                                      Crear
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

function QuickStat({ label, value, icon: Icon, variant, isActive, onClick }: any) {
const variants: any = {
		slate: "from-slate-500/20 to-slate-600/20 text-slate-500 border-slate-500/20",
		emerald: "from-emerald-500/10 to-emerald-600/10 text-emerald-500 border-emerald-500/20",
		amber: "from-amber-500/10 to-amber-600/10 text-amber-500 border-amber-500/20",
		red: "from-red-500/10 to-red-600/10 text-red-500 border-red-500/20",
		orange: "from-orange-500/10 to-orange-600/10 text-orange-500 border-orange-500/20",
		gray: "from-zinc-500/20 to-zinc-600/20 text-zinc-500 border-zinc-500/20"
}

const activeVariants: any = {
		slate: "bg-slate-500 text-white border-slate-600",
		emerald: "bg-emerald-500 text-white border-emerald-600",
		amber: "bg-amber-500 text-white border-amber-600",
		red: "bg-red-500 text-white border-red-600",
		orange: "bg-orange-500 text-white border-orange-600",
		gray: "bg-zinc-500 text-white border-zinc-600"
}

       return (
              <button
                     onClick={onClick}
                     className={cn(
                            "relative overflow-hidden p-4 rounded-3xl border transition-all duration-300 text-left group",
                            isActive
                                   ? activeVariants[variant] + " shadow-lg"
                                   : "bg-card border-border/50 hover:border-primary/30"
                     )}
              >
                     <div className={cn(
                            "flex items-center gap-3",
                            isActive ? "opacity-100" : "opacity-100"
                     )}>
                            <div className={cn(
                                   "p-2.5 rounded-2xl transition-colors",
                                   isActive ? "bg-white/20" : "bg-secondary"
                            )}>
<Icon size={20} className={cn(
                                           isActive ? "text-white" : (variants[variant] || variants.slate).split(' ')[2]
                                    )} />
                            </div>
                            <div>
                                   <p className={cn(
                                          "text-[10px] font-black uppercase tracking-widest",
                                          isActive ? "text-white/80" : "text-muted-foreground"
                                   )}>{label}</p>
                                   <h4 className="text-2xl font-black tracking-tighter">{value}</h4>
                            </div>
                     </div>

                     <div className={cn(
                            "absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity",
                            isActive ? "text-white" : "text-foreground"
                     )}>
                            <Icon size={80} />
                     </div>
              </button>
       )
}
