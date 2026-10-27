import type { CheckoutRequest, CheckoutResponse } from "./types"
import type {
  DisputeSummary,
  EscrowOperationStatus,
  OrderDeliveryResponse,
  OrderDetailResponse,
} from "./models"
import {
  asString,
  expectRecord,
  requireBoolean,
  requireNumber,
  requireOneOf,
  requireString,
} from "../api/parse"
import { createIdempotencyKey, getDeviceId } from "../api/device"
import { authenticatedRequest } from "../auth/request"
import type { OrderStatus } from "./types"

const orderStatuses = [
  "verification_pending",
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "disputed",
] as const satisfies readonly OrderStatus[]

function nullableString(
  record: Record<string, unknown>,
  key: string,
  label: string,
): string | null {
  const value = record[key]
  if (value === undefined || value === null) return null
  if (typeof value !== "string") {
    throw new Error(
      `Invalid API response: ${label}.${key} must be a string or null.`,
    )
  }
  return value
}

function numberFrom(
  record: Record<string, unknown>,
  primary: string,
  fallback: string,
  label: string,
): number {
  return requireNumber(record, primary in record ? primary : fallback, label)
}

export async function getOrderDetail(
  orderId: string,
): Promise<OrderDetailResponse> {
  const order = expectRecord(
    await authenticatedRequest<unknown>(
      `/orders/${encodeURIComponent(orderId)}`,
    ),
    "order",
  )
  const quantity = requireNumber(order, "quantity", "order")
  if (quantity <= 0) {
    throw new Error("Invalid API response: order.quantity must be positive.")
  }
  const totalKey = ["totalAmount", "total", "amount"].find(
    (key) => key in order,
  )
  if (!totalKey) {
    throw new Error(
      "Invalid API response: order must include totalAmount or total.",
    )
  }
  const total = requireNumber(order, totalKey, "order")
  const manualDelivery = requireBoolean(order, "manualDelivery", "order")
  return {
    id: requireString(order, "id", "order"),
    buyerId: nullableString(order, "buyerId", "order"),
    sellerId: requireString(order, "sellerId", "order"),
    listingId: requireString(order, "listingId", "order"),
    eventTitle: asString(order.eventTitle ?? order.title, "Order"),
    eventDate: asString(order.eventDate ?? order.createdAt ?? order.date),
    venue: asString(order.venue),
    section: asString(order.section),
    row: asString(order.row),
    seats: asString(order.seats),
    quantity,
    unitPrice:
      "unitPrice" in order || "price" in order
        ? numberFrom(order, "unitPrice", "price", "order")
        : total / quantity,
    subtotal:
      order.subtotal === undefined
        ? total
        : requireNumber(order, "subtotal", "order"),
    fees: order.fees === undefined ? 0 : requireNumber(order, "fees", "order"),
    total,
    status: requireOneOf(order, "status", orderStatuses, "order"),
    deliveryMethod: manualDelivery
      ? "Manual ticket delivery"
      : asString(order.deliveryMethod, "Instant e-ticket"),
    createdAt: asString(order.createdAt),
    manualDelivery,
    manualDeliverySubmittedAt: nullableString(
      order,
      "manualDeliverySubmittedAt",
      "order",
    ),
    manualDeliveryAcceptedAt: nullableString(
      order,
      "manualDeliveryAcceptedAt",
      "order",
    ),
  }
}

