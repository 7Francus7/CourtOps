'use client'

import React, { useState, useEffect } from 'react'
import { getCashRegisterStatus, openCashRegister, closeCashRegister, addMovement } from '@/actions/cash-register'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Lock, Unlock, DollarSign, PlusCircle, MinusCircle, AlertTriangle, Save, RefreshCw, History, X, Printer, Download, BarChart3, Banknote, CreditCard, ArrowRightLeft, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { CashRegisterReport } from '@/components/CashRegisterReport'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

interface CashTransaction {
       id: number
       type: string
       method: string
       amount: number
       description: string | null
       category: string
       createdAt: Date | string
}

interface CashRegisterInfo {
       id: number
       openedAt: Date | string
       closedAt: Date | string | null
       endAmountCash: number | null
       status: string
       transactions?: CashTransaction[]
}

interface CashSummary {
       startAmount: number
       incomeCash: number
       incomeTransfer?: number
       expenseCash: number
       incomeDigital: number
       currentCash: number
       totalMovements: number
}

interface CashRegisterStatus {
       success: boolean
       status?: string
       register?: CashRegisterInfo
       summary?: CashSummary
       error?: string
}

interface ClosedReport {
       startAmount: number
       incomeCash: number
       incomeTransfer: number
       expenseCash: number
       currentCash: number
       declaredCash: number
       difference: number
       closedAt: Date
}

