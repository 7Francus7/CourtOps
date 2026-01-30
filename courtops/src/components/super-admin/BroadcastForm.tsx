
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
                     <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                   📢 Broadcasting
                            </h3>
                            <p className="text-xs text-zinc-400">
                                   Envía alertas globales a todos los clubes o solo a administradores.
                            </p>

                            <form action={handleSubmit} className="space-y-3">
                                   <div>
                                          <label className="text-xs font-bold text-zinc-500 uppercase">Título</label>
                                          <input
                                                 name="title"
                                                 required
                                                 className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white text-sm"
                                                 placeholder="Ej: Mantenimiento Programado"
                                          />
                                   </div>

                                   <div>
                                          <label className="text-xs font-bold text-zinc-500 uppercase">Mensaje</label>
                                          <textarea
                                                 name="message"
                                                 required
                                                 rows={2}
                                                 className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white text-sm"
                                                 placeholder="El sistema estará inactivo de 3AM a 4AM..."
                                          />
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                          <div>
                                                 <label className="text-xs font-bold text-zinc-500 uppercase">Tipo</label>
                                                 <select name="type" className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white text-sm">
                                                        <option value="INFO">Info (Azul)</option>
                                                        <option value="WARNING">Alerta (Amarillo)</option>
                                                        <option value="ERROR">Error (Rojo)</option>
                                                        <option value="SUCCESS">Éxito (Verde)</option>
                                                 </select>
                                          </div>
                                          <div>
                                                 <label className="text-xs font-bold text-zinc-500 uppercase">Destino</label>
                                                 <select name="target" className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white text-sm">
                                                        <option value="ALL">Todos los usuarios</option>
                                                        <option value="ADMINS">Solo Admins</option>
                                                 </select>
                                          </div>
                                   </div>

                                   <button
                                          disabled={loading}
                                          type="submit"
                                          className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded transition-colors"
                                   >
                                          {loading ? 'Enviando...' : 'Enviar Broadcast'}
                                   </button>
                            </form>
                     </div>

                     {/* ACTIVE BROADCASTS LIST */}
                     {activeNotifications.length > 0 && (
                            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-2xl">
                                   <h3 className="text-sm font-bold text-green-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                          Notificaciones Activas
                                   </h3>
                                   <div className="space-y-3">
                                          {activeNotifications.map(n => (
                                                 <div key={n.id} className="bg-black/40 border border-white/5 rounded-lg p-3 flex justify-between items-start gap-3">
                                                        <div>
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      {n.type === 'INFO' && <Info size={14} className="text-blue-400" />}
                                                                      {n.type === 'WARNING' && <AlertTriangle size={14} className="text-yellow-400" />}
                                                                      {n.type === 'ERROR' && <XCircle size={14} className="text-red-400" />}
                                                                      {n.type === 'SUCCESS' && <CheckCircle size={14} className="text-green-400" />}
                                                                      <span className="font-bold text-white text-sm">{n.title}</span>
                                                                      <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded uppercase">{n.target}</span>
                                                               </div>
                                                               <p className="text-zinc-400 text-xs">{n.message}</p>
                                                        </div>
                                                        <button
                                                               onClick={() => handleDeactivate(n.id)}
                                                               className="text-zinc-500 hover:text-red-400 transition-colors p-1"
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
