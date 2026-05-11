export function getBankDetails() {
  return {
    alias: process.env.COURTOPS_BANK_ALIAS || 'courtops.admin',
    cvu: process.env.COURTOPS_BANK_CVU || '',
    accountName: process.env.COURTOPS_BANK_ACCOUNT_NAME || 'CourtOps',
  }
}

export function calcBillingAmount(planPrice: number, cycle: 'monthly' | 'yearly') {
  return cycle === 'yearly' ? Math.round(planPrice * 12 * 0.8) : planPrice
}

export function calcPeriodEnd(cycle: 'monthly' | 'yearly', from = new Date()) {
  const end = new Date(from)
  cycle === 'yearly' ? end.setFullYear(end.getFullYear() + 1) : end.setMonth(end.getMonth() + 1)
  return end
}
