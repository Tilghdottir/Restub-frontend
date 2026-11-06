"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import ListingPreview from "./_components/ListingPreview"
import TicketUploadSection from "./_components/TicketUploadSection"
import ConfirmedTicketDetails from "./_components/ConfirmedTicketDetails"
import ManualEventFields from "./_components/ManualEventFields"
import ManualPartnerFields from "./_components/ManualPartnerFields"
import AccountSidebar from "../../../components/account/AccountSidebar"
import ApiErrorNotice from "../../../components/ui/ApiErrorNotice"
import { ProtectedRoute } from "../../../components/ui/ProtectedRoute"
import { getApiErrorMessage } from "../../../lib/rtk-api"
import { createIdempotencyKey } from "../../../lib/api/device"
import {
  useCompleteTicketUploadMutation,
  useCreateListingMutation,
  useCreateTicketUploadMutation,
  useLazyGetMyListingByIdQuery,
  useLazyGetDraftTicketUploadStatusQuery,
  usePublishListingMutation,
  useSubmitManualTicketReviewMutation,
  useUpdateListingMutation,
} from "../../../lib/listings/rtk"
import { uploadTicketFileToStorage } from "../../../lib/listings/client"
import type {
  CreateListingRequest,
  DraftTicketUploadStatus,
  ListingTicketDetails,
  ListingTicketType,
  ManualListingReviewStatus,
  TicketOcrResult,
  TicketUploadStatus,
} from "../../../lib/listings/types"
import {
  isTicketPackage,
  LISTING_TICKET_TYPE_LABELS,
} from "../../../lib/listings/ticket-types"
import {
  useGetEventPartnersQuery,
  useGetEventsQuery,
  useLazySearchEventPartnersQuery,
} from "../../../lib/events/rtk"
import type { CatalogPartner } from "../../../lib/events/models"
import { useGetKycProfileQuery } from "../../../lib/kyc/rtk"
import { useGetPayoutAccountsQuery } from "../../../lib/payouts/rtk"

const MANUAL_SELECTION = "__manual__"
const MAX_TICKET_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_TICKET_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const
type TicketFileMimeType = typeof ALLOWED_TICKET_MIME_TYPES[number]

function isTicketFileMimeType(value: string): value is TicketFileMimeType {
  return ALLOWED_TICKET_MIME_TYPES.some((mimeType) => mimeType === value)
}

function normalizeTicketDetails(
  details: ListingTicketDetails,
): ListingTicketDetails {
  return {
    ...(details.section?.trim() ? { section: details.section.trim() } : {}),
    ...(details.row?.trim() ? { row: details.row.trim() } : {}),
    ...(details.seatNumbers?.trim()
      ? { seatNumbers: details.seatNumbers.trim() }
      : {}),
    ...(details.accessArea?.trim()
      ? { accessArea: details.accessArea.trim() }
      : {}),
    ...(details.sessionName?.trim()
      ? { sessionName: details.sessionName.trim() }
      : {}),
    ...(details.packageName?.trim()
      ? { packageName: details.packageName.trim() }
      : {}),
    ...(details.includedAdmissions
      ? { includedAdmissions: details.includedAdmissions }
      : {}),
    ...(details.accessibilityNotes?.trim()
      ? { accessibilityNotes: details.accessibilityNotes.trim() }
      : {}),
    ...(details.otherDetails?.trim()
      ? { otherDetails: details.otherDetails.trim() }
      : {}),
  }
}

