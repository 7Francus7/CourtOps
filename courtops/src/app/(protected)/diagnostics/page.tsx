'use client'

import { useState, useEffect } from 'react'
import { runDiagnostics } from '@/actions/diagnostics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
                     <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse">Escaneando sistema en producción...</p>
                     </div>
              )
       }

       const StatusBadge = ({ status }: { status: string }) => {
              if (status === 'OK' || status === 'FOUND') return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">OPERATIVO</Badge>
              return <Badge variant="destructive">{status}</Badge>
       }

       return (
              <div className="p-6 max-w-4xl mx-auto space-y-6">
                     <div className="flex items-center justify-between">
                            <div>
                                   <h1 className="text-3xl font-bold tracking-tight">Diagnóstico del Sistema</h1>
                                   <p className="text-muted-foreground">Herramienta interna para localizar errores 500.</p>
                            </div>
                            <Button onClick={run} disabled={loading}>
                                   <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                   Volver a Escanear
                            </Button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* DATABASE */}
                            <Card>
                                   <CardHeader className="pb-2">
                                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                 <Database className="w-4 h-4" /> Base de Datos
                                          </CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                          <div className="flex items-center justify-between">
                                                 <span className="text-2xl font-bold">PostgreSQL</span>
                                                 <StatusBadge status={report.database.status} />
                                          </div>
                                          {report.database.error && (
                                                 <p className="mt-2 text-xs text-red-500 bg-red-500/10 p-2 rounded">
                                                        {report.database.error}
                                                 </p>
                                          )}
                                          <div className="mt-2 text-xs text-muted-foreground">
                                                 URL Configurada: {report.env.hasDbUrl ? '✅ Sí' : '❌ No'}
                                          </div>
                                   </CardContent>
                            </Card>

                            {/* SESSION */}
                            <Card>
                                   <CardHeader className="pb-2">
                                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                 <ShieldCheck className="w-4 h-4" /> Sesión (Auth)
                                          </CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                          <div className="flex items-center justify-between">
                                                 <span className="text-2xl font-bold">NextAuth</span>
                                                 <StatusBadge status={report.session.status} />
                                          </div>
                                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                                 <p>Usuario: {report.session.data?.user || 'N/A'}</p>
                                                 <p>Club ID: <span className="font-mono">{report.session.data?.clubId || 'N/A'}</span></p>
                                                 <p>Rol: {report.session.data?.role || 'N/A'}</p>
                                          </div>
                                   </CardContent>
                            </Card>

                            {/* CLUB INFO */}
                            <Card className="md:col-span-2">
                                   <CardHeader className="pb-2">
                                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                 <Trophy className="w-4 h-4" /> Estado del Club & Canchas
                                          </CardTitle>
                                   </CardHeader>
                                   <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                          <div className="space-y-1">
                                                 <p className="text-sm text-muted-foreground">Estado Club</p>
                                                 <p className="text-xl font-semibold">{report.club.status}</p>
                                                 <p className="text-[10px] text-muted-foreground font-mono truncate">{report.club.id}</p>
                                          </div>
                                          <div className="space-y-1">
                                                 <p className="text-sm text-muted-foreground">Canchas Activas</p>
                                                 <p className={`text-xl font-semibold ${report.courts.count === 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                        {report.courts.count}
                                                 </p>
                                                 <p className="text-[10px] text-muted-foreground">Configuradas en la base</p>
                                          </div>
                                          <div className="space-y-1">
                                                 <p className="text-sm text-muted-foreground">Estadísticas/Docs</p>
                                                 <div className="flex flex-wrap gap-1 mt-1">
                                                        <Badge variant="outline">Reservas: {report.club.raw?._count?.bookings || 0}</Badge>
                                                        <Badge variant="outline">Productos: {report.club.raw?._count?.products || 0}</Badge>
                                                 </div>
                                          </div>
                                   </CardContent>
                            </Card>
                     </div>

                     <Card className="bg-black/5 dark:bg-white/5 border-dashed">
                            <CardHeader>
                                   <CardTitle className="text-sm font-mono flex items-center gap-2">
                                          Raw JSON Report
                                   </CardTitle>
                            </CardHeader>
                            <CardContent>
                                   <pre className="text-[10px] bg-black text-green-400 p-4 rounded overflow-auto max-h-[300px]">
                                          {JSON.stringify(report, null, 2)}
                                   </pre>
                            </CardContent>
                     </Card>
              </div>
       )
}
