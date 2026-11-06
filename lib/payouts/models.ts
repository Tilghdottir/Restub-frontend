import type { PayoutAccountStatus } from "./types"

export type PayoutAccount = {
  id: string
  institution: string
  accountName: string
  last4: string
  status: PayoutAccountStatus
}