export async function submitCheckout(
  payload: CheckoutRequest,
  idempotencyKey = createIdempotencyKey(),
): Promise<CheckoutResponse> {
  const headers = new Headers({ "idempotency-key": idempotencyKey })
  const deviceId = getDeviceId()
  if (deviceId) headers.set("x-device-id", deviceId)

  const result = await authenticatedRequest<unknown>("/orders/checkout", {
    method: "POST",
    headers,
    body: JSON.stringify({
      listingId: payload.listingId,
      quantity: payload.quantity,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      currency: payload.currency ?? "NGN",
      ...(payload.identityType ? { identityType: payload.identityType } : {}),
      ...(payload.identifier ? { identifier: payload.identifier } : {}),
      ...(payload.date_of_birth
        ? { date_of_birth: payload.date_of_birth }
        : {}),
      ...(typeof payload.identityConsent === "boolean"
        ? { identityConsent: payload.identityConsent }
        : {}),
    }),
  })
  const checkout = expectRecord(result, "checkout response")
  const order = expectRecord(checkout.order, "checkout response order")
  const buyerId = nullableString(order, "buyerId", "checkout response order")
  const checkoutOrder = {
    id: requireString(order, "id", "checkout response order"),
    buyerId,
    buyerEmail: nullableString(order, "buyerEmail", "checkout response order"),
    sellerId: requireString(order, "sellerId", "checkout response order"),
    listingId: requireString(order, "listingId", "checkout response order"),
    quantity: requireNumber(order, "quantity", "checkout response order"),
    manualDelivery: requireBoolean(
      order,
      "manualDelivery",
      "checkout response order",
    ),
    manualDeliverySubmittedAt: nullableString(
      order,
      "manualDeliverySubmittedAt",
      "checkout response order",
    ),
    manualDeliveryAcceptedAt: nullableString(
      order,
      "manualDeliveryAcceptedAt",
      "checkout response order",
    ),
    totalAmount: requireNumber(order, "totalAmount", "checkout response order"),
    status: requireOneOf(
      order,
      "status",
      orderStatuses,
      "checkout response order",
    ),
    createdAt: requireString(order, "createdAt", "checkout response order"),
    updatedAt: requireString(order, "updatedAt", "checkout response order"),
  }
  let transaction: CheckoutResponse["transaction"]
  if (checkout.transaction !== undefined && checkout.transaction !== null) {
    const record = expectRecord(
      checkout.transaction,
      "checkout response transaction",
    )
    transaction = {
      id: requireString(record, "id", "checkout response transaction"),
      provider: requireString(
        record,
        "provider",
        "checkout response transaction",
      ),
      providerReference: requireString(
        record,
        "providerReference",
        "checkout response transaction",
      ),
      amount: requireNumber(record, "amount", "checkout response transaction"),
      currency: requireString(
        record,
        "currency",
        "checkout response transaction",
      ),
      status: requireString(record, "status", "checkout response transaction"),
    }
  }
  const checkoutUrl = checkout.checkoutUrl
  if (
    checkoutUrl !== undefined &&
    checkoutUrl !== null &&
    typeof checkoutUrl !== "string"
  ) {
    throw new Error(
      "Invalid API response: checkout response checkoutUrl must be a string or null.",
    )
  }
  let verification: CheckoutResponse["verification"]
  if (checkout.verification !== undefined && checkout.verification !== null) {
    const record = expectRecord(
      checkout.verification,
      "checkout response verification",
    )
    verification = {
      status: requireOneOf(
        record,
        "status",
        ["pending"] as const,
        "checkout response verification",
      ),
      expiresAt: requireString(
        record,
        "expiresAt",
        "checkout response verification",
      ),
    }
  }
  return {
    order: checkoutOrder,
    ...(transaction ? { transaction } : {}),
    ...(checkoutUrl !== undefined ? { checkoutUrl } : {}),
    ...(verification ? { verification } : {}),
  }
}

export async function getEscrowOperationStatus(
  orderId: string,
): Promise<EscrowOperationStatus> {
  const status = expectRecord(
    await authenticatedRequest<unknown>(
      `/payments/escrow/${encodeURIComponent(orderId)}/status`,
    ),
    "escrow operation status",
  )
  const escrowStatus = requireOneOf(
    status,
    "escrowStatus",
    [
      "hold",
      "release_pending",
      "released",
      "refund_pending",
      "refunded",
      "disputed",
    ] as const,
    "escrow operation status",
  )
  return {
    orderId: requireString(status, "orderId", "escrow operation status"),
    escrowStatus,
    releaseStatus: nullableString(
      status,
      "releaseStatus",
      "escrow operation status",
    ),
    refundStatus: nullableString(
      status,
      "refundStatus",
      "escrow operation status",
    ),
  }
}

export async function acceptOrderDelivery(orderId: string): Promise<void> {
  await authenticatedRequest<unknown>(
    `/orders/${encodeURIComponent(orderId)}/delivery/accept`,
    { method: "POST" },
  )
}

export async function getOrderDelivery(
  orderId: string,
): Promise<OrderDeliveryResponse> {
  const result = expectRecord(
    await authenticatedRequest<unknown>(
      `/orders/${encodeURIComponent(orderId)}/delivery`,
    ),
    "order delivery",
  )
  return {
    orderId: requireString(result, "orderId", "order delivery"),
    tickets: Array.isArray(result.tickets)
      ? result.tickets.map((item) => {
          const ticket = expectRecord(item, "delivered ticket")
          const url = requireString(ticket, "url", "delivered ticket")
          let downloadUrl: URL
          try {
            downloadUrl = new URL(url)
          } catch {
            throw new Error(
              "Invalid API response: delivered ticket.url must be a URL.",
            )
          }
          if (downloadUrl.protocol !== "https:") {
            throw new Error(
              "Invalid API response: delivered ticket.url must use HTTPS.",
            )
          }
          return {
            slotIndex: requireNumber(ticket, "slotIndex", "delivered ticket"),
            mimeType: requireString(ticket, "mimeType", "delivered ticket"),
            url: downloadUrl.toString(),
            expiresAt: requireString(ticket, "expiresAt", "delivered ticket"),
          }
        })
      : (() => {
          throw new Error(
            "Invalid API response: order delivery.tickets must be an array.",
          )
        })(),
  }
}

export async function releaseOrderEscrow(
  orderId: string,
  idempotencyKey = createIdempotencyKey(),
): Promise<void> {
  await authenticatedRequest<unknown>(
    `/payments/escrow/${encodeURIComponent(orderId)}/release`,
    {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
    },
  )
}
