
'use client'

import { createSystemNotification, deactivateSystemNotification } from '@/actions/super-admin'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

export default function BroadcastForm({ notifications }: { notifications: any[] }) {
       const [loading, setLoading] = useState(false)
       const router = useRouter()

       async function handleSubmit(formData: FormData) {
              setLoading(true)
              const res = await createSystemNotification(formData)
              setLoading(false)
              if (res.success) {
                     alert('Notificación enviada')
                     router.refresh()
                     // Form reset happens automatically on submission or we can force it
              } else {
                     alert('Error: ' + res.error)
              }
       }

       async function handleDeactivate(id: string) {
              if (!confirm('¿Desactivar esta notificación?')) return
              const res = await deactivateSystemNotification(id)
              if (res.success) {
                     router.refresh()
              } else {
                     alert('Error: ' + res.error)
              }
       }

       const activeNotifications = notifications?.filter(n => n.isActive) || []

       return (
              <div className="space-y-6">
                     <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                   📢 Broadcasting
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                                   Envía alertas globales a todos los clubes o solo a administradores.
                            </p>

                            <form action={handleSubmit} className="space-y-4">
                                   <div className="space-y-1">
                                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1">Título</label>
                                          <input
                                                 name="title"
                                                 required
                                                 className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all placeholder:text-slate-400"
                                                 placeholder="Ej: Mantenimiento Programado"
                                          />
                                   </div>

                                   <div className="space-y-1">
                                          <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1">Mensaje</label>
                                          <textarea
                                                 name="message"
                                                 required
                                                 rows={2}
                                                 className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/20 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all placeholder:text-slate-400"
                                                 placeholder="El sistema estará inactivo de 3AM a 4AM..."
                                          />
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-1">
                                                 <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1">Tipo</label>
                                                 <select name="type" className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/20 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm outline-none">
                                                        <option value="INFO">Info (Azul)</option>
                                                        <option value="WARNING">Alerta (Amarillo)</option>
                                                        <option value="ERROR">Error (Rojo)</option>
                                                        <option value="SUCCESS">Éxito (Verde)</option>
                                                 </select>
                                          </div>
                                          <div className="space-y-1">
                                                 <label className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1">Destino</label>
                                                 <select name="target" className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/20 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm outline-none">
                                                        <option value="ALL">Todos los usuarios</option>
                                                        <option value="ADMINS">Solo Admins</option>
                                                 </select>
                                          </div>
                                   </div>

                                   <button
                                          disabled={loading}
                                          type="submit"
                                          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                                   >
                                          {loading ? 'Procesando...' : 'Transmitir Alerta Global'}
                                   </button>
                            </form>
                     </div>

                     {/* ACTIVE BROADCASTS LIST */}
                     {activeNotifications.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
                                   <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                          Notificaciones Activas
                                   </h3>
                                   <div className="space-y-3">
                                          {activeNotifications.map(n => (
                                                 <div key={n.id} className="bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl p-4 flex justify-between items-start gap-3">
                                                        <div>
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      {n.type === 'INFO' && <Info size={14} className="text-blue-500" />}
                                                                      {n.type === 'WARNING' && <AlertTriangle size={14} className="text-yellow-600 dark:text-yellow-400" />}
                                                                      {n.type === 'ERROR' && <XCircle size={14} className="text-red-500" />}
                                                                      {n.type === 'SUCCESS' && <CheckCircle size={14} className="text-emerald-500" />}
                                                                      <span className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</span>
                                                                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded uppercase font-black">{n.target}</span>
                                                               </div>
                                                               <p className="text-slate-500 dark:text-zinc-400 text-xs font-medium">{n.message}</p>
                                                        </div>
                                                        <button
                                                               onClick={() => handleDeactivate(n.id)}
                                                               className="text-slate-300 dark:text-zinc-600 hover:text-red-500 transition-colors p-1"
                                                               title="Desactivar"
                                                        >
                                                               <Trash2 size={16} />
                                                        </button>
                                                 </div>
                                          ))}
                                   </div>
                            </div>
                     )}
              </div>
       )
}
