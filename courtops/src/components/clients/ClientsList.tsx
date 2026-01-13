'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Search, SlidersHorizontal, Home, Calendar, Users, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import ClientCard from './ClientCard'

interface Client {
       id: number
       name: string
       phone: string
       balance: number
       email?: string | null
       // add other fields if needed from prisma type
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

              // 2. Chip Filter
              if (filter === 'debtors') return client.balance < 0
              if (filter === 'positive') return client.balance > 0
              if (filter === 'neutral') return client.balance === 0

              return true
       })

       return (
              <div className="min-h-screen bg-bg-dark text-white font-sans flex flex-col pb-20">

                     {/* STATUS BAR (Fake for visual matching, or just skip) */}
                     {/* The user's HTML had a status bar. Web apps usually don't implement this unless they are PWA specifics. I'll skip it to avoid clutter. */}

                     {/* HEADER */}
                     <header className="px-5 pt-4 pb-4 flex flex-col gap-4 sticky top-0 bg-bg-dark z-20 border-b border-white/5 shadow-sm">
                            <div className="flex items-center gap-2">
                                   <Link href="/" className="text-brand-blue flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity">
                                          <ChevronLeft className="w-5 h-5" />
                                          Volver
                                   </Link>
                            </div>

                            <div className="flex justify-between items-center">
                                   <div>
                                          <h1 className="text-3xl font-bold tracking-tight text-white">Clientes</h1>
                                          <p className="text-text-grey text-sm mt-1">Gestión de cartera y cuentas</p>
                                   </div>
                                   <button className="h-10 w-10 flex items-center justify-center bg-bg-card rounded-full shadow-sm border border-white/10 text-brand-blue hover:scale-110 transition-transform active:scale-95">
                                          <Plus className="w-6 h-6" />
                                   </button>
                            </div>

                            {/* SEARCH */}
                            <div className="relative mt-2">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <Search className="w-5 h-5 text-text-grey" />
                                   </div>
                                   <input
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="block w-full pl-10 pr-10 py-3 border-none rounded-xl bg-bg-card placeholder-text-grey/50 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm transition-all text-white"
                                          placeholder="Buscar por nombre, teléfono..."
                                          type="text"
                                   />
                                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                          <button className="text-text-grey hover:text-white">
                                                 <SlidersHorizontal className="w-5 h-5" />
                                          </button>
                                   </div>
                            </div>

                            {/* FILTERS */}
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-5 px-5">
                                   <FilterChip label="Todos" active={filter === 'all'} onClick={() => setFilter('all')} />
                                   <FilterChip label="Deudores" active={filter === 'debtors'} onClick={() => setFilter('debtors')} />
                                   <FilterChip label="A favor" active={filter === 'positive'} onClick={() => setFilter('positive')} />
                                   <FilterChip label="Sin saldo" active={filter === 'neutral'} onClick={() => setFilter('neutral')} />
                            </div>
                     </header>

                     {/* MAIN LIST */}
                     <main className="px-4 pt-4 space-y-3 flex-1 overflow-y-auto">
                            {filteredClients.length === 0 ? (
                                   <div className="text-center py-10 opacity-50">
                                          <p>No se encontraron clientes</p>
                                   </div>
                            ) : (
                                   filteredClients.map(client => (
                                          <ClientCard key={client.id} client={client} />
                                   ))
                            )}
                     </main>

                     {/* FAB - Add Button (Floating) */}
                     <div className="fixed bottom-24 right-6 z-30">
                            <button className="h-14 w-14 rounded-full bg-brand-blue text-white shadow-lg shadow-brand-blue/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                                   <Plus className="w-8 h-8" />
                            </button>
                     </div>

                     {/* BOTTOM NAV */}
                     <nav className="fixed bottom-0 w-full bg-bg-card border-t border-white/10 pb-6 pt-3 px-6 z-40">
                            <div className="flex justify-between items-center text-[10px] font-medium text-text-grey">
                                   <Link href="/" className="flex flex-col items-center gap-1 hover:text-white transition-colors">
                                          <Home className="w-6 h-6" />
                                          <span>Inicio</span>
                                   </Link>
                                   <Link href="/calendar" className="flex flex-col items-center gap-1 hover:text-white transition-colors">
                                          <Calendar className="w-6 h-6" />
                                          <span>Reservas</span>
                                   </Link>
                                   <div className="flex flex-col items-center gap-1 text-brand-blue">
                                          <Users className="w-6 h-6" />
                                          <span>Clientes</span>
                                   </div>
                                   {/* If Kiosco is available, link it. Assuming we can open the modal from here is tricky across pages. 
                Ideally, Kiosco is a modal. For now, maybe just a placeholder or link to dashboard? 
                Let's keep it visually present but maybe just link to dashboard kioso or simple placeholder.
            */}
                                   <div className="flex flex-col items-center gap-1 hover:text-white transition-colors opacity-50">
                                          <Store className="w-6 h-6" />
                                          <span>Kiosco</span>
                                   </div>
                            </div>
                     </nav>

              </div>
       )
}

function FilterChip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
       return (
              <button
                     onClick={onClick}
                     className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                            active
                                   ? "bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20"
                                   : "bg-bg-card border-white/10 text-text-grey hover:bg-white/5 hover:border-white/20"
                     )}
              >
                     {label}
              </button>
       )
}
