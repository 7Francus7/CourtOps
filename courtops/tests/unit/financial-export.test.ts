import { describe, expect, it } from 'vitest'
import { calculateCashRegisterExportSummary, summarizeTransactions } from '@/lib/financial-export'

describe('financial export helpers', () => {
       it('summarizes incomes and expenses by method and category', () => {
              const summary = summarizeTransactions([
                     { type: 'INCOME', amount: 10000, method: 'CASH', category: 'BOOKING' },
                     { type: 'INCOME', amount: 3500, method: 'TRANSFER', category: 'KIOSCO' },
                     { type: 'EXPENSE', amount: 1200, method: 'CASH', category: 'SUPPLIES' },
                     { type: 'INCOME', amount: 500, method: 'CASH', category: 'KIOSCO' },
              ])

              expect(summary.incomeTotal).toBe(14000)
              expect(summary.expenseTotal).toBe(1200)
              expect(summary.netTotal).toBe(12800)
              expect(summary.incomeCount).toBe(3)
              expect(summary.expenseCount).toBe(1)

              expect(summary.byMethod).toEqual(
                     expect.arrayContaining([
                            expect.objectContaining({ key: 'CASH', income: 10500, expense: 1200, net: 9300, count: 3 }),
                            expect.objectContaining({ key: 'TRANSFER', income: 3500, expense: 0, net: 3500, count: 1 }),
                     ])
              )

              expect(summary.byCategory).toEqual(
                     expect.arrayContaining([
                            expect.objectContaining({ key: 'BOOKING', income: 10000, expense: 0, net: 10000, count: 1 }),
                            expect.objectContaining({ key: 'KIOSCO', income: 4000, expense: 0, net: 4000, count: 2 }),
                            expect.objectContaining({ key: 'SUPPLIES', income: 0, expense: 1200, net: -1200, count: 1 }),
                     ])
              )
       })

       it('calculates expected and declared cash correctly', () => {
              const summary = calculateCashRegisterExportSummary(
                     20000,
                     [
                            { type: 'INCOME', amount: 10000, method: 'CASH', category: 'BOOKING' },
                            { type: 'INCOME', amount: 5000, method: 'TRANSFER', category: 'KIOSCO' },
                            { type: 'EXPENSE', amount: 2500, method: 'CASH', category: 'SUPPLIES' },
                     ],
                     28000,
                     5000
              )

              expect(summary.startAmount).toBe(20000)
              expect(summary.incomeCash).toBe(10000)
              expect(summary.expenseCash).toBe(2500)
              expect(summary.expectedCash).toBe(27500)
              expect(summary.declaredCash).toBe(28000)
              expect(summary.difference).toBe(500)
              expect(summary.incomeDigital).toBe(5000)
              expect(summary.expenseDigital).toBe(0)
              expect(summary.netDigital).toBe(5000)
              expect(summary.closingDigitalAmount).toBe(5000)
       })
})
