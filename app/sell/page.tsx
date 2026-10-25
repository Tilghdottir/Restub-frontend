"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import AccountSidebar from "../components/AccountSidebar"
import ApiErrorNotice from "../components/ApiErrorNotice"
import { ProtectedRoute } from "../components/ProtectedRoute"
import { getApiErrorMessage } from "../lib/rtk-api"
import { createIdempotencyKey } from "../lib/api/device"
import {
  useCompleteTicketUploadMutation,
  useCreateListingMutation,
  useCreateTicketUploadMutation,
  useLazyGetMyListingByIdQuery,
  useLazyGetDraftTicketUploadStatusQuery,
  usePublishListingMutation,
  useSubmitManualTicketReviewMutation,
} from "../lib/listings/rtk"
import { uploadTicketFileToStorage } from "../lib/listings/client"
import type {
  CreateListingRequest,
  DraftTicketUploadStatus,
  ListingTicketDetails,
  ListingTicketType,
  ManualListingReviewStatus,
  TicketUploadStatus,
} from "../lib/listings/types"
import { LISTING_TICKET_TYPES } from "../lib/listings/types"
import {
  isTicketPackage,
  LISTING_TICKET_TYPE_LABELS,
} from "../lib/listings/ticket-types"
import {
  useGetEventPartnersQuery,
  useGetEventsQuery,
  useLazySearchEventPartnersQuery,
} from "../lib/events/rtk"
import type { CatalogPartner } from "../lib/events/models"

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

function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
})

