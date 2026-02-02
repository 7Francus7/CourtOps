'use client'

import { useState, useEffect } from 'react'
import { runDiagnostics } from '@/actions/diagnostics'
import { RefreshCw, CheckCircle2, XCircle, Database, ShieldCheck, Trophy } from 'lucide-react'

export default function DiagnosticsPage() {
       const [report, setReport] = useState<any>(null)
       const [loading, setLoading] = useState(true)

       async function run() {
              setLoading(true)
              try {
                     const data = await runDiagnostics()
                     setReport(data)
              } catch (e) {
                     console.error(e)
              }
              setLoading(false)
       }

       useEffect(() => {
              run()
       }, [])

       if (loading) {
              return (
                     <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
                            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse font-medium">Escaneando sistema en producción...</p>
                     </div>
              )
       }

       const StatusBadge = ({ status }: { status: string }) => {
              const isOk = status === 'OK' || status === 'FOUND'
              return (
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOk ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'
                            }`}>
                            {isOk ? 'OPERATIVO' : status}
                     </span>
              )
       }

       return (
              <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
                     <div className="max-w-4xl mx-auto space-y-8">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                                   <div>
                                          <h1 className="text-4xl font-extrabold tracking-tight">Diagnóstico Vital</h1>
                                          <p className="text-muted-foreground mt-1">Localizador de errores 500 y salud del servidor.</p>
                                   </div>
                                   <button
                                          onClick={run}
                                          disabled={loading}
                                          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
                                   >
                                          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                          Re-Escanear
                                   </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   {/* DATABASE CARD */}
                                   <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                          <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                                 <Database className="w-4 h-4" />
                                                 <span className="text-xs font-bold uppercase tracking-widest">Base de Datos</span>
                                          </div>
                                          <div className="flex items-center justify-between mb-4">
                                                 <span className="text-2xl font-bold">PostgreSQL</span>
                                                 <StatusBadge status={report.database.status} />
                                          </div>
                                          {report.database.error && (
                                                 <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4">
                                                        <p className="text-xs text-red-500 font-mono break-all">{report.database.error}</p>
                                                 </div>
                                          )}
                                          <div className="text-xs space-y-1 text-muted-foreground">
                                                 <p>URL Configurada: <span className={report.env.hasDbUrl ? "text-green-500" : "text-red-500"}>{report.env.hasDbUrl ? 'SÍ' : 'NO'}</span></p>
                                                 <p>Entorno: <span className="font-mono uppercase">{report.env.nodeEnv}</span></p>
                                          </div>
                                   </div>

                                   {/* AUTH CARD */}
                                   <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                          <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                                 <ShieldCheck className="w-4 h-4" />
                                                 <span className="text-xs font-bold uppercase tracking-widest">Sesión de Usuario</span>
                                          </div>
                                          <div className="flex items-center justify-between mb-4">
                                                 <span className="text-2xl font-bold">NextAuth</span>
                                                 <StatusBadge status={report.session.status} />
                                          </div>
                                          <div className="text-sm space-y-2">
                                                 <div className="flex justify-between border-b border-border/50 pb-1">
                                                        <span className="text-muted-foreground text-xs">Email:</span>
                                                        <span className="font-medium text-xs">{report.session.data?.user || '---'}</span>
                                                 </div>
                                                 <div className="flex justify-between border-b border-border/50 pb-1">
                                                        <span className="text-muted-foreground text-xs">Club ID:</span>
                                                        <span className="font-mono text-[10px] bg-muted px-1 rounded">{report.session.data?.clubId || 'NONE'}</span>
                                                 </div>
                                                 <div className="flex justify-between border-b border-border/50 pb-1">
                                                        <span className="text-muted-foreground text-xs">Rol:</span>
                                                        <span className="font-bold text-xs text-primary">{report.session.data?.role || '---'}</span>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* CLUB SUMMARY CARD */}
                                   <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
                                          <div className="flex items-center gap-2 text-muted-foreground mb-6">
                                                 <Trophy className="w-4 h-4" />
                                                 <span className="text-xs font-bold uppercase tracking-widest">Estado del Negocio (Prisma)</span>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                                 <div className="space-y-1">
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Estado Club</p>
                                                        <p className={`text-xl font-black ${report.club.status === 'FOUND' ? 'text-green-500' : 'text-red-500'}`}>{report.club.status}</p>
                                                        <p className="text-[9px] font-mono text-muted-foreground opacity-60">Encontrado por clubId</p>
                                                 </div>
                                                 <div className="space-y-1 border-l border-border pl-6">
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Canchas Activas</p>
                                                        <p className={`text-3xl font-black ${report.courts.count > 0 ? 'text-primary' : 'text-red-500'}`}>{report.courts.count}</p>
                                                        <p className="text-[9px] text-muted-foreground">En tabla "Court"</p>
                                                 </div>
                                                 <div className="space-y-1 border-l border-border pl-6">
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Data Relacionada</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                               <span className="bg-muted px-2 py-1 rounded text-[10px] font-bold">Reservas: {report.club.raw?._count?.bookings || 0}</span>
                                                               <span className="bg-muted px-2 py-1 rounded text-[10px] font-bold">Prod: {report.club.raw?._count?.products || 0}</span>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {/* RAW LOGS */}
                            <div className="bg-black rounded-xl p-4 shadow-2xl border border-white/10">
                                   <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                                          <span className="text-white font-mono text-xs flex items-center gap-2">
                                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                 SERVER_RAW_PAYLOAD.json
                                          </span>
                                          <span className="text-white/40 text-[10px] font-mono">{report.timestamp}</span>
                                   </div>
                                   <pre className="text-[10px] text-green-400 font-mono overflow-auto max-h-[400px] leading-relaxed">
                                          {JSON.stringify(report, null, 2)}
                                   </pre>
                            </div>
                     </div>
              </div>
       )
}
