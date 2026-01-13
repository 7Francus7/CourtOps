'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, CalendarDays, Users, Wallet, Package, Trophy, Search, UserPlus, ChevronLeft, ChevronRight, MessageCircle, CreditCard, Edit, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Client {
       id: number
       name: string
       phone: string
       balance: number
       email?: string | null
}

interface ClientsListProps {
       initialClients: Client[]
}

type FilterType = 'all' | 'debtors' | 'positive' | 'neutral'

export default function ClientsList({ initialClients }: ClientsListProps) {
       const [filter, setFilter] = useState<FilterType>('all')
       const [search, setSearch] = useState('')

       // Filter Logic
       const filteredClients = initialClients.filter(client => {
              // 1. Text Search
              const searchLower = search.toLowerCase()
              const matchesSearch =
                     client.name.toLowerCase().includes(searchLower) ||
                     client.phone.includes(searchLower) ||
                     (client.id.toString().includes(searchLower))

              if (!matchesSearch) return false

              // 2. Chip Filter (approximate logic to match UI buttons)
              if (filter === 'debtors') return client.balance < 0
              if (filter === 'positive') return client.balance > 0
              if (filter === 'neutral') return client.balance === 0

              return true
       })

       // Pagination Logic (Mock for now, easy to implement)
       const itemsPerPage = 8
       const [currentPage, setCurrentPage] = useState(1)

       const totalItems = filteredClients.length
       const totalPages = Math.ceil(totalItems / itemsPerPage)
       const displayedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
                                   <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                                   <SidebarLink href="/calendar" icon={CalendarDays} label="Reservas" />
                                   <SidebarLink href="/clientes" icon={Users} label="Clientes" active />
                                   <SidebarLink href="/cuentas" icon={Wallet} label="Cuentas Corrientes" />
                                   <SidebarLink href="/inventario" icon={Package} label="Inventario" />
                            </nav>
                            <div className="p-6 mt-auto">
                                   <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4">
                                          <div className="flex items-center gap-3 mb-3">
                                                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600"></div>
                                                 <div>
                                                        <p className="text-xs font-bold text-white">Admin Court</p>
                                                        <p className="text-[10px] text-slate-500">Soporte Activo</p>
                                                 </div>
                                          </div>
                                          <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] font-bold text-slate-300 transition-colors flex items-center justify-center gap-2">
                                                 <LogOut size={14} />
                                                 CERRAR SESIÓN
                                          </button>
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
                                          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-95">
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

                            <div className="flex-1 px-8 pb-8 overflow-hidden">
                                   <div className="h-full bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                                          <div className="overflow-x-auto flex-1">
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
                                                                             // Generate a somewhat consistent color based on char code of name
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
                                                                                                         <ActionButton icon={MessageCircle} colorClass="text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500" title="WhatsApp" />
                                                                                                         <ActionButton icon={CreditCard} colorClass="text-blue-400 bg-blue-500/10 hover:bg-blue-500" title="Cuenta Corriente" />
                                                                                                         <ActionButton icon={Edit} colorClass="text-slate-400 bg-slate-500/10 hover:bg-slate-500" title="Editar" />
                                                                                                  </div>
                                                                                           </td>
                                                                                    </tr>
                                                                             )
                                                                      })
                                                               )}
                                                        </tbody>
                                                 </table>
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

              </div>
       )
}

// Subcomponents

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

function ActionButton({ icon: Icon, colorClass, title }: { icon: any, colorClass: string, title: string }) {
       return (
              <button className={cn("p-2.5 rounded-xl transition-all hover:text-white", colorClass)} title={title}>
                     <Icon size={20} />
              </button>
       )
}
