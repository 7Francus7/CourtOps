'use server'

import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { fromUTC, createArgDate } from '@/lib/date-utils'
import { ACTIONS, hasPermission, RESOURCES } from '@/lib/permissions'
import {
  buildComparison,
  calculateOccupancyRate,
  getOperatingMinutesPerDay,
  getPreviousPeriodRange,
  isCanceledStatus,
  isNoShowStatus,
  summarizeClientSegments,
} from '@/lib/reporting'
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  differenceInCalendarDays,
  differenceInMinutes,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
} from 'date-fns'
import { getServerSession } from 'next-auth'

type ReportRangeInput = {
  startDate: string
  endDate: string
}

type ReportTransaction = {
  id: number
  amount: number
  method: string
  type: string
  category: string
  description: string | null
  createdAt: Date
}

type ReportBooking = {
  id: number
  clientId: number | null
  startTime: Date
  endTime: Date
  price: number
  status: string
  paymentStatus: string
  court: { id: number; name: string }
  client: { id: number; name: string } | null
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  CREDIT: 'Credito',
  DEBIT: 'Debito',
  MERCADOPAGO: 'Mercado Pago',
  MP: 'Mercado Pago',
  TRANSFER: 'Transferencia',
  ACCOUNT: 'A cuenta',
}

const monthFormatter = new Intl.DateTimeFormat('es-AR', {
  month: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
})

const dayMonthFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
})

async function requireReportsContext() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.clubId) {
    throw new Error('No autorizado')
  }

  if (!hasPermission(session.user.role || 'USER', RESOURCES.FINANCE, ACTIONS.READ)) {
    throw new Error('No tienes permisos para ver reportes')
  }

  const club = await prisma.club.findUnique({
    where: { id: session.user.clubId },
    select: {
      id: true,
      name: true,
      currency: true,
      openTime: true,
      closeTime: true,
      courts: {
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!club) {
    throw new Error('Club no encontrado')
  }

  return {
    clubId: club.id,
    club,
  }
}

function createRangeBoundaries(input: ReportRangeInput) {
  const [startYear, startMonth, startDay] = input.startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = input.endDate.split('-').map(Number)

  if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) {
    throw new Error('Rango de fechas invalido')
  }

  const start = createArgDate(startYear, startMonth - 1, startDay, 0, 0)
  const end = createArgDate(endYear, endMonth - 1, endDay, 23, 59)
  end.setSeconds(59, 999)

  if (start > end) {
    throw new Error('La fecha inicial no puede ser mayor que la final')
  }

  return { start, end }
}

function sumIncome(transactions: Pick<ReportTransaction, 'amount'>[]) {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0)
}

function getBookedMinutes(bookings: Pick<ReportBooking, 'startTime' | 'endTime'>[]) {
  return bookings.reduce((total, booking) => (
    total + differenceInMinutes(booking.endTime, booking.startTime)
  ), 0)
}

function buildTrendData(params: {
  start: Date
  end: Date
  bookings: ReportBooking[]
  transactions: ReportTransaction[]
}) {
  const totalDays = Math.max(1, differenceInCalendarDays(params.end, params.start) + 1)

  if (totalDays > 180) {
    const months = eachMonthOfInterval({ start: params.start, end: params.end })
    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart)
      return {
        label: monthFormatter.format(monthStart),
        revenue: sumIncome(params.transactions.filter((transaction) => (
          isWithinInterval(transaction.createdAt, { start: monthStart, end: monthEnd })
        ))),
        bookings: params.bookings.filter((booking) => (
          isWithinInterval(booking.startTime, { start: monthStart, end: monthEnd })
        )).length,
      }
    })
  }

  if (totalDays > 45) {
    const weeks = eachWeekOfInterval({ start: params.start, end: params.end }, { weekStartsOn: 1 })
    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      return {
        label: dayMonthFormatter.format(weekStart),
        revenue: sumIncome(params.transactions.filter((transaction) => (
          isWithinInterval(transaction.createdAt, { start: weekStart, end: weekEnd })
        ))),
        bookings: params.bookings.filter((booking) => (
          isWithinInterval(booking.startTime, { start: weekStart, end: weekEnd })
        )).length,
      }
    })
  }

  const days = eachDayOfInterval({ start: params.start, end: params.end })
  return days.map((dayStart) => {
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    return {
      label: format(dayStart, 'dd/MM'),
      revenue: sumIncome(params.transactions.filter((transaction) => (
        isWithinInterval(transaction.createdAt, { start: dayStart, end: dayEnd })
      ))),
      bookings: params.bookings.filter((booking) => (
        isWithinInterval(booking.startTime, { start: dayStart, end: dayEnd })
      )).length,
    }
  })
}

