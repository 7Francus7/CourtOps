import { getAllClubs, getPlatformPlans, getGodModeStats, getSystemNotifications } from '@/actions/super-admin'
import CreateClubForm from '@/components/super-admin/CreateClubForm'
import ClubList from '@/components/super-admin/ClubList'
import DiagnosticTool from '@/components/super-admin/DiagnosticTool'
import BroadcastForm from '@/components/super-admin/BroadcastForm'
import PlanManager from '@/components/super-admin/PlanManager'
import GodModeTutorial from '@/components/super-admin/GodModeTutorial'
import { DatabaseZap } from 'lucide-react'

function StatCard({ title, value, subtext }: { title: string, value: string | number, subtext: string }) {
       return (
              <div className="bg-zinc-900 border border-white/5 hover:border-amber-500/30 transition-all rounded-xl p-5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <div className="text-4xl font-black">Ω</div>
                     </div>
                     <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{title}</h3>
                     <div className="text-3xl font-black text-white mt-1 tracking-tighter">{value}</div>
                     <div className="text-[10px] text-zinc-600 mt-1 font-bold uppercase tracking-tighter">{subtext}</div>
              </div>
       )
}

import { getServerSession } from "next-auth"
import { authOptions, isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function GodModePage() {
       const session = await getServerSession(authOptions)

       const SUPER_ADMINS = ['dellorsif@gmail.com']
       if (!session?.user || !session.user.email || !SUPER_ADMINS.includes(session.user.email)) {
              redirect('/login')
       }

       const [clubs, plans, stats, notifications] = await Promise.all([
              getAllClubs(),
              getPlatformPlans(),
              getGodModeStats(),
              getSystemNotifications()
       ])

       const formatCurrency = (val: number) =>
              new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val)

       return (
              <div className="space-y-8">
                     {/* Top Stats */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                   title="Suscripciones Activas"
                                   value={stats.activeClubs}
                                   subtext={`de ${stats.totalClubs} clubes totales`}
                            />
                            <StatCard
                                   title="MRR Estimado"
                                   value={formatCurrency(stats.mrr)}
                                   subtext="Ingreso Mensual Recurrente"
                            />
                            <StatCard
                                   title="Total Features"
                                   value={plans.length}
                                   subtext="Planes disponibles"
                            />
                            <StatCard
                                   title="Versión Sistema"
                                   value="v3.5"
                                   subtext="Production Build"
                            />
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Columna Izquierda */}
                            <div className="space-y-6">
                                   <div className="bg-zinc-900 rounded-xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
                                          <div className="absolute top-0 right-0 p-4 opacity-10">
                                                 <DatabaseZap className="w-12 h-12 text-amber-500" />
                                          </div>
                                          <h2 className="text-2xl font-black mb-4 flex items-center gap-2 text-white">
                                                 <span className="text-amber-500 text-3xl font-light">∑</span> Nuevo Club
                                          </h2>
                                          <p className="text-zinc-400 mb-6 text-sm">
                                                 Esto generará todo el entorno tenant: Club, Canchas (2), Usuario Admin y Precios Base.
                                          </p>

                                          <CreateClubForm plans={plans} />
                                          <DiagnosticTool />
                                   </div>

                                   <BroadcastForm notifications={notifications} />
                                   <PlanManager plans={plans} />
                            </div>

                            {/* Columna Derecha: Listado de Clubes */}
                            <div className="space-y-6">
                                   <h2 className="text-xl font-bold text-white/80 uppercase tracking-widest pl-1">
                                          Clubes Activos ({clubs.length})
                                   </h2>
                                   {clubs.length === 0 ? (
                                          <div className="p-8 border border-dashed border-white/10 rounded-xl text-zinc-500 text-center">
                                                 No hay clubes registrados. <br /> Use el formulario para crear el primero.
                                                 <div className="mt-4 text-xs text-white/5 uppercase">v3.3 - Debug Mode</div>
                                          </div>
                                   ) : (
                                          <ClubList clubs={clubs as any} />
                                   )}
                            </div>
                     </div>

                     <GodModeTutorial />
              </div>
       )
}