export default function SellPage() {
  const [createListing] = useCreateListingMutation()
  const [createTicketUpload] = useCreateTicketUploadMutation()
  const [completeTicketUpload] = useCompleteTicketUploadMutation()
  const [fetchMyListing] = useLazyGetMyListingByIdQuery()
  const [fetchDraftTicketUploadStatus] =
    useLazyGetDraftTicketUploadStatusQuery()
  const [publishListing] = usePublishListingMutation()
  const [submitManualTicketReview] = useSubmitManualTicketReviewMutation()
  const [updateListing] = useUpdateListingMutation()
  const [eventId, setEventId] = useState("")
  const [partnerId, setPartnerId] = useState("")
  const [manualPartnerName, setManualPartnerName] = useState("")
  const [manualPartnerUrl, setManualPartnerUrl] = useState("")
  const [matchedPartner, setMatchedPartner] = useState<CatalogPartner | null>(
    null,
  )
  const [searchedPartnerTerm, setSearchedPartnerTerm] = useState("")
  const [confirmedNewPartner, setConfirmedNewPartner] = useState(false)
  const [manualEventName, setManualEventName] = useState("")
  const [manualEventUrl, setManualEventUrl] = useState("")
  const [manualEventDate, setManualEventDate] = useState("")
  const [manualEventTime, setManualEventTime] = useState("")
  const [manualEventVenue, setManualEventVenue] = useState("")
  const [createListingKey, setCreateListingKey] = useState(createIdempotencyKey)
  const [pendingCreatePayload, setPendingCreatePayload] =
    useState<CreateListingRequest | null>(null)
  const [pendingListingId, setPendingListingId] = useState<string | null>(null)
  const [pendingPublishKey, setPendingPublishKey] = useState<string | null>(
    null,
  )
  const [ticketCategory, setTicketCategory] = useState("General Admission")
  const [ticketType, setTicketType] =
    useState<ListingTicketType>("general_admission")
  const [ticketDetails, setTicketDetails] = useState<ListingTicketDetails>({})
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState(0)
  const [ticketFiles, setTicketFiles] = useState<Array<File | null>>([])
  const [uploadedTicketSlots, setUploadedTicketSlots] = useState<number[]>([])
  const [ticketUploadIds, setTicketUploadIds] =
    useState<Record<number, string>>({})
  const [verifiedTicketSlots, setVerifiedTicketSlots] = useState<number[]>([])
  const [failedTicketSlots, setFailedTicketSlots] = useState<number[]>([])
  const [ticketSlotStatuses, setTicketSlotStatuses] =
    useState<Record<number, TicketUploadStatus>>({})
  const [ticketOcrSummaries, setTicketOcrSummaries] =
    useState<Record<number, TicketOcrResult>>({})
  const [uploadingTicketSlot, setUploadingTicketSlot] = useState<number | null>(
    null,
  )
  const [verifyingTicketSlot, setVerifyingTicketSlot] = useState<number | null>(
    null,
  )
  const [uploadProgress, setUploadProgress] = useState(0)
  const uploadAbortController = useRef<AbortController | null>(null)
  const [manualReviewSubmitted, setManualReviewSubmitted] = useState(false)
  const [manualReviewStatus, setManualReviewStatus] =
    useState<ManualListingReviewStatus>("not_submitted")
  const [manualReviewNote, setManualReviewNote] = useState<string | null>(null)
  const [resumedEventDetails, setResumedEventDetails] = useState<{
    name: string
    date: string
    venue: string
  } | null>(null)
  const resumedListingId = useRef<string | null>(null)
  const [sellStep, setSellStep] = useState<"details" | "uploads" | "review">(
    "details",
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { data: kycProfile, error: kycError } = useGetKycProfileQuery()
  const { data: payoutAccounts = [], error: payoutAccountsError } =
    useGetPayoutAccountsQuery()
  const payoutStatus =
    payoutAccounts.find((account) => account.status === "verified")?.status ??
    payoutAccounts[0]?.status ??
    "not configured"

  const {
    data: partners = [],
    error: partnersError,
    isLoading: isLoadingPartners,
    refetch: refetchPartners,
  } = useGetEventPartnersQuery()
  const [
    searchEventPartners,
    {
      currentData: partnerMatches = [],
      isFetching: isSearchingPartners,
      isError: partnerSearchFailed,
    },
  ] = useLazySearchEventPartnersQuery()
  const selectedPartner = useMemo(
    () =>
      partners.find((partner) => String(partner.id) === partnerId) ??
      (matchedPartner?.id === partnerId ? matchedPartner : undefined),
    [partners, partnerId, matchedPartner],
  )
  const isManualPartner = partnerId === MANUAL_SELECTION
  const partnerSearchTerm = manualPartnerUrl.trim() || manualPartnerName.trim()
  useEffect(() => {
    if (!isManualPartner || partnerSearchTerm.length < 2) {
      setSearchedPartnerTerm("")
      return
    }
    const timer = window.setTimeout(() => {
      setSearchedPartnerTerm(partnerSearchTerm)
      void searchEventPartners(partnerSearchTerm)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [isManualPartner, partnerSearchTerm, searchEventPartners])
  const {
    currentData: events = [],
    error: eventsError,
    isFetching: isFetchingEvents,
    refetch: refetchEvents,
  } = useGetEventsQuery({ slug: selectedPartner?.slug ?? "" }, {
    skip: !selectedPartner,
  })
  const selectedEvent = useMemo(
    () => events.find((catalogEvent) => String(catalogEvent.id) === eventId),
    [events, eventId],
  )
  const isManualEvent = isManualPartner || eventId === MANUAL_SELECTION
  const hasPendingSubmission = Boolean(pendingCreatePayload || pendingListingId)
  const isFormLocked =
    isSubmitting || (hasPendingSubmission && sellStep !== "review")
  const previewEventName =
    resumedEventDetails?.name ??
    (isManualEvent ? manualEventName : (selectedEvent?.name ?? ""))
  const previewEventDate =
    resumedEventDetails?.date ??
    (isManualEvent ? manualEventDate : (selectedEvent?.startDate ?? ""))
  const previewEventVenue =
    resumedEventDetails?.venue ??
    (isManualEvent ? manualEventVenue : (selectedEvent?.venue ?? ""))
  const previewTicketDetails = [
    ticketCategory.trim(),
    ticketDetails.section?.trim() ? `Section ${ticketDetails.section}` : "",
    ticketDetails.row?.trim() ? `Row ${ticketDetails.row}` : "",
    ticketDetails.seatNumbers?.trim()
      ? `Seats ${ticketDetails.seatNumbers}`
      : "",
    ticketDetails.accessArea?.trim() ? `Area ${ticketDetails.accessArea}` : "",
    ticketDetails.sessionName?.trim()
      ? `Session ${ticketDetails.sessionName}`
      : "",
    ticketDetails.packageName?.trim()
      ? `Package ${ticketDetails.packageName}`
      : "",
    ticketDetails.includedAdmissions
      ? `${ticketDetails.includedAdmissions} admissions per package`
      : "",
    ticketDetails.accessibilityNotes?.trim()
      ? `Accessibility: ${ticketDetails.accessibilityNotes}`
      : "",
    ticketDetails.otherDetails?.trim(),
  ].filter(Boolean)
  const isPackage = isTicketPackage(ticketType)
  const updateTicketDetails = (
    field: keyof ListingTicketDetails,
    value: string | number,
  ) => {
    setTicketDetails((current) => ({ ...current, [field]: value }))
  }
  const applyDraftTicketStatus = useCallback(
    (status: DraftTicketUploadStatus) => {
      const statuses: Record<number, TicketUploadStatus> = {}
      const ocrSummaries: Record<number, TicketOcrResult> = {}
      for (const ticket of status.tickets) {
        statuses[ticket.slotIndex] = ticket.status
        ocrSummaries[ticket.slotIndex] = ticket.ocr
      }
      const verifiedSlots = status.tickets
        .filter(
          ({ status: ticketStatus }) =>
            ticketStatus === "verified" ||
            ticketStatus === "manual_review_approved",
        )
        .map(({ slotIndex }) => slotIndex)
      let failedSlots = status.tickets
        .filter(
          ({ status: ticketStatus }) =>
            ticketStatus === "verification_failed" ||
            ticketStatus === "manual_review_rejected",
        )
        .map(({ slotIndex }) => slotIndex)
      setTicketSlotStatuses(statuses)
      setTicketOcrSummaries(ocrSummaries)
      setVerifiedTicketSlots(verifiedSlots)
      setFailedTicketSlots(failedSlots)
      setManualReviewStatus(status.manualReviewStatus)
      setManualReviewNote(status.manualReviewNote)
      setManualReviewSubmitted(status.manualReviewStatus === "pending")
    },
    [],
  )

  const refreshDraftTicketStatus = useCallback(
    async (listingId: string, expectedQuantity: number) => {
      const status = await fetchDraftTicketUploadStatus(listingId).unwrap()
      if (status.quantity !== expectedQuantity) {
        throw new Error(
          "The saved ticket quantity does not match the draft listing.",
        )
      }
      applyDraftTicketStatus(status)
      return status
    },
    [fetchDraftTicketUploadStatus, applyDraftTicketStatus],
  )

  useEffect(() => {
    const listingId = new URLSearchParams(window.location.search).get(
      "listingId",
    )
    if (!listingId || resumedListingId.current === listingId) return
    resumedListingId.current = listingId
    setIsSubmitting(true)
    setErrorMessage(null)
    void (async () => {
      try {
        const listing = await fetchMyListing(listingId).unwrap()
        if (listing.status !== "draft") {
          throw new Error("Only draft listings can be resumed.")
        }
        const ticketStatus = await fetchDraftTicketUploadStatus(
          listing.id,
        ).unwrap()
        if (ticketStatus.quantity !== listing.quantity) {
          throw new Error(
            "The saved ticket quantity does not match the draft listing.",
          )
        }
        setPendingListingId(listing.id)
        setPendingPublishKey(createIdempotencyKey())
        setPendingCreatePayload(null)
        setTicketCategory(listing.ticketCategory ?? "General Admission")
        setTicketType(listing.ticketType ?? "general_admission")
        setTicketDetails(listing.ticketDetails ?? {})
        setQty(listing.quantity)
        setPrice(listing.price)
        setTicketFiles(Array.from({ length: listing.quantity }, () => null))
        setUploadedTicketSlots([])
        setTicketUploadIds({})
        setVerifiedTicketSlots([])
        setFailedTicketSlots([])
        setTicketSlotStatuses({})
        setTicketOcrSummaries({})
        setManualPartnerName(listing.partnerName ?? "")
        setManualPartnerUrl(listing.partnerUrl ?? "")
        setManualEventName(
          listing.eventName ?? listing.title.split(" — ")[0] ?? listing.title,
        )
        setManualEventUrl(listing.eventUrl ?? "")
        setManualEventDate(listing.eventDate ?? "")
        setManualEventTime(listing.eventTime ?? "")
        setManualEventVenue(listing.eventVenue ?? "")
        setResumedEventDetails({
          name:
            listing.eventName ?? listing.title.split(" — ")[0] ?? listing.title,
          date: listing.eventDate ?? "",
          venue: listing.eventVenue ?? "",
        })
        setPartnerId(listing.partnerId ?? "")
        setEventId(listing.partnerEventId ?? "")
        applyDraftTicketStatus(ticketStatus)
        const ticketsReady =
          ticketStatus.tickets.length === listing.quantity &&
          ticketStatus.tickets.every(
            ({ status }) =>
              status === "verified" || status === "manual_review_approved",
          )
        setSellStep(
          ticketsReady && ticketStatus.manualReviewStatus !== "pending"
            ? "review"
            : "uploads",
        )
        setStatusMessage(
          ticketsReady && ticketStatus.manualReviewStatus !== "pending"
            ? "Draft restored. Confirm the listing details and price before publishing."
            : "Draft restored. Re-select files for tickets that still need attention.",
        )
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Unable to restore this draft listing."),
        )
      } finally {
        setIsSubmitting(false)
      }
    })()
  }, [fetchDraftTicketUploadStatus, fetchMyListing, applyDraftTicketStatus])

  const validateTicketFiles = () => {
    if (ticketFiles.length !== qty) {
      setErrorMessage(
        "Ticket file slots could not be restored. Reload the draft and try again.",
      )
      return false
    }
    for (let index = 0; index < qty; index += 1) {
      const slotIndex = index + 1
      if (verifiedTicketSlots.includes(slotIndex)) continue
      const file = ticketFiles[index]
      if (!file) {
        setErrorMessage(
          `Select a ticket file for ticket ${slotIndex} before continuing.`,
        )
        return false
      }
      if (
        !isTicketFileMimeType(file.type) ||
        file.size < 1 ||
        file.size > MAX_TICKET_FILE_BYTES
      ) {
        setErrorMessage(
          "Each ticket file must be a PDF, JPEG, or PNG no larger than 5 MB.",
        )
        return false
      }
    }
    return true
  }

  const setTicketFile = (slotIndex: number, file?: File) => {
    if (!file) return
    if (!isTicketFileMimeType(file.type)) {
      setErrorMessage("Choose a PDF, JPEG, or PNG ticket file.")
      return
    }
    if (file.size < 1 || file.size > MAX_TICKET_FILE_BYTES) {
      setErrorMessage("Ticket files must be no larger than 5 MB.")
      return
    }
    setErrorMessage(null)
    setTicketFiles((current) => {
      const next = Array.from(
        { length: qty },
        (_, index) => current[index] ?? null,
      )
      next[slotIndex - 1] = file
      return next
    })
    setUploadedTicketSlots((current) =>
      current.filter((slot) => slot !== slotIndex),
    )
    setTicketUploadIds((current) => {
      const next = { ...current }
      delete next[slotIndex]
      return next
    })
    setVerifiedTicketSlots((current) =>
      current.filter((slot) => slot !== slotIndex),
    )
    setFailedTicketSlots((current) =>
      current.filter((slot) => slot !== slotIndex),
    )
    setTicketOcrSummaries((current) => {
      const next = { ...current }
      delete next[slotIndex]
      return next
    })
    setTicketSlotStatuses((current) => ({
      ...current,
      [slotIndex]: "upload_pending",
    }))
  }

  const handleQuantityChange = (nextQuantity: number) => {
    if (
      !Number.isInteger(nextQuantity) ||
      nextQuantity < 1 ||
      nextQuantity > 10
    ) {
      setQty(nextQuantity)
      return
    }
    if (
      nextQuantity < qty &&
      ticketFiles.slice(nextQuantity).some((file) => file !== null)
    ) {
      const confirmed = window.confirm(
        `Reducing the quantity to ${nextQuantity} will remove ticket files in the extra slots. Continue?`,
      )
      if (!confirmed) return
    }
    setQty(nextQuantity)
    setTicketFiles((current) =>
      Array.from(
        { length: nextQuantity },
        (_, index) => current[index] ?? null,
      ),
    )
    setUploadedTicketSlots((current) =>
      current.filter((slotIndex) => slotIndex <= nextQuantity),
    )
    setTicketUploadIds((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([slotIndex]) => Number(slotIndex) <= nextQuantity,
        ),
      ),
    )
    setVerifiedTicketSlots((current) =>
      current.filter((slotIndex) => slotIndex <= nextQuantity),
    )
    setFailedTicketSlots((current) =>
      current.filter((slotIndex) => slotIndex <= nextQuantity),
    )
    setTicketOcrSummaries((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([slotIndex]) => Number(slotIndex) <= nextQuantity,
        ),
      ),
    )
  }

  const handleManualTicketReview = async () => {
    if (!pendingListingId) return
    setIsSubmitting(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const result = await submitManualTicketReview(pendingListingId).unwrap()
      setManualReviewSubmitted(true)
      setManualReviewStatus("pending")
      setManualReviewNote(null)
      setTicketSlotStatuses(
        Object.fromEntries(
          Array.from({ length: qty }, (_, index) => index + 1)
            .filter((slotIndex) => !verifiedTicketSlots.includes(slotIndex))
            .map((slotIndex) => [slotIndex, "manual_review_pending" as const]),
        ),
      )
      setStatusMessage(
        `${result.evidenceCount} ticket file${
          result.evidenceCount === 1 ? "" : "s"
        } submitted for manual review.`,
      )
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to submit tickets for manual review.",
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublishListing = async () => {
    setErrorMessage(null)
    setStatusMessage(null)

    if (sellStep === "review") {
      if (!pendingListingId) {
        setErrorMessage(
          "The draft listing could not be found. Resume it and try again.",
        )
        return
      }
      if (
        manualReviewStatus !== "approved" &&
        verifiedTicketSlots.length !== qty
      ) {
        setErrorMessage(
          "Every ticket must be issuer verified or approved by staff before publishing.",
        )
        return
      }
      if (!Number.isInteger(price) || price < 0 || price > 21474836) {
        setErrorMessage("Enter a whole-naira price between ₦0 and ₦21,474,836.")
        return
      }
      if (!ticketCategory.trim()) {
        setErrorMessage("Enter a ticket category or tier name.")
        return
      }
      if (
        ticketType === "reserved_seating" &&
        !ticketDetails.section?.trim() &&
        !ticketDetails.seatNumbers?.trim()
      ) {
        setErrorMessage("Enter a section or seat number for reserved seating.")
        return
      }
      if (ticketType === "pass_session" && !ticketDetails.sessionName?.trim()) {
        setErrorMessage("Enter the pass or session name.")
        return
      }
      if (
        isPackage &&
        (!Number.isInteger(ticketDetails.includedAdmissions) ||
          !ticketDetails.includedAdmissions ||
          ticketDetails.includedAdmissions < 1 ||
          ticketDetails.includedAdmissions > 100)
      ) {
        setErrorMessage("Enter between 1 and 100 included admissions.")
        return
      }
      if (
        ticketType === "accessible" &&
        !ticketDetails.accessibilityNotes?.trim() &&
        !ticketDetails.section?.trim() &&
        !ticketDetails.seatNumbers?.trim()
      ) {
        setErrorMessage("Enter accessibility or seat details.")
        return
      }
      if (ticketType === "other" && !ticketDetails.otherDetails?.trim()) {
        setErrorMessage("Describe the ticket details.")
        return
      }

      setIsSubmitting(true)
      try {
        const listing = await fetchMyListing(pendingListingId).unwrap()
        if (listing.status === "draft") {
          const eventName =
            previewEventName.trim() ||
            listing.eventName?.trim() ||
            listing.title.split(" — ")[0]
          await updateListing({
            listingId: pendingListingId,
            payload: {
              title: `${eventName} — ${ticketCategory.trim()}`,
              ticketCategory: ticketCategory.trim(),
              ticketType,
              ticketDetails: normalizeTicketDetails(ticketDetails),
              price,
            },
          }).unwrap()
          await publishListing({
            listingId: pendingListingId,
            idempotencyKey: pendingPublishKey ?? undefined,
          }).unwrap()
        } else if (listing.status !== "published") {
          throw new Error("This listing is no longer available to publish.")
        }
        setPendingListingId(null)
        setPendingPublishKey(null)
        setPendingCreatePayload(null)
        setManualReviewSubmitted(false)
        setManualReviewStatus("not_submitted")
        setManualReviewNote(null)
        setCreateListingKey(createIdempotencyKey())
        setSellStep("details")
        setUploadedTicketSlots([])
        setTicketUploadIds({})
        setVerifiedTicketSlots([])
        setFailedTicketSlots([])
        setTicketFiles([])
        setTicketSlotStatuses({})
        setTicketOcrSummaries({})
        setResumedEventDetails(null)
        setStatusMessage("Listing published successfully.")
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Unable to publish listing."))
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (pendingListingId && manualReviewStatus === "pending") {
      setIsSubmitting(true)
      try {
        const listing = await fetchMyListing(pendingListingId).unwrap()
        const status = await refreshDraftTicketStatus(
          pendingListingId,
          listing.quantity,
        )
        if (status.manualReviewStatus === "pending") {
          setStatusMessage("Ticket evidence is still awaiting staff review.")
          return
        }
        if (status.manualReviewStatus === "rejected") {
          setErrorMessage(
            status.manualReviewNote ||
              "Some ticket evidence was rejected. Replace the rejected files and submit them again.",
          )
          return
        }
        if (status.manualReviewStatus !== "approved") {
          throw new Error("The ticket review status could not be confirmed.")
        }
        setSellStep("review")
        setStatusMessage(
          "Staff approved the submitted ticket evidence. Confirm your listing and price before publishing.",
        )
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Unable to refresh ticket review status."),
        )
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (pendingListingId && manualReviewStatus === "approved") {
      setSellStep("review")
      setStatusMessage(
        "Staff approved the submitted ticket evidence. Confirm your listing and price before publishing.",
      )
      return
    }

    if (
      pendingListingId &&
      Object.values(ticketSlotStatuses).includes("processing")
    ) {
      setIsSubmitting(true)
      try {
        await refreshDraftTicketStatus(pendingListingId, qty)
        setStatusMessage("Ticket verification status refreshed.")
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Unable to refresh ticket status."),
        )
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (!pendingCreatePayload && !pendingListingId) {
      if (!partnerId || (!isManualPartner && !selectedPartner)) {
        setErrorMessage("Select or enter a ticket partner.")
        return
      }
      if (isManualPartner) {
        if (manualPartnerName.trim().length < 2) {
          setErrorMessage("Enter a partner name with at least 2 characters.")
          return
        }
        if (isSearchingPartners || searchedPartnerTerm !== partnerSearchTerm) {
          setErrorMessage("Wait for the existing-partner check to finish.")
          return
        }
        if (partnerSearchFailed) {
          setErrorMessage("Retry the existing-partner check before continuing.")
          return
        }
        if (partnerMatches.length > 0 && !confirmedNewPartner) {
          setErrorMessage(
            "Select an existing partner match, or confirm that none of the suggestions match.",
          )
          return
        }
      }
      if (isManualEvent && !manualEventName.trim()) {
        setErrorMessage("Enter the event name.")
        return
      }
      if (isManualEvent && !manualEventUrl.trim()) {
        setErrorMessage("Enter the event’s HTTPS ticket page URL.")
        return
      }
      if (
        isManualEvent &&
        (!manualEventUrl.startsWith("https://") ||
          !URL.canParse(manualEventUrl))
      ) {
        setErrorMessage("Enter a valid HTTPS event URL.")
        return
      }
      if (
        isManualPartner &&
        manualPartnerUrl.trim() &&
        (!manualPartnerUrl.startsWith("https://") ||
          !URL.canParse(manualPartnerUrl))
      ) {
        setErrorMessage("Enter a valid HTTPS partner website URL.")
        return
      }
      if (!isManualEvent && !selectedEvent) {
        setErrorMessage("Select an event before publishing your listing.")
        return
      }
      if (!ticketCategory.trim()) {
        setErrorMessage("Enter a ticket category or tier name.")
        return
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
        setErrorMessage("Quantity must be a whole number from 1 to 10.")
        return
      }
      if (
        !Number.isFinite(price) ||
        !Number.isInteger(price) ||
        price < 0 ||
        price > 21474836
      ) {
        setErrorMessage("Enter a whole-naira price between ₦0 and ₦21,474,836.")
        return
      }
    }

    setIsSubmitting(true)
    let listingId = pendingListingId
    let publishKey = pendingPublishKey
    let createPayload = pendingCreatePayload
    const resumingPendingListing = Boolean(listingId)

    try {
      if (!listingId) {
        if (!createPayload) {
          const partner = selectedPartner
          const catalogEvent = selectedEvent
          const eventName = isManualEvent
            ? manualEventName.trim()
            : catalogEvent?.name
          if ((!isManualPartner && !partner) || !eventName) {
            throw new Error("Enter or select a partner and event.")
          }
          const eventDate = isManualEvent
            ? manualEventDate
            : catalogEvent?.startDate
          const eventTime = isManualEvent
            ? manualEventTime
            : catalogEvent?.startTime
          const eventVenue = isManualEvent
            ? manualEventVenue
            : catalogEvent?.venue
          const eventUrl = isManualEvent
            ? manualEventUrl.trim()
            : catalogEvent?.url
          const partnerDescription = isManualPartner
            ? `Partner: ${manualPartnerName.trim()}${
                manualPartnerUrl.trim() ? ` (${manualPartnerUrl.trim()})` : ""
              } • `
            : ""
          const normalizedTicketDetails = normalizeTicketDetails(ticketDetails)
          const locationDetails = [
            normalizedTicketDetails.section
              ? `Section ${normalizedTicketDetails.section}`
              : "",
            normalizedTicketDetails.row
              ? `Row ${normalizedTicketDetails.row}`
              : "",
            normalizedTicketDetails.seatNumbers
              ? `Seats ${normalizedTicketDetails.seatNumbers}`
              : "",
            normalizedTicketDetails.accessArea
              ? `Area ${normalizedTicketDetails.accessArea}`
              : "",
            normalizedTicketDetails.sessionName
              ? `Session ${normalizedTicketDetails.sessionName}`
              : "",
            normalizedTicketDetails.packageName
              ? `Package ${normalizedTicketDetails.packageName}`
              : "",
            normalizedTicketDetails.includedAdmissions
              ? `${normalizedTicketDetails.includedAdmissions} admissions included`
              : "",
            normalizedTicketDetails.accessibilityNotes
              ? `Accessibility: ${normalizedTicketDetails.accessibilityNotes}`
              : "",
            normalizedTicketDetails.otherDetails,
          ].filter(Boolean)

          createPayload = {
            title: `${eventName} — ${ticketCategory.trim()}`,
            description: `${partnerDescription}${eventName} • ${eventDate ?? ""} • ${eventVenue ?? ""} • ${ticketCategory.trim()}${
              locationDetails.length ? ` • ${locationDetails.join(" • ")}` : ""
            }`,
            ticketCategory: ticketCategory.trim(),
            ticketType,
            ticketDetails: normalizedTicketDetails,
            quantity: qty,
            price: 0,
            priceConfirmed: false,
            ...(!isManualPartner && partner ? { partnerId: partner.id } : {}),
            ...(!isManualEvent && catalogEvent
              ? { partnerEventId: catalogEvent.id }
              : {}),
            ...(isManualPartner
              ? {
                  partnerName: manualPartnerName.trim(),
                  ...(manualPartnerUrl.trim()
                    ? { partnerUrl: manualPartnerUrl.trim() }
                    : {}),
                }
              : {}),
            eventName,
            ...(eventUrl ? { eventUrl } : {}),
            ...(eventDate ? { eventDate } : {}),
            ...(eventTime ? { eventTime } : {}),
            ...(eventVenue ? { eventVenue } : {}),
          }
          setPendingCreatePayload(createPayload)
        }

        const createdListing = await createListing({
          idempotencyKey: createListingKey,
          payload: createPayload,
        }).unwrap()
        listingId = createdListing.id
        publishKey = createIdempotencyKey()
        setPendingListingId(listingId)
        setPendingPublishKey(publishKey)
        setManualReviewStatus("not_submitted")
        setManualReviewNote(null)
      }

      if (!resumingPendingListing) {
        setSellStep("uploads")
        if (isManualEvent) {
          setStatusMessage(
            "Draft saved. Add the ticket files now; verification may remain unavailable until the event is approved.",
          )
        } else {
          setStatusMessage(
            "Draft saved. Add and verify a file for each ticket.",
          )
        }
        setErrorMessage(null)
        return
      }

      if (!listingId) {
        throw new Error("The draft listing ID was not returned.")
      }
      if (!validateTicketFiles()) return

      const uploadedSlots = new Set(uploadedTicketSlots)
      const uploadIds = { ...ticketUploadIds }
      const verifiedSlots = new Set(verifiedTicketSlots)
      const failedSlots = new Set(failedTicketSlots)

      for (let index = 0; index < qty; index += 1) {
        const slotIndex = index + 1
        if (verifiedSlots.has(slotIndex)) continue
        if (uploadedSlots.has(slotIndex) && !failedSlots.has(slotIndex)) {
          continue
        }
        const file = ticketFiles[index]
        if (!file || !isTicketFileMimeType(file.type)) {
          throw new Error(`Ticket file ${slotIndex} is missing or unsupported.`)
        }
        setUploadingTicketSlot(slotIndex)
        setUploadProgress(0)
        const abortController = new AbortController()
        uploadAbortController.current = abortController
        const uploadForm = await createTicketUpload({
          listingId,
          payload: {
            slotIndex,
            mimeType: file.type,
            bytes: file.size,
          },
        }).unwrap()
        await uploadTicketFileToStorage(uploadForm, file, {
          signal: abortController.signal,
          onProgress: setUploadProgress,
        })
        uploadAbortController.current = null
        setUploadingTicketSlot(null)
        uploadedSlots.add(slotIndex)
        setTicketSlotStatuses((current) => ({
          ...current,
          [slotIndex]: "upload_pending",
        }))
        uploadIds[slotIndex] = uploadForm.uploadId
        failedSlots.delete(slotIndex)
        setUploadedTicketSlots([...uploadedSlots])
        setTicketUploadIds({ ...uploadIds })
        setFailedTicketSlots([...failedSlots])
      }

      const verificationErrors: string[] = []
      for (let index = 0; index < qty; index += 1) {
        const slotIndex = index + 1
        if (verifiedSlots.has(slotIndex)) continue
        setVerifyingTicketSlot(slotIndex)
        try {
          const uploadId = uploadIds[slotIndex]
          if (!uploadId) {
            throw new Error(`Ticket ${slotIndex} upload ID is unavailable.`)
          }
          const completed = await completeTicketUpload({
            listingId,
            uploadId,
          }).unwrap()
          if (completed.slotIndex !== slotIndex) {
            throw new Error(
              "The completed ticket did not match its upload slot.",
            )
          }
          verifiedSlots.add(slotIndex)
          failedSlots.delete(slotIndex)
          setTicketSlotStatuses((current) => ({
            ...current,
            [slotIndex]: "verified",
          }))
          setTicketOcrSummaries((current) => ({
            ...current,
            [slotIndex]: completed.ocr,
          }))
          setVerifiedTicketSlots([...verifiedSlots])
          setFailedTicketSlots([...failedSlots])
        } catch (error) {
          failedSlots.add(slotIndex)
          setTicketSlotStatuses((current) => ({
            ...current,
            [slotIndex]: "verification_failed",
          }))
          setFailedTicketSlots([...failedSlots])
          verificationErrors.push(
            `Ticket ${slotIndex}: ${getApiErrorMessage(error, "Verification failed.")}`,
          )
        } finally {
          setVerifyingTicketSlot(null)
        }
      }
      if (verificationErrors.length > 0) {
        try {
          await refreshDraftTicketStatus(listingId, qty)
        } catch (error) {
          verificationErrors.push(
            `Unable to refresh ticket screening status: ${getApiErrorMessage(error, "Status refresh failed.")}`,
          )
        }
        throw new Error(
          `Ticket verification needs attention. ${verificationErrors.join(" ")}`,
        )
      }

      setSellStep("review")
      setStatusMessage(
        "Ticket screening is complete. Confirm the listing details and price before publishing.",
      )
    } catch (error) {
      const apiMessage = getApiErrorMessage(error, "Unable to publish listing.")
      setErrorMessage(
        listingId
          ? `${apiMessage} Your draft is saved; retry to continue uploading and verifying tickets.`
          : createPayload
            ? `${apiMessage} The create request may have reached the server; retry to safely continue.`
            : apiMessage,
      )
    } finally {
      uploadAbortController.current = null
      setUploadingTicketSlot(null)
      setVerifyingTicketSlot(null)
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <AccountSidebar />

      <main className="lg:ml-64 max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p
            className="text-[11px] font-medium tracking-widest uppercase mb-2"
            style={{ color: "#292B2F" }}
          >
            My account
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "#111111" }}>
            List your tickets
          </h1>
        </div>
        <ProtectedRoute>
          <div
            className="mb-6 grid grid-cols-2 gap-3"
            aria-label="Listing steps"
          >
            {[
              { id: "details", label: "1. Event & ticket quantity" },
              { id: "uploads", label: "2. Upload tickets" },
              { id: "review", label: "3. Confirm & publish" },
            ].map((step) => {
              const isActive = sellStep === step.id
              const isComplete =
                (sellStep === "uploads" && step.id === "details") ||
                (sellStep === "review" && step.id !== "review")

              return (
                <div
                  key={step.id}
                  aria-current={isActive ? "step" : undefined}
                  className="rounded-lg border px-4 py-3 text-[12px] font-medium"
                  style={{
                    backgroundColor: isActive ? "#111111" : "#FFFFFF",
                    borderColor: isActive || isComplete ? "#111111" : "#E8E9EB",
                    color: isActive ? "#FAFAF7" : "#62656A",
                  }}
                >
                  {step.label}
                  {isComplete ? " · Complete" : ""}
                </div>
              )
            })}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <div className="space-y-5">
              {sellStep === "details" ? (
                <>
                  <div
                    className="bg-white border rounded-lg p-5"
                    style={{ borderColor: "#E8E9EB" }}
                  >
                    {partnersError ? (
                      <>
                        <ApiErrorNotice
                          error={partnersError}
                          fallback="Unable to load event partners."
                        />
                        <button
                          type="button"
                          onClick={() => void refetchPartners()}
                          className="mb-4 text-[12px] underline"
                          style={{ color: "#111111" }}
                        >
                          Retry loading partners
                        </button>
                      </>
                    ) : null}
                    {isLoadingPartners ? (
                      <p
                        className="mb-4 text-[12px]"
                        style={{ color: "#292B2F" }}
                      >
                        Loading event partners…
                      </p>
                    ) : null}
                    <h2
                      className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                      style={{ color: "#111111" }}
                    >
                      Event
                    </h2>
                    <label
                      htmlFor="partner-select"
                      className="block text-[12px] font-medium mb-1.5"
                      style={{ color: "#111111" }}
                    >
                      Select ticket partner
                    </label>
                    <select
                      id="partner-select"
                      value={partnerId}
                      disabled={isFormLocked}
                      onChange={(e) => {
                        setMatchedPartner(null)
                        setPartnerId(e.target.value)
                        setEventId("")
                      }}
                      className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                      style={{
                        backgroundColor: "#FAFAF7",
                        borderColor: "#E8E9EB",
                        color: "#111111",
                      }}
                    >
                      <option value="">--- Select partner ---</option>
                      {selectedPartner &&
                      !partners.some(
                        (partner) => partner.id === selectedPartner.id,
                      ) ? (
                        <option
                          key={selectedPartner.id}
                          value={selectedPartner.id}
                        >
                          {selectedPartner.name}
                        </option>
                      ) : null}
                      {partners.map((partner) => (
                        <option key={partner.id} value={String(partner.id)}>
                          {partner.name}
                        </option>
                      ))}
                      <option value={MANUAL_SELECTION}>
                        Other / enter partner
                      </option>
                    </select>

                    {isManualPartner ? (
                      <ManualPartnerFields
                        disabled={isFormLocked}
                        name={manualPartnerName}
                        onNameChange={(value) => {
                          setManualPartnerName(value)
                          setSearchedPartnerTerm("")
                          setConfirmedNewPartner(false)
                        }}
                        website={manualPartnerUrl}
                        onWebsiteChange={(value) => {
                          setManualPartnerUrl(value)
                          setSearchedPartnerTerm("")
                          setConfirmedNewPartner(false)
                        }}
                        searchTerm={partnerSearchTerm}
                        searchedTerm={searchedPartnerTerm}
                        matches={partnerMatches}
                        isSearching={isSearchingPartners}
                        hasSearchError={partnerSearchFailed}
                        confirmedNewPartner={confirmedNewPartner}
                        onRetrySearch={() => {
                          setSearchedPartnerTerm(partnerSearchTerm)
                          void searchEventPartners(partnerSearchTerm)
                        }}
                        onSelectMatch={(partner) => {
                          setMatchedPartner(partner)
                          setPartnerId(partner.id)
                          setManualPartnerName(partner.name)
                          setManualPartnerUrl(partner.websiteUrl ?? "")
                          setEventId("")
                          setConfirmedNewPartner(false)
                        }}
                        onConfirmNew={() => setConfirmedNewPartner(true)}
                      />
                    ) : null}

                    {eventsError ? (
                      <>
                        <ApiErrorNotice
                          error={eventsError}
                          fallback="Unable to load events."
                        />
                        <button
                          type="button"
                          onClick={() => void refetchEvents()}
                          className="mb-4 text-[12px] underline"
                          style={{ color: "#111111" }}
                        >
                          Retry loading events
                        </button>
                      </>
                    ) : null}
                    {isFetchingEvents ? (
                      <p
                        className="mt-3 text-[12px]"
                        style={{ color: "#292B2F" }}
                      >
                        Loading events…
                      </p>
                    ) : null}
                    {selectedPartner ? (
                      <>
                        <label
                          htmlFor="catalog-event"
                          className="block text-[12px] font-medium mt-4 mb-1.5"
                          style={{ color: "#111111" }}
                        >
                          Select catalog event
                        </label>
                        <select
                          id="catalog-event"
                          value={eventId}
                          disabled={isFetchingEvents || isFormLocked}
                          onChange={(e) => setEventId(e.target.value)}
                          className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "#FAFAF7",
                            borderColor: "#E8E9EB",
                            color: "#111111",
                          }}
                        >
                          <option value="">--- Select event ---</option>
                          {events.map((event) => (
                            <option key={event.id} value={String(event.id)}>
                              {event.name}
                            </option>
                          ))}
                          <option value={MANUAL_SELECTION}>
                            Other / enter event
                          </option>
                        </select>
                      </>
                    ) : null}

                    {isManualEvent ? (
                      <ManualEventFields
                        disabled={isFormLocked}
                        name={manualEventName}
                        onNameChange={setManualEventName}
                        url={manualEventUrl}
                        onUrlChange={setManualEventUrl}
                        date={manualEventDate}
                        onDateChange={setManualEventDate}
                        time={manualEventTime}
                        onTimeChange={setManualEventTime}
                        venue={manualEventVenue}
                        onVenueChange={setManualEventVenue}
                      />
                    ) : null}
                  </div>
                </>
              ) : null}

              <div
                className="bg-white border rounded-lg p-5"
                style={{ borderColor: "#E8E9EB" }}
              >
                {sellStep === "review" ? (
                  <ConfirmedTicketDetails
                    ticketCategory={ticketCategory}
                    onTicketCategoryChange={setTicketCategory}
                    ticketType={ticketType}
                    onTicketTypeChange={(nextTicketType) => {
                      if (nextTicketType !== ticketType) setTicketDetails({})
                      setTicketType(nextTicketType)
                    }}
                    ticketDetails={ticketDetails}
                    onTicketDetailsChange={updateTicketDetails}
                    quantity={qty}
                    onQuantityChange={setQty}
                    isFormLocked={isFormLocked}
                    isSubmitting={isSubmitting}
                    hasPendingSubmission={hasPendingSubmission}
                  />
                ) : sellStep === "details" ? (
                  <>
                    <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-[#111111]">
                      Ticket basics
                    </h2>
                    <p className="mb-4 text-[12px] text-[#62656A]">
                      Choose the ticket tier and number of files to upload.
                      Detailed seat and access information can be confirmed
                      after the tickets are screened.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ticket-category"
                          className="mb-1.5 block text-[12px] font-medium text-[#111111]"
                        >
                          Ticket tier or package name
                        </label>
                        <input
                          id="ticket-category"
                          required
                          maxLength={100}
                          disabled={isFormLocked}
                          value={ticketCategory}
                          onChange={(event) =>
                            setTicketCategory(event.target.value)
                          }
                          placeholder="e.g. General Admission"
                          className="w-full rounded-lg border px-4 py-2.5 text-[14px]"
                          style={{
                            backgroundColor: "#FAFAF7",
                            borderColor: "#E8E9EB",
                            color: "#111111",
                          }}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[12px] font-medium text-[#111111]">
                          Number of tickets or packages
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          step={1}
                          required
                          disabled={isSubmitting || hasPendingSubmission}
                          value={qty}
                          onChange={(event) =>
                            setQty(Number(event.target.value) || 1)
                          }
                          className="w-full rounded-lg border px-4 py-2.5 text-[14px]"
                          style={{
                            backgroundColor: "#FAFAF7",
                            borderColor: "#E8E9EB",
                            color: "#111111",
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <h2
                    className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                    style={{ color: "#111111" }}
                  >
                    Upload and screen tickets
                  </h2>
                )}
                {sellStep === "review" ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-[#E8E9EB] bg-[#FAFAF7] p-4">
                      <p className="text-[15px] font-semibold text-[#111111]">
                        {previewEventName || "Event details"}
                      </p>
                      <p className="mt-1 text-[12px] text-[#292B2F]">
                        {[previewEventDate, previewEventVenue]
                          .filter(Boolean)
                          .join(" · ") || "Event date or venue not provided"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#E8E9EB] p-4">
                      <p className="text-[13px] font-semibold text-[#111111]">
                        {ticketCategory} ·{" "}
                        {LISTING_TICKET_TYPE_LABELS[ticketType]}
                      </p>
                      <p className="mt-1 text-[12px] text-[#292B2F]">
                        {qty} {isPackage ? "packages" : "tickets"} ·{" "}
                        {previewTicketDetails.slice(1).join(" · ") ||
                          "No additional seat or access details"}
                      </p>
                    </div>
                    <p className="rounded-lg border border-[#E8E9EB] px-3 py-2.5 text-[12px] text-[#292B2F]">
                      Ticket screening is not proof that a ticket is authentic,
                      valid, or unused. Review your details and price before
                      publishing.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSellStep("uploads")}
                      className="text-[12px] font-medium underline underline-offset-2 text-[#111111]"
                    >
                      Back to ticket files
                    </button>
                  </div>
                ) : null}
                {sellStep === "review" ? (
                  <div className="mt-4 rounded-lg border border-[#E8E9EB] bg-white p-4">
                    <h3 className="text-[13px] font-semibold text-[#111111]">
                      Before you publish
                    </h3>
                    <p className="mt-2 text-[12px] text-[#292B2F]">
                      Identity verification is required to publish. A verified
                      payout account may also be required, depending on the
                      payment provider.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-[12px]">
                      <span>Identity: {kycProfile?.status ?? "checking"}</span>
                      <Link
                        href="/account/kyc"
                        className="font-medium underline underline-offset-2 text-[#111111]"
                      >
                        Review identity verification
                      </Link>
                      <span>Payout account: {payoutStatus}</span>
                      <Link
                        href="/payout-account"
                        className="font-medium underline underline-offset-2 text-[#111111]"
                      >
                        Manage payouts
                      </Link>
                    </div>
                    {kycError || payoutAccountsError ? (
                      <ApiErrorNotice
                        error={kycError ?? payoutAccountsError}
                        fallback="Unable to check verification or payout status."
                      />
                    ) : null}
                  </div>
                ) : null}
                {sellStep === "uploads" &&
                manualReviewStatus !== "not_submitted" ? (
                  <div
                    className="mb-4 rounded-lg border px-3 py-2.5 text-[12px]"
                    style={{
                      backgroundColor:
                        manualReviewStatus === "approved"
                          ? "#E7F4EC"
                          : manualReviewStatus === "rejected"
                            ? "#FFF0EF"
                            : "#FFF8E7",
                      borderColor:
                        manualReviewStatus === "approved"
                          ? "#B7D8C1"
                          : manualReviewStatus === "rejected"
                            ? "#E5B6B2"
                            : "#EAD9A8",
                      color:
                        manualReviewStatus === "approved"
                          ? "#22633D"
                          : manualReviewStatus === "rejected"
                            ? "#A03B32"
                            : "#6A5318",
                    }}
                    role="status"
                  >
                    {manualReviewStatus === "pending"
                      ? "Your ticket evidence is submitted and the listing is not live. You can leave this page; an in-app notification will be available when staff decide."
                      : manualReviewStatus === "approved"
                        ? "Staff approved the submitted evidence. Confirm your listing details and price before publishing."
                        : `Some ticket evidence was rejected. Replace the rejected files and request review again.${
                            manualReviewNote
                              ? ` Reviewer note: ${manualReviewNote}`
                              : ""
                          }`}
                  </div>
                ) : null}
                {sellStep === "uploads" && isManualEvent ? (
                  <p
                    className="mb-4 rounded-lg border px-3 py-2.5 text-[12px]"
                    style={{
                      backgroundColor: "#FFF8E7",
                      borderColor: "#EAD9A8",
                      color: "#6A5318",
                    }}
                    role="status"
                  >
                    This event is awaiting approval. Upload verification may
                    remain unavailable until the event is approved; if an upload
                    fails, your draft and selected files will remain available
                    to retry.
                  </p>
                ) : null}
                {sellStep === "uploads" ? (
                  <TicketUploadSection
                    quantity={qty}
                    isPackage={isPackage}
                    files={ticketFiles}
                    verifiedSlots={verifiedTicketSlots}
                    uploadingSlot={uploadingTicketSlot}
                    verifyingSlot={verifyingTicketSlot}
                    failedSlots={failedTicketSlots}
                    uploadedSlots={uploadedTicketSlots}
                    statuses={ticketSlotStatuses}
                    ocrSummaries={ticketOcrSummaries}
                    uploadProgress={uploadProgress}
                    isSubmitting={isSubmitting}
                    manualReviewSubmitted={manualReviewSubmitted}
                    onFileChange={setTicketFile}
                    onCancelUpload={() =>
                      uploadAbortController.current?.abort()
                    }
                  />
                ) : null}
              </div>
            </div>

            <ListingPreview
              eventName={previewEventName}
              eventDate={previewEventDate}
              eventVenue={previewEventVenue}
              ticketTypeLabel={LISTING_TICKET_TYPE_LABELS[ticketType]}
              ticketDetails={previewTicketDetails}
              quantity={qty}
              isPackage={isPackage}
              showPrice={sellStep === "review"}
              price={price}
              onPriceChange={setPrice}
              isSubmitting={isSubmitting}
              showSellerWorkspaceLink={
                sellStep === "uploads" && manualReviewStatus === "pending"
              }
              onPublish={handlePublishListing}
              publishDisabled={
                isSubmitting || (!hasPendingSubmission && isFetchingEvents)
              }
              publishLabel={
                isSubmitting
                  ? "Working…"
                  : sellStep === "review"
                    ? "Publish listing"
                    : sellStep === "details"
                      ? pendingCreatePayload
                        ? "Retry saving details"
                        : "Continue to ticket uploads"
                      : manualReviewStatus === "approved"
                        ? "Confirm listing details"
                        : Object.values(ticketSlotStatuses).includes(
                              "processing",
                            )
                          ? "Refresh ticket status"
                          : pendingListingId
                            ? verifiedTicketSlots.length === qty
                              ? "Review listing and set price"
                              : "Upload and verify tickets"
                            : pendingCreatePayload
                              ? "Retry listing creation"
                              : "Publish listing"
              }
              showManualReviewButton={
                Boolean(pendingListingId) &&
                !manualReviewSubmitted &&
                manualReviewStatus !== "approved" &&
                new Set([...verifiedTicketSlots, ...uploadedTicketSlots])
                  .size === qty &&
                failedTicketSlots.length > 0
              }
              onManualReview={handleManualTicketReview}
              statusMessage={statusMessage}
              errorMessage={errorMessage}
            />
          </div>

          <div
            className="mt-8 bg-white border rounded-lg p-5"
            style={{ borderColor: "#E8E9EB" }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p
                  className="text-[11px] font-medium tracking-widest uppercase"
                  style={{ color: "#292B2F" }}
                >
                  Tips
                </p>
                <h3
                  className="text-[15px] font-semibold mt-1"
                  style={{ color: "#111111" }}
                >
                  How to sell faster
                </h3>
              </div>
              <Link
                href="/account"
                className="text-[13px] underline underline-offset-2"
                style={{ color: "#111111" }}
              >
                View my listings
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                "Add a clear section and seat map so buyers know exactly what they’re getting.",
                "Price within a realistic range to attract a quick, authentic sale.",
                "Keep your listing active and respond to buyer messages promptly.",
              ].map((item) => (
                <div
                  key={item}
                  className="border rounded-lg p-4 text-[13px]"
                  style={{ borderColor: "#E8E9EB", color: "#292B2F" }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </ProtectedRoute>
      </main>
    </div>
  )
}
