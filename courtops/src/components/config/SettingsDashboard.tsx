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
import { Store, UserCog, X, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

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
              themeColor: club.themeColor || '#0080ff',
              allowCredit: club.allowCredit ?? true
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
                     themeColor: generalForm.themeColor,
                     allowCredit: generalForm.allowCredit
              }

              const res = await updateClubSettings(payload)
              setIsLoading(false)

              if (res.success) {
                     toast.success('Configuración guardada')
                     router.refresh()
              } else {
                     toast.error('Error: ' + (res.error || 'Error desconocido'))
              }
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

              const res = await upsertCourt(payload)
              if (res.success) {
                     toast.success('Cancha guardada')
                     router.refresh()
                     setIsCourtModalOpen(false)
              } else {
                     toast.error('Error: ' + res.error)
              }
       }

       async function removeCourt(id: number) {
              if (!confirm('¿Borrar cancha?')) return
              const res = await deleteCourt(id)
              if (res.success) {
                     toast.success('Cancha eliminada')
                     router.refresh()
              } else {
                     toast.error('Error: ' + res.error)
              }
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

              const res = await upsertPriceRule(payload)
              if (res.success) {
                     toast.success('Regla guardada')
                     router.refresh()
                     setIsRuleModalOpen(false)
              } else {
                     toast.error('Error: ' + res.error)
              }
       }

       async function removeRule(id: number) {
              if (!confirm('¿Borrar regla?')) return
              const res = await deletePriceRule(id)
              if (res.success) {
                     toast.success('Regla eliminada')
                     router.refresh()
              } else {
                     toast.error('Error: ' + res.error)
              }
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
                     toast.success('Producto guardado')
                     setIsProductModalOpen(false)
                     router.refresh()
              } else {
                     toast.error('Error al guardar producto: ' + res.error)
              }
       }

       async function removeProduct(id: number) {
              if (!confirm('¿Eliminar producto?')) return
              const res = await deleteProduct(id)
              if (res.success) {
                     toast.success('Producto eliminado')
                     router.refresh()
              } else {
                     toast.error('Error: ' + res.error)
              }
       }

       // --- HANDLERS PASSWORD ---
       async function savePassword(e: React.FormEvent) {
              e.preventDefault()
              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                     toast.error('Las contraseñas no coinciden')
                     return
              }
              if (passwordForm.newPassword.length < 6) {
                     toast.error('La contraseña debe tener al menos 6 caracteres')
                     return
              }

              setIsLoading(true)
              const formData = new FormData()
              formData.append('newPassword', passwordForm.newPassword)

              const res = await updateMyPassword(formData)
              setIsLoading(false)

              if (res.success) {
                     toast.success('Contraseña actualizada correctamente')
                     setPasswordForm({ newPassword: '', confirmPassword: '' })
              } else {
                     toast.error('Error: ' + res.error)
              }
       }

       // --- HANDLERS TEAM ---
       async function saveTeam(e: React.FormEvent) {
              e.preventDefault()
              setIsLoading(true)
              const res = await createTeamMember(teamForm)
              setIsLoading(false)
              if (res.success) {
                     toast.success('Usuario creado correctamente')
                     setTeamForm({ name: '', email: '', password: '', role: 'USER' })
                     setIsTeamModalOpen(false)
                     router.refresh()
              } else {
                     toast.error('Error: ' + res.error)
              }
       }

       async function removeTeam(id: string) {
              if (!confirm('¿Eliminar usuario?')) return
              const res = await deleteTeamMember(id)
              if (res.success) {
                     router.refresh()
                     toast.success('Usuario eliminado')
              } else {
                     toast.error('Error: ' + res.error)
              }
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
                     toast.success('Empleado guardado correctamente')
                     setIsEmployeeModalOpen(false)
                     router.refresh()
              } else {
                     toast.error('Error al guardar empleado: ' + res.error)
              }
       }

       async function removeEmployee(id: string) {
              if (!confirm('¿Eliminar empleado?')) return
              const res = await deleteEmployee(id)
              if (res.success) {
                     toast.success('Empleado eliminado')
                     router.refresh()
              } else {
                     toast.error('Error: ' + res.error)
              }
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
              setIsLoading(false)
              if (res.success) toast.success('Configuración guardada!')
              else toast.error('Error: ' + (res.error || 'Error desconocido'))
       }

       return (
              <div className="flex flex-col h-full space-y-6">

                     <div className="flex gap-2 lg:gap-4 border-b border-border pb-1 overflow-x-auto custom-scrollbar flex-nowrap shrink-0">
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
                                   <div className="max-w-2xl space-y-8 bg-card p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
                                          {/* Accent Decor */}
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                          <div className="space-y-1">
                                                 <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Información Básica</h3>
                                                 <p className="text-xs text-muted-foreground font-medium">Configura la identidad y horarios base de tu club.</p>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                                 <div className="md:col-span-2 space-y-6">
                                                        <InputGroup label="Nombre del Club">
                                                               <input className="input-theme" value={generalForm.name} onChange={e => setGeneralForm({ ...generalForm, name: e.target.value })} />
                                                        </InputGroup>

                                                        <InputGroup label="Logo del Club (URL)">
                                                               <input
                                                                      className="input-theme w-full"
                                                                      value={generalForm.logoUrl || ''}
                                                                      onChange={e => setGeneralForm({ ...generalForm, logoUrl: e.target.value })}
                                                                      placeholder="https://ejemplo.com/logo.png"
                                                               />
                                                        </InputGroup>
                                                 </div>

                                                 <InputGroup label="Color de Marca (Tema)" className="md:col-span-2">
                                                        <div className="flex gap-4 items-center bg-muted/30 p-4 rounded-2xl border border-border">
                                                               <div className="relative group">
                                                                      <input
                                                                             type="color"
                                                                             className="h-12 w-12 rounded-xl bg-transparent cursor-pointer border-2 border-border p-0 overflow-hidden"
                                                                             value={generalForm.themeColor}
                                                                             onChange={e => setGeneralForm({ ...generalForm, themeColor: e.target.value })}
                                                                      />
                                                                      <div className="absolute inset-0 rounded-xl pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]" />
                                                               </div>
                                                               <div className="flex flex-col">
                                                                      <input
                                                                             type="text"
                                                                             className="bg-transparent border-none p-0 text-foreground font-bold uppercase text-sm focus:ring-0 w-24"
                                                                             value={generalForm.themeColor}
                                                                             onChange={e => setGeneralForm({ ...generalForm, themeColor: e.target.value })}
                                                                             maxLength={7}
                                                                      />
                                                                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Hexadecimal</span>
                                                               </div>
                                                               <div className="h-8 w-px bg-border mx-2" />
                                                               <div className="text-[10px] text-muted-foreground font-medium max-w-[200px] leading-relaxed">
                                                                      Este color se aplicará en botones, estados y detalles visuales de tu club.
                                                               </div>
                                                        </div>
                                                 </InputGroup>

                                                 <div className="grid grid-cols-2 gap-4">
                                                        <InputGroup label="Apertura (HH:mm)">
                                                               <input type="time" className="input-theme" value={generalForm.openTime} onChange={e => setGeneralForm({ ...generalForm, openTime: e.target.value ?? '14:00' })} />
                                                        </InputGroup>
                                                        <InputGroup label="Cierre (HH:mm)">
                                                               <input type="time" className="input-theme" value={generalForm.closeTime} onChange={e => setGeneralForm({ ...generalForm, closeTime: e.target.value ?? '00:00' })} />
                                                        </InputGroup>
                                                 </div>

                                                 <div className="md:col-span-2 pt-2">
                                                        <label className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors">
                                                               <input
                                                                      type="checkbox"
                                                                      className="w-5 h-5 rounded border-input bg-card text-primary focus:ring-primary"
                                                                      checked={generalForm.allowCredit}
                                                                      onChange={e => setGeneralForm({ ...generalForm, allowCredit: e.target.checked })}
                                                               />
                                                               <div>
                                                                      <span className="block text-sm font-bold text-foreground mb-0.5">Permitir Cuentas Corrientes</span>
                                                                      <span className="block text-[10px] text-muted-foreground font-medium">Si activas esto, podrás cobrar con "A cuenta" y gestionar saldos.</span>
                                                               </div>
                                                        </label>
                                                 </div>

                                                 <div className="md:col-span-2 pt-6 border-t border-border">
                                                        <button onClick={saveGeneral} disabled={isLoading} className="btn-primary w-full h-12">
                                                               {isLoading ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN GENERAL'}
                                                        </button>
                                                 </div>
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
                                                        <div key={c.id} className="flex items-center justify-between p-5 bg-card rounded-2xl border border-border hover:border-emerald-500/30 transition-all group shadow-sm hover:shadow-md">
                                                               <div>
                                                                      <h4 className="font-black text-foreground uppercase tracking-tight">{c.name}</h4>
                                                                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{c.surface} — {c.isIndoor ? 'Indoor' : 'Outdoor'}</p>
                                                               </div>
                                                               <div className="flex gap-4">
                                                                      <button onClick={() => { setEditingCourt(c); setIsCourtModalOpen(true) }} className="text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:brightness-125 transition-all"><Edit size={14} /></button>
                                                                      <button onClick={() => removeCourt(c.id)} className="text-red-500/40 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-all">✕</button>
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
                                                        <div key={r.id} className="p-6 bg-card rounded-2xl border border-border hover:border-emerald-500/20 transition-all group shadow-sm hover:shadow-md">
                                                               <div className="flex justify-between items-start">
                                                                      <div>
                                                                             <h4 className="font-black text-foreground uppercase tracking-tight">{r.name}</h4>
                                                                             <div className="flex items-center gap-3 mt-2">
                                                                                    <span className="text-emerald-500 font-black text-lg">${r.price}</span>
                                                                                    {r.memberPrice && (
                                                                                           <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md">
                                                                                                  Socio: ${r.memberPrice}
                                                                                           </span>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                                      <div className="flex gap-4">
                                                                             <button onClick={() => { setEditingRule(r); setIsRuleModalOpen(true) }} className="text-primary font-black text-[10px] uppercase tracking-widest hover:brightness-125"><Edit size={14} /></button>
                                                                             <button onClick={() => removeRule(r.id)} className="text-red-500/40 hover:text-red-500 font-black text-[10px] uppercase tracking-widest"><Trash2 size={14} /></button>
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
                                          <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
                                                 <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Gestión de Stock y Precios de Kiosco</p>
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

                                          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
                                                 <div className="overflow-x-auto">
                                                        <table className="w-full text-left min-w-[700px]">
                                                               <thead className="bg-muted text-[10px] text-muted-foreground font-black uppercase tracking-widest border-b border-border">
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
                                                               <tbody className="divide-y divide-border text-sm">
                                                                      {club.products?.map((p: any) => (
                                                                             <tr key={p.id} className="hover:bg-muted/50 transition-colors group">
                                                                                    <td className="px-6 py-4">
                                                                                           <div className="flex items-center gap-3">
                                                                                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg">{p.category.includes('Bebida') ? '🥤' : '🎾'}</div>
                                                                                                  <span className="font-bold text-foreground">{p.name}</span>
                                                                                           </div>
                                                                                    </td>
                                                                                    <td className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-widest">{p.category}</td>
                                                                                    <td className="px-6 py-4 text-xs opacity-50 font-bold text-foreground">${p.cost}</td>
                                                                                    <td className="px-6 py-4 text-emerald-500 font-black">${p.price}</td>
                                                                                    <td className="px-6 py-4 text-primary font-bold">${p.memberPrice || '-'}</td>
                                                                                    <td className="px-6 py-4">
                                                                                           <span className={cn(
                                                                                                  "px-2 py-0.5 rounded-full text-[10px] font-black",
                                                                                                  p.stock <= p.minStock ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-muted text-muted-foreground"
                                                                                           )}>
                                                                                                  {p.stock} UNID.
                                                                                           </span>
                                                                                    </td>
                                                                                    <td className="px-6 py-4 text-right">
                                                                                           <div className="flex justify-end gap-2">
                                                                                                  <button
                                                                                                         onClick={() => { setEditingProduct(p); setIsProductModalOpen(true) }}
                                                                                                         className="text-foreground hover:text-primary transition-colors font-bold text-xs"
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
                                                                                    <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground/30 italic text-sm">No hay productos registrados</td>
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
                                          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border">
                                                 <div>
                                                        <h3 className="text-sm font-bold text-foreground mb-1">Tu Equipo</h3>
                                                        <p className="text-xs text-muted-foreground">Usuarios con acceso al sistema.</p>
                                                 </div>
                                                 <button onClick={() => setIsTeamModalOpen(true)} className="btn-primary text-sm px-4 py-2">+ Nuevo Usuario</button>
                                          </div>
                                          <div className="grid gap-3">
                                                 {club.users?.map((u: any) => (
                                                        <div key={u.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                                                               <div className="flex items-center gap-3">
                                                                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-foreground border border-border">{u.name.charAt(0)}</div>
                                                                      <div>
                                                                             <h4 className="font-bold text-foreground">{u.name}</h4>
                                                                             <p className="text-xs text-muted-foreground">{u.email}</p>
                                                                      </div>
                                                               </div>
                                                               {u.role !== 'SUPER_ADMIN' && (
                                                                      <button onClick={() => removeTeam(u.id)} className="text-red-500 font-bold text-sm"><Trash2 size={14} /></button>
                                                               )}
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>
                            )}

                            {/* --- EMPLEADOS TAB --- */}
                            {activeTab === 'EMPLEADOS' && (
                                   <div className="space-y-6">
                                          <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border">
                                                 <div>
                                                        <h3 className="text-sm font-bold text-foreground mb-1">Empleados / Staff</h3>
                                                        <p className="text-xs text-muted-foreground">Perfiles con acceso restringido mediante PIN.</p>
                                                 </div>
                                                 <button onClick={() => openEmployeeModal()} className="btn-primary text-sm px-4 py-2">+ Nuevo Empleado</button>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                 {initialEmployees?.map((emp: any) => (
                                                        <div key={emp.id} className="p-6 bg-card rounded-2xl border border-border flex flex-col justify-between group hover:border-emerald-500/30 transition-all shadow-md">
                                                               <div className="flex justify-between items-start mb-6">
                                                                      <div className="flex items-center gap-4">
                                                                             <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                                                                    <UserCog size={28} />
                                                                             </div>
                                                                             <div>
                                                                                    <h4 className="font-black text-foreground uppercase tracking-tight">{emp.name}</h4>
                                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">PIN: ****</p>
                                                                             </div>
                                                                      </div>
                                                                      <div className="">
                                                                             <button onClick={() => openEmployeeModal(emp)} className="text-emerald-500 hover:brightness-125 transition-colors text-[10px] font-black uppercase tracking-widest"><Edit size={14} /></button>
                                                                      </div>
                                                               </div>
                                                               <div className="pt-6 border-t border-border">
                                                                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 ml-1">Permisos</p>
                                                                      <div className="flex flex-wrap gap-2">
                                                                             {(() => {
                                                                                    const perms = typeof emp.permissions === 'string' ? JSON.parse(emp.permissions) : emp.permissions;
                                                                                    return Object.entries(perms).map(([key, value]) => {
                                                                                           if (!value) return null;
                                                                                           return (
                                                                                                  <span key={key} className="px-3 py-1 rounded-lg bg-muted text-[9px] text-muted-foreground font-black uppercase tracking-widest border border-border">
                                                                                                         {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                                                                                                  </span>
                                                                                           )
                                                                                    });
                                                                             })()}
                                                                      </div>
                                                               </div>
                                                               <div className="mt-6 pt-4 border-t border-border flex justify-end">
                                                                      <button onClick={() => removeEmployee(emp.id)} className="text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"><Trash2 size={14} /></button>
                                                               </div>
                                                        </div>
                                                 ))}

                                                 {!initialEmployees?.length && (
                                                        <div className="col-span-full py-12 text-center text-muted-foreground text-sm italic">
                                                               No tienes empleados registrados.
                                                        </div>
                                                 )}
                                          </div>
                                   </div>
                            )}

                            {/* --- AUDITORIA TAB --- */}
                            {activeTab === 'AUDITORIA' && (
                                   <div className="space-y-4">
                                          <div className="bg-card rounded-2xl border border-border overflow-hidden">
                                                 <div className="p-4 bg-muted text-xs text-muted-foreground font-black uppercase tracking-widest">Actividad Reciente</div>
                                                 <div className="overflow-x-auto">
                                                        <table className="w-full text-sm text-left">
                                                               <thead className="text-[10px] text-muted-foreground uppercase font-black border-b border-border">
                                                                      <tr>
                                                                             <th className="px-4 py-4">Fecha</th>
                                                                             <th className="px-4 py-4">Usuario</th>
                                                                             <th className="px-4 py-4">Acción</th>
                                                                             <th className="px-4 py-4">Detalles</th>
                                                                      </tr>
                                                               </thead>
                                                               <tbody className="divide-y divide-border">
                                                                      {auditLogs.map((log: any) => (
                                                                             <tr key={log.id} className="hover:bg-muted/50">
                                                                                    <td className="px-4 py-3 text-xs opacity-50">{new Date(log.createdAt).toLocaleString()}</td>
                                                                                    <td className="px-4 py-3 font-bold text-foreground">{log.user?.name || 'Sistema'}</td>
                                                                                    <td className="px-4 py-3"><BadgeAction action={log.action} /></td>
                                                                                    <td className="px-4 py-3 text-xs opacity-40 italic max-w-xs truncate">{log.details}</td>
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
                                   <div className="max-w-xl space-y-6 bg-card p-6 rounded-2xl border border-border">
                                          <h3 className="text-xl font-bold text-foreground">Actualizar Contraseña</h3>
                                          <form onSubmit={savePassword} className="space-y-4 pt-4">
                                                 <InputGroup label="Nueva Contraseña">
                                                        <input type="password" className="input-theme w-full" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
                                                 </InputGroup>
                                                 <InputGroup label="Confirmar Contraseña">
                                                        <input type="password" className="input-theme w-full" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required minLength={6} />
                                                 </InputGroup>
                                                 <div className="pt-4">
                                                        <button type="submit" disabled={isLoading} className="btn-primary w-full bg-red-600 border-none hover:bg-red-700">Actualizar Contraseña</button>
                                                 </div>
                                          </form>
                                   </div>
                            )}
                            {/* --- INTEGRACIONES TAB --- */}
                            {activeTab === 'INTEGRACIONES' && (
                                   <div className="max-w-2xl space-y-8 bg-card p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 mb-8 relative">
                                                 <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                                               <Store size={20} />
                                                        </div>
                                                        <h4 className="text-sm font-black text-foreground uppercase tracking-wider">
                                                               Mercado Pago
                                                        </h4>
                                                 </div>
                                                 <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                                                        Configura tus credenciales de producción para automatizar cobros de señas y saldos.
                                                 </p>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                 <InputGroup label="Access Token (Producción)" className="md:col-span-2">
                                                        <input
                                                               type="password"
                                                               className="input-theme text-xs tracking-tighter"
                                                               value={mpForm.mpAccessToken}
                                                               onChange={e => setMpForm({ ...mpForm, mpAccessToken: e.target.value })}
                                                               placeholder="APP_USR-..."
                                                        />
                                                 </InputGroup>

                                                 <InputGroup label="Public Key (Opcional)" className="md:col-span-2">
                                                        <input
                                                               className="input-theme text-xs tracking-tighter"
                                                               value={mpForm.mpPublicKey}
                                                               onChange={e => setMpForm({ ...mpForm, mpPublicKey: e.target.value })}
                                                               placeholder="APP_USR-..."
                                                        />
                                                 </InputGroup>

                                                 <div className="md:col-span-2 py-2 border-y border-border my-2">
                                                        <InputGroup label="Valor de Seña por Turno ($)">
                                                               <input
                                                                      type="number"
                                                                      className="input-theme text-lg font-black text-emerald-500 text-center max-w-[200px]"
                                                                      value={mpForm.bookingDeposit}
                                                                      onChange={e => setMpForm({ ...mpForm, bookingDeposit: Number(e.target.value) })}
                                                               />
                                                               <p className="text-[10px] text-muted-foreground mt-2 font-medium">Si es 0, se cobrará el total. Si es mayor, se cobrará una seña fija.</p>
                                                        </InputGroup>
                                                 </div>

                                                 <div className="md:col-span-2 space-y-4">
                                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Transferencia Directa</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                               <InputGroup label="Alias">
                                                                      <input className="input-theme" value={mpForm.mpAlias} onChange={e => setMpForm({ ...mpForm, mpAlias: e.target.value })} placeholder="mi.club.padel" />
                                                               </InputGroup>
                                                               <InputGroup label="CVU">
                                                                      <input className="input-theme" value={mpForm.mpCvu} onChange={e => setMpForm({ ...mpForm, mpCvu: e.target.value })} placeholder="000000..." />
                                                               </InputGroup>
                                                        </div>
                                                 </div>

                                                 <div className="md:col-span-2 pt-6">
                                                        <button onClick={saveIntegrations} disabled={isLoading} className="btn-primary w-full h-12">
                                                               {isLoading ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN DE PAGO'}
                                                        </button>
                                                 </div>
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
                                                 <input className="input-theme" value={editingCourt?.name || ''} onChange={e => setEditingCourt({ ...editingCourt, name: e.target.value })} required />
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
                                          <InputGroup label="Nombre de la Regla">
                                                 <input
                                                        className="input-theme w-full"
                                                        value={editingRule?.name || ''}
                                                        onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                                                        placeholder="Ej: Horario Central"
                                                        required
                                                 />
                                          </InputGroup>

                                          <div className="grid grid-cols-2 gap-4">
                                                 <InputGroup label="Hora Inicio">
                                                        <input
                                                               type="time"
                                                               className="input-theme w-full"
                                                               value={editingRule?.startTime || '00:00'}
                                                               onChange={e => setEditingRule({ ...editingRule, startTime: e.target.value })}
                                                               required
                                                        />
                                                 </InputGroup>
                                                 <InputGroup label="Hora Fin">
                                                        <input
                                                               type="time"
                                                               className="input-theme w-full"
                                                               value={editingRule?.endTime || '23:59'}
                                                               onChange={e => setEditingRule({ ...editingRule, endTime: e.target.value })}
                                                               required
                                                        />
                                                 </InputGroup>
                                          </div>

                                          <InputGroup label="Días de Aplicación">
                                                 <div className="flex justify-between gap-1 p-1 bg-muted rounded-xl border border-border">
                                                        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => {
                                                               const dayStr = i.toString() // 0=Sun, 1=Mon...
                                                               const isSelected = (editingRule?.daysOfWeek || '').split(',').includes(dayStr)
                                                               return (
                                                                      <button
                                                                             key={i}
                                                                             type="button"
                                                                             onClick={() => {
                                                                                    const current = editingRule?.daysOfWeek ? editingRule.daysOfWeek.split(',') : []
                                                                                    let next
                                                                                    if (current.includes(dayStr)) {
                                                                                           next = current.filter((d: string) => d !== dayStr)
                                                                                    } else {
                                                                                           next = [...current, dayStr]
                                                                                    }
                                                                                    setEditingRule({ ...editingRule, daysOfWeek: next.join(',') })
                                                                             }}
                                                                             className={cn(
                                                                                    "w-10 h-10 rounded-lg text-xs font-black transition-all flex items-center justify-center",
                                                                                    isSelected
                                                                                           ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105"
                                                                                           : "text-muted-foreground hover:bg-white/10 hover:text-white"
                                                                             )}
                                                                      >
                                                                             {day}
                                                                      </button>
                                                               )
                                                        })}
                                                 </div>
                                          </InputGroup>

                                          <div className="pt-2 border-t border-border"></div>

                                          <div className="grid grid-cols-2 gap-4">
                                                 <InputGroup label="Precio ($)">
                                                        <input
                                                               type="number"
                                                               className="input-theme text-lg font-bold text-emerald-500"
                                                               value={editingRule?.price || ''}
                                                               onChange={e => setEditingRule({ ...editingRule, price: e.target.value })}
                                                               required
                                                        />
                                                 </InputGroup>
                                                 <InputGroup label="Precio Socio ($)">
                                                        <input
                                                               type="number"
                                                               className="input-theme text-lg font-bold text-primary"
                                                               value={editingRule?.memberPrice || ''}
                                                               onChange={e => setEditingRule({ ...editingRule, memberPrice: e.target.value })}
                                                               placeholder="Opcional"
                                                        />
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
                                                 <input className="input-theme" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required />
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
                                                        className="input-theme w-full"
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
                                                        className="input-theme w-full tracking-widest text-center text-lg font-bold"
                                                        value={employeeForm.pin}
                                                        onChange={e => setEmployeeForm({ ...employeeForm, pin: e.target.value })}
                                                        placeholder={editingEmployee ? "****** (Dejar vacío para mantener)" : "1234"}
                                                        required={!editingEmployee}
                                                        minLength={4}
                                                        maxLength={8}
                                                 />
                                          </InputGroup>

                                          <div className="pt-2">
                                                 <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-3 ml-1">Permisos</p>
                                                 <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                               { key: 'canCreateBooking', label: 'Crear Turnos' },
                                                               { key: 'canDeleteBooking', label: 'Borrar Turnos' },
                                                               { key: 'canManagePayments', label: 'Cobrar / Caja' },
                                                               { key: 'canManageClients', label: 'Gestión Clientes' },
                                                               { key: 'canViewReports', label: 'Ver Reportes' },
                                                               { key: 'canManageSettings', label: 'Configuración' },
                                                        ].map(({ key, label }) => (
                                                               <label key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border cursor-pointer hover:bg-white/10 transition-colors">
                                                                      <input
                                                                             type="checkbox"
                                                                             className="w-4 h-4 rounded border-gray-600 bg-black/50 text-primary focus:ring-brand-blue"
                                                                             checked={(employeeForm.permissions as any)[key]}
                                                                             onChange={e => setEmployeeForm({
                                                                                    ...employeeForm,
                                                                                    permissions: { ...employeeForm.permissions, [key]: e.target.checked }
                                                                             })}
                                                                      />
                                                                      <span className="text-xs font-bold text-foreground select-none">{label}</span>
                                                               </label>
                                                        ))}
                                                 </div>
                                          </div>

                                          <div className="flex gap-2 justify-end pt-4 mt-6 border-t border-border">
                                                 <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors">Cancelar</button>
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
                            "px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap shrink-0 border-b-2",
                            active
                                   ? "text-primary border-primary bg-primary/5 shadow-[inset_0_-10px_20px_-10px_rgba(var(--primary-rgb),0.1)]"
                                   : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                     )}
              >
                     {children}
              </button>
       )
}

function InputGroup({ label, children, className }: any) {
       return (
              <div className={cn("space-y-2", className)}>
                     <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block ml-1">{label}</label>
                     {children}
              </div>
       )
}

function Modal({ title, children, onClose }: any) {
       return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                     <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                                   <h3 className="text-sm font-black text-foreground uppercase tracking-[0.1em]">{title}</h3>
                                   <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-all p-2 hover:bg-muted/50 rounded-lg active:scale-90">
                                          <X size={20} />
                                   </button>
                            </div>
                            <div className="p-8 font-inter">
                                   {children}
                            </div>
                     </div>
              </div>
       )
}

function BadgeAction({ action }: { action: string }) {
       const colors: Record<string, string> = {
              CREATE: 'bg-emerald-500/10 text-emerald-500',
              UPDATE: 'bg-primary/10 text-primary',
              DELETE: 'bg-red-500/10 text-red-500',
              LOGIN: 'bg-purple-500/10 text-purple-500',
       }
       return (
              <span className={cn(
                     "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                     colors[action] || "bg-muted text-foreground"
              )}>
                     {action}
              </span>
       )
}
