'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getFinancialStats, getOccupancyByCourt, getReportTransactions, getDashboardKPIs, getBestClient } from '@/actions/reports'
import { cn } from '@/lib/utils'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, format, isSameDay, subYears } from 'date-fns'
import { es } from 'date-fns/locale'
import {
       BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
       PieChart, Pie, Cell, Legend
} from 'recharts'
import {
       Download,
       Banknote,
       TrendingUp,
       Users,
       Ticket,
       ArrowUpRight,
       ArrowDownRight,
       ChevronLeft,
       Home,
       CalendarDays,
       Settings,
       BarChart3,
       MoreHorizontal
} from 'lucide-react'

type PeriodType = 'day' | 'week' | 'month' | 'year'

const BRAND_GREEN = '#B4EB18'
const BRAND_BLUE = '#0078F0'
const COLOR_PALETTE = ['#B4EB18', '#0078F0', '#A855F7', '#F59E0B', '#EF4444', '#14B8A6']

export default function ReportsPage() {
       const [periodType, setPeriodType] = useState<PeriodType>('month')
       const [currentDate, setCurrentDate] = useState(new Date())

       const [kpis, setKpis] = useState({
              income: { value: 0, change: 0 },
              occupancy: { value: 0, change: 0 },
              ticket: { value: 0, change: 0 },
              newClients: { value: 0, change: 0 }
       })
       const [finances, setFinances] = useState({ income: 0, expenses: 0, balance: 0, byCategory: {} as Record<string, number> })
       const [occupancyByCourt, setOccupancyByCourt] = useState<{ name: string, value: number }[]>([])
       const [transactions, setTransactions] = useState<any[]>([])
       const [bestClient, setBestClient] = useState<any>(null)
       const [loading, setLoading] = useState(true)

       // Date Range Logic
       const getDateRange = () => {
              const now = currentDate
              switch (periodType) {
                     case 'day': return { start: startOfDay(now), end: endOfDay(now) }
                     case 'week': return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
                     case 'month': return { start: startOfMonth(now), end: endOfMonth(now) }
                     case 'year': return { start: startOfMonth(now), end: endOfMonth(now) } // Simplified for now, usually startOfYear
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

       useEffect(() => {
              const loadData = async () => {
                     setLoading(true)
                     try {
                            const prevRange = getPrevDateRange(start, end)
                            const [kpiData, finData, occCourtData, txData, bestClientData] = await Promise.all([
                                   getDashboardKPIs(start, end, prevRange.start, prevRange.end),
                                   getFinancialStats(start, end),
                                   getOccupancyByCourt(start, end),
                                   getReportTransactions(start, end),
                                   getBestClient(start, end)
                            ])
                            setKpis(kpiData)
                            setFinances(finData)
                            setOccupancyByCourt(occCourtData)
                            setTransactions(txData)
                            setBestClient(bestClientData)
                     } catch (error) {
                            console.error("Error loading reports", error)
                     } finally {
                            setLoading(false)
                     }
              }
              loadData()
       }, [currentDate, periodType])

       // Chart Data Preparation
       const pieData = Object.entries(finances.byCategory).map(([name, value]) => ({
              name: name.replace(/_/g, ' '),
              value: Math.abs(value)
       })).filter(i => i.value > 0)

       // Handlers
       const downloadCSV = () => {
              // ... Reuse existing CSV logic ...
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
              <div className="min-h-screen bg-[#0C0F14] text-white font-sans pb-24 md:pb-8">

                     {/* --- Mobile Header --- */}
                     <header className="md:hidden flex items-center justify-between p-4 bg-[#0C0F14] sticky top-0 z-50 border-b border-white/5">
                            <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-white">
                                   <ChevronLeft size={24} />
                            </Link>
                            <h1 className="text-lg font-bold">Reportes</h1>
                            <button className="p-2 -mr-2 text-gray-400">
                                   <MoreHorizontal size={24} />
                            </button>
                     </header>

                     <div className="md:pl-8 md:pr-8 md:pt-8 max-w-[1600px] mx-auto">
                            {/* --- Desktop Header --- */}
                            <header className="hidden md:flex flex-row items-center justify-between mb-8">
                                   <div>
                                          <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard de Reportes</h1>
                                          <p className="text-gray-400 text-sm">Vista general de rendimiento y ocupación</p>
                                   </div>

                                   <div className="flex items-center gap-4 bg-[#1A1D21] p-1.5 rounded-xl border border-white/5">
                                          {(['day', 'week', 'month', 'year'] as PeriodType[]).map((p) => (
                                                 <button
                                                        key={p}
                                                        onClick={() => setPeriodType(p)}
                                                        className={cn(
                                                               "px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all",
                                                               periodType === p
                                                                      ? "bg-[#282A2D] text-white shadow-lg border border-white/5"
                                                                      : "text-gray-500 hover:text-white hover:bg-white/5"
                                                        )}
                                                 >
                                                        {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                                                 </button>
                                          ))}
                                   </div>

                                   <button
                                          onClick={downloadCSV}
                                          className="flex items-center gap-2 px-5 py-3 bg-[#B4EB18] hover:bg-[#a3d90f] text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(180,235,24,0.2)] active:scale-95"
                                   >
                                          <Download size={18} />
                                          Exportar
                                   </button>
                            </header>

                            {/* --- Mobile Period Selector --- */}
                            <div className="md:hidden px-4 mb-6">
                                   <div className="flex bg-[#1A1D21] p-1 rounded-xl border border-white/5">
                                          {(['day', 'week', 'month'] as PeriodType[]).map((p) => (
                                                 <button
                                                        key={p}
                                                        onClick={() => setPeriodType(p)}
                                                        className={cn(
                                                               "flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all",
                                                               periodType === p
                                                                      ? "bg-[#282A2D] text-white shadow-sm"
                                                                      : "text-gray-500"
                                                        )}
                                                 >
                                                        {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
                                                 </button>
                                          ))}
                                   </div>
                            </div>

                            {/* --- KPI Cards Grid --- */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0 mb-8">
                                   <KPICard
                                          title="Ingresos Totales"
                                          value={`$${kpis.income.value.toLocaleString('es-AR')}`}
                                          change={kpis.income.change}
                                          icon={<Banknote size={24} />}
                                          loading={loading}
                                   />
                                   <KPICard
                                          title="Ocupación Media"
                                          value={`${kpis.occupancy.value}%`}
                                          change={kpis.occupancy.change}
                                          icon={<BarChart3 size={24} />}
                                          color="blue"
                                          loading={loading}
                                   />
                                   <KPICard
                                          title="Ticket Promedio"
                                          value={`$${Math.round(kpis.ticket.value).toLocaleString('es-AR')}`}
                                          change={kpis.ticket.change}
                                          icon={<Ticket size={24} />}
                                          color="purple"
                                          loading={loading}
                                   />
                                   <KPICard
                                          title="Nuevos Clientes"
                                          value={kpis.newClients.value.toString()}
                                          change={kpis.newClients.change}
                                          icon={<Users size={24} />}
                                          color="orange"
                                          loading={loading}
                                   />
                            </div>

                            {/* --- Charts Section --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-0 mb-8">

                                   {/* Occupancy Chart */}
                                   <div className="col-span-1 lg:col-span-2 bg-[#1A1D21] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                                          <div className="flex justify-between items-start mb-8 z-10 relative">
                                                 <div>
                                                        <h3 className="text-lg font-bold text-white mb-1">Ocupación por Cancha</h3>
                                                        <p className="text-xs text-gray-500">Comparativa de rendimiento</p>
                                                 </div>
                                                 <div className="flex items-center gap-2 text-xs font-bold">
                                                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full text-[#B4EB18]">
                                                               <div className="w-2 h-2 rounded-full bg-[#B4EB18]" />
                                                               Actual
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full text-gray-500">
                                                               <div className="w-2 h-2 rounded-full bg-gray-500" />
                                                               Anterior
                                                        </div>
                                                 </div>
                                          </div>

                                          <div className="h-[250px] w-full z-10 relative">
                                                 {loading ? (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600">Cargando gráfico...</div>
                                                 ) : (
                                                        <ResponsiveContainer width="100%" height="100%">
                                                               <BarChart data={occupancyByCourt} barSize={40}>
                                                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                                      <XAxis
                                                                             dataKey="name"
                                                                             axisLine={false}
                                                                             tickLine={false}
                                                                             tick={{ fill: '#6B7280', fontSize: 12 }}
                                                                             dy={10}
                                                                      />
                                                                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                                                      <Tooltip
                                                                             contentStyle={{ backgroundColor: '#1A1D21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                                             itemStyle={{ color: '#fff' }}
                                                                             cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                                      />
                                                                      <Bar dataKey="value" fill={BRAND_GREEN} radius={[6, 6, 0, 0]} animationDuration={1500} />
                                                               </BarChart>
                                                        </ResponsiveContainer>
                                                 )}
                                          </div>
                                   </div>

                                   {/* Revenue Chart */}
                                   <div className="col-span-1 bg-[#1A1D21] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
                                          <h3 className="text-lg font-bold text-white mb-6 z-10">Ingresos por Categoría</h3>

                                          <div className="flex-1 min-h-[250px] relative z-10 flex items-center justify-center">
                                                 {loading ? (
                                                        <div className="text-gray-600">Cargando...</div>
                                                 ) : (
                                                        <div className="relative w-full h-[220px]">
                                                               <ResponsiveContainer width="100%" height="100%">
                                                                      <PieChart>
                                                                             <Pie
                                                                                    data={pieData}
                                                                                    innerRadius={65}
                                                                                    outerRadius={85}
                                                                                    paddingAngle={5}
                                                                                    dataKey="value"
                                                                                    stroke="none"
                                                                             >
                                                                                    {pieData.map((entry, index) => (
                                                                                           <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                                                                                    ))}
                                                                             </Pie>
                                                                      </PieChart>
                                                               </ResponsiveContainer>
                                                               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                                      <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Total</span>
                                                                      <span className="text-2xl font-black text-white">${(kpis.income.value / 1000).toFixed(1)}k</span>
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>

                                          <div className="mt-6 space-y-3 z-10">
                                                 {pieData.slice(0, 4).map((entry, index) => (
                                                        <div key={index} className="flex items-center justify-between text-sm">
                                                               <div className="flex items-center gap-2">
                                                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_PALETTE[index] }} />
                                                                      <span className="text-gray-300 capitalize">{entry.name.toLowerCase()}</span>
                                                               </div>
                                                               <span className="font-bold text-gray-500">
                                                                      {Math.round((entry.value / finances.income) * 100)}%
                                                               </span>
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>
                            </div>

                            {/* --- Lists Section --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-0 mb-20 md:mb-8">
                                   <div className="bg-[#1A1D21] border border-white/5 rounded-3xl p-6 md:p-8">
                                          <div className="flex justify-between items-center mb-6">
                                                 <h3 className="text-lg font-bold text-white">Rendimiento por Desempeño</h3>
                                                 <Link href="#" className="text-xs font-bold text-[#B4EB18] hover:underline uppercase tracking-wider">Ver Informe</Link>
                                          </div>
                                          <div className="space-y-4">
                                                 {occupancyByCourt.length === 0 ? (
                                                        <div className="text-gray-500 text-sm text-center py-4">No hay datos suficientes</div>
                                                 ) : occupancyByCourt.slice(0, 5).map((court, i) => {
                                                        const total = occupancyByCourt.reduce((acc, c) => acc + c.value, 0)
                                                        const pct = total > 0 ? Math.round((court.value / total) * 100) : 0
                                                        return (
                                                               <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors">
                                                                      <div className="flex items-center gap-3">
                                                                             <div className="bg-white/10 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">
                                                                                    {i + 1}
                                                                             </div>
                                                                             <span className="text-sm font-bold text-gray-300">{court.name}</span>
                                                                      </div>
                                                                      <div className="flex items-center gap-4">
                                                                             <span className="text-sm font-mono text-[#B4EB18] font-bold">{pct}%</span>
                                                                             <span className="text-xs text-gray-500 uppercase">{pct > 20 ? 'Excelente' : 'Normal'}</span>
                                                                      </div>
                                                               </div>
                                                        )
                                                 })}
                                          </div>
                                   </div>

                                   <div className="bg-[#1A1D21] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
                                          <div className="absolute top-0 right-0 p-32 bg-[#B4EB18] opacity-5 filter blur-[80px] rounded-full translate-x-12 -translate-y-12"></div>
                                          <div>
                                                 <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                               <h3 className="text-lg font-bold text-white">Cliente del Mes</h3>
                                                               <p className="text-xs text-gray-500 capitalize">{format(currentDate, 'MMMM yyyy', { locale: es })}</p>
                                                        </div>
                                                        <div className="bg-[#B4EB18]/20 p-2 rounded-full text-[#B4EB18]">
                                                               <TrendingUp size={20} />
                                                        </div>
                                                 </div>
                                                 {bestClient ? (
                                                        <div className="flex items-center gap-4">
                                                               <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B4EB18] to-emerald-600 p-[2px]">
                                                                      <div className="w-full h-full rounded-full bg-[#1A1D21] flex items-center justify-center text-xl font-bold text-white">
                                                                             {bestClient.initials}
                                                                      </div>
                                                               </div>
                                                               <div>
                                                                      <h4 className="text-2xl font-bold text-white max-w-[200px] truncate" title={bestClient.name}>{bestClient.name}</h4>
                                                                      <p className="text-[#B4EB18] text-sm font-bold">{bestClient.bookings} Reservas</p>
                                                               </div>
                                                        </div>
                                                 ) : (
                                                        <div className="text-gray-500 text-sm py-4">No hay datos suficientes este mes</div>
                                                 )}
                                          </div>
                                          <div className="flex gap-2 mt-8">
                                                 {["Puntualidad Perfecta", "Cliente Frecuente", "Top Spender"].map(tag => (
                                                        <span key={tag} className="bg-white/5 text-[10px] px-2 py-1 rounded text-gray-400 border border-white/5">{tag}</span>
                                                 ))}
                                          </div>
                                   </div>
                            </div>
                     </div>

                     {/* --- Mobile Bottom Nav (Simulated/Independent for this specific Page if layout doesn't handle) --- */}
                     {/* The screenshot has a specific style, so I implement it here just for the screenshot fidelity, ideally this is Global */}
                     <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0F14]/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex justify-between items-center z-50 safe-area-bottom">
                            <NavItem icon={<Home size={22} />} label="Inicio" />
                            <NavItem icon={<CalendarDays size={22} />} label="Reservas" />
                            <NavItem icon={<BarChart3 size={22} />} label="Reportes" active />
                            <NavItem icon={<Settings size={22} />} label="Ajustes" />
                     </div>
              </div>
       )
}

// Subcomponents

function KPICard({ title, value, change, icon, color = 'green', loading }: any) {
       const isPositive = change >= 0
       const colorClass = color === 'green' ? 'text-[#B4EB18] bg-[#B4EB18]/10' :
              color === 'blue' ? 'text-[#0078F0] bg-[#0078F0]/10' :
                     color === 'purple' ? 'text-[#A855F7] bg-[#A855F7]/10' :
                            'text-[#F59E0B] bg-[#F59E0B]/10'

       return (
              <div className="bg-[#1A1D21] border border-white/5 p-5 md:p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                     <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-3 rounded-xl", colorClass)}>
                                   {icon}
                            </div>
                            <div className={cn(
                                   "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                   isPositive ? "text-[#B4EB18] bg-[#B4EB18]/10" : "text-red-500 bg-red-500/10"
                            )}>
                                   {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                   {Math.abs(change).toFixed(1)}%
                            </div>
                     </div>
                     <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                     <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                            {loading ? "..." : value}
                     </h3>
              </div>
       )
}

function NavItem({ icon, label, active }: any) {
       return (
              <button className={cn("flex flex-col items-center gap-1", active ? "text-[#B4EB18]" : "text-gray-500")}>
                     {icon}
                     <span className="text-[10px] font-medium">{label}</span>
              </button>
       )
}
