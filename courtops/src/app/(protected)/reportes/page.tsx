'use client'

import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import {
       getFinancialStats,
       getOccupancyByCourt,
       getReportTransactions,
       getDashboardKPIs,
       getBestClient,
       getPaymentMethodStats,
       getDailyRevenueStats
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
       Calendar
} from 'lucide-react'
import {
       startOfDay, endOfDay, startOfWeek, endOfWeek,
       startOfMonth, endOfMonth, startOfYear, endOfYear,
       subDays, subWeeks, subMonths, subYears,
       addDays, addWeeks, addMonths, addYears,
       format
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

       const { data, isLoading: loading, error } = useQuery({
              queryKey: ['reports', periodType, currentDate.toISOString()],
              queryFn: async () => {
                     const prevRange = getPrevDateRange(start, end)
                     const [kpis, finances, occupancyByCourt, transactions, bestClient, paymentMethods, dailyRevenue] = await Promise.all([
                            getDashboardKPIs(start, end, prevRange.start, prevRange.end),
                            getFinancialStats(start, end),
                            getOccupancyByCourt(start, end),
                            getReportTransactions(start, end),
                            getBestClient(start, end),
                            getPaymentMethodStats(start, end),
                            getDailyRevenueStats(start, end)
                     ])
                     return { kpis, finances, occupancyByCourt, transactions, bestClient, paymentMethods, dailyRevenue }
              }
       })

       // Effects for debugging errors
       React.useEffect(() => {
              if (error) console.error("Error fetching reports:", error)
       }, [error])

       const kpis = data?.kpis || {
              income: { value: 0, change: 0 },
              occupancy: { value: 0, change: 0 },
              ticket: { value: 0, change: 0 },
              newClients: { value: 0, change: 0 }
       }
       const finances = data?.finances || { income: 0, expenses: 0, balance: 0, byCategory: {} }
       const occupancyByCourt = data?.occupancyByCourt || []
       const transactions = data?.transactions || []
       const bestClient = data?.bestClient || null

       const pieData = Object.entries(finances.byCategory).map(([name, value]) => ({
              name: name.replace(/_/g, ' '),
              value: Math.abs(value)
       })).filter(i => i.value > 0)

       const downloadCSV = () => {
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
              link.setAttribute("download", `reporte_${format(currentDate, 'yyyy-MM-dd')}.csv`)
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
       }

       return (
              <div className="flex flex-col h-full bg-background text-foreground transition-colors duration-300">
                     <Header title={t('reports')} backHref="/dashboard" minimal={true} />

                     <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <div className="max-w-[1400px] mx-auto pb-20">

                                   {/* Premium Controls Bar */}
                                   <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 mb-10 bg-card/30 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-border/40 shadow-2xl">
                                          <div className="flex flex-wrap items-center gap-2">
                                                 {(['day', 'week', 'month', 'year'] as PeriodType[]).map((type) => (
                                                        <button
                                                               key={type}
                                                               onClick={() => setPeriodType(type)}
                                                               className={cn(
                                                                      "px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                                                                      periodType === type
                                                                             ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(180,235,24,0.3)] scale-105"
                                                                             : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                                               )}
                                                        >
                                                               {type === 'day' ? 'Día' : type === 'week' ? 'Semana' : type === 'month' ? 'Mes' : 'Año'}
                                                        </button>
                                                 ))}
                                          </div>

                                          <div className="flex items-center justify-between md:justify-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                                                 <button
                                                        onClick={() => {
                                                               if (periodType === 'day') setCurrentDate(subDays(currentDate, 1))
                                                               if (periodType === 'week') setCurrentDate(subWeeks(currentDate, 1))
                                                               if (periodType === 'month') setCurrentDate(subMonths(currentDate, 1))
                                                               if (periodType === 'year') setCurrentDate(subYears(currentDate, 1))
                                                        }}
                                                        className="p-3 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-90"
                                                 >
                                                        <ChevronLeft size={20} strokeWidth={3} />
                                                 </button>

                                                 <div className="px-6 py-2 bg-black/20 rounded-xl border border-white/5 flex items-center gap-3">
                                                        <Calendar size={16} className="text-primary" />
                                                        <span className="text-sm font-black text-white uppercase tracking-tighter min-w-[120px] text-center">
                                                               {periodType === 'day' && format(currentDate, "EEEE d 'de' MMMM", { locale: es })}
                                                               {periodType === 'week' && `Semana del ${format(start, "d 'de' MMMM", { locale: es })}`}
                                                               {periodType === 'month' && format(currentDate, "MMMM yyyy", { locale: es })}
                                                               {periodType === 'year' && format(currentDate, "yyyy", { locale: es })}
                                                        </span>
                                                 </div>

                                                 <button
                                                        onClick={() => {
                                                               if (periodType === 'day') setCurrentDate(addDays(currentDate, 1))
                                                               if (periodType === 'week') setCurrentDate(addWeeks(currentDate, 1))
                                                               if (periodType === 'month') setCurrentDate(addMonths(currentDate, 1))
                                                               if (periodType === 'year') setCurrentDate(addYears(currentDate, 1))
                                                        }}
                                                        className="p-3 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-90"
                                                 >
                                                        <ChevronRight size={20} strokeWidth={3} />
                                                 </button>
                                          </div>

                                          <button
                                                 onClick={downloadCSV}
                                                 className="flex items-center justify-center gap-3 bg-white text-black px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl"
                                          >
                                                 <Download size={18} strokeWidth={3} />
                                                 <span>Exportar CSV</span>
                                          </button>
                                   </div>

                                   {/* KPIs */}
                                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                          <KPICard title={t('total_income')} value={`$${kpis.income.value.toLocaleString()}`} change={kpis.income.change} icon={<Banknote size={24} />} loading={loading} />
                                          <KPICard title={t('avg_occupancy')} value={`${kpis.occupancy.value}%`} change={kpis.occupancy.change} icon={<BarChart3 size={24} />} color="blue" loading={loading} />
                                          <KPICard title={t('avg_ticket')} value={`$${Math.round(kpis.ticket.value).toLocaleString()}`} change={kpis.ticket.change} icon={<Ticket size={24} />} color="purple" loading={loading} />
                                          <KPICard title={t('new_clients')} value={kpis.newClients.value.toString()} change={kpis.newClients.change} icon={<Users size={24} />} color="orange" loading={loading} />
                                   </div>

                                   {/* Charts Grid 1: Evolution and Occupancy */}
                                   {/* Charts Grid 1: Evolution and Occupancy */}
                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                                                                             Ingresos Diarios
                                                                      </h3>
                                                                      <p className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Evolución en el periodo</p>
                                                               </div>
                                                        </div>
                                                 </div>
                                                 <div className="h-[300px] w-full relative z-10">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                               <AreaChart data={data?.dailyRevenue || []}>
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
                                                                             formatter={(val: number) => [`$${(val || 0).toLocaleString()}`, 'Ingresos']}
                                                                      />
                                                                      <Area type="monotone" dataKey="value" stroke={BRAND_GREEN} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                                               </AreaChart>
                                                        </ResponsiveContainer>
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
                                                 <div className="h-[300px] w-full relative z-10">
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
                                                                             formatter={(val: number) => [`${val || 0}%`, 'Ocupación']}
                                                                      />
                                                                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                                                             {occupancyByCourt.map((_entry: Record<string, unknown>, index: number) => (
                                                                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                                                                             ))}
                                                                      </Bar>
                                                               </BarChart>
                                                        </ResponsiveContainer>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Charts Grid 2: Distribution */}
                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 hover:shadow-xl transition-all">
                                                 <h3 className="text-lg font-black tracking-tight mb-6">Ingresos por Método de Pago</h3>
                                                 <div className="h-[300px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                               <PieChart>
                                                                      <Pie data={data?.paymentMethods || []} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                                                             {(data?.paymentMethods || []).map((_item: Record<string, unknown>, index: number) => (
                                                                                    <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                                                                             ))}
                                                                      </Pie>
                                                                      <Tooltip />
                                                                      <Legend verticalAlign="bottom" height={36} />
                                                               </PieChart>
                                                        </ResponsiveContainer>
                                                 </div>
                                          </div>

                                          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative shadow-lg shadow-black/5 hover:shadow-xl transition-all">
                                                 <div className="w-full text-left mb-6">
                                                        <h3 className="text-lg font-black tracking-tight">{t('revenue_by_category')}</h3>
                                                 </div>
                                                 <div className="relative w-full h-[250px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                               <PieChart>
                                                                      <Pie data={pieData} innerRadius={75} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none">
                                                                             {pieData.map((_, index) => (
                                                                                    <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                                                                             ))}
                                                                      </Pie>
                                                                      <Tooltip />
                                                               </PieChart>
                                                        </ResponsiveContainer>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                               <span className="text-[10px] uppercase text-muted-foreground font-bold">{t('total')}</span>
                                                               <span className="text-2xl font-black">${(finances.income / 1000).toFixed(1)}k</span>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Client of Month */}
                                   <div className="bg-card border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                          <div className="space-y-4 text-center md:text-left">
                                                 <h3 className="text-xl font-bold">{t('client_of_month')}</h3>
                                                 {bestClient ? (
                                                        <div className="flex items-center gap-4 justify-center md:justify-start">
                                                               <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-black text-primary-foreground shadow-xl">
                                                                      {bestClient.initials}
                                                               </div>
                                                               <div>
                                                                      <h4 className="text-3xl font-black">{bestClient.name}</h4>
                                                                      <p className="text-primary font-bold">{bestClient.bookings} {t('bookings')}</p>
                                                               </div>
                                                        </div>
                                                 ) : (
                                                        <p className="text-muted-foreground">{t('no_data_this_month')}</p>
                                                 )}
                                          </div>
                                          <div className="flex flex-wrap gap-2 justify-center">
                                                 {['Puntualidad Perfecta', 'Cliente Frecuente', 'Top Spender'].map(tag => (
                                                        <span key={tag} className="bg-muted px-4 py-1.5 rounded-full text-xs font-bold text-muted-foreground border border-border whitespace-nowrap">{tag}</span>
                                                 ))}
                                          </div>
                                   </div>

                            </div>
                     </div>
              </div>
       )
}

