'use client'

import React, { useState, useEffect } from 'react'
import { getCashRegisterStatus, openCashRegister, closeCashRegister, addMovement } from '@/actions/cash-register'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Lock, Unlock, DollarSign, PlusCircle, MinusCircle, AlertTriangle, Save, RefreshCw, History } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function CashRegisterPage() {
       const [status, setStatus] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [amountInput, setAmountInput] = useState('')
       const [descInput, setDescInput] = useState('')

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
                                          onClick={() => { setAmountInput(''); setShowCloseModal(true) }}
                                          className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
                                   >
                                          <Lock size={16} /> CERRAR CAJA
                                   </button>
                            </div>
                     </header>

                     {/* MAIN STATS */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden">
                                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Efectivo Actual</p>
                                   <h2 className="text-4xl font-black text-foreground">${summary.currentCash.toLocaleString()}</h2>
                                   <div className="absolute right-0 top-0 p-4 opacity-10"><DollarSign size={60} /></div>
                            </div>

                            <div className="bg-card border border-border p-6 rounded-2xl space-y-2">
                                   <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">Inicio Caja:</span>
                                          <span className="font-bold cursor-help" title="Monto de apertura">+${summary.startAmount}</span>
                                   </div>
                                   <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">Ingresos Efvo:</span>
                                          <span className="font-bold text-green-500">+${summary.incomeCash}</span>
                                   </div>
                                   <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">Gastos/Retiros:</span>
                                          <span className="font-bold text-red-500">-${summary.expenseCash}</span>
                                   </div>
                                   <div className="border-t border-border/50 pt-2 flex justify-between font-bold">
                                          <span>Teórico Caja:</span>
                                          <span>${summary.currentCash}</span>
                                   </div>
                            </div>

                            <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-center gap-3">
                                   <button
                                          onClick={() => { setShowMoveModal('INCOME'); setAmountInput(''); setDescInput('') }}
                                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500/10 text-green-600 font-bold hover:bg-green-500/20 transition-colors"
                                   >
                                          <PlusCircle size={18} /> Ingreso Manual
                                   </button>
                                   <button
                                          onClick={() => { setShowMoveModal('EXPENSE'); setAmountInput(''); setDescInput('') }}
                                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-600 font-bold hover:bg-red-500/20 transition-colors"
                                   >
                                          <MinusCircle size={18} /> Retio/Gasto
                                   </button>
                            </div>
                     </div>

                     {/* MOVEMENTS LIST */}
                     <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-border/50 bg-secondary/30">
                                   <h3 className="font-bold flex items-center gap-2"><History size={16} /> Últimos Movimientos</h3>
                            </div>
                            <div className="divide-y divide-border/50">
                                   {status.register.transactions.length === 0 ? (
                                          <div className="p-8 text-center text-muted-foreground">Sin movimientos en este turno.</div>
                                   ) : status.register.transactions.map((t: any) => (
                                          <div key={t.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                                 <div className="flex items-center gap-3">
                                                        <div className={cn("p-2 rounded-lg", t.type === 'INCOME' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                                                               {t.type === 'INCOME' ? <PlusCircle size={16} /> : <MinusCircle size={16} />}
                                                        </div>
                                                        <div>
                                                               <p className="font-bold text-sm">{t.description || 'Sin descripción'}</p>
                                                               <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                                      <span>{format(new Date(t.createdAt), 'HH:mm')}</span>
                                                                      <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] uppercase">{t.method}</span>
                                                                      <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] uppercase">{t.category}</span>
                                                               </p>
                                                        </div>
                                                 </div>
                                                 <span className={cn("font-bold font-mono", t.type === 'INCOME' ? "text-green-500" : "text-red-500")}>
                                                        {t.type === 'INCOME' ? '+' : '-'}${t.amount}
                                                 </span>
                                          </div>
                                   ))}
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

              </div>
       )
}
