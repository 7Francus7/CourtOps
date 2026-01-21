'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTournament } from '@/actions/tournaments'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewTournamentPage() {
       const router = useRouter()
       const [loading, setLoading] = useState(false)
       const [formData, setFormData] = useState({
              name: '',
              startDate: new Date().toISOString().split('T')[0],
              endDate: ''
       })

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setLoading(true)

              try {
                     const res = await createTournament({
                            name: formData.name,
                            startDate: new Date(formData.startDate),
                            endDate: formData.endDate ? new Date(formData.endDate) : undefined
                     })

                     if (res.success && res.tournament) {
                            toast.success('Torneo creado exitosamente')
                            router.push(`/torneos/${res.tournament.id}`)
                     } else {
                            toast.error('Error al crear torneo: ' + res.error)
                     }
              } catch (error) {
                     toast.error('Ocurrió un error inesperado')
              } finally {
                     setLoading(false)
              }
       }

       return (
              <div className="p-6 max-w-2xl mx-auto">
                     <Link href="/torneos" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                            <ArrowLeft size={16} />
                            Volver a Torneos
                     </Link>

                     <div className="bg-[#18181b] border border-white/10 rounded-2xl p-8 shadow-2xl">
                            <h1 className="text-2xl font-bold text-white mb-2">Nuevo Torneo</h1>
                            <p className="text-slate-400 mb-8">Configura los datos básicos para comenzar.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                   <div>
                                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre del Torneo</label>
                                          <input
                                                 required
                                                 type="text"
                                                 value={formData.name}
                                                 onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                 className="w-full bg-[#09090b] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-colors text-lg font-bold placeholder:text-slate-600"
                                                 placeholder="Ej. Torneo Apertura 2026"
                                          />
                                   </div>

                                   <div className="grid grid-cols-2 gap-6">
                                          <div>
                                                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fecha de Inicio</label>
                                                 <input
                                                        required
                                                        type="date"
                                                        value={formData.startDate}
                                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                                        className="w-full bg-[#09090b] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-colors"
                                                 />
                                          </div>
                                          <div>
                                                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fecha de Fin (Opcional)</label>
                                                 <input
                                                        type="date"
                                                        value={formData.endDate}
                                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                                        className="w-full bg-[#09090b] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary transition-colors"
                                                 />
                                          </div>
                                   </div>

                                   <div className="pt-6 border-t border-white/5 flex gap-4">
                                          <Link href="/torneos" className="flex-1 py-4 text-center text-slate-400 font-bold hover:text-white transition-colors">
                                                 Cancelar
                                          </Link>
                                          <button
                                                 type="submit"
                                                 disabled={loading}
                                                 className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                                          >
                                                 {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                                 Crear Torneo
                                          </button>
                                   </div>
                            </form>
                     </div>
              </div>
       )
}
