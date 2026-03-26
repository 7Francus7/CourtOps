'use client'

import { useState, useEffect } from 'react'
import { Store, Check, Lock, ExternalLink, QrCode, CreditCard, Banknote, Smartphone, Wifi, WifiOff, ChevronDown, Loader2, AlertCircle, CheckCircle2, Unlink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMPOAuthUrl, testMPConnection, disconnectMP } from '@/actions/mercadopago-oauth'
import { toast } from 'sonner'

function InputGroup({ label, children, className }: any) {
       return (
              <div className={cn("space-y-2", className)}>
                     <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block ml-1">{label}</label>
                     {children}
              </div>
       )
}

interface IntegrationsTabProps {
       club: any
       mpForm: any
       setMpForm: (form: any) => void
       isDirty: boolean
       isLoading: boolean
       saveIntegrations: () => void
}

export default function IntegrationsTab({ club, mpForm, setMpForm, isDirty, isLoading, saveIntegrations }: IntegrationsTabProps) {
       const [showAdvanced, setShowAdvanced] = useState(false)
       const [testing, setTesting] = useState(false)
       const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null)
       const [connecting, setConnecting] = useState(false)
       const [disconnecting, setDisconnecting] = useState(false)
       const [oauthMessage, setOauthMessage] = useState<{ status: string; msg: string } | null>(null)

       const isConnected = mpForm.mpAccessToken && mpForm.mpAccessToken.length > 4
       const isOAuthConnected = !!club.mpConnectedAt

       // Check for OAuth callback params on mount
       useEffect(() => {
              const urlParams = new URLSearchParams(window.location.search)
              const mpStatus = urlParams.get('mp_status')
              const mpMsg = urlParams.get('mp_msg')

              if (mpStatus && mpMsg) {
                     setOauthMessage({ status: mpStatus, msg: mpMsg })
                     if (mpStatus === 'success') {
                            toast.success(mpMsg)
                     } else {
                            toast.error(mpMsg)
                     }
                     // Clean URL
                     const clean = new URL(window.location.href)
                     clean.searchParams.delete('mp_status')
                     clean.searchParams.delete('mp_msg')
                     window.history.replaceState({}, '', clean.toString())
              }
       }, [])

       const handleOAuthConnect = async () => {
              setConnecting(true)
              try {
                     const result = await getMPOAuthUrl()
                     if (result.success && result.url) {
                            window.location.href = result.url
                     } else {
                            toast.error(result.error || 'No se pudo generar el enlace de conexión')
                            setConnecting(false)
                     }
              } catch (err) {
                     toast.error('Error al iniciar conexión con MercadoPago')
                     setConnecting(false)
              }
       }

       const handleDisconnect = async () => {
              if (!confirm('¿Desconectar tu cuenta de MercadoPago? Tus clientes no podrán pagar online hasta que la reconectes.')) return
              setDisconnecting(true)
              try {
                     await disconnectMP()
                     toast.success('MercadoPago desconectado')
                     window.location.reload()
              } catch {
                     toast.error('Error al desconectar')
              } finally {
                     setDisconnecting(false)
              }
       }

       const handleTest = async () => {
              setTesting(true)
              setTestResult(null)
              try {
                     const result = await testMPConnection()
                     setTestResult(result)
                     if (result.success) {
                            toast.success(`✅ Conexión verificada: ${result.data?.email || result.data?.nickname}`)
                     } else {
                            toast.error(result.error || 'Test fallido')
                     }
              } catch {
                     setTestResult({ success: false, error: 'Error al verificar la conexión' })
              } finally {
                     setTesting(false)
              }
       }

       return (
              <div className="max-w-2xl space-y-6 sm:space-y-8">

                     {/* Métodos de pago aceptados */}
                     <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                   <div className="p-2 rounded-xl bg-primary/10">
                                          <CreditCard size={18} className="text-primary" />
                                   </div>
                                   <div>
                                          <h3 className="text-sm font-black text-foreground">Métodos de Pago</h3>
                                          <p className="text-[10px] text-muted-foreground">Medios habilitados para cobrar a tus clientes</p>
                                   </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                   {[
                                          { icon: <Banknote size={20} />, label: 'Efectivo', desc: 'En caja', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                          { icon: <QrCode size={20} />, label: 'Transferencia', desc: 'CBU / Alias', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                          { icon: <CreditCard size={20} />, label: 'Tarjeta', desc: 'Débito / Crédito', color: 'text-violet-500', bg: 'bg-violet-500/10' },
                                          { icon: <Store size={20} />, label: 'Mercado Pago', desc: 'Online', color: 'text-sky-500', bg: 'bg-sky-500/10' },
                                   ].map(m => (
                                          <div key={m.label} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 bg-card/60">
                                                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", m.bg, m.color)}>
                                                        {m.icon}
                                                 </div>
                                                 <span className="text-[11px] font-black text-foreground">{m.label}</span>
                                                 <span className="text-[9px] text-muted-foreground">{m.desc}</span>
                                          </div>
                                   ))}
                            </div>
                     </div>

                     {/* MercadoPago — OAuth Connect */}
                     <div className="bg-card/40 backdrop-blur-xl p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-border/50 shadow-xl relative overflow-hidden space-y-6">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                            {/* Header */}
                            <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
                                                 <Store size={20} className="text-sky-500" />
                                          </div>
                                          <div>
                                                 <h4 className="text-sm font-black text-foreground">Mercado Pago</h4>
                                                 <p className="text-[10px] text-muted-foreground">Cobros automáticos de señas y saldos</p>
                                          </div>
                                   </div>
                                   <div className={cn(
                                          "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                          isConnected
                                                 ? "bg-emerald-500/15 text-emerald-500"
                                                 : "bg-muted/50 text-muted-foreground"
                                   )}>
                                          {isConnected
                                                 ? <><Check size={10} strokeWidth={3} /> Conectado</>
                                                 : <><Lock size={10} /> Sin configurar</>
                                          }
                                   </div>
                            </div>

                            {/* Connection Status / OAuth Button */}
                            {isConnected ? (
                                   // Connected state
                                   <div className="space-y-4">
                                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                                                 <div className="flex items-center gap-2 text-emerald-500">
                                                        <Wifi size={16} />
                                                        <span className="text-xs font-black uppercase tracking-wider">Cuenta Conectada</span>
                                                 </div>
                                                 {isOAuthConnected && (
                                                        <p className="text-[10px] text-muted-foreground">
                                                               Conectado vía OAuth el {new Date(club.mpConnectedAt).toLocaleDateString('es-AR')}
                                                        </p>
                                                 )}
                                                 {testResult?.success && testResult.data && (
                                                        <div className="text-[10px] text-muted-foreground space-y-1 pt-2 border-t border-emerald-500/10">
                                                               <p><span className="font-bold text-foreground">Email:</span> {testResult.data.email}</p>
                                                               <p><span className="font-bold text-foreground">Nombre:</span> {testResult.data.firstName} {testResult.data.lastName}</p>
                                                               <p><span className="font-bold text-foreground">MP User:</span> {testResult.data.userId}</p>
                                                        </div>
                                                 )}
                                                 {testResult?.success === false && (
                                                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                                               <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                                               <p className="text-[10px] text-red-400">{testResult.error}</p>
                                                        </div>
                                                 )}
                                          </div>

                                          <div className="flex gap-3">
                                                 <button
                                                        onClick={handleTest}
                                                        disabled={testing}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border/50 text-xs font-bold text-foreground bg-card hover:bg-muted/50 transition-all disabled:opacity-50"
                                                 >
                                                        {testing ? (
                                                               <><Loader2 size={14} className="animate-spin" /> Verificando...</>
                                                        ) : (
                                                               <><Wifi size={14} /> Verificar Conexión</>
                                                        )}
                                                 </button>
                                                 <button
                                                        onClick={handleDisconnect}
                                                        disabled={disconnecting}
                                                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                                                 >
                                                        {disconnecting ? (
                                                               <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                               <><Unlink size={14} /> Desconectar</>
                                                        )}
                                                 </button>
                                          </div>
                                   </div>
                            ) : (
                                   // Not connected — show OAuth connect
                                   <div className="space-y-5">
                                          <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-5 space-y-3">
                                                 <div className="flex items-center gap-2 text-sky-500">
                                                        <WifiOff size={16} />
                                                        <span className="text-xs font-black uppercase tracking-wider">Sin Conectar</span>
                                                 </div>
                                                 <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                        Conectá tu cuenta de MercadoPago con <strong className="text-foreground">1 click</strong> para recibir pagos automáticos de señas y reservas online.
                                                 </p>
                                          </div>

                                          {/* OAuth Connect Button */}
                                          <button
                                                 onClick={handleOAuthConnect}
                                                 disabled={connecting}
                                                 className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#009ee3] hover:bg-[#0084c2] text-white font-black text-sm shadow-lg shadow-sky-600/20 transition-all active:scale-[0.98] disabled:opacity-60"
                                          >
                                                 {connecting ? (
                                                        <><Loader2 size={18} className="animate-spin" /> Redirigiendo a MercadoPago...</>
                                                 ) : (
                                                        <>
                                                               <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                      <path d="M12 2L13.5 7.5H19L14.5 10.5L16 16L12 13L8 16L9.5 10.5L5 7.5H10.5L12 2Z" fill="white" />
                                                               </svg>
                                                               Conectar con MercadoPago
                                                        </>
                                                 )}
                                          </button>

                                          {/* Fallback: Manual Token */}
                                          <div className="pt-2">
                                                 <button
                                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                                        className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors w-full"
                                                 >
                                                        <ChevronDown size={12} className={cn("transition-transform", showAdvanced && "rotate-180")} />
                                                        Modo Avanzado (Token Manual)
                                                 </button>

                                                 {showAdvanced && (
                                                        <div className="mt-4 space-y-4 p-4 rounded-xl bg-muted/30 border border-border/30">
                                                               <p className="text-[10px] text-muted-foreground">
                                                                      Si preferís, podés ingresar tu Access Token manualmente desde el
                                                                      panel de desarrolladores de MercadoPago.
                                                               </p>
                                                               <InputGroup label="Access Token (Producción)">
                                                                      <input
                                                                             type="password"
                                                                             className="input-theme text-xs tracking-tighter"
                                                                             value={mpForm.mpAccessToken}
                                                                             onChange={e => setMpForm({ ...mpForm, mpAccessToken: e.target.value })}
                                                                             placeholder="APP_USR-..."
                                                                      />
                                                               </InputGroup>
                                                               <InputGroup label="Public Key (Opcional)">
                                                                      <input
                                                                             className="input-theme text-xs tracking-tighter"
                                                                             value={mpForm.mpPublicKey}
                                                                             onChange={e => setMpForm({ ...mpForm, mpPublicKey: e.target.value })}
                                                                             placeholder="APP_USR-..."
                                                                      />
                                                               </InputGroup>
                                                               <a
                                                                      href="https://www.mercadopago.com.ar/developers/panel/app"
                                                                      target="_blank"
                                                                      rel="noopener noreferrer"
                                                                      className="flex items-center gap-2 text-[10px] font-bold text-sky-500 hover:text-sky-400 transition-colors"
                                                               >
                                                                      <ExternalLink size={12} /> Obtener credenciales en Mercado Pago Developers
                                                               </a>
                                                        </div>
                                                 )}
                                          </div>
                                   </div>
                            )}
                     </div>

                     {/* Transferencia Directa */}
                     <div className="bg-card/40 backdrop-blur-xl p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-border/50 shadow-xl relative overflow-hidden space-y-5">
                            <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                                          <QrCode size={20} className="text-blue-500" />
                                   </div>
                                   <div>
                                          <h4 className="text-sm font-black text-foreground">Transferencia Directa</h4>
                                          <p className="text-[10px] text-muted-foreground">Datos para que tus clientes paguen por transferencia</p>
                                   </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   <InputGroup label="Alias">
                                          <input className="input-theme" value={mpForm.mpAlias} onChange={e => setMpForm({ ...mpForm, mpAlias: e.target.value })} placeholder="mi.club.padel" />
                                   </InputGroup>
                                   <InputGroup label="CVU">
                                          <input className="input-theme" value={mpForm.mpCvu} onChange={e => setMpForm({ ...mpForm, mpCvu: e.target.value })} placeholder="000000..." />
                                   </InputGroup>
                            </div>
                     </div>

                     {/* Seña por turno */}
                     <div className="bg-card/40 backdrop-blur-xl p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-border/50 shadow-xl space-y-3">
                            <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                                          <Banknote size={20} className="text-emerald-500" />
                                   </div>
                                   <div>
                                          <h4 className="text-sm font-black text-foreground">Seña por Turno</h4>
                                          <p className="text-[10px] text-muted-foreground">Monto fijo a cobrar como anticipo al reservar online</p>
                                   </div>
                            </div>
                            <div className="flex items-center gap-4">
                                   <input
                                          type="number"
                                          className="input-theme text-lg font-black text-emerald-500 text-center w-36"
                                          value={mpForm.bookingDeposit}
                                          onChange={e => setMpForm({ ...mpForm, bookingDeposit: Number(e.target.value) })}
                                   />
                                   <p className="text-[10px] text-muted-foreground font-medium flex-1">Si es <span className="font-black text-foreground">$0</span>, se cobra el total de la reserva.</p>
                            </div>
                     </div>

                     {/* Próximamente */}
                     <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest ml-1">Próximamente</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                   <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-border/40 opacity-50">
                                          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                 <Smartphone size={18} className="text-purple-400" />
                                          </div>
                                          <div>
                                                 <span className="text-xs font-bold text-foreground/60">MODO</span>
                                                 <p className="text-[9px] text-muted-foreground">Pagos QR desde cualquier banco</p>
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-border/40 opacity-50">
                                          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                                 <CreditCard size={18} className="text-orange-400" />
                                          </div>
                                          <div>
                                                 <span className="text-xs font-bold text-foreground/60">Payway</span>
                                                 <p className="text-[9px] text-muted-foreground">POS y pagos presenciales</p>
                                          </div>
                                   </div>
                            </div>
                     </div>

                     {/* Guardar */}
                     <div className="pt-4 space-y-2">
                            {isDirty && (
                                   <p className="text-xs text-amber-500 font-bold text-center flex items-center justify-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                                          Cambios sin guardar
                                   </p>
                            )}
                            <button onClick={saveIntegrations} disabled={isLoading} className="btn-primary w-full h-12">
                                   {isLoading ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN DE PAGO'}
                            </button>
                     </div>
              </div>
       )
}
