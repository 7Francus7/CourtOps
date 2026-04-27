'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
import { upsertEmployee, deleteEmployee } from '@/actions/employees'
import { useConfirmation } from '@/components/providers/ConfirmationProvider'
import type { EmployeePermissions } from '@/types/employee'
import ProductManagementModal from './ProductManagementModal'
import MembershipPlansConfig from './MembershipPlansConfig'
import IntegrationsTab from './IntegrationsTab'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Store, UserCog, X, Edit, Trash2, PackagePlus, ChevronDown, CreditCard, Banknote, QrCode, Smartphone, Lock, Check, ExternalLink, GraduationCap, User, CalendarDays, Settings, Building2, Tag, Users, Warehouse, Shield, FileText, CreditCard as CardIcon, Plug, Copy } from 'lucide-react'
import { restockProduct } from '@/actions/kiosco'
import { toast } from 'sonner'
import WaiversTab from './WaiversTab'

const TAB_NAMES = ['GENERAL', 'PERFIL PÚBLICO', 'CANCHAS', 'PRECIOS', 'MEMBRESIAS', 'ACADEMIA', 'INVENTARIO', 'EQUIPO', 'EMPLEADOS', 'LEGAL', 'AUDITORIA', 'CUENTA', 'INTEGRACIONES'] as const
type TabName = typeof TAB_NAMES[number]

type Props = {
       club: any
       auditLogs?: any[]
       initialEmployees?: any[]
}

