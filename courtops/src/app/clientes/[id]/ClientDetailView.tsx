'use client'

import React, { useState } from 'react'
import { createClientPayment, updateClient } from '@/actions/clients'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
       ArrowLeft, Edit, MoreVertical, MessageCircle, Phone, TrendingUp,
       Activity, CalendarX, Receipt, ShoppingBag, CalendarPlus, Wallet,
       ShoppingCart, ChevronLeft, ChevronDown, Plus, Globe, Smartphone,
       CheckCircle2, Clock, StickyNote, Save
} from 'lucide-react'

export default function ClientDetailView({ client }: { client: any }) {
       const router = useRouter()
       const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
       const [activeTab, setActiveTab] = useState('resumen')
       const [notes, setNotes] = useState(client.notes || '')
       const [isSavingNotes, setIsSavingNotes] = useState(false)

       // Derived Data
       const balance = -client.debt // Assuming debt is negative balance from list view logic, but here debt is positive amount owed. The list view logic was: balance = -(bookingsDebt + accTransDebt). Here we get 'debt' as total unpaid.

       const initials = client.name.substring(0, 2).toUpperCase()
       const colorIndex = (client.name.charCodeAt(0) || 0) % 5
       const bgColors = ['bg-blue-600', 'bg-orange-500', 'bg-emerald-500', 'bg-purple-600', 'bg-rose-500']
       const avatarBg = bgColors[colorIndex]

       const handleSaveNotes = async () => {
              setIsSavingNotes(true)
              try {
                     await updateClient(client.id, { ...client, notes })
                     // Toast success?
              } catch (e) {
                     console.error(e)
                     alert('Error al guardar notas')
              } finally {
                     setIsSavingNotes(false)
              }
       }

       const handleWhatsApp = () => {
              const cleanPhone = client.phone.replace(/\D/g, '')
              window.open(`https://wa.me/${cleanPhone}`, '_blank')
       }

       return (
              <div className="min-h-screen bg-[#0A0E17] text-slate-200 font-sans pb-24 md:pb-0">

                     {/* ================= DESKTOP VIEW ================= */}
                     <div className="hidden md:block max-w-[1600px] mx-auto p-8">

                            {/* Header */}
                            <header className="flex items-center justify-between mb-8">
                                   <div className="flex items-center gap-4">
                                          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                                 <ArrowLeft size={20} />
                                          </button>
                                          <div>
                                                 <h1 className="text-2xl font-bold text-white tracking-tight">Ficha del Cliente</h1>
                                                 <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Panel Administrativo</p>
                                          </div>
                                   </div>
                                   <div className="flex gap-3">
                                          <button onClick={handleSaveNotes} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 font-bold text-xs uppercase tracking-wider transition-colors">
                                                 <Save size={16} /> {isSavingNotes ? 'Guardando...' : 'Guardar Cambios'}
                                          </button>
                                   </div>
                            </header>

                            <div className="grid grid-cols-12 gap-8">

                                   {/* Left Column: Core Profile */}
                                   <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
                                          {/* Profile Card */}
                                          <div className="bg-[#161B26] border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                                                 <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-600/10 to-transparent"></div>
                                                 <div className="relative mb-4">
                                                        <div className={cn("w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-[#0A0E17] shadow-2xl", avatarBg)}>
                                                               {initials}
                                                        </div>
                                                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-[#161B26] rounded-full"></div>
                                                 </div>
                                                 <h2 className="text-2xl font-bold text-white">{client.name}</h2>
                                                 <div className="flex items-center gap-2 mt-2 mb-6">
                                                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">PRO MEMBER</span>
                                                        <span className="text-xs text-slate-500">ID: #{client.id.toString().padStart(4, '0')}</span>
                                                 </div>

                                                 <div className="flex gap-3 w-full">
                                                        <button onClick={handleWhatsApp} className="flex-1 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                                               <MessageCircle size={18} className="fill-current" /> WhatsApp
                                                        </button>
                                                        <button className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors">
                                                               <Phone size={18} /> Llamar
                                                        </button>
                                                 </div>
                                          </div>

                                          {/* Stats / Balance Card */}
                                          <div className="bg-[#161B26] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                                                 <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <Wallet size={80} />
                                                 </div>
                                                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Saldo Actual</p>
                                                 <div className={cn("text-4xl font-black mb-4", client.debt > 0 ? "text-red-500" : "text-emerald-500")}>
                                                        {client.debt > 0 ? `-$${client.debt.toLocaleString('es-AR')}` : '$0,00'}
                                                 </div>

                                                 {client.debt > 0 ? (
                                                        <button onClick={() => setIsPaymentModalOpen(true)} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-400 transition-all flex items-center justify-center gap-2">
                                                               <Receipt size={18} /> Registrar Pago
                                                        </button>
                                                 ) : (
                                                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                                               <CheckCircle2 size={16} /> Cuenta al día
                                                        </div>
                                                 )}
                                          </div>

                                          {/* Internal Notes */}
                                          <div className="bg-[#161B26] border border-white/5 rounded-3xl p-6">
                                                 <div className="flex items-center gap-2 mb-4 text-slate-400">
                                                        <StickyNote size={18} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Notas Internas</span>
                                                 </div>
                                                 <textarea
                                                        value={notes}
                                                        onChange={e => setNotes(e.target.value)}
                                                        className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none"
                                                        placeholder="Escribe aquí notas para los recepcionistas (ej: 'Se olvida las paletas')..."
                                                 />
                                          </div>
                                   </div>

                                   {/* Right Column: Dynamic Content */}
                                   <div className="col-span-12 lg:col-span-8 xl:col-span-9">

                                          {/* Tabs */}
                                          <div className="flex border-b border-white/5 mb-8 overflow-x-auto">
                                                 {['Resumen', 'Cta Corriente', 'Turnos', 'Compras'].map((tab) => (
                                                        <button
                                                               key={tab}
                                                               onClick={() => setActiveTab(tab.toLowerCase())}
                                                               className={cn("px-8 py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap",
                                                                      activeTab === tab.toLowerCase() ? "border-blue-500 text-blue-500" : "border-transparent text-slate-500 hover:text-slate-300")}
                                                        >
                                                               {tab}
                                                        </button>
                                                 ))}
                                          </div>

                                          {/* Tab Content */}
                                          <div className="space-y-6">
                                                 {activeTab === 'resumen' && (
                                                        <>
                                                               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Métricas de Rendimiento</h4>
                                                               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                      <KPICard icon={Activity} label="Partidos / Mes" value={client.bookings.length} trend="+5%" trendUp />
                                                                      <KPICard icon={CalendarX} label="Cancelaciones" value="0" trend="-2%" color="text-red-500" />
                                                                      <KPICard icon={Receipt} label="Ticket Promedio" value="$3.200" color="text-yellow-500" />
                                                                      <KPICard icon={ShoppingBag} label="Top Kiosco" value="Gatorade" color="text-orange-400" />
                                                               </div>

                                                               <div className="mt-8">
                                                                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Próximo Turno</h4>
                                                                      <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-6 flex items-center justify-between">
                                                                             <div className="flex items-center gap-6">
                                                                                    <div className="bg-blue-600 text-white w-16 h-16 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-blue-600/20">
                                                                                           <span className="text-xs font-bold uppercase opacity-80">HOY</span>
                                                                                           <span className="text-2xl font-black">24</span>
                                                                                    </div>
                                                                                    <div>
                                                                                           <p className="text-lg font-bold text-white">Cancha 2 - Paddle</p>
                                                                                           <p className="text-sm text-blue-400 font-medium">19:30 a 21:00 hs</p>
                                                                                    </div>
                                                                             </div>
                                                                             <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">
                                                                                    Ver Detalles
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                        </>
                                                 )}

                                                 {activeTab === 'cta corriente' && (
                                                        <div className="bg-[#161B26] border border-white/5 rounded-3xl overflow-hidden">
                                                               <table className="w-full text-left">
                                                                      <thead className="bg-black/20 text-xs text-slate-500 uppercase font-bold tracking-widest">
                                                                             <tr>
                                                                                    <th className="px-6 py-4">Fecha</th>
                                                                                    <th className="px-6 py-4">Concepto</th>
                                                                                    <th className="px-6 py-4 text-right">Monto</th>
                                                                             </tr>
                                                                      </thead>
                                                                      <tbody className="divide-y divide-white/5">
                                                                             {client.transactions?.map((t: any) => (
                                                                                    <tr key={t.id} className="hover:bg-white/[0.02]">
                                                                                           <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                                                                                                  {format(new Date(t.createdAt), "dd/MM/yyyy HH:mm")}
                                                                                           </td>
                                                                                           <td className="px-6 py-4 text-sm text-white font-medium capitalize">
                                                                                                  {t.category.replace(/_/g, ' ').toLowerCase()}
                                                                                           </td>
                                                                                           <td className={cn("px-6 py-4 text-right font-mono font-bold", t.type === 'INCOME' ? "text-emerald-500" : "text-white")}>
                                                                                                  {t.type === 'INCOME' ? '+' : '-'} ${t.amount.toLocaleString('es-AR')}
                                                                                           </td>
                                                                                    </tr>
                                                                             ))}
                                                                      </tbody>
                                                               </table>
                                                        </div>
                                                 )}

                                                 {activeTab === 'turnos' && (
                                                        <div className="space-y-4">
                                                               {client.bookings.map((b: any) => (
                                                                      <div key={b.id} className="bg-[#161B26] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                                                                             <div className="flex items-center gap-4">
                                                                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                                                                                           <Activity size={24} />
                                                                                    </div>
                                                                                    <div>
                                                                                           <p className="text-white font-bold">Cancha {b.courtId}</p>
                                                                                           <p className="text-sm text-slate-500 capitalize">{format(new Date(b.startTime), "EEEE d 'de' MMMM, HH:mm", { locale: es })} hs</p>
                                                                                    </div>
                                                                             </div>
                                                                             <div className="text-right">
                                                                                    <span className={cn("text-sm font-bold px-3 py-1 rounded-full border",
                                                                                           b.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                                                                  "bg-red-500/10 text-red-500 border-red-500/20")}>
                                                                                           {b.paymentStatus === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                                                                                    </span>
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 )}
                                          </div>
                                   </div>
                            </div>
                     </div>


                     {/* ================= MOBILE VIEW ================= */}
                     <div className="md:hidden">
                            {/* Mobile Header */}
                            <header className="sticky top-0 z-50 bg-[#0A0E17]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/5">
                                   <div className="flex items-center gap-3">
                                          <button onClick={() => router.back()} className="text-slate-400 active:scale-95 transition-transform"><ChevronLeft /></button>
                                          <h1 className="text-lg font-bold text-white tracking-tight">Perfil de Cliente</h1>
                                   </div>
                                   <button onClick={handleSaveNotes} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400">
                                          <Edit size={20} />
                                   </button>
                            </header>

                            <main className="px-4 pt-6 space-y-6">
                                   {/* Profile Hero */}
                                   <div className="flex flex-col items-center text-center">
                                          <div className="relative mb-3">
                                                 <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-white/10", avatarBg)}>
                                                        {initials}
                                                 </div>
                                                 <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-[#0A0E17] rounded-full"></div>
                                          </div>
                                          <h2 className="text-2xl font-bold text-white">{client.name}</h2>
                                          <div className="flex items-center gap-2 mt-1">
                                                 <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">PRO</span>
                                                 <span className="text-sm text-slate-500">#{client.id.toString().padStart(4, '0')}</span>
                                          </div>
                                   </div>

                                   {/* Balance Card */}
                                   <div className="bg-[#161B26] border border-white/5 rounded-[1.5rem] p-6 text-center shadow-xl shadow-blue-900/10 relative overflow-hidden">
                                          <div className="relative z-10">
                                                 <p className="text-sm font-medium text-slate-400 mb-1">Saldo Actual</p>
                                                 <p className={cn("text-4xl font-black mb-6", client.debt > 0 ? "text-red-500" : "text-emerald-500")}>
                                                        {client.debt > 0 ? `-$${client.debt.toLocaleString('es-AR')}` : '$0,00'}
                                                 </p>
                                                 <div className="flex gap-3">
                                                        <button
                                                               onClick={() => setIsPaymentModalOpen(true)}
                                                               className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                                                        >
                                                               <Wallet size={18} /> Registrar Pago
                                                        </button>
                                                        <button onClick={handleWhatsApp} className="flex-1 py-3 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                                                               <MessageCircle size={18} /> WhatsApp
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Stats Mini */}
                                   <div className="grid grid-cols-2 gap-3">
                                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                 <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Partidos</p>
                                                 <div className="flex items-end justify-between">
                                                        <span className="text-2xl font-bold text-white">{client.bookings.length}</span>
                                                        <span className="text-emerald-500 text-xs font-bold flex items-center">+5% <TrendingUp size={12} className="ml-0.5" /></span>
                                                 </div>
                                                 <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-3/4"></div>
                                                 </div>
                                          </div>
                                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                 <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Asistencia</p>
                                                 <div className="flex items-end justify-between">
                                                        <span className="text-2xl font-bold text-white">98%</span>
                                                        <span className="text-emerald-500 text-xs font-bold flex items-center">+2% <TrendingUp size={12} className="ml-0.5" /></span>
                                                 </div>
                                                 <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 w-[98%]"></div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Internal Notes Mobile */}
                                   <div className="space-y-2">
                                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Notas</h3>
                                          <textarea
                                                 value={notes}
                                                 onChange={e => setNotes(e.target.value)}
                                                 className="w-full h-24 bg-[#161B26] border border-white/5 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                                 placeholder="Notas internas..."
                                          />
                                   </div>

                                   {/* Recent Transactions List */}
                                   <div className="space-y-3 pb-32">
                                          <div className="flex items-center justify-between px-1">
                                                 <h3 className="text-lg font-bold text-white">Últimos Movimientos</h3>
                                                 <button className="text-blue-500 text-xs font-bold">Ver todo</button>
                                          </div>
                                          <div className="bg-[#161B26] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                                                 {client.transactions?.slice(0, 5).map((t: any) => (
                                                        <div key={t.id} className="flex items-center p-4 gap-4">
                                                               <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                                                                      t.type === 'INCOME' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                                                      {t.type === 'INCOME' ? <Plus size={20} /> : <ShoppingBag size={20} />}
                                                               </div>
                                                               <div className="flex-1">
                                                                      <p className="font-bold text-sm text-white capitalize">{t.category.replace(/_/g, ' ').toLowerCase()}</p>
                                                                      <p className="text-xs text-slate-500">{format(new Date(t.createdAt), "d MMM, HH:mm", { locale: es })}</p>
                                                               </div>
                                                               <p className={cn("font-bold", t.type === 'INCOME' ? "text-emerald-500" : "text-white")}>
                                                                      {t.type === 'INCOME' ? '+' : '-'} ${t.amount.toLocaleString('es-AR')}
                                                               </p>
                                                        </div>
                                                 ))}
                                                 {(!client.transactions || client.transactions.length === 0) && (
                                                        <div className="p-6 text-center text-slate-500 text-sm">Sin movimientos recientes</div>
                                                 )}
                                          </div>
                                   </div>
                            </main>

                            {/* Mobile Bottom Nav */}
                            <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0E17]/90 backdrop-blur-xl border-t border-white/5 px-6 pb-6 pt-3 z-50">
                                   <div className="flex items-center justify-between">
                                          <NavItem icon={Globe} label="Inicio" href="/" />
                                          <NavItem icon={Activity} label="Clientes" href="/clientes" active />

                                          <div className="relative -top-6">
                                                 <button onClick={() => setIsPaymentModalOpen(true)} className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 active:scale-95 transition-transform">
                                                        <Plus size={32} />
                                                 </button>
                                          </div>

                                          <NavItem icon={CalendarPlus} label="Pistas" href="/" />
                                          <NavItem icon={MoreVertical} label="Ajustes" href="/" />
                                   </div>
                            </nav>
                     </div>

                     {/* Payment Modal */}
                     {isPaymentModalOpen && (
                            <PaymentModal
                                   debt={client.debt}
                                   clientId={client.id}
                                   onClose={() => setIsPaymentModalOpen(false)}
                            />
                     )}
              </div>
       )
}

function KPICard({ icon: Icon, label, value, trend, trendUp, color = 'text-blue-500' }: any) {
       return (
              <div className="bg-[#161B26] border border-white/5 p-5 rounded-2xl">
                     <div className="flex justify-between items-start mb-2">
                            <Icon size={24} className={color} />
                            {trend && (
                                   <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", trendUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                          {trend}
                                   </span>
                            )}
                     </div>
                     <p className="text-2xl font-black text-white">{value}</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
              </div>
       )
}

function NavItem({ icon: Icon, label, href, active }: any) {
       const router = useRouter()
       return (
              <button
                     onClick={() => router.push(href)}
                     className={cn("flex flex-col items-center gap-1", active ? "text-blue-500" : "text-slate-500")}
              >
                     <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                     <span className="text-[10px] font-bold">{label}</span>
              </button>
       )
}


function PaymentModal({ debt, clientId, onClose }: { debt: number, clientId: number, onClose: () => void }) {
       const [amount, setAmount] = useState(Math.max(0, debt).toString())
       const [method, setMethod] = useState<'CASH' | 'TRANSFER'>('CASH')
       const [loading, setLoading] = useState(false)
       const router = useRouter()

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setLoading(true)
              try {
                     await createClientPayment(clientId, Number(amount), method, "Pago Cta Cte")
                     onClose()
                     router.refresh()
              } catch (error) {
                     alert("Error al procesar pago")
              } finally {
                     setLoading(false)
              }
       }

       return (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                     <div className="bg-[#161B26] border border-white/10 w-full max-w-sm rounded-[1.5rem] shadow-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Registrar Pago</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                   <div className="space-y-1">
                                          <label className="text-xs text-slate-500 uppercase font-bold">Monto a Pagar</label>
                                          <div className="relative">
                                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                 <input
                                                        type="number"
                                                        value={amount}
                                                        onChange={e => setAmount(e.target.value)}
                                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500/50"
                                                 />
                                          </div>
                                   </div>

                                   <div className="space-y-1">
                                          <label className="text-xs text-slate-500 uppercase font-bold">Método de Pago</label>
                                          <div className="grid grid-cols-2 gap-2">
                                                 <button
                                                        type="button"
                                                        onClick={() => setMethod('CASH')}
                                                        className={cn("py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2",
                                                               method === 'CASH' ? "bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/20" : "bg-transparent text-slate-500 border-white/10 hover:border-white/30")}
                                                 >
                                                        <Wallet size={16} /> Efectivo
                                                 </button>
                                                 <button
                                                        type="button"
                                                        onClick={() => setMethod('TRANSFER')}
                                                        className={cn("py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2",
                                                               method === 'TRANSFER' ? "bg-blue-600 text-white border-transparent shadow-lg shadow-blue-600/20" : "bg-transparent text-slate-500 border-white/10 hover:border-white/30")}
                                                 >
                                                        <Globe size={16} /> MercadoPago
                                                 </button>
                                          </div>
                                   </div>

                                   <div className="pt-4 flex gap-3">
                                          <button type="button" onClick={onClose} className="flex-1 py-3 bg-white/5 rounded-xl text-slate-400 font-bold text-sm hover:bg-white/10 transition-colors">Cancelar</button>
                                          <button
                                                 type="submit"
                                                 disabled={loading}
                                                 className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/20"
                                          >
                                                 {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirmar'}
                                          </button>
                                   </div>
                            </form>
                     </div>
              </div>
       )
}

function Loader2({ size, className }: any) {
       return (
              <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width={size}
                     height={size}
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className={className}
              >
                     <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
       )
}
