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
  ticketDetails: {
    section: string
    row: string
    seatNumbers: string
  }
  ticketDeliveries: Array<{
    slotIndex: number
    mimeType: string
    expectedBytes: number
    deliveredAt: string | null
  }>
}

export type SellerOrderSummary = {
  id: string
  sellerId: string
  listingId: string
  listingTitle: string
  quantity: number
  totalAmount: number
  status: "verification_pending" | "pending" | "paid" | "fulfilled" | "cancelled" | "disputed"
  manualDelivery: boolean
  manualDeliverySubmittedAt: string | null
  manualDeliveryAcceptedAt: string | null
  escrowStatus: "hold" | "release_pending" | "released" | "refund_pending" | "refunded" | "disputed" | null
  createdAt: string
}

export type CreateOrderDeliveryUploadResponse = {
  deliveryId: string
  slotIndex: number
  method: "POST"
  url: string
  fields: Record<string, string>
  uploadMode: "direct" | "api"
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
