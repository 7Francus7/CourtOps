import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { differenceInDays, differenceInMinutes, format } from 'date-fns'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import {
       autoFitColumns,
       createWorkbook,
       setupWorksheet,
       styleCurrencyColumn,
       styleDataRow,
       workbookToResponse
} from '@/lib/excel-export'
import { fromUTC } from '@/lib/date-utils'
import { getAverageIncomeTicket, summarizeTransactions } from '@/lib/financial-export'

export const runtime = 'nodejs'

const METHOD_LABELS: Record<string, string> = {
       ACCOUNT: 'A cuenta',
       CASH: 'Efectivo',
       CREDIT: 'Tarjeta crédito',
       DEBIT: 'Tarjeta débito',
       MERCADOPAGO: 'Mercado Pago',
       MP: 'Mercado Pago',
       TRANSFER: 'Transferencia',
       TRANSFERENCIA: 'Transferencia',
       UNSPECIFIED: 'Sin especificar',
}

const CATEGORY_LABELS: Record<string, string> = {
       BOOKING: 'Reservas',
       KIOSCO: 'Kiosco',
       MEMBERSHIP: 'Membresías',
       OTHER: 'Otros',
       PAYMENT: 'Pagos',
       STOCK: 'Stock',
       SUPPLIES: 'Insumos',
       SYSTEM: 'Sistema',
       UNSPECIFIED: 'Sin categoría',
}

function formatMethodLabel(value: string | null | undefined) {
       const normalized = value?.trim().toUpperCase() || 'UNSPECIFIED'
       return METHOD_LABELS[normalized] || normalized.replace(/_/g, ' ')
}

function formatCategoryLabel(value: string | null | undefined) {
       const normalized = value?.trim().toUpperCase() || 'UNSPECIFIED'
       return CATEGORY_LABELS[normalized] || normalized.replace(/_/g, ' ')
}

function appendSummaryRow(
       sheet: ReturnType<typeof createWorkbook>['worksheets'][number],
       concept: string,
       value: number | string,
       detail = '',
       currency = false
) {
       const row = sheet.addRow({ concept, value, detail })
       styleDataRow(row)
       if (currency && typeof value === 'number') {
              row.getCell('value').numFmt = '"$"#,##0.00'
       }
}

