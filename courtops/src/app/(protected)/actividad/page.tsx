
import React from 'react'
import { getAuditLogs } from '@/actions/audit'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShieldCheck, Calendar, Activity, User, FileText } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'

export default async function ActivityPage() {
       const { logs } = await getAuditLogs()

       // Helper to format details nicely
       const formatDetails = (json: string | null) => {
              if (!json) return '-'
              try {
                     const obj = JSON.parse(json)
                     return Object.entries(obj).map(([key, val]) => (
                            <div key={key} className="text-[10px] text-slate-400">
                                   <span className="font-bold text-slate-300">{key}:</span> {String(val)}
                            </div>
                     ))
              } catch (e) {
                     return json
              }
       }

       return (
              <div className="flex flex-col h-full bg-[var(--bg-dark)]">
                     <Header title="Registro de Actividad" />
                     <div className="flex-1 p-4 md:p-8 min-h-0 overflow-y-auto">
                            <div className="max-w-7xl mx-auto space-y-6 pb-20">

                                   {/* Context */}
                                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                          <div>
                                                 <p className="text-zinc-400 font-medium text-sm flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4 text-brand-green" />
                                                        Auditoría y seguridad de operaciones sensibles.
                                                 </p>
                                          </div>
                                   </div>

                                   {/* Logs Table */}
                                   <div className="bg-[var(--bg-card)] rounded-3xl border border-white/5 overflow-hidden shadow-xl">
                                          <div className="overflow-x-auto">
                                                 <table className="w-full text-left">
                                                        <thead>
                                                               <tr className="border-b border-white/5 bg-white/5">
                                                                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</th>
                                                                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Usuario</th>
                                                                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Acción</th>
                                                                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Entidad</th>
                                                                      <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Detalles</th>
                                                               </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                               {logs.length === 0 ? (
                                                                      <tr>
                                                                             <td colSpan={5} className="p-12 text-center text-slate-500 text-sm">
                                                                                    No hay actividad registrada aún.
                                                                             </td>
                                                                      </tr>
                                                               ) : (
                                                                      logs.map((log) => (
                                                                             <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                                                    <td className="p-4 whitespace-nowrap">
                                                                                           <div className="flex flex-col">
                                                                                                  <span className="font-bold text-xs text-white">{format(log.createdAt, "d MMM yyyy", { locale: es })}</span>
                                                                                                  <span className="text-[10px] text-slate-500 font-mono">{format(log.createdAt, "HH:mm:ss")}</span>
                                                                                           </div>
                                                                                    </td>
                                                                                    <td className="p-4">
                                                                                           {log.user ? (
                                                                                                  <div className="flex items-center gap-2">
                                                                                                         <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] font-black">
                                                                                                                {log.user.name.charAt(0)}
                                                                                                         </div>
                                                                                                         <span className="text-xs font-medium text-white">{log.user.name}</span>
                                                                                                  </div>
                                                                                           ) : (
                                                                                                  <span className="text-xs text-slate-600 italic">Sistema</span>
                                                                                           )}
                                                                                    </td>
                                                                                    <td className="p-4">
                                                                                           <span className={`
                                                                                            inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                                                                                            ${log.action === 'CREATE' ? 'bg-brand-green/10 text-brand-green' : ''}
                                                                                            ${log.action === 'UPDATE' ? 'bg-amber-500/10 text-amber-500' : ''}
                                                                                            ${log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' : ''}
                                                                                            ${log.action === 'LOGIN' ? 'bg-blue-500/10 text-blue-500' : ''}
                                                                                     `}>
                                                                                                  {log.action === 'CREATE' && 'Creación'}
                                                                                                  {log.action === 'UPDATE' && 'Edición'}
                                                                                                  {log.action === 'DELETE' && 'Eliminación'}
                                                                                                  {log.action === 'LOGIN' && 'Acceso'}
                                                                                           </span>
                                                                                    </td>
                                                                                    <td className="p-4">
                                                                                           <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                                                                                  {log.entity === 'BOOKING' && <Calendar className="w-3 h-3 text-slate-500" />}
                                                                                                  {log.entity === 'CLIENT' && <User className="w-3 h-3 text-slate-500" />}
                                                                                                  {log.entity === 'SETTINGS' && <ShieldCheck className="w-3 h-3 text-slate-500" />}
                                                                                                  {log.entity} <span className="text-slate-600 font-mono text-[10px]">#{log.entityId}</span>
                                                                                           </div>
                                                                                    </td>
                                                                                    <td className="p-4">
                                                                                           <div className="max-w-xs">{formatDetails(log.details)}</div>
                                                                                    </td>
                                                                             </tr>
                                                                      ))
                                                               )}
                                                        </tbody>
                                                 </table>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
