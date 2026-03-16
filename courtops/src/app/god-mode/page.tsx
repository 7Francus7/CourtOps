import { getAllClubs, getPlatformPlans, getGodModeStats, getSystemNotifications } from '@/actions/super-admin'
import CreateClubForm from '@/components/super-admin/CreateClubForm'
import ClubList from '@/components/super-admin/ClubList'
import DiagnosticTool from '@/components/super-admin/DiagnosticTool'
import BroadcastForm from '@/components/super-admin/BroadcastForm'
import PlanManager from '@/components/super-admin/PlanManager'
import GodModeTutorial from '@/components/super-admin/GodModeTutorial'
import SqlExplorer from '@/components/super-admin/SqlExplorer'
import { DatabaseZap, Users, Calendar, TrendingUp, Sparkles, Plus, DollarSign, Activity, Building2, CreditCard } from 'lucide-react'
import { getServerSession } from "next-auth"
import { authOptions, isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"

function StatCard({ title, value, subtext, icon: Icon, trend, color = 'emerald' }: {
       title: string
       value: string | number
       subtext: string
       icon: React.ElementType
       trend?: string
       color?: 'emerald' | 'blue' | 'amber' | 'purple' | 'red'
}) {
       const colors = {
              emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: 'text-emerald-500', trend: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
              blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-500', trend: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
              amber: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', icon: 'text-amber-500', trend: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
              purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-500', trend: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
              red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500', trend: 'bg-red-500/10 text-red-600 dark:text-red-400' },
       }
       const c = colors[color]

       return (
              <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all rounded-2xl p-5 relative overflow-hidden group shadow-sm">
                     <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
                                   <Icon size={18} className={c.icon} />
                            </div>
                            {trend && <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${c.trend}`}>{trend}</span>}
                     </div>
                     <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</div>
                     <div className="flex items-center justify-between mt-1.5">
                            <h3 className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest">{title}</h3>
                     </div>
                     <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-medium mt-0.5">{subtext}</p>
              </div>
       )
}

export default async function GodModePage() {
       const session = await getServerSession(authOptions)

       if (!session?.user || !isSuperAdmin(session.user)) {
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

       const trialClubs = clubs.filter((c: any) => c.subscriptionStatus === 'TRIAL' || c.subscriptionStatus === 'pending').length
       const activeClubs = clubs.filter((c: any) => c.subscriptionStatus === 'authorized').length

       return (
              <div className="space-y-6 pt-4">
                     {/* Hero Banner */}
                     <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950/50 border border-white/5 rounded-3xl p-6 md:p-8 overflow-hidden">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                   <div>
                                          <div className="flex items-center gap-2 mb-3">
                                                 <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                                        <Sparkles size={16} className="text-white" />
                                                 </div>
                                                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Super Admin Panel</span>
                                          </div>
                                          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Panel de Control</h1>
                                          <p className="text-zinc-400 text-sm mt-1 max-w-md">Gestiona todos los clubes, planes y suscripciones de la plataforma CourtOps.</p>
                                   </div>

                                   {/* MRR Card */}
                                   <div className="flex gap-4">
                                          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
                                                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">MRR</p>
                                                 <p className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">{formatCurrency(stats.mrr)}</p>
                                                 <p className="text-[10px] text-zinc-600 font-medium mt-1">{activeClubs} clubes pagando</p>
                                          </div>
                                          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm hidden sm:block">
                                                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Hoy</p>
                                                 <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{stats.bookingsToday}</p>
                                                 <p className="text-[10px] text-zinc-600 font-medium mt-1">reservas creadas</p>
                                          </div>
                                   </div>
                            </div>
                     </div>

                     {/* Stats Grid */}
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <StatCard
                                   title="Clubes Totales"
                                   value={stats.totalClubs}
                                   subtext={`${activeClubs} activos · ${trialClubs} trial`}
                                   icon={Building2}
                                   color="purple"
                            />
                            <StatCard
                                   title="Suscripciones"
                                   value={activeClubs}
                                   subtext={`${Math.round((activeClubs / Math.max(stats.totalClubs, 1)) * 100)}% conversión`}
                                   icon={CreditCard}
                                   trend={`${activeClubs}/${stats.totalClubs}`}
                                   color="emerald"
                            />
                            <StatCard
                                   title="Usuarios"
                                   value={stats.totalUsers}
                                   subtext="admins + empleados"
                                   icon={Users}
                                   color="blue"
                            />
                            <StatCard
                                   title="Reservas Hoy"
                                   value={stats.bookingsToday}
                                   subtext={`${stats.totalBookings.toLocaleString()} históricas`}
                                   icon={Calendar}
                                   trend="Live"
                                   color="amber"
                            />
                            <StatCard
                                   title="Planes"
                                   value={plans.length}
                                   subtext="planes activos"
                                   icon={Activity}
                                   color="purple"
                            />
                     </div>

                     {/* Main Content */}
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left — Club List (wider) */}
                            <div className="lg:col-span-8 space-y-4">
                                   <div className="flex items-center justify-between">
                                          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                                                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                 Clubes ({clubs.length})
                                          </h2>
                                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">
                                                 v4.1.0
                                          </span>
                                   </div>

                                   {clubs.length === 0 ? (
                                          <div className="p-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-slate-400 dark:text-zinc-500 text-center flex flex-col items-center gap-4">
                                                 <DatabaseZap size={48} className="opacity-20" />
                                                 <p className="font-medium">No hay clubes registrados todavía.</p>
                                          </div>
                                   ) : (
                                          <ClubList clubs={clubs as Parameters<typeof ClubList>[0]['clubs']} />
                                   )}
                            </div>

                            {/* Right — Tools */}
                            <div className="lg:col-span-4 space-y-6">
                                   {/* Create Club */}
                                   <section className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-white/5 p-5 shadow-sm">
                                          <div className="flex items-center gap-2.5 mb-4">
                                                 <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                        <Plus size={16} />
                                                 </div>
                                                 <div>
                                                        <h2 className="text-sm font-black text-slate-900 dark:text-white">Nuevo Club</h2>
                                                        <p className="text-[10px] text-slate-400 dark:text-zinc-500">Desplegar tenant</p>
                                                 </div>
                                          </div>
                                          <CreateClubForm plans={plans} />
                                   </section>

                                   {/* Plan Manager */}
                                   <PlanManager plans={plans} />

                                   {/* Broadcast */}
                                   <BroadcastForm notifications={notifications} />

                                   {/* Diagnostics */}
                                   <section className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-white/5 p-5 shadow-sm">
                                          <DiagnosticTool />
                                   </section>
                            </div>
                     </div>

                     {/* SQL Explorer */}
                     <SqlExplorer />

                     <div className="pt-8">
                            <GodModeTutorial />
                     </div>
              </div>
       )
}
