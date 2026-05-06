'use client'

import type { ComponentType, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  Clock3,
  Download,
  Inbox,
  ShieldAlert,
  Trophy,
  Users,
  UserPlus,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getReportsSnapshot } from '@/actions/reports'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Props = {
  canViewReports: boolean
}

type RangePreset = 'month' | '30d' | '90d' | '7d' | 'custom'

const PRESET_LABELS: Record<Exclude<RangePreset, 'custom'>, string> = {
  month: 'Este mes',
  '30d': '30 dias',
  '90d': '90 dias',
  '7d': '7 dias',
}

const CHART_COLORS = ['#B4EB18', '#14B8A6', '#38BDF8', '#F59E0B', '#FB7185']

function toInputDate(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatChange(change: number) {
  if (change === 0) return '0%'
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
}

function buildPresetRange(preset: Exclude<RangePreset, 'custom'>) {
  const today = new Date()

  if (preset === 'month') {
    return {
      startDate: toInputDate(startOfMonth(today)),
      endDate: toInputDate(endOfMonth(today)),
    }
  }

  const days = preset === '7d' ? 6 : preset === '30d' ? 29 : 89
  return {
    startDate: toInputDate(subDays(today, days)),
    endDate: toInputDate(today),
  }
}

export default function ReportsDashboard({ canViewReports }: Props) {
  const [preset, setPreset] = useState<RangePreset>('month')
  const [range, setRange] = useState(buildPresetRange('month'))

  const query = useQuery({
    queryKey: ['reports-snapshot', range.startDate, range.endDate],
    queryFn: () => getReportsSnapshot(range),
    placeholderData: (previousData) => previousData,
    enabled: canViewReports,
  })

  const titleRange = useMemo(() => {
    const start = new Date(`${range.startDate}T00:00:00`)
    const end = new Date(`${range.endDate}T00:00:00`)

    if (range.startDate === range.endDate) {
      return format(start, "d 'de' MMMM", { locale: es })
    }

    return `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`
  }, [range.endDate, range.startDate])

  function handlePresetChange(nextPreset: Exclude<RangePreset, 'custom'>) {
    setPreset(nextPreset)
    setRange(buildPresetRange(nextPreset))
  }

  function handleDateChange(field: 'startDate' | 'endDate', value: string) {
    setPreset('custom')
    setRange((current) => ({ ...current, [field]: value }))
  }

  function handleExport() {
    const queryParams = new URLSearchParams({
      start: range.startDate,
      end: range.endDate,
    })

    window.open(`/api/export/reportes?${queryParams.toString()}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <Header title="Reportes" backHref="/dashboard" minimal />

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-8">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-6">
          {!canViewReports ? (
            <div className="rounded-[2rem] border border-border/60 bg-card/40 p-8 shadow-xl">
              <EmptyState
                icon={ShieldAlert}
                title="Sin permiso para ver reportes"
                description="Solo usuarios con acceso financiero pueden abrir esta seccion. Si lo necesitas, revisa los permisos del rol en configuracion."
                action={{ label: 'Volver al dashboard', href: '/dashboard' }}
              />
            </div>
          ) : (
            <>
              <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/60 p-5 shadow-2xl backdrop-blur md:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,235,24,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_32%)]" />
                <div className="relative flex flex-col gap-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                        <CalendarRange className="h-3.5 w-3.5" />
                        Inteligencia del club
                      </span>
                      <div>
                        <h1 className="text-2xl font-black tracking-tight md:text-4xl">Reportes para decidir con datos</h1>
                        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
                          Ingresos, ocupacion, clientes y demanda en un solo lugar. El foco esta puesto en que el duenio del club vea rapido donde vende mas y donde esta perdiendo actividad.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleExport}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.01] active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4" />
                      Exportar Excel
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 rounded-[1.6rem] border border-border/60 bg-background/70 p-4 md:p-5">
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(PRESET_LABELS) as Array<Exclude<RangePreset, 'custom'>>).map((item) => (
                        <button
                          key={item}
                          onClick={() => handlePresetChange(item)}
                          className={cn(
                            'rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all',
                            preset === item
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                              : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                          )}
                        >
                          {PRESET_LABELS[item]}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <label className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Desde</span>
                        <input
                          type="date"
                          value={range.startDate}
                          onChange={(event) => handleDateChange('startDate', event.target.value)}
                          className="bg-transparent text-sm font-semibold outline-none"
                        />
                      </label>

                      <label className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-sm">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Hasta</span>
                        <input
                          type="date"
                          value={range.endDate}
                          onChange={(event) => handleDateChange('endDate', event.target.value)}
                          className="bg-transparent text-sm font-semibold outline-none"
                        />
                      </label>

                      <div className="flex items-center rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-sm font-semibold text-muted-foreground">
                        {titleRange}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {query.isLoading && !query.data ? (
                <ReportsLoading />
              ) : query.error ? (
                <section className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-red-500">
                  <h2 className="text-lg font-black">No se pudieron cargar los reportes</h2>
                  <p className="mt-2 text-sm">{query.error instanceof Error ? query.error.message : 'Intenta de nuevo en unos segundos.'}</p>
                </section>
              ) : query.data && !query.data.hasData ? (
                <section className="rounded-[2rem] border border-border/60 bg-card/50 p-8 shadow-xl">
                  <EmptyState
                    icon={BarChart3}
                    title="Todavia no hay datos suficientes"
                    description="Cuando empieces a cobrar reservas o sumar actividad del club, esta vista te mostrara tendencias, mejores clientes y horarios con mas demanda."
                    action={{ label: 'Ir a reservas', href: '/dashboard?view=bookings' }}
                  />
                </section>
              ) : query.data ? (
                <>
                  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <KpiCard
                      title="Ingresos del mes"
                      value={formatCurrency(query.data.summary.monthRevenue, query.data.club.currency)}
                      icon={Wallet}
                      tone="lime"
                      caption={`Mes calendario de ${format(new Date(`${range.endDate}T00:00:00`), 'MMMM', { locale: es })}`}
                    />
                    <KpiCard
                      title="Ingresos del periodo"
                      value={formatCurrency(query.data.summary.periodRevenue, query.data.club.currency)}
                      icon={ArrowUpRight}
                      tone="cyan"
                      change={query.data.comparisons.revenue.change}
                      caption={`vs ${query.data.range.previousStartDate} - ${query.data.range.previousEndDate}`}
                    />
                    <KpiCard
                      title="Reservas"
                      value={query.data.summary.bookings.toString()}
                      icon={CalendarRange}
                      tone="violet"
                      change={query.data.comparisons.bookings.change}
                      caption="Turnos confirmados o pendientes"
                    />
                    <KpiCard
                      title="Ocupacion"
                      value={`${query.data.summary.occupancy.toFixed(1)}%`}
                      icon={Activity}
                      tone="amber"
                      change={query.data.comparisons.occupancy.change}
                      caption="Uso sobre la capacidad abierta"
                    />
                    <KpiCard
                      title="Clientes nuevos"
                      value={query.data.summary.newClients.toString()}
                      icon={UserPlus}
                      tone="emerald"
                      change={query.data.comparisons.newClients.change}
                      caption="Alta dentro del periodo"
                    />
                    <KpiCard
                      title="Clientes recurrentes"
                      value={query.data.summary.recurrentClients.toString()}
                      icon={Users}
                      tone="rose"
                      caption="Con 2 o mas reservas en el periodo"
                    />
                  </section>

                  <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
                    <Panel
                      title="Evolucion de ingresos"
                      description="Sirve para detectar picos, semanas flojas y reaccionar con campañas o pricing antes de que baje la agenda."
                    >
                      <div className="mb-5 grid gap-3 md:grid-cols-4">
                        <MiniStat label="Ticket promedio" value={formatCurrency(query.data.summary.avgTicket, query.data.club.currency)} />
                        <MiniStat label="Gastos del periodo" value={formatCurrency(query.data.summary.periodExpenses, query.data.club.currency)} />
                        <MiniStat label="Cancelaciones" value={query.data.summary.cancellations.toString()} />
                        <MiniStat label="No-shows" value={query.data.summary.noShows.toString()} />
                      </div>

                      <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={query.data.trend}>
                            <defs>
                              <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="5%" stopColor="#B4EB18" stopOpacity={0.38} />
                                <stop offset="95%" stopColor="#B4EB18" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                            <XAxis dataKey="label" tick={{ fill: 'currentColor', fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} tickLine={false} axisLine={false} />
                            <Tooltip
                              formatter={(value: number | undefined, name) => (
                                name === 'revenue'
                                  ? [formatCurrency(value || 0, query.data.club.currency), 'Ingresos']
                                  : [value || 0, 'Reservas']
                              )}
                              contentStyle={{
                                borderRadius: 18,
                                border: '1px solid rgba(148,163,184,0.16)',
                                background: 'rgba(15,23,42,0.96)',
                                color: '#fff',
                              }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#B4EB18" strokeWidth={3} fill="url(#revenue-fill)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Panel>

                    <Panel
                      title="Estado del negocio"
                      description="Te muestra la mezcla actual entre actividad, perdida de clientes y friccion operativa."
                    >
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <StatusTile label="Clientes inactivos" value={query.data.summary.inactiveClients} tone="slate" />
                        <StatusTile label="Cancelaciones" value={query.data.summary.cancellations} tone="rose" />
                        <StatusTile label="No-shows" value={query.data.summary.noShows} tone="amber" />
                        <StatusTile label="Reservas pendientes" value={query.data.statusOverview.pending} tone="cyan" />
                      </div>
                    </Panel>
                  </section>

                  <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
                    <Panel
                      title="Canchas y horarios que mas rinden"
                      description="Ideal para saber que cancha conviene destacar, donde abrir promociones y que horarios necesitan empuje."
                    >
                      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
                        <div>
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">Canchas mas usadas</h3>
                            <span className="text-xs font-semibold text-muted-foreground">{query.data.courtUsage.length} canchas activas</span>
                          </div>
                          <div className="space-y-3">
                            {query.data.courtUsage.map((court) => (
                              <div key={court.courtId} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-bold">{court.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {court.bookings} reservas · {court.hours} horas
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-black">{court.occupancy.toFixed(1)}%</p>
                                    <p className="text-xs text-muted-foreground">ocupacion</p>
                                  </div>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${Math.min(100, court.occupancy)}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">Horarios pico</h3>
                            <Clock3 className="h-4 w-4 text-primary" />
                          </div>
                          {query.data.topHours.length === 0 ? (
                            <ChartFallback text="Aun no hay reservas para detectar horarios fuertes." />
                          ) : (
                            <div className="h-[280px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={query.data.topHours}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                  <XAxis dataKey="hour" tick={{ fill: 'currentColor', fontSize: 12 }} tickLine={false} axisLine={false} />
                                  <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} tickLine={false} axisLine={false} />
                                  <Tooltip
                                    formatter={(value: number | undefined) => [value || 0, 'Reservas']}
                                    contentStyle={{
                                      borderRadius: 18,
                                      border: '1px solid rgba(148,163,184,0.16)',
                                      background: 'rgba(15,23,42,0.96)',
                                      color: '#fff',
                                    }}
                                  />
                                  <Bar dataKey="bookings" radius={[12, 12, 0, 0]}>
                                    {query.data.topHours.map((entry, index) => (
                                      <Cell key={entry.hour} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      </div>
                    </Panel>

                    <Panel
                      title="Base de clientes"
                      description="Los mejores clubes no solo venden hoy: entienden quienes vuelven, quienes se enfrían y a quienes conviene recuperar."
                    >
                      <div className="grid gap-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <StatusTile label="Nuevos" value={query.data.summary.newClients} tone="emerald" />
                          <StatusTile label="Recurrentes" value={query.data.summary.recurrentClients} tone="lime" />
                          <StatusTile label="Inactivos 90d" value={query.data.summary.inactiveClients} tone="slate" />
                        </div>

                        <div className="rounded-[1.5rem] border border-border/60 bg-background/70 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">Mejores clientes</h3>
                            <Trophy className="h-4 w-4 text-primary" />
                          </div>

                          {query.data.topClients.length === 0 ? (
                            <ChartFallback text="Cuando haya reservas asociadas a clientes, aca vas a ver quienes sostienen la agenda." />
                          ) : (
                            <div className="space-y-3">
                              {query.data.topClients.map((client, index) => (
                                <div key={client.clientId} className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card/60 p-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 font-black text-primary">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-bold">{client.name}</p>
                                      <p className="text-sm text-muted-foreground">{client.bookings} reservas en el periodo</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black">{formatCurrency(client.spent, query.data.club.currency)}</p>
                                    <p className="text-xs text-muted-foreground">facturado</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Panel>
                  </section>

                  <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                    <Panel
                      title="Estados de las reservas"
                      description="Una foto simple de lo que hoy esta firme, pendiente o se esta cayendo."
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <StatusTile label="Confirmadas" value={query.data.statusOverview.confirmed} tone="lime" />
                        <StatusTile label="Pendientes" value={query.data.statusOverview.pending} tone="cyan" />
                        <StatusTile label="Canceladas" value={query.data.statusOverview.canceled} tone="rose" />
                        <StatusTile label="No-show" value={query.data.statusOverview.noShow} tone="amber" />
                      </div>
                    </Panel>

                    <Panel
                      title="Cobros por metodo"
                      description="Te ayuda a ver si el club depende demasiado del efectivo o si ya esta moviendo pagos digitales."
                    >
                      {query.data.paymentMethods.length === 0 ? (
                        <ChartFallback text="Todavia no hay cobros registrados para este rango." />
                      ) : (
                        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                          <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={query.data.paymentMethods}
                                  dataKey="value"
                                  nameKey="name"
                                  innerRadius={56}
                                  outerRadius={92}
                                  paddingAngle={3}
                                >
                                  {query.data.paymentMethods.map((entry, index) => (
                                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value: number | undefined) => formatCurrency(value || 0, query.data.club.currency)}
                                  contentStyle={{
                                    borderRadius: 18,
                                    border: '1px solid rgba(148,163,184,0.16)',
                                    background: 'rgba(15,23,42,0.96)',
                                    color: '#fff',
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="space-y-3">
                            {query.data.paymentMethods.map((item, index) => (
                              <div key={item.name} className="rounded-2xl border border-border/50 bg-background/70 p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                    <span className="font-semibold">{item.name}</span>
                                  </div>
                                  <span className="font-black">{formatCurrency(item.value, query.data.club.currency)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Panel>
                  </section>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ReportsLoading() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-[1.75rem] border border-border/60 bg-card/50 p-5">
            <Skeleton className="mb-3 h-3 w-24" />
            <Skeleton className="mb-4 h-10 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <div className="rounded-[1.75rem] border border-border/60 bg-card/50 p-6">
          <Skeleton className="mb-3 h-4 w-52" />
          <Skeleton className="mb-6 h-3 w-full max-w-[420px]" />
          <div className="grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="mt-6 h-[320px] rounded-[1.5rem]" />
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/50 p-6">
          <Skeleton className="mb-3 h-4 w-40" />
          <Skeleton className="mb-6 h-3 w-full max-w-[280px]" />
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Panel(props: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[2rem] border border-border/60 bg-card/55 p-5 shadow-xl backdrop-blur md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-black tracking-tight">{props.title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{props.description}</p>
      </div>
      {props.children}
    </section>
  )
}

function KpiCard(props: {
  title: string
  value: string
  caption: string
  icon: ComponentType<{ className?: string }>
  tone: 'lime' | 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose'
  change?: number
}) {
  const toneClasses: Record<typeof props.tone, string> = {
    lime: 'from-lime-400/20 via-lime-400/8 to-transparent text-lime-300',
    cyan: 'from-cyan-400/20 via-cyan-400/8 to-transparent text-cyan-300',
    violet: 'from-violet-400/20 via-violet-400/8 to-transparent text-violet-300',
    amber: 'from-amber-400/20 via-amber-400/8 to-transparent text-amber-300',
    emerald: 'from-emerald-400/20 via-emerald-400/8 to-transparent text-emerald-300',
    rose: 'from-rose-400/20 via-rose-400/8 to-transparent text-rose-300',
  }

  const Icon = props.icon

  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/55 p-5 shadow-xl">
      <div className={cn('absolute inset-0 bg-gradient-to-br', toneClasses[props.tone])} />
      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="rounded-2xl bg-background/70 p-3 backdrop-blur">
            <Icon className="h-5 w-5" />
          </div>
          {typeof props.change === 'number' ? (
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black tracking-[0.16em]',
              props.change >= 0 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400',
            )}>
              {props.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {formatChange(props.change)}
            </span>
          ) : null}
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">{props.title}</p>
        <p className="mt-2 text-3xl font-black tracking-tight">{props.value}</p>
        <p className="mt-3 text-sm text-muted-foreground">{props.caption}</p>
      </div>
    </article>
  )
}

function MiniStat(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{props.label}</p>
      <p className="mt-2 text-lg font-black">{props.value}</p>
    </div>
  )
}

function StatusTile(props: {
  label: string
  value: number
  tone: 'lime' | 'cyan' | 'rose' | 'amber' | 'slate' | 'emerald'
}) {
  const toneClasses: Record<typeof props.tone, string> = {
    lime: 'border-lime-500/20 bg-lime-500/10 text-lime-300',
    cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    slate: 'border-border/70 bg-background/70 text-foreground',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  }

  return (
    <div className={cn('rounded-2xl border p-4', toneClasses[props.tone])}>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] opacity-80">{props.label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{props.value}</p>
    </div>
  )
}

function ChartFallback({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/40 bg-muted/20 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60">
        <Inbox className="h-5 w-5 text-muted-foreground/60" />
      </div>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground/70">{text}</p>
    </div>
  )
}