export default function CashRegisterPage() {
       const [status, setStatus] = useState<CashRegisterStatus | null>(null)
       const [loading, setLoading] = useState(true)
       const [amountInput, setAmountInput] = useState('')
       const [descInput, setDescInput] = useState('')
       const [lastClosedReport, setLastClosedReport] = useState<ClosedReport | null>(null)

       const reportRef = useRef(null)
       const handlePrint = useReactToPrint({
              contentRef: reportRef,
       })

       // Modals state
       const [showOpenModal, setShowOpenModal] = useState(false)
       const [showCloseModal, setShowCloseModal] = useState(false)
       const [showMoveModal, setShowMoveModal] = useState<'INCOME' | 'EXPENSE' | null>(null)


       const loadData = async () => {
              setLoading(true)
              const res = await getCashRegisterStatus()
              if (res.success) {
                     setStatus(res)
              }
              setLoading(false)
       }

        
       useEffect(() => {
              loadData()
       }, [])


       const handleOpenRegister = async () => {
              const start = Number(amountInput) || 0
              // Show confirmation or just do it? Let's assume modal handled input
              const res = await openCashRegister(start)
              if (res.success) {
                     toast.success('Caja abierta correctamente')
                     setShowOpenModal(false)
                     loadData()
              } else {
                     toast.error(res.error)
              }
       }

       const handleCloseRegister = async () => {
              const declared = Number(amountInput) || 0
              if (!status?.register?.id) return

              const res = await closeCashRegister(status.register.id, declared)
              if (res.success) {
                     toast.success('Caja cerrada correctamente')
                     if (res.difference !== undefined && res.difference !== 0) {
                            toast('Diferencia detectada: $' + res.difference, {
                                   description: res.difference > 0 ? 'Sobrante en caja' : 'Faltante en caja',
                                   duration: 5000
                            })
                     }
                     // Set report data for printing
                     setLastClosedReport({
                            startAmount: status.summary!.startAmount,
                            incomeCash: status.summary!.incomeCash,
                            incomeTransfer: status.summary!.incomeTransfer ?? 0,
                            expenseCash: status.summary!.expenseCash,
                            currentCash: status.summary!.currentCash,
                            declaredCash: declared,
                            difference: res.difference ?? 0,
                            closedAt: new Date()
                     })
                     setShowCloseModal(false)
                     loadData()
              } else {
                     toast.error(res.error)
              }
       }

       const handleMovement = async () => {
              if (!showMoveModal) return
              const amount = Number(amountInput)
              if (!amount || amount <= 0) return toast.error('Monto inválido')
              if (!descInput) return toast.error('Ingrese descripción')

              const res = await addMovement(amount, showMoveModal, descInput)
              if (res.success) {
                     toast.success('Movimiento registrado')
                     setShowMoveModal(null)
                     setAmountInput('')
                     setDescInput('')
                     loadData()
              } else {
                     toast.error(res.error)
              }
       }

       if (loading) return <div className="p-10 flex justify-center"><RefreshCw className="animate-spin" /></div>

       // STATE: NO REGISTER or CLOSED
       if (status?.status === 'NO_REGISTER' || status?.status === 'CLOSED') {
              return (
                     <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="relative">
                                   <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full" />
                                   <div className="relative w-32 h-32 bg-card/80 backdrop-blur-xl border border-border/50 rounded-full flex items-center justify-center shadow-2xl">
                                          <Lock size={48} className="text-muted-foreground" />
                                   </div>
                            </div>
                            <div className="text-center space-y-3 max-w-sm">
                                   <h1 className="text-4xl font-black tracking-tight">Caja Cerrada</h1>
                                   <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                                          Opera de forma segura. Abre tu caja registradora para comenzar a registrar movimientos y ventas.
                                   </p>
                            </div>

                            {status?.status === 'CLOSED' && (
                                   <div className="bg-card/40 backdrop-blur-md border border-border/50 p-5 rounded-2xl w-full max-w-sm shadow-lg">
                                          <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-4 flex items-center gap-2">
                                                 <History size={12} /> Último Cierre
                                          </p>
                                          <div className="space-y-3">
                                                 <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/30">
                                                        <span className="text-xs font-bold text-muted-foreground">Fecha</span>
                                                        <span className="font-mono text-sm font-bold">{format(new Date(status.register!.closedAt as string), 'dd/MM HH:mm')}</span>
                                                 </div>
                                                 <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/30">
                                                        <span className="text-xs font-bold text-muted-foreground">Efectivo Final</span>
                                                        <span className="font-mono font-black text-emerald-500 text-lg">${status.register!.endAmountCash}</span>
                                                 </div>
                                          </div>
                                   </div>
                            )}

                            <button
                                   onClick={() => { setAmountInput(''); setShowOpenModal(true) }}
                                   className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all overflow-hidden shadow-sm flex items-center gap-3"
                            >
                                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                   <Unlock size={18} className="group-hover:rotate-12 transition-transform" /> ABRIR CAJA REGISTRADORA
                            </button>

                            {/* OPEN MODAL */}
                            {showOpenModal && (
                                   <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                                          <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border animate-in zoom-in-95">
                                                 <h2 className="text-xl font-bold mb-4">Apertura de Caja</h2>
                                                 <p className="text-sm text-muted-foreground mb-4">Ingrese el monto inicial de efectivo en caja.</p>

                                                 <div className="space-y-4">
                                                        <div>
                                                               <label className="text-xs font-bold uppercase text-muted-foreground">Efectivo Inicial ($)</label>
                                                               <input
                                                                      type="number"
                                                                      className="w-full text-2xl font-black bg-secondary p-4 rounded-xl outline-none focus:ring-2 ring-primary"
                                                                      placeholder="0.00"
                                                                      value={amountInput}
                                                                      onChange={e => setAmountInput(e.target.value)}
                                                                      autoFocus
                                                               />
                                                        </div>
                                                        <div className="flex gap-3 justify-end mt-6">
                                                               <button onClick={() => setShowOpenModal(false)} className="px-4 py-2 font-bold text-muted-foreground hover:bg-secondary rounded-lg">Cancelar</button>
                                                               <button onClick={handleOpenRegister} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-110">
                                                                      Confirmar Apertura
                                                               </button>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            )}
                     </div>
              )
       }

       // STATE: OPEN
       const summary = status!.summary!
       const register = status!.register!
return (
               <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pt-4 md:pt-8 px-3 md:px-4">
                      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                             <div>
                                    <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                                           <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                           <span className="hidden sm:inline">Caja Abierta</span>
                                           <span className="sm:hidden">Caja</span>
                                    </h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Abierta {format(new Date(register.openedAt), "d 'de' MMM HH:mm", { locale: es })}</p>
                             </div>
                             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <button
                                           onClick={() => window.open('/api/export/caja', '_blank')}
                                           className="bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-2 sm:py-2 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                                    >
                                           <Download size={14} /> <span className="hidden sm:inline">Exportar Excel</span>
                                    </button>
                                    <button
                                           onClick={() => { setAmountInput(''); setShowCloseModal(true) }}
                                           className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-3 py-2 sm:py-2 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                                    >
                                           <Lock size={14} /> <span className="hidden sm:inline">CERRAR</span>
                                    </button>
                             </div>
                      </header>

                     {/* MAIN STATS GRID */}
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                            {/* CAJA PRINCIPAL - HERO CARD */}
                            <div className="md:col-span-4 bg-gradient-to-br from-emerald-500/10 via-emerald-100/5 to-transparent dark:from-emerald-900/20 dark:to-background border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-emerald-900/5 dark:shadow-emerald-900/10 backdrop-blur-md transition-all hover:border-emerald-500/30 group">
                                   <div className="z-10">
                                          <div className="flex items-center gap-3 mb-2">
                                                 <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                                        <DollarSign size={20} strokeWidth={2.5} />
                                                 </div>
                                                 <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Efectivo en Caja</span>
                                          </div>
                                          <h2 className="text-5xl lg:text-6xl font-black text-foreground tracking-tighter mt-4">
                                                 ${summary.currentCash.toLocaleString()}
                                          </h2>
                                          <p className="text-xs text-muted-foreground mt-3 font-medium flex items-center gap-2">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                 Dinero físico disponible
                                          </p>
                                   </div>
                                   <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none" />
                            </div>

                            {/* DIGITAL INCOME - HERO CARD */}
                            <div className="md:col-span-4 bg-gradient-to-br from-blue-500/10 via-blue-100/5 to-transparent dark:from-blue-900/20 dark:to-background border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-blue-900/5 dark:shadow-blue-900/10 backdrop-blur-md transition-all hover:border-blue-500/30 group">
                                   <div className="z-10">
                                          <div className="flex items-center gap-3 mb-2">
                                                 <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                                                        <RefreshCw size={20} strokeWidth={2.5} />
                                                 </div>
                                                 <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Ingresos Digitales</span>
                                          </div>
                                          <h2 className="text-5xl lg:text-6xl font-black text-foreground tracking-tighter mt-4">
                                                 ${summary.incomeDigital?.toLocaleString() || '0'}
                                          </h2>
                                          <p className="text-xs text-muted-foreground mt-3 font-medium flex items-center gap-2">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                 Transferencias y MercadoPago
                                          </p>
                                   </div>
                                   <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />
                            </div>

                            {/* TOTAL DAILY REVENUE - HERO CARD */}
                            <div className="md:col-span-4 bg-gradient-to-br from-purple-500/10 via-purple-100/5 to-transparent dark:from-purple-900/20 dark:to-background border border-purple-500/20 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-purple-900/5 dark:shadow-purple-900/10 backdrop-blur-md transition-all hover:border-purple-500/30 group">
                                   <div className="z-10">
                                          <div className="flex items-center gap-3 mb-2">
                                                 <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 shadow-inner group-hover:scale-110 transition-transform">
                                                        <BarChart3 size={20} strokeWidth={2.5} />
                                                 </div>
                                                 <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em]">Total Bruto Hoy</span>
                                          </div>
                                          <h2 className="text-5xl lg:text-6xl font-black text-foreground tracking-tighter mt-4">
                                                 ${(summary.currentCash + summary.incomeDigital).toLocaleString()}
                                          </h2>
                                          <p className="text-xs text-muted-foreground mt-3 font-medium flex items-center gap-2">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                                 Suma de todos los medios
                                          </p>
                                   </div>
                                   <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none" />
                            </div>

                            {/* RESUMEN - STATS CARD */}
                            <div className="md:col-span-5 bg-card/40 backdrop-blur-xl border border-border/50 p-6 lg:p-8 rounded-3xl flex flex-col justify-center gap-6 shadow-xl shadow-black/5 dark:shadow-black/20 hover:bg-card/60 transition-colors">
                                   <div className="grid grid-cols-2 gap-4">
                                          <div className="p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm relative overflow-hidden group">
                                                 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Caja Inicial</p>
                                                 <p className="text-xl font-black flex items-center gap-1 text-foreground">
                                                        <span className="text-muted-foreground/40 text-sm">$</span> {summary.startAmount.toLocaleString()}
                                                 </p>
                                          </div>
                                          <div className="p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm relative overflow-hidden group">
                                                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Teórico Actual</p>
                                                 <p className="text-xl font-black flex items-center gap-1 text-foreground">
                                                        <span className="text-muted-foreground/40 text-sm">$</span> {summary.currentCash.toLocaleString()}
                                                 </p>
                                          </div>
                                   </div>

                                   <div className="space-y-4 pt-2">
                                          <div className="flex justify-between items-center group">
                                                 <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner">
                                                               <PlusCircle size={18} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">Ingresos Efectivo</span>
                                                 </div>
                                                 <span className="font-black text-emerald-500 text-xl tracking-tight">+${summary.incomeCash.toLocaleString()}</span>
                                          </div>
                                          <div className="w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                                          <div className="flex justify-between items-center group">
                                                 <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform shadow-inner">
                                                               <MinusCircle size={18} strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">Gastos / Retiros</span>
                                                 </div>
                                                 <span className="font-black text-red-500 text-xl tracking-tight">-${summary.expenseCash.toLocaleString()}</span>
                                          </div>
                                   </div>
                            </div>

                            {/* ACCIONES - ACTION BUTTONS */}
                            <div className="md:col-span-3 flex flex-col gap-4">
                                   <button
                                          onClick={() => { setShowMoveModal('INCOME'); setAmountInput(''); setDescInput('') }}
                                          className="flex-1 rounded-3xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 dark:shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-2 p-4 group relative overflow-hidden"
                                   >
                                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                          <PlusCircle size={28} className="group-hover:rotate-90 transition-transform duration-500 opacity-90" />
                                          <span className="font-black text-[11px] uppercase tracking-widest relative z-10">Ingreso Manual</span>
                                   </button>
                                   <button
                                          onClick={() => { setShowMoveModal('EXPENSE'); setAmountInput(''); setDescInput('') }}
                                          className="flex-[0.8] rounded-3xl bg-card/40 backdrop-blur-md border border-border/50 hover:border-red-500/30 hover:bg-red-500/5 text-muted-foreground hover:text-red-500 transition-all flex flex-col items-center justify-center gap-1 p-3 group shadow-sm hover:shadow-md"
                                   >
                                          <MinusCircle size={22} className="group-hover:-rotate-12 transition-transform opacity-70 group-hover:opacity-100" />
                                          <span className="font-bold text-[10px] uppercase tracking-wider">Registrar Gasto</span>
                                   </button>
                            </div>
                     </div>

                     {/* MOVEMENTS FEED */}
                     <div className="space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2 px-1">
                                   <History size={18} className="text-primary" />
                                   Últimos Movimientos
                            </h3>

                            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
                                   <div className="divide-y divide-border/40">
                                          {(register.transactions ?? []).length === 0 ? (
                                                 <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                                                               <History size={32} className="opacity-50" />
                                                        </div>
                                                        <p className="font-medium">No hay movimientos registrados en este turno.</p>
                                                 </div>
                                          ) : (register.transactions ?? []).slice().reverse().map((t) => (
                                                 <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/40 transition-colors group">
                                                        <div className="flex items-start gap-4">
                                                               <div className={cn(
                                                                      "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0 mt-1 sm:mt-0 transition-colors",
                                                                      t.type === 'INCOME' ? "bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white" : "bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                                                               )}>
                                                                      {t.type === 'INCOME' ? <PlusCircle size={18} /> : <MinusCircle size={18} />}
                                                               </div>
                                                               <div>
                                                                      <p className="font-bold text-foreground text-sm flex items-center gap-2">
                                                                             {t.description || 'Sin descripción'}
                                                                      </p>
                                                                      <div className="flex items-center gap-2 mt-1.5">
                                                                             <span className="text-xs font-mono text-muted-foreground/80 flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-md">
                                                                                    {format(new Date(t.createdAt), 'HH:mm')}
                                                                             </span>
                                                                             <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1",
                                                                                    t.method === 'CASH' && "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",
                                                                                    t.method === 'MERCADOPAGO' && "border-blue-500/30 text-blue-600 bg-blue-500/5",
                                                                                    t.method === 'TRANSFER' && "border-purple-500/30 text-purple-600 bg-purple-500/5",
                                                                                    t.method === 'DEBIT_CARD' && "border-amber-500/30 text-amber-600 bg-amber-500/5",
                                                                                    !['CASH', 'MERCADOPAGO', 'TRANSFER', 'DEBIT_CARD'].includes(t.method) && "border-border text-muted-foreground"
                                                                             )}>
                                                                                    {t.method === 'CASH' && <Banknote size={12} />}
                                                                                    {t.method === 'MERCADOPAGO' && <CreditCard size={12} />}
                                                                                    {t.method === 'TRANSFER' && <ArrowRightLeft size={12} />}
                                                                                    {t.method === 'DEBIT_CARD' && <Smartphone size={12} />}
                                                                                    {t.method}
                                                                             </span>
                                                                             <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-secondary rounded-full uppercase">
                                                                                    {t.category}
                                                                             </span>
                                                                      </div>
                                                               </div>
                                                        </div>
                                                        <div className="text-right pl-14 sm:pl-0">
                                                               <span className={cn("text-lg font-black tracking-tight", t.type === 'INCOME' ? "text-green-500" : "text-red-500")}>
                                                                      {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                                                               </span>
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>
                            </div>
                     </div>

                     {/* CLOSE MODAL */}
                     {showCloseModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                                   <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-destructive/20 animate-in zoom-in-95">
                                          <div className="flex items-center gap-3 mb-4 text-destructive">
                                                 <AlertTriangle size={24} />
                                                 <h2 className="text-xl font-bold">Cierre de Caja</h2>
                                          </div>
                                          <p className="text-sm text-muted-foreground mb-6">Por favor, cuente el dinero físico en la caja e ingrese el total.</p>

                                          <div className="bg-secondary/50 p-4 rounded-xl mb-6 flex justify-between items-center">
                                                 <span className="text-sm font-bold text-muted-foreground">Sistema Espera:</span>
                                                 <span className="text-xl font-black">${summary.currentCash}</span>
                                          </div>

                                          <div className="space-y-4">
                                                 <div>
                                                        <label className="text-xs font-bold uppercase text-muted-foreground">Dinero Real ($)</label>
                                                        <input
                                                               type="number"
                                                               className="w-full text-2xl font-black bg-secondary p-4 rounded-xl outline-none focus:ring-2 ring-destructive"
                                                               placeholder="0.00"
                                                               value={amountInput}
                                                               onChange={e => setAmountInput(e.target.value)}
                                                               autoFocus
                                                        />
                                                 </div>
                                                 <div className="flex gap-3 justify-end mt-6">
                                                        <button onClick={() => setShowCloseModal(false)} className="px-4 py-2 font-bold text-muted-foreground hover:bg-secondary rounded-lg">Cancelar</button>
                                                        <button onClick={handleCloseRegister} className="px-6 py-2 bg-destructive text-destructive-foreground font-bold rounded-lg hover:brightness-110">
                                                               Confirmar Cierre
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     )}

                     {/* MOVEMENT MODAL */}
                     {showMoveModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                                   <div className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-border animate-in zoom-in-95">
                                          <h2 className={cn("text-xl font-bold mb-4 flex items-center gap-2", showMoveModal === 'INCOME' ? "text-green-500" : "text-red-500")}>
                                                 {showMoveModal === 'INCOME' ? <PlusCircle /> : <MinusCircle />}
                                                 {showMoveModal === 'INCOME' ? 'Registrar Ingreso' : 'Registrar Gasto/Retiro'}
                                          </h2>

                                          <div className="space-y-4">
                                                 <div>
                                                        <label className="text-xs font-bold uppercase text-muted-foreground">Monto ($)</label>
                                                        <input
                                                               type="number"
                                                               className="w-full text-2xl font-black bg-secondary p-4 rounded-xl outline-none focus:ring-2 ring-primary"
                                                               placeholder="0.00"
                                                               value={amountInput}
                                                               onChange={e => setAmountInput(e.target.value)}
                                                               autoFocus
                                                        />
                                                 </div>
                                                 <div>
                                                        <label className="text-xs font-bold uppercase text-muted-foreground">Descripción</label>
                                                        <textarea
                                                               className="w-full bg-secondary p-3 rounded-xl outline-none focus:ring-2 ring-primary text-sm font-medium resize-none"
                                                               rows={2}
                                                               placeholder={showMoveModal === 'INCOME' ? "Ej: Venta de bebidas, Cobro clase particular..." : "Ej: Compra de pelotas, Pago a proveedor..."}
                                                               value={descInput}
                                                               onChange={e => setDescInput(e.target.value)}
                                                        />
                                                 </div>
                                                 <div className="flex gap-3 justify-end mt-6">
                                                        <button onClick={() => setShowMoveModal(null)} className="px-4 py-2 font-bold text-muted-foreground hover:bg-secondary rounded-lg">Cancelar</button>
                                                        <button onClick={handleMovement} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-110">
                                                               Guardar
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     )}

                     {/* REPORT MODAL */}
                     {lastClosedReport && (
                            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                                   <div className="bg-card text-card-foreground w-full max-w-lg p-0 rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                                          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                                                 <h2 className="font-bold flex items-center gap-2"><Save className="text-primary" /> Reporte Generado</h2>
                                                 <button onClick={() => setLastClosedReport(null)} className="p-2 hover:bg-secondary rounded-full"><X size={20} /></button>
                                          </div>

                                          <div className="overflow-y-auto p-4 bg-secondary dark:bg-secondary flex justify-center">
                                                 <div ref={reportRef} className="bg-white text-black shadow-lg">
                                                        <CashRegisterReport data={lastClosedReport as unknown as Record<string, unknown>} />
                                                 </div>
                                          </div>

                                          <div className="p-4 border-t border-border flex justify-end gap-3 bg-card">
                                                 <button onClick={() => setLastClosedReport(null)} className="px-4 py-2 font-bold text-muted-foreground hover:bg-secondary rounded-lg">Cerrar</button>
                                                 <button onClick={() => handlePrint && handlePrint()} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-110 flex items-center gap-2 shadow-lg">
                                                        <Printer size={18} /> IMPRIMIR
                                                 </button>
                                          </div>
                                   </div>
                            </div>
                     )}

              </div>
       )
}
