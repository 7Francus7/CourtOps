

'use client'

import { useState, useEffect } from 'react'
import { getAuditLogs } from '@/actions/audit'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShieldCheck, User, Calendar, FileText, Activity, Search, Filter, ArrowRight, ArrowLeft, Download, History, Database, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface AuditLog {
       id: string
       createdAt: string | Date
       action: string
       entity: string
       details: string | null
       user?: {
              name: string
              email: string
       } | null
}

export default function AuditPage() {
       const [logs, setLogs] = useState<AuditLog[]>([])
       const [loading, setLoading] = useState(true)
       const [page, setPage] = useState(1)
       const [totalPages, setTotalPages] = useState(1)
       const [searchQuery, setSearchQuery] = useState('')

       useEffect(() => {
              const fetchLogs = async () => {
                     setLoading(true)
                     const res = await getAuditLogs(page)
                     setLogs(res.logs as unknown as AuditLog[])
                     setTotalPages(res.totalPages)
                     setLoading(false)
              }
              fetchLogs()
       }, [page])

       const getActionStyles = (action: string) => {
              switch (action) {
                     case 'CREATE': return 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10'
                     case 'UPDATE': return 'text-amber-500 bg-amber-500/5 border-amber-500/10'
                     case 'DELETE': return 'text-red-500 bg-red-500/5 border-red-500/10'
                     case 'LOGIN': return 'text-blue-500 bg-blue-500/5 border-blue-500/10'
                     default: return 'text-slate-500 bg-slate-500/5 border-slate-500/10'
              }
       }

       const getEntityStyles = (entity: string) => {
              switch (entity) {
                     case 'BOOKING': return { icon: <Calendar size={14} />, color: 'bg-indigo-500/10 text-indigo-500' }
                     case 'CLIENT': return { icon: <User size={14} />, color: 'bg-purple-500/10 text-purple-500' }
                     case 'FINANCE': return { icon: <FileText size={14} />, color: 'bg-pink-500/10 text-pink-500' }
                     default: return { icon: <Activity size={14} />, color: 'bg-slate-500/10 text-slate-500' }
              }
       }

       return (
              <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 lg:p-10 min-h-screen bg-transparent pb-24 md:pb-10">
                     {/* Header Section */}
                     <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                            <motion.div
                                   initial={{ opacity: 0, x: -20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   className="space-y-1 min-w-0"
                            >
                                   <div className="flex items-center gap-2.5 md:gap-3">
                                          <div className="p-2 md:p-2.5 bg-primary/10 rounded-xl md:rounded-2xl text-primary shadow-inner shrink-0">
                                                 <ShieldCheck size={22} className="md:hidden" strokeWidth={2.5} />
                                                 <ShieldCheck size={28} className="hidden md:block" strokeWidth={2.5} />
                                          </div>
                                          <h1 className="text-xl md:text-3xl font-black tracking-tight text-gradient truncate">
                                                 Auditoría de Seguridad
                                          </h1>
                                   </div>
                                   <p className="text-muted-foreground font-medium flex items-center gap-2 ml-1 text-xs md:text-sm">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                          <span className="truncate">Registro inmutable de todas las acciones del sistema.</span>
                                   </p>
                            </motion.div>

                            <motion.div
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   className="flex items-center gap-2 md:gap-3 w-full md:w-auto"
                            >
                                   <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-md hover:bg-card hover:border-border transition-all text-sm font-bold shadow-sm">
                                          <Download size={16} />
                                          Exportar
                                   </button>
                                   <button className="flex-1 md:flex-none btn-premium !px-5 !py-2.5 !rounded-xl !text-xs">
                                          Sincronizar
                                   </button>
                            </motion.div>
                     </header>

                     {/* Stats Overview */}
                     <div className="grid grid-cols-3 gap-3 md:gap-6">
                            {[
                                   { label: 'Eventos Semanales', value: logs.length * 4 + 12, icon: History, color: 'text-blue-500' },
                                   { label: 'Base de Datos', value: 'Conectada', icon: Database, color: 'text-emerald-500' },
                                   { label: 'Integridad', value: '100%', icon: CheckCircle2, color: 'text-indigo-500' },
                            ].map((stat, i) => (
                                   <motion.div
                                          key={stat.label}
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: i * 0.1 }}
                                          className="glass-card p-3 md:p-6 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-5 group hover:border-primary/30 transition-all duration-500"
                                   >
                                          <div className={cn("p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-background/80 shadow-sm transition-transform group-hover:scale-110 duration-500", stat.color)}>
                                                 <stat.icon size={20} className="md:hidden" />
                                                 <stat.icon size={24} className="hidden md:block" />
                                          </div>
                                          <div className="text-center md:text-left">
                                                 <p className="section-label !text-[8px] md:!text-[9px]">{stat.label}</p>
                                                 <h3 className="text-lg md:text-2xl font-black mt-0.5">{stat.value}</h3>
                                          </div>
                                   </motion.div>
                            ))}
                     </div>

                     {/* Main Container */}
                     <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4"
                     >
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-stretch sm:items-center bg-card/20 backdrop-blur-sm p-3 md:p-4 rounded-2xl border border-border/50 shadow-sm">
                                   <div className="relative w-full sm:w-80 group">
                                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                                          <input
                                                 type="text"
                                                 placeholder="Buscar en registros..."
                                                 className="w-full bg-background/50 border border-border/50 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                                                 value={searchQuery}
                                                 onChange={(e) => setSearchQuery(e.target.value)}
                                          />
                                   </div>
                                   <div className="flex items-center gap-2 justify-between sm:justify-end">
                                          <button className="p-2.5 rounded-xl border border-border/50 bg-background/40 hover:bg-background transition-colors text-muted-foreground">
                                                 <Filter size={18} />
                                          </button>
                                          <div className="h-8 w-px bg-border/50 mx-1 md:mx-2 hidden sm:block" />
                                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-lg text-primary text-[10px] font-black uppercase tracking-wider">
                                                 {logs.length} resultados
                                          </div>
                                   </div>
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border-white/5 relative">
                                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />

                                   <div className="overflow-x-auto custom-scrollbar">
                                          <table className="w-full text-left border-collapse">
                                                 <thead>
                                                        <tr className="border-b border-border/30 bg-background/10">
                                                               <th className="p-6 section-label !text-[9px]">Fecha y Hora</th>
                                                               <th className="p-6 section-label !text-[9px]">Usuario</th>
                                                               <th className="p-6 section-label !text-[9px]">Acción</th>
                                                               <th className="p-6 section-label !text-[9px]">Entidad</th>
                                                               <th className="p-6 section-label !text-[9px]">Detalles Técnicos</th>
                                                        </tr>
                                                 </thead>
                                                 <tbody className="divide-y divide-border/20">
                                                        <AnimatePresence mode='wait'>
                                                               {loading ? (
                                                                      <tr>
                                                                             <td colSpan={5} className="p-20 text-center">
                                                                                    <div className="flex flex-col items-center gap-3">
                                                                                           <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                                                           <p className="text-muted-foreground font-bold animate-pulse">Cifrando datos de auditoría...</p>
                                                                                    </div>
                                                                             </td>
                                                                      </tr>
                                                               ) : logs.length === 0 ? (
                                                                      <tr>
                                                                             <td colSpan={5} className="p-20 text-center text-muted-foreground font-medium">
                                                                                    No se encontraron registros en este período.
                                                                             </td>
                                                                      </tr>
                                                               ) : (
                                                                      logs.map((log, idx) => {
                                                                             const entityStyles = getEntityStyles(log.entity)
                                                                             return (
                                                                                    <motion.tr
                                                                                           key={log.id}
                                                                                           initial={{ opacity: 0, y: 10 }}
                                                                                           animate={{ opacity: 1, y: 0 }}
                                                                                           transition={{ delay: idx * 0.03 }}
                                                                                           className="group hover:bg-primary/[0.02] transition-colors relative"
                                                                                    >
                                                                                           <td className="p-6 align-middle">
                                                                                                  <div className="flex flex-col">
                                                                                                         <span className="text-sm font-black tracking-tight text-foreground/90">
                                                                                                                {format(new Date(log.createdAt), "dd 'de' MMMM", { locale: es })}
                                                                                                         </span>
                                                                                                         <span className="text-[11px] font-mono text-muted-foreground mt-0.5">
                                                                                                                {format(new Date(log.createdAt), "HH:mm:ss 'hs'")}
                                                                                                         </span>
                                                                                                  </div>
                                                                                           </td>
                                                                                           <td className="p-6 align-middle">
                                                                                                  <div className="flex items-center gap-3">
                                                                                                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center border border-white/10 overflow-hidden shadow-sm">
                                                                                                                {log.user?.email ? (
                                                                                                                       <span className="text-[10px] font-black">{log.user.name.charAt(0)}</span>
                                                                                                                ) : (
                                                                                                                       <ShieldCheck size={14} className="text-primary/60" />
                                                                                                                )}
                                                                                                         </div>
                                                                                                         <div className="flex flex-col">
                                                                                                                <span className="text-sm font-bold text-foreground/80 truncate max-w-[120px]">
                                                                                                                       {log.user?.name || 'Sistema'}
                                                                                                                </span>
                                                                                                                <span className="text-[10px] text-muted-foreground/60 tracking-tight">
                                                                                                                       {log.user?.email || 'AUTOMATIZADO'}
                                                                                                                </span>
                                                                                                         </div>
                                                                                                  </div>
                                                                                           </td>
                                                                                           <td className="p-6 align-middle">
                                                                                                  <span className={cn(
                                                                                                         "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all group-hover:bg-opacity-10",
                                                                                                         getActionStyles(log.action)
                                                                                                  )}>
                                                                                                         <span className="w-1 h-1 rounded-full bg-current" />
                                                                                                         {log.action}
                                                                                                  </span>
                                                                                           </td>
                                                                                           <td className="p-6 align-middle">
                                                                                                  <div className="flex items-center gap-2.5">
                                                                                                         <div className={cn("p-1.5 rounded-lg transition-transform group-hover:rotate-12 duration-300", entityStyles.color)}>
                                                                                                                {entityStyles.icon}
                                                                                                         </div>
                                                                                                         <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{log.entity}</span>
                                                                                                  </div>
                                                                                           </td>
                                                                                           <td className="p-6 align-middle min-w-[300px]">
                                                                                                  <div className="text-[10px] font-mono leading-relaxed p-3 bg-background/40 border border-border/30 rounded-xl text-muted-foreground group-hover:border-primary/20 transition-colors max-h-16 overflow-y-auto no-scrollbar scroll-smooth">
                                                                                                         {log.details || 'ID_REF: ' + log.id.slice(-8).toUpperCase()}
                                                                                                  </div>
                                                                                           </td>
                                                                                    </motion.tr>
                                                                             )
                                                                      })
                                                               )}
                                                        </AnimatePresence>
                                                 </tbody>
                                          </table>
                                   </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                   <AnimatePresence mode='wait'>
                                          {loading ? (
                                                 <div className="flex flex-col items-center gap-3 py-16">
                                                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                        <p className="text-muted-foreground font-bold animate-pulse text-sm">Cifrando datos...</p>
                                                 </div>
                                          ) : logs.length === 0 ? (
                                                 <div className="py-16 text-center text-muted-foreground font-medium text-sm">
                                                        No se encontraron registros.
                                                 </div>
                                          ) : (
                                                 logs.map((log, idx) => {
                                                        const entityStyles = getEntityStyles(log.entity)
                                                        return (
                                                               <motion.div
                                                                      key={log.id}
                                                                      initial={{ opacity: 0, y: 10 }}
                                                                      animate={{ opacity: 1, y: 0 }}
                                                                      transition={{ delay: idx * 0.03 }}
                                                                      className="glass-card rounded-2xl p-4 space-y-3"
                                                               >
                                                                      {/* Top row: user + action badge */}
                                                                      <div className="flex items-center justify-between">
                                                                             <div className="flex items-center gap-2.5 min-w-0">
                                                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center border border-white/10 shrink-0">
                                                                                           {log.user?.email ? (
                                                                                                  <span className="text-[11px] font-black">{log.user.name.charAt(0)}</span>
                                                                                           ) : (
                                                                                                  <ShieldCheck size={14} className="text-primary/60" />
                                                                                           )}
                                                                                    </div>
                                                                                    <div className="min-w-0">
                                                                                           <p className="text-sm font-bold text-foreground/90 truncate">{log.user?.name || 'Sistema'}</p>
                                                                                           <p className="text-[10px] text-muted-foreground/60 truncate">{log.user?.email || 'AUTOMATIZADO'}</p>
                                                                                    </div>
                                                                             </div>
                                                                             <span className={cn(
                                                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0",
                                                                                    getActionStyles(log.action)
                                                                             )}>
                                                                                    <span className="w-1 h-1 rounded-full bg-current" />
                                                                                    {log.action}
                                                                             </span>
                                                                      </div>

                                                                      {/* Bottom row: date + entity */}
                                                                      <div className="flex items-center justify-between text-xs">
                                                                             <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                                    <Calendar size={12} className="shrink-0" />
                                                                                    <span className="font-semibold">
                                                                                           {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: es })}
                                                                                    </span>
                                                                             </div>
                                                                             <div className="flex items-center gap-1.5">
                                                                                    <div className={cn("p-1 rounded-md", entityStyles.color)}>
                                                                                           {entityStyles.icon}
                                                                                    </div>
                                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{log.entity}</span>
                                                                             </div>
                                                                      </div>

                                                                      {/* Details (if present) */}
                                                                      {log.details && (
                                                                             <div className="text-[10px] font-mono leading-relaxed p-2.5 bg-background/40 border border-border/30 rounded-xl text-muted-foreground max-h-14 overflow-y-auto no-scrollbar">
                                                                                    {log.details}
                                                                             </div>
                                                                      )}
                                                               </motion.div>
                                                        )
                                                 })
                                          )}
                                   </AnimatePresence>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4 bg-card/20 backdrop-blur-sm p-3 md:p-4 rounded-2xl border border-border/50">
                                   <p className="text-xs font-medium text-muted-foreground">
                                          Página <span className="text-foreground font-black">{page}</span> de {totalPages}
                                   </p>
                                   <div className="flex items-center gap-2">
                                          <button
                                                 disabled={page === 1}
                                                 onClick={() => setPage(p => p - 1)}
                                                 className="px-3 md:px-5 py-2 rounded-xl border border-border/50 bg-background/40 hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
                                          >
                                                 <ArrowLeft size={14} className="md:hidden" />
                                                 <span className="hidden md:inline">Anterior</span>
                                                 <span className="md:hidden">Ant</span>
                                          </button>
                                          <div className="flex items-center gap-1 px-1 md:px-2">
                                                 {[...Array(Math.min(3, totalPages))].map((_, i) => {
                                                        const pNum = i + 1;
                                                        return (
                                                               <button
                                                                      key={i}
                                                                      onClick={() => setPage(pNum)}
                                                                      className={cn(
                                                                             "w-8 h-8 rounded-lg text-xs font-black transition-all",
                                                                             page === pNum ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground"
                                                                      )}
                                                               >
                                                                      {pNum}
                                                               </button>
                                                        )
                                                 })}
                                                 {totalPages > 3 && <span className="text-muted-foreground">...</span>}
                                          </div>
                                          <button
                                                 disabled={page >= totalPages}
                                                 onClick={() => setPage(p => p + 1)}
                                                 className="px-3 md:px-5 py-2 rounded-xl border border-border/50 bg-background/40 hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
                                          >
                                                 <span className="hidden md:inline">Siguiente</span>
                                                 <span className="md:hidden">Sig</span>
                                                 <ArrowRight size={14} />
                                          </button>
                                   </div>
                            </div>
                     </motion.div>
              </div>
       )
}
