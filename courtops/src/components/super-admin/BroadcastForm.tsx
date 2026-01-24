
'use client'

import { createSystemNotification } from '@/actions/super-admin'
import { useState } from 'react'

export default function BroadcastForm() {
       const [loading, setLoading] = useState(false)

       async function handleSubmit(formData: FormData) {
              setLoading(true)
              const res = await createSystemNotification(formData)
              setLoading(false)
              if (res.success) {
                     alert('Notificación enviada')
                     // Reset form (could use ref)
              } else {
                     alert('Error: ' + res.error)
              }
       }

       return (
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
       )
}
