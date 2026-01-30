import React from 'react'
import { getSettings, getAuditLogs } from '@/actions/settings'
import { getEmployees } from '@/actions/employees'
import SettingsDashboard from '@/components/config/SettingsDashboard'
import { Header } from '@/components/layout/Header'

export default async function ConfiguracionPage() {
       const club = await getSettings()
       const auditLogs = await getAuditLogs()
       const employees = await getEmployees()

       return (
              <div className="flex flex-col h-full bg-background">
                     <Header title="Configuración" backHref="/dashboard" />
                     <div className="flex-1 p-4 md:p-8 min-h-0 overflow-y-auto">
                            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                                   {/* Sub-header / Context */}
                                   <div className="flex items-center justify-between">
                                          <div>
                                                 <h2 className="text-lg font-bold text-foreground">Administración</h2>
                                                 <p className="text-muted-foreground text-sm">Gestiona horarios, canchas y reglas.</p>
                                          </div>
                                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                 {club.name}
                                          </span>
                                   </div>

                                   {/* Dashboard */}
                                   <div className="min-h-[600px]">
                                          <SettingsDashboard
                                                 club={club}
                                                 auditLogs={auditLogs}
                                                 initialEmployees={employees}
                                          />
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
