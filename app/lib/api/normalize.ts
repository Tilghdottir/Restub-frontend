import type { ListingApiRecord } from "../listings/types"
import type { ListingSummary } from "../listings/models"
import type { OrderSummary } from "../orders/models"
import type { OrderStatus } from "../orders/types"
import type { ListingTicketDetails } from "../listings/types"
import {
  asString,
  expectRecord,
  requireNumber,
  requireOneOf,
  requireString,
} from "./parse"
import { LISTING_TICKET_TYPES } from "../listings/types"

const orderStatuses = [
  "verification_pending",
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "disputed",
] as const satisfies readonly OrderStatus[]

const listingStatuses = ["draft", "published", "suspended", "rejected"] as const

export function normalizeOrder(value: unknown): OrderSummary {
  const order = expectRecord(value, "order")
  const id = requireString(order, "id", "order")
  const totalKey =
    "totalAmount" in order
      ? "totalAmount"
      : "total" in order
        ? "total"
        : "amount"
  const total = requireNumber(order, totalKey, "order")
  const status = requireOneOf(order, "status", orderStatuses, "order")
  return {
    id,
    eventTitle: asString(order.title ?? order.eventTitle, "Order"),
    date: asString(order.createdAt ?? order.date),
    total,
    status,
    venue: asString(order.venue, "Online marketplace"),
  }
}

export function normalizeListing(value: unknown): ListingSummary {
  const listing = expectRecord(value, "listing")
  const status = requireOneOf(
    { ...listing, status: asString(listing.status).toLowerCase() },
    "status",
    listingStatuses,
    "listing",
  )
  const manualReviewStatus = listing.manualReviewStatus
  const manualReviewNote = listing.manualReviewNote
  if (
    manualReviewNote !== undefined &&
    manualReviewNote !== null &&
    typeof manualReviewNote !== "string"
  ) {
    throw new Error(
      "Invalid API response: listing.manualReviewNote must be a string or null.",
    )
  }
  return {
    id: requireString(listing, "id", "listing"),
    eventTitle: requireString(listing, "title", "listing"),
    date: asString(listing.createdAt),
    askingPrice: requireNumber(listing, "price", "listing"),
    quantity: requireNumber(listing, "quantity", "listing"),
    status,
    ...(manualReviewStatus !== undefined
      ? {
          manualReviewStatus: requireOneOf(
            listing,
            "manualReviewStatus",
            ["not_submitted", "pending", "approved", "rejected"] as const,
            "listing",
          ),
        }
      : {}),
    ...(manualReviewNote === undefined ? {} : { manualReviewNote }),
    venue: "Online marketplace",
    ticketCategory: asString(listing.ticketCategory, "General Admission"),
    ticketType:
      listing.ticketType === undefined
        ? "general_admission"
        : requireOneOf(listing, "ticketType", LISTING_TICKET_TYPES, "listing"),
    ticketDetails: parseListingTicketDetails(listing.ticketDetails),
  }
}

function parseListingTicketDetails(
  value: unknown,
): ListingTicketDetails | null {
  if (value === undefined || value === null) return null
  const details = expectRecord(value, "listing ticket details")
  const stringFields = [
    "section",
    "row",
    "seatNumbers",
    "accessArea",
    "sessionName",
    "packageName",
    "accessibilityNotes",
    "otherDetails",
  ] as const
  const parsed: ListingTicketDetails = {}
  for (const field of stringFields) {
    if (details[field] !== undefined) {
      if (typeof details[field] !== "string") {
        throw new Error(
          `Invalid API response: listing.ticketDetails.${field} must be a string.`,
        )
      }
      parsed[field] = details[field]
    }
  }
  if (details.includedAdmissions !== undefined) {
    if (
      typeof details.includedAdmissions !== "number" ||
      !Number.isInteger(details.includedAdmissions)
    ) {
      throw new Error(
        "Invalid API response: listing.ticketDetails.includedAdmissions must be an integer.",
      )
    }
    parsed.includedAdmissions = details.includedAdmissions
  }
  return parsed
}

export function parseListingApiRecord(value: unknown): ListingApiRecord {
  const listing = expectRecord(value, "listing")
  const summary = normalizeListing(listing)
  const description = requireString(listing, "description", "listing")
  const ownerId = listing.ownerId
  const updatedAt = listing.updatedAt
  const deleted = listing.deleted
  const manualReviewStatus = listing.manualReviewStatus
  const manualReviewNote = listing.manualReviewNote
  const optionalString = (field: string): string | undefined => {
    const fieldValue = listing[field]
    if (fieldValue === undefined) return undefined
    if (typeof fieldValue !== "string") {
      throw new Error(
        `Invalid API response: listing.${field} must be a string.`,
      )
    }
    return fieldValue
  }
  const partnerId = optionalString("partnerId")
  const partnerName = optionalString("partnerName")
  const partnerUrl = optionalString("partnerUrl")
  const partnerEventId = optionalString("partnerEventId")
  const eventName = optionalString("eventName")
  const eventUrl = optionalString("eventUrl")
  const eventDate = optionalString("eventDate")
  const eventTime = optionalString("eventTime")
  const eventVenue = optionalString("eventVenue")

  if (ownerId !== undefined && typeof ownerId !== "string") {
    throw new Error("Invalid API response: listing.ownerId must be a string.")
  }
  if (updatedAt !== undefined && typeof updatedAt !== "string") {
    throw new Error("Invalid API response: listing.updatedAt must be a string.")
  }
  if (deleted !== undefined && typeof deleted !== "boolean") {
    throw new Error("Invalid API response: listing.deleted must be a boolean.")
  }
  if (
    manualReviewNote !== undefined &&
    manualReviewNote !== null &&
    typeof manualReviewNote !== "string"
  ) {
    throw new Error(
      "Invalid API response: listing.manualReviewNote must be a string or null.",
    )
  }

  return {
    id: summary.id,
    ...(ownerId ? { ownerId } : {}),
    title: summary.eventTitle,
    description,
    quantity: summary.quantity,
    price: summary.askingPrice,
    status: summary.status,
    ticketCategory: summary.ticketCategory,
    ticketType: summary.ticketType,
    ticketDetails: summary.ticketDetails,
    ...(partnerId !== undefined ? { partnerId } : {}),
    ...(partnerName !== undefined ? { partnerName } : {}),
    ...(partnerUrl !== undefined ? { partnerUrl } : {}),
    ...(partnerEventId !== undefined ? { partnerEventId } : {}),
    ...(eventName !== undefined ? { eventName } : {}),
    ...(eventUrl !== undefined ? { eventUrl } : {}),
    ...(eventDate !== undefined ? { eventDate } : {}),
    ...(eventTime !== undefined ? { eventTime } : {}),
    ...(eventVenue !== undefined ? { eventVenue } : {}),
    ...(manualReviewStatus !== undefined
      ? {
          manualReviewStatus: requireOneOf(
            listing,
            "manualReviewStatus",
            ["not_submitted", "pending", "approved", "rejected"] as const,
            "listing",
          ),
        }
      : {}),
    ...(manualReviewNote === undefined
      ? {}
      : {
          manualReviewNote:
            manualReviewNote === null ? null : asString(manualReviewNote),
        }),
    ...(summary.date ? { createdAt: summary.date } : {}),
    ...(typeof updatedAt === "string" ? { updatedAt } : {}),
    ...(typeof deleted === "boolean" ? { deleted } : {}),
  }
}
