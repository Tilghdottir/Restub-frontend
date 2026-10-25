import type { CheckoutRequest, CheckoutResponse } from "./types"
import type { DisputeSummary, OrderDetailResponse } from "./models"
import {
  asRecord,
  asString,
  requireBoolean,
  requireNullableString,
  expectRecord,
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

export async function getOrderDetail(
  orderId: string,
): Promise<OrderDetailResponse> {
  const order = expectRecord(
    await authenticatedRequest<unknown>(
      `/orders/${encodeURIComponent(orderId)}`,
    ),
    "order",
  )
  const totalKey = "total" in order ? "total" : "amount"
  const unitPriceKey = "unitPrice" in order ? "unitPrice" : "price"
  return {
    id: requireString(order, "id", "order"),
    eventTitle: asString(order.eventTitle ?? order.title, "Order"),
    eventDate: asString(order.eventDate ?? order.createdAt ?? order.date),
    venue: asString(order.venue),
    section: asString(order.section),
    row: asString(order.row),
    seats: asString(order.seats),
    quantity: requireNumber(order, "quantity", "order"),
    unitPrice: requireNumber(order, unitPriceKey, "order"),
    subtotal: requireNumber(order, "subtotal", "order"),
    fees: requireNumber(order, "fees", "order"),
    total: requireNumber(order, totalKey, "order"),
    status: requireOneOf(order, "status", orderStatuses, "order"),
    deliveryMethod: asString(order.deliveryMethod, "Instant e-ticket"),
    createdAt: asString(order.createdAt),
  }
}

export async function submitCheckout(
  payload: CheckoutRequest,
  idempotencyKey = createIdempotencyKey(),
): Promise<CheckoutResponse> {
  const headers = new Headers({ "idempotency-key": idempotencyKey })
  const accessToken =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("restub_access_token")
  if (!accessToken) headers.set("x-device-id", getDeviceId())

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
  const checkoutOrder = {
    id: requireString(order, "id", "checkout response order"),
    buyerId: requireString(order, "buyerId", "checkout response order"),
    buyerEmail: requireNullableString(
      order,
      "buyerEmail",
      "checkout response order",
    ),
    sellerId: requireString(order, "sellerId", "checkout response order"),
    listingId: requireString(order, "listingId", "checkout response order"),
    quantity: requireNumber(order, "quantity", "checkout response order"),
    totalAmount: requireNumber(order, "totalAmount", "checkout response order"),
    status: requireOneOf(
      order,
      "status",
      orderStatuses,
      "checkout response order",
    ),
    createdAt: requireString(order, "createdAt", "checkout response order"),
    updatedAt: requireString(order, "updatedAt", "checkout response order"),
    deleted: requireBoolean(order, "deleted", "checkout response order"),
  }
  let payment: CheckoutResponse["payment"]
  if (checkout.payment !== undefined && checkout.payment !== null) {
    const record = expectRecord(checkout.payment, "checkout response payment")
    const paymentStatuses = [
      "pending",
      "authorized",
      "captured",
      "failed",
      "refunded",
      "settled",
    ] as const
    payment = {
      id: requireString(record, "id", "checkout response payment"),
      orderId: requireString(record, "orderId", "checkout response payment"),
      buyerId: requireString(record, "buyerId", "checkout response payment"),
      sellerId: requireString(record, "sellerId", "checkout response payment"),
      amount: requireNumber(record, "amount", "checkout response payment"),
      currency: requireString(record, "currency", "checkout response payment"),
      provider: requireString(record, "provider", "checkout response payment"),
      providerReference: requireNullableString(
        record,
        "providerReference",
        "checkout response payment",
      ),
      status: requireOneOf(
        record,
        "status",
        paymentStatuses,
        "checkout response payment",
      ),
      createdAt: requireString(
        record,
        "createdAt",
        "checkout response payment",
      ),
      updatedAt: requireString(
        record,
        "updatedAt",
        "checkout response payment",
      ),
      ...(record.authorizationUrl === undefined ||
      record.authorizationUrl === null ||
      typeof record.authorizationUrl === "string"
        ? { authorizationUrl: record.authorizationUrl }
        : (() => {
            throw new Error(
              "Invalid API response: payment.authorizationUrl must be a string or null.",
            )
          })()),
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
  if (checkout.verification !== undefined) {
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
    ...(payment ? { payment } : {}),
    ...(checkoutUrl !== undefined ? { checkoutUrl } : {}),
    ...(verification ? { verification } : {}),
  }
}
