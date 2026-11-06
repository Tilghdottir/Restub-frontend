export type TicketSummary = {
  id: string
  eventTitle: string
  eventDate: string
  section: string
  row: string
  seats: string
  deliveryStatus: "Ready" | "Delivered" | "Pending" | "Cancelled" | "Expired"
}

export type DashboardTicketSummary = {
  id: string
  itemType: "ticket" | "listing"
  relationship: "buyer" | "seller"
  eventTitle: string
  eventDate: string | null
  venue: string | null
  section: string | null
  row: string | null
  seats: string | null
  status: "valid" | "listed" | "sold" | "transferred" | "used" | "refunded" | "expired" | "cancelled" | "pending_verification" | "invalid"
  quantity: number
  locked: boolean
  eventCancelled: boolean
  createdAt: string
  orderId: string | null
  listingId: string | null
  action: "open_ticket" | "edit_listing" | "sell" | "transfer_now" | null
  actionHref: string | null
  attention: string | null
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
  orderId: string
  amount: number
  currency: string
  provider: string
  providerReference: string | null
  status: "pending" | "authorized" | "captured" | "failed" | "refunded" | "settled"
  createdAt: string
}

export type PaymentsData = {
  methods: PaymentMethod[]
  transactions: TransactionSummary[]
  nextCursor: string | null
  hasMore: boolean
}

export type NotificationSummary = {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
  href?: string
}
