import type {
  AccountSummaryResponse,
  AuthTokenResponse,
  AuthUserResponse,
  CheckoutRequest,
  CheckoutResponse,
  CreatePayoutAccountRequest,
  CreateListingRequest,
  DisputeSummary,
  KycCaseSummary,
  KycApiRecord,
  KycProfile,
  ListingApiRecord,
  ListingPageResponse,
  ListingSummary,
  NotificationSummary,
  OrderDetailResponse,
  OrderSummary,
  PaymentMethod,
  PayoutAccount,
  PayoutAccountApiRecord,
  RefundSummary,
  SubmitKycRequest,
  TicketSummary,
  TransactionSummary,
} from "./api-types"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://restub.onrender.com/api"
    : "http://localhost:3000/api")
).replace(/\/+$/, "")

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {}
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (isRecord(value) && Array.isArray(value.data)) return value.data
  return []
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

function createIdempotencyKey(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID()
  }

  return `restub-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  unwrapEnvelope = true,
): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("restub_access_token")
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      isRecord(body) && typeof body.message === "string"
        ? body.message
        : `API request failed (${response.status})`
    throw new Error(message)
  }

  if (unwrapEnvelope && isRecord(body) && "success" in body && "data" in body) {
    return body.data as T
  }

  return body as T
}

function extractToken(value: unknown): string {
  const record = asRecord(value)
  const nested = asRecord(record.data)
  return asString(
    record.accessToken ??
      record.access_token ??
      nested.accessToken ??
      nested.access_token,
  )
}

function normalizeOrder(value: unknown): OrderSummary {
  const order = asRecord(value)
  return {
    id: asString(order.id),
    eventTitle: asString(order.title ?? order.eventTitle, "Order"),
    date: asString(order.createdAt ?? order.date),
    total: asNumber(order.totalAmount ?? order.total ?? order.amount),
    status: asString(order.status, "pending") as OrderSummary["status"],
    venue: asString(order.venue, "Online marketplace"),
  }
}

function normalizeListingStatus(value: unknown): ListingSummary["status"] {
  const normalized = asString(value).toLowerCase()
  if (
    normalized === "draft" ||
    normalized === "published" ||
    normalized === "suspended" ||
    normalized === "rejected"
  ) {
    return normalized
  }
  return "draft"
}

function normalizeListing(value: unknown): ListingSummary {
  const listing = asRecord(value) as ListingApiRecord
  return {
    id: asString(listing.id),
    eventTitle: asString(listing.title, "Listing"),
    date: asString(listing.createdAt),
    askingPrice: asNumber(listing.price),
    quantity: asNumber(listing.quantity),
    status: normalizeListingStatus(listing.status),
    venue: "Online marketplace",
  }
}

export const apiClient = {
  async login(email: string, password: string): Promise<void> {
    const result = await request<AuthTokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    if (!result.accessToken || !result.refreshToken) {
      throw new Error("Login succeeded without complete token credentials")
    }
    window.localStorage.setItem("restub_access_token", result.accessToken)
    window.localStorage.setItem("restub_refresh_token", result.refreshToken)
  },

  async register(email: string, password: string): Promise<void> {
    await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  async logout(): Promise<void> {
    const refreshToken =
      typeof window === "undefined"
        ? ""
        : (window.localStorage.getItem("restub_refresh_token") ?? "")
    await request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
    window.localStorage.removeItem("restub_access_token")
    window.localStorage.removeItem("restub_refresh_token")
  },

  async getCurrentUser(): Promise<AuthUserResponse> {
    return request<AuthUserResponse>("/auth/me")
  },

  async getListings(
    options: { limit?: number; cursor?: string } = {},
  ): Promise<ListingPageResponse> {
    const query = new URLSearchParams()
    query.set("limit", String(options.limit ?? 24))
    if (options.cursor) query.set("cursor", options.cursor)
    const result = await request<{
      data: ListingApiRecord[]
      meta?: JsonRecord
    }>(`/listings?${query.toString()}`, {}, false)
    const response = asRecord(result)
    const pagination = asRecord(response.meta).pagination
    const page = asRecord(pagination)
    return {
      items: asArray(result.data).map(
        (item) => asRecord(item) as ListingApiRecord,
      ),
      nextCursor: typeof page.nextCursor === "string" ? page.nextCursor : null,
      hasMore: page.hasMore === true,
    }
  },

  async getMyListings(): Promise<ListingSummary[]> {
    const result = await request<unknown>("/listings/mine/all")
    return asArray(result).map(normalizeListing)
  },

  async getListingById(listingId: string): Promise<ListingApiRecord> {
    return request<ListingApiRecord>(
      `/listings/${encodeURIComponent(listingId)}`,
    )
  },

  async submitKyc(
    payload: SubmitKycRequest,
    idempotencyKey = createIdempotencyKey(),
  ): Promise<KycApiRecord> {
    return request<KycApiRecord>("/kyc/submit", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(payload),
    })
  },

  async createPayoutAccount(
    payload: CreatePayoutAccountRequest,
    idempotencyKey = createIdempotencyKey(),
  ): Promise<PayoutAccountApiRecord> {
    return request<PayoutAccountApiRecord>("/payout-accounts", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(payload),
    })
  },

  async createListing(
    payload: CreateListingRequest,
    idempotencyKey = createIdempotencyKey(),
  ): Promise<ListingSummary> {
    const result = await request<unknown>("/listings", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        quantity: payload.quantity,
        price: payload.price,
      }),
    })
    return normalizeListing(result)
  },

  async publishListing(
    listingId: string,
    idempotencyKey = createIdempotencyKey(),
  ): Promise<ListingSummary> {
    const result = await request<unknown>(
      `/listings/${encodeURIComponent(listingId)}/publish`,
      {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      },
    )
    return normalizeListing(result)
  },

  async getAccountSummary(): Promise<AccountSummaryResponse> {
    const [ordersResult, listingsResult] = await Promise.all([
      request<unknown>("/orders"),
      request<unknown>("/listings/mine/all"),
    ])
    return {
      purchases: asArray(ordersResult).map(normalizeOrder),
      listings: asArray(listingsResult).map(normalizeListing),
    }
  },

  async getOrderDetail(orderId: string): Promise<OrderDetailResponse> {
    const order = asRecord(
      await request<unknown>(`/orders/${encodeURIComponent(orderId)}`),
    )
    return {
      id: asString(order.id, orderId),
      eventTitle: asString(order.eventTitle ?? order.title, "Order"),
      eventDate: asString(order.eventDate ?? order.createdAt ?? order.date),
      venue: asString(order.venue),
      section: asString(order.section),
      row: asString(order.row),
      seats: asString(order.seats),
      quantity: asNumber(order.quantity),
      unitPrice: asNumber(order.unitPrice ?? order.price),
      subtotal: asNumber(order.subtotal),
      fees: asNumber(order.fees),
      total: asNumber(order.total ?? order.amount),
      status: asString(
        order.status,
        "pending",
      ) as OrderDetailResponse["status"],
      deliveryMethod: asString(order.deliveryMethod, "Instant e-ticket"),
      createdAt: asString(order.createdAt),
    }
  },

  async getDisputes(): Promise<DisputeSummary[]> {
    throw new Error(
      "The backend Swagger contract does not expose a disputes endpoint yet",
    )
  },

  async getKycCases(): Promise<KycCaseSummary[]> {
    const result = await request<unknown>("/kyc/review")
    return asArray(result).map((item) => {
      const record = asRecord(item)
      return {
        id: asString(record.id),
        applicant: asString(record.applicant ?? record.name),
        status: asString(record.status, "pending") as KycCaseSummary["status"],
        risk: asString(record.risk, "Low") as KycCaseSummary["risk"],
        submittedAt: asString(record.submittedAt ?? record.createdAt),
      }
    })
  },

  async submitCheckout(
    payload: CheckoutRequest,
    idempotencyKey = createIdempotencyKey(),
  ): Promise<CheckoutResponse> {
    return request<CheckoutResponse>("/orders/checkout", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({
        listingId: String(payload.eventId),
        quantity: payload.qty,
        email:
          typeof window === "undefined"
            ? ""
            : (window.localStorage.getItem("restub_email") ?? ""),
        currency: payload.currency ?? "USD",
      }),
    })
  },

  async getKycProfile(): Promise<KycProfile> {
    const response = asRecord(await request<unknown>("/kyc/me"))
    const profile = asRecord(response.data ?? response)

    return {
      status: asString(profile.status, "pending") as KycProfile["status"],
      legalName: asString(profile.legalName ?? profile.name) || null,
      submittedAt:
        asString(
          profile.submittedAt ?? profile.createdAt ?? profile.updatedAt,
        ) || null,
      documentType: asString(profile.documentType) || null,
    }
  },

  async getPayoutAccounts(): Promise<PayoutAccount[]> {
    const response = asRecord(await request<unknown>("/payout-accounts/me"))
    const rawAccounts = Array.isArray(response.data)
      ? response.data
      : [response.data ?? response]

    return rawAccounts.map((item) => {
      const account = asRecord(item)
      const status = asString(account.status, "pending")

      return {
        id: asString(account.id),
        institution: asString(
          account.institution ?? account.bankCode ?? "Bank",
        ),
        accountName: asString(
          account.accountName ?? account.name ?? "Bank account",
        ),
        last4: asString(account.accountNumberLast4 ?? account.last4),
        status: status as PayoutAccount["status"],
      }
    })
  },

  async getTickets(): Promise<TicketSummary[]> {
    const result = await request<unknown>("/tickets")
    return asArray(result).map((item) => {
      const ticket = asRecord(item)
      return {
        id: asString(ticket.id),
        eventTitle: asString(ticket.eventTitle ?? ticket.title, "Ticket"),
        eventDate: asString(ticket.eventDate ?? ticket.date),
        section: asString(ticket.section),
        row: asString(ticket.row),
        seats: asString(ticket.seats),
        deliveryStatus: asString(
          ticket.deliveryStatus ?? ticket.status,
          "Pending",
        ) as TicketSummary["deliveryStatus"],
      }
    })
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const result = await request<unknown>("/payments")
    return asArray(result).map((item) => {
      const payment = asRecord(item)
      return {
        id: asString(payment.id),
        brand: asString(payment.brand, "Visa") as PaymentMethod["brand"],
        last4: asString(payment.last4),
        expiry: asString(payment.expiry),
        isDefault: asBoolean(payment.isDefault),
      }
    })
  },

  async getTransactions(): Promise<TransactionSummary[]> {
    const result = await request<unknown>("/payments")
    return asArray(result).map((item) => {
      const transaction = asRecord(item)
      return {
        id: asString(transaction.id),
        type: asString(
          transaction.type,
          "Purchase",
        ) as TransactionSummary["type"],
        description: asString(transaction.description ?? transaction.reference),
        amount: asNumber(transaction.amount),
        status: asString(
          transaction.status,
          "Pending",
        ) as TransactionSummary["status"],
        createdAt: asString(transaction.createdAt),
      }
    })
  },

  async getNotifications(): Promise<NotificationSummary[]> {
    const result = await request<unknown>("/notifications")
    return asArray(result).map((item) => {
      const notification = asRecord(item)
      return {
        id: asString(notification.id),
        title: asString(notification.title),
        body: asString(notification.body ?? notification.message),
        read: asBoolean(notification.read),
        createdAt: asString(notification.createdAt),
      }
    })
  },

  async getRefunds(): Promise<RefundSummary[]> {
    throw new Error(
      "Refund history is not exposed by the backend Swagger contract yet",
    )
  },
}

export async function getListings() {
  return apiClient.getListings()
}
export async function getMyListings() {
  return apiClient.getMyListings()
}
export async function getListingById(listingId: string) {
  return apiClient.getListingById(listingId)
}
export async function createListing(
  payload: CreateListingRequest,
  idempotencyKey?: string,
) {
  return apiClient.createListing(payload, idempotencyKey)
}
export async function publishListing(
  listingId: string,
  idempotencyKey?: string,
) {
  return apiClient.publishListing(listingId, idempotencyKey)
}
export async function getAccountSummary() {
  return apiClient.getAccountSummary()
}
export async function getOrderDetail(orderId: string) {
  return apiClient.getOrderDetail(orderId)
}
export async function getDisputes() {
  return apiClient.getDisputes()
}
export async function getKycCases() {
  return apiClient.getKycCases()
}
export async function submitCheckout(
  payload: CheckoutRequest,
  idempotencyKey?: string,
) {
  return apiClient.submitCheckout(payload, idempotencyKey)
}
