'use client'

import { useState, useEffect } from 'react'
import { getClients } from '@/actions/clients'
import { MessagingService } from '@/lib/messaging'
import { Users, Search, AlertCircle, CheckCircle2, MessageCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type Props = {
       initialData?: any[]
}
export default function ClientsDashboard({ initialData = [] }: Props) {
       const [clients, setClients] = useState<any[]>(initialData)
       const [loading, setLoading] = useState(initialData.length === 0)
       const [search, setSearch] = useState('')
       const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RISK' | 'LOST'>('ALL')

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

       const filtered = clients.filter(c => {
              const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                     c.phone.includes(search)
              const matchesFilter = filter === 'ALL' || c.status === filter
              return matchesSearch && matchesFilter
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

       return (
              <div className="space-y-6 animate-in fade-in duration-500">
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
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
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
                                                 <tr className="border-b border-white/5 bg-secondary/30">
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Cliente</th>
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Estado</th>
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Última Reserva</th>
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center">Reservas Totales</th>
                                                        <th className="p-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground text-right">Acciones</th>
                                                 </tr>
                                          </thead>
                                          <tbody className="divide-y divide-white/5">
                                                 {loading ? (
                                                        <tr>
                                                               <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">Cargando clientes...</td>
                                                        </tr>
                                                 ) : filtered.length === 0 ? (
                                                        <tr>
                                                               <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">No se encontraron clientes.</td>
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
                                                                      {getStatusBadge(client.status)}
                                                               </td>
                                                               <td className="p-4 text-xs font-medium text-muted-foreground">
                                                                      {client.lastBooking
                                                                             ? format(new Date(client.lastBooking), "d MMM yyyy", { locale: es })
                                                                             : 'Nunca'}
                                                               </td>
                                                               <td className="p-4 text-center">
                                                                      <span className="bg-secondary text-foreground px-2 py-1 rounded-md text-xs font-bold">{client.totalBookings}</span>
                                                               </td>
                                                               <td className="p-4 text-right">
                                                                      {/* ACTION BUTTON */}
                                                                      {(client.status === 'RISK' || client.status === 'LOST') && client.phone && (
                                                                             <button
                                                                                    onClick={() => {
                                                                                           const text = MessagingService.generateRecoveryMessage(client.name)
                                                                                           const url = MessagingService.getWhatsAppUrl(client.phone, text)
                                                                                           window.open(url, '_blank')
                                                                                    }}
                                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg text-xs font-bold transition-all border border-[#25D366]/20 hover:border-[#25D366]/40"
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
                                                                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                                                             >
                                                                                    <MessageCircle size={14} />
                                                                             </button>
                                                                      )}
                                                               </td>
                                                        </tr>
                                                 ))}
                                          </tbody>
                                   </table>
                            </div>
                     </div>
              </div>
       )
}

function StatCard({ title, value, icon: Icon, color }: any) {
       return (
              <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between h-24 relative overflow-hidden group">
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
