import type {
  NotificationSummary,
  PaymentsData,
  TicketSummary,
  TransactionSummary,
} from "./types"
import {
  asBoolean,
  asString,
  expectArray,
  expectRecord,
  parseCursorPage,
  requireNumber,
  requireNullableString,
  requireOneOf,
  requireString,
} from "../api/parse"
import { authenticatedRequest } from "../auth/request"
import type { TicketStatus } from "../orders/types"
import { createIdempotencyKey } from "../api/device"

type PaymentRecord = Record<string, unknown>
type RefundRequestResponse = {
  orderId: string
  status: string
}

const ticketStatuses = [
  "issued",
  "redeemed",
  "cancelled",
  "expired",
] as const satisfies readonly TicketStatus[]

function toDeliveryStatus(value: unknown): TicketSummary["deliveryStatus"] {
  if (value === undefined || value === null) return "Pending"
  if (typeof value !== "string") {
    throw new Error("Invalid API response: ticket.status must be a string.")
  }

  if (value === "Ready" || value === "Delivered" || value === "Pending") {
    return value
  }

  const status = requireOneOf(
    { status: value },
    "status",
    ticketStatuses,
    "ticket",
  )
  switch (status) {
    case "issued":
      return "Ready"
    case "redeemed":
      return "Delivered"
    case "cancelled":
      return "Cancelled"
    case "expired":
      return "Expired"
  }
}

export async function getTickets(): Promise<TicketSummary[]> {
  const result = await authenticatedRequest<unknown>("/tickets")
  return expectArray(result, "tickets").map((item) => {
    const ticket = expectRecord(item, "ticket")
    return {
      id: requireString(ticket, "id", "ticket"),
      eventTitle: asString(ticket.eventTitle ?? ticket.title, "Ticket"),
      eventDate: asString(ticket.eventDate ?? ticket.date),
      section: asString(ticket.section),
      row: asString(ticket.row),
      seats: asString(ticket.seats),
      deliveryStatus: toDeliveryStatus(ticket.deliveryStatus ?? ticket.status),
    }
  })
}

export async function getPayments(cursor?: string): Promise<PaymentsData> {
  const query = new URLSearchParams({ limit: "25" })
  if (cursor) query.set("cursor", cursor)
  const response = await authenticatedRequest<unknown>(
    `/payments?${query.toString()}`,
    {},
    { unwrapEnvelope: false },
  )
  const page = parseCursorPage(response, "payments")
  const transactions: TransactionSummary[] = page.items.map((item) => {
    const payment: PaymentRecord = expectRecord(item, "payment")
    return {
      id: requireString(payment, "id", "payment"),
      orderId: requireString(payment, "orderId", "payment"),
      amount: requireNumber(payment, "amount", "payment"),
      currency: requireString(payment, "currency", "payment"),
      provider: requireString(payment, "provider", "payment"),
      providerReference: requireNullableString(
        payment,
        "providerReference",
        "payment",
      ),
      status: requireOneOf(
        payment,
        "status",
        [
          "pending",
          "authorized",
          "captured",
          "failed",
          "refunded",
          "settled",
        ] as const,
        "payment",
      ),
      createdAt: requireString(payment, "createdAt", "payment"),
    }
  })
  return {
    methods: [],
    transactions,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
  }
}

export async function getNotifications(): Promise<NotificationSummary[]> {
  const result = await authenticatedRequest<unknown>("/notifications")
  return expectArray(result, "notifications").map((item) => {
    const notification = expectRecord(item, "notification")
    return {
      id: requireString(notification, "id", "notification"),
      title: asString(notification.title),
      body: asString(notification.body ?? notification.message),
      read: asBoolean(notification.read),
      createdAt: asString(notification.createdAt),
    }
  })
}

export async function requestRefund(
  orderId: string,
  idempotencyKey = createIdempotencyKey(),
): Promise<RefundRequestResponse> {
  const result = expectRecord(
    await authenticatedRequest<unknown>(
      `/refunds/${encodeURIComponent(orderId)}`,
      {
        method: "POST",
        headers: { "idempotency-key": idempotencyKey },
      },
    ),
    "refund response",
  )
  return {
    orderId: requireString(result, "orderId", "refund response"),
    status: requireString(result, "status", "refund response"),
  }
}
