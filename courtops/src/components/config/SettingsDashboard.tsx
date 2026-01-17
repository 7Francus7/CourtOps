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
import { upsertEmployee, deleteEmployee, EmployeePermissions } from '@/actions/employees'
import ProductManagementModal from './ProductManagementModal'
import MembershipPlansConfig from './MembershipPlansConfig'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Store, UserCog } from 'lucide-react'

type Props = {
       club: any
       auditLogs?: any[]
       initialEmployees?: any[]
}

export default function SettingsDashboard({ club, auditLogs = [], initialEmployees = [] }: Props) {
       const router = useRouter()
       const [activeTab, setActiveTab] = useState<'GENERAL' | 'CANCHAS' | 'PRECIOS' | 'MEMBRESIAS' | 'INVENTARIO' | 'EQUIPO' | 'EMPLEADOS' | 'AUDITORIA' | 'CUENTA' | 'INTEGRACIONES'>('GENERAL')
       const [isLoading, setIsLoading] = useState(false)

       // -- GENERAL STATE --
       const [generalForm, setGeneralForm] = useState({
              name: club.name || '',
              logoUrl: club.logoUrl || '',
              openTime: club.openTime || '14:00',
              closeTime: club.closeTime || '00:00',
              slotDuration: club.slotDuration || 90,
              cancelHours: club.cancelHours || 6,
              currency: club.currency || 'ARS',
              themeColor: club.themeColor || '#0080ff'
       })

       // -- INTEGRATIONS STATE --
       const [mpForm, setMpForm] = useState({
              mpAccessToken: club.mpAccessToken || '',
              mpPublicKey: club.mpPublicKey || '',
              bookingDeposit: club.bookingDeposit || 0,
              mpAlias: club.mpAlias || '',
              mpCvu: club.mpCvu || ''
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

       // -- EMPLOYEES STATE --
       const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
       const [editingEmployee, setEditingEmployee] = useState<any | null>(null)
       const [employeeForm, setEmployeeForm] = useState<{ name: string, pin: string, permissions: EmployeePermissions }>({
              name: '',
              pin: '',
              permissions: {
                     canCreateBooking: true,
                     canDeleteBooking: false,
                     canViewReports: false,
                     canManageSettings: false,
                     canManageClients: true,
                     canManagePayments: true
              }
       })

       // --- HANDLERS GENERAL ---
       async function saveGeneral() {
              setIsLoading(true)
              const payload = {
                     name: generalForm.name,
                     logoUrl: generalForm.logoUrl,
                     openTime: generalForm.openTime,
                     closeTime: generalForm.closeTime,
                     slotDuration: Number(generalForm.slotDuration),
                     cancelHours: Number(generalForm.cancelHours),
                     themeColor: generalForm.themeColor
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

       // --- HANDLERS EMPLOYEES ---
       async function saveEmployee(e: React.FormEvent) {
              e.preventDefault()
              setIsLoading(true)
              const res = await upsertEmployee({
                     id: editingEmployee?.id,
                     name: employeeForm.name,
                     pin: employeeForm.pin,
                     permissions: employeeForm.permissions
              })
              setIsLoading(false)
              if (res.success) {
                     alert('Empleado guardado correctamente')
                     setIsEmployeeModalOpen(false)
                     router.refresh()
              } else {
                     alert('Error al guardar empleado')
              }
       }

       async function removeEmployee(id: string) {
              if (!confirm('¿Eliminar empleado?')) return
              await deleteEmployee(id)
              router.refresh()
       }

       function openEmployeeModal(employee: any = null) {
              if (employee) {
                     setEditingEmployee(employee)
                     setEmployeeForm({
                            name: employee.name,
                            pin: '', // Default empty for security, only update if entered
                            permissions: employee.permissions ? (typeof employee.permissions === 'string' ? JSON.parse(employee.permissions) : employee.permissions) : {
                                   canCreateBooking: true,
                                   canDeleteBooking: false,
                                   canViewReports: false,
                                   canManageSettings: false,
                                   canManageClients: true,
                                   canManagePayments: true
                            }
                     })
              } else {
                     setEditingEmployee(null)
                     setEmployeeForm({
                            name: '',
                            pin: '',
                            permissions: {
                                   canCreateBooking: true,
                                   canDeleteBooking: false,
                                   canViewReports: false,
                                   canManageSettings: false,
                                   canManageClients: true,
                                   canManagePayments: true
                            }
                     })
              }
              setIsEmployeeModalOpen(true)
       }

       // --- HANDLERS INTEGRATIONS ---
       async function saveIntegrations() {
              setIsLoading(true)
              const payload = {
                     mpAccessToken: mpForm.mpAccessToken,
                     mpPublicKey: mpForm.mpPublicKey,
                     bookingDeposit: Number(mpForm.bookingDeposit),
                     mpAlias: mpForm.mpAlias,
                     mpCvu: mpForm.mpCvu
              }

              const res = await updateClubSettings(payload)
              router.refresh()
              setIsLoading(false)
              if (res.success) alert('Configuración guardada!')
              else alert('Error: ' + (res.error || 'Error desconocido'))
       }

       return (
              <div className="flex flex-col h-full space-y-6">

                     <div className="flex gap-2 lg:gap-4 border-b border-white/5 pb-1 overflow-x-auto custom-scrollbar flex-nowrap shrink-0">
                            <TabButton active={activeTab === 'GENERAL'} onClick={() => setActiveTab('GENERAL')}>General</TabButton>
                            <TabButton active={activeTab === 'CANCHAS'} onClick={() => setActiveTab('CANCHAS')}>Canchas</TabButton>
                            <TabButton active={activeTab === 'PRECIOS'} onClick={() => setActiveTab('PRECIOS')}>Precios</TabButton>
                            <TabButton active={activeTab === 'MEMBRESIAS'} onClick={() => setActiveTab('MEMBRESIAS')}>Membresías</TabButton>
                            <TabButton active={activeTab === 'INVENTARIO'} onClick={() => setActiveTab('INVENTARIO')}>Inventario</TabButton>
                            <TabButton active={activeTab === 'EQUIPO'} onClick={() => setActiveTab('EQUIPO')}>Equipo</TabButton>
                            <TabButton active={activeTab === 'EMPLEADOS'} onClick={() => setActiveTab('EMPLEADOS')}>Empleados</TabButton>
                            <TabButton active={activeTab === 'AUDITORIA'} onClick={() => setActiveTab('AUDITORIA')}>Auditoría</TabButton>
                            <TabButton active={activeTab === 'CUENTA'} onClick={() => setActiveTab('CUENTA')}>Cuenta</TabButton>
                            <TabButton active={activeTab === 'INTEGRACIONES'} onClick={() => setActiveTab('INTEGRACIONES')}>Integraciones</TabButton>
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

                                          <InputGroup label="Color de Marca (Tema)">
                                                 <div className="flex gap-3 items-center">
                                                        <input
                                                               type="color"
                                                               className="h-10 w-20 rounded bg-transparent cursor-pointer border-none p-0"
                                                               value={generalForm.themeColor}
                                                               onChange={e => setGeneralForm({ ...generalForm, themeColor: e.target.value })}
                                                        />
                                                        <input
                                                               type="text"
                                                               className="input-dark w-24 text-center font-mono uppercase"
                                                               value={generalForm.themeColor}
                                                               onChange={e => setGeneralForm({ ...generalForm, themeColor: e.target.value })}
                                                               maxLength={7}
                                                        />
                                                        <div className="text-xs text-text-grey">
                                                               Este color se usará en botones, bordes y detalles importantes.
                                                        </div>
                                                 </div>
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

                            {/* --- MEMBRESIAS TAB (NEW) --- */}
                            {activeTab === 'MEMBRESIAS' && (
                                   <MembershipPlansConfig plans={club.membershipPlans || []} />
                            )}


                            {/* --- INVENTARIO TAB --- */}
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
                                                 <div className="overflow-x-auto">
                                                        <table className="w-full text-left min-w-[700px]">
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

                            {/* --- EMPLEADOS TAB --- */}
                            {activeTab === 'EMPLEADOS' && (
                                   <div className="space-y-6">
                                          <div className="flex justify-between items-center bg-bg-card p-6 rounded-2xl border border-white/5">
                                                 <div>
                                                        <h3 className="text-sm font-bold text-white mb-1">Empleados / Staff</h3>
                                                        <p className="text-xs text-text-grey">Perfiles con acceso restringido mediante PIN.</p>
                                                 </div>
                                                 <button onClick={() => openEmployeeModal()} className="btn-primary text-sm px-4 py-2">+ Nuevo Empleado</button>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                 {initialEmployees?.map((emp: any) => (
                                                        <div key={emp.id} className="p-5 bg-bg-card rounded-xl border border-white/5 flex flex-col justify-between group hover:border-brand-blue/30 transition-colors">
                                                               <div className="flex justify-between items-start mb-4">
                                                                      <div className="flex items-center gap-3">
                                                                             <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                                                                    <UserCog size={24} />
                                                                             </div>
                                                                             <div>
                                                                                    <h4 className="font-bold text-white">{emp.name}</h4>
                                                                                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">PIN: ****</p>
                                                                             </div>
                                                                      </div>
                                                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                             <button onClick={() => openEmployeeModal(emp)} className="text-brand-blue hover:text-white transition-colors text-xs font-bold uppercase">Editar</button>
                                                                      </div>
                                                               </div>
                                                               <div className="pt-4 border-t border-white/5">
                                                                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Permisos</p>
                                                                      <div className="flex flex-wrap gap-1.5">
                                                                             {(() => {
                                                                                    const perms = typeof emp.permissions === 'string' ? JSON.parse(emp.permissions) : emp.permissions;
                                                                                    return Object.entries(perms).map(([key, value]) => {
                                                                                           if (!value) return null;
                                                                                           return (
                                                                                                  <span key={key} className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-zinc-400 font-bold uppercase">
                                                                                                         {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                                                                                                  </span>
                                                                                           )
                                                                                    });
                                                                             })()}
                                                                      </div>
                                                               </div>
                                                               <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                                                      <button onClick={() => removeEmployee(emp.id)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase">Eliminar</button>
                                                               </div>
                                                        </div>
                                                 ))}

                                                 {!initialEmployees?.length && (
                                                        <div className="col-span-full py-12 text-center text-zinc-500 text-sm italic">
                                                               No tienes empleados registrados.
                                                        </div>
                                                 )}
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
                            {/* --- INTEGRACIONES TAB --- */}
                            {activeTab === 'INTEGRACIONES' && (
                                   <div className="max-w-xl space-y-6 bg-bg-card p-6 rounded-2xl border border-white/5">
                                          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 mb-6">
                                                 <h4 className="flex items-center gap-2 text-blue-500 font-bold text-sm mb-1">
                                                        <Store size={16} /> Mercado Pago
                                                 </h4>
                                                 <p className="text-xs text-blue-400/80">
                                                        Configura tus credenciales de producción para cobrar señas o el total de la reserva de forma automática.
                                                 </p>
                                          </div>

                                          <InputGroup label="Access Token (Producción)">
                                                 <input
                                                        className="input-dark w-full font-mono text-xs"
                                                        value={mpForm.mpAccessToken}
                                                        onChange={e => setMpForm({ ...mpForm, mpAccessToken: e.target.value })}
                                                        placeholder="APP_USR-..."
                                                 />
                                          </InputGroup>

                                          <InputGroup label="Public Key (Opcional)">
                                                 <input
                                                        className="input-dark w-full font-mono text-xs"
                                                        value={mpForm.mpPublicKey}
                                                        onChange={e => setMpForm({ ...mpForm, mpPublicKey: e.target.value })}
                                                        placeholder="APP_USR-..."
                                                 />
                                          </InputGroup>

                                          <div className="border-t border-white/5 my-4 pt-4"></div>

                                          <InputGroup label="Valor de Seña por Turno ($)">
                                                 <div className="text-xs text-gray-500 mb-1">Si es 0, se cobrará el total de la reserva. Si es mayor a 0, solo se cobrará este monto fijo.</div>
                                                 <input
                                                        type="number"
                                                        className="input-dark text-lg font-bold text-brand-green"
                                                        value={mpForm.bookingDeposit}
                                                        onChange={e => setMpForm({ ...mpForm, bookingDeposit: Number(e.target.value) })}
                                                 />
                                          </InputGroup>

                                          <div className="border-t border-white/5 my-4 pt-4"></div>

                                          <h4 className="text-sm font-bold text-white mb-4">Datos para Transferencia Manual</h4>
                                          <InputGroup label="Alias">
                                                 <input className="input-dark w-full" value={mpForm.mpAlias} onChange={e => setMpForm({ ...mpForm, mpAlias: e.target.value })} />
                                          </InputGroup>
                                          <InputGroup label="CVU">
                                                 <input className="input-dark w-full" value={mpForm.mpCvu} onChange={e => setMpForm({ ...mpForm, mpCvu: e.target.value })} />
                                          </InputGroup>

                                          <div className="pt-4">
                                                 <button onClick={saveIntegrations} disabled={isLoading} className="btn-primary w-full">
                                                        {isLoading ? 'Guardando...' : 'Guardar Integración'}
                                                 </button>
                                          </div>
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

                     {/* Employee Modal */}
                     {isEmployeeModalOpen && (
                            <Modal title={editingEmployee ? "Editar Empleado" : "Nuevo Empleado"} onClose={() => setIsEmployeeModalOpen(false)}>
                                   <form onSubmit={saveEmployee} className="space-y-4">
                                          <InputGroup label="Nombre">
                                                 <input
                                                        className="input-dark w-full"
                                                        value={employeeForm.name}
                                                        onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                                                        required
                                                        placeholder="Ej: Juan Pérez"
                                                 />
                                          </InputGroup>
                                          <InputGroup label="PIN de Acceso (4-6 dígitos)">
                                                 <input
                                                        type="password"
                                                        inputMode="numeric"
                                                        className="input-dark w-full tracking-widest text-center text-lg font-bold"
                                                        value={employeeForm.pin}
                                                        onChange={e => setEmployeeForm({ ...employeeForm, pin: e.target.value })}
                                                        placeholder={editingEmployee ? "****** (Dejar vacío para mantener)" : "1234"}
                                                        required={!editingEmployee}
                                                        minLength={4}
                                                        maxLength={8}
                                                 />
                                          </InputGroup>

                                          <div className="pt-2">
                                                 <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 ml-1">Permisos</p>
                                                 <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                               { key: 'canCreateBooking', label: 'Crear Turnos' },
                                                               { key: 'canDeleteBooking', label: 'Borrar Turnos' },
                                                               { key: 'canManagePayments', label: 'Cobrar / Caja' },
                                                               { key: 'canManageClients', label: 'Gestión Clientes' },
                                                               { key: 'canViewReports', label: 'Ver Reportes' },
                                                               { key: 'canManageSettings', label: 'Configuración' },
                                                        ].map(({ key, label }) => (
                                                               <label key={key} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                                                      <input
                                                                             type="checkbox"
                                                                             className="w-4 h-4 rounded border-gray-600 bg-black/50 text-brand-blue focus:ring-brand-blue"
                                                                             checked={(employeeForm.permissions as any)[key]}
                                                                             onChange={e => setEmployeeForm({
                                                                                    ...employeeForm,
                                                                                    permissions: { ...employeeForm.permissions, [key]: e.target.checked }
                                                                             })}
                                                                      />
                                                                      <span className="text-xs font-bold text-zinc-300 select-none">{label}</span>
                                                               </label>
                                                        ))}
                                                 </div>
                                          </div>

                                          <div className="flex gap-2 justify-end pt-4 mt-6 border-t border-white/5">
                                                 <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors">Cancelar</button>
                                                 <button type="submit" className="btn-primary px-6 py-2">Guardar</button>
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
