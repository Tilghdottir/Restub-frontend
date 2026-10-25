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
  buyerId: string
  buyerEmail: string | null
  sellerId: string
  listingId: string
  quantity: number
  totalAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  deleted: boolean
}

export type PaymentApiRecord = {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  amount: number
  currency: string
  provider: string
  providerReference: string | null
  status: PaymentStatus
  createdAt: string
  updatedAt: string
}

export type TicketApiRecord = {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  listingId: string
  code: string
  status: TicketStatus
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export type CheckoutResponse = {
  order: Omit<OrderApiRecord, "status"> & {
    status: OrderStatus
  }
  payment?: PaymentApiRecord & {
    authorizationUrl?: string | null
  }
  ticket?: TicketApiRecord
  checkoutUrl?: string | null
  verification?: {
    status: "pending"
    expiresAt: string
  }
}
