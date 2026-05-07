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
  UserPlus,
  Users,
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

type KpiItem = {
  title: string
  value: string
  caption: string
  icon: ComponentType<{ className?: string }>
  tone: 'lime' | 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose'
  change?: number
}

type ExecutiveSignalItem = {
  label: string
  value: string
  detail: string
}

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

  const snapshot = query.data

  const kpis: KpiItem[] = snapshot ? [
    {
      title: 'Ingresos del mes',
      value: formatCurrency(snapshot.summary.monthRevenue, snapshot.club.currency),
      icon: Wallet,
      tone: 'lime',
      caption: `Mes calendario de ${format(new Date(`${range.endDate}T00:00:00`), 'MMMM', { locale: es })}`,
    },
    {
      title: 'Ingresos del periodo',
      value: formatCurrency(snapshot.summary.periodRevenue, snapshot.club.currency),
      icon: ArrowUpRight,
      tone: 'cyan',
      change: snapshot.comparisons.revenue.change,
      caption: `vs ${snapshot.range.previousStartDate} - ${snapshot.range.previousEndDate}`,
    },
    {
      title: 'Reservas',
      value: snapshot.summary.bookings.toString(),
      icon: CalendarRange,
      tone: 'violet',
      change: snapshot.comparisons.bookings.change,
      caption: 'Turnos confirmados o pendientes',
    },
    {
      title: 'Ocupacion',
      value: `${snapshot.summary.occupancy.toFixed(1)}%`,
      icon: Activity,
      tone: 'amber',
      change: snapshot.comparisons.occupancy.change,
      caption: 'Uso sobre la capacidad abierta',
    },
    {
      title: 'Clientes nuevos',
      value: snapshot.summary.newClients.toString(),
      icon: UserPlus,
      tone: 'emerald',
      change: snapshot.comparisons.newClients.change,
      caption: 'Alta dentro del periodo',
    },
    {
      title: 'Clientes recurrentes',
      value: snapshot.summary.recurrentClients.toString(),
      icon: Users,
      tone: 'rose',
      caption: 'Con 2 o mas reservas en el periodo',
    },
  ] : []

  const primaryKpis = kpis.slice(0, 2)
  const secondaryKpis = kpis.slice(2)

  const executiveSignals: ExecutiveSignalItem[] = snapshot ? [
    snapshot.topHours[0]
      ? {
          label: 'Hora mas fuerte',
          value: `${snapshot.topHours[0].hour} hs`,
          detail: `${snapshot.topHours[0].bookings} reservas`,
        }
      : {
          label: 'Hora mas fuerte',
          value: 'Sin dato',
          detail: 'Todavia sin pico detectado',
        },
    snapshot.courtUsage[0]
      ? {
          label: 'Cancha lider',
          value: snapshot.courtUsage[0].name,
          detail: `${snapshot.courtUsage[0].occupancy.toFixed(1)}% ocupacion`,
        }
      : {
          label: 'Cancha lider',
          value: 'Sin dato',
          detail: 'Sin actividad suficiente',
        },
    snapshot.paymentMethods[0]
      ? {
          label: 'Cobro dominante',
          value: snapshot.paymentMethods[0].name,
          detail: formatCurrency(snapshot.paymentMethods[0].value, snapshot.club.currency),
        }
      : {
          label: 'Cobro dominante',
          value: 'Sin dato',
          detail: 'Aun no hay cobros',
        },
  ] : []

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

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3 md:px-8 md:pb-8 md:pt-8">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-4 md:gap-6">
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
              <section className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/60 p-4 shadow-2xl backdrop-blur md:rounded-[2rem] md:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,235,24,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_32%)]" />
                <div className="relative flex flex-col gap-3 md:gap-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary md:text-[11px] md:tracking-[0.24em]">
                        <CalendarRange className="h-3.5 w-3.5" />
                        Inteligencia del club
                      </span>
                      <div className="space-y-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h1 className="text-xl font-black tracking-tight sm:text-2xl md:text-4xl">Reportes para decidir con datos</h1>
                          <span className="inline-flex w-fit items-center rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                            {titleRange}
                          </span>
                        </div>
                        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                          Ingresos, ocupacion, clientes y demanda en un solo lugar. En mobile, la vista prioriza primero lo importante y despues el detalle analitico.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleExport}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.01] active:scale-[0.98] sm:w-fit"
                    >
                      <Download className="h-4 w-4" />
                      Exportar Excel
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 rounded-[1.4rem] border border-border/60 bg-background/70 p-3.5 md:gap-4 md:rounded-[1.6rem] md:p-5">
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(PRESET_LABELS) as Array<Exclude<RangePreset, 'custom'>>).map((item) => (
                        <button
                          key={item}
                          onClick={() => handlePresetChange(item)}
                          className={cn(
                            'rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition-all md:px-4 md:text-xs md:tracking-[0.18em]',
                            preset === item
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                              : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                          )}
                        >
                          {PRESET_LABELS[item]}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[1fr_1fr_auto]">
                      <label className="flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card/70 px-3.5 py-3 text-sm md:px-4">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Desde</span>
                        <input
                          type="date"
                          value={range.startDate}
                          onChange={(event) => handleDateChange('startDate', event.target.value)}
                          className="bg-transparent text-sm font-semibold outline-none"
                        />
                      </label>

                      <label className="flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card/70 px-3.5 py-3 text-sm md:px-4">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Hasta</span>
                        <input
                          type="date"
                          value={range.endDate}
                          onChange={(event) => handleDateChange('endDate', event.target.value)}
                          className="bg-transparent text-sm font-semibold outline-none"
                        />
                      </label>

                      <div className="flex items-center rounded-2xl border border-dashed border-border/60 bg-card/50 px-3.5 py-3 text-sm font-semibold text-muted-foreground md:px-4">
                        {titleRange}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {query.isLoading && !snapshot ? (
                <ReportsLoading />
              ) : query.error ? (
                <section className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-red-500">
                  <h2 className="text-lg font-black">No se pudieron cargar los reportes</h2>
                  <p className="mt-2 text-sm">{query.error instanceof Error ? query.error.message : 'Intenta de nuevo en unos segundos.'}</p>
                </section>
              ) : snapshot && !snapshot.hasData ? (
                <section className="rounded-[2rem] border border-border/60 bg-card/50 p-8 shadow-xl">
                  <EmptyState
                    icon={BarChart3}
                    title="Todavia no hay datos suficientes"
                    description="Cuando empieces a cobrar reservas o sumar actividad del club, esta vista te mostrara tendencias, mejores clientes y horarios con mas demanda."
                    action={{ label: 'Ir a reservas', href: '/dashboard?view=bookings' }}
                  />
                </section>
              ) : snapshot ? (
                <>
                  <section className="space-y-3 md:space-y-4">
                    <div className="flex items-end justify-between gap-3 px-1">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resumen ejecutivo</p>
                        <h2 className="mt-1 text-lg font-black tracking-tight md:text-xl">Primero lo que define el periodo</h2>
                      </div>
                      <span className="hidden text-sm font-semibold text-muted-foreground md:inline-flex">{titleRange}</span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {primaryKpis.map((item) => (
                        <KpiCard key={item.title} {...item} />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      {secondaryKpis.map((item) => (
                        <KpiCard key={item.title} {...item} compact />
                      ))}
                    </div>
                  </section>

                  <section className="grid gap-3 md:hidden">
                    {executiveSignals.map((signal) => (
                      <ExecutiveSignal key={signal.label} {...signal} />
                    ))}
                  </section>

                  <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
                    <Panel
                      title="Evolucion de ingresos"
                      description="Detecta picos, semanas flojas y reacciona rapido antes de que baje la agenda."
                    >
                      <div className="mb-4 grid grid-cols-2 gap-3 md:mb-5 md:grid-cols-4">
                        <MiniStat label="Ticket promedio" value={formatCurrency(snapshot.summary.avgTicket, snapshot.club.currency)} />
                        <MiniStat label="Gastos del periodo" value={formatCurrency(snapshot.summary.periodExpenses, snapshot.club.currency)} />
                        <MiniStat label="Cancelaciones" value={snapshot.summary.cancellations.toString()} />
                        <MiniStat label="No-shows" value={snapshot.summary.noShows.toString()} />
                      </div>

                      <div className="h-[240px] sm:h-[280px] md:h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={snapshot.trend}>
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
                                  ? [formatCurrency(value || 0, snapshot.club.currency), 'Ingresos']
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
                      description="Actividad, perdida de clientes y friccion operativa en una lectura corta."
                    >
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <StatusTile label="Clientes inactivos" value={snapshot.summary.inactiveClients} tone="slate" compact />
                        <StatusTile label="Cancelaciones" value={snapshot.summary.cancellations} tone="rose" compact />
                        <StatusTile label="No-shows" value={snapshot.summary.noShows} tone="amber" compact />
                        <StatusTile label="Reservas pendientes" value={snapshot.statusOverview.pending} tone="cyan" compact />
                      </div>
                    </Panel>
                  </section>

                  <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
                    <Panel
                      title="Canchas y horarios que mas rinden"
                      description="Que cancha conviene destacar y en que horarios hace falta empuje."
                    >
                      <div className="grid gap-5 md:gap-6 lg:grid-cols-[1.25fr_1fr]">
                        <div>
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">Canchas mas usadas</h3>
                            <span className="text-xs font-semibold text-muted-foreground">{snapshot.courtUsage.length} canchas activas</span>
                          </div>
                          <div className="space-y-3">
                            {snapshot.courtUsage.map((court, index) => (
                              <div
                                key={court.courtId}
                                className={cn(
                                  'rounded-2xl border border-border/60 bg-background/80 p-3.5 md:p-4',
                                  index > 2 && 'hidden md:block',
                                )}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-bold">{court.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {court.bookings} reservas - {court.hours} horas
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
                          {snapshot.courtUsage.length > 3 ? (
                            <p className="mt-3 text-xs font-medium text-muted-foreground md:hidden">
                              Se muestran las 3 canchas mas activas para mantener la lectura agil.
                            </p>
                          ) : null}
                        </div>

                        <div>
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">Horarios pico</h3>
                            <Clock3 className="h-4 w-4 text-primary" />
                          </div>
                          {snapshot.topHours.length === 0 ? (
                            <ChartFallback text="Aun no hay reservas para detectar horarios fuertes." />
                          ) : (
                            <div className="h-[220px] sm:h-[260px] md:h-[280px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={snapshot.topHours}>
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
                                    {snapshot.topHours.map((entry, index) => (
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
                      description="Quienes vuelven, quienes se enfrian y a quienes conviene recuperar."
                    >
                      <div className="grid gap-4">
                        <div className="grid grid-cols-3 gap-3">
                          <StatusTile label="Nuevos" value={snapshot.summary.newClients} tone="emerald" compact />
                          <StatusTile label="Recurrentes" value={snapshot.summary.recurrentClients} tone="lime" compact />
                          <StatusTile label="Inactivos 90d" value={snapshot.summary.inactiveClients} tone="slate" compact />
                        </div>

                        <div className="rounded-[1.5rem] border border-border/60 bg-background/70 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">Mejores clientes</h3>
                            <Trophy className="h-4 w-4 text-primary" />
                          </div>

                          {snapshot.topClients.length === 0 ? (
                            <ChartFallback text="Cuando haya reservas asociadas a clientes, aca vas a ver quienes sostienen la agenda." />
                          ) : (
                            <div className="space-y-3">
                              {snapshot.topClients.map((client, index) => (
                                <div
                                  key={client.clientId}
                                  className={cn(
                                    'flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card/60 p-3',
                                    index > 2 && 'hidden md:flex',
                                  )}
                                >
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
                                    <p className="font-black">{formatCurrency(client.spent, snapshot.club.currency)}</p>
                                    <p className="text-xs text-muted-foreground">facturado</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {snapshot.topClients.length > 3 ? (
                            <p className="mt-3 text-xs font-medium text-muted-foreground md:hidden">
                              El ranking completo se mantiene visible en pantallas grandes.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </Panel>
                  </section>

                  <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                    <Panel
                      title="Estados de las reservas"
                      description="Una foto corta de lo que esta firme, pendiente o cayendose."
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <StatusTile label="Confirmadas" value={snapshot.statusOverview.confirmed} tone="lime" compact />
                        <StatusTile label="Pendientes" value={snapshot.statusOverview.pending} tone="cyan" compact />
                        <StatusTile label="Canceladas" value={snapshot.statusOverview.canceled} tone="rose" compact />
                        <StatusTile label="No-show" value={snapshot.statusOverview.noShow} tone="amber" compact />
                      </div>
                    </Panel>

                    <Panel
                      title="Cobros por metodo"
                      description="Mide si el club depende demasiado del efectivo o ya mueve pagos digitales."
                    >
                      {snapshot.paymentMethods.length === 0 ? (
                        <ChartFallback text="Todavia no hay cobros registrados para este rango." />
                      ) : (
                        <div className="grid gap-5 md:gap-6 lg:grid-cols-[1fr_1fr]">
                          <div className="h-[210px] sm:h-[230px] md:h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={snapshot.paymentMethods}
                                  dataKey="value"
                                  nameKey="name"
                                  innerRadius={56}
                                  outerRadius={92}
                                  paddingAngle={3}
                                >
                                  {snapshot.paymentMethods.map((entry, index) => (
                                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value: number | undefined) => formatCurrency(value || 0, snapshot.club.currency)}
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
                            {snapshot.paymentMethods.map((item, index) => (
                              <div
                                key={item.name}
                                className={cn(
                                  'rounded-2xl border border-border/50 bg-background/70 p-3',
                                  index > 3 && 'hidden md:block',
                                )}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                    <span className="font-semibold">{item.name}</span>
                                  </div>
                                  <span className="font-black">{formatCurrency(item.value, snapshot.club.currency)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {snapshot.paymentMethods.length > 4 ? (
                        <p className="mt-3 text-xs font-medium text-muted-foreground md:hidden">
                          En mobile se priorizan los 4 metodos principales.
                        </p>
                      ) : null}
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
    <section className="rounded-[1.75rem] border border-border/60 bg-card/55 p-4 shadow-xl backdrop-blur md:rounded-[2rem] md:p-6">
      <div className="mb-4 md:mb-5">
        <h2 className="text-lg font-black tracking-tight md:text-xl">{props.title}</h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted-foreground md:text-sm">{props.description}</p>
      </div>
      {props.children}
    </section>
  )
}

function KpiCard(props: KpiItem & { compact?: boolean }) {
  const toneClasses: Record<KpiItem['tone'], string> = {
    lime: 'from-lime-400/20 via-lime-400/8 to-transparent text-lime-300',
    cyan: 'from-cyan-400/20 via-cyan-400/8 to-transparent text-cyan-300',
    violet: 'from-violet-400/20 via-violet-400/8 to-transparent text-violet-300',
    amber: 'from-amber-400/20 via-amber-400/8 to-transparent text-amber-300',
    emerald: 'from-emerald-400/20 via-emerald-400/8 to-transparent text-emerald-300',
    rose: 'from-rose-400/20 via-rose-400/8 to-transparent text-rose-300',
  }

  const Icon = props.icon

  return (
    <article
      className={cn(
        'relative overflow-hidden border border-border/60 bg-card/55 shadow-xl',
        props.compact ? 'rounded-[1.4rem] p-4 md:rounded-[1.55rem]' : 'rounded-[1.65rem] p-4 md:rounded-[1.75rem] md:p-5',
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', toneClasses[props.tone])} />
      <div className="relative">
        <div className={cn('flex items-start justify-between gap-3', props.compact ? 'mb-3' : 'mb-5')}>
          <div className={cn('rounded-2xl bg-background/70 backdrop-blur', props.compact ? 'p-2.5' : 'p-3')}>
            <Icon className={cn(props.compact ? 'h-4 w-4' : 'h-5 w-5')} />
          </div>
          {typeof props.change === 'number' ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.14em] md:text-[11px] md:tracking-[0.16em]',
                props.change >= 0 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400',
              )}
            >
              {props.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {formatChange(props.change)}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            'font-black uppercase text-muted-foreground',
            props.compact ? 'text-[10px] tracking-[0.16em] md:text-[11px] md:tracking-[0.18em]' : 'text-[11px] tracking-[0.22em]',
          )}
        >
          {props.title}
        </p>
        <p className={cn('font-black tracking-tight', props.compact ? 'mt-1.5 text-2xl md:mt-2 md:text-[2rem]' : 'mt-2 text-3xl')}>
          {props.value}
        </p>
        <p
          className={cn(
            'text-muted-foreground',
            props.compact ? 'mt-2 hidden text-xs leading-relaxed md:block' : 'mt-3 text-sm',
          )}
        >
          {props.caption}
        </p>
      </div>
    </article>
  )
}

function MiniStat(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-3.5 md:p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">{props.label}</p>
      <p className="mt-1.5 text-base font-black md:mt-2 md:text-lg">{props.value}</p>
    </div>
  )
}

function StatusTile(props: {
  label: string
  value: number
  tone: 'lime' | 'cyan' | 'rose' | 'amber' | 'slate' | 'emerald'
  compact?: boolean
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
    <div className={cn('rounded-2xl border', toneClasses[props.tone], props.compact ? 'p-3.5 md:p-4' : 'p-4')}>
      <p
        className={cn(
          'font-black uppercase opacity-80',
          props.compact ? 'text-[10px] tracking-[0.14em] md:text-[11px] md:tracking-[0.18em]' : 'text-[11px] tracking-[0.18em]',
        )}
      >
        {props.label}
      </p>
      <p className={cn('font-black tracking-tight', props.compact ? 'mt-1.5 text-2xl md:mt-2 md:text-3xl' : 'mt-2 text-3xl')}>
        {props.value}
      </p>
    </div>
  )
}

function ExecutiveSignal(props: ExecutiveSignalItem) {
  return (
    <div className="rounded-[1.35rem] border border-border/60 bg-card/55 px-4 py-3 shadow-lg">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{props.label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-base font-black tracking-tight">{props.value}</p>
        <p className="text-right text-xs text-muted-foreground">{props.detail}</p>
      </div>
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
