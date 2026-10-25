import type {
  ListingStatus,
  ListingTicketDetails,
  ListingTicketType,
  ManualListingReviewStatus,
  ManualReviewEvidenceRecord,
  ManualReviewListingRecord,
} from "./types"

export type ListingSummary = {
  id: string
  eventTitle: string
  date: string
  askingPrice: number
  quantity: number
  status: ListingStatus
  manualReviewStatus?: ManualListingReviewStatus
  manualReviewNote?: string | null
  venue: string
  ticketCategory?: string
  ticketType?: ListingTicketType
  ticketDetails?: ListingTicketDetails | null
}

export type ListingDetail = {
  id: string
  title: string
  description: string
  quantity: number
  price: number
  status: ListingStatus
  ticketCategory?: string
  ticketType?: ListingTicketType
  ticketDetails?: ListingTicketDetails | null
  manualReviewStatus?: ManualListingReviewStatus
  manualReviewNote?: string | null
  createdAt?: string
  updatedAt?: string
}

export type ListingPageResponse = {
  items: ListingSummary[]
  nextCursor: string | null
  hasMore: boolean
}

export type ManualReviewListing = ManualReviewListingRecord
export type ManualReviewEvidence = ManualReviewEvidenceRecord
