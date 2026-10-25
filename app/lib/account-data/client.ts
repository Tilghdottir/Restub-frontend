import type {
  NotificationSummary,
  PaymentMethod,
  PaymentsData,
  RefundSummary,
  TicketSummary,
  TransactionSummary,
} from "./types"
import {
  asBoolean,
  asString,
  expectArray,
  expectRecord,
  requireNumber,
  requireOneOf,
  requireString,
} from "../api/parse"
import { authenticatedRequest } from "../auth/request"
import type { TicketStatus } from "../orders/types"

type PaymentRecord = Record<string, unknown>

const ticketStatuses = [
  "issued",
  "redeemed",
  "cancelled",
  "expired",
] as const satisfies readonly TicketStatus[]

function hasMethodShape(payment: PaymentRecord): boolean {
  return (
    "brand" in payment ||
    "last4" in payment ||
    "expiry" in payment ||
    "isDefault" in payment
  )
}

function hasTransactionShape(payment: PaymentRecord): boolean {
  return (
    "type" in payment ||
    "amount" in payment ||
    "description" in payment ||
    "reference" in payment
  )
}

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

export async function getPayments(): Promise<PaymentsData> {
  const result = await authenticatedRequest<unknown>("/payments")
  const payments = expectArray(result, "payments").map((item) =>
    expectRecord(item, "payment"),
  )

  const methods = payments.flatMap((payment) => {
    if (!hasMethodShape(payment)) return []

    return [
      {
        id: requireString(payment, "id", "payment"),
        brand: requireOneOf(
          payment,
          "brand",
          ["Visa", "Mastercard", "Amex"] as const,
          "payment",
        ),
        last4: requireString(payment, "last4", "payment"),
        expiry: requireString(payment, "expiry", "payment"),
        isDefault: asBoolean(payment.isDefault),
      },
    ]
  })

  const transactions = payments.flatMap((payment) => {
    if (!hasTransactionShape(payment)) return []

    return [
      {
        id: requireString(payment, "id", "payment"),
        type: requireOneOf(
          payment,
          "type",
          ["Purchase", "Payout", "Refund"] as const,
          "payment",
        ),
        description: requireString(
          {
            ...payment,
            description: payment.description ?? payment.reference,
          },
          "description",
          "payment",
        ),
        amount: requireNumber(payment, "amount", "payment"),
        status: requireOneOf(
          payment,
          "status",
          ["Completed", "Pending", "Failed"] as const,
          "payment",
        ),
        createdAt: requireString(payment, "createdAt", "payment"),
      },
    ]
  })

  if (
    payments.some(
      (payment) => !hasMethodShape(payment) && !hasTransactionShape(payment),
    )
  ) {
    throw new Error(
      "Invalid API response: payment record does not match a known payment shape.",
    )
  }

  return {
    methods,
    transactions,
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

export async function getRefunds(): Promise<RefundSummary[]> {
  throw new Error(
    "Refund history is not exposed by the backend Swagger contract yet",
  )
}