function buildTopHours(bookings: ReportBooking[]) {
  const hourMap = new Map<string, number>()

  for (const booking of bookings) {
    const localDate = fromUTC(booking.startTime)
    const hourKey = `${String(localDate.getUTCHours()).padStart(2, '0')}:00`
    hourMap.set(hourKey, (hourMap.get(hourKey) || 0) + 1)
  }

  return Array.from(hourMap.entries())
    .map(([hour, bookingsCount]) => ({ hour, bookings: bookingsCount }))
    .sort((left, right) => right.bookings - left.bookings || left.hour.localeCompare(right.hour))
    .slice(0, 6)
}

function buildCourtUsage(bookings: ReportBooking[], params: {
  totalDays: number
  courts: { id: number; name: string }[]
  openTime: string
  closeTime: string
}) {
  const minutesPerCourt = getOperatingMinutesPerDay(params.openTime, params.closeTime) * params.totalDays
  const courtStats = new Map<number, { name: string; bookings: number; minutes: number; revenue: number }>()

  for (const court of params.courts) {
    courtStats.set(court.id, { name: court.name, bookings: 0, minutes: 0, revenue: 0 })
  }

  for (const booking of bookings) {
    const current = courtStats.get(booking.court.id)
    if (!current) continue

    current.bookings += 1
    current.minutes += differenceInMinutes(booking.endTime, booking.startTime)
    current.revenue += booking.price
  }

  return Array.from(courtStats.entries())
    .map(([courtId, value]) => ({
      courtId,
      name: value.name,
      bookings: value.bookings,
      hours: Number((value.minutes / 60).toFixed(1)),
      revenue: value.revenue,
      occupancy: minutesPerCourt > 0 ? Number(((value.minutes / minutesPerCourt) * 100).toFixed(1)) : 0,
    }))
    .sort((left, right) => right.bookings - left.bookings || right.revenue - left.revenue)
}

function buildTopClients(bookings: ReportBooking[]) {
  const clientMap = new Map<number, { name: string; bookings: number; spent: number; lastVisit: Date }>()

  for (const booking of bookings) {
    if (!booking.clientId || !booking.client) continue

    const existing = clientMap.get(booking.clientId)

    if (!existing) {
      clientMap.set(booking.clientId, {
        name: booking.client.name,
        bookings: 1,
        spent: booking.price,
        lastVisit: booking.startTime,
      })
      continue
    }

    existing.bookings += 1
    existing.spent += booking.price
    if (booking.startTime > existing.lastVisit) {
      existing.lastVisit = booking.startTime
    }
  }

  return Array.from(clientMap.entries())
    .map(([clientId, value]) => ({
      clientId,
      name: value.name,
      bookings: value.bookings,
      spent: value.spent,
      lastVisit: value.lastVisit.toISOString(),
    }))
    .sort((left, right) => right.bookings - left.bookings || right.spent - left.spent)
    .slice(0, 5)
}

function buildPaymentMethods(transactions: ReportTransaction[]) {
  const paymentMap = new Map<string, number>()

  for (const transaction of transactions) {
    const label = METHOD_LABELS[transaction.method] || transaction.method || 'Sin especificar'
    paymentMap.set(label, (paymentMap.get(label) || 0) + transaction.amount)
  }

  return Array.from(paymentMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value)
}

function buildStatusOverview(bookings: ReportBooking[]) {
  return {
    confirmed: bookings.filter((booking) => booking.status === 'CONFIRMED').length,
    pending: bookings.filter((booking) => booking.status === 'PENDING').length,
    canceled: bookings.filter((booking) => isCanceledStatus(booking.status)).length,
    noShow: bookings.filter((booking) => isNoShowStatus(booking.status)).length,
  }
}

