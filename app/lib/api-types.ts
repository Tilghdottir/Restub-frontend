export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "disputed"
export type ListingStatus = "draft" | "published" | "suspended" | "rejected"
export type DisputeStatus = "Open" | "In Review" | "Resolved"
export type KycStatus = "pending" | "verified" | "rejected" | "requires_review"
export type PaymentStatus = "pending" | "authorized" | "captured" | "failed" | "refunded" | "settled"
export type TicketStatus = "issued" | "redeemed" | "cancelled" | "expired"

export type OrderSummary = {
  id: string
  eventTitle: string
  date: string
  total: number
  status: OrderStatus
  venue: string
}

export type ListingSummary = {
  id: string
  eventTitle: string
  date: string
  askingPrice: number
  quantity: number
  status: ListingStatus
  venue: string
}

export type OrderDetailResponse = {
  id: string
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
}

export type AccountSummaryResponse = {
  purchases: OrderSummary[]
  listings: ListingSummary[]
}

export type DisputeSummary = {
  id: string
  subject: string
  status: DisputeStatus
  priority: "High" | "Medium" | "Low"
  updatedAt: string
}

export type KycCaseSummary = {
  id: string
  applicant: string
  status: KycStatus
  risk: "Low" | "Medium" | "High"
  submittedAt: string
}

export type CheckoutRequest = {
  eventId: number | string
  section: string
  row: string
  seats: string
  qty: number
  price: number
}

export type CreateListingRequest = {
  title: string
  description: string
  quantity: number
  price: number
}

export type UpdateListingRequest = Partial<CreateListingRequest>

export type ListingApiRecord = {
  id: string
  ownerId: string
  title: string
  description: string
  quantity: number
  price: number
  status: ListingStatus
  createdAt: string
  updatedAt: string
  deleted: boolean
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
  order: OrderApiRecord
  payment: PaymentApiRecord
  ticket?: TicketApiRecord
}

export type KycProfile = {
  status: KycStatus
  legalName: string
  submittedAt: string | null
  documentType: "Passport" | "Drivers license" | null
}

export type PayoutAccount = {
  id: string
  institution: string
  accountName: string
  last4: string
  status: "Verified" | "Pending"
}

export type TicketSummary = {
  id: string
  eventTitle: string
  eventDate: string
  section: string
  row: string
  seats: string
  deliveryStatus: "Ready" | "Delivered" | "Pending"
}

export type PaymentMethod = {
  id: string
  brand: "Visa" | "Mastercard" | "Amex"
  last4: string
  expiry: string
  isDefault: boolean
}

export type TransactionSummary = {
  id: string
  type: "Purchase" | "Payout" | "Refund"
  description: string
  amount: number
  status: "Completed" | "Pending" | "Failed"
  createdAt: string
}

export type NotificationSummary = {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

export type RefundSummary = {
  id: string
  orderId: string
  reason: string
  amount: number
  status: "Requested" | "Approved" | "Rejected"
  createdAt: string
}
