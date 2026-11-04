import type {
  DashboardTicketSummary,
  NotificationSummary,
  PaymentsData,
  TicketSummary,
  TransactionSummary,
} from "./types"
import {
  asRecord,
  asString,
  expectArray,
  expectRecord,
  parseCursorPage,
  requireBoolean,
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

const dashboardStatuses = [
  "valid",
  "listed",
  "sold",
  "transferred",
  "used",
  "refunded",
  "expired",
  "cancelled",
  "pending_verification",
  "invalid",
] as const

const dashboardActions = [
  "open_ticket",
  "edit_listing",
  "sell",
  "transfer_now",
] as const

function nullableString(
  record: Record<string, unknown>,
  key: string,
  label: string,
): string | null {
  const value = record[key]
  if (value === null) return null
  if (typeof value !== "string") {
    throw new Error(
      `Invalid API response: ${label}.${key} must be a string or null.`,
    )
  }
  return value
}

function normalizeDashboardTicket(value: unknown): DashboardTicketSummary {
  const ticket = expectRecord(value, "dashboard ticket")
  const actionValue = ticket.action
  const action =
    actionValue === null
      ? null
      : requireOneOf(ticket, "action", dashboardActions, "dashboard ticket")
  return {
    id: requireString(ticket, "id", "dashboard ticket"),
    itemType: requireOneOf(
      ticket,
      "itemType",
      ["ticket", "listing"] as const,
      "dashboard ticket",
    ),
    relationship: requireOneOf(
      ticket,
      "relationship",
      ["buyer", "seller"] as const,
      "dashboard ticket",
    ),
    eventTitle: requireString(ticket, "eventTitle", "dashboard ticket"),
    eventDate: nullableString(ticket, "eventDate", "dashboard ticket"),
    venue: nullableString(ticket, "venue", "dashboard ticket"),
    section: nullableString(ticket, "section", "dashboard ticket"),
    row: nullableString(ticket, "row", "dashboard ticket"),
    seats: nullableString(ticket, "seats", "dashboard ticket"),
    status: requireOneOf(
      ticket,
      "status",
      dashboardStatuses,
      "dashboard ticket",
    ),
    quantity: requireNumber(ticket, "quantity", "dashboard ticket"),
    locked: requireBoolean(ticket, "locked", "dashboard ticket"),
    eventCancelled: requireBoolean(
      ticket,
      "eventCancelled",
      "dashboard ticket",
    ),
    createdAt: requireString(ticket, "createdAt", "dashboard ticket"),
    orderId: nullableString(ticket, "orderId", "dashboard ticket"),
    listingId: nullableString(ticket, "listingId", "dashboard ticket"),
    action,
    actionHref: nullableString(ticket, "actionHref", "dashboard ticket"),
    attention: nullableString(ticket, "attention", "dashboard ticket"),
  }
}

export async function getDashboardTickets(): Promise<DashboardTicketSummary[]> {
  const tickets: DashboardTicketSummary[] = []
  const cursors = new Set<string>()
  let cursor: string | undefined
  do {
    const query = new URLSearchParams({ limit: "100" })
    if (cursor) query.set("cursor", cursor)
    const response = await authenticatedRequest<unknown>(
      `/tickets/dashboard?${query.toString()}`,
      {},
      { unwrapEnvelope: false },
    )
    const page = parseCursorPage(response, "dashboard tickets")
    tickets.push(...page.items.map(normalizeDashboardTicket))
    if (!page.hasMore) break
    if (!page.nextCursor || cursors.has(page.nextCursor)) {
      throw new Error(
        "Invalid API response: dashboard ticket cursor did not advance.",
      )
    }
    cursors.add(page.nextCursor)
    cursor = page.nextCursor
  } while (true)
  return tickets
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
    const data = asRecord(notification.data)
    const event = requireString(notification, "event", "notification")
    const listingId = data.listingId
    const nextAction = data.nextAction
    const reviewNote = data.reviewNote
    const details = Object.entries(data)
      .filter(
        ([key, value]) =>
          key !== "buyerId" &&
          key !== "sellerId" &&
          key !== "ownerId" &&
          key !== "userId" &&
          typeof value === "string",
      )
      .map(
        ([key, value]) =>
          `${key.replace(/([A-Z])/g, " $1").toLowerCase()}: ${value}`,
      )
      .slice(0, 2)
    const sellerReviewMessage = (() => {
      switch (event) {
        case "listing.manual_review.submitted":
          return {
            title: "Ticket review submitted",
            body: "Your listing is not live while the ticket evidence is reviewed.",
          }
        case "listing.manual_review.approved":
          return {
            title: "Ticket review approved",
            body:
              typeof nextAction === "string"
                ? `Complete this next step: ${nextAction}`
                : "Your listing is ready for the next step.",
          }
        case "listing.manual_review.rejected":
          return {
            title: "Ticket evidence needs changes",
            body:
              typeof reviewNote === "string"
                ? `${reviewNote} Replace the rejected file and resubmit it for review.`
                : "Replace the rejected file and resubmit it for review.",
          }
        case "listing.published":
          return {
            title: "Your listing is live",
            body: "Your listing is now published and visible to buyers.",
          }
        default:
          return null
      }
    })()
    return {
      id: requireString(notification, "id", "notification"),
      title:
        sellerReviewMessage?.title ??
        event
          .split(".")
          .map((word) => word.replace(/_/g, " "))
          .join(" "),
      body: sellerReviewMessage?.body ?? details.join(" · "),
      read: notification.readAt !== null,
      createdAt: requireString(notification, "createdAt", "notification"),
      ...(typeof listingId === "string"
        ? { href: "/account/my-listings" }
        : {}),
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