export default function SettingsDashboard({ club, auditLogs = [], initialEmployees = [] }: Props) {
       const router = useRouter()
       const searchParams = useSearchParams()
       const confirm = useConfirmation()

       // --- URL-persisted tabs (#17) ---
       const tabParam = searchParams.get('tab')
       const activeTab: TabName = tabParam && (TAB_NAMES as readonly string[]).includes(tabParam) ? (tabParam as TabName) : 'GENERAL'

       const setActiveTab = useCallback((tab: TabName) => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('tab', tab)
              router.replace(`?${params.toString()}`, { scroll: false })
       }, [searchParams, router])

       // --- Unsaved changes detection (#18) ---
       const [isDirty, setIsDirty] = useState(false)

       useEffect(() => {
              if (!isDirty) return
              const handler = (e: BeforeUnloadEvent) => {
                     e.preventDefault()
              }
              window.addEventListener('beforeunload', handler)
              return () => window.removeEventListener('beforeunload', handler)
       }, [isDirty])

       // --- Tab overflow scroll state (#20) ---
       const tabsContainerRef = useRef<HTMLDivElement>(null)
       const [canScrollRight, setCanScrollRight] = useState(false)

       const checkScroll = useCallback(() => {
              const el = tabsContainerRef.current
              if (!el) return
              setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 4)
       }, [])

       useEffect(() => {
              checkScroll()
              const el = tabsContainerRef.current
              if (!el) return
              el.addEventListener('scroll', checkScroll, { passive: true })
              window.addEventListener('resize', checkScroll)
              return () => {
                     el.removeEventListener('scroll', checkScroll)
                     window.removeEventListener('resize', checkScroll)
              }
       }, [checkScroll])

       const [isLoading, setIsLoading] = useState(false)
       const [publicLinkCopied, setPublicLinkCopied] = useState(false)

       // Helper to mark forms as dirty on any change
       const markDirty = useCallback(() => setIsDirty(true), [])

       const getPublicBookingUrl = useCallback(() => {
              const path = `/p/${club.slug}`
              if (typeof window === 'undefined') return path
              return `${window.location.origin}${path}`
       }, [club.slug])

       const copyPublicBookingUrl = useCallback(async () => {
              try {
                     await navigator.clipboard.writeText(getPublicBookingUrl())
                     setPublicLinkCopied(true)
                     setTimeout(() => setPublicLinkCopied(false), 2000)
                     toast.success('Link público copiado')
              } catch {
                     toast.error('No se pudo copiar el link')
              }
       }, [getPublicBookingUrl])

       const openPublicBookingUrl = useCallback(() => {
              window.open(getPublicBookingUrl(), '_blank', 'noopener,noreferrer')
       }, [getPublicBookingUrl])

       // -- GENERAL STATE --
       const [generalForm, setGeneralFormRaw] = useState({
              name: club.name || '',
              logoUrl: club.logoUrl || '',
              coverUrl: club.coverUrl || '',
              description: club.description || '',
              amenities: club.amenities || '',
              phone: club.phone || '',
              openTime: club.openTime || '14:00',
              closeTime: club.closeTime || '00:00',
              slotDuration: 90,
              cancelHours: club.cancelHours || 6,
              currency: club.currency || 'ARS',
              themeColor: club.themeColor || '#0080ff',
              allowCredit: club.allowCredit ?? true,
              address: club.address || '',
              socialInstagram: club.socialInstagram || '',
              socialFacebook: club.socialFacebook || '',
              socialTwitter: club.socialTwitter || '',
              socialTiktok: club.socialTiktok || ''
       })

       const setGeneralForm = useCallback((v: typeof generalForm | ((prev: typeof generalForm) => typeof generalForm)) => {
              markDirty()
              setGeneralFormRaw(v as any)
       }, [markDirty])

       // -- INTEGRATIONS STATE --
       const [mpForm, setMpFormRaw] = useState({
              mpAccessToken: club.mpAccessToken || '',
              mpPublicKey: club.mpPublicKey || '',
              bookingDeposit: club.bookingDeposit || 0,
              mpAlias: club.mpAlias || '',
              mpCvu: club.mpCvu || ''
       })

       const setMpForm = useCallback((v: typeof mpForm | ((prev: typeof mpForm) => typeof mpForm)) => {
              markDirty()
              setMpFormRaw(v as any)
       }, [markDirty])

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
       const [passwordForm, setPasswordFormRaw] = useState({ newPassword: '', confirmPassword: '' })
       const setPasswordForm = useCallback((v: typeof passwordForm | ((prev: typeof passwordForm) => typeof passwordForm)) => {
              markDirty()
              setPasswordFormRaw(v as any)
       }, [markDirty])

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
                     coverUrl: generalForm.coverUrl,
                     description: generalForm.description,
                     amenities: generalForm.amenities,
                     phone: generalForm.phone,
                     openTime: generalForm.openTime,
                     closeTime: generalForm.closeTime,
                     slotDuration: 90,
                     cancelHours: Number(generalForm.cancelHours),
                     themeColor: generalForm.themeColor,
                     allowCredit: generalForm.allowCredit,
                     address: generalForm.address,
                     socialInstagram: generalForm.socialInstagram,
                     socialFacebook: generalForm.socialFacebook,
                     socialTwitter: generalForm.socialTwitter,
                     socialTiktok: generalForm.socialTiktok
              }

              const res = await updateClubSettings(payload)
              setIsLoading(false)

              if (res.success) {
                     setIsDirty(false)
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
                     isIndoor: Boolean(editingCourt.isIndoor),
                     sport: 'PADEL',
                     duration: 90
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
              if (!await confirm({ title: '¿Borrar cancha?', description: 'Se eliminará la cancha y toda su configuración.', variant: 'destructive', confirmLabel: 'Eliminar' })) return
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
                     courtId: editingRule.courtId ? Number(editingRule.courtId) : null,
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
              if (!await confirm({ title: '¿Borrar regla de precio?', description: 'Se eliminará esta regla de precio.', variant: 'destructive', confirmLabel: 'Eliminar' })) return
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
                     minStock: Number(productData.minStock || 5),
                     imageUrl: productData.imageUrl || null
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
              if (!await confirm({ title: '¿Eliminar producto?', description: 'Se eliminará este producto del inventario.', variant: 'destructive', confirmLabel: 'Eliminar' })) return
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
              const res = await updateMyPassword(passwordForm.newPassword)
              setIsLoading(false)

              if (res.success) {
                     setIsDirty(false)
                     toast.success('Contraseña actualizada correctamente')
                     setPasswordFormRaw({ newPassword: '', confirmPassword: '' })
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
              if (!await confirm({ title: '¿Eliminar usuario?', description: 'Se revocará el acceso de este usuario al club.', variant: 'destructive', confirmLabel: 'Eliminar' })) return
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
              if (!await confirm({ title: '¿Eliminar empleado?', description: 'El empleado perderá acceso al sistema.', variant: 'destructive', confirmLabel: 'Eliminar' })) return
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
              const payload: Record<string, unknown> = {
                     bookingDeposit: Number(mpForm.bookingDeposit),
              }

              payload.mpAccessToken = mpForm.mpAccessToken
              payload.mpPublicKey = mpForm.mpPublicKey
              payload.mpAlias = mpForm.mpAlias
              payload.mpCvu = mpForm.mpCvu

              const res = await updateClubSettings(payload as any)
              setIsLoading(false)
              if (res.success) {
                     setIsDirty(false)
                     toast.success('Configuración guardada!')
              } else {
                     toast.error('Error: ' + (res.error || 'Error desconocido'))
              }
       }

       return (
              <div className="flex flex-col h-full space-y-6">

                     {/* Tab bar with horizontal scroll for mobile (#20) */}
                     <div className="relative shrink-0">
                            <div
                                   ref={tabsContainerRef}
                                   className="flex gap-2 lg:gap-4 border-b border-border pb-1 overflow-x-auto flex-nowrap snap-x snap-mandatory settings-tabs-scroll"
                            >
                                   <TabButton active={activeTab === 'GENERAL'} onClick={() => setActiveTab('GENERAL')} icon={Settings}>General</TabButton>
                                   <TabButton active={activeTab === 'PERFIL PÚBLICO'} onClick={() => setActiveTab('PERFIL PÚBLICO')} icon={Store}>Perfil Público</TabButton>
                                   <TabButton active={activeTab === 'CANCHAS'} onClick={() => setActiveTab('CANCHAS')} icon={Building2}>Canchas</TabButton>
                                   <TabButton active={activeTab === 'PRECIOS'} onClick={() => setActiveTab('PRECIOS')} icon={Tag}>Precios</TabButton>
                                   <TabButton active={activeTab === 'MEMBRESIAS'} onClick={() => setActiveTab('MEMBRESIAS')} icon={CardIcon}>Membresías</TabButton>
                                   <TabButton active={activeTab === 'ACADEMIA'} onClick={() => setActiveTab('ACADEMIA')} icon={GraduationCap}>Academia</TabButton>
                                   <TabButton active={activeTab === 'INVENTARIO'} onClick={() => setActiveTab('INVENTARIO')} icon={Warehouse}>Inventario</TabButton>
                                   <TabButton active={activeTab === 'EQUIPO'} onClick={() => setActiveTab('EQUIPO')} icon={Users}>Equipo</TabButton>
                                   <TabButton active={activeTab === 'EMPLEADOS'} onClick={() => setActiveTab('EMPLEADOS')} icon={UserCog}>Empleados</TabButton>
                                   <TabButton active={activeTab === 'LEGAL'} onClick={() => setActiveTab('LEGAL')} icon={Shield}>Legal</TabButton>
                                   <TabButton active={activeTab === 'AUDITORIA'} onClick={() => setActiveTab('AUDITORIA')} icon={FileText}>Auditoría</TabButton>
                                   <TabButton active={activeTab === 'CUENTA'} onClick={() => setActiveTab('CUENTA')} icon={User}>Cuenta</TabButton>
                                   <TabButton active={activeTab === 'INTEGRACIONES'} onClick={() => setActiveTab('INTEGRACIONES')} icon={Plug}>Integraciones</TabButton>
                            </div>
                            {/* Right-edge gradient fade to indicate more tabs */}
                            {canScrollRight && (
                                   <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-background to-transparent" />
                            )}
                     </div>

                     <div className="flex-1 overflow-auto custom-scrollbar pb-10">
                            {/* --- GENERAL TAB --- */}
                            {activeTab === 'GENERAL' && (
                                   <div className="max-w-2xl space-y-6 sm:space-y-8 bg-card/40 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-border/50 shadow-2xl relative overflow-hidden">
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
                                                               {generalForm.logoUrl && (
                                                                      <div className="mt-3 flex items-center gap-3">
                                                                             <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center overflow-hidden border-2 border-border shadow-sm flex-shrink-0">
                                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                                    <img
                                                                                           src={generalForm.logoUrl}
                                                                                           alt="Preview"
                                                                                           className="w-full h-full object-cover"
                                                                                           onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
                                                                                           onLoad={e => { (e.target as HTMLImageElement).style.display = ''; (e.target as HTMLImageElement).nextElementSibling?.classList.add('hidden') }}
                                                                                    />
                                                                                    <span className="text-xl font-black text-primary-foreground italic hidden">{generalForm.name?.charAt(0) || 'C'}</span>
                                                                             </div>
                                                                             <p className="text-[10px] text-muted-foreground font-medium">Debe ser un enlace directo a la imagen (termina en .png, .jpg, .svg, etc.)</p>
                                                                      </div>
                                                               )}
                                                        </InputGroup>

                                                        <InputGroup label="Teléfono de Contacto">
                                                               <input
                                                                      className="input-theme w-full"
                                                                      value={generalForm.phone || ''}
                                                                      onChange={e => setGeneralForm({ ...generalForm, phone: e.target.value })}
                                                                      placeholder="+54 9 11 1234 5678"
                                                               />
                                                        </InputGroup>

                                                        <InputGroup label="Dirección del Club">
                                                               <input
                                                                      className="input-theme w-full"
                                                                      value={generalForm.address || ''}
                                                                      onChange={e => setGeneralForm({ ...generalForm, address: e.target.value })}
                                                                      placeholder="Av. Corrientes 1234, Buenos Aires"
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

                                                 <div className="grid grid-cols-3 gap-4">
                                                        <InputGroup label="Apertura (HH:mm)">
                                                               <input type="time" className="input-theme" value={generalForm.openTime} onChange={e => setGeneralForm({ ...generalForm, openTime: e.target.value ?? '14:00' })} />
                                                        </InputGroup>
                                                        <InputGroup label="Cierre (HH:mm)">
                                                               <input type="time" className="input-theme" value={generalForm.closeTime} onChange={e => setGeneralForm({ ...generalForm, closeTime: e.target.value ?? '00:00' })} />
                                                        </InputGroup>
                                                        <InputGroup label="Hs. cancelación">
                                                               <input type="number" className="input-theme" min={0} max={72} value={generalForm.cancelHours} onChange={e => setGeneralForm({ ...generalForm, cancelHours: Number(e.target.value) })} />
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

                                                 <div className="md:col-span-2 pt-6 border-t border-border space-y-2">
                                                        {isDirty && (
                                                               <p className="text-xs text-amber-500 font-bold text-center flex items-center justify-center gap-2">
                                                                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                                                                      Cambios sin guardar
                                                               </p>
                                                        )}
                                                        <button onClick={saveGeneral} disabled={isLoading} className="btn-primary w-full h-12">
                                                               {isLoading ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN GENERAL'}
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            )}

                             {/* --- PERFIL PÚBLICO TAB --- */}
                             {activeTab === 'PERFIL PÚBLICO' && (
                                    <div className="max-w-3xl space-y-8 bg-card/40 backdrop-blur-xl p-8 rounded-3xl border border-border/50 shadow-2xl relative overflow-hidden">
                                           <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                                           
                                            <div className="space-y-1">
                                                   <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Presencia de Marca</h3>
                                                   <p className="text-sm text-muted-foreground font-medium">Configura como los clientes verán tu club en la página de reservas.</p>
                                            </div>

                                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                                                   <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                          <div className="min-w-0">
                                                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Link público</p>
                                                                 <p className="mt-1 truncate text-sm font-bold text-foreground">/p/{club.slug}</p>
                                                                 <p className="mt-1 text-[11px] font-medium text-muted-foreground">Usá este enlace para Instagram, WhatsApp o la web del club.</p>
                                                          </div>
                                                          <div className="flex shrink-0 gap-2">
                                                                 <button
                                                                        type="button"
                                                                        onClick={copyPublicBookingUrl}
                                                                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-[11px] font-black uppercase tracking-wider text-foreground transition-colors hover:border-primary/40"
                                                                 >
                                                                        <Copy size={14} />
                                                                        {publicLinkCopied ? 'Copiado' : 'Copiar'}
                                                                 </button>
                                                                 <button
                                                                        type="button"
                                                                        onClick={openPublicBookingUrl}
                                                                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-3 text-[11px] font-black uppercase tracking-wider text-primary-foreground transition-transform active:scale-95"
                                                                 >
                                                                        <ExternalLink size={14} />
                                                                        Ver
                                                                 </button>
                                                          </div>
                                                   </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 pt-4">
                                                  <InputGroup label="Biografía / Descripción del Club">
                                                         <textarea 
                                                                className="input-theme min-h-[120px] py-4 leading-relaxed font-medium" 
                                                                value={generalForm.description} 
                                                                onChange={e => setGeneralForm({ ...generalForm, description: e.target.value })}
                                                                placeholder="Contale a tus clientes sobre el club, la calidad de las canchas, servicios, etc."
                                                         />
                                                  </InputGroup>

                                                  <InputGroup label="Imagen de Portada (Hero URL)">
                                                         <input
                                                                className="input-theme w-full"
                                                                value={generalForm.coverUrl || ''}
                                                                onChange={e => setGeneralForm({ ...generalForm, coverUrl: e.target.value })}
                                                                placeholder="https://ejemplo.com/hero-padel.jpg"
                                                         />
                                                         {generalForm.coverUrl && (
                                                                <div className="mt-4 rounded-2xl overflow-hidden border-2 border-border shadow-xl aspect-video max-h-[180px] group relative">
                                                                       <img src={generalForm.coverUrl} alt="Cover Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                                       <p className="absolute bottom-3 left-3 text-[10px] font-black text-white uppercase tracking-widest shadow-sm">Vista Previa Portada</p>
                                                                </div>
                                                         )}
                                                  </InputGroup>

                                                  <InputGroup label="Comodidades (Separadas por coma)">
                                                         <input
                                                                className="input-theme w-full"
                                                                value={generalForm.amenities || ''}
                                                                onChange={e => setGeneralForm({ ...generalForm, amenities: e.target.value })}
                                                                placeholder="Bar, Wi-Fi, Estacionamiento, Vestuarios, Duchas, Pro Shop"
                                                         />
                                                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-2 px-1">
                                                                Tips: Bar, Wi-Fi, Estacionamiento, Pro Shop, Vestuarios, Buffet
                                                         </p>
                                                  </InputGroup>

                                                  <div className="bg-muted/30 p-6 rounded-[2rem] border border-border/50 space-y-6">
                                                         <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em] mb-4">Redes Sociales</h4>
                                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                                                                              <Smartphone size={12} className="text-pink-500" /> Instagram User
                                                                       </label>
                                                                       <input
                                                                              className="input-theme w-full"
                                                                              value={generalForm.socialInstagram || ''}
                                                                              onChange={e => setGeneralForm({ ...generalForm, socialInstagram: e.target.value })}
                                                                              placeholder="@club.padel"
                                                                       />
                                                                </div>
                                                                <div className="space-y-2">
                                                                       <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 px-1">
                                                                              <Smartphone size={12} className="text-blue-500" /> Facebook Page
                                                                       </label>
                                                                       <input
                                                                              className="input-theme w-full"
                                                                              value={generalForm.socialFacebook || ''}
                                                                              onChange={e => setGeneralForm({ ...generalForm, socialFacebook: e.target.value })}
                                                                              placeholder="clubpadelOficial"
                                                                       />
                                                                </div>
                                                         </div>
                                                  </div>
                                           </div>

                                           <div className="pt-6 border-t border-border mt-8 flex flex-col gap-3">
                                                  {isDirty && (
                                                         <p className="text-xs text-amber-500 font-black text-center animate-pulse uppercase tracking-[0.1em]">Cambios detectados - Recordá guardar</p>
                                                  )}
                                                  <button onClick={saveGeneral} disabled={isLoading} className="btn-primary w-full h-14 bg-primary text-white font-black text-sm tracking-widest shadow-2xl shadow-primary/30">
                                                         {isLoading ? 'SINCRONIZANDO...' : 'ACTUALIZAR PERFIL PÚBLICO'}
                                                  </button>
                                           </div>
                                    </div>
                             )}

                            {/* --- CANCHAS TAB --- */}
                            {activeTab === 'CANCHAS' && (
                                   <div className="space-y-4">
                                          <div className="flex justify-end">
                                                <button onClick={() => { setEditingCourt({ sport: 'PADEL', duration: 90 }); setIsCourtModalOpen(true) }} className="btn-primary text-sm px-4 py-2">+ Nueva Cancha</button>
                                          </div>
                                          <div className="grid gap-3">
                                                 {club.courts.map((c: any) => (
                                                        <div key={c.id} className="flex items-center justify-between p-5 bg-card/40 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-emerald-500/30 transition-all group shadow-sm hover:shadow-md">
                                                               <div>
                                                                      <h4 className="font-black text-foreground uppercase tracking-tight">{c.name}</h4>
                                                                      <div className="flex gap-2 mt-1">
                                                                                   <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-bold uppercase tracking-widest border border-border">Padel</span>
                                                                             <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-bold uppercase tracking-widest border border-border">{c.duration || 90} MIN</span>
                                                                             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest self-center ml-1">{c.surface} — {c.isIndoor ? 'Indoor' : 'Outdoor'}</span>
                                                                      </div>
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
                                                        <div key={r.id} className="p-5 bg-card/40 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-emerald-500/20 transition-all group shadow-sm hover:shadow-md">
                                                               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                                      <div className="flex items-center gap-4">
                                                                             <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                                                                    <Store size={20} />
                                                                             </div>
                                                                             <div>
                                                                                    <div className="flex items-center gap-2">
                                                                                           <h4 className="font-black text-foreground uppercase tracking-tight text-sm">{r.name}</h4>
                                                                                           <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                                                                                  {r.startTime} - {r.endTime} HS
                                                                                           </span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                           <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                                                                                  {r.courtId ? club.courts.find((c: any) => c.id === r.courtId)?.name || "Cancha" : "Todas las canchas"}
                                                                                           </p>
                                                                                           <span className="text-muted-foreground/30 font-thin">|</span>
                                                                                           <div className="flex gap-1.5 items-center">
                                                                                                  {["D", "L", "M", "Mi", "J", "V", "S"].map((day: string, i: number) => (
                                                                                                         <div
                                                                                                                key={i}
                                                                                                                className={cn(
                                                                                                                       "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black select-none",
                                                                                                                       (r.daysOfWeek || "").split(",").includes(i.toString())
                                                                                                                              ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                                                                                                              : "bg-muted/50 text-muted-foreground/30"
                                                                                                                )}
                                                                                                         >
                                                                                                                {day}
                                                                                                         </div>
                                                                                                  ))}
                                                                                           </div>
                                                                                    </div>
                                                                             </div>
                                                                      </div>

                                                                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                                                                             <div className="flex flex-col items-end">
                                                                                    <div className="flex items-baseline gap-1">
                                                                                           <span className="text-xs font-bold text-muted-foreground">$</span>
                                                                                           <span className="text-xl font-black text-foreground tracking-tighter">{r.price}</span>
                                                                                    </div>
                                                                                    {r.memberPrice && (
                                                                                           <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                                                                                                  Socio: ${r.memberPrice}
                                                                                           </span>
                                                                                    )}
                                                                             </div>

                                                                             <div className="flex gap-2 items-center">
                                                                                    <button
                                                                                           onClick={() => { setEditingRule(r); setIsRuleModalOpen(true) }}
                                                                                           className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-500 transition-all active:scale-95"
                                                                                    >
                                                                                           <Edit size={16} />
                                                                                    </button>
                                                                                    <button
                                                                                           onClick={() => removeRule(r.id)}
                                                                                           className="p-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 transition-all active:scale-95"
                                                                                    >
                                                                                           <Trash2 size={16} />
                                                                                    </button>
                                                                             </div>
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

                            {/* --- ACADEMIA TAB (ATC Extension) --- */}
                            {activeTab === 'ACADEMIA' && (
                                   <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                          <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                                                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-700" />
                                                 
                                                 <div className="relative z-10 space-y-6">
                                                        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-3 transition-transform group-hover:rotate-6 duration-500">
                                                               <GraduationCap size={40} />
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                               <h2 className="text-4xl font-black text-foreground tracking-tighter">Módulo de Academia</h2>
                                                               <p className="text-lg text-muted-foreground font-medium max-w-xl leading-relaxed">
                                                                      Gestiona tus profesores, clases personalizadas y grupos de entrenamiento con el nuevo motor de torneos y academia.
                                                               </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                                               <div className="flex items-start gap-4 p-5 bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl hover:border-primary/30 transition-all shadow-sm">
                                                                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                             <User size={18} />
                                                                      </div>
                                                                      <div>
                                                                             <h4 className="font-black text-sm text-foreground uppercase tracking-tight">Profesores</h4>
                                                                             <p className="text-xs text-muted-foreground leading-snug mt-1 italic">Administra el staff técnico y sus especialidades.</p>
                                                                      </div>
                                                               </div>
                                                               <div className="flex items-start gap-4 p-5 bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl hover:border-primary/30 transition-all shadow-sm">
                                                                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                             <CalendarDays size={18} />
                                                                      </div>
                                                                      <div>
                                                                             <h4 className="font-black text-sm text-foreground uppercase tracking-tight">Clases</h4>
                                                                             <p className="text-xs text-muted-foreground leading-snug mt-1 italic">Sincroniza el turnero con las sesiones de entrenamiento.</p>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        <div className="pt-8">
                                                               <button 
                                                                      onClick={() => router.push('/configuracion/academia')}
                                                                      className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary/20 active:scale-95 group-hover:translate-x-1 duration-300"
                                                               >
                                                                      Configurar Academia
                                                                      <ExternalLink size={18} />
                                                               </button>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            )}


                            {/* --- INVENTARIO TAB --- */}
                            {activeTab === 'INVENTARIO' && (
                                   <div className="space-y-4">
                                          <div className="flex justify-between items-center bg-card/40 backdrop-blur-xl p-4 rounded-xl border border-border/50">
                                                 <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Gestión de Stock y Precios de Kiosco</p>
                                                 <button
                                                        onClick={() => {
                                                               setEditingProduct({ name: '', category: 'Bebidas', cost: 0, price: 0, stock: 0, minStock: 5, imageUrl: null });
                                                               setIsProductModalOpen(true)
                                                        }}
                                                        className="btn-primary text-xs px-4 py-2 uppercase font-black"
                                                 >
                                                        + Agregar Producto
                                                 </button>
                                          </div>

                                          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-lg">
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
                                                                                           <div className="flex justify-end gap-3 items-center">
                                                                                                  <button
                                                                                                         onClick={() => {
                                                                                                                const qty = prompt(`Agregar Stock a ${p.name}:`, '10')
                                                                                                                const parsed = parseInt(qty || '')
                                                                                                                if (!qty || isNaN(parsed) || parsed <= 0) return
                                                                                                                restockProduct(p.id, parsed)
                                                                                                                       .then(res => {
                                                                                                                              if (res.success) {
                                                                                                                                     toast.success(`+${parsed} unidades de ${p.name}`)
                                                                                                                                     router.refresh()
                                                                                                                              } else {
                                                                                                                                     toast.error(res.error || 'Error al actualizar stock')
                                                                                                                              }
                                                                                                                       })
                                                                                                                       .catch(() => toast.error('Error de conexión'))
                                                                                                         }}
                                                                                                         className="text-emerald-500 hover:text-emerald-600 transition-colors font-bold text-xs flex items-center gap-1.5 bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10 hover:border-emerald-500/20"
                                                                                                         title="Añadir stock rápido"
                                                                                                  >
                                                                                                         <PackagePlus size={14} />
                                                                                                         <span className="hidden sm:inline">Stock</span>
                                                                                                  </button>
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
                                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-4 sm:p-6 rounded-2xl border border-border">
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
                                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card p-4 sm:p-6 rounded-2xl border border-border">
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

                            {/* --- LEGAL TAB (WAIVERS) --- */}
                            {activeTab === 'LEGAL' && (
                                   club.hasWaivers
                                          ? <WaiversTab clubId={club.id} />
                                          : (
                                                 <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                                               <Lock size={28} className="text-amber-500" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-foreground">Firma Digital no incluida en tu plan</h3>
                                                        <p className="text-sm text-muted-foreground max-w-xs">Actualizá a Plan Élite para crear waivers digitales y requerir firma a tus clientes.</p>
                                                 </div>
                                          )
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
                                   <div className="max-w-xl space-y-6 bg-card p-4 sm:p-6 rounded-2xl border border-border">
                                          <h3 className="text-xl font-bold text-foreground">Actualizar Contraseña</h3>
                                          <form onSubmit={savePassword} className="space-y-4 pt-4">
                                                 <InputGroup label="Nueva Contraseña">
                                                        <input type="password" className="input-theme w-full" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
                                                 </InputGroup>
                                                 <InputGroup label="Confirmar Contraseña">
                                                        <input type="password" className="input-theme w-full" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required minLength={6} />
                                                 </InputGroup>
                                                 <div className="pt-4 space-y-2">
                                                        {isDirty && (
                                                               <p className="text-xs text-amber-500 font-bold text-center flex items-center justify-center gap-2">
                                                                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                                                                      Cambios sin guardar
                                                               </p>
                                                        )}
                                                        <button type="submit" disabled={isLoading} className="btn-primary w-full bg-red-600 border-none hover:bg-red-700">Actualizar Contraseña</button>
                                                 </div>
                                          </form>
                                   </div>
                            )}
                            {/* --- INTEGRACIONES TAB --- */}
                            {activeTab === 'INTEGRACIONES' && (
                                   <IntegrationsTab
                                          club={club}
                                          mpForm={mpForm}
                                          setMpForm={setMpForm}
                                          isDirty={isDirty}
                                          isLoading={isLoading}
                                          saveIntegrations={saveIntegrations}
                                   />
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

                                          <div className="grid grid-cols-2 gap-4">
                                                 <InputGroup label="Deporte">
                                                        <div className="input-theme w-full flex items-center">
                                                               Padel
                                                        </div>
                                                 </InputGroup>
                                                 <InputGroup label="Duración (min)">
                                                        <input
                                                               type="number"
                                                               className="input-theme w-full opacity-80"
                                                               value={90}
                                                               readOnly
                                                        />
                                                 </InputGroup>
                                          </div>
                                          <div className="flex gap-2 justify-end pt-4">
                                                 <button type="button" onClick={() => setIsCourtModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                                                 <button type="submit" className="btn-primary px-8 py-2.5 h-12">GUARDAR CANCHA</button>
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

                                          <InputGroup label="Aplica a Cancha">
                                                 <div className="relative">
                                                        <select
                                                               className="input-theme w-full bg-background dark:bg-zinc-900 border border-border focus:ring-primary/20 appearance-none pr-10"
                                                               value={editingRule?.courtId || ''}
                                                               onChange={e => setEditingRule({ ...editingRule, courtId: e.target.value ? Number(e.target.value) : null })}
                                                        >
                                                               <option value="" className="bg-background dark:bg-zinc-900">Todas las canchas</option>
                                                               {club.courts.map((c: any) => (
                                                                      <option key={c.id} value={c.id} className="bg-background dark:bg-zinc-900">
                                                                                  {c.name} (Padel)
                                                                      </option>
                                                               ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                                                 </div>
                                          </InputGroup>

                                          <div className="grid grid-cols-2 gap-4">
                                                 <InputGroup label="Hora Inicio">
                                                        <input
                                                               type="time"
                                                               className="input-theme w-full bg-background dark:bg-zinc-900/50"
                                                               value={editingRule?.startTime || '00:00'}
                                                               onChange={e => setEditingRule({ ...editingRule, startTime: e.target.value })}
                                                               required
                                                        />
                                                 </InputGroup>
                                                 <InputGroup label="Hora Fin">
                                                        <input
                                                               type="time"
                                                               className="input-theme w-full bg-background dark:bg-zinc-900/50"
                                                               value={editingRule?.endTime || '23:59'}
                                                               onChange={e => setEditingRule({ ...editingRule, endTime: e.target.value })}
                                                               required
                                                        />
                                                 </InputGroup>
                                          </div>

                                          <InputGroup label="Días de Aplicación">
                                                 <div className="grid grid-cols-7 gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border/50">
                                                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, i) => {
                                                               const dayStr = i.toString()
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
                                                                                    setEditingRule({ ...editingRule, daysOfWeek: next.sort().join(',') })
                                                                             }}
                                                                             className={cn(
                                                                                    "aspect-square rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center gap-1 border",
                                                                                    isSelected
                                                                                           ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                                                                           : "bg-background/50 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground"
                                                                             )}
                                                                      >
                                                                             <span>{day}</span>
                                                                             <div className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-muted-foreground/30")}></div>
                                                                      </button>
                                                               )
                                                        })}
                                                 </div>
                                          </InputGroup>

                                          <div className="pt-2 border-t border-border"></div>

                                          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
                                                 <InputGroup label="Precio Público ($)">
                                                        <div className="relative">
                                                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">$</span>
                                                               <input
                                                                      type="number"
                                                                      className="input-theme w-full pl-8 text-lg font-black text-emerald-500 bg-background dark:bg-emerald-500/5 border-emerald-500/20 focus:border-emerald-500 focus:ring-emerald-500/20"
                                                                      value={editingRule?.price || ''}
                                                                      onChange={e => setEditingRule({ ...editingRule, price: e.target.value })}
                                                                      placeholder="0"
                                                                      required
                                                               />
                                                        </div>
                                                 </InputGroup>
                                                 <InputGroup label="Precio Socio ($)">
                                                        <div className="relative">
                                                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                                                               <input
                                                                      type="number"
                                                                      className="input-theme w-full pl-8 text-lg font-black text-primary bg-background dark:bg-primary/5 border-primary/20 focus:border-primary focus:ring-primary/20"
                                                                      value={editingRule?.memberPrice || ''}
                                                                      onChange={e => setEditingRule({ ...editingRule, memberPrice: e.target.value })}
                                                                      placeholder="Opcional"
                                                               />
                                                        </div>
                                                 </InputGroup>
                                          </div>
                                          <div className="flex gap-2 justify-end pt-4">
                                                 <button type="button" onClick={() => setIsRuleModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                                                 <button type="submit" className="btn-primary px-8 py-2.5 h-12">GUARDAR REGLA</button>
                                          </div>
                                   </form>
                            </Modal>
                     )}

                     {/* Team Modal */}
                     {isTeamModalOpen && (
                            <Modal title="Nuevo Usuario" onClose={() => setIsTeamModalOpen(false)}>
                                   <form onSubmit={saveTeam} className="space-y-4">
                                          <InputGroup label="Nombre">
                                                 <input className="input-theme w-full" value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} required placeholder="Nombre completo" />
                                          </InputGroup>
                                          <InputGroup label="Email">
                                                 <input type="email" className="input-theme w-full" value={teamForm.email} onChange={e => setTeamForm({ ...teamForm, email: e.target.value })} required placeholder="usuario@email.com" />
                                          </InputGroup>
                                          <InputGroup label="Contraseña">
                                                 <input type="password" className="input-theme w-full" value={teamForm.password} onChange={e => setTeamForm({ ...teamForm, password: e.target.value })} required minLength={6} placeholder="Mínimo 6 caracteres" />
                                          </InputGroup>
                                          <InputGroup label="Rol">
                                                 <select className="input-theme w-full" value={teamForm.role} onChange={e => setTeamForm({ ...teamForm, role: e.target.value })}>
                                                        <option value="USER">Staff</option>
                                                        <option value="ADMIN">Administrador</option>
                                                 </select>
                                          </InputGroup>
                                          <div className="flex gap-2 justify-end pt-4">
                                                 <button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                                                 <button type="submit" disabled={isLoading} className="btn-primary px-8 py-2.5 h-12">{isLoading ? 'CREANDO...' : 'CREAR USUARIO'}</button>
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
                                                               <label key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border cursor-pointer hover:bg-accent/10 transition-colors">
                                                                      <input
                                                                             type="checkbox"
                                                                             className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
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
                                                 <button type="submit" disabled={isLoading} className="btn-primary px-8 py-2.5 h-12">{isLoading ? 'GUARDANDO...' : 'GUARDAR EMPLEADO'}</button>
                                          </div>
                                   </form>
                            </Modal>
                     )}

              </div>
       )
}

// --- SUBCOMPONENTS ---

function TabButton({ children, active, onClick, icon: Icon }: any) {
        return (
               <button
                      onClick={onClick}
                      className={cn(
                             "px-4 lg:px-5 py-3 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.15em] relative transition-all whitespace-nowrap shrink-0 border-b-2 snap-start flex items-center gap-2",
                             active
                                    ? "text-primary border-primary bg-primary/5 shadow-[inset_0_-10px_20px_-10px_rgba(var(--primary-rgb),0.1)]"
                                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                      )}
               >
                      {Icon && <Icon size={16} className="shrink-0" />}
                      <span className="hidden sm:inline">{children}</span>
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
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                     <div className="bg-card/95 dark:bg-zinc-950/95 border border-white/10 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-muted/50 dark:bg-white/5">
                                   <div className="flex items-center gap-3">
                                          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                                          <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">{title}</h3>
                                   </div>
                                   <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-all p-2 hover:bg-white/5 rounded-xl active:scale-90">
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
