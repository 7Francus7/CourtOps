'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, User, Package, Calendar, BarChart3, Store, Home, Command, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CommandItem {
       id: string
       title: string
       subtitle: string
       icon: React.ReactNode
       action: () => void
       category: string
}

export function CommandPalette() {
       const [isOpen, setIsOpen] = useState(false)
       const [query, setQuery] = useState('')
       const [selectedIndex, setSelectedIndex] = useState(0)
       const router = useRouter()

       const toggle = useCallback(() => setIsOpen(prev => !prev), [])

       useEffect(() => {
              const handleKeyDown = (e: KeyboardEvent) => {
                     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                            e.preventDefault()
                            toggle()
                     }
                     if (e.key === 'Escape') setIsOpen(false)
              }
              window.addEventListener('keydown', handleKeyDown)
              return () => window.removeEventListener('keydown', handleKeyDown)
       }, [toggle])

       const commands: CommandItem[] = [
              { id: 'dash', title: 'Dashboard', subtitle: 'Ir a la vista principal', icon: <Home size={18} />, action: () => router.push('/dashboard'), category: 'Navegación' },
              { id: 'kiosco', title: 'Abrir Kiosko', subtitle: 'Punto de venta directo', icon: <Store size={18} />, action: () => router.push('?modal=kiosco'), category: 'Navegación' },
              { id: 'rev', title: 'Reportes y Ventas', subtitle: 'Estadísticas del club', icon: <BarChart3 size={18} />, action: () => router.push('/reportes'), category: 'Navegación' },
              { id: 'book', title: 'Turnero Full', subtitle: 'Gestión completa de canchas', icon: <Calendar size={18} />, action: () => router.push('?view=bookings'), category: 'Navegación' },
              { id: 'client', title: 'Nuevo Cliente', subtitle: 'Registrar un nuevo jugador', icon: <User size={18} />, action: () => router.push('/clientes'), category: 'Acciones Rápidas' },
              { id: 'prod', title: 'Gestión de Inventario', subtitle: 'Configurar productos y stock', icon: <Package size={18} />, action: () => router.push('/configuracion'), category: 'Acciones Rápidas' },
       ]

       const filtered = query === ''
              ? commands
              : commands.filter(c =>
                     c.title.toLowerCase().includes(query.toLowerCase()) ||
                     c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
                     c.category.toLowerCase().includes(query.toLowerCase())
              )

       useEffect(() => {
              setSelectedIndex(0)
       }, [query])

       const handleSelect = (item: CommandItem) => {
              item.action()
              setIsOpen(false)
              setQuery('')
       }

       const handleKeyDown = (e: React.KeyboardEvent) => {
              if (e.key === 'ArrowDown') {
                     e.preventDefault()
                     setSelectedIndex(prev => (prev + 1) % filtered.length)
              } else if (e.key === 'ArrowUp') {
                     e.preventDefault()
                     setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
              } else if (e.key === 'Enter') {
                     if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex])
              }
       }

       return (
              <AnimatePresence>
                     {isOpen && (
                            <>
                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          onClick={() => setIsOpen(false)}
                                          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md"
                                   />
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                          className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[210] outline-none"
                                          onKeyDown={handleKeyDown}
                                   >
                                          <div className="bg-card/80 dark:bg-[#030712]/90 backdrop-blur-2xl border border-border/50 rounded-[2rem] shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden">
                                                 {/* Input Header */}
                                                 <div className="p-6 border-b border-border/30 flex items-center gap-4 group">
                                                        <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
                                                        <input
                                                               autoFocus
                                                               className="flex-1 bg-transparent border-none text-xl font-medium focus:ring-0 outline-none placeholder:text-muted-foreground/30"
                                                               placeholder="Busca comandos, navegar..."
                                                               value={query}
                                                               onChange={e => setQuery(e.target.value)}
                                                        />
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg border border-border/50 text-[10px] font-black font-mono text-muted-foreground">
                                                               ESC
                                                        </div>
                                                 </div>

                                                 {/* Results List */}
                                                 <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar">
                                                        {filtered.length > 0 ? (
                                                               <div className="space-y-4">
                                                                      {Object.entries(
                                                                             filtered.reduce((acc, curr) => {
                                                                                    if (!acc[curr.category]) acc[curr.category] = []
                                                                                    acc[curr.category].push(curr)
                                                                                    return acc
                                                                             }, {} as Record<string, CommandItem[]>)
                                                                      ).map(([category, items]) => (
                                                                             <div key={category} className="space-y-1">
                                                                                    <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                                                                                           {category}
                                                                                    </h3>
                                                                                    {items.map((item, _idx) => {
                                                                                           const isSelected = filtered[selectedIndex]?.id === item.id
                                                                                           return (
                                                                                                  <button
                                                                                                         key={item.id}
                                                                                                         onClick={() => handleSelect(item)}
                                                                                                         className={cn(
                                                                                                                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all group relative",
                                                                                                                isSelected
                                                                                                                       ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02] z-10"
                                                                                                                       : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                                                                                         )}
                                                                                                  >
                                                                                                         <div className={cn(
                                                                                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                                                                                isSelected ? "bg-white/20" : "bg-muted"
                                                                                                         )}>
                                                                                                                {item.icon}
                                                                                                         </div>
                                                                                                         <div className="flex-1 min-w-0">
                                                                                                                <p className="font-bold text-sm truncate">{item.title}</p>
                                                                                                                <p className={cn(
                                                                                                                       "text-[10px] font-medium truncate opacity-60",
                                                                                                                       isSelected ? "text-white/70" : "text-muted-foreground"
                                                                                                                )}>
                                                                                                                       {item.subtitle}
                                                                                                                </p>
                                                                                                         </div>
                                                                                                         {isSelected && (
                                                                                                                <motion.div
                                                                                                                       layoutId="arrow"
                                                                                                                       initial={{ x: -10, opacity: 0 }}
                                                                                                                       animate={{ x: 0, opacity: 1 }}
                                                                                                                       className="flex items-center gap-1.5"
                                                                                                                >
                                                                                                                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">ENTER</span>
                                                                                                                       <ArrowRight size={16} />
                                                                                                                </motion.div>
                                                                                                         )}
                                                                                                  </button>
                                                                                           )
                                                                                    })}
                                                                             </div>
                                                                      ))}
                                                               </div>
                                                        ) : (
                                                               <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                                                                      <Zap size={48} className="mb-4 text-muted-foreground" />
                                                                      <p className="text-sm font-bold">No encontramos nada para "{query}"</p>
                                                                      <p className="text-xs">Intenta con otros términos...</p>
                                                               </div>
                                                        )}
                                                 </div>

                                                 {/* Footer */}
                                                 <div className="p-4 border-t border-border/10 bg-muted/20 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                        <div className="flex items-center gap-4">
                                                               <span className="flex items-center gap-1.5">
                                                                      <span className="px-1.5 py-0.5 bg-background border border-border/50 rounded">↑↓</span> Navegar
                                                               </span>
                                                               <span className="flex items-center gap-1.5">
                                                                      <span className="px-1.5 py-0.5 bg-background border border-border/50 rounded">ENTER</span> Seleccionar
                                                               </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                               <Command size={12} />
                                                               <span>Quick Command</span>
                                                        </div>
                                                 </div>
                                          </div>
                                   </motion.div>
                            </>
                     )}
              </AnimatePresence>
       )
}
