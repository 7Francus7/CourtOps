'use client'

import { useState } from 'react'
import { deleteClub, updateClub, updateClubAdminPassword, generateImpersonationToken, seedClubData, toggleClubFeature, cleanClubData, activateClubSubscription } from '@/actions/super-admin'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Flag, DatabaseZap, Edit, Key, LogIn, Trash2, Eraser, CreditCard } from 'lucide-react'

type Club = {
       id: string
       name: string
       slug: string
       platformPlan?: { name: string, price: number } | null
       subscriptionStatus: string
       nextBillingDate: Date | null
       _count: {
              courts: number
              users: number
              bookings: number
       }
       users: { email: string }[]
       hasKiosco: boolean
       hasOnlinePayments: boolean
       hasAdvancedReports: boolean
       hasCustomDomain: boolean
       hasTournaments: boolean
}

export default function ClubList({ clubs }: { clubs: Club[] }) {
       const [editingClubId, setEditingClubId] = useState<string | null>(null)
       const [editForm, setEditForm] = useState({ name: '', slug: '' })

       // Password Change State
       const [changePasswordId, setChangePasswordId] = useState<string | null>(null)
       const [passwordForm, setPasswordForm] = useState({ newPassword: '' })

       // Features State
       const [featuresClubId, setFeaturesClubId] = useState<string | null>(null)

       const [loadingId, setLoadingId] = useState<string | null>(null)
       const router = useRouter()

       async function handleClean(clubId: string) {
              if (!confirm("⚠️ PELIGRO: Esto borrará TODOS los datos operativos del club (Reservas, Clientes, Caja, Torneos).\\n\\n¿Estás seguro de que quieres limpiar este club para entregarlo desde 0?")) return
              if (!confirm("Confirmación doble: Esta acción NO se puede deshacer. ¿Proceder?")) return

              setLoadingId(clubId)
              const res = await cleanClubData(clubId)
              if (res.success) {
                     alert(res.message)
                     router.refresh()
              } else {
                     alert("Error: " + res.error)
              }
              setLoadingId(null)
       }

       async function handleImpersonate(clubId: string) {
              if (!confirm("¿Estás seguro de que quieres entrar como ADMIN de este club?")) return

              setLoadingId(clubId)
              const res = await generateImpersonationToken(clubId)

              if (res.success && res.token) {
                     await signIn('credentials', {
                            impersonateToken: res.token,
                            callbackUrl: '/dashboard'
                     })
              } else {
                     alert("Error al generar acceso: " + res.error)
                     setLoadingId(null)
              }
       }

       async function handleSeed(clubId: string) {
              if (!confirm("Esto creará clientes y reservas falsas. ¿Continuar?")) return
              setLoadingId(clubId)
              const res = await seedClubData(clubId)
              if (res.success) {
                     alert(res.message)
                     router.refresh()
              } else {
                     alert("Error: " + res.error)
              }
              setLoadingId(null)
       }

       async function handleToggleFeature(clubId: string, feature: string, currentValue: boolean) {
              const res = await toggleClubFeature(clubId, feature, !currentValue)
              if (!res.success) alert("Error al cambiar feature: " + res.error)
       }

       async function handleActivate(clubId: string) {
              const months = parseInt(prompt("¿Por cuántos meses activar la suscripción?", "1") || "0")
              if (months <= 0) return

              const planName = prompt("Nombre del Plan (Exacto como en DB):", "Plan Inicial") || "Plan Inicial"

              setLoadingId(clubId)
              const res = await activateClubSubscription(clubId, planName, months)

              if (res.success) {
                     alert(res.message)
                     router.refresh()
              } else {
                     alert("Error: " + res.error)
              }
              setLoadingId(null)
       }

       function handleEditClick(club: Club) {
              setEditingClubId(club.id)
              setEditForm({ name: club.name, slug: club.slug })
              setChangePasswordId(null)
              setFeaturesClubId(null)
       }

       function handlePasswordClick(club: Club) {
              setChangePasswordId(club.id)
              setPasswordForm({ newPassword: '' })
              setEditingClubId(null)
              setFeaturesClubId(null)
       }

       function handleFeaturesClick(club: Club) {
              setFeaturesClubId(featuresClubId === club.id ? null : club.id)
              setEditingClubId(null)
              setChangePasswordId(null)
       }

       async function handleSave(clubId: string) {
              setLoadingId(clubId)
              const formData = new FormData()
              formData.append('clubId', clubId)
              formData.append('name', editForm.name)
              formData.append('slug', editForm.slug)

              const res = await updateClub(formData)
              if (res.success) {
                     setEditingClubId(null)
                     router.refresh()
              } else {
                     alert('Error: ' + res.error)
              }
              setLoadingId(null)
       }

       async function handlePasswordSave(clubId: string) {
              setLoadingId(clubId)
              const formData = new FormData()
              formData.append('clubId', clubId)
              formData.append('newPassword', passwordForm.newPassword)

              const res = await updateClubAdminPassword(formData)
              if (res.success) {
                     setChangePasswordId(null)
                     alert('Contraseña actualizada con éxito')
                     router.refresh()
              } else {
                     alert('Error: ' + res.error)
              }
              setLoadingId(null)
       }

       async function handleDelete(clubId: string) {
              if (!confirm('¿Seguro que quieres eliminar este club? Se borrarán todas sus canchas, usuarios y reservas. ESTA ACCIÓN ES IRREVERSIBLE.')) return

              setLoadingId(clubId)
              const formData = new FormData()
              formData.append('clubId', clubId)

              const res = await deleteClub(formData)
              if (res.success) {
                     router.refresh()
              } else {
                     alert('Error: ' + res.error)
              }
              setLoadingId(null)
       }

       function getTypeColor(status: string) {
              switch (status) {
                     case 'authorized':
                     case 'ACTIVE':
                            return 'bg-green-500/10 text-green-500 border-green-500/20'
                     case 'pending':
                     case 'in_process':
                     case 'TRIAL':
                            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                     case 'cancelled':
                            return 'bg-red-500/10 text-red-500 border-red-500/20'
                     default:
                            return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
              }
       }

       return (
              <div className="grid gap-4">
                     {clubs.map(club => (
                            <div key={club.id} className="bg-white dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-all border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex flex-col gap-4 group shadow-sm hover:shadow-md">
                                   <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                                 {editingClubId === club.id ? (
                                                        <div className="space-y-3 p-3 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-100 dark:border-white/5">
                                                               <input
                                                                      className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500/50"
                                                                      value={editForm.name}
                                                                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                                      placeholder="Nombre del Club"
                                                               />
                                                               <input
                                                                      className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-500 dark:text-zinc-400 text-xs font-mono"
                                                                      value={editForm.slug}
                                                                      onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                                                                      placeholder="slug-url"
                                                               />
                                                               <div className="flex gap-2">
                                                                      <button onClick={() => handleSave(club.id)} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold">Guardar</button>
                                                                      <button onClick={() => setEditingClubId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-lg text-xs font-bold">Cerrar</button>
                                                               </div>
                                                        </div>
                                                 ) : changePasswordId === club.id ? (
                                                        <div className="space-y-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                                                               <h4 className="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest">Cambiar Clave: {club.name}</h4>
                                                               <input
                                                                      className="w-full bg-white dark:bg-black border border-red-500/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm"
                                                                      value={passwordForm.newPassword}
                                                                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                                      placeholder="Nueva contraseña"
                                                                      type="text"
                                                               />
                                                               <div className="flex gap-2">
                                                                      <button onClick={() => handlePasswordSave(club.id)} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-bold">Actualizar</button>
                                                                      <button onClick={() => setChangePasswordId(null)} className="flex-1 py-2 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-lg text-xs font-bold">Cerrar</button>
                                                               </div>
                                                        </div>
                                                 ) : (
                                                        <>
                                                               <div className="flex flex-col gap-1 mb-2">
                                                                      <div className="flex items-center gap-2">
                                                                             <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors tracking-tight">
                                                                                    {club.name}
                                                                             </h3>
                                                                             <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border tracking-widest ${getTypeColor(club.subscriptionStatus)}`}>
                                                                                    {club.subscriptionStatus === 'authorized' ? 'Suscrito' : club.subscriptionStatus}
                                                                             </span>
                                                                      </div>
                                                                      <div className="flex items-center gap-2 text-xs">
                                                                             <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                                                                                    Plan: <span className="text-slate-900 dark:text-white">{club.platformPlan?.name || 'CUSTOM'}</span>
                                                                             </span>
                                                                             {club.nextBillingDate && (
                                                                                    <>
                                                                                           <span className="text-slate-300 dark:text-zinc-800">•</span>
                                                                                           <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Vence: {new Date(club.nextBillingDate).toLocaleDateString()}</span>
                                                                                    </>
                                                                             )}
                                                                      </div>
                                                               </div>

                                                               <div className="text-[10px] text-slate-400 dark:text-zinc-600 font-mono mt-1 select-all flex items-center gap-2">
                                                                      <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/5">ID: {club.id}</span>
                                                                      <span className="text-emerald-500 font-bold">/{club.slug}</span>
                                                               </div>
                                                        </>
                                                 )}
                                          </div>

                                          <div className="flex flex-wrap items-center gap-1.5 md:opacity-20 group-hover:opacity-100 transition-opacity justify-end max-w-[200px]">
                                                 <button
                                                        onClick={() => handleFeaturesClick(club)}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${featuresClubId === club.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:text-emerald-500'}`}
                                                        title="Features"
                                                 >
                                                        <Flag size={14} />
                                                 </button>
                                                 <button
                                                        onClick={() => handleSeed(club.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-purple-500/10 hover:text-purple-500 transition-all font-bold"
                                                        title="Seed Demo"
                                                 >
                                                        <DatabaseZap size={14} />
                                                 </button>
                                                 <button
                                                        onClick={() => handleEditClick(club)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                                                        title="Editar"
                                                 >
                                                        <Edit size={14} />
                                                 </button>
                                                 <button
                                                        onClick={() => handlePasswordClick(club)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-amber-500/10 hover:text-amber-500 transition-all"
                                                        title="Admin Pass"
                                                 >
                                                        <Key size={14} />
                                                 </button>
                                                 <button
                                                        onClick={() => handleImpersonate(club.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                        title="Impersonar"
                                                 >
                                                        <LogIn size={14} />
                                                 </button>
                                                 <button
                                                        onClick={() => handleClean(club.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-orange-500/10 hover:text-orange-500 transition-all"
                                                        title="Reset"
                                                 >
                                                        <Eraser size={14} />
                                                 </button>
                                                 <button
                                                        onClick={() => handleActivate(club.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                                                        title="Activar"
                                                 >
                                                        <CreditCard size={14} />
                                                 </button>
                                                 <button
                                                        onClick={() => handleDelete(club.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-500 hover:bg-red-500/20 hover:text-red-500 transition-all"
                                                        title="Borrar"
                                                 >
                                                        <Trash2 size={14} />
                                                 </button>
                                          </div>
                                   </div>

                                   {featuresClubId === club.id && (
                                          <div className="bg-slate-50 dark:bg-black/30 border border-emerald-500/10 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                                 {[
                                                        { key: 'hasKiosco', label: 'Punto de Venta' },
                                                        { key: 'hasOnlinePayments', label: 'Pagos MP' },
                                                        { key: 'hasAdvancedReports', label: 'Reportes Pro' },
                                                        { key: 'hasTournaments', label: 'Torneos' },
                                                        { key: 'hasCustomDomain', label: 'Dominio Propio' },
                                                 ].map(f => (
                                                        <label key={f.key} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${club[f.key as keyof Club] ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                                                               <input
                                                                      type="checkbox"
                                                                      checked={!!club[f.key as keyof Club]}
                                                                      onChange={() => handleToggleFeature(club.id, f.key, !!club[f.key as keyof Club])}
                                                                      className="accent-emerald-500"
                                                               />
                                                               <span className="text-[10px] font-black uppercase tracking-wider">{f.label}</span>
                                                        </label>
                                                 ))}
                                          </div>
                                   )}

                                   {!editingClubId && !changePasswordId && !featuresClubId && (
                                          <div className="flex gap-8 text-[10px] text-slate-400 dark:text-zinc-500 border-t border-slate-100 dark:border-white/5 pt-4 font-black uppercase tracking-[0.15em]">
                                                 <div className="flex flex-col gap-0.5">
                                                        <span className="text-slate-900 dark:text-white text-base leading-none tracking-tight">{club._count.courts}</span>
                                                        <span>Canchas</span>
                                                 </div>
                                                 <div className="flex flex-col gap-0.5">
                                                        <span className="text-slate-900 dark:text-white text-base leading-none tracking-tight">{club._count.users}</span>
                                                        <span>Staff</span>
                                                 </div>
                                                 <div className="flex flex-col gap-0.5">
                                                        <span className="text-emerald-600 dark:text-emerald-500 text-base leading-none tracking-tight">{club._count.bookings.toLocaleString()}</span>
                                                        <span className="flex items-center gap-1">Reservas <div className="w-1 h-1 rounded-full bg-emerald-500"></div></span>
                                                 </div>
                                          </div>
                                   )}
                            </div>
                     ))}
              </div>
       )
}

