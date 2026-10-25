import type { ListingSummary } from "../listings/models"
import type { OrderSummary } from "../orders/models"

export type AccountSummaryResponse = {
  purchases: OrderSummary[]
  listings: ListingSummary[]
}
