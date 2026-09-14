import type {
  AccountSummaryResponse,
  CheckoutRequest,
  CheckoutResponse,
  DisputeSummary,
  KycCaseSummary,
  ListingSummary,
  OrderDetailResponse,
  OrderSummary,
} from "./api-types"

const mockBaseDelay = 250

async function wait<T>(value: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, mockBaseDelay))
  return value
}

export const apiClient = {
  async getAccountSummary(): Promise<AccountSummaryResponse> {
    // TODO: replace with real API call.
    return wait({
      purchases: [
        {
          id: "RC-8921",
          eventTitle: "Kendrick Lamar",
          date: "Sat, Oct 11",
          total: 620,
          status: "Confirmed",
          venue: "Madison Square Garden",
        },
        {
          id: "RC-6944",
          eventTitle: "Sabrina Carpenter",
          date: "Fri, Oct 24",
          total: 410,
          status: "Processing",
          venue: "Barclays Center",
        },
      ] satisfies OrderSummary[],
      listings: [
        {
          id: "LS-101",
          eventTitle: "Hamilton",
          date: "Tue, Nov 4",
          askingPrice: 320,
          quantity: 2,
          status: "Active",
          venue: "Richard Rodgers Theatre",
        },
        {
          id: "LS-203",
          eventTitle: "Chappell Roan",
          date: "Sun, Sep 28",
          askingPrice: 280,
          quantity: 1,
          status: "Draft",
          venue: "Forest Hills Stadium",
        },
      ] satisfies ListingSummary[],
    })
  },

  async getOrderDetail(orderId: string): Promise<OrderDetailResponse> {
    // TODO: replace with real API call.
    return wait({
      id: orderId,
      eventTitle: "Kendrick Lamar",
      eventDate: "Sat, Oct 11",
      venue: "Madison Square Garden",
      section: "Section 101",
      row: "C",
      seats: "22–23",
      quantity: 2,
      unitPrice: 310,
      subtotal: 620,
      fees: 81,
      total: 701,
      status: "Confirmed",
      deliveryMethod: "Instant e-ticket",
      createdAt: "2026-09-12T18:45:00Z",
    })
  },

  async getDisputes(): Promise<DisputeSummary[]> {
    // TODO: replace with real API call.
    return wait([
      {
        id: "DSP-204",
        subject: "Delayed ticket delivery",
        status: "Open",
        priority: "High",
        updatedAt: "2 hours ago",
      },
      {
        id: "DSP-119",
        subject: "Seller misrepresented seat location",
        status: "In Review",
        priority: "Medium",
        updatedAt: "Today",
      },
    ])
  },

  async getKycCases(): Promise<KycCaseSummary[]> {
    // TODO: replace with real API call.
    return wait([
      {
        id: "KYC-408",
        applicant: "Lena Ortiz",
        status: "Pending",
        risk: "Low",
        submittedAt: "2026-09-12",
      },
      {
        id: "KYC-391",
        applicant: "Roman Bell",
        status: "Approved",
        risk: "Medium",
        submittedAt: "2026-09-11",
      },
    ])
  },

  async submitCheckout(payload: CheckoutRequest): Promise<CheckoutResponse> {
    // TODO: replace with real API call.
    return wait({
      orderId: `RC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      total:
        payload.qty * payload.price +
        Math.round(payload.qty * payload.price * 0.13),
      status: "confirmed",
    })
  },
}

export async function getAccountSummary(): Promise<AccountSummaryResponse> {
  return apiClient.getAccountSummary()
}

export async function getOrderDetail(
  orderId: string,
): Promise<OrderDetailResponse> {
  return apiClient.getOrderDetail(orderId)
}

export async function getDisputes(): Promise<DisputeSummary[]> {
  return apiClient.getDisputes()
}

export async function getKycCases(): Promise<KycCaseSummary[]> {
  return apiClient.getKycCases()
}

export async function submitCheckout(
  payload: CheckoutRequest,
): Promise<CheckoutResponse> {
  return apiClient.submitCheckout(payload)
}
