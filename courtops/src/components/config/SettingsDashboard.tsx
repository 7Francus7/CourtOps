'use client'

import React, { useState } from 'react'
import {
       updateClubSettings,
       upsertCourt,
       deleteCourt,
       upsertPriceRule,
       deletePriceRule,
       updateMyPassword,
       upsertProduct,
       deleteProduct
} from '@/actions/settings'
import { createTeamMember, deleteTeamMember } from '@/actions/team'
import ProductManagementModal from './ProductManagementModal'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type Props = {
       club: any
       auditLogs?: any[]
}

const DAYS_MAP = [
       { value: '1', label: 'Lun' },
       { value: '2', label: 'Mar' },
       { value: '3', label: 'Mié' },
       { value: '4', label: 'Jue' },
       { value: '5', label: 'Vie' },
       { value: '6', label: 'Sáb' },
       { value: '0', label: 'Dom' },
]

export default function SettingsDashboard({ club, auditLogs = [] }: Props) {
       const router = useRouter()
       const [activeTab, setActiveTab] = useState<'GENERAL' | 'CANCHAS' | 'PRECIOS' | 'INVENTARIO' | 'EQUIPO' | 'AUDITORIA' | 'CUENTA'>('GENERAL')
       const [isLoading, setIsLoading] = useState(false)

       // -- GENERAL STATE --
       const [generalForm, setGeneralForm] = useState({
              name: club.name || '',
              logoUrl: club.logoUrl || '',
              openTime: club.openTime || '14:00',
              closeTime: club.closeTime || '00:00',
              slotDuration: club.slotDuration || 90,
              cancelHours: club.cancelHours || 6,
              currency: club.currency || 'ARS'
       })

       // -- COURTS STATE --
       const [isCourtModalOpen, setIsCourtModalOpen] = useState(false)
       const [editingCourt, setEditingCourt] = useState<any | null>(null)

       // -- PRICE RULES STATE --
       const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
       const [editingRule, setEditingRule] = useState<any | null>(null)

       // -- PRODUCTS STATE --
       const [isProductModalOpen, setIsProductModalOpen] = useState(false)
       const [editingProduct, setEditingProduct] = useState<any | null>(null)

       // -- PASSWORD STATE --
       const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })

       // -- TEAM STATE --
       const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
       const [teamForm, setTeamForm] = useState({ name: '', email: '', password: '', role: 'USER' })

       // --- HANDLERS GENERAL ---
       async function saveGeneral() {
              setIsLoading(true)
              const payload = {
                     name: generalForm.name,
                     logoUrl: generalForm.logoUrl,
                     openTime: generalForm.openTime,
                     closeTime: generalForm.closeTime,
                     slotDuration: Number(generalForm.slotDuration),
                     cancelHours: Number(generalForm.cancelHours)
              }

              const res = await updateClubSettings(payload)
              router.refresh()
              setIsLoading(false)
              if (res.success) alert('Guardado!')
              else alert('Error: ' + (res.error || 'Error desconocido'))
       }

       // --- HANDLERS COURTS ---
       async function saveCourt(e: React.FormEvent) {
              e.preventDefault()
              const payload = {
                     id: editingCourt.id ? Number(editingCourt.id) : undefined,
                     name: editingCourt.name,
                     surface: editingCourt.surface || '',
                     isIndoor: Boolean(editingCourt.isIndoor)
              }

              await upsertCourt(payload)
              router.refresh()
              setIsCourtModalOpen(false)
       }

       async function removeCourt(id: number) {
              if (!confirm('Borrar cancha?')) return
              await deleteCourt(id)
              router.refresh()
       }

       // --- HANDLERS RULES ---
       function toggleDay(day: string) {
              if (!editingRule) return
              const currentDays = editingRule.daysOfWeek ? editingRule.daysOfWeek.split(',') : []
              if (currentDays.includes(day)) {
                     setEditingRule({ ...editingRule, daysOfWeek: currentDays.filter((d: string) => d !== day).join(',') })
              } else {
                     setEditingRule({ ...editingRule, daysOfWeek: [...currentDays, day].join(',') })
              }
       }

       async function saveRule(e: React.FormEvent) {
              e.preventDefault()
              const payload = {
                     id: editingRule.id ? Number(editingRule.id) : undefined,
                     name: editingRule.name || '',
                     startTime: editingRule.startTime,
                     endTime: editingRule.endTime,
                     price: Number(editingRule.price),
                     memberPrice: editingRule.memberPrice ? Number(editingRule.memberPrice) : null,
                     daysOfWeek: editingRule.daysOfWeek || '',
                     priority: Number(editingRule.priority || 0),
                     startDate: editingRule.startDate ? new Date(editingRule.startDate) : undefined,
                     endDate: editingRule.endDate ? new Date(editingRule.endDate) : undefined,
              }

              await upsertPriceRule(payload)
              router.refresh()
              setIsRuleModalOpen(false)
       }

       async function removeRule(id: number) {
              if (!confirm('Borrar regla?')) return
              await deletePriceRule(id)
              router.refresh()
       }

       // --- HANDLERS PRODUCTS ---
       async function saveProduct(productData: any) {
              setIsLoading(true)
              const payload = {
                     id: productData.id ? Number(productData.id) : undefined,
                     name: productData.name,
                     category: productData.category,
                     cost: Number(productData.cost || 0),
                     price: Number(productData.price || 0),
                     memberPrice: productData.memberPrice ? Number(productData.memberPrice) : null,
                     stock: Number(productData.stock || 0),
                     minStock: Number(productData.minStock || 5)
              }

              const res = await upsertProduct(payload)
              setIsLoading(false)
              if (res.success) {
                     setIsProductModalOpen(false)
                     router.refresh()
              } else {
                     alert("Error al guardar producto")
              }
       }

       async function removeProduct(id: number) {
              if (!confirm('¿Eliminar producto?')) return
              await deleteProduct(id)
              router.refresh()
       }

       // --- HANDLERS PASSWORD ---
       async function savePassword(e: React.FormEvent) {
              e.preventDefault()
              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                     alert('Las contraseñas no coinciden')
                     return
              }
              if (passwordForm.newPassword.length < 6) {
                     alert('La contraseña debe tener al menos 6 caracteres')
                     return
              }

              setIsLoading(true)
              const formData = new FormData()
              formData.append('newPassword', passwordForm.newPassword)

              const res = await updateMyPassword(formData)
              setIsLoading(false)

              if (res.success) {
                     alert('Contraseña actualizada correctamente')
                     setPasswordForm({ newPassword: '', confirmPassword: '' })
              } else {
                     alert('Error: ' + res.error)
              }
       }

       // --- HANDLERS TEAM ---
       async function saveTeam(e: React.FormEvent) {
              e.preventDefault()
              setIsLoading(true)
              const res = await createTeamMember(teamForm)
              setIsLoading(false)
              if (res.success) {
                     alert('Usuario creado correctamente')
                     setTeamForm({ name: '', email: '', password: '', role: 'USER' })
                     setIsTeamModalOpen(false)
                     router.refresh()
              } else {
                     alert('Error: ' + res.error)
              }
       }

       async function removeTeam(id: string) {
              if (!confirm('¿Eliminar usuario?')) return
              await deleteTeamMember(id)
              router.refresh()
       }

       return (
              <div className="flex flex-col h-full space-y-6">

                     <div className="flex gap-2 lg:gap-4 border-b border-white/5 pb-1 overflow-x-auto custom-scrollbar flex-nowrap shrink-0">
                            <TabButton active={activeTab === 'GENERAL'} onClick={() => setActiveTab('GENERAL')}>General</TabButton>
                            <TabButton active={activeTab === 'CANCHAS'} onClick={() => setActiveTab('CANCHAS')}>Canchas</TabButton>
                            <TabButton active={activeTab === 'PRECIOS'} onClick={() => setActiveTab('PRECIOS')}>Precios</TabButton>
                            <TabButton active={activeTab === 'INVENTARIO'} onClick={() => setActiveTab('INVENTARIO')}>Inventario</TabButton>
                            <TabButton active={activeTab === 'EQUIPO'} onClick={() => setActiveTab('EQUIPO')}>Equipo</TabButton>
                            <TabButton active={activeTab === 'AUDITORIA'} onClick={() => setActiveTab('AUDITORIA')}>Auditoría</TabButton>
                            <TabButton active={activeTab === 'CUENTA'} onClick={() => setActiveTab('CUENTA')}>Cuenta</TabButton>
                     </div>

                     <div className="flex-1 overflow-auto custom-scrollbar pb-10">

                            {/* --- GENERAL TAB --- */}
                            {activeTab === 'GENERAL' && (
                                   <div className="max-w-xl space-y-6 bg-bg-card p-6 rounded-2xl border border-white/5">
                                          <InputGroup label="Nombre del Club">
                                                 <input className="input-dark" value={generalForm.name} onChange={e => setGeneralForm({ ...generalForm, name: e.target.value })} />
                                          </InputGroup>

                                          <InputGroup label="Logo del Club (URL)">
                                                 <input
                                                        className="input-dark w-full"
                                                        value={generalForm.logoUrl || ''}
                                                        onChange={e => setGeneralForm({ ...generalForm, logoUrl: e.target.value })}
                                                        placeholder="https://ejemplo.com/logo.png"
                                                 />
                                          </InputGroup>

                                          <div className="grid grid-cols-2 gap-4">
                                                 <InputGroup label="Apertura (HH:mm)">
                                                        <input type="time" className="input-dark" value={generalForm.openTime} onChange={e => setGeneralForm({ ...generalForm, openTime: e.target.value ?? '14:00' })} />
                                                 </InputGroup>
                                                 <InputGroup label="Cierre (HH:mm)">
                                                        <input type="time" className="input-dark" value={generalForm.closeTime} onChange={e => setGeneralForm({ ...generalForm, closeTime: e.target.value ?? '00:00' })} />
                                                 </InputGroup>
                                          </div>

                                          <div className="pt-4">
                                                 <button onClick={saveGeneral} disabled={isLoading} className="btn-primary w-full">
                                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                                 </button>
                                          </div>
                                   </div>
                            )}

                            {/* --- CANCHAS TAB --- */}
                            {activeTab === 'CANCHAS' && (
                                   <div className="space-y-4">
                                          <div className="flex justify-end">
                                                 <button onClick={() => { setEditingCourt({}); setIsCourtModalOpen(true) }} className="btn-primary text-sm px-4 py-2">+ Nueva Cancha</button>
                                          </div>
                                          <div className="grid gap-3">
                                                 {club.courts.map((c: any) => (
                                                        <div key={c.id} className="flex items-center justify-between p-4 bg-bg-card rounded-xl border border-white/5">
                                                               <div>
                                                                      <h4 className="font-bold text-white">{c.name}</h4>
                                                                      <p className="text-xs text-text-grey">{c.surface} - {c.isIndoor ? 'Indoor' : 'Outdoor'}</p>
                                                               </div>
                                                               <div className="flex gap-2">
                                                                      <button onClick={() => { setEditingCourt(c); setIsCourtModalOpen(true) }} className="text-brand-blue font-bold text-sm">Editar</button>
                                                                      <button onClick={() => removeCourt(c.id)} className="text-red-500 font-bold text-sm">✕</button>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>
                            )}

                            {/* --- PRECIOS TAB --- */}
                            {activeTab === 'PRECIOS' && (
                                   <div className="space-y-4">
                                          <div className="flex justify-end">
                                                 <button onClick={() => {
                                                        setEditingRule({ name: 'Nueva Regla', price: 0, priority: 1, startTime: '14:00', endTime: '23:00', daysOfWeek: '1,2,3,4,5' });
                                                        setIsRuleModalOpen(true)
                                                 }} className="btn-primary text-sm px-4 py-2">+ Nueva Regla</button>
                                          </div>
                                          <div className="grid gap-3">
                                                 {club.priceRules.map((r: any) => (
                                                        <div key={r.id} className="p-4 bg-bg-card rounded-xl border border-white/5">
                                                               <div className="flex justify-between items-start">
                                                                      <div>
                                                                             <h4 className="font-bold text-white">{r.name}</h4>
                                                                             <div className="flex items-center gap-2 mt-1">
                                                                                    <span className="text-brand-green font-mono font-bold">${r.price}</span>
                                                                                    {r.memberPrice && <span className="text-brand-blue text-xs">(Socio: ${r.memberPrice})</span>}
                                                                             </div>
                                                                      </div>
                                                                      <div className="flex gap-2">
                                                                             <button onClick={() => { setEditingRule(r); setIsRuleModalOpen(true) }} className="text-brand-blue font-bold text-sm">Editar</button>
                                                                             <button onClick={() => removeRule(r.id)} className="text-red-500 font-bold text-sm">Eliminar</button>
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>
                            )}

                            {/* --- INVENTARIO TAB (NEW) --- */}
                            {activeTab === 'INVENTARIO' && (
                                   <div className="space-y-4">
                                          <div className="flex justify-between items-center bg-bg-card p-4 rounded-xl border border-white/5">
                                                 <p className="text-xs text-text-grey font-medium uppercase tracking-widest">Gestión de Stock y Precios de Kiosco</p>
                                                 <button
                                                        onClick={() => {
                                                               setEditingProduct({ name: '', category: 'Bebidas', cost: 0, price: 0, stock: 0, minStock: 5 });
                                                               setIsProductModalOpen(true)
                                                        }}
                                                        className="btn-primary text-xs px-4 py-2 uppercase font-black"
                                                 >
                                                        + Agregar Producto
                                                 </button>
                                          </div>

                                          <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                                                 <table className="w-full text-left">
                                                        <thead className="bg-white/5 text-[10px] text-white/30 font-black uppercase tracking-widest border-b border-white/5">
                                                               <tr>
                                                                      <th className="px-6 py-4">Producto</th>
                                                                      <th className="px-6 py-4">Categoría</th>
                                                                      <th className="px-6 py-4">Costo</th>
                                                                      <th className="px-6 py-4">Precio Venta</th>
                                                                      <th className="px-6 py-4">Precio Socio</th>
                                                                      <th className="px-6 py-4">Stock</th>
                                                                      <th className="px-6 py-4 text-right">Acciones</th>
                                                               </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5 text-sm">
                                                               {club.products?.map((p: any) => (
                                                                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                                                             <td className="px-6 py-4">
                                                                                    <div className="flex items-center gap-3">
                                                                                           <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-lg">{p.category.includes('Bebida') ? '🥤' : '🎾'}</div>
                                                                                           <span className="font-bold text-white">{p.name}</span>
                                                                                    </div>
                                                                             </td>
                                                                             <td className="px-6 py-4 text-xs text-zinc-500 uppercase tracking-widest">{p.category}</td>
                                                                             <td className="px-6 py-4 font-mono text-xs opacity-50 font-bold">${p.cost}</td>
                                                                             <td className="px-6 py-4 font-mono text-brand-green font-black">${p.price}</td>
                                                                             <td className="px-6 py-4 font-mono text-brand-blue font-bold">${p.memberPrice || '-'}</td>
                                                                             <td className="px-6 py-4">
                                                                                    <span className={cn(
                                                                                           "px-2 py-0.5 rounded-full text-[10px] font-black",
                                                                                           p.stock <= p.minStock ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-zinc-800 text-zinc-400"
                                                                                    )}>
                                                                                           {p.stock} UNID.
                                                                                    </span>
                                                                             </td>
                                                                             <td className="px-6 py-4 text-right">
                                                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                           <button
                                                                                                  onClick={() => { setEditingProduct(p); setIsProductModalOpen(true) }}
                                                                                                  className="text-white hover:text-brand-blue transition-colors font-bold text-xs"
                                                                                           >
                                                                                                  Editar
                                                                                           </button>
                                                                                           <button
                                                                                                  onClick={() => removeProduct(p.id)}
                                                                                                  className="text-red-500/50 hover:text-red-500 transition-colors font-bold text-xs"
                                                                                           >
                                                                                                  Eliminar
                                                                                           </button>
                                                                                    </div>
                                                                             </td>
                                                                      </tr>
                                                               ))}
                                                               {(!club.products || club.products.length === 0) && (
                                                                      <tr>
                                                                             <td colSpan={7} className="px-6 py-20 text-center text-white/10 italic text-sm">No hay productos registrados</td>
                                                                      </tr>
                                                               )}
                                                        </tbody>
                                                 </table>
                                          </div>
                                   </div>
                            )}

                            {/* --- EQUIPO TAB --- */}
                            {activeTab === 'EQUIPO' && (
                                   <div className="space-y-6">
                                          <div className="flex justify-between items-center bg-bg-card p-6 rounded-2xl border border-white/5">
                                                 <div>
                                                        <h3 className="text-sm font-bold text-white mb-1">Tu Equipo</h3>
                                                        <p className="text-xs text-text-grey">Usuarios con acceso al sistema.</p>
                                                 </div>
                                                 <button onClick={() => setIsTeamModalOpen(true)} className="btn-primary text-sm px-4 py-2">+ Nuevo Usuario</button>
                                          </div>
                                          <div className="grid gap-3">
                                                 {club.users?.map((u: any) => (
                                                        <div key={u.id} className="flex items-center justify-between p-4 bg-bg-card rounded-xl border border-white/5">
                                                               <div className="flex items-center gap-3">
                                                                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-white border border-white/5">{u.name.charAt(0)}</div>
                                                                      <div>
                                                                             <h4 className="font-bold text-white">{u.name}</h4>
                                                                             <p className="text-xs text-text-grey">{u.email}</p>
                                                                      </div>
                                                               </div>
                                                               {u.role !== 'SUPER_ADMIN' && (
                                                                      <button onClick={() => removeTeam(u.id)} className="text-red-500 font-bold text-sm">Eliminar</button>
                                                               )}
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>
                            )}

                            {/* --- AUDITORIA TAB --- */}
                            {activeTab === 'AUDITORIA' && (
                                   <div className="space-y-4">
                                          <div className="bg-bg-card rounded-2xl border border-white/5 overflow-hidden">
                                                 <div className="p-4 bg-white/5 text-xs text-white/30 font-black uppercase tracking-widest">Actividad Reciente</div>
                                                 <div className="overflow-x-auto">
                                                        <table className="w-full text-sm text-left">
                                                               <thead className="text-[10px] text-white/20 uppercase font-black border-b border-white/5">
                                                                      <tr>
                                                                             <th className="px-4 py-4">Fecha</th>
                                                                             <th className="px-4 py-4">Usuario</th>
                                                                             <th className="px-4 py-4">Acción</th>
                                                                             <th className="px-4 py-4">Detalles</th>
                                                                      </tr>
                                                               </thead>
                                                               <tbody className="divide-y divide-white/5">
                                                                      {auditLogs.map((log: any) => (
                                                                             <tr key={log.id} className="hover:bg-white/[0.01]">
                                                                                    <td className="px-4 py-3 text-xs opacity-50">{new Date(log.createdAt).toLocaleString()}</td>
                                                                                    <td className="px-4 py-3 font-bold text-white/80">{log.user?.name || 'Sistema'}</td>
                                                                                    <td className="px-4 py-3"><BadgeAction action={log.action} /></td>
                                                                                    <td className="px-4 py-3 text-xs opacity-40 font-mono italic max-w-xs truncate">{log.details}</td>
                                                                             </tr>
                                                                      ))}
                                                               </tbody>
                                                        </table>
                                                 </div>
                                          </div>
                                   </div>
                            )}

                            {/* --- CUENTA TAB --- */}
                            {activeTab === 'CUENTA' && (
                                   <div className="max-w-xl space-y-6 bg-bg-card p-6 rounded-2xl border border-white/5">
                                          <h3 className="text-xl font-bold text-white">Actualizar Contraseña</h3>
                                          <form onSubmit={savePassword} className="space-y-4 pt-4">
                                                 <InputGroup label="Nueva Contraseña">
                                                        <input type="password" className="input-dark w-full" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
                                                 </InputGroup>
                                                 <InputGroup label="Confirmar Contraseña">
                                                        <input type="password" className="input-dark w-full" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required minLength={6} />
                                                 </InputGroup>
                                                 <div className="pt-4">
                                                        <button type="submit" disabled={isLoading} className="btn-primary w-full bg-red-600 border-none">Actualizar Contraseña</button>
                                                 </div>
                                          </form>
                                   </div>
                            )}
                     </div>

                     {/* --- MODALS --- */}
                     {/* Product Modal */}
                     {/* Product Management Modal */}
                     {isProductModalOpen && (
                            <ProductManagementModal
                                   isOpen={isProductModalOpen}
                                   onClose={() => setIsProductModalOpen(false)}
                                   onSave={saveProduct}
                                   initialData={editingProduct}
                                   isLoading={isLoading}
                            />
                     )}

                     {/* Court Modal */}
                     {isCourtModalOpen && (
                            <Modal title="Editar Cancha" onClose={() => setIsCourtModalOpen(false)}>
                                   <form onSubmit={saveCourt} className="space-y-4">
                                          <InputGroup label="Nombre">
                                                 <input className="input-dark" value={editingCourt?.name || ''} onChange={e => setEditingCourt({ ...editingCourt, name: e.target.value })} required />
                                          </InputGroup>
                                          <div className="flex gap-2 justify-end pt-4">
                                                 <button type="button" onClick={() => setIsCourtModalOpen(false)} className="px-4 py-2">Cancelar</button>
                                                 <button type="submit" className="btn-primary px-6 py-2">Guardar</button>
                                          </div>
                                   </form>
                            </Modal>
                     )}

                     {/* Price Rule Modal */}
                     {isRuleModalOpen && (
                            <Modal title="Regla de Precio" onClose={() => setIsRuleModalOpen(false)}>
                                   <form onSubmit={saveRule} className="space-y-4">
                                          <InputGroup label="Nombre">
                                                 <input className="input-dark" value={editingRule?.name || ''} onChange={e => setEditingRule({ ...editingRule, name: e.target.value })} required />
                                          </InputGroup>
                                          <div className="grid grid-cols-2 gap-4">
                                                 <InputGroup label="Precio ($)">
                                                        <input type="number" className="input-dark" value={editingRule?.price || ''} onChange={e => setEditingRule({ ...editingRule, price: e.target.value })} required />
                                                 </InputGroup>
                                                 <InputGroup label="Precio Socio ($)">
                                                        <input type="number" className="input-dark" value={editingRule?.memberPrice || ''} onChange={e => setEditingRule({ ...editingRule, memberPrice: e.target.value })} placeholder="Opcional" />
                                                 </InputGroup>
                                          </div>
                                          <div className="flex gap-2 justify-end pt-4">
                                                 <button type="button" onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2">Cancelar</button>
                                                 <button type="submit" className="btn-primary px-6 py-2">Guardar</button>
                                          </div>
                                   </form>
                            </Modal>
                     )}

                     {/* Team Modal */}
                     {isTeamModalOpen && (
                            <Modal title="Nuevo Usuario" onClose={() => setIsTeamModalOpen(false)}>
                                   <form onSubmit={saveTeam} className="space-y-4">
                                          <InputGroup label="Nombre">
                                                 <input className="input-dark" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required />
                                          </InputGroup>
                                          <div className="flex gap-2 justify-end pt-4">
                                                 <button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-4 py-2">Cancelar</button>
                                                 <button type="submit" className="btn-primary px-6 py-2">Crear</button>
                                          </div>
                                   </form>
                            </Modal>
                     )}

              </div>
       )
}

// --- SUBCOMPONENTS ---

function TabButton({ children, active, onClick }: any) {
       return (
              <button
                     onClick={onClick}
                     className={cn(
                            "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap shrink-0 border-b-2",
                            active ? "text-brand-blue border-brand-blue bg-brand-blue/5" : "text-white/30 border-transparent hover:text-white"
                     )}
              >
                     {children}
              </button>
       )
}

function InputGroup({ label, children, className }: any) {
       return (
              <div className={cn("space-y-2", className)}>
                     <label className="text-[10px] text-white/40 uppercase font-black tracking-widest block ml-1">{label}</label>
                     {children}
              </div>
       )
}

function Modal({ title, children, onClose }: any) {
       return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                     <div className="bg-[#111418] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h3>
                                   <button onClick={onClose} className="text-white/20 hover:text-white transition-colors text-2xl">✕</button>
                            </div>
                            <div className="p-8">
                                   {children}
                            </div>
                     </div>
              </div>
       )
}

function BadgeAction({ action }: { action: string }) {
       const colors: Record<string, string> = {
              CREATE: 'bg-brand-green/10 text-brand-green',
              UPDATE: 'bg-brand-blue/10 text-brand-blue',
              DELETE: 'bg-red-500/10 text-red-500',
              LOGIN: 'bg-purple-500/10 text-purple-500',
       }
       return (
              <span className={cn(
                     "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                     colors[action] || "bg-white/10 text-white"
              )}>
                     {action}
              </span>
       )
}