export async function getReportsSnapshot(input: ReportRangeInput) {
  const { clubId, club } = await requireReportsContext()
  const { start, end } = createRangeBoundaries(input)
  const previousRange = getPreviousPeriodRange(start, end)

  const localRangeEnd = fromUTC(end)
  const monthAnchor = startOfMonth(localRangeEnd)
  const monthStart = createArgDate(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth(), 1, 0, 0)
  const lastDayOfMonth = new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth() + 1, 0)).getUTCDate()
  const monthEnd = createArgDate(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth(), lastDayOfMonth, 23, 59)
  monthEnd.setSeconds(59, 999)

  const [
    currentTransactions,
    currentExpenses,
    previousIncome,
    monthIncome,
    currentBookings,
    previousBookings,
    currentNewClients,
    previousNewClients,
    clients,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        clubId,
        type: 'INCOME',
        createdAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        amount: true,
        method: true,
        type: true,
        category: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'EXPENSE',
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'INCOME',
        createdAt: { gte: previousRange.start, lte: previousRange.end },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        clubId,
        type: 'INCOME',
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      where: {
        clubId,
        deletedAt: null,
        startTime: { gte: start, lte: end },
      },
      select: {
        id: true,
        clientId: true,
        startTime: true,
        endTime: true,
        price: true,
        status: true,
        paymentStatus: true,
        court: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.booking.findMany({
      where: {
        clubId,
        deletedAt: null,
        startTime: { gte: previousRange.start, lte: previousRange.end },
      },
      select: {
        id: true,
        clientId: true,
        startTime: true,
        endTime: true,
        price: true,
        status: true,
        paymentStatus: true,
        court: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    }),
    prisma.client.count({
      where: {
        clubId,
        deletedAt: null,
        createdAt: { gte: start, lte: end },
      },
    }),
    prisma.client.count({
      where: {
        clubId,
        deletedAt: null,
        createdAt: { gte: previousRange.start, lte: previousRange.end },
      },
    }),
    prisma.client.findMany({
      where: { clubId, deletedAt: null },
      select: {
        id: true,
        createdAt: true,
        bookings: {
          where: { status: { notIn: ['CANCELED', 'CANCELLED'] } },
          orderBy: { startTime: 'desc' },
          take: 1,
          select: { startTime: true },
        },
      },
    }),
  ])

  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1)
  const activeBookings = currentBookings.filter((booking) => !isCanceledStatus(booking.status))
  const previousActiveBookings = previousBookings.filter((booking) => !isCanceledStatus(booking.status))

  const currentRevenue = sumIncome(currentTransactions)
  const previousRevenue = previousIncome._sum.amount || 0
  const monthRevenue = monthIncome._sum.amount || 0
  const currentBookedMinutes = getBookedMinutes(activeBookings)
  const previousBookedMinutes = getBookedMinutes(previousActiveBookings)
  const occupancy = calculateOccupancyRate({
    bookedMinutes: currentBookedMinutes,
    courtCount: club.courts.length,
    openTime: club.openTime,
    closeTime: club.closeTime,
    totalDays,
  })
  const previousOccupancy = calculateOccupancyRate({
    bookedMinutes: previousBookedMinutes,
    courtCount: club.courts.length,
    openTime: club.openTime,
    closeTime: club.closeTime,
    totalDays: previousRange.totalDays,
  })

  const clientSegments = summarizeClientSegments({
    clients: clients.map((client) => ({
      id: client.id,
      createdAt: client.createdAt,
      lastBookingAt: client.bookings[0]?.startTime || null,
    })),
    periodBookings: activeBookings.map((booking) => ({ clientId: booking.clientId })),
    periodStart: start,
    periodEnd: end,
  })

  const cancellationCount = currentBookings.filter((booking) => isCanceledStatus(booking.status)).length
  const noShowCount = currentBookings.filter((booking) => isNoShowStatus(booking.status)).length
  const bookingCount = activeBookings.length
  const previousBookingCount = previousActiveBookings.length
  const avgTicket = bookingCount > 0 ? Number((currentRevenue / bookingCount).toFixed(0)) : 0

  const trend = buildTrendData({
    start,
    end,
    bookings: activeBookings,
    transactions: currentTransactions,
  })

  const hasData = currentRevenue > 0 || bookingCount > 0 || currentNewClients > 0 || cancellationCount > 0

  return {
    club: {
      name: club.name,
      currency: club.currency || 'ARS',
    },
    range: {
      startDate: input.startDate,
      endDate: input.endDate,
      previousStartDate: format(previousRange.start, 'yyyy-MM-dd'),
      previousEndDate: format(previousRange.end, 'yyyy-MM-dd'),
      totalDays,
    },
    summary: {
      monthRevenue,
      periodRevenue: currentRevenue,
      periodExpenses: currentExpenses._sum.amount || 0,
      bookings: bookingCount,
      occupancy,
      newClients: clientSegments.newClients,
      recurrentClients: clientSegments.recurrentClients,
      inactiveClients: clientSegments.inactiveClients,
      cancellations: cancellationCount,
      noShows: noShowCount,
      avgTicket,
    },
    comparisons: {
      revenue: buildComparison(currentRevenue, previousRevenue),
      bookings: buildComparison(bookingCount, previousBookingCount),
      occupancy: buildComparison(occupancy, previousOccupancy),
      newClients: buildComparison(clientSegments.newClients, previousNewClients),
    },
    trend,
    topHours: buildTopHours(activeBookings),
    courtUsage: buildCourtUsage(activeBookings, {
      totalDays,
      courts: club.courts,
      openTime: club.openTime,
      closeTime: club.closeTime,
    }),
    topClients: buildTopClients(activeBookings),
    paymentMethods: buildPaymentMethods(currentTransactions),
    statusOverview: buildStatusOverview(currentBookings),
    hasData,
  }
}

