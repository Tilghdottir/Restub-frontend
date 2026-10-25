import type {
  CreateListingRequest,
  CreateTicketUploadRequest,
  DraftTicketUploadStatus,
  ListingApiRecord,
  ManualTicketReviewSubmission,
  ManualReviewDecision,
  TicketUploadCompletion,
  TicketUploadForm,
} from "./types"
import { TICKET_UPLOAD_STATUSES } from "./types"
import type {
  ListingDetail,
  ManualReviewEvidence,
  ManualReviewListing,
  ListingPageResponse,
  ListingSummary,
} from "./models"
import { createIdempotencyKey } from "../api/device"
import { getApiProxyUrl } from "../api/http"
import { authenticatedRequest } from "../auth/request"
import {
  asRecord,
  asString,
  expectArray,
  expectRecord,
  requireNumber,
  requireNullableString,
  requireOneOf,
  requireString,
} from "../api/parse"
import { normalizeListing, parseListingApiRecord } from "../api/normalize"

export async function getListings(
  options: {
    limit?: number
    cursor?: string
  } = {},
): Promise<ListingPageResponse> {
  const query = new URLSearchParams()
  query.set("limit", String(options.limit ?? 24))
  if (options.cursor) query.set("cursor", options.cursor)
  const result = await authenticatedRequest<unknown>(
    `/listings?${query.toString()}`,
    {},
    {
      unwrapEnvelope: false,
    },
  )
  const response = asRecord(result)
  const pagination = asRecord(response.meta).pagination
  const page = asRecord(pagination)
  const items = expectArray(response.data, "listings").map(normalizeListing)
  const nextCursor = page.nextCursor
  const hasMore = page.hasMore
  if (
    nextCursor !== undefined &&
    nextCursor !== null &&
    typeof nextCursor !== "string"
  ) {
    throw new Error(
      "Invalid API response: pagination.nextCursor must be a string or null.",
    )
  }
  if (typeof hasMore !== "boolean") {
    throw new Error(
      "Invalid API response: pagination.hasMore must be a boolean.",
    )
  }
  return {
    items,
    nextCursor: typeof nextCursor === "string" ? nextCursor : null,
    hasMore,
  }
}

export async function getMyListings(): Promise<ListingSummary[]> {
  const result = await authenticatedRequest<unknown>("/listings/mine/all")
  return expectArray(result, "user listings").map(normalizeListing)
}

export async function getManualReviewListings(): Promise<ManualReviewListing[]> {
  const result = await authenticatedRequest<unknown>(
    "/listings/admin/manual-review",
  )
  return expectArray(result, "manual review listings").map((item) => {
    const listing = expectRecord(item, "manual review listing")
    return {
      id: requireString(listing, "id", "manual review listing"),
      ownerId: requireString(listing, "ownerId", "manual review listing"),
      title: requireString(listing, "title", "manual review listing"),
      ticketCategory: requireString(
        listing,
        "ticketCategory",
        "manual review listing",
      ),
      quantity: requireNumber(listing, "quantity", "manual review listing"),
      price: requireNumber(listing, "price", "manual review listing"),
      partnerEventId: requireNullableString(
        listing,
        "partnerEventId",
        "manual review listing",
      ),
      manualReviewStatus: requireOneOf(
        listing,
        "manualReviewStatus",
        ["pending"] as const,
        "manual review listing",
      ),
      manualReviewNote: requireNullableString(
        listing,
        "manualReviewNote",
        "manual review listing",
      ),
      createdAt: requireString(listing, "createdAt", "manual review listing"),
    }
  })
}

