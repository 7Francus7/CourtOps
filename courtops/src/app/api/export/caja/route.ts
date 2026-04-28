import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { endOfDay, format, startOfDay } from 'date-fns'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import {
       addSectionTitle,
       autoFitColumns,
       createWorkbook,
       setupWorksheet,
       styleCurrencyColumn,
       styleDataRow,
       workbookToResponse
} from '@/lib/excel-export'
import { calculateCashRegisterExportSummary } from '@/lib/financial-export'
import { fromUTC, nowInArg } from '@/lib/date-utils'

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
       value: number | string | null,
       detail = '',
       currency = false
) {
       const row = sheet.addRow({ concept, value, detail })
       styleDataRow(row)
       if (currency && typeof value === 'number') {
              row.getCell('value').numFmt = '"$"#,##0.00'
       }
       return row
}

export async function GET(request: Request) {
       try {
              const session = await getServerSession(authOptions)
              if (!session?.user?.clubId) {
                     return new NextResponse('Unauthorized', { status: 401 })
              }

              const clubId = session.user.clubId
              const { searchParams } = new URL(request.url)
              const dateStr = searchParams.get('date')
              const targetDate = dateStr ? new Date(dateStr) : nowInArg()

              if (Number.isNaN(targetDate.getTime())) {
                     return new NextResponse('Fecha inválida', { status: 400 })
              }

              const [club, register] = await Promise.all([
                     prisma.club.findUnique({
                            where: { id: clubId },
                            select: { name: true }
                     }),
                     prisma.cashRegister.findFirst({
                            where: {
                                   clubId,
                                   date: {
                                          gte: startOfDay(targetDate),
                                          lte: endOfDay(targetDate),
                                   },
                            },
                            orderBy: { openedAt: 'desc' },
                            include: {
                                   transactions: {
                                          orderBy: { createdAt: 'asc' },
                                          include: {
                                                 booking: { select: { id: true } },
                                                 client: { select: { name: true } },
                                          }
                                   }
                            }
                     })
              ])

              if (!register) {
                     return new NextResponse('No hay caja registrada para esta fecha', { status: 404 })
              }

              const summary = calculateCashRegisterExportSummary(
                     register.startAmount,
                     register.transactions.map(transaction => ({
                            amount: transaction.amount,
                            category: transaction.category,
                            method: transaction.method,
                            type: transaction.type,
                     })),
                     register.endAmountCash,
                     register.endAmountTransf
              )

              const workbook = createWorkbook()
              const titleDate = format(targetDate, 'dd/MM/yyyy')
              const clubName = club?.name || 'Club'

              const summarySheet = workbook.addWorksheet('Resumen Caja')
              setupWorksheet(
                     summarySheet,
                     `Caja diaria - ${clubName}`,
                     `Fecha operativa: ${titleDate}`,
                     [
                            { header: 'Concepto', key: 'concept', width: 30 },
                            { header: 'Valor', key: 'value', width: 18 },
                            { header: 'Detalle', key: 'detail', width: 42 },
                     ]
              )
              styleCurrencyColumn(summarySheet, 'value')

              appendSummaryRow(summarySheet, 'Club', clubName, 'Nombre comercial del reporte')
              appendSummaryRow(summarySheet, 'Fecha', titleDate, 'Jornada exportada')
              appendSummaryRow(summarySheet, 'Apertura', format(fromUTC(register.openedAt), 'dd/MM/yyyy HH:mm'), 'Hora de apertura registrada')
              appendSummaryRow(
                     summarySheet,
                     'Cierre',
                     register.closedAt ? format(fromUTC(register.closedAt), 'dd/MM/yyyy HH:mm') : 'Caja aún abierta',
                     'Estado del cierre'
              )

              addSectionTitle(summarySheet, 'Control de caja', 10, 3)
              appendSummaryRow(summarySheet, 'Fondo inicial', summary.startAmount, '', true)
              appendSummaryRow(summarySheet, 'Ingresos en efectivo', summary.incomeCash, '', true)
              appendSummaryRow(summarySheet, 'Egresos en efectivo', summary.expenseCash, '', true)
              appendSummaryRow(summarySheet, 'Efectivo esperado', summary.expectedCash, 'Fondo inicial + ingresos cash - egresos cash', true)
              appendSummaryRow(summarySheet, 'Efectivo declarado', summary.declaredCash, register.status === 'CLOSED' ? 'Monto cargado al cerrar caja' : 'Se completará al cierre', true)
              appendSummaryRow(summarySheet, 'Diferencia de caja', summary.difference, register.status === 'CLOSED' ? 'Declarado - esperado' : 'No disponible mientras la caja esté abierta', true)

              addSectionTitle(summarySheet, 'Resultado general', 18, 3)
              appendSummaryRow(summarySheet, 'Ingresos totales', summary.incomeTotal, '', true)
              appendSummaryRow(summarySheet, 'Egresos totales', summary.expenseTotal, '', true)
              appendSummaryRow(summarySheet, 'Balance neto', summary.netTotal, 'Ingresos - egresos', true)
              appendSummaryRow(summarySheet, 'Ingresos digitales', summary.incomeDigital, '', true)
              appendSummaryRow(summarySheet, 'Egresos digitales', summary.expenseDigital, '', true)
              appendSummaryRow(summarySheet, 'Neto digital', summary.netDigital, '', true)
              appendSummaryRow(summarySheet, 'Saldo digital de cierre', summary.closingDigitalAmount, 'Campo guardado al cerrar caja', true)
              appendSummaryRow(summarySheet, 'Cantidad de movimientos', register.transactions.length, '', false)

              const movementsSheet = workbook.addWorksheet('Movimientos')
              setupWorksheet(
                     movementsSheet,
                     `Detalle de movimientos - ${clubName}`,
                     `Caja del ${titleDate}`,
                     [
                            { header: 'ID', key: 'id', width: 10 },
                            { header: 'Fecha', key: 'date', width: 14 },
                            { header: 'Hora', key: 'time', width: 12 },
                            { header: 'Tipo', key: 'type', width: 14 },
                            { header: 'Categoría', key: 'category', width: 18 },
                            { header: 'Método', key: 'method', width: 18 },
                            { header: 'Cliente', key: 'client', width: 26 },
                            { header: 'Reserva', key: 'booking', width: 12 },
                            { header: 'Descripción', key: 'description', width: 44 },
                            { header: 'Ingreso', key: 'income', width: 16 },
                            { header: 'Egreso', key: 'expense', width: 16 },
                            { header: 'Impacto neto', key: 'net', width: 16 },
                     ]
              )
              styleCurrencyColumn(movementsSheet, 'income')
              styleCurrencyColumn(movementsSheet, 'expense')
              styleCurrencyColumn(movementsSheet, 'net')

              register.transactions.forEach(transaction => {
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

              const methodsSheet = workbook.addWorksheet('Medios de pago')
              setupWorksheet(
                     methodsSheet,
                     `Desglose por medio - ${clubName}`,
                     `Caja del ${titleDate}`,
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
                     `Desglose por categoría - ${clubName}`,
                     `Caja del ${titleDate}`,
                     [
                            { header: 'Categoría', key: 'category', width: 26 },
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

              autoFitColumns(summarySheet)
              autoFitColumns(movementsSheet)
              autoFitColumns(methodsSheet)
              autoFitColumns(categoriesSheet)

              return workbookToResponse(
                     workbook,
                     `caja_${format(targetDate, 'yyyyMMdd')}.xlsx`
              )
       } catch (error: unknown) {
              console.error('[XLSX Export Caja]', error)
              return NextResponse.json(
                     { error: error instanceof Error ? error.message : 'Unknown error' },
                     { status: 500 }
              )
       }
}