export async function getFinancialStats(start: Date, end: Date) {
  const { clubId } = await requireReportsContext()

  const [incomeTransactions, expenseTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { clubId, type: 'INCOME', createdAt: { gte: start, lte: end } },
      select: { amount: true, category: true },
    }),
    prisma.transaction.findMany({
      where: { clubId, type: 'EXPENSE', createdAt: { gte: start, lte: end } },
      select: { amount: true, category: true },
    }),
  ])

  const income = sumIncome(incomeTransactions)
  const expenses = sumIncome(expenseTransactions)
  const byCategory: Record<string, number> = {}
  const byCategoryIncome: Record<string, number> = {}

  for (const transaction of [...incomeTransactions, ...expenseTransactions]) {
    byCategory[transaction.category] = (byCategory[transaction.category] || 0) + transaction.amount
  }

  for (const transaction of incomeTransactions) {
    byCategoryIncome[transaction.category] = (byCategoryIncome[transaction.category] || 0) + transaction.amount
  }

  return {
    income,
    expenses,
    balance: income - expenses,
    byCategory,
    byCategoryIncome,
  }
}

export async function getReportTransactions(start: Date, end: Date) {
  const { clubId } = await requireReportsContext()

  return prisma.transaction.findMany({
    where: {
      clubId,
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOccupancyByCourt(start: Date, end: Date) {
  const { clubId, club } = await requireReportsContext()
  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1)
  const bookings = await prisma.booking.findMany({
    where: {
      clubId,
      deletedAt: null,
      startTime: { gte: start, lte: end },
      status: { notIn: ['CANCELED', 'CANCELLED'] },
    },
    select: {
      startTime: true,
      endTime: true,
      court: { select: { id: true, name: true } },
    },
  })

  return buildCourtUsage(
    bookings.map((booking) => ({
      ...booking,
      id: 0,
      clientId: null,
      price: 0,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      client: null,
    })),
    {
      totalDays,
      courts: club.courts,
      openTime: club.openTime,
      closeTime: club.closeTime,
    },
  ).map((court) => ({ name: court.name, value: court.occupancy }))
}

export async function getDashboardKPIs(start: Date, end: Date, prevStart: Date, prevEnd: Date) {
  const snapshot = await getReportsSnapshot({
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  })

  const previousSnapshot = await getReportsSnapshot({
    startDate: format(prevStart, 'yyyy-MM-dd'),
    endDate: format(prevEnd, 'yyyy-MM-dd'),
  })

  const hasPreviousData = (
    previousSnapshot.summary.periodRevenue > 0 ||
    previousSnapshot.summary.bookings > 0 ||
    previousSnapshot.summary.newClients > 0 ||
    previousSnapshot.summary.occupancy > 0
  )

  return {
    income: { value: snapshot.summary.periodRevenue, change: snapshot.comparisons.revenue.change, hasPreviousData },
    occupancy: { value: Math.round(snapshot.summary.occupancy), change: snapshot.comparisons.occupancy.change, hasPreviousData },
    ticket: { value: snapshot.summary.avgTicket, change: 0, hasPreviousData },
    newClients: { value: snapshot.summary.newClients, change: snapshot.comparisons.newClients.change, hasPreviousData },
  }
}

export async function getBestClient(start: Date, end: Date) {
  const { clubId } = await requireReportsContext()
  const bookings = await prisma.booking.findMany({
    where: {
      clubId,
      deletedAt: null,
      startTime: { gte: start, lte: end },
      status: { notIn: ['CANCELED', 'CANCELLED'] },
      clientId: { not: null },
    },
    select: {
      clientId: true,
      client: { select: { id: true, name: true } },
      price: true,
      startTime: true,
    },
  })

  const bestClient = buildTopClients(bookings.map((booking, index) => ({
    id: index,
    clientId: booking.clientId,
    startTime: booking.startTime,
    endTime: booking.startTime,
    price: booking.price,
    status: 'CONFIRMED',
    paymentStatus: 'UNPAID',
    court: { id: 0, name: '' },
    client: booking.client,
  })))[0]

  if (!bestClient) {
    return null
  }

  return {
    name: bestClient.name,
    bookings: bestClient.bookings,
    initials: bestClient.name.slice(0, 2).toUpperCase(),
  }
}

export async function getPaymentMethodStats(start: Date, end: Date) {
  const { clubId } = await requireReportsContext()
  const transactions = await prisma.transaction.findMany({
    where: {
      clubId,
      type: 'INCOME',
      createdAt: { gte: start, lte: end },
    },
    select: {
      amount: true,
      method: true,
      id: true,
      type: true,
      category: true,
      description: true,
      createdAt: true,
    },
  })

  return buildPaymentMethods(transactions)
}

export async function getDailyRevenueStats(start: Date, end: Date) {
  const { clubId } = await requireReportsContext()
  const transactions = await prisma.transaction.findMany({
    where: {
      clubId,
      type: 'INCOME',
      createdAt: { gte: start, lte: end },
    },
    select: {
      amount: true,
      method: true,
      id: true,
      type: true,
      category: true,
      description: true,
      createdAt: true,
    },
  })

  return buildTrendData({ start, end, bookings: [], transactions }).map((item) => ({
    name: item.label,
    value: item.revenue,
  }))
}

export async function getMembershipRetentionStats() {
  const { clubId } = await requireReportsContext()
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [total, active, expired, expiringCount, plans] = await Promise.all([
    prisma.membership.count({ where: { plan: { clubId } } }),
    prisma.membership.count({ where: { plan: { clubId }, status: 'ACTIVE', endDate: { gte: now } } }),
    prisma.membership.count({ where: { plan: { clubId }, status: 'ACTIVE', endDate: { lt: now } } }),
    prisma.membership.count({ where: { plan: { clubId }, status: 'ACTIVE', endDate: { gte: now, lte: thirtyDaysFromNow } } }),
    prisma.membershipPlan.findMany({
      where: { clubId, isActive: true },
      include: {
        _count: {
          select: {
            memberships: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
      orderBy: { price: 'asc' },
    }),
  ])

  const cancelled = total - active - expired

  return {
    total,
    active,
    expired,
    cancelled,
    expiringCount,
    retentionRate: total > 0 ? Math.round((active / total) * 100) : 0,
    plans: plans.map((plan) => ({
      name: plan.name,
      price: plan.price,
      activeCount: plan._count.memberships,
    })),
  }
}

export async function getClientActivityStats() {
  const { clubId } = await requireReportsContext()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const [totalClients, newThisMonth, activeClients, riskClients, lostClients] = await Promise.all([
    prisma.client.count({ where: { clubId, deletedAt: null } }),
    prisma.client.count({ where: { clubId, deletedAt: null, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.client.count({
      where: {
        clubId,
        deletedAt: null,
        bookings: {
          some: { startTime: { gte: thirtyDaysAgo }, status: { notIn: ['CANCELED', 'CANCELLED'] } },
        },
      },
    }),
    prisma.client.count({
      where: {
        clubId,
        deletedAt: null,
        bookings: {
          some: { startTime: { gte: ninetyDaysAgo, lt: thirtyDaysAgo }, status: { notIn: ['CANCELED', 'CANCELLED'] } },
          none: { startTime: { gte: thirtyDaysAgo }, status: { notIn: ['CANCELED', 'CANCELLED'] } },
        },
      },
    }),
    prisma.client.count({
      where: {
        clubId,
        deletedAt: null,
        bookings: {
          none: { startTime: { gte: ninetyDaysAgo }, status: { notIn: ['CANCELED', 'CANCELLED'] } },
        },
      },
    }),
  ])

  return {
    totalClients,
    newThisMonth,
    activeClients,
    riskClients,
    lostClients,
  }
}
