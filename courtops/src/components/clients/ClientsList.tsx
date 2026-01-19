'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, ChevronLeft, ChevronRight, MessageCircle, CreditCard, Edit, X, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient, updateClient } from '@/actions/clients'
import { Header } from '@/components/layout/Header'

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

       return (
              <div className="flex flex-col h-full bg-[var(--bg-dark)] font-sans text-slate-200">
                     <Header title="Gestión de Clientes" backHref="/dashboard" />

                     <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 md:p-8 gap-6">

                            {/* ACTION BAR */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                   <div className="flex gap-6 items-center w-full md:w-auto">
                                          <div className="relative flex-1 md:w-96 group">
                                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--brand-blue)] transition-colors" size={20} />
                                                 <input
                                                        value={search}
                                                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                                        className="w-full bg-[var(--bg-card)] border-white/5 border rounded-2xl pl-12 pr-6 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-[var(--brand-blue)]/50 focus:border-[var(--brand-blue)]/50 transition-all outline-none"
                                                        placeholder="Buscar por nombre, ID o teléfono..."
                                                        type="text"
                                                 />
                                          </div>
                                          <div className="hidden md:flex gap-2 bg-[var(--bg-card)] p-1 border border-white/5 rounded-2xl shrink-0">
                                                 <FilterButton label="TODOS" active={filter === 'all'} onClick={() => { setFilter('all'); setCurrentPage(1); }} />
                                                 <FilterButton label="DEUDORES" active={filter === 'debtors'} onClick={() => { setFilter('debtors'); setCurrentPage(1); }} />
                                                 <FilterButton label="A FAVOR" active={filter === 'positive'} onClick={() => { setFilter('positive'); setCurrentPage(1); }} />
                                                 <FilterButton label="SIN SALDO" active={filter === 'neutral'} onClick={() => { setFilter('neutral'); setCurrentPage(1); }} />
                                          </div>
                                   </div>

                                   <button
                                          onClick={handleOpenNew}
                                          className="flex items-center gap-2 bg-[var(--brand-blue)] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all active:scale-95 w-full md:w-auto justify-center"
                                   >
                                          <UserPlus size={20} />
                                          <span className="md:hidden lg:inline">NUEVO CLIENTE</span>
                                          <span className="hidden md:inline lg:hidden">NUEVO</span>
                                   </button>
                            </div>

                            {/* MOBILE FILTERS */}
                            <div className="flex md:hidden overflow-x-auto gap-2 mb-2 no-scrollbar">
                                   <MobileFilterButton label="TODOS" active={filter === 'all'} onClick={() => setFilter('all')} />
                                   <MobileFilterButton label="DEUDORES" active={filter === 'debtors'} onClick={() => setFilter('debtors')} />
                                   <MobileFilterButton label="A FAVOR" active={filter === 'positive'} onClick={() => setFilter('positive')} />
                                   <MobileFilterButton label="SIN SALDO" active={filter === 'neutral'} onClick={() => setFilter('neutral')} />
                            </div>

                            {/* TABLE CARD */}
                            <div className="flex-1 bg-[var(--bg-surface)] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">

                                   {/* DESKTOP TABLE */}
                                   <div className="hidden md:block overflow-x-auto flex-1 custom-scrollbar">
                                          <table className="w-full text-left border-collapse">
                                                 <thead className="sticky top-0 bg-[var(--bg-surface)] z-10 shadow-sm">
                                                        <tr className="border-b border-white/5">
                                                               <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                                                               <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                                                               <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Teléfono</th>
                                                               <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Saldo</th>
                                                               <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                                                        </tr>
                                                 </thead>
                                                 <tbody className="divide-y divide-white/5">
                                                        {displayedClients.length === 0 ? (
                                                               <tr>
                                                                      <td colSpan={5} className="text-center py-20 text-slate-500">
                                                                             No se encontraron clientes que coincidan con los filtros.
                                                                      </td>
                                                               </tr>
                                                        ) : (
                                                               displayedClients.map((client) => {
                                                                      const initials = client.name.substring(0, 2).toUpperCase()
                                                                      const balanceColor = client.balance < 0 ? 'text-red-500' : client.balance > 0 ? 'text-[var(--brand-green)]' : 'text-slate-500'
                                                                      const colorIndex = (client.name.charCodeAt(0) || 0) % 5
                                                                      const bgColors = ['bg-blue-500/20 text-blue-400', 'bg-orange-500/20 text-orange-400', 'bg-brand-green/20 text-brand-green', 'bg-purple-500/20 text-purple-400', 'bg-rose-500/20 text-rose-400']
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
                                                                                                  <button onClick={() => handleWhatsApp(client.phone)} className="p-2.5 rounded-xl transition-all text-brand-green bg-brand-green/10 hover:bg-brand-green hover:text-white" title="WhatsApp">
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
                                   <div className="md:hidden flex flex-col gap-4 overflow-y-auto px-4 py-4 custom-scrollbar">
                                          {displayedClients.map((client) => {
                                                 const initials = client.name.substring(0, 2).toUpperCase()
                                                 const isDebtor = client.balance < 0;
                                                 const isPositive = client.balance > 0;
                                                 const balanceColor = isDebtor ? 'text-red-500' : isPositive ? 'text-[var(--brand-green)]' : 'text-slate-500'
                                                 const colorIndex = (client.name.charCodeAt(0) || 0) % 5
                                                 const bgColors = ['bg-blue-900/30 text-blue-400', 'bg-orange-900/30 text-orange-400', 'bg-brand-green/30 text-brand-green', 'bg-purple-900/30 text-purple-400', 'bg-rose-900/30 text-rose-400']
                                                 const avatarClass = bgColors[colorIndex]

                                                 return (
                                                        <div key={client.id} className="bg-[var(--bg-card)] rounded-[2rem] p-5 shadow-sm border border-white/5">
                                                               <div className="flex justify-between items-start mb-4">
                                                                      <div className="flex items-center space-x-4">
                                                                             <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg", avatarClass)}>
                                                                                    {initials}
                                                                             </div>
                                                                             <div>
                                                                                    <h3 className="font-bold text-lg text-white">{client.name}</h3>
                                                                                    <p className="text-xs text-slate-400">#{client.id.toString().padStart(4, '0')}</p>
                                                                             </div>
                                                                      </div>
                                                                      <div className="text-right">
                                                                             <span className={cn("font-bold text-lg tracking-tight", balanceColor)}>
                                                                                    ${client.balance.toLocaleString()}
                                                                             </span>
                                                                      </div>
                                                               </div>
                                                               <div className="flex justify-end space-x-2">
                                                                      <button onClick={() => handleWhatsApp(client.phone)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300">
                                                                             <MessageCircle size={20} />
                                                                      </button>
                                                                      <button onClick={() => handleOpenEdit(client)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300">
                                                                             <Edit size={20} />
                                                                      </button>
                                                                      <button onClick={() => handleWallet(client.id)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300">
                                                                             <CreditCard size={20} />
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 )
                                          })}
                                   </div>

                                   {/* PAGINATION */}
                                   <div className="hidden md:flex p-6 border-t border-white/5 justify-between items-center text-sm text-slate-500 bg-[var(--bg-surface)]">
                                          <p>Mostrando {displayedClients.length} de {totalItems} clientes</p>
                                          <div className="flex gap-2">
                                                 <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className="p-2 rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                                 >
                                                        <ChevronLeft size={20} />
                                                 </button>
                                                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        const p = i + 1
                                                        return (
                                                               <button
                                                                      key={p}
                                                                      onClick={() => setCurrentPage(p)}
                                                                      className={cn("px-3 py-1 rounded-lg transition-colors", currentPage === p ? "bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] font-bold" : "hover:bg-white/5")}
                                                               >
                                                                      {p}
                                                               </button>
                                                        )
                                                 })}
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

                     {/* MODAL */}
                     {isModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                                   <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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
                                                               className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent outline-none transition-all"
                                                               placeholder="Ej: Juan Perez"
                                                        />
                                                 </div>
                                                 <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teléfono</label>
                                                        <input
                                                               required
                                                               value={formData.phone}
                                                               onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                               className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent outline-none transition-all"
                                                               placeholder="Ej: 54911..."
                                                        />
                                                 </div>
                                                 <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email (Opcional)</label>
                                                        <input
                                                               type="email"
                                                               value={formData.email}
                                                               onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                               className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent outline-none transition-all"
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
                                                               className="flex-1 py-3 rounded-xl bg-[var(--brand-blue)] hover:bg-blue-600 text-white font-bold transition-colors flex items-center justify-center gap-2"
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

function FilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
       return (
              <button
                     onClick={onClick}
                     className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap", active ? "bg-[var(--brand-blue)] text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5")}
              >
                     {label}
              </button>
       )
}

function MobileFilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
       return (
              <button
                     onClick={onClick}
                     className={cn("whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", active ? "bg-[var(--brand-blue)] text-white" : "bg-[var(--bg-card)] text-slate-400 hover:bg-white/5")}
              >
                     {label}
              </button>
       )
}