export default function SellPage() {
  const [createListing] = useCreateListingMutation()
  const [createTicketUpload] = useCreateTicketUploadMutation()
  const [completeTicketUpload] = useCompleteTicketUploadMutation()
  const [fetchMyListing] = useLazyGetMyListingByIdQuery()
  const [fetchDraftTicketUploadStatus] =
    useLazyGetDraftTicketUploadStatusQuery()
  const [publishListing] = usePublishListingMutation()
  const [submitManualTicketReview] = useSubmitManualTicketReviewMutation()
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
  const [sellStep, setSellStep] = useState<"details" | "uploads">("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
  const isFormLocked = isSubmitting || hasPendingSubmission
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
  const renderTicketDetailInput = (
    label: string,
    field: Exclude<keyof ListingTicketDetails, "includedAdmissions">,
    options: {
      required?: boolean
      wide?: boolean
      multiline?: boolean
    } = {},
  ) => {
    const fieldId = `ticket-${field}`
    return (
      <div className={options.wide ? "md:col-span-2" : undefined}>
        <label
          className="block text-[12px] font-medium mb-1.5"
          htmlFor={fieldId}
          style={{ color: "#111111" }}
        >
          {label}
        </label>
        {options.multiline ? (
          <textarea
            id={fieldId}
            required={options.required}
            disabled={isFormLocked}
            value={ticketDetails[field] ?? ""}
            onChange={(e) => updateTicketDetails(field, e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: "#E8E9EB",
              color: "#111111",
            }}
          />
        ) : (
          <input
            id={fieldId}
            required={options.required}
            disabled={isFormLocked}
            value={ticketDetails[field] ?? ""}
            onChange={(e) => updateTicketDetails(field, e.target.value)}
            className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
            style={{
              backgroundColor: "#FAFAF7",
              borderColor: "#E8E9EB",
              color: "#111111",
            }}
          />
        )}
      </div>
    )
  }

  const applyDraftTicketStatus = useCallback(
    (status: DraftTicketUploadStatus) => {
      const statuses: Record<number, TicketUploadStatus> = {}
      for (const ticket of status.tickets) {
        statuses[ticket.slotIndex] = ticket.status
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
      if (status.manualReviewStatus === "rejected") {
        failedSlots = Array.from(
          { length: status.quantity },
          (_, index) => index + 1,
        )
        setTicketFiles(Array.from({ length: status.quantity }, () => null))
        setUploadedTicketSlots([])
        setTicketUploadIds({})
      }
      setTicketSlotStatuses(statuses)
      setVerifiedTicketSlots(
        status.manualReviewStatus === "rejected" ? [] : verifiedSlots,
      )
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
        setSellStep("uploads")
        setStatusMessage(
          "Draft restored. Re-select files for incomplete tickets.",
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
          Array.from({ length: qty }, (_, index) => [
            index + 1,
            "manual_review_pending" as const,
          ]),
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
              "Ticket evidence was rejected. Select replacement files for every ticket.",
          )
          return
        }
        if (status.manualReviewStatus !== "approved") {
          throw new Error("The ticket review status could not be confirmed.")
        }
        setStatusMessage(
          "Ticket evidence was approved. Publish the listing when you’re ready.",
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
      setIsSubmitting(true)
      try {
        await publishListing({
          listingId: pendingListingId,
          idempotencyKey: pendingPublishKey ?? undefined,
        }).unwrap()
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
        setResumedEventDetails(null)
        setStatusMessage("Listing published successfully.")
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Unable to check or publish the listing."),
        )
      } finally {
        setIsSubmitting(false)
      }
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
          const normalizedTicketDetails: ListingTicketDetails = {
            ...(ticketDetails.section?.trim()
              ? { section: ticketDetails.section.trim() }
              : {}),
            ...(ticketDetails.row?.trim()
              ? { row: ticketDetails.row.trim() }
              : {}),
            ...(ticketDetails.seatNumbers?.trim()
              ? { seatNumbers: ticketDetails.seatNumbers.trim() }
              : {}),
            ...(ticketDetails.accessArea?.trim()
              ? { accessArea: ticketDetails.accessArea.trim() }
              : {}),
            ...(ticketDetails.sessionName?.trim()
              ? { sessionName: ticketDetails.sessionName.trim() }
              : {}),
            ...(ticketDetails.packageName?.trim()
              ? { packageName: ticketDetails.packageName.trim() }
              : {}),
            ...(ticketDetails.includedAdmissions
              ? { includedAdmissions: ticketDetails.includedAdmissions }
              : {}),
            ...(ticketDetails.accessibilityNotes?.trim()
              ? { accessibilityNotes: ticketDetails.accessibilityNotes.trim() }
              : {}),
            ...(ticketDetails.otherDetails?.trim()
              ? { otherDetails: ticketDetails.otherDetails.trim() }
              : {}),
          }
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
            price,
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
        throw new Error(
          `Ticket verification needs attention. ${verificationErrors.join(" ")}`,
        )
      }

      await publishListing({
        listingId,
        idempotencyKey: publishKey ?? undefined,
      }).unwrap()
      setPendingListingId(null)
      setPendingPublishKey(null)
      setPendingCreatePayload(null)
      setCreateListingKey(createIdempotencyKey())
      setUploadedTicketSlots([])
      setTicketUploadIds({})
      setVerifiedTicketSlots([])
      setFailedTicketSlots([])
      setTicketFiles([])
      setTicketSlotStatuses({})
      setResumedEventDetails(null)
      setManualReviewSubmitted(false)
      setManualReviewStatus("not_submitted")
      setManualReviewNote(null)
      setSellStep("details")
      setStatusMessage("Listing published successfully.")
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
            Seller dashboard
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
              { id: "details", label: "1. Listing details" },
              { id: "uploads", label: "2. Upload tickets" },
            ].map((step) => {
              const isActive = sellStep === step.id
              const isComplete = sellStep === "uploads" && step.id === "details"

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
                      <div className="mt-3 grid gap-3">
                        <label
                          className="text-[12px] font-medium"
                          htmlFor="manual-partner-name"
                        >
                          Partner name
                        </label>
                        <input
                          id="manual-partner-name"
                          required
                          disabled={isFormLocked}
                          value={manualPartnerName}
                          onChange={(e) => {
                            setManualPartnerName(e.target.value)
                            setSearchedPartnerTerm("")
                            setConfirmedNewPartner(false)
                          }}
                          placeholder="Enter partner name"
                          className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "#FAFAF7",
                            borderColor: "#E8E9EB",
                            color: "#111111",
                          }}
                        />
                        <label
                          className="text-[12px] font-medium"
                          htmlFor="manual-partner-url"
                        >
                          Partner website (optional)
                        </label>
                        <input
                          id="manual-partner-url"
                          type="url"
                          disabled={isFormLocked}
                          value={manualPartnerUrl}
                          onChange={(e) => {
                            setManualPartnerUrl(e.target.value)
                            setSearchedPartnerTerm("")
                            setConfirmedNewPartner(false)
                          }}
                          placeholder="https://example.com"
                          className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "#FAFAF7",
                            borderColor: "#E8E9EB",
                            color: "#111111",
                          }}
                        />
                        <p className="text-[11px]" style={{ color: "#62656A" }}>
                          We’ll check existing partners to help you select the
                          canonical record and avoid duplicate names.
                        </p>
                        {isSearchingPartners ? (
                          <p
                            className="text-[12px]"
                            style={{ color: "#62656A" }}
                            role="status"
                          >
                            Checking existing partners…
                          </p>
                        ) : partnerSearchFailed ? (
                          <div className="space-y-2">
                            <p
                              className="text-[12px]"
                              style={{ color: "#A03B32" }}
                              role="alert"
                            >
                              Could not check the partner catalog. Retry before
                              continuing.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchedPartnerTerm(partnerSearchTerm)
                                void searchEventPartners(partnerSearchTerm)
                              }}
                              className="text-[12px] font-medium underline"
                              style={{ color: "#111111" }}
                            >
                              Retry partner search
                            </button>
                          </div>
                        ) : searchedPartnerTerm === partnerSearchTerm &&
                          partnerSearchTerm.length >= 2 ? (
                          partnerMatches.length > 0 ? (
                            <div
                              className="rounded-lg border p-3"
                              style={{
                                borderColor: "#EAD9A8",
                                backgroundColor: "#FFF8E7",
                              }}
                            >
                              <p
                                className="mb-2 text-[12px] font-medium"
                                style={{ color: "#6A5318" }}
                              >
                                These existing partners may match:
                              </p>
                              <div className="space-y-2">
                                {partnerMatches.map((partner) => (
                                  <button
                                    key={partner.id}
                                    type="button"
                                    onClick={() => {
                                      setMatchedPartner(partner)
                                      setPartnerId(partner.id)
                                      setManualPartnerName(partner.name)
                                      setManualPartnerUrl(
                                        partner.websiteUrl ?? "",
                                      )
                                      setEventId("")
                                      setConfirmedNewPartner(false)
                                    }}
                                    className="block w-full rounded-md border bg-white px-3 py-2 text-left"
                                    style={{ borderColor: "#E8E9EB" }}
                                  >
                                    <span
                                      className="block text-[12px] font-semibold"
                                      style={{ color: "#111111" }}
                                    >
                                      {partner.name}
                                    </span>
                                    {partner.websiteUrl ? (
                                      <span
                                        className="block text-[11px]"
                                        style={{ color: "#62656A" }}
                                      >
                                        {partner.websiteUrl}
                                      </span>
                                    ) : null}
                                  </button>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => setConfirmedNewPartner(true)}
                                className="mt-3 text-[11px] font-medium underline"
                                style={{ color: "#6A5318" }}
                              >
                                None of these match; use a different partner
                              </button>
                              {confirmedNewPartner ? (
                                <p
                                  className="mt-2 text-[11px]"
                                  style={{ color: "#6A5318" }}
                                >
                                  We’ll still prevent creating a likely
                                  duplicate on the server.
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <p
                              className="text-[12px]"
                              style={{ color: "#22633D" }}
                              role="status"
                            >
                              No close matches found. You can continue with a
                              new partner.
                            </p>
                          )
                        ) : null}
                      </div>
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
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <label
                            className="block text-[12px] font-medium mb-1.5"
                            htmlFor="manual-event-name"
                            style={{ color: "#111111" }}
                          >
                            Event name
                          </label>
                          <input
                            id="manual-event-name"
                            required
                            disabled={isFormLocked}
                            value={manualEventName}
                            onChange={(e) => setManualEventName(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                            style={{
                              backgroundColor: "#FAFAF7",
                              borderColor: "#E8E9EB",
                              color: "#111111",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="block text-[12px] font-medium mb-1.5"
                            htmlFor="manual-event-url"
                            style={{ color: "#111111" }}
                          >
                            Event ticket page URL
                          </label>
                          <input
                            id="manual-event-url"
                            type="url"
                            required
                            disabled={isFormLocked}
                            value={manualEventUrl}
                            onChange={(e) => setManualEventUrl(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                            style={{
                              backgroundColor: "#FAFAF7",
                              borderColor: "#E8E9EB",
                              color: "#111111",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="block text-[12px] font-medium mb-1.5"
                            htmlFor="manual-event-date"
                            style={{ color: "#111111" }}
                          >
                            Event date (optional)
                          </label>
                          <input
                            id="manual-event-date"
                            type="date"
                            disabled={isFormLocked}
                            value={manualEventDate}
                            onChange={(e) => setManualEventDate(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                            style={{
                              backgroundColor: "#FAFAF7",
                              borderColor: "#E8E9EB",
                              color: "#111111",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="block text-[12px] font-medium mb-1.5"
                            htmlFor="manual-event-time"
                            style={{ color: "#111111" }}
                          >
                            Event time (optional)
                          </label>
                          <input
                            id="manual-event-time"
                            type="time"
                            disabled={isFormLocked}
                            value={manualEventTime}
                            onChange={(e) => setManualEventTime(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                            style={{
                              backgroundColor: "#FAFAF7",
                              borderColor: "#E8E9EB",
                              color: "#111111",
                            }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label
                            className="block text-[12px] font-medium mb-1.5"
                            htmlFor="manual-event-venue"
                            style={{ color: "#111111" }}
                          >
                            Venue (optional)
                          </label>
                          <input
                            id="manual-event-venue"
                            disabled={isFormLocked}
                            value={manualEventVenue}
                            onChange={(e) =>
                              setManualEventVenue(e.target.value)
                            }
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                            style={{
                              backgroundColor: "#FAFAF7",
                              borderColor: "#E8E9EB",
                              color: "#111111",
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}

              <div
                className="bg-white border rounded-lg p-5"
                style={{ borderColor: "#E8E9EB" }}
              >
                {sellStep === "details" ? (
                  <>
                    <h2
                      className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                      style={{ color: "#111111" }}
                    >
                      Ticket details
                    </h2>
                    <div className="mb-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ticket-category"
                          className="block text-[12px] font-medium mb-1.5"
                          style={{ color: "#111111" }}
                        >
                          Ticket tier or package name
                        </label>
                        <input
                          id="ticket-category"
                          required
                          maxLength={100}
                          disabled={isFormLocked}
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                          placeholder="e.g. Early Bird, Free RSVP, Lovers Table"
                          className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "#FAFAF7",
                            borderColor: "#E8E9EB",
                            color: "#111111",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="ticket-type"
                          className="block text-[12px] font-medium mb-1.5"
                          style={{ color: "#111111" }}
                        >
                          Ticket structure
                        </label>
                        <select
                          id="ticket-type"
                          disabled={isFormLocked}
                          value={ticketType}
                          onChange={(e) => {
                            const nextTicketType = e.target
                              .value as ListingTicketType
                            if (nextTicketType !== ticketType) {
                              setTicketDetails({})
                            }
                            setTicketType(nextTicketType)
                          }}
                          className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                          style={{
                            backgroundColor: "#FAFAF7",
                            borderColor: "#E8E9EB",
                            color: "#111111",
                          }}
                        >
                          {LISTING_TICKET_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {LISTING_TICKET_TYPE_LABELS[type]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {ticketType === "reserved_seating" ? (
                        <>
                          {renderTicketDetailInput("Section", "section")}
                          {renderTicketDetailInput("Row", "row")}
                          {renderTicketDetailInput(
                            "Seat numbers",
                            "seatNumbers",
                          )}
                        </>
                      ) : null}
                      {ticketType === "general_admission" ||
                      ticketType === "standing"
                        ? renderTicketDetailInput(
                            "Area or access tier (optional)",
                            "accessArea",
                            { wide: true },
                          )
                        : null}
                      {ticketType === "pass_session" ? (
                        <>
                          {renderTicketDetailInput(
                            "Pass or session",
                            "sessionName",
                            {
                              required: true,
                            },
                          )}
                          {renderTicketDetailInput(
                            "Area or stage (optional)",
                            "accessArea",
                          )}
                        </>
                      ) : null}
                      {isPackage ? (
                        <>
                          {renderTicketDetailInput(
                            "Package name (optional)",
                            "packageName",
                          )}
                          <div>
                            <label
                              className="block text-[12px] font-medium mb-1.5"
                              htmlFor="ticket-included-admissions"
                              style={{ color: "#111111" }}
                            >
                              Admissions included per package
                            </label>
                            <input
                              id="ticket-included-admissions"
                              type="number"
                              min={1}
                              max={100}
                              step={1}
                              required
                              disabled={isFormLocked}
                              value={ticketDetails.includedAdmissions ?? ""}
                              onChange={(e) =>
                                updateTicketDetails(
                                  "includedAdmissions",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
                              style={{
                                backgroundColor: "#FAFAF7",
                                borderColor: "#E8E9EB",
                                color: "#111111",
                              }}
                            />
                          </div>
                        </>
                      ) : null}
                      {ticketType === "accessible" ? (
                        <>
                          {renderTicketDetailInput(
                            "Accessibility details",
                            "accessibilityNotes",
                            { required: true, wide: true, multiline: true },
                          )}
                          {renderTicketDetailInput(
                            "Section (optional)",
                            "section",
                          )}
                          {renderTicketDetailInput(
                            "Seat numbers (optional)",
                            "seatNumbers",
                          )}
                        </>
                      ) : null}
                      {ticketType === "other"
                        ? renderTicketDetailInput(
                            "Ticket details",
                            "otherDetails",
                            { required: true, wide: true, multiline: true },
                          )
                        : null}
                      <div>
                        <label
                          className="block text-[12px] font-medium mb-1.5"
                          style={{ color: "#111111" }}
                        >
                          Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          step={1}
                          required
                          disabled={isFormLocked}
                          value={qty}
                          onChange={(e) => setQty(Number(e.target.value) || 1)}
                          className="w-full border rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:ring-1"
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
                    Upload and verify tickets
                  </h2>
                )}
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
                      ? "Ticket evidence is awaiting staff review. Uploads and publishing are paused until the review is complete."
                      : manualReviewStatus === "approved"
                        ? "Ticket evidence was approved. Publish this draft when you’re ready."
                        : `Ticket evidence was rejected. Select replacement files for every ticket and submit them for review again.${
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
                  <div
                    className="mt-5 border-t pt-4"
                    style={{ borderColor: "#E8E9EB" }}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3
                          className="text-[12px] font-semibold"
                          style={{ color: "#111111" }}
                        >
                          Upload ticket evidence
                        </h3>
                        <p
                          className="mt-1 text-[12px]"
                          style={{ color: "#62656A" }}
                        >
                          One private PDF, JPEG, or PNG per{" "}
                          {isPackage ? "package" : "ticket"} · Up to 5 MB each
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium"
                        style={{
                          backgroundColor:
                            verifiedTicketSlots.length === qty
                              ? "#E7F4EC"
                              : "#F0F0ED",
                          color:
                            verifiedTicketSlots.length === qty
                              ? "#22633D"
                              : "#62656A",
                        }}
                        aria-live="polite"
                      >
                        {verifiedTicketSlots.length} of {qty} complete
                      </span>
                    </div>
                    <p
                      className="mb-3 text-[11px]"
                      style={{ color: "#62656A" }}
                    >
                      Files stay private and are never shown to buyers. Your
                      listing can be published after all files are verified or
                      approved through manual review.
                    </p>
                    <div className="space-y-3">
                      {Array.from({ length: qty }, (_, index) => {
                        const slotIndex = index + 1
                        const file = ticketFiles[index] ?? null
                        const isVerified =
                          verifiedTicketSlots.includes(slotIndex)
                        const isUploading = uploadingTicketSlot === slotIndex
                        const isVerifying = verifyingTicketSlot === slotIndex
                        const hasUploadFailed =
                          failedTicketSlots.includes(slotIndex)
                        const isUploaded =
                          uploadedTicketSlots.includes(slotIndex)
                        const ticketStatus = ticketSlotStatuses[slotIndex]
                        const isProcessing = ticketStatus === "processing"
                        const isReviewPending =
                          ticketStatus === "manual_review_pending"
                        const isReviewApproved =
                          ticketStatus === "manual_review_approved"
                        const isReviewRejected =
                          ticketStatus === "manual_review_rejected"
                        const inputId = `ticket-file-${slotIndex}`
                        const statusLabel = isReviewApproved
                          ? "Review approved"
                          : isVerified
                            ? "Verified"
                            : isReviewPending
                              ? "Under manual review"
                              : isReviewRejected
                                ? "Review rejected — replace file"
                                : isProcessing
                                  ? "Verification in progress"
                                  : isUploading
                                    ? `Uploading · ${uploadProgress}%`
                                    : isVerifying
                                      ? "Verifying ticket…"
                                      : hasUploadFailed
                                        ? isUploaded
                                          ? "Verification failed"
                                          : "Upload failed"
                                        : isUploaded
                                          ? "Uploaded · ready to verify"
                                          : file
                                            ? "Ready to upload"
                                            : "File required"
                        const statusColor = isVerified
                          ? "#22633D"
                          : isReviewRejected
                            ? "#A03B32"
                            : isReviewPending || isProcessing
                              ? "#6A5318"
                              : hasUploadFailed
                                ? "#A03B32"
                                : "#62656A"
                        return (
                          <div
                            key={slotIndex}
                            className="rounded-lg border p-3"
                            style={{ borderColor: "#E8E9EB" }}
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span
                                className="text-[12px] font-semibold"
                                style={{ color: "#111111" }}
                              >
                                {isPackage ? "Package" : "Ticket"} {slotIndex}
                              </span>
                              <span
                                className="text-[11px] font-medium"
                                style={{ color: statusColor }}
                                aria-live="polite"
                              >
                                {statusLabel}
                              </span>
                            </div>
                            <label
                              htmlFor={inputId}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.preventDefault()
                                if (
                                  isSubmitting ||
                                  manualReviewSubmitted ||
                                  isVerified ||
                                  isProcessing
                                ) {
                                  return
                                }
                                setTicketFile(
                                  slotIndex,
                                  event.dataTransfer.files[0],
                                )
                              }}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed px-3 py-3 transition-colors ${
                                isVerified ||
                                manualReviewSubmitted ||
                                isProcessing
                                  ? "cursor-not-allowed opacity-70"
                                  : "hover:border-[#62656A]"
                              }`}
                              style={{
                                borderColor: hasUploadFailed
                                  ? "#D59A94"
                                  : "#C9CBCD",
                                backgroundColor: "#FAFAF7",
                              }}
                            >
                              <span className="min-w-0">
                                <span
                                  className="block truncate text-[12px] font-medium"
                                  style={{ color: "#111111" }}
                                >
                                  {file?.name ??
                                    (isReviewApproved
                                      ? "Approved by staff"
                                      : isVerified
                                        ? "Ticket verified"
                                        : "Drop a file here or browse")}
                                </span>
                                <span
                                  className="mt-0.5 block text-[11px]"
                                  style={{ color: "#62656A" }}
                                >
                                  {file
                                    ? formatFileSize(file.size)
                                    : isReviewApproved
                                      ? "Approved through manual review"
                                      : isVerified
                                        ? "Verified ticket evidence"
                                        : "PDF, JPEG, or PNG · Maximum 5 MB"}
                                </span>
                              </span>
                              <span
                                className="shrink-0 text-[11px] font-semibold underline underline-offset-2"
                                style={{ color: "#111111" }}
                              >
                                {isVerified
                                  ? isReviewApproved
                                    ? "Approved"
                                    : "Verified"
                                  : file
                                    ? "Replace"
                                    : "Browse"}
                              </span>
                              <input
                                id={inputId}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                disabled={
                                  isSubmitting ||
                                  manualReviewSubmitted ||
                                  isVerified ||
                                  isProcessing
                                }
                                onChange={(event) => {
                                  setTicketFile(
                                    slotIndex,
                                    event.currentTarget.files?.[0],
                                  )
                                  event.currentTarget.value = ""
                                }}
                                className="sr-only"
                              />
                            </label>
                            {isUploading || isVerifying ? (
                              <div className="mt-2" aria-live="polite">
                                {isUploading ? (
                                  <>
                                    <div
                                      className="h-1.5 overflow-hidden rounded-full"
                                      role="progressbar"
                                      aria-label={`Uploading ${file?.name ?? `ticket ${slotIndex}`}`}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                      aria-valuenow={uploadProgress}
                                      style={{ backgroundColor: "#E8E9EB" }}
                                    >
                                      <div
                                        className="h-full rounded-full transition-[width]"
                                        style={{
                                          width: `${uploadProgress}%`,
                                          backgroundColor: "#111111",
                                        }}
                                      />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                      <span
                                        className="text-[11px]"
                                        style={{ color: "#62656A" }}
                                      >
                                        Uploading securely…
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          uploadAbortController.current?.abort()
                                        }
                                        className="text-[11px] font-medium underline underline-offset-2"
                                        style={{ color: "#111111" }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <p
                                    className="text-[11px]"
                                    style={{ color: "#62656A" }}
                                  >
                                    Checking ticket with the issuing partner…
                                  </p>
                                )}
                              </div>
                            ) : null}
                            {hasUploadFailed ? (
                              <p
                                className="mt-2 text-[11px]"
                                style={{ color: "#A03B32" }}
                              >
                                {isUploaded
                                  ? "We couldn’t verify this file. Replace it or retry the upload."
                                  : "The upload didn’t finish. Retry this file."}
                              </p>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="bg-[#111111] text-[#FAFAF7] rounded-lg p-5 sticky top-20">
              <h2
                className="text-[11px] font-medium tracking-widest uppercase mb-4"
                style={{ color: "rgba(250,250,247,0.55)" }}
              >
                Listing preview
              </h2>
              <div
                className="mb-4 pb-4 border-b"
                style={{ borderColor: "rgba(250,250,247,0.08)" }}
              >
                <p className="text-[15px] font-semibold">{previewEventName}</p>
                <p
                  className="text-[12px] mt-1"
                  style={{ color: "rgba(250,250,247,0.6)" }}
                >
                  {previewEventDate} · {previewEventVenue}
                </p>
              </div>

              <div
                className="space-y-2 mb-5 text-[12px]"
                style={{ color: "rgba(250,250,247,0.7)" }}
              >
                <p>{LISTING_TICKET_TYPE_LABELS[ticketType]}</p>
                {previewTicketDetails.map((detail) => (
                  <p key={detail}>{detail}</p>
                ))}
                <p>
                  {qty} {isPackage ? "packages" : "tickets"} available
                </p>
              </div>

              <div
                className="border-t pt-4"
                style={{ borderColor: "rgba(250,250,247,0.08)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[12px]"
                    style={{ color: "rgba(250,250,247,0.6)" }}
                  >
                    {isPackage
                      ? "Price per package (NGN)"
                      : "Price per ticket (NGN)"}
                  </span>
                  <span className="font-mono-data text-[16px] font-semibold">
                    {nairaFormatter.format(price || 0)}
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={21474836}
                  step={1}
                  required
                  disabled={isFormLocked}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-full rounded-lg px-4 py-2.5 text-[14px] focus:outline-none"
                  style={{
                    backgroundColor: "#1A1A1A",
                    color: "#FAFAF7",
                    border: "1px solid rgba(250,250,247,0.1)",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handlePublishListing}
                disabled={
                  isSubmitting || (!hasPendingSubmission && isFetchingEvents)
                }
                className="mt-6 w-full py-3 rounded-lg text-[14px] font-semibold disabled:opacity-70"
                style={{ backgroundColor: "#FAFAF7", color: "#111111" }}
              >
                {isSubmitting
                  ? "Working…"
                  : sellStep === "details"
                    ? pendingCreatePayload
                      ? "Retry saving details"
                      : "Continue to ticket uploads"
                    : manualReviewStatus === "pending"
                      ? "Check review status"
                      : manualReviewStatus === "approved"
                        ? "Publish approved listing"
                        : Object.values(ticketSlotStatuses).includes(
                              "processing",
                            )
                          ? "Refresh ticket status"
                          : pendingListingId
                            ? verifiedTicketSlots.length === qty
                              ? "Retry publishing listing"
                              : "Upload and verify tickets"
                            : pendingCreatePayload
                              ? "Retry listing creation"
                              : "Publish listing"}
              </button>
              {pendingListingId &&
              !manualReviewSubmitted &&
              manualReviewStatus !== "approved" &&
              uploadedTicketSlots.length === qty &&
              failedTicketSlots.length === qty &&
              verifiedTicketSlots.length === 0 ? (
                <button
                  type="button"
                  onClick={handleManualTicketReview}
                  disabled={isSubmitting}
                  className="mt-3 w-full py-2.5 rounded-lg border text-[12px] font-medium disabled:opacity-60"
                  style={{
                    borderColor: "rgba(250,250,247,0.3)",
                    color: "#FAFAF7",
                  }}
                >
                  Request manual ticket review
                </button>
              ) : null}
              {statusMessage ? (
                <p
                  className="mt-3 text-[11px] text-center"
                  style={{ color: "rgba(250,250,247,0.8)" }}
                >
                  {statusMessage}
                </p>
              ) : null}
              {errorMessage ? (
                <p
                  className="mt-3 text-[11px] text-center"
                  style={{ color: "#F2A1A1" }}
                >
                  {errorMessage}
                </p>
              ) : null}
              <p
                className="mt-3 text-[10px] text-center"
                style={{ color: "rgba(250,250,247,0.45)" }}
              >
                No listing fees until sold
              </p>
            </aside>
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
