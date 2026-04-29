import React, { Suspense } from 'react'
import { getSettings, getAuditLogs } from '@/actions/settings'
import { getEmployees } from '@/actions/employees'
import SettingsDashboard from '@/components/config/SettingsDashboard'
import { Header } from '@/components/layout/Header'
import { redirect } from 'next/navigation'

export default async function ConfiguracionPage() {
       const clubRes = await getSettings()

       if (!clubRes.success) {
              console.error("Error loading club settings:", clubRes.error)
              redirect('/dashboard')
       }

       const club = clubRes.data
       const auditLogsRes = await getAuditLogs()
       const auditLogs = auditLogsRes.success ? auditLogsRes.data : []
       const employees = await getEmployees()

       return (
              <div className="flex flex-col h-full bg-background">
                     <Header title="Configuración" backHref="/dashboard" />
                     <div className="flex-1 p-4 md:p-8 min-h-0 overflow-y-auto">
                            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                                   {/* Sub-header / Context */}
                                   <div className="flex items-center justify-between gap-3">
                                          <div className="min-w-0">
                                                 <h2 className="text-base md:text-lg font-bold text-foreground">Administración</h2>
                                                 <p className="text-muted-foreground text-xs md:text-sm">Gestiona horarios, canchas y reglas.</p>
                                          </div>
                                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider truncate max-w-[120px] md:max-w-none shrink-0">
                                                 {club.name}
                                          </span>
                                   </div>

                                   {/* Dashboard - Suspense needed for useSearchParams */}
                                   <div className="min-h-[600px]">
                                          <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
                                                 <SettingsDashboard
                                                        club={club}
                                                        auditLogs={auditLogs}
                                                        initialEmployees={employees}
                                                 />
                                          </Suspense>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}
