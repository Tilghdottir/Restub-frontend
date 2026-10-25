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
  type: "Purchase" | "Payout" | "Refund"
  description: string
  amount: number
  status: "Completed" | "Pending" | "Failed"
  createdAt: string
}

export type PaymentsData = {
  methods: PaymentMethod[]
  transactions: TransactionSummary[]
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