export async function getManualReviewEvidence(
  listingId: string,
): Promise<ManualReviewEvidence[]> {
  const result = expectRecord(
    await authenticatedRequest<unknown>(
      `/listings/${encodeURIComponent(listingId)}/tickets/manual-review-evidence`,
    ),
    "manual review evidence response",
  )
  if (
    requireString(result, "listingId", "manual review evidence") !== listingId
  ) {
    throw new Error(
      "Invalid API response: evidence listingId does not match the requested listing.",
    )
  }
  return expectArray(result.evidence, "manual review evidence").map((item) => {
    const evidence = expectRecord(item, "manual review evidence item")
    const ocr = expectRecord(evidence.ocr, "manual review evidence OCR")
    const ocrStatus = asString(ocr.status)
    return {
      uploadId: requireString(evidence, "uploadId", "manual review evidence"),
      slotIndex: requireNumber(evidence, "slotIndex", "manual review evidence"),
      mimeType: requireString(evidence, "mimeType", "manual review evidence"),
      url: requireString(evidence, "url", "manual review evidence"),
      expiresAt: requireString(evidence, "expiresAt", "manual review evidence"),
      ocr:
        ocrStatus === "disabled"
          ? { status: "disabled" }
          : {
              status: "screened",
              confidence: requireNumber(
                ocr,
                "confidence",
                "manual review evidence OCR",
              ),
              characterCount: requireNumber(
                ocr,
                "characterCount",
                "manual review evidence OCR",
              ),
              eventNameMatch:
                ocr.eventNameMatch === null
                  ? null
                  : requireString(
                      ocr,
                      "eventNameMatch",
                      "manual review evidence OCR",
                    ),
            },
    }
  })
}

export async function reviewManualListing(
  listingId: string,
  decision: ManualReviewDecision,
  note?: string,
): Promise<ManualReviewListing> {
  if (decision === "reject" && !note?.trim()) {
    throw new Error("A reason is required to reject manual ticket evidence.")
  }
  const result = expectRecord(
    await authenticatedRequest<unknown>(
      `/listings/admin/${encodeURIComponent(listingId)}/manual-review`,
      {
        method: "PATCH",
        headers: { "idempotency-key": createIdempotencyKey() },
        body: JSON.stringify({ decision, ...(note ? { note } : {}) }),
      },
    ),
    "reviewed listing",
  )
  const returnedId = requireString(result, "id", "reviewed listing")
  if (returnedId !== listingId) {
    throw new Error("Invalid API response: reviewed listing id does not match.")
  }
  const status = requireOneOf(
    result,
    "manualReviewStatus",
    ["approved", "rejected"] as const,
    "reviewed listing",
  )
  return {
    id: returnedId,
    ownerId: requireString(result, "ownerId", "reviewed listing"),
    title: requireString(result, "title", "reviewed listing"),
    ticketCategory: requireString(result, "ticketCategory", "reviewed listing"),
    quantity: requireNumber(result, "quantity", "reviewed listing"),
    price: requireNumber(result, "price", "reviewed listing"),
    partnerEventId: requireNullableString(
      result,
      "partnerEventId",
      "reviewed listing",
    ),
    manualReviewStatus: status,
    manualReviewNote: requireNullableString(
      result,
      "manualReviewNote",
      "reviewed listing",
    ),
    createdAt: requireString(result, "createdAt", "reviewed listing"),
  }
}

export async function getListingById(
  listingId: string,
  options?: { signal?: AbortSignal },
): Promise<ListingDetail> {
  const result = await authenticatedRequest<unknown>(
    `/listings/${encodeURIComponent(listingId)}`,
    options,
  )
  const listing = parseListingApiRecord(result)
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    quantity: listing.quantity,
    price: listing.price,
    status: listing.status,
    ticketCategory: listing.ticketCategory,
    ticketType: listing.ticketType,
    ticketDetails: listing.ticketDetails,
    ...(listing.manualReviewStatus
      ? { manualReviewStatus: listing.manualReviewStatus }
      : {}),
    ...(listing.manualReviewNote !== undefined
      ? { manualReviewNote: listing.manualReviewNote }
      : {}),
    ...(listing.createdAt ? { createdAt: listing.createdAt } : {}),
    ...(listing.updatedAt ? { updatedAt: listing.updatedAt } : {}),
  }
}

export async function getMyListingById(
  listingId: string,
  options?: { signal?: AbortSignal },
): Promise<ListingApiRecord> {
  const result = await authenticatedRequest<unknown>(
    `/listings/mine/${encodeURIComponent(listingId)}`,
    options,
  )
  return parseListingApiRecord(result)
}