export async function GET(request: Request) {
       try {
              const session = await getServerSession(authOptions)
              if (!session?.user?.clubId) {
                     return new NextResponse('Unauthorized', { status: 401 })
              }

              const { searchParams } = new URL(request.url)
              const startStr = searchParams.get('start')
              const endStr = searchParams.get('end')

              if (!startStr || !endStr) {
                     return new NextResponse('Parámetros start y end requeridos', { status: 400 })
              }

              const start = new Date(startStr)
              const end = new Date(endStr)

              if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                     return new NextResponse('Rango de fechas inválido', { status: 400 })
              }

              const clubId = session.user.clubId

              const [club, transactions, bookings, courts] = await Promise.all([
                     prisma.club.findUnique({
                            where: { id: clubId },
                            select: { closeTime: true, name: true, openTime: true }
                     }),
                     prisma.transaction.findMany({
                            where: {
                                   cashRegister: { clubId },
                                   createdAt: { gte: start, lte: end },
                            },
                            orderBy: { createdAt: 'desc' },
                            include: {
                                   booking: { select: { id: true } },
                                   client: { select: { name: true } },
                            }
                     }),
                     prisma.booking.findMany({
                            where: {
                                   clubId,
                                   startTime: { gte: start, lte: end },
                                   status: { not: 'CANCELED' },
                            },
                            include: {
                                   court: { select: { name: true } },
                            }
                     }),
                     prisma.court.findMany({
                            where: { clubId, deletedAt: null, isActive: true },
                            select: { name: true }
                     }),
              ])

              const summary = summarizeTransactions(
                     transactions.map(transaction => ({
                            amount: transaction.amount,
                            category: transaction.category,
                            method: transaction.method,
                            type: transaction.type,
                     }))
              )

              const averageTicket = getAverageIncomeTicket(summary.incomeTotal, summary.incomeCount)
              const dateRangeLabel = `${format(start, 'dd/MM/yyyy')} al ${format(end, 'dd/MM/yyyy')}`

              const dailyMap = new Map<string, { date: string; income: number; expense: number; net: number }>()
              transactions
                     .slice()
                     .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                     .forEach(transaction => {
                            const localDate = fromUTC(transaction.createdAt)
                            const key = format(localDate, 'yyyy-MM-dd')
                            const current = dailyMap.get(key) ?? {
                                   date: format(localDate, 'dd/MM/yyyy'),
                                   income: 0,
                                   expense: 0,
                                   net: 0,
                            }

                            if (transaction.type === 'INCOME') {
                                   current.income += transaction.amount
                                   current.net += transaction.amount
                            } else {
                                   current.expense += transaction.amount
                                   current.net -= transaction.amount
                            }

                            dailyMap.set(key, current)
                     })

              let hoursPerDay = 0
              if (club?.openTime && club?.closeTime) {
                     const openHour = parseInt(club.openTime.split(':')[0], 10)
                     const closeHour = parseInt(club.closeTime.split(':')[0], 10)
                     hoursPerDay = closeHour - openHour
                     if (hoursPerDay <= 0) hoursPerDay += 24
              }

              const totalDays = Math.max(1, differenceInDays(end, start) + 1)
              const capacityPerCourt = hoursPerDay * totalDays
              const occupancyMap = new Map<string, number>()
              courts.forEach(court => occupancyMap.set(court.name, 0))

              bookings.forEach(booking => {
                     const durationHours = differenceInMinutes(booking.endTime, booking.startTime) / 60
                     occupancyMap.set(booking.court.name, (occupancyMap.get(booking.court.name) || 0) + durationHours)
              })

              const workbook = createWorkbook()
              const clubName = club?.name || 'Club'

              const summarySheet = workbook.addWorksheet('Resumen')
              setupWorksheet(
                     summarySheet,
                     `Reporte financiero - ${clubName}`,
                     `Período: ${dateRangeLabel}`,
                     [
                            { header: 'Concepto', key: 'concept', width: 30 },
                            { header: 'Valor', key: 'value', width: 18 },
                            { header: 'Detalle', key: 'detail', width: 42 },
                     ]
              )
              styleCurrencyColumn(summarySheet, 'value')

              appendSummaryRow(summarySheet, 'Club', clubName, 'Reporte generado para control financiero')
              appendSummaryRow(summarySheet, 'Período', dateRangeLabel, 'Rango completo incluido en la exportación')
              appendSummaryRow(summarySheet, 'Transacciones analizadas', transactions.length, 'Movimientos de caja dentro del rango')
              appendSummaryRow(summarySheet, 'Movimientos de ingreso', summary.incomeCount, '')
              appendSummaryRow(summarySheet, 'Movimientos de egreso', summary.expenseCount, '')
              appendSummaryRow(summarySheet, 'Ingresos totales', summary.incomeTotal, '', true)
              appendSummaryRow(summarySheet, 'Egresos totales', summary.expenseTotal, '', true)
              appendSummaryRow(summarySheet, 'Balance neto', summary.netTotal, 'Ingresos - egresos', true)
              appendSummaryRow(summarySheet, 'Ticket promedio', averageTicket, 'Promedio por movimiento de ingreso', true)

              const movementsSheet = workbook.addWorksheet('Movimientos')
              setupWorksheet(
                     movementsSheet,
                     `Movimientos financieros - ${clubName}`,
                     `Período ${dateRangeLabel}`,
                     [
                            { header: 'ID', key: 'id', width: 10 },
                            { header: 'Fecha', key: 'date', width: 14 },
                            { header: 'Hora', key: 'time', width: 12 },
                            { header: 'Tipo', key: 'type', width: 14 },
                            { header: 'Categoría', key: 'category', width: 20 },
                            { header: 'Método', key: 'method', width: 18 },
                            { header: 'Cliente', key: 'client', width: 24 },
                            { header: 'Reserva', key: 'booking', width: 12 },
                            { header: 'Descripción', key: 'description', width: 42 },
                            { header: 'Ingreso', key: 'income', width: 16 },
                            { header: 'Egreso', key: 'expense', width: 16 },
                            { header: 'Neto', key: 'net', width: 16 },
                     ]
              )
              styleCurrencyColumn(movementsSheet, 'income')
              styleCurrencyColumn(movementsSheet, 'expense')
              styleCurrencyColumn(movementsSheet, 'net')

              transactions.forEach(transaction => {
                     const localDate = fromUTC(transaction.createdAt)
                     const isIncome = transaction.type === 'INCOME'
                     const row = movementsSheet.addRow({
                            id: transaction.id,
                            date: format(localDate, 'dd/MM/yyyy'),
                            time: format(localDate, 'HH:mm'),
                            type: isIncome ? 'Ingreso' : 'Egreso',
                            category: formatCategoryLabel(transaction.category),
                            method: formatMethodLabel(transaction.method),
                            client: transaction.client?.name || '',
                            booking: transaction.booking?.id || '',
                            description: transaction.description || '',
                            income: isIncome ? transaction.amount : 0,
                            expense: isIncome ? 0 : transaction.amount,
                            net: isIncome ? transaction.amount : -transaction.amount,
                     })
                     styleDataRow(row)
              })

              const dailySheet = workbook.addWorksheet('Evolución diaria')
              setupWorksheet(
                     dailySheet,
                     `Evolución diaria - ${clubName}`,
                     `Período ${dateRangeLabel}`,
                     [
                            { header: 'Fecha', key: 'date', width: 14 },
                            { header: 'Ingresos', key: 'income', width: 16 },
                            { header: 'Egresos', key: 'expense', width: 16 },
                            { header: 'Balance', key: 'net', width: 16 },
                     ]
              )
              styleCurrencyColumn(dailySheet, 'income')
              styleCurrencyColumn(dailySheet, 'expense')
              styleCurrencyColumn(dailySheet, 'net')

              Array.from(dailyMap.values()).forEach(item => {
                     const row = dailySheet.addRow(item)
                     styleDataRow(row)
              })

              const methodsSheet = workbook.addWorksheet('Medios de pago')
              setupWorksheet(
                     methodsSheet,
                     `Medios de pago - ${clubName}`,
                     `Período ${dateRangeLabel}`,
                     [
                            { header: 'Método', key: 'method', width: 24 },
                            { header: 'Ingresos', key: 'income', width: 16 },
                            { header: 'Egresos', key: 'expense', width: 16 },
                            { header: 'Neto', key: 'net', width: 16 },
                            { header: 'Movimientos', key: 'count', width: 14 },
                     ]
              )
              styleCurrencyColumn(methodsSheet, 'income')
              styleCurrencyColumn(methodsSheet, 'expense')
              styleCurrencyColumn(methodsSheet, 'net')

              summary.byMethod.forEach(item => {
                     const row = methodsSheet.addRow({
                            method: formatMethodLabel(item.key),
                            income: item.income,
                            expense: item.expense,
                            net: item.net,
                            count: item.count,
                     })
                     styleDataRow(row)
              })

              const categoriesSheet = workbook.addWorksheet('Categorías')
              setupWorksheet(
                     categoriesSheet,
                     `Categorías financieras - ${clubName}`,
                     `Período ${dateRangeLabel}`,
                     [
                            { header: 'Categoría', key: 'category', width: 28 },
                            { header: 'Ingresos', key: 'income', width: 16 },
                            { header: 'Egresos', key: 'expense', width: 16 },
                            { header: 'Neto', key: 'net', width: 16 },
                            { header: 'Movimientos', key: 'count', width: 14 },
                     ]
              )
              styleCurrencyColumn(categoriesSheet, 'income')
              styleCurrencyColumn(categoriesSheet, 'expense')
              styleCurrencyColumn(categoriesSheet, 'net')

              summary.byCategory.forEach(item => {
                     const row = categoriesSheet.addRow({
                            category: formatCategoryLabel(item.key),
                            income: item.income,
                            expense: item.expense,
                            net: item.net,
                            count: item.count,
                     })
                     styleDataRow(row)
              })

              const occupancySheet = workbook.addWorksheet('Ocupación')
              setupWorksheet(
                     occupancySheet,
                     `Ocupación por cancha - ${clubName}`,
                     `Período ${dateRangeLabel}`,
                     [
                            { header: 'Cancha', key: 'court', width: 24 },
                            { header: 'Horas reservadas', key: 'bookedHours', width: 18 },
                            { header: 'Capacidad', key: 'capacityHours', width: 16 },
                            { header: 'Ocupación', key: 'occupancy', width: 14 },
                     ]
              )
              occupancySheet.getColumn('bookedHours').numFmt = '#,##0.00'
              occupancySheet.getColumn('capacityHours').numFmt = '#,##0.00'
              occupancySheet.getColumn('occupancy').numFmt = '0.00%'

              Array.from(occupancyMap.entries()).forEach(([court, bookedHours]) => {
                     const occupancyRate = capacityPerCourt > 0 ? bookedHours / capacityPerCourt : 0
                     const row = occupancySheet.addRow({
                            court,
                            bookedHours,
                            capacityHours: capacityPerCourt,
                            occupancy: occupancyRate,
                     })
                     styleDataRow(row)
              })

              autoFitColumns(summarySheet)
              autoFitColumns(movementsSheet)
              autoFitColumns(dailySheet)
              autoFitColumns(methodsSheet)
              autoFitColumns(categoriesSheet)
              autoFitColumns(occupancySheet)

              return workbookToResponse(
                     workbook,
                     `reporte_financiero_${format(start, 'yyyyMMdd')}_${format(end, 'yyyyMMdd')}.xlsx`
              )
       } catch (error: unknown) {
              console.error('[XLSX Export Reportes]', error)
              return NextResponse.json(
                     { error: error instanceof Error ? error.message : 'Unknown error' },
                     { status: 500 }
              )
       }
}
