import type { SellerEarningsApiResponse } from "./types"

export type SellerEarnings = Omit<SellerEarningsApiResponse, "amountsAreMinorUnits" | "payout"> & {
  payoutAccountStatus: string | null
}