export async function createListing(
  payload: CreateListingRequest,
  idempotencyKey = createIdempotencyKey(),
): Promise<ListingSummary> {
  const result = await authenticatedRequest<unknown>("/listings", {
    method: "POST",
    headers: { "idempotency-key": idempotencyKey },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      ticketCategory: payload.ticketCategory ?? "General Admission",
      ticketType: payload.ticketType ?? "general_admission",
      ...(payload.ticketDetails
        ? { ticketDetails: payload.ticketDetails }
        : {}),
      quantity: payload.quantity,
      price: payload.price,
      ...(payload.partnerId ? { partnerId: payload.partnerId } : {}),
      ...(payload.partnerName ? { partnerName: payload.partnerName } : {}),
      ...(payload.partnerUrl ? { partnerUrl: payload.partnerUrl } : {}),
      ...(payload.partnerEventId
        ? { partnerEventId: payload.partnerEventId }
        : {}),
      ...(payload.eventName ? { eventName: payload.eventName } : {}),
      ...(payload.eventUrl ? { eventUrl: payload.eventUrl } : {}),
      ...(payload.eventDate ? { eventDate: payload.eventDate } : {}),
      ...(payload.eventTime ? { eventTime: payload.eventTime } : {}),
      ...(payload.eventVenue ? { eventVenue: payload.eventVenue } : {}),
      ...(payload.ticketReference
        ? { ticketReference: payload.ticketReference }
        : {}),
      ...(payload.ticketReferences
        ? { ticketReferences: payload.ticketReferences }
        : {}),
    }),
  })
  return normalizeListing(result)
}

export async function createTicketUpload(
  listingId: string,
  payload: CreateTicketUploadRequest,
): Promise<TicketUploadForm> {
  const result = expectRecord(
    await authenticatedRequest<unknown>(
      `/listings/${encodeURIComponent(listingId)}/tickets/upload-url`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
    "ticket upload form",
  )
  const fieldsRecord = expectRecord(result.fields, "ticket upload fields")
  const fields: Record<string, string> = {}
  for (const [name, value] of Object.entries(fieldsRecord)) {
    if (typeof value !== "string") {
      throw new Error(
        `Invalid API response: ticket upload field "${name}" must be a string.`,
      )
    }
    fields[name] = value
  }
  const form: TicketUploadForm = {
    uploadId: requireString(result, "uploadId", "ticket upload form"),
    slotIndex: requireNumber(result, "slotIndex", "ticket upload form"),
    method: requireOneOf(
      result,
      "method",
      ["POST"] as const,
      "ticket upload form",
    ),
    url: requireString(result, "url", "ticket upload form"),
    fields,
    uploadMode:
      result.uploadMode === undefined
        ? "direct"
        : requireOneOf(
            result,
            "uploadMode",
            ["direct", "api"] as const,
            "ticket upload form",
          ),
    expiresAt: requireString(result, "expiresAt", "ticket upload form"),
  }
  if (form.slotIndex !== payload.slotIndex) {
    throw new Error(
      "Invalid API response: ticket upload slot does not match the requested slot.",
    )
  }
  return form
}

export async function getDraftTicketUploadStatus(
  listingId: string,
): Promise<DraftTicketUploadStatus> {
  const result = expectRecord(
    await authenticatedRequest<unknown>(
      `/listings/${encodeURIComponent(listingId)}/tickets/status`,
    ),
    "draft ticket upload status",
  )
  const manualReviewNote = result.manualReviewNote
  if (manualReviewNote !== null && typeof manualReviewNote !== "string") {
    throw new Error(
      "Invalid API response: manualReviewNote must be a string or null.",
    )
  }
  const quantity = requireNumber(
    result,
    "quantity",
    "draft ticket upload status",
  )
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new Error(
      "Invalid API response: draft listing quantity must be a whole number from 1 to 10.",
    )
  }
  const tickets = expectArray(
    result.tickets,
    "draft ticket upload statuses",
  ).map((value) => {
    const ticket = expectRecord(value, "draft ticket upload status")
    const slotIndex = requireNumber(ticket, "slotIndex", "draft ticket upload")
    if (!Number.isInteger(slotIndex) || slotIndex < 1 || slotIndex > quantity) {
      throw new Error(
        "Invalid API response: ticket slot is outside listing quantity.",
      )
    }
    return {
      slotIndex,
      status: requireOneOf(
        ticket,
        "status",
        TICKET_UPLOAD_STATUSES,
        "draft ticket upload",
      ),
    }
  })
  if (
    tickets.length > quantity ||
    new Set(tickets.map(({ slotIndex }) => slotIndex)).size !== tickets.length
  ) {
    throw new Error("Invalid API response: draft ticket slots must be unique.")
  }
  const returnedListingId = requireString(
    result,
    "listingId",
    "draft ticket upload status",
  )
  if (returnedListingId !== listingId) {
    throw new Error("Invalid API response: draft listing ID does not match.")
  }
  return {
    listingId: returnedListingId,
    listingStatus: requireOneOf(
      result,
      "listingStatus",
      ["draft"] as const,
      "draft ticket upload status",
    ),
    manualReviewStatus: requireOneOf(
      result,
      "manualReviewStatus",
      ["not_submitted", "pending", "approved", "rejected"] as const,
      "draft ticket upload status",
    ),
    manualReviewNote,
    quantity,
    tickets,
  }
}

