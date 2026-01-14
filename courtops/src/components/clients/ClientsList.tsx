'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Users, Wallet, Package, Trophy, Search, UserPlus, ChevronLeft, ChevronRight, MessageCircle, CreditCard, Edit, LogOut, X, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient, updateClient } from '@/actions/clients'

interface Client {
       id: number
       name: string
       phone: string
       balance: number
       email?: string | null
       bookings: any[]
}

interface ClientsListProps {
       initialClients: Client[]
}

type FilterType = 'all' | 'debtors' | 'positive' | 'neutral'

export default function ClientsList({ initialClients }: ClientsListProps) {
       const router = useRouter()
       const [filter, setFilter] = useState<FilterType>('all')
       const [search, setSearch] = useState('')

       // Modal State
       const [isModalOpen, setIsModalOpen] = useState(false)
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [editingClient, setEditingClient] = useState<Client | null>(null)

       // Form State
       const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' })

       // Filter Logic
       const filteredClients = initialClients.filter(client => {
              // 1. Text Search
              const searchLower = search.toLowerCase()
              const matchesSearch =
                     client.name.toLowerCase().includes(searchLower) ||
                     client.phone.includes(searchLower) ||
                     (client.id.toString().includes(searchLower))

              if (!matchesSearch) return false

              // 2. Chip Filter
              if (filter === 'debtors') return client.balance < 0
              if (filter === 'positive') return client.balance > 0
              if (filter === 'neutral') return client.balance === 0

              return true
       })

       // Pagination
       const itemsPerPage = 8
       const [currentPage, setCurrentPage] = useState(1)

       const totalItems = filteredClients.length
       const totalPages = Math.ceil(totalItems / itemsPerPage)
       const displayedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

       // HANDLERS
       const handleOpenNew = () => {
              setEditingClient(null)
              setFormData({ name: '', phone: '', email: '', notes: '' })
              setIsModalOpen(true)
       }

       const handleOpenEdit = (client: Client) => {
              setEditingClient(client)
              setFormData({
                     name: client.name,
                     phone: client.phone,
                     email: client.email || '',
                     notes: ''
              })
              setIsModalOpen(true)
       }

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setIsSubmitting(true)
              try {
                     if (editingClient) {
                            await updateClient(editingClient.id, formData)
                     } else {
                            await createClient(formData)
                     }
                     setIsModalOpen(false)
                     // Optional: Toast success
              } catch (error) {
                     console.error(error)
                     alert('Error al guardar cliente')
              } finally {
                     setIsSubmitting(false)
              }
       }

       const handleWhatsApp = (phone: string) => {
              const cleanPhone = phone.replace(/\D/g, '')
              window.open(`https://wa.me/${cleanPhone}`, '_blank')
       }

       const handleWallet = (id: number) => {
              router.push(`/clientes/${id}`)
       }

       const handleLogout = () => {
              // Basic placeholder for logout
              if (confirm('¿Cerrar sesión?')) {
                     window.location.href = '/'
              }
       }

       return (
              <div className="flex h-screen overflow-hidden bg-[#07090D] font-sans text-slate-200">

                     {/* SIDEBAR */}
                     <aside className="w-64 border-r border-white/5 flex flex-col shrink-0 bg-[#0A0E17] hidden md:flex">
                            <div className="p-8">
                                   <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                                 <Trophy className="text-white" size={24} />
                                          </div>
                                          <span className="font-bold text-xl tracking-tight text-white">CourtOps</span>
                                   </div>
                            </div>
                            <nav className="flex-1 px-4 space-y-2">
                                   <SidebarLink href="/" icon={LayoutDashboard} label="Dashboard" />
                                   <SidebarLink href="/clientes" icon={Users} label="Clientes" active />
                            </nav>
                            <div className="p-6 mt-auto">
                                   <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4">
                                          <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600"></div>
                                                 <div>
                                                        <p className="text-xs font-bold text-white">Admin Court</p>
                                                        <p className="text-[10px] text-slate-500">Soporte Activo</p>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </aside>

                     {/* MAIN CONTENT */}
                     <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#07090D]">
                            <header className="p-8 pb-4">
                                   <div className="flex justify-between items-center mb-8">
                                          <div>
                                                 <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Clientes</h1>
                                                 <p className="text-slate-500 text-sm mt-1">Administra tu cartera de clientes y estados de cuenta en tiempo real.</p>
                                          </div>
                                          <button
                                                 onClick={handleOpenNew}
                                                 className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                                          >
                                                 <UserPlus size={20} />
                                                 NUEVO CLIENTE
                                          </button>
                                   </div>
                                   <div className="flex flex-col md:flex-row gap-6 items-center">
                                          <div className="relative flex-1 group w-full">
                                                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                                 <input
                                                        value={search}
                                                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                                        className="w-full bg-[#121826] border-white/5 border rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                                                        placeholder="Buscar por nombre, ID o teléfono..."
                                                        type="text"
                                                 />
                                          </div>
                                          <div className="flex gap-3 bg-[#121826] p-1.5 border border-white/5 rounded-2xl shrink-0 overflow-x-auto">
                                                 <FilterButton label="TODOS" active={filter === 'all'} onClick={() => { setFilter('all'); setCurrentPage(1); }} />
                                                 <FilterButton label="DEUDORES" active={filter === 'debtors'} onClick={() => { setFilter('debtors'); setCurrentPage(1); }} />
                                                 <FilterButton label="A FAVOR" active={filter === 'positive'} onClick={() => { setFilter('positive'); setCurrentPage(1); }} />
                                                 <FilterButton label="SIN SALDO" active={filter === 'neutral'} onClick={() => { setFilter('neutral'); setCurrentPage(1); }} />
                                          </div>
                                   </div>
                            </header>

                            <div className="flex-1 px-4 md:px-8 pb-24 md:pb-8 overflow-hidden flex flex-col">
                                   <div className="flex-1 bg-transparent md:bg-white/5 md:backdrop-blur-xl md:border md:border-white/5 rounded-3xl overflow-hidden flex flex-col">

                                          {/* DESKTOP TABLE */}
                                          <div className="hidden md:block overflow-x-auto flex-1">
                                                 <table className="w-full text-left border-collapse">
                                                        <thead className="sticky top-0 bg-[#121826]/80 backdrop-blur-md z-10">
                                                               <tr className="border-b border-white/5">
                                                                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cliente</th>
                                                                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                                                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Teléfono</th>
                                                                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Saldo</th>
                                                                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                                                               </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                               {displayedClients.length === 0 ? (
                                                                      <tr>
                                                                             <td colSpan={5} className="text-center py-10 text-slate-500">
                                                                                    No se encontraron clientes.
                                                                             </td>
                                                                      </tr>
                                                               ) : (
                                                                      displayedClients.map((client) => {
                                                                             const initials = client.name.substring(0, 2).toUpperCase()
                                                                             const balanceColor = client.balance < 0 ? 'text-red-500' : client.balance > 0 ? 'text-emerald-500' : 'text-slate-500'
                                                                             const colorIndex = (client.name.charCodeAt(0) || 0) % 5
                                                                             const bgColors = ['bg-blue-500/20 text-blue-400', 'bg-orange-500/20 text-orange-400', 'bg-emerald-500/20 text-emerald-400', 'bg-purple-500/20 text-purple-400', 'bg-rose-500/20 text-rose-400']
                                                                             const avatarClass = bgColors[colorIndex]

                                                                             return (
                                                                                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                                                                                           <td className="px-6 py-4">
                                                                                                  <div className="flex items-center gap-4">
                                                                                                         <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold border border-white/5", avatarClass)}>
                                                                                                                {initials}
                                                                                                         </div>
                                                                                                         <span className="font-semibold text-white">{client.name}</span>
                                                                                                  </div>
                                                                                           </td>
                                                                                           <td className="px-6 py-4 text-sm text-slate-400">#{client.id.toString().padStart(4, '0')}</td>
                                                                                           <td className="px-6 py-4 text-sm text-slate-400">{client.phone}</td>
                                                                                           <td className="px-6 py-4 text-center">
                                                                                                  <span className={cn("font-bold text-lg", balanceColor)}>
                                                                                                         ${client.balance.toLocaleString()}
                                                                                                  </span>
                                                                                           </td>
                                                                                           <td className="px-6 py-4">
                                                                                                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                         <button onClick={() => handleWhatsApp(client.phone)} className="p-2.5 rounded-xl transition-all text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white" title="WhatsApp">
                                                                                                                <MessageCircle size={20} />
                                                                                                         </button>
                                                                                                         <button onClick={() => handleWallet(client.id)} className="p-2.5 rounded-xl transition-all text-blue-400 bg-blue-500/10 hover:bg-blue-500 hover:text-white" title="Cuenta Corriente">
                                                                                                                <CreditCard size={20} />
                                                                                                         </button>
                                                                                                         <button onClick={() => handleOpenEdit(client)} className="p-2.5 rounded-xl transition-all text-slate-400 bg-slate-500/10 hover:bg-slate-500 hover:text-white" title="Editar">
                                                                                                                <Edit size={20} />
                                                                                                         </button>
                                                                                                  </div>
                                                                                           </td>
                                                                                    </tr>
                                                                             )
                                                                      })
                                                               )}
                                                        </tbody>
                                                 </table>
                                          </div>

                                          {/* MOBILE CARD LIST */}
                                          <div className="md:hidden flex flex-col gap-3 pb-4 overflow-y-auto">
                                                 {displayedClients.length === 0 ? (
                                                        <div className="text-center py-10 text-slate-500">
                                                               No se encontraron clientes.
                                                        </div>
                                                 ) : (
                                                        displayedClients.map((client) => {
                                                               const initials = client.name.substring(0, 2).toUpperCase()
                                                               const balanceColor = client.balance < 0 ? 'text-red-500' : client.balance > 0 ? 'text-emerald-500' : 'text-slate-500'
                                                               const colorIndex = (client.name.charCodeAt(0) || 0) % 5
                                                               const bgColors = ['bg-blue-500/20 text-blue-400', 'bg-orange-500/20 text-orange-400', 'bg-emerald-500/20 text-emerald-400', 'bg-purple-500/20 text-purple-400', 'bg-rose-500/20 text-rose-400']
                                                               const avatarClass = bgColors[colorIndex]

                                                               return (
                                                                      <div key={client.id} className="bg-[#121826] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                                                             <div className="flex items-center gap-3">
                                                                                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border border-white/5", avatarClass)}>
                                                                                           {initials}
                                                                                    </div>
                                                                                    <div>
                                                                                           <h3 className="font-bold text-white text-sm">{client.name}</h3>
                                                                                           <p className="text-xs text-slate-500">#{client.id.toString().padStart(4, '0')}</p>
                                                                                    </div>
                                                                             </div>
                                                                             <div className="text-right flex flex-col items-end gap-2">
                                                                                    <span className={cn("font-bold text-base", balanceColor)}>
                                                                                           ${client.balance.toLocaleString()}
                                                                                    </span>
                                                                                    <div className="flex gap-2">
                                                                                           <button onClick={() => handleWhatsApp(client.phone)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10">
                                                                                                  <MessageCircle size={16} />
                                                                                           </button>
                                                                                           <button onClick={() => handleOpenEdit(client)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white">
                                                                                                  <Edit size={16} />
                                                                                           </button>
                                                                                           <button onClick={() => handleWallet(client.id)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10">
                                                                                                  <CreditCard size={16} />
                                                                                           </button>
                                                                                    </div>
                                                                             </div>
                                                                      </div>
                                                               )
                                                        })
                                                 )}
                                          </div>

                                          {/* Pagination Footer */}
                                          <div className="p-6 border-t border-white/5 flex justify-between items-center text-sm text-slate-500">
                                                 <p>Mostrando {displayedClients.length} de {totalItems} clientes</p>
                                                 <div className="flex gap-2">
                                                        <button
                                                               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                               disabled={currentPage === 1}
                                                               className="p-2 rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                                        >
                                                               <ChevronLeft size={20} />
                                                        </button>
                                                        {/* Only show page numbers on desktop */}
                                                        <div className="hidden md:flex gap-2">
                                                               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                      const p = i + 1
                                                                      return (
                                                                             <button
                                                                                    key={p}
                                                                                    onClick={() => setCurrentPage(p)}
                                                                                    className={cn("px-3 py-1 rounded-lg transition-colors", currentPage === p ? "bg-blue-600/10 text-blue-400 font-bold" : "hover:bg-white/5")}
                                                                             >
                                                                                    {p}
                                                                             </button>
                                                                      )
                                                               })}
                                                        </div>
                                                        <button
                                                               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                               disabled={currentPage === totalPages || totalPages === 0}
                                                               className="p-2 rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                                        >
                                                               <ChevronRight size={20} />
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </main>

                     {/* MOBILE BOTTOM NAV */}
                     <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0E17]/95 backdrop-blur-xl border-t border-white/5 pb-6 pt-3 px-6 z-40 flex justify-around">
                            <Link href="/" className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
                                   <LayoutDashboard size={20} />
                                   <span className="text-[10px] font-medium">Dashboard</span>
                            </Link>
                            <Link href="/clientes" className="flex flex-col items-center gap-1 text-blue-500 transition-colors">
                                   <Users size={20} />
                                   <span className="text-[10px] font-medium">Clientes</span>
                            </Link>
                     </nav>

                     {/* MOBILE FAB ADD BUTTON */}
                     <div className="md:hidden fixed bottom-24 right-5 z-40">
                            <button
                                   onClick={handleOpenNew}
                                   className="w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-600/40 flex items-center justify-center text-white active:scale-95 transition-transform"
                            >
                                   <UserPlus size={24} />
                            </button>
                     </div>

                     {/* MODAL */}
                     {isModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                   <div className="bg-[#121826] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                          <div className="flex justify-between items-center p-6 border-b border-white/10">
                                                 <h2 className="text-xl font-bold text-white">
                                                        {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                                                 </h2>
                                                 <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                                        <X size={24} />
                                                 </button>
                                          </div>
                                          <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                                 <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre Completo</label>
                                                        <input
                                                               required
                                                               value={formData.name}
                                                               onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                               placeholder="Ej: Juan Perez"
                                                        />
                                                 </div>
                                                 <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teléfono</label>
                                                        <input
                                                               required
                                                               value={formData.phone}
                                                               onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                               placeholder="Ej: 54911..."
                                                        />
                                                 </div>
                                                 <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email (Opcional)</label>
                                                        <input
                                                               type="email"
                                                               value={formData.email}
                                                               onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                               placeholder="ejemplo@email.com"
                                                        />
                                                 </div>

                                                 <div className="pt-4 flex gap-3">
                                                        <button
                                                               type="button"
                                                               onClick={() => setIsModalOpen(false)}
                                                               className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                                                        >
                                                               Cancelar
                                                        </button>
                                                        <button
                                                               type="submit"
                                                               disabled={isSubmitting}
                                                               className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
                                                        >
                                                               {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                                               Guardar
                                                        </button>
                                                 </div>
                                          </form>
                                   </div>
                            </div>
                     )}

              </div>
       )
}

function SidebarLink({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active?: boolean }) {
       return (
              <Link href={href} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all", active ? "text-blue-400 bg-blue-400/10" : "text-slate-400 hover:text-white hover:bg-white/5")}>
                     <Icon size={20} />
                     <span className="text-sm font-medium">{label}</span>
              </Link>
       )
}

function FilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
       return (
              <button
                     onClick={onClick}
                     className={cn("px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap", active ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5")}
              >
                     {label}
              </button>
       )
}
