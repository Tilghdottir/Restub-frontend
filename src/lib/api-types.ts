export type OrderStatus = "Confirmed" | "Processing" | "Shipped" | "Completed"
export type ListingStatus = "Active" | "Draft" | "Sold"
export type DisputeStatus = "Open" | "In Review" | "Resolved"
export type KycStatus = "Pending" | "Approved" | "Rejected"

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
  eventId: number
  section: string
  row: string
  seats: string
  qty: number
  price: number
}

export type CheckoutResponse = {
  orderId: string
  total: number
  status: "confirmed"
}
