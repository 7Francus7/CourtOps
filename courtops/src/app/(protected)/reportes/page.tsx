'use client'

import { useQuery } from '@tanstack/react-query'
import React, { useState, useMemo } from 'react'
import {
       getFinancialStats,
       getOccupancyByCourt,
       getReportTransactions,
       getDashboardKPIs,
       getBestClient,
       getPaymentMethodStats,
       getDailyRevenueStats,
       getMembershipRetentionStats,
       getClientActivityStats
} from '@/actions/reports'
import { cn } from '@/lib/utils'
import {
       Download,
       Banknote,
       Users,
       Ticket,
       ArrowUpRight,
       ArrowDownRight,
       BarChart3,
       Activity,
       ChevronLeft,
       ChevronRight,
       Calendar,
       TrendingUp,
       TrendingDown,
       Scale,
       AlertCircle,
       ArrowDownLeft,
       ArrowUpLeft,
       Crown,
       UserCheck,
       UserX,
       Clock
} from 'lucide-react'
import {
       startOfDay, endOfDay, startOfWeek, endOfWeek,
       startOfMonth, endOfMonth, startOfYear, endOfYear,
       subDays, subWeeks, subMonths, subYears,
       addDays, addWeeks, addMonths, addYears,
       format, isAfter
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
       BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
       PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts'
import { Header } from '@/components/layout/Header'
import { useLanguage } from '@/contexts/LanguageContext'

type PeriodType = 'day' | 'week' | 'month' | 'year'

const BRAND_GREEN = '#B4EB18'
const COLOR_PALETTE = ['#B4EB18', '#0078F0', '#A855F7', '#F59E0B', '#EF4444', '#14B8A6']

export default function ReportsPage() {
       const { t } = useLanguage()
       const [periodType, setPeriodType] = useState<PeriodType>('month')
       const [currentDate, setCurrentDate] = useState(new Date())

       const getDateRange = () => {
              const now = currentDate
              switch (periodType) {
                     case 'day': return { start: startOfDay(now), end: endOfDay(now) }
                     case 'week': return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
                     case 'month': return { start: startOfMonth(now), end: endOfMonth(now) }
                     case 'year': return { start: startOfYear(now), end: endOfYear(now) }
              }
              return { start: startOfDay(now), end: endOfDay(now) }
       }

       const getPrevDateRange = (start: Date, end: Date) => {
              switch (periodType) {
                     case 'day': return { start: subDays(start, 1), end: subDays(end, 1) }
                     case 'week': return { start: subWeeks(start, 1), end: subWeeks(end, 1) }
                     case 'month': return { start: subMonths(start, 1), end: subMonths(end, 1) }
                     case 'year': return { start: subYears(start, 1), end: subYears(end, 1) }
              }
              return { start, end }
       }

       const { start, end } = getDateRange()

       // #22 - Determine if navigating forward would go past today
       const isForwardDisabled = useMemo(() => {
              const today = new Date()
              switch (periodType) {
                     case 'day': return isAfter(startOfDay(addDays(currentDate, 1)), startOfDay(today))
                     case 'week': return isAfter(startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 }), startOfWeek(today, { weekStartsOn: 1 }))
                     case 'month': return isAfter(startOfMonth(addMonths(currentDate, 1)), startOfMonth(today))
                     case 'year': return isAfter(startOfYear(addYears(currentDate, 1)), startOfYear(today))
              }
              return false
       }, [periodType, currentDate])

       const { data, isLoading: loading, error } = useQuery({
              queryKey: ['reports', periodType, currentDate.toISOString()],
              queryFn: async () => {
                     const prevRange = getPrevDateRange(start, end)
                     const [kpis, finances, occupancyByCourt, transactions, bestClient, paymentMethods, dailyRevenue, membershipRetention, clientActivity] = await Promise.all([
                            getDashboardKPIs(start, end, prevRange.start, prevRange.end),
                            getFinancialStats(start, end),
                            getOccupancyByCourt(start, end),
                            getReportTransactions(start, end),
                            getBestClient(start, end),
                            getPaymentMethodStats(start, end),
                            getDailyRevenueStats(start, end),
                            getMembershipRetentionStats(),
                            getClientActivityStats()
                     ])
                     return { kpis, finances, occupancyByCourt, transactions, bestClient, paymentMethods, dailyRevenue, membershipRetention, clientActivity }
              }
       })

       // Effects for debugging errors
       React.useEffect(() => {
              if (error) console.error("Error fetching reports:", error)
       }, [error])

       const kpis = data?.kpis || {
              income: { value: 0, change: 0, hasPreviousData: false },
              occupancy: { value: 0, change: 0, hasPreviousData: false },
              ticket: { value: 0, change: 0, hasPreviousData: false },
              newClients: { value: 0, change: 0, hasPreviousData: false }
       }
       const finances = data?.finances || { income: 0, expenses: 0, balance: 0, byCategory: {}, byCategoryIncome: {} }
       const occupancyByCourt = data?.occupancyByCourt || []
       const transactions = data?.transactions || []
       const bestClient = data?.bestClient || null

       // Only income categories for the pie (fixed: was including expenses with Math.abs)
       const pieData = Object.entries(finances.byCategoryIncome || {}).map(([name, value]) => ({
              name: name.replace(/_/g, ' '),
              value: value as number
       })).filter(i => i.value > 0)

       const paymentMethods = data?.paymentMethods || []
       const membershipRetention = data?.membershipRetention || { total: 0, active: 0, expired: 0, cancelled: 0, expiringCount: 0, retentionRate: 0, plans: [] }
       const clientActivity = data?.clientActivity || { totalClients: 0, newThisMonth: 0, activeClients: 0, riskClients: 0, lostClients: 0 }

       // #21 - Check if chart data is effectively empty
       const dailyRevenue = data?.dailyRevenue || []
       const isDailyRevenueEmpty = !loading && (dailyRevenue.length === 0 || dailyRevenue.every((d: { value: number }) => d.value === 0))
       const isOccupancyEmpty = !loading && (occupancyByCourt.length === 0 || occupancyByCourt.every((d: { value: number }) => d.value === 0))

       const _downloadCSV = () => {
              const headers = ["ID", "Fecha", "Tipo", "Categoria", "Monto", "Metodo", "Descripcion"]
              const rows = transactions.map(t => {
                     const typeMap: Record<string, string> = { 'INCOME': 'INGRESO', 'EXPENSE': 'GASTO' }
                     const methodMap: Record<string, string> = { 'CASH': 'EFECTIVO', 'TRANSFER': 'TRANSFERENCIA', 'CREDIT': 'CRÉDITO', 'DEBIT': 'DÉBITO' }
                     return [
                            t.id,
                            format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm'),
                            typeMap[t.type] || t.type,
                            t.category,
                            t.amount,
                            methodMap[t.method] || t.method,
                            `"${(t.description || '').replace(/"/g, '""')}"`
                     ]
              })
              const csv = [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n')
              const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = url
              link.setAttribute("download", `reporte_${format(start, 'yyyy-MM-dd')}_${format(end, 'yyyy-MM-dd')}.csv`)
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
       }

       const downloadExcel = () => {
              const query = new URLSearchParams({
                     start: start.toISOString(),
                     end: end.toISOString(),
              })

              window.open(`/api/export/reportes?${query.toString()}`, '_blank')
       }

       return (
              <div className="flex flex-col h-full bg-background text-foreground transition-colors duration-300">
                     <Header title={t('reports')} backHref="/dashboard" minimal={true} />

                     <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <div className="max-w-[1400px] mx-auto pb-20">

                                   {/* Premium Controls Bar */}
                                   <div className="flex flex-col gap-4 mb-8 bg-card/30 backdrop-blur-2xl p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-border/40 shadow-2xl">
                                          {/* Period type + export row */}
                                          <div className="flex items-center justify-between gap-2">
                                                 <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                                        {(['day', 'week', 'month', 'year'] as PeriodType[]).map((type) => (
                                                               <button
                                                                      key={type}
                                                                      onClick={() => setPeriodType(type)}
                                                                      className={cn(
                                                                             "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0",
                                                                             periodType === type
                                                                                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                                                                                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                                                                      )}
                                                               >
                                                                      {type === 'day' ? 'Día' : type === 'week' ? 'Semana' : type === 'month' ? 'Mes' : 'Año'}
                                                               </button>
                                                        ))}
                                                 </div>
                                                 <button
                                                        onClick={downloadExcel}
                                                        className="flex items-center justify-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shrink-0"
                                                 >
                                                        <Download size={15} strokeWidth={3} />
                                                        <span className="hidden sm:inline">Exportar</span>
                                                 </button>
                                          </div>
                                          {/* Date navigation */}
                                          <div className="flex items-center gap-2 bg-secondary p-1.5 rounded-2xl border border-border/50">
                                                 <button
                                                        onClick={() => {
                                                               if (periodType === 'day') setCurrentDate(subDays(currentDate, 1))
                                                               if (periodType === 'week') setCurrentDate(subWeeks(currentDate, 1))
                                                               if (periodType === 'month') setCurrentDate(subMonths(currentDate, 1))
                                                               if (periodType === 'year') setCurrentDate(subYears(currentDate, 1))
                                                        }}
                                                        className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90 shrink-0"
                                                 >
                                                        <ChevronLeft size={18} strokeWidth={3} />
                                                 </button>

                                                 <div className="flex-1 py-2 bg-muted rounded-xl border border-border/50 flex items-center justify-center gap-2 min-w-0">
                                                        <Calendar size={14} className="text-primary shrink-0" />
                                                        <span className="text-xs font-black text-foreground uppercase tracking-tighter text-center truncate">
                                                               {periodType === 'day' && format(currentDate, "EEEE d 'de' MMMM", { locale: es })}
                                                               {periodType === 'week' && `Sem. ${format(start, "d MMM", { locale: es })}`}
                                                               {periodType === 'month' && format(currentDate, "MMMM yyyy", { locale: es })}
                                                               {periodType === 'year' && format(currentDate, "yyyy", { locale: es })}
                                                        </span>
                                                 </div>

                                                 <button
                                                        onClick={() => {
                                                               if (isForwardDisabled) return
                                                               if (periodType === 'day') setCurrentDate(addDays(currentDate, 1))
                                                               if (periodType === 'week') setCurrentDate(addWeeks(currentDate, 1))
                                                               if (periodType === 'month') setCurrentDate(addMonths(currentDate, 1))
                                                               if (periodType === 'year') setCurrentDate(addYears(currentDate, 1))
                                                        }}
                                                        disabled={isForwardDisabled}
                                                        className={cn(
                                                               "p-2.5 rounded-xl transition-all shrink-0",
                                                               isForwardDisabled
                                                                      ? "text-muted-foreground/40 cursor-not-allowed opacity-40"
                                                                      : "hover:bg-muted text-muted-foreground hover:text-foreground active:scale-90"
                                                        )}
                                                 >
                                                        <ChevronRight size={18} strokeWidth={3} />
                                                 </button>
                                          </div>
                                   </div>

                                   {/* Error state */}
                                   {error && (
                                          <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-500">
                                                 <AlertCircle size={20} strokeWidth={2.5} className="shrink-0" />
                                                 <div>
                                                        <p className="font-bold text-sm">Error al cargar reportes</p>
                                                        <p className="text-xs opacity-80 mt-0.5">{(error as Error).message || 'Intentá de nuevo en unos segundos.'}</p>
                                                 </div>
                                          </div>
                                   )}

                                   {/* KPIs */}
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                                          <KPICard title={t('total_income')} value={`$${kpis.income.value.toLocaleString()}`} change={kpis.income.change} hasPreviousData={kpis.income.hasPreviousData} icon={<Banknote size={24} />} loading={loading} />
                                          <KPICard title={t('avg_occupancy')} value={`${kpis.occupancy.value}%`} change={kpis.occupancy.change} hasPreviousData={kpis.occupancy.hasPreviousData} icon={<BarChart3 size={24} />} color="blue" loading={loading} />
                                          <KPICard title={t('avg_ticket')} value={`$${Math.round(kpis.ticket.value).toLocaleString()}`} change={kpis.ticket.change} hasPreviousData={kpis.ticket.hasPreviousData} icon={<Ticket size={24} />} color="purple" loading={loading} />
                                          <KPICard title={t('new_clients')} value={kpis.newClients.value.toString()} change={kpis.newClients.change} hasPreviousData={kpis.newClients.hasPreviousData} icon={<Users size={24} />} color="orange" loading={loading} />
                                   </div>

                                   {/* Financial Summary Bar */}
                                   <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
                                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-4">
                                                 <div className="p-2 md:p-3 bg-emerald-500/20 rounded-lg md:rounded-xl shrink-0"><TrendingUp size={16} className="text-emerald-500 md:hidden" /><TrendingUp size={20} className="text-emerald-500 hidden md:block" /></div>
                                                 <div className="text-center md:text-left min-w-0">
                                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-0.5">Ingresos</p>
                                                        <p className="text-sm md:text-xl font-black text-emerald-600 dark:text-emerald-400 truncate">{loading ? '...' : `$${finances.income.toLocaleString()}`}</p>
                                                 </div>
                                          </div>
                                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-4">
                                                 <div className="p-2 md:p-3 bg-red-500/20 rounded-lg md:rounded-xl shrink-0"><TrendingDown size={16} className="text-red-500 md:hidden" /><TrendingDown size={20} className="text-red-500 hidden md:block" /></div>
                                                 <div className="text-center md:text-left min-w-0">
                                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 mb-0.5">Egresos</p>
                                                        <p className="text-sm md:text-xl font-black text-red-500 truncate">{loading ? '...' : `$${finances.expenses.toLocaleString()}`}</p>
                                                 </div>
                                          </div>
                                          <div className={cn("border rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-4", finances.balance >= 0 ? "bg-blue-500/10 border-blue-500/20" : "bg-orange-500/10 border-orange-500/20")}>
                                                 <div className={cn("p-2 md:p-3 rounded-lg md:rounded-xl shrink-0", finances.balance >= 0 ? "bg-blue-500/20" : "bg-orange-500/20")}>
                                                        <Scale size={16} className={cn("md:hidden", finances.balance >= 0 ? "text-blue-500" : "text-orange-500")} />
                                                        <Scale size={20} className={cn("hidden md:block", finances.balance >= 0 ? "text-blue-500" : "text-orange-500")} />
                                                 </div>
                                                 <div className="text-center md:text-left min-w-0">
                                                        <p className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-0.5", finances.balance >= 0 ? "text-blue-500" : "text-orange-500")}>Balance</p>
                                                        <p className={cn("text-sm md:text-xl font-black truncate", finances.balance >= 0 ? "text-blue-500" : "text-orange-500")}>{loading ? '...' : `$${finances.balance.toLocaleString()}`}</p>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Charts Grid 1: Evolution and Occupancy */}
                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                                          {/* INGRESOS DIARIOS - AREA CHART */}
                                          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 hover:border-primary/30 transition-all shadow-lg shadow-black/5 hover:shadow-xl relative overflow-hidden group">
                                                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                 <div className="flex items-center justify-between mb-8 relative z-10">
                                                        <div className="flex items-start gap-4">
                                                               <div className="p-3 bg-primary/10 text-primary rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                                                                      <Banknote size={24} />
                                                               </div>
                                                               <div>
                                                                      <h3 className="text-lg font-black tracking-tight text-foreground">
                                                                             {periodType === 'year' ? 'Ingresos Mensuales' : 'Ingresos Diarios'}
                                                                      </h3>
                                                                      <p className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Evolución en el periodo</p>
                                                               </div>
                                                        </div>
                                                 </div>
                                                 <div className="h-[220px] md:h-[300px] w-full relative z-10">
                                                        {isDailyRevenueEmpty ? (
                                                               <ChartEmptyState />
                                                        ) : (
                                                               <ResponsiveContainer width="100%" height="100%">
                                                                      <AreaChart data={dailyRevenue}>
                                                                             <defs>
                                                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                                                           <stop offset="5%" stopColor={BRAND_GREEN} stopOpacity={0.8} />
                                                                                           <stop offset="95%" stopColor={BRAND_GREEN} stopOpacity={0} />
                                                                                    </linearGradient>
                                                                             </defs>
                                                                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                                                             <XAxis
                                                                                    dataKey="name"
                                                                                    axisLine={false}
                                                                                    tickLine={false}
                                                                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                                                                    dy={10}
                                                                             />
                                                                             <YAxis
                                                                                    axisLine={false}
                                                                                    tickLine={false}
                                                                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                                                                    tickFormatter={(val) => `$${val / 1000}k`}
                                                                             />
                                                                             <Tooltip
                                                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                                                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                                                                                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                                                                                    formatter={(val: number | undefined) => [`$${(val || 0).toLocaleString()}`, 'Ingresos']}
                                                                             />
                                                                             <Area type="monotone" dataKey="value" stroke={BRAND_GREEN} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                                                      </AreaChart>
                                                               </ResponsiveContainer>
                                                        )}
                                                 </div>
                                          </div>

                                          {/* OCUPACIÓN POR CANCHA - VERTICAL BAR CHART */}
                                          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 hover:border-blue-500/30 transition-all shadow-lg shadow-black/5 hover:shadow-xl relative overflow-hidden group">
                                                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                 <div className="flex items-center justify-between mb-8 relative z-10">
                                                        <div className="flex items-start gap-4">
                                                               <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                                                                      <Activity size={24} />
                                                               </div>
                                                               <div>
                                                                      <h3 className="text-lg font-black tracking-tight text-foreground">
                                                                             {t('occupancy_by_court')}
                                                                      </h3>
                                                                      <p className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Uso relativo de canchas</p>
                                                               </div>
                                                        </div>
                                                 </div>
                                                 <div className="h-[220px] md:h-[300px] w-full relative z-10">
                                                        {isOccupancyEmpty ? (
                                                               <ChartEmptyState />
                                                        ) : (
                                                               <ResponsiveContainer width="100%" height="100%">
                                                                      <BarChart data={occupancyByCourt} layout="vertical" barSize={32}>
                                                                             <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.3} />
                                                                             <XAxis type="number" hide />
                                                                             <YAxis
                                                                                    dataKey="name"
                                                                                    type="category"
                                                                                    axisLine={false}
                                                                                    tickLine={false}
                                                                                    width={80}
                                                                                    tick={{ fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }}
                                                                             />
                                                                             <Tooltip
                                                                                    cursor={{ fill: 'transparent' }}
                                                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                                                                    formatter={(val: number | undefined) => [`${val || 0}%`, 'Ocupación']}
                                                                             />
                                                                             <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                                                                    {occupancyByCourt.map((_entry: Record<string, unknown>, index: number) => (
                                                                                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                                                                                    ))}
                                                                             </Bar>
                                                                      </BarChart>
                                                               </ResponsiveContainer>
                                                        )}
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Charts Grid 2: Distribution */}
                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                                          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 hover:shadow-xl transition-all">
                                                 <h3 className="text-lg font-black tracking-tight mb-6">Ingresos por Método de Pago</h3>
                                                 <div className="h-[220px] md:h-[300px]">
                                                        {!loading && paymentMethods.length === 0 ? (
                                                               <ChartEmptyState />
                                                        ) : (
                                                               <ResponsiveContainer width="100%" height="100%">
                                                                      <PieChart>
                                                                             <Pie data={paymentMethods} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                                                                    {paymentMethods.map((_item: Record<string, unknown>, index: number) => (
                                                                                           <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                                                                                    ))}
                                                                             </Pie>
                                                                             <Tooltip
                                                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                                                                    formatter={(val: number | undefined) => [`$${(val || 0).toLocaleString()}`, 'Monto']}
                                                                             />
                                                                             <Legend verticalAlign="bottom" height={36} />
                                                                      </PieChart>
                                                               </ResponsiveContainer>
                                                        )}
                                                 </div>
                                          </div>

                                          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 flex flex-col relative shadow-lg shadow-black/5 hover:shadow-xl transition-all">
                                                 <div className="w-full text-left mb-6">
                                                        <h3 className="text-lg font-black tracking-tight">{t('revenue_by_category')}</h3>
                                                 </div>
                                                 {!loading && pieData.length === 0 ? (
                                                        <div className="h-[250px]"><ChartEmptyState /></div>
                                                 ) : (
                                                        <div className="relative w-full h-[250px]">
                                                               <ResponsiveContainer width="100%" height="100%">
                                                                      <PieChart>
                                                                             <Pie data={pieData} innerRadius={75} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none">
                                                                                    {pieData.map((_, index) => (
                                                                                           <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                                                                                    ))}
                                                                             </Pie>
                                                                             <Tooltip
                                                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                                                                    formatter={(val: number | undefined) => [`$${(val || 0).toLocaleString()}`, '']}
                                                                             />
                                                                             <Legend verticalAlign="bottom" height={36} />
                                                                      </PieChart>
                                                               </ResponsiveContainer>
                                                               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                                      <span className="text-[10px] uppercase text-muted-foreground font-bold">{t('total')}</span>
                                                                      <span className="text-2xl font-black">${(finances.income / 1000).toFixed(1)}k</span>
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>
                                   </div>

                                   {/* MEMBERSHIP RETENTION + CLIENT ACTIVITY */}
                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                                          {/* Membership Retention */}
                                          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all">
                                                 <div className="flex items-start gap-4 mb-6">
                                                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                                                               <Crown size={24} />
                                                        </div>
                                                        <div>
                                                               <h3 className="text-lg font-black tracking-tight">Retención de Membresías</h3>
                                                               <p className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Estado de socios</p>
                                                        </div>
                                                        <div className="ml-auto text-right">
                                                               <div className="text-3xl font-black text-purple-500">{loading ? '...' : `${membershipRetention.retentionRate}%`}</div>
                                                               <div className="text-[10px] text-muted-foreground uppercase font-bold">Retención</div>
                                                        </div>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-3 mb-4">
                                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      <UserCheck size={14} className="text-emerald-500" />
                                                                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Activos</span>
                                                               </div>
                                                               <div className="text-2xl font-black text-emerald-500">{loading ? '...' : membershipRetention.active}</div>
                                                        </div>
                                                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      <UserX size={14} className="text-red-500" />
                                                                      <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Vencidos</span>
                                                               </div>
                                                               <div className="text-2xl font-black text-red-500">{loading ? '...' : membershipRetention.expired}</div>
                                                        </div>
                                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      <Clock size={14} className="text-amber-500" />
                                                                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Vencen 30d</span>
                                                               </div>
                                                               <div className="text-2xl font-black text-amber-500">{loading ? '...' : membershipRetention.expiringCount}</div>
                                                        </div>
                                                        <div className="bg-muted/50 border border-border/50 rounded-2xl p-4">
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      <Crown size={14} className="text-muted-foreground" />
                                                                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total</span>
                                                               </div>
                                                               <div className="text-2xl font-black">{loading ? '...' : membershipRetention.total}</div>
                                                        </div>
                                                 </div>
                                                 {membershipRetention.plans.length > 0 && (
                                                        <div className="space-y-2">
                                                               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Por Plan</p>
                                                               {membershipRetention.plans.map((plan: { name: string; price: number; activeCount: number }) => (
                                                                      <div key={plan.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                                                                             <div>
                                                                                    <span className="text-sm font-bold">{plan.name}</span>
                                                                                    <span className="text-xs text-muted-foreground ml-2">${plan.price.toLocaleString()}/mes</span>
                                                                             </div>
                                                                             <span className="text-sm font-black text-primary">{plan.activeCount} socios</span>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 )}
                                          </div>

                                          {/* Client Activity Breakdown */}
                                          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all">
                                                 <div className="flex items-start gap-4 mb-6">
                                                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                                                               <Users size={24} />
                                                        </div>
                                                        <div>
                                                               <h3 className="text-lg font-black tracking-tight">Actividad de Clientes</h3>
                                                               <p className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Segmentación por engagement</p>
                                                        </div>
                                                 </div>
                                                 <div className="space-y-3">
                                                        {[
                                                               { label: 'Activos (últimos 30d)', value: clientActivity.activeClients, total: clientActivity.totalClients, color: 'bg-emerald-500' },
                                                               { label: 'En Riesgo (30-90d)', value: clientActivity.riskClients, total: clientActivity.totalClients, color: 'bg-amber-500' },
                                                               { label: 'Perdidos (+90d)', value: clientActivity.lostClients, total: clientActivity.totalClients, color: 'bg-red-500' },
                                                               { label: 'Nuevos (este mes)', value: clientActivity.newThisMonth, total: clientActivity.totalClients, color: 'bg-blue-500' },
                                                        ].map(({ label, value, total, color }) => {
                                                               const pct = total > 0 ? Math.round((value / total) * 100) : 0
                                                               return (
                                                                      <div key={label} className="space-y-1.5">
                                                                             <div className="flex justify-between items-center">
                                                                                    <span className="text-sm font-bold text-foreground">{label}</span>
                                                                                    <span className="text-sm font-black">{loading ? '...' : value} <span className="text-xs text-muted-foreground font-normal">({pct}%)</span></span>
                                                                             </div>
                                                                             <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                                                    <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: loading ? '0%' : `${pct}%` }} />
                                                                             </div>
                                                                      </div>
                                                               )
                                                        })}
                                                 </div>
                                                 <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total de Clientes</span>
                                                        <span className="text-2xl font-black">{loading ? '...' : clientActivity.totalClients}</span>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Client of Period */}
                                   <div className="bg-card border border-border rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 mb-6 md:mb-8">
                                          <div className="space-y-3 w-full md:w-auto">
                                                 <h3 className="text-base md:text-xl font-bold">{t('client_of_month')}</h3>
                                                 {bestClient ? (
                                                        <div className="flex items-center gap-3">
                                                               <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center text-xl md:text-3xl font-black text-primary-foreground shadow-xl shrink-0">
                                                                      {bestClient.initials}
                                                               </div>
                                                               <div>
                                                                      <h4 className="text-xl md:text-3xl font-black">{bestClient.name}</h4>
                                                                      <p className="text-primary font-bold text-sm">{bestClient.bookings} {t('bookings')}</p>
                                                               </div>
                                                        </div>
                                                 ) : (
                                                        <p className="text-muted-foreground text-sm">{t('no_data_this_month')}</p>
                                                 )}
                                          </div>
                                          {bestClient && (
                                                 <div className="flex flex-wrap gap-2">
                                                        <span className="bg-muted px-3 py-1 rounded-full text-xs font-bold text-muted-foreground border border-border whitespace-nowrap">Cliente Frecuente</span>
                                                        {bestClient.bookings >= 5 && <span className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary border border-primary/20 whitespace-nowrap">Top Spender</span>}
                                                 </div>
                                          )}
                                   </div>

                                   {/* Transactions List */}
                                   <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-lg">
                                          <div className="flex items-center justify-between mb-6">
                                                 <h3 className="text-lg font-black tracking-tight">Movimientos del Período</h3>
                                                 <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">{transactions.length} registros</span>
                                          </div>
                                          {transactions.length === 0 ? (
                                                 <div className="py-12 text-center">
                                                        <p className="text-sm font-bold text-muted-foreground">Sin movimientos en este período</p>
                                                 </div>
                                          ) : (
                                                 <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1">
                                                        {transactions.map((tx: {
                                                               id: number
                                                               type: string
                                                               category: string
                                                               amount: number
                                                               method: string
                                                               description: string | null
                                                               createdAt: Date
                                                        }) => {
                                                               const isIncome = tx.type === 'INCOME'
                                                               const methodLabel: Record<string, string> = { CASH: 'Efectivo', TRANSFER: 'Transferencia', CREDIT: 'Crédito', DEBIT: 'Débito', MERCADOPAGO: 'Mercado Pago' }
                                                               return (
                                                                      <div key={tx.id} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                                                                             <div className={cn("p-2 rounded-lg shrink-0", isIncome ? "bg-emerald-500/10" : "bg-red-500/10")}>
                                                                                    {isIncome ? <ArrowUpLeft size={16} className="text-emerald-500" /> : <ArrowDownLeft size={16} className="text-red-500" />}
                                                                             </div>
                                                                             <div className="flex-1 min-w-0">
                                                                                    <p className="text-sm font-bold text-foreground truncate">{tx.description || tx.category.replace(/_/g, ' ')}</p>
                                                                                    <p className="text-xs text-muted-foreground">{methodLabel[tx.method || ''] || tx.method} · {format(new Date(tx.createdAt), "d MMM HH:mm", { locale: es })}</p>
                                                                             </div>
                                                                             <span className={cn("text-sm font-black shrink-0", isIncome ? "text-emerald-500" : "text-red-500")}>
                                                                                    {isIncome ? '+' : '-'}${tx.amount.toLocaleString()}
                                                                             </span>
                                                                      </div>
                                                               )
                                                        })}
                                                 </div>
                                          )}
                                   </div>

                            </div>
                     </div>
              </div>
       )
}

function KPICard({ title, value, change, hasPreviousData = true, icon, color = 'green', loading }: { title: string, value: string | number, change: number, hasPreviousData?: boolean, icon: React.ReactNode, color?: string, loading?: boolean }) {
       const isPositive = change > 0
       const isNeutral = change === 0
       const colorClass = color === 'green' ? 'text-green-500 bg-green-500/10' :
              color === 'blue' ? 'text-blue-500 bg-blue-500/10' :
                     color === 'purple' ? 'text-purple-500 bg-purple-500/10' :
                            'text-orange-500 bg-orange-500/10'

       return (
              <div className="bg-card/40 backdrop-blur-xl border border-border/50 p-4 md:p-6 rounded-2xl md:rounded-3xl hover:shadow-xl shadow-black/5 hover:bg-card/60 transition-all group overflow-hidden relative">
                     <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br", color === 'green' ? 'from-emerald-500' : color === 'blue' ? 'from-blue-500' : color === 'purple' ? 'from-purple-500' : 'from-orange-500')} />
                     <div className="flex justify-between items-start mb-3 md:mb-6 relative z-10">
                            <div className={cn("p-2.5 md:p-4 rounded-xl md:rounded-2xl shadow-inner [&_svg]:w-[18px] [&_svg]:h-[18px] md:[&_svg]:w-6 md:[&_svg]:h-6", colorClass, "group-hover:scale-110 transition-transform duration-500")}>
                                   {icon}
                            </div>
                            {hasPreviousData ? (
                                   <div className={cn("flex items-center gap-0.5 text-[10px] font-black tracking-widest px-2 py-1 rounded-full border", isNeutral ? "text-muted-foreground bg-muted/30 border-border/50" : isPositive ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20")}>
                                          {!isNeutral && (isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />)}
                                          <span>{isNeutral ? '0%' : `${change > 0 ? '+' : '-'}${Math.abs(change).toFixed(1)}%`}</span>
                                   </div>
                            ) : (
                                   <div className="flex items-center text-[10px] font-black tracking-widest px-2 py-1 rounded-full border text-muted-foreground bg-muted/30 border-border/50">
                                          <span>{'\u2014'}</span>
                                   </div>
                            )}
                     </div>
                     <div className="relative z-10">
                            <p className="text-muted-foreground text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1 md:mb-2 line-clamp-1">{title}</p>
                            <h3 className="text-xl md:text-3xl font-black tracking-tighter text-foreground">{loading ? <span className="animate-pulse">...</span> : value}</h3>
                     </div>
              </div>
       )
}

function ChartEmptyState() {
       return (
              <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                     <div className="p-4 bg-muted/30 rounded-2xl">
                            <TrendingUp size={32} className="text-muted-foreground/50" />
                     </div>
                     <div className="text-center">
                            <p className="text-sm font-bold text-muted-foreground">Sin datos para este per{'\u00ed'}odo</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Seleccion{'\u00e1'} otro rango de fechas</p>
                     </div>
              </div>
       )
}
