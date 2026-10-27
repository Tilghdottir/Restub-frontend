export type TicketSummary = {
  id: string
  eventTitle: string
  eventDate: string
  section: string
  row: string
  seats: string
  deliveryStatus: "Ready" | "Delivered" | "Pending" | "Cancelled" | "Expired"
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
}
