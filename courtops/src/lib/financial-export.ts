export type ExportTransaction = {
       amount: number
       category?: string | null
       method?: string | null
       type: string
}

export type GroupedFinancialTotal = {
       count: number
       expense: number
       income: number
       key: string
       net: number
}

const DEFAULT_CATEGORY = 'SIN_CATEGORIA'
const DEFAULT_METHOD = 'UNSPECIFIED'
const CASH_METHOD = 'CASH'

function normalizeKey(value: string | null | undefined, fallback: string) {
       return value?.trim().toUpperCase() || fallback
}

function sortGroupedTotals(items: GroupedFinancialTotal[]) {
       return items.sort((a, b) => {
              if (b.net !== a.net) return b.net - a.net
              return a.key.localeCompare(b.key)
       })
}

export function summarizeTransactions(transactions: ExportTransaction[]) {
       let incomeTotal = 0
       let expenseTotal = 0
       let incomeCount = 0
       let expenseCount = 0

       const byMethod = new Map<string, GroupedFinancialTotal>()
       const byCategory = new Map<string, GroupedFinancialTotal>()

       for (const transaction of transactions) {
              const isIncome = transaction.type === 'INCOME'
              const amount = Number(transaction.amount || 0)
              const methodKey = normalizeKey(transaction.method, DEFAULT_METHOD)
              const categoryKey = normalizeKey(transaction.category, DEFAULT_CATEGORY)

              if (isIncome) {
                     incomeTotal += amount
                     incomeCount += 1
              } else {
                     expenseTotal += amount
                     expenseCount += 1
              }

              const groups = [byMethod, byCategory]
              const keys = [methodKey, categoryKey]

              groups.forEach((group, index) => {
                     const key = keys[index]
                     const current = group.get(key) ?? {
                            key,
                            income: 0,
                            expense: 0,
                            net: 0,
                            count: 0,
                     }

                     current.count += 1
                     if (isIncome) {
                            current.income += amount
                            current.net += amount
                     } else {
                            current.expense += amount
                            current.net -= amount
                     }

                     group.set(key, current)
              })
       }

       return {
              incomeTotal,
              expenseTotal,
              netTotal: incomeTotal - expenseTotal,
              incomeCount,
              expenseCount,
              byMethod: sortGroupedTotals(Array.from(byMethod.values())),
              byCategory: sortGroupedTotals(Array.from(byCategory.values())),
       }
}

export function calculateCashRegisterExportSummary(
       startAmount: number,
       transactions: ExportTransaction[],
       declaredCash?: number | null,
       closingDigitalAmount?: number | null
) {
       const summary = summarizeTransactions(transactions)
       const cashSummary = summary.byMethod.find(item => item.key === CASH_METHOD)

       const incomeCash = cashSummary?.income ?? 0
       const expenseCash = cashSummary?.expense ?? 0
       const expectedCash = startAmount + incomeCash - expenseCash
       const incomeDigital = summary.incomeTotal - incomeCash
       const expenseDigital = summary.expenseTotal - expenseCash
       const netDigital = incomeDigital - expenseDigital

       return {
              ...summary,
              startAmount,
              incomeCash,
              expenseCash,
              expectedCash,
              declaredCash: declaredCash ?? null,
              difference: declaredCash == null ? null : declaredCash - expectedCash,
              incomeDigital,
              expenseDigital,
              netDigital,
              closingDigitalAmount: closingDigitalAmount ?? null,
       }
}

export function getAverageIncomeTicket(incomeTotal: number, incomeCount: number) {
       return incomeCount > 0 ? incomeTotal / incomeCount : 0
}
