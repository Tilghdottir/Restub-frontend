export type PlatformSummary = {
  users: number
  listings: number
  orders: number
  escrows: number
}

export type FinancialReportRow = {
  currency: string
  status: string
  count: number
  amountMinor: number
}

export type FinancialReport = {
  from: string
  to: string
  amountsAreMinorUnits: true
  payments: FinancialReportRow[]
  transactions: FinancialReportRow[]
}
