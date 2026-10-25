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

export type DisputeSummary = {
  id: string
  subject: string
  status: DisputeStatus
  priority: "High" | "Medium" | "Low"
  updatedAt: string
}
