import { getAllClubs, getPlatformPlans, getGodModeStats, getSystemNotifications } from '@/actions/super-admin'
import CreateClubForm from '@/components/super-admin/CreateClubForm'
import ClubList from '@/components/super-admin/ClubList'
import DiagnosticTool from '@/components/super-admin/DiagnosticTool'
import BroadcastForm from '@/components/super-admin/BroadcastForm'
import PlanManager from '@/components/super-admin/PlanManager'
import GodModeTutorial from '@/components/super-admin/GodModeTutorial'
import { DatabaseZap, Users, Calendar, TrendingUp, Sparkles, Plus } from 'lucide-react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

function StatCard({ title, value, subtext, icon: Icon, trend }: { title: string, value: string | number, subtext: string, icon: any, trend?: string }) {
       return (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all rounded-2xl p-5 relative overflow-hidden group shadow-sm md:shadow-md">
                     <div className="absolute top-0 right-0 p-3 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                            <Icon size={48} className="text-emerald-500" />
                     </div>
                     <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                   <Icon size={16} />
                            </div>
                            <h3 className="text-slate-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">{title}</h3>
                     </div>
                     <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{value}</div>
                     <div className="flex items-center justify-between mt-2">
                            <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-tighter">{subtext}</div>
                            {trend && <div className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">{trend}</div>}
                     </div>
              </div>
       )
}

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
              <div className="space-y-8 pt-6">
                     {/* Welcome Header */}
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-600/10 to-emerald-500/10 border border-purple-500/20 p-6 rounded-3xl backdrop-blur-sm">
                            <div>
                                   <div className="flex items-center gap-2 mb-1">
                                          <Sparkles size={16} className="text-purple-500 animate-pulse" />
                                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Nivel Dios Activado</span>
                                   </div>
                                   <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Panel de Control Omni</h1>
                                   <p className="text-slate-600 dark:text-zinc-400 text-sm max-w-xl">Supervisa el ecosistema CourtOps, gestiona suscripciones y despliega nuevos tenants en tiempo real.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                   <div className="text-right hidden sm:block">
                                          <p className="text-xs font-bold text-slate-400">Total Recaudado MRR</p>
                                          <p className="text-xl font-black text-emerald-600">{formatCurrency(stats.mrr)}</p>
                                   </div>
                            </div>
                     </div>

                     {/* Top Stats */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                   title="Suscripciones"
                                   value={stats.activeClubs}
                                   subtext={`${stats.totalClubs} clubes totales`}
                                   icon={TrendingUp}
                                   trend={`${Math.round((stats.activeClubs / stats.totalClubs) * 100)}% ratio`}
                            />
                            <StatCard
                                   title="Usuarios Totales"
                                   value={stats.totalUsers}
                                   subtext="Admins y Empleados"
                                   icon={Users}
                            />
                            <StatCard
                                   title="Reservas Hoy"
                                   value={stats.bookingsToday}
                                   subtext={`${stats.totalBookings} históricas`}
                                   icon={Calendar}
                                   trend="Live"
                            />
                            <StatCard
                                   title="Features Activas"
                                   value={plans.length}
                                   subtext="Planes comerciales"
                                   icon={DatabaseZap}
                            />
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Columna Izquierda (40%) */}
                            <div className="lg:col-span-5 space-y-8">
                                   <section className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-xl relative overflow-hidden">
                                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>

                                          <div className="flex items-center justify-between mb-6">
                                                 <h2 className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                                               <Plus size={18} />
                                                        </div>
                                                        Crear Nuevo Club
                                                 </h2>
                                          </div>

                                          <p className="text-slate-600 dark:text-zinc-400 mb-6 text-sm">
                                                 Sincroniza un nuevo tenant con base de datos, canchas y usuario administrador.
                                          </p>

                                          <CreateClubForm plans={plans} />
                                          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                                 <DiagnosticTool />
                                          </div>
                                   </section>

                                   <BroadcastForm notifications={notifications} />
                                   <PlanManager plans={plans} />
                            </div>

                            {/* Columna Derecha (60%) */}
                            <div className="lg:col-span-7 space-y-6">
                                   <div className="flex items-center justify-between px-2">
                                          <h2 className="text-xl font-bold text-slate-900 dark:text-white/80 uppercase tracking-widest flex items-center gap-3">
                                                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                 Clubes Activos ({clubs.length})
                                          </h2>
                                          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                                                 v4.0.0
                                          </div>
                                   </div>

                                   {clubs.length === 0 ? (
                                          <div className="p-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-slate-400 dark:text-zinc-500 text-center flex flex-col items-center gap-4">
                                                 <DatabaseZap size={48} className="opacity-20" />
                                                 <p className="font-medium">No hay clubes registrados todavía.</p>
                                                 <div className="text-xs text-slate-300 dark:text-white/5 uppercase font-bold tracking-[0.3em]">Debug System Ready</div>
                                          </div>
                                   ) : (
                                          <ClubList clubs={clubs as any} />
                                   )}
                            </div>
                     </div>

                     <div className="pt-12">
                            <GodModeTutorial />
                     </div>
              </div>
       )
}
