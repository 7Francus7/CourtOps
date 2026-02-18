'use client'

import { useState, useEffect } from 'react'
import { getClients, updateClient, deleteClient } from '@/actions/clients'
import { MessagingService } from '@/lib/messaging'
import { Users, Search, AlertCircle, CheckCircle2, MessageCircle, RefreshCw, Pencil, Trash2, X, Save, Loader2, Trophy, ArrowLeft, Phone, Mail, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

type Props = {
       initialData?: any[]
}

export default function ClientsDashboard({ initialData = [] }: Props) {
       const router = useRouter()
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

       const CATEGORIES = ['8va', '7ma', '6ta', '5ta', '4ta', '3ra', '2da', '1ra']

       return (
              <div className="space-y-6 animate-in fade-in duration-500 relative pb-20 md:pb-0">
                     {/* PREMIUM HEADER with BACK BUTTON */}
                     <header className="sticky top-0 z-40 -mx-4 -mt-4 px-4 py-4 md:static md:mx-0 md:mt-0 md:p-0 bg-background/80 backdrop-blur-xl border-b border-border/50 md:border-none md:bg-transparent">
                            <div className="flex flex-col gap-4">
                                   <div className="flex items-center gap-3">
                                          <button
                                                 onClick={() => router.back()}
                                                 className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors md:hidden"
                                          >
                                                 <ArrowLeft size={22} className="text-muted-foreground" />
                                          </button>
                                          <div>
                                                 <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
                                                        Clientes
                                                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/20 md:hidden">
                                                               {filtered.length}
                                                        </span>
                                                 </h1>
                                                 <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Gestiona tu base de jugadores y recupera los inactivos.</p>
                                          </div>
                                          <div className="ml-auto flex gap-2">
                                                 <button onClick={loadClients} className="p-2 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors shadow-sm">
                                                        <RefreshCw size={18} className={cn("text-muted-foreground", loading && "animate-spin")} />
                                                 </button>
                                                 <div className="hidden md:flex bg-secondary/50 rounded-xl p-1 gap-1">
                                                        {(['ALL', 'ACTIVE', 'RISK', 'LOST'] as const).map(f => (
                                                               <button
                                                                      key={f}
                                                                      onClick={() => setFilter(f)}
                                                                      className={cn(
                                                                             "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                                                             filter === f
                                                                                    ? "bg-background shadow-sm text-foreground"
                                                                                    : "text-muted-foreground hover:bg-background/50"
                                                                      )}
                                                               >
                                                                      {f === 'ALL' ? 'Todos' : f}
                                                               </button>
                                                        ))}
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Search & Mobile Filter */}
                                   <div className="flex gap-2">
                                          <div className="relative flex-1">
                                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                 <input
                                                        type="text"
                                                        placeholder="Buscar por nombre..."
                                                        className="w-full pl-10 h-10 bg-secondary/30 border border-border/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all placeholder:text-muted-foreground/60"
                                                        value={search}
                                                        onChange={(e) => setSearch(e.target.value)}
                                                 />
                                          </div>
                                          <select
                                                 value={categoryFilter}
                                                 onChange={(e) => setCategoryFilter(e.target.value)}
                                                 className="h-10 px-3 rounded-xl bg-secondary/30 border border-border/50 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-[var(--primary)] w-24 md:w-40"
                                          >
                                                 <option value="">Nivel</option>
                                                 {CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                 ))}
                                          </select>
                                   </div>

                                   {/* Mobile Status Pills */}
                                   <div className="flex md:hidden gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                                          {(['ALL', 'ACTIVE', 'RISK', 'LOST'] as const).map(f => (
                                                 <button
                                                        key={f}
                                                        onClick={() => setFilter(f)}
                                                        className={cn(
                                                               "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap border transition-all shrink-0",
                                                               filter === f
                                                                      ? "bg-foreground text-background border-foreground"
                                                                      : "bg-transparent text-muted-foreground border-border"
                                                        )}
                                                 >
                                                        {f === 'ALL' ? 'Todos' : f}
                                                 </button>
                                          ))}
                                   </div>
                            </div>
                     </header>

                     {/* STATS CARDS (Hidden on small mobile to save space, visible on md+) */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <StatCard title="Total" value={total} icon={Users} color="text-slate-500" />
                            <StatCard title="Activos" value={active} icon={CheckCircle2} color="text-emerald-500" />
                            <StatCard title="Riesgo" value={risk} icon={AlertCircle} color="text-amber-500" />
                            <StatCard title="Inactivos" value={lost} icon={Trash2} color="text-red-500" />
                     </div>

                     {/* GRID LIST (Responsive) */}
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {filtered.length === 0 ? (
                                   <div className="col-span-full py-12 text-center text-muted-foreground">
                                          <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                          <p>No se encontraron clientes</p>
                                   </div>
                            ) : (
                                   filtered.map(client => (
                                          <motion.div
                                                 layout
                                                 initial={{ opacity: 0, scale: 0.95 }}
                                                 animate={{ opacity: 1, scale: 1 }}
                                                 key={client.id}
                                                 className="group relative bg-card hover:bg-secondary/20 border border-border/50 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md"
                                          >
                                                 <div className="flex justify-between items-start mb-3">
                                                        <div className="flex gap-3">
                                                               <div className={cn(
                                                                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm",
                                                                      client.status === 'ACTIVE' ? "bg-gradient-to-br from-emerald-400 to-emerald-600" :
                                                                             client.status === 'RISK' ? "bg-gradient-to-br from-amber-400 to-amber-600" :
                                                                                    client.status === 'LOST' ? "bg-gradient-to-br from-red-400 to-red-600" :
                                                                                           "bg-gradient-to-br from-blue-400 to-blue-600"

                                                               )}>
                                                                      {client.name.substring(0, 2).toUpperCase()}
                                                               </div>
                                                               <div>
                                                                      <h3 className="font-bold text-foreground leading-tight">{client.name}</h3>
                                                                      {client.category && (
                                                                             <div className="flex items-center gap-1 mt-0.5">
                                                                                    <Trophy className="w-3 h-3 text-amber-500" />
                                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{client.category}</span>
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>
                                                        <button onClick={() => setEditingClient(client)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                                                               <Pencil size={14} />
                                                        </button>
                                                 </div>

                                                 <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                                        <div className="flex items-center gap-1.5">
                                                               <Phone size={12} />
                                                               <span>{client.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                               <Trophy size={12} />
                                                               <span>{client.totalBookings} Reservas</span>
                                                        </div>
                                                 </div>

                                                 <div className="flex gap-2">
                                                        {client.phone && (
                                                               <button
                                                                      onClick={() => {
                                                                             const url = `https://wa.me/${client.phone.replace(/\D/g, '')}`
                                                                             window.open(url, '_blank')
                                                                      }}
                                                                      className="flex-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
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
                                                                      className="flex-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                                                               >
                                                                      <RefreshCw size={14} />
                                                                      Recuperar
                                                               </button>
                                                        )}
                                                 </div>
                                          </motion.div>
                                   ))
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
              <div className="bg-card border border-border p-3 rounded-2xl flex flex-col justify-between h-20 md:h-24 relative overflow-hidden group hover:border-[var(--primary)]/30 transition-colors shadow-sm">
                     <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                            <Icon size={40} />
                     </div>
                     <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-muted-foreground z-10">{title}</span>
                     <div className="flex items-end gap-2 z-10">
                            <span className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">{value}</span>
                     </div>
              </div>
       )
}
