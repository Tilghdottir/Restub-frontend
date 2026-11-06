export type SellerEarningsApiResponse = {
  from: string
  to: string
  amountsAreMinorUnits: boolean
  currencies: Array<{
    currency: string
    paymentCount: number
    grossAmountMinor: string
    pendingAmountMinor: string
    heldAmountMinor: string
    releasedAmountMinor: string
    refundedAmountMinor: string
    sellerFeesMinor: string | null
    sellerFeesStatus: "recorded" | "not_recorded"
    escrowCountsByStatus: Record<string, number>
    releaseCountsByProviderStatus: Record<string, number>
  }>
  payout: {
    accountStatus: string | null
  }
}