function KPICard({ title, value, change, icon, color = 'green', loading }: { title: string, value: string | number, change: number, icon: React.ReactNode, color?: string, loading?: boolean }) {
       const isPositive = change >= 0
       const colorClass = color === 'green' ? 'text-green-500 bg-green-500/10' :
              color === 'blue' ? 'text-blue-500 bg-blue-500/10' :
                     color === 'purple' ? 'text-purple-500 bg-purple-500/10' :
                            'text-orange-500 bg-orange-500/10'

       return (
              <div className="bg-card/40 backdrop-blur-xl border border-border/50 p-6 rounded-3xl hover:shadow-xl shadow-black/5 hover:bg-card/60 transition-all group overflow-hidden relative">
                     <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br", color === 'green' ? 'from-emerald-500' : color === 'blue' ? 'from-blue-500' : color === 'purple' ? 'from-purple-500' : 'from-orange-500')} />
                     <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={cn("p-4 rounded-2xl shadow-inner", colorClass, "group-hover:scale-110 transition-transform duration-500")}>{icon}</div>
                            <div className={cn("flex items-center gap-1 text-[11px] font-black tracking-widest px-3 py-1.5 rounded-full border", isPositive ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-500 bg-red-500/10 border-red-500/20")}>
                                   {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                                   <span className="mt-0.5">{Math.abs(change).toFixed(1)}%</span>
                            </div>
                     </div>
                     <div className="relative z-10">
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
                            <h3 className="text-3xl font-black tracking-tighter text-foreground">{loading ? <span className="animate-pulse">...</span> : value}</h3>
                     </div>
              </div>
       )
}
