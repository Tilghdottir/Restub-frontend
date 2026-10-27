import type { DisputeStatus, OrderStatus } from "./types"

export type OrderSummary = {
  id: string
  eventTitle: string
  date: string
  total: number
  status: OrderStatus
  venue: string
}

export type OrderDetailResponse = {
  id: string
  buyerId: string | null
  sellerId: string
  listingId: string
  eventTitle: string
  eventDate: string
  venue: string
  section: string
  row: string
  seats: string
  quantity: number
  unitPrice: number
  subtotal: number
  fees: number
  total: number
  status: OrderStatus
  deliveryMethod: string
  createdAt: string
  manualDelivery: boolean
  manualDeliverySubmittedAt: string | null
  manualDeliveryAcceptedAt: string | null
}

export type EscrowOperationStatus = {
  orderId: string
  escrowStatus: "hold" | "release_pending" | "released" | "refund_pending" | "refunded" | "disputed"
  releaseStatus: string | null
  refundStatus: string | null
}

export type OrderDeliveryResponse = {
  orderId: string
  tickets: Array<{
    slotIndex: number
    mimeType: string
    url: string
    expiresAt: string
  }>
}

export type DisputeSummary = {
  id: string
  subject: string
  status: DisputeStatus
  priority: "High" | "Medium" | "Low"
  updatedAt: string
}
