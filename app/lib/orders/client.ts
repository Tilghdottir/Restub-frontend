import type { CheckoutRequest, CheckoutResponse } from "./types"
import type {
  CreateOrderDeliveryUploadResponse,
  DisputeSummary,
  EscrowOperationStatus,
  OrderDeliveryResponse,
  OrderDetailResponse,
  SellerOrderSummary,
} from "./models"
import {
  asString,
  expectArray,
  expectRecord,
  requireBoolean,
  requireNumber,
  requireOneOf,
  requireString,
} from "../api/parse"
import { createIdempotencyKey, getDeviceId } from "../api/device"
import { authenticatedRequest } from "../auth/request"
import { getApiProxyUrl } from "../api/http"
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
  const listing =
    order.listing === undefined || order.listing === null
      ? {}
      : expectRecord(order.listing, "order listing")
  const partnerEvent =
    listing.partnerEvent === undefined || listing.partnerEvent === null
      ? {}
      : expectRecord(listing.partnerEvent, "order event")
  const details =
    listing.ticketDetails === undefined || listing.ticketDetails === null
      ? {}
      : expectRecord(listing.ticketDetails, "order ticket details")
  const ticketDeliveries =
    order.ticketDeliveries === undefined
      ? []
      : expectArray(order.ticketDeliveries, "order ticket deliveries").map(
          (item) => {
            const delivery = expectRecord(item, "order ticket delivery")
            return {
              slotIndex: requireNumber(
                delivery,
                "slotIndex",
                "order ticket delivery",
              ),
              mimeType: requireString(
                delivery,
                "mimeType",
                "order ticket delivery",
              ),
              expectedBytes: requireNumber(
                delivery,
                "expectedBytes",
                "order ticket delivery",
              ),
              deliveredAt: nullableString(
                delivery,
                "deliveredAt",
                "order ticket delivery",
              ),
            }
          },
        )
  return {
    id: requireString(order, "id", "order"),
    buyerId: nullableString(order, "buyerId", "order"),
    sellerId: requireString(order, "sellerId", "order"),
    listingId: requireString(order, "listingId", "order"),
    eventTitle: asString(
      order.eventTitle ?? listing.title ?? order.title,
      "Order",
    ),
    eventDate: asString(
      order.eventDate ??
        partnerEvent.startDate ??
        order.createdAt ??
        order.date,
    ),
    venue: asString(order.venue ?? partnerEvent.venue),
    section: asString(order.section ?? details.section),
    row: asString(order.row ?? details.row),
    seats: asString(order.seats ?? details.seatNumbers),
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
    ticketDetails: {
      section: asString(details.section),
      row: asString(details.row),
      seatNumbers: asString(details.seatNumbers),
    },
    ticketDeliveries,
  }
}

export async function getMySellerOrders(): Promise<SellerOrderSummary[]> {
  const page = await authenticatedRequest<unknown>("/orders?limit=100")
  return expectArray(page, "seller orders").map((item) => {
    const order = expectRecord(item, "seller order")
    const listing =
      order.listing === undefined || order.listing === null
        ? {}
        : expectRecord(order.listing, "seller order listing")
    const escrow =
      order.escrow === undefined || order.escrow === null
        ? null
        : expectRecord(order.escrow, "seller order escrow")
    const status = requireOneOf(order, "status", orderStatuses, "seller order")
    if (
      !Number.isInteger(requireNumber(order, "quantity", "seller order")) ||
      Number(order.quantity) < 1
    ) {
      throw new Error(
        "Invalid API response: seller order.quantity must be a positive integer.",
      )
    }
    return {
      id: requireString(order, "id", "seller order"),
      sellerId: requireString(order, "sellerId", "seller order"),
      listingId: requireString(order, "listingId", "seller order"),
      listingTitle: asString(listing.title, "Ticket order"),
      quantity: requireNumber(order, "quantity", "seller order"),
      totalAmount: requireNumber(order, "totalAmount", "seller order"),
      status,
      manualDelivery: requireBoolean(order, "manualDelivery", "seller order"),
      manualDeliverySubmittedAt: nullableString(
        order,
        "manualDeliverySubmittedAt",
        "seller order",
      ),
      manualDeliveryAcceptedAt: nullableString(
        order,
        "manualDeliveryAcceptedAt",
        "seller order",
      ),
      escrowStatus: escrow
        ? requireOneOf(
            escrow,
            "status",
            [
              "hold",
              "release_pending",
              "released",
              "refund_pending",
              "refunded",
              "disputed",
            ] as const,
            "seller order escrow",
          )
        : null,
      createdAt: requireString(order, "createdAt", "seller order"),
    }
  })
}

export async function deliverManualOrderTicket(
  orderId: string,
  slotIndex: number,
  file: File,
): Promise<void> {
  const mimeType = file.type
  if (!["application/pdf", "image/jpeg", "image/png"].includes(mimeType)) {
    throw new Error("Ticket files must be PDF, JPEG, or PNG.")
  }
  if (file.size < 1 || file.size > 5 * 1024 * 1024) {
    throw new Error("Ticket files must be no larger than 5 MB.")
  }
  const form = expectRecord(
    await authenticatedRequest<unknown>(
      `/orders/${encodeURIComponent(orderId)}/delivery/upload-url`,
      {
        method: "POST",
        body: JSON.stringify({ slotIndex, mimeType, bytes: file.size }),
      },
    ),
    "order delivery upload form",
  )
  const upload: CreateOrderDeliveryUploadResponse = {
    deliveryId: requireString(form, "deliveryId", "order delivery upload form"),
    slotIndex: requireNumber(form, "slotIndex", "order delivery upload form"),
    method: requireOneOf(
      form,
      "method",
      ["POST"] as const,
      "order delivery upload form",
    ),
    url: requireString(form, "url", "order delivery upload form"),
    fields: Object.fromEntries(
      Object.entries(
        expectRecord(form.fields, "order delivery upload fields"),
      ).map(([key, value]) => {
        if (typeof value !== "string") {
          throw new Error(
            `Invalid API response: order delivery upload field "${key}" must be a string.`,
          )
        }
        return [key, value]
      }),
    ),
    uploadMode:
      form.uploadMode === undefined
        ? "direct"
        : requireOneOf(
            form,
            "uploadMode",
            ["direct", "api"] as const,
            "order delivery upload form",
          ),
  }
  if (upload.slotIndex !== slotIndex) {
    throw new Error(
      "Invalid API response: delivery slot does not match the requested slot.",
    )
  }

  const body = new FormData()
  if (upload.uploadMode === "direct") {
    for (const [name, value] of Object.entries(upload.fields))
      body.append(name, value)
  }
  body.append("file", file)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const url =
      upload.uploadMode === "api" ? getApiProxyUrl(upload.url) : upload.url
    xhr.open(upload.method, url)
    xhr.withCredentials = upload.uploadMode === "api"
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Ticket delivery upload failed (${xhr.status}).`))
    })
    xhr.addEventListener("error", () =>
      reject(
        new Error("Ticket delivery upload failed due to a network error."),
      ),
    )
    xhr.send(body)
  })

  const completed = expectRecord(
    await authenticatedRequest<unknown>(
      `/orders/${encodeURIComponent(orderId)}/delivery/${encodeURIComponent(upload.deliveryId)}/complete`,
      { method: "POST" },
    ),
    "completed ticket delivery",
  )
  if (completed.delivered !== true) {
    throw new Error("The uploaded ticket was not confirmed as delivered.")
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
