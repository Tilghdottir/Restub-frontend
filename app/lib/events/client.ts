import {
  expectArray,
  expectRecord,
  parseCursorPage,
  requireBoolean,
  requireNullableString,
  requireNumber,
  requireString,
} from "../api/parse"
import { request } from "../api/http"
import { authenticatedRequest } from "../auth/request"
import type {
  CatalogEvent,
  CatalogPartner,
  PendingCatalogEvent,
} from "./models"
import type { PendingCatalogEventPage } from "./types"

export async function getEventPartners(): Promise<CatalogPartner[]> {
  const result = await request<unknown>("/events/partners")
  return expectArray(result, "event partners").map(parseEventPartner)
}

export async function searchEventPartners(
  query: string,
): Promise<CatalogPartner[]> {
  const params = new URLSearchParams({ q: query })
  const result = await request<unknown>(
    `/events/partners/search?${params.toString()}`,
  )
  return expectArray(result, "partner search results").map(parseEventPartner)
}

function parseEventPartner(value: unknown): CatalogPartner {
  const partner = expectRecord(value, "event partner")
  const websiteUrl = partner.websiteUrl
  if (
    websiteUrl !== undefined &&
    websiteUrl !== null &&
    typeof websiteUrl !== "string"
  ) {
    throw new Error(
      "Invalid API response: event partner websiteUrl must be a string or null.",
    )
  }
  return {
    id: requireString(partner, "id", "event partner"),
    slug: requireString(partner, "slug", "event partner"),
    name: requireString(partner, "name", "event partner"),
    status: requireString(partner, "status", "event partner"),
    ...(websiteUrl !== undefined ? { websiteUrl } : {}),
  }
}

export async function getEvents(slug: string): Promise<CatalogEvent[]> {
  console.log(slug)
  const result = await request<unknown>(`/events/${encodeURIComponent(slug)}`)
  return expectArray(result, `events`).map((item) => parseCatalogEvent(item))
}

export async function getAdminCatalogEvents(): Promise<CatalogEvent[]> {
  const partners = await getEventPartners()
  const eventLists = await Promise.all(
    partners.map(async (partner) => {
      const result = await request<unknown>(
        `/events/partners/${encodeURIComponent(partner.id)}?includePast=true`,
      )
      return expectArray(result, `events for ${partner.name}`).map((item) =>
        parseCatalogEvent(item),
      )
    }),
  )
  return eventLists.flat().sort((left, right) => {
    const leftDate = left.startsAt ? Date.parse(left.startsAt) : Infinity
    const rightDate = right.startsAt ? Date.parse(right.startsAt) : Infinity
    return leftDate - rightDate || left.name.localeCompare(right.name)
  })
}

export async function getPendingEvents(
  options: {
    limit?: number
    cursor?: string
  } = {},
): Promise<PendingCatalogEventPage> {
  const query = new URLSearchParams({
    limit: String(options.limit ?? 25),
  })
  if (options.cursor) query.set("cursor", options.cursor)
  const page = parseCursorPage(
    await authenticatedRequest<unknown>(
      `/events/admin/pending?${query.toString()}`,
      {},
      { unwrapEnvelope: false },
    ),
    "pending event queue",
  )
  return {
    items: page.items.map(parsePendingEvent),
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
  }
}

export async function approvePendingEvent(id: string): Promise<void> {
  const response = expectRecord(
    await authenticatedRequest<unknown>(
      `/events/${encodeURIComponent(id)}/approve`,
      { method: "PATCH" },
    ),
    "approved partner event",
  )
  if (requireString(response, "id", "approved partner event") !== id) {
    throw new Error(
      "Invalid API response: approved partner event id does not match.",
    )
  }
  requireString(response, "catalogStatus", "approved partner event")
}

function parsePendingEvent(value: unknown): PendingCatalogEvent {
  const event = expectRecord(value, "pending partner event")
  return {
    id: requireString(event, "id", "pending partner event"),
    partnerId: requireString(event, "partnerId", "pending partner event"),
    externalEventId: requireString(
      event,
      "externalEventId",
      "pending partner event",
    ),
    sourceSlug: requireString(event, "sourceSlug", "pending partner event"),
    sourceUrl: requireString(event, "sourceUrl", "pending partner event"),
    title: requireString(event, "title", "pending partner event"),
    venue: requireNullableString(event, "venue", "pending partner event"),
    address: requireNullableString(event, "address", "pending partner event"),
    description: requireNullableString(
      event,
      "description",
      "pending partner event",
    ),
    image: requireNullableString(event, "image", "pending partner event"),
    startsAt: requireNullableString(event, "startsAt", "pending partner event"),
    createdAt: requireString(event, "createdAt", "pending partner event"),
  }
}

function parseCatalogEvent(value: unknown): CatalogEvent {
  const event = expectRecord(value, "catalog event")
  const tickets = expectArray(event.tickets, "catalog event ticket tiers").map(
    (value) => {
      const ticket = expectRecord(value, "catalog event ticket tier")
      return {
        name: requireString(ticket, "name", "catalog event ticket tier"),
        price:
          ticket.price === null
            ? null
            : requireNumber(ticket, "price", "catalog event ticket tier"),
        currency: requireNullableString(
          ticket,
          "currency",
          "catalog event ticket tier",
        ),
      }
    },
  )

  return {
    id: requireString(event, "id", "catalog event"),
    partnerId: requireString(event, "partnerId", "catalog event"),
    partnerSlug: requireString(event, "partnerSlug", "catalog event"),
    externalEventId: requireString(event, "externalEventId", "catalog event"),
    slug: requireString(event, "slug", "catalog event"),
    url: requireString(event, "url", "catalog event"),
    name: requireString(event, "name", "catalog event"),
    startDate: requireNullableString(event, "startDate", "catalog event"),
    startTime: requireNullableString(event, "startTime", "catalog event"),
    startsAt: requireNullableString(event, "startsAt", "catalog event"),
    venue: requireNullableString(event, "venue", "catalog event"),
    address: requireNullableString(event, "address", "catalog event"),
    image: requireNullableString(event, "image", "catalog event"),
    description: requireNullableString(event, "description", "catalog event"),
    priceRange: requireNullableString(event, "priceRange", "catalog event"),
    currency: requireNullableString(event, "currency", "catalog event"),
    tickets,
    resaleEnabled: requireBoolean(event, "resaleEnabled", "catalog event"),
    lastScrapedAt: requireNullableString(
      event,
      "lastScrapedAt",
      "catalog event",
    ),
  }
}
