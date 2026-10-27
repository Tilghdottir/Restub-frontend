export type OrderStatus = "verification_pending" | "pending" | "paid" | "fulfilled" | "cancelled" | "disputed"

export type PaymentStatus = "pending" | "authorized" | "captured" | "failed" | "refunded" | "settled"

export type TicketStatus = "issued" | "redeemed" | "cancelled" | "expired"

export type DisputeStatus = "Open" | "In Review" | "Resolved"

export type CheckoutRequest = {
  listingId: string
  quantity: number
  email: string
  firstName: string
  lastName: string
  phone: string
  currency?: string
  identityType?: "bvn" | "nin"
  identifier?: string
  identityConsent?: boolean
  date_of_birth?: string
}

export type OrderApiRecord = {
  id: string
  buyerId: string | null
  buyerEmail: string | null
  sellerId: string
  listingId: string
  quantity: number
  manualDelivery: boolean
  manualDeliverySubmittedAt: string | null
  manualDeliveryAcceptedAt: string | null
  totalAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export type CheckoutTransactionApiRecord = {
  id: string
  provider: string
  providerReference: string
  amount: number
  currency: string
  status: string
}

export type TicketApiRecord = {
  id: string
  orderId: string
  buyerId: string | null
  sellerId: string
  listingId: string
  code: string
  status: TicketStatus
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export type CheckoutResponse = {
  order: OrderApiRecord
  transaction?: CheckoutTransactionApiRecord
  ticket?: TicketApiRecord
  checkoutUrl?: string | null
  verification?: {
    status: "pending"
    expiresAt: string
  }
}
