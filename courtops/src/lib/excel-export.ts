import ExcelJS from 'exceljs'
import { NextResponse } from 'next/server'

type WorksheetColumn = {
       header: string
       key: string
       width?: number
}

const COLORS = {
       border: 'FFE2E8F0',
       dark: 'FF0F172A',
       headerText: 'FFFFFFFF',
       muted: 'FF64748B',
       success: 'FF10B981',
       surface: 'FFF8FAFC',
       title: 'FF111827',
}

function getColumnLetter(index: number) {
       let column = ''
       let current = index

       while (current > 0) {
              const remainder = (current - 1) % 26
              column = String.fromCharCode(65 + remainder) + column
              current = Math.floor((current - 1) / 26)
       }

       return column
}

export function createWorkbook() {
       const workbook = new ExcelJS.Workbook()
       workbook.creator = 'CourtOps'
       workbook.lastModifiedBy = 'CourtOps'
       workbook.created = new Date()
       workbook.modified = new Date()
       workbook.company = 'CourtOps'
       workbook.subject = 'Exportación financiera'
       return workbook
}

export function setupWorksheet(
       sheet: ExcelJS.Worksheet,
       title: string,
       subtitle: string,
       columns: WorksheetColumn[]
) {
       const lastColumn = getColumnLetter(columns.length)

       sheet.properties.defaultRowHeight = 22
       sheet.views = [{ state: 'frozen', ySplit: 4 }]
       sheet.columns = columns.map(column => ({
              key: column.key,
              width: column.width ?? 18,
       }))

       sheet.mergeCells(`A1:${lastColumn}1`)
       sheet.mergeCells(`A2:${lastColumn}2`)

       const titleCell = sheet.getCell('A1')
       titleCell.value = title
       titleCell.font = { bold: true, size: 18, color: { argb: COLORS.title } }
       titleCell.alignment = { vertical: 'middle', horizontal: 'left' }

       const subtitleCell = sheet.getCell('A2')
       subtitleCell.value = subtitle
       subtitleCell.font = { size: 10, color: { argb: COLORS.muted } }
       subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' }

       const headerRow = sheet.getRow(4)
       headerRow.height = 24

       columns.forEach((column, index) => {
              headerRow.getCell(index + 1).value = column.header
       })

       headerRow.eachCell(cell => {
              cell.font = { bold: true, color: { argb: COLORS.headerText } }
              cell.fill = {
                     type: 'pattern',
                     pattern: 'solid',
                     fgColor: { argb: COLORS.dark },
              }
              cell.border = {
                     top: { style: 'thin', color: { argb: COLORS.border } },
                     left: { style: 'thin', color: { argb: COLORS.border } },
                     bottom: { style: 'thin', color: { argb: COLORS.border } },
                     right: { style: 'thin', color: { argb: COLORS.border } },
              }
              cell.alignment = { vertical: 'middle', horizontal: 'center' }
       })

       sheet.autoFilter = {
              from: 'A4',
              to: `${lastColumn}4`,
       }

       return 5
}

export function styleDataRow(row: ExcelJS.Row) {
       row.eachCell(cell => {
              cell.border = {
                     bottom: { style: 'thin', color: { argb: COLORS.border } },
              }
              cell.alignment = { vertical: 'middle' }
       })
}

export function styleCurrencyColumn(sheet: ExcelJS.Worksheet, columnKey: string) {
       sheet.getColumn(columnKey).numFmt = '"$"#,##0.00'
}

export function styleIntegerColumn(sheet: ExcelJS.Worksheet, columnKey: string) {
       sheet.getColumn(columnKey).numFmt = '#,##0'
}

export function stylePercentColumn(sheet: ExcelJS.Worksheet, columnKey: string) {
       sheet.getColumn(columnKey).numFmt = '0.00%'
}

export function styleDateColumn(sheet: ExcelJS.Worksheet, columnKey: string) {
       sheet.getColumn(columnKey).numFmt = 'dd/mm/yyyy'
}

export function styleDateTimeColumn(sheet: ExcelJS.Worksheet, columnKey: string) {
       sheet.getColumn(columnKey).numFmt = 'dd/mm/yyyy hh:mm'
}

export function addSectionTitle(sheet: ExcelJS.Worksheet, title: string, rowNumber: number, columnCount: number) {
       const lastColumn = getColumnLetter(columnCount)
       sheet.mergeCells(`A${rowNumber}:${lastColumn}${rowNumber}`)
       const cell = sheet.getCell(`A${rowNumber}`)
       cell.value = title
       cell.font = { bold: true, color: { argb: COLORS.title }, size: 12 }
       cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: COLORS.surface },
       }
       cell.border = {
              top: { style: 'thin', color: { argb: COLORS.border } },
              left: { style: 'thin', color: { argb: COLORS.border } },
              bottom: { style: 'thin', color: { argb: COLORS.border } },
              right: { style: 'thin', color: { argb: COLORS.border } },
       }
}

export function autoFitColumns(sheet: ExcelJS.Worksheet) {
       sheet.columns.forEach(column => {
              let maxLength = column.width ?? 10

              column.eachCell?.({ includeEmpty: true }, cell => {
                     const rawValue = cell.value
                     const text = rawValue == null
                            ? ''
                            : typeof rawValue === 'object' && 'text' in rawValue
                                   ? String(rawValue.text ?? '')
                                   : String(rawValue)

                     maxLength = Math.max(maxLength, text.length + 2)
              })

              column.width = Math.min(Math.max(maxLength, 12), 40)
       })
}

export async function workbookToResponse(workbook: ExcelJS.Workbook, filename: string) {
       const buffer = await workbook.xlsx.writeBuffer()

       return new NextResponse(buffer, {
              headers: {
                     'Content-Disposition': `attachment; filename="${filename}"`,
                     'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              }
       })
}

export function successFill() {
       return {
              type: 'pattern' as const,
              pattern: 'solid' as const,
              fgColor: { argb: COLORS.success },
       }
}
