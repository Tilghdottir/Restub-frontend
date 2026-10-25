export type ListingStatus = "draft" | "published" | "suspended" | "rejected"
export type ManualListingReviewStatus = "not_submitted" | "pending" | "approved" | "rejected"

export const LISTING_TICKET_TYPES = [
  "reserved_seating",
  "general_admission",
  "standing",
  "pass_session",
  "vip_package",
  "table_hospitality",
  "accessible",
  "group_bundle",
  "other",
] as const

export type ListingTicketType = typeof LISTING_TICKET_TYPES[number]

export type ListingTicketDetails = {
  section?: string
  row?: string
  seatNumbers?: string
  accessArea?: string
  sessionName?: string
  packageName?: string
  includedAdmissions?: number
  accessibilityNotes?: string
  otherDetails?: string
}

export type CreateListingRequest = {
  title: string
  description: string
  quantity: number
  price: number
  ticketCategory?: string
  ticketType?: ListingTicketType
  ticketDetails?: ListingTicketDetails
  partnerId?: string
  partnerName?: string
  partnerUrl?: string
  partnerEventId?: string
  eventName?: string
  eventUrl?: string
  eventDate?: string
  eventTime?: string
  eventVenue?: string
  ticketReference?: string
  ticketReferences?: string[]
}

export type CreateTicketUploadRequest = {
  slotIndex: number
  mimeType: "application/pdf" | "image/jpeg" | "image/png"
  bytes: number
}

export type TicketUploadForm = {
  uploadId: string
  slotIndex: number
  method: "POST"
  url: string
  fields: Record<string, string>
  uploadMode: "direct" | "api"
  expiresAt: string
}

export type TicketUploadCompletion = {
  uploadId: string
  slotIndex: number
  status: "verified"
  ocr: { status: "disabled" } | {
    confidence: number
    characterCount: number
    eventNameMatch: string | null
  }
}

export const TICKET_UPLOAD_STATUSES = [
  "upload_pending",
  "processing",
  "verified",
  "verification_failed",
  "manual_review_pending",
  "manual_review_approved",
  "manual_review_rejected",
] as const

export type TicketUploadStatus = typeof TICKET_UPLOAD_STATUSES[number]

export type DraftTicketUploadStatus = {
  listingId: string
  listingStatus: "draft"
  manualReviewStatus: ManualListingReviewStatus
  manualReviewNote: string | null
  quantity: number
  tickets: Array<{
    slotIndex: number
    status: TicketUploadStatus
  }>
}

export type ManualTicketReviewSubmission = {
  listingId: string
  status: "pending"
  evidenceCount: number
}

export type UpdateListingRequest = Partial<CreateListingRequest>

export type ManualReviewDecision = "approve" | "reject"

export type ManualReviewListingRecord = {
  id: string
  ownerId: string
  title: string
  ticketCategory: string
  quantity: number
  price: number
  partnerEventId: string | null
  manualReviewStatus: "pending" | "approved" | "rejected"
  manualReviewNote: string | null
  createdAt: string
}

export type ManualReviewEvidenceRecord = {
  uploadId: string
  slotIndex: number
  mimeType: string
  url: string
  expiresAt: string
  ocr: { status: "disabled" } | {
    status: "screened"
    confidence: number
    characterCount: number
    eventNameMatch: string | null
  }
}

export type ListingApiRecord = {
  id: string
  ownerId?: string
  title: string
  description: string
  quantity: number
  price: number
  status: ListingStatus
  ticketCategory?: string
  ticketType?: ListingTicketType
  ticketDetails?: ListingTicketDetails | null
  partnerId?: string
  partnerName?: string
  partnerUrl?: string
  partnerEventId?: string
  eventName?: string
  eventUrl?: string
  eventDate?: string
  eventTime?: string
  eventVenue?: string
  manualReviewStatus?: ManualListingReviewStatus
  manualReviewNote?: string | null
  createdAt?: string
  updatedAt?: string
  deleted?: boolean
}