export async function uploadTicketFileToStorage(
  form: TicketUploadForm,
  file: File,
  options: {
    onProgress?: (progress: number) => void
    signal?: AbortSignal
  } = {},
): Promise<void> {
  const body = new FormData()
  if (form.uploadMode === "direct") {
    for (const [name, value] of Object.entries(form.fields)) {
      body.append(name, value)
    }
  }
  body.append("file", file)

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      form.method,
      form.uploadMode === "api" ? getApiProxyUrl(form.url) : form.url,
    )
    xhr.withCredentials = form.uploadMode === "api"
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(
          Math.min(100, Math.round((event.loaded / event.total) * 100)),
        )
      }
    })
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        options.onProgress?.(100)
        resolve()
      } else {
        reject(new Error(`Ticket file upload failed (${xhr.status}).`))
      }
    })
    xhr.addEventListener("error", () =>
      reject(new Error("Ticket file upload failed due to a network error.")),
    )
    xhr.addEventListener("abort", () =>
      reject(new Error("Ticket file upload was cancelled.")),
    )
    options.signal?.addEventListener("abort", () => xhr.abort(), { once: true })
    if (options.signal?.aborted) {
      xhr.abort()
      return
    }
    xhr.send(body)
  })
}

export async function completeTicketUpload(
  listingId: string,
  uploadId: string,
): Promise<TicketUploadCompletion> {
  const result = expectRecord(
    await authenticatedRequest<unknown>(
      `/listings/${encodeURIComponent(listingId)}/tickets/${encodeURIComponent(uploadId)}/complete`,
      { method: "POST" },
    ),
    "ticket upload completion",
  )
  const ocr = expectRecord(result.ocr, "ticket upload OCR result")
  const ocrStatus = requireOneOf(
    ocr,
    "status",
    ["disabled", "screened"] as const,
    "ticket upload OCR result",
  )
  const completion: TicketUploadCompletion = {
    uploadId: requireString(result, "uploadId", "ticket upload completion"),
    slotIndex: requireNumber(result, "slotIndex", "ticket upload completion"),
    status: requireOneOf(
      result,
      "status",
      ["verified"] as const,
      "ticket upload completion",
    ),
    ocr:
      ocrStatus === "disabled"
        ? { status: "disabled" }
        : {
            confidence: requireNumber(
              ocr,
              "confidence",
              "ticket upload OCR result",
            ),
            characterCount: requireNumber(
              ocr,
              "characterCount",
              "ticket upload OCR result",
            ),
            eventNameMatch:
              ocr.eventNameMatch === null
                ? null
                : requireString(
                    ocr,
                    "eventNameMatch",
                    "ticket upload OCR result",
                  ),
          },
  }
  if (completion.uploadId !== uploadId) {
    throw new Error(
      "Invalid API response: completed ticket upload ID does not match the requested upload.",
    )
  }
  return completion
}

export async function submitManualTicketReview(
  listingId: string,
): Promise<ManualTicketReviewSubmission> {
  const result = expectRecord(
    await authenticatedRequest<unknown>(
      `/listings/${encodeURIComponent(listingId)}/tickets/submit-manual-review`,
      { method: "POST" },
    ),
    "manual ticket review submission",
  )
  const submission: ManualTicketReviewSubmission = {
    listingId: requireString(result, "listingId", "manual ticket review"),
    status: requireOneOf(
      result,
      "status",
      ["pending"] as const,
      "manual ticket review",
    ),
    evidenceCount: requireNumber(
      result,
      "evidenceCount",
      "manual ticket review",
    ),
  }
  if (submission.listingId !== listingId) {
    throw new Error(
      "Invalid API response: manual review listing ID does not match the requested listing.",
    )
  }
  return submission
}

export async function publishListing(
  listingId: string,
  idempotencyKey = createIdempotencyKey(),
): Promise<ListingSummary> {
  const result = await authenticatedRequest<unknown>(
    `/listings/${encodeURIComponent(listingId)}/publish`,
    {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
    },
  )
  return normalizeListing(result)
}
