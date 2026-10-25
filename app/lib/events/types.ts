export type EventPartner = {
  id: string
  slug: string
  name: string
  status: string
  websiteUrl?: string | null
}

export type PartnerEventTicketTier = {
  name: string
  price: number | null
  currency: string | null
}

export type PartnerCatalogEvent = {
  id: string
  partnerId: string
  partnerSlug: string
  externalEventId: string
  slug: string
  url: string
  name: string
  startDate: string | null
  startTime: string | null
  startsAt: string | null
  venue: string | null
  address: string | null
  image: string | null
  description: string | null
  priceRange: string | null
  currency: string | null
  tickets: PartnerEventTicketTier[]
  resaleEnabled: boolean
  lastScrapedAt: string | null
}

export type PendingCatalogEvent = {
  id: string
  partnerId: string
  externalEventId: string
  sourceSlug: string
  sourceUrl: string
  title: string
  venue: string | null
  address: string | null
  description: string | null
  image: string | null
  startsAt: string | null
  createdAt: string
}

export type PendingCatalogEventPage = {
  items: PendingCatalogEvent[]
  nextCursor: string | null
  hasMore: boolean
}
