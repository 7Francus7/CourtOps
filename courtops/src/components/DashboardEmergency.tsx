'use client'

import { useState } from 'react'
import { Calendar, Users, DollarSign, AlertCircle } from 'lucide-react'

export default function DashboardEmergency({ 
       user,
       clubName 
}: {
       user: any
       clubName: string
}) {
       const [selectedDate] = useState(new Date())

       return (
              <div className="min-h-screen bg-background">
                     {/* Header */}
                     <div className="border-b border-border bg-card p-6">
                            <div className="flex justify-between items-center">
                                   <div>
                                          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                                          <p className="text-muted-foreground">{clubName}</p>
                                   </div>
                                   <div className="text-right">
                                          <p className="font-medium text-foreground">{user?.name}</p>
                                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                                   </div>
                            </div>
                     </div>

                     {/* Main Content */}
                     <div className="p-6">
                            {/* Alert */}
                            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
                                   <AlertCircle className="text-amber-500 flex-shrink-0" />
                                   <div>
                                          <p className="font-semibold text-amber-700">Modo de Emergencia</p>
                                          <p className="text-sm text-amber-600">El dashboard está funcionando en modo simplificado mientras resolvemos algunos problemas técnicos.</p>
                                   </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                   <div className="bg-card border border-border rounded-lg p-6">
                                          <div className="flex items-center gap-4">
                                                 <div className="bg-blue-500/10 p-3 rounded-lg">
                                                        <Calendar className="text-blue-500" size={24} />
                                                 </div>
                                                 <div>
                                                        <p className="text-sm text-muted-foreground">Hoy</p>
                                                        <p className="text-2xl font-bold text-foreground">-</p>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="bg-card border border-border rounded-lg p-6">
                                          <div className="flex items-center gap-4">
                                                 <div className="bg-green-500/10 p-3 rounded-lg">
                                                        <Users className="text-green-500" size={24} />
                                                 </div>
                                                 <div>
                                                        <p className="text-sm text-muted-foreground">Clientes</p>
                                                        <p className="text-2xl font-bold text-foreground">-</p>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="bg-card border border-border rounded-lg p-6">
                                          <div className="flex items-center gap-4">
                                                 <div className="bg-purple-500/10 p-3 rounded-lg">
                                                        <DollarSign className="text-purple-500" size={24} />
                                                 </div>
                                                 <div>
                                                        <p className="text-sm text-muted-foreground">Ingresos Hoy</p>
                                                        <p className="text-2xl font-bold text-foreground">$0</p>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="bg-card border border-border rounded-lg p-6">
                                          <div className="flex items-center gap-4">
                                                 <div className="bg-orange-500/10 p-3 rounded-lg">
                                                        <Calendar className="text-orange-500" size={24} />
                                                 </div>
                                                 <div>
                                                        <p className="text-sm text-muted-foreground">Reservas</p>
                                                        <p className="text-2xl font-bold text-foreground">0</p>
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {/* Main Section */}
                            <div className="bg-card border border-border rounded-lg p-6">
                                   <h2 className="text-xl font-bold text-foreground mb-4">Horario - {selectedDate.toLocaleDateString('es-AR')}</h2>
                                   <div className="h-96 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                                          <div className="text-center">
                                                 <p className="text-muted-foreground mb-2">Cargando datos...</p>
                                                 <div className="flex justify-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 text-center text-sm text-muted-foreground">
                                   <p>Dashboard en modo de emergencia - Actualizando sistemas</p>
                            </div>
                     </div>
              </div>
       )
}
