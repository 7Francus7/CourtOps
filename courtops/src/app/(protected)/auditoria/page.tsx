
'use client'

import { useState, useEffect } from 'react'
import { getAuditLogs } from '@/actions/audit'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShieldCheck, User, Calendar, FileText, Search, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AuditPage() {
       const [logs, setLogs] = useState<any[]>([])
       const [loading, setLoading] = useState(true)
       const [page, setPage] = useState(1)
       const [totalPages, setTotalPages] = useState(1)

       useEffect(() => {
              fetchLogs()
       }, [page])

       const fetchLogs = async () => {
              setLoading(true)
              const res = await getAuditLogs(page)
              setLogs(res.logs)
              setTotalPages(res.totalPages)
              setLoading(false)
       }

       const getActionColor = (action: string) => {
              switch (action) {
                     case 'CREATE': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                     case 'UPDATE': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                     case 'DELETE': return 'text-red-500 bg-red-500/10 border-red-500/20'
                     case 'LOGIN': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                     default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
              }
       }

       const getEntityIcon = (entity: string) => {
              switch (entity) {
                     case 'BOOKING': return <Calendar size={14} />
                     case 'CLIENT': return <User size={14} />
                     case 'FINANCE': return <FileText size={14} />
                     default: return <Activity size={14} />
              }
       }

       return (
              <div className="max-w-6xl mx-auto space-y-6 p-6">
                     <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                   <h1 className="text-2xl font-black flex items-center gap-3">
                                          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                                                 <ShieldCheck size={24} />
                                          </div>
                                          Auditoría de Seguridad
                                   </h1>
                                   <p className="text-sm text-muted-foreground mt-1 ml-1">Registro inmutable de todas las acciones del sistema.</p>
                            </div>
                     </header>

                     <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-lg shadow-black/5">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 p-5 border-b border-border/50 bg-background/50 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                                   <div className="col-span-2">Fecha</div>
                                   <div className="col-span-2">Usuario</div>
                                   <div className="col-span-2">Acción</div>
                                   <div className="col-span-2">Entidad</div>
                                   <div className="col-span-4">Detalles</div>
                            </div>

                            {/* Rows */}
                            {loading ? (
                                   <div className="p-12 text-center text-muted-foreground animate-pulse">Cargando registros...</div>
                            ) : logs.length === 0 ? (
                                   <div className="p-12 text-center text-muted-foreground">No hay registros de auditoría aún.</div>
                            ) : (
                                   <div className="divide-y divide-border/50">
                                          {logs.map((log) => (
                                                 <div key={log.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-card/60 transition-colors text-sm group">
                                                        <div className="col-span-2 font-mono text-xs text-muted-foreground">
                                                               {format(new Date(log.createdAt), "dd/MM HH:mm", { locale: es })}
                                                        </div>
                                                        <div className="col-span-2 flex items-center gap-2 font-medium">
                                                               <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                                      {log.user?.name?.charAt(0) || '?'}
                                                               </div>
                                                               <span className="truncate">{log.user?.name || 'Sistema'}</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                               <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase border w-fit block", getActionColor(log.action))}>
                                                                      {log.action}
                                                               </span>
                                                        </div>
                                                        <div className="col-span-2 flex items-center gap-2 text-muted-foreground font-medium">
                                                               {getEntityIcon(log.entity)}
                                                               <span className="text-xs uppercase tracking-wide">{log.entity}</span>
                                                        </div>
                                                        <div className="col-span-4 text-xs font-mono text-muted-foreground bg-background/50 p-2.5 rounded-xl border border-border/30 truncate group-hover:border-border/60 transition-colors">
                                                               {log.details || '-'}
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>
                            )}
                     </div>

                     {/* Pagination */}
                     <div className="flex justify-center gap-2 py-4">
                            <button
                                   disabled={page === 1}
                                   onClick={() => setPage(p => p - 1)}
                                   className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 text-sm font-bold"
                            >
                                   Anterior
                            </button>
                            <span className="px-4 py-2 text-sm font-mono flex items-center text-muted-foreground">
                                   Página {page} de {totalPages || 1}
                            </span>
                            <button
                                   disabled={page >= totalPages}
                                   onClick={() => setPage(p => p + 1)}
                                   className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 text-sm font-bold"
                            >
                                   Siguiente
                            </button>
                     </div>
              </div>
       )
}
