'use client'

import React, { useState, useEffect } from 'react'
import { getCashRegisterStatus, openCashRegister, closeCashRegister, addMovement } from '@/actions/cash-register'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Lock, Unlock, DollarSign, PlusCircle, MinusCircle, AlertTriangle, Save, RefreshCw, History, X, Printer, Download } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { CashRegisterReport } from '@/components/CashRegisterReport'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

export default function CashRegisterPage() {
       const [status, setStatus] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [amountInput, setAmountInput] = useState('')
       const [descInput, setDescInput] = useState('')
       const [lastClosedReport, setLastClosedReport] = useState<any>(null)

       const reportRef = useRef(null)
       const handlePrint = useReactToPrint({
              contentRef: reportRef,
       })

       // Modals state
       const [showOpenModal, setShowOpenModal] = useState(false)
       const [showCloseModal, setShowCloseModal] = useState(false)
       const [showMoveModal, setShowMoveModal] = useState<'INCOME' | 'EXPENSE' | null>(null)

       useEffect(() => {
              loadData()
       }, [])

       const loadData = async () => {
              setLoading(true)
              const res = await getCashRegisterStatus()
              if (res.success) {
                     setStatus(res)
              }
              setLoading(false)
       }

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
                            startAmount: status.summary.startAmount,
                            incomeCash: status.summary.incomeCash,
                            incomeTransfer: status.summary.incomeTransfer,
                            expenseCash: status.summary.expenseCash,
                            currentCash: status.summary.currentCash,
                            declaredCash: declared,
                            difference: res.difference,
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
                     <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in">
                            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center">
                                   <Lock size={40} className="text-muted-foreground" />
                            </div>
                            <div className="text-center space-y-2">
                                   <h1 className="text-2xl font-bold">Caja Cerrada</h1>
                                   <p className="text-muted-foreground">Debes abrir la caja para comenzar a operar.</p>
                            </div>

                            {status?.status === 'CLOSED' && (
                                   <div className="bg-card border border-border p-4 rounded-xl w-full max-w-sm">
                                          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Último Cierre</p>
                                          <div className="flex justify-between">
                                                 <span>Fecha:</span>
                                                 <span className="font-mono">{format(new Date(status.register.closedAt), 'dd/MM HH:mm')}</span>
                                          </div>
                                          <div className="flex justify-between">
                                                 <span>Efectivo Final:</span>
                                                 <span className="font-mono font-bold">${status.register.endAmountCash}</span>
                                          </div>
                                   </div>
                            )}

                            <button
                                   onClick={() => { setAmountInput(''); setShowOpenModal(true) }}
                                   className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                   <Unlock size={18} /> ABRIR CAJA
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
       const { summary } = status
       return (
              <div className="max-w-5xl mx-auto space-y-6">
                     <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                   <h1 className="text-2xl font-black flex items-center gap-2">
                                          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                          Caja Abierta
                                   </h1>
                                   <p className="text-sm text-muted-foreground">Abierta el {format(new Date(status.register.openedAt), "d 'de' MMMM HH:mm", { locale: es })}</p>
                            </div>
                            <div className="flex gap-2">
                                   <button onClick={loadData} className="p-2 hover:bg-secondary rounded-lg"><RefreshCw size={20} /></button>
                                   <button
                                          onClick={() => window.open('/api/export/caja', '_blank')}
                                          className="bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
                                   >
                                          <Download size={16} /> Exportar CSV
                                   </button>
                                   <button
                                          onClick={() => { setAmountInput(''); setShowCloseModal(true) }}
                                          className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
                                   >
                                          <Lock size={16} /> CERRAR CAJA
                                   </button>
                            </div>
                     </header>

                     {/* MAIN STATS GRID */}
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                            {/* CAJA PRINCIPAL - HERO CARD */}
                            <div className="md:col-span-4 bg-gradient-to-br from-emerald-900/20 to-background border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl shadow-emerald-900/10">
                                   <div className="z-10">
                                          <div className="flex items-center gap-2 mb-2">
                                                 <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                                        <DollarSign size={20} />
                                                 </div>
                                                 <span className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest">Efectivo en Caja</span>
                                          </div>
                                          <h2 className="text-5xl font-black text-foreground tracking-tight mt-2">
                                                 ${summary.currentCash.toLocaleString()}
                                          </h2>
                                          <p className="text-sm text-muted-foreground mt-2 font-medium">
                                                 Disponible para retiros
                                          </p>
                                   </div>

                                   {/* Decorative background blur */}
                                   <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                            </div>

                            {/* RESUMEN - STATS CARD */}
                            <div className="md:col-span-5 bg-card/60 backdrop-blur-sm border border-border/50 p-6 rounded-3xl flex flex-col justify-center gap-4 shadow-sm">
                                   <div className="grid grid-cols-2 gap-4">
                                          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                                                 <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Inicio</p>
                                                 <p className="text-lg font-bold flex items-center gap-1 text-foreground">
                                                        <span className="text-muted-foreground/50 text-xs">$</span> {summary.startAmount.toLocaleString()}
                                                 </p>
                                          </div>
                                          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                                                 <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Teórico</p>
                                                 <p className="text-lg font-bold flex items-center gap-1 text-foreground">
                                                        <span className="text-muted-foreground/50 text-xs">$</span> {summary.currentCash.toLocaleString()}
                                                 </p>
                                          </div>
                                   </div>

                                   <div className="space-y-3 pt-2">
                                          <div className="flex justify-between items-center group">
                                                 <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                                               <PlusCircle size={14} />
                                                        </div>
                                                        <span className="text-sm font-medium text-muted-foreground">Ingresos Efectivo</span>
                                                 </div>
                                                 <span className="font-bold text-green-500 text-lg">+${summary.incomeCash.toLocaleString()}</span>
                                          </div>
                                          <div className="w-full h-px bg-border/50" />
                                          <div className="flex justify-between items-center group">
                                                 <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                                               <MinusCircle size={14} />
                                                        </div>
                                                        <span className="text-sm font-medium text-muted-foreground">Gastos / Retiros</span>
                                                 </div>
                                                 <span className="font-bold text-red-500 text-lg">-${summary.expenseCash.toLocaleString()}</span>
                                          </div>
                                   </div>
                            </div>

                            {/* ACCIONES - ACTION BUTTONS */}
                            <div className="md:col-span-3 flex flex-col gap-3">
                                   <button
                                          onClick={() => { setShowMoveModal('INCOME'); setAmountInput(''); setDescInput('') }}
                                          className="flex-1 rounded-3xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-1 p-4 group"
                                   >
                                          <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
                                          <span className="font-bold text-sm">Ingreso Manual</span>
                                   </button>
                                   <button
                                          onClick={() => { setShowMoveModal('EXPENSE'); setAmountInput(''); setDescInput('') }}
                                          className="flex-1 rounded-3xl bg-card border-2 border-dashed border-border hover:border-red-500/50 hover:bg-red-500/5 text-muted-foreground hover:text-red-500 transition-all flex flex-col items-center justify-center gap-1 p-4 group"
                                   >
                                          <MinusCircle size={24} className="group-hover:-rotate-12 transition-transform" />
                                          <span className="font-bold text-sm">Registrar Gasto</span>
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
                                          {status.register.transactions.length === 0 ? (
                                                 <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                                                               <History size={32} className="opacity-50" />
                                                        </div>
                                                        <p className="font-medium">No hay movimientos registrados en este turno.</p>
                                                 </div>
                                          ) : status.register.transactions.slice().reverse().map((t: any) => (
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
                                                                             <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                                                                                    t.method === 'CASH' ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : "border-border text-muted-foreground"
                                                                             )}>
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
                                                               placeholder="Ej: Compra de pelotas, Pago a proveedor..."
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
                                   <div className="bg-white text-black w-full max-w-lg p-0 rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                                          <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                                                 <h2 className="font-bold flex items-center gap-2"><Save className="text-primary" /> Reporte Generado</h2>
                                                 <button onClick={() => setLastClosedReport(null)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                                          </div>

                                          <div className="overflow-y-auto p-4 bg-slate-100 dark:bg-slate-900 flex justify-center">
                                                 <div ref={reportRef} className="bg-white text-black shadow-lg">
                                                        <CashRegisterReport data={lastClosedReport} />
                                                 </div>
                                          </div>

                                          <div className="p-4 border-t flex justify-end gap-3 bg-white">
                                                 <button onClick={() => setLastClosedReport(null)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cerrar</button>
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
