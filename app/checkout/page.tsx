"use client"
// if (active) setListingLoading(false)
// setStep(2)
// }

// const handlePay = async (event: React.FormEvent) => {
//   event.preventDefault()

// setErrors(nextErrors)
// if (Object.keys(nextErrors).length > 0) return
/* custom arrow, since appearance-none removes the native one */
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"
import BrandLogo from "../components/BrandLogo"
import Header from "../components/Header"
import { formatNaira } from "../lib/money"
import { getApiErrorMessage } from "../lib/rtk-api"
import { useLazyGetListingByIdQuery } from "../lib/listings/rtk"
import {
  isTicketPackage,
  LISTING_TICKET_TYPE_LABELS,
} from "../lib/listings/ticket-types"
import { useSubmitCheckoutMutation } from "../lib/orders/rtk"
import type { ListingDetail } from "../lib/listings/models"

const STEPS = ["Review", "Contact Details", "Confirmation"] as const
const ID_TYPES = [
  { value: "nin", label: "National Identity Number" },
  { value: "bvn", label: "Bank Verification Number (BVN)" },
]
const escrowPayCheckoutUrl = process.env.NEXT_PUBLIC_ESCROWPAY_CHECKOUT_URL

type IdType = "bvn" | "nin"

function normalizeNigerianPhone(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (digits.startsWith("234")) return `+${digits}`
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`
  return `+234${digits}`
}

function isValidDateOfBirth(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

function CheckoutPageContent() {
  const router = useRouter()
  const [submitCheckout] = useSubmitCheckoutMutation()
  const params = useParams<{ listingId?: string }>()
  const searchParams = useSearchParams()

  const listingIdFromRoute =
    typeof params?.listingId === "string" ? params.listingId : ""
  const listingIdFromQuery = listingIdFromRoute
  const quantityFromQuery = Number(searchParams.get("qty") ?? "1")

  const [fetchListing] = useLazyGetListingByIdQuery()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [listingLoading, setListingLoading] = useState(
    Boolean(listingIdFromQuery),
  )
  const [listingError, setListingError] = useState("")
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [qty, setQty] = useState(
    Number.isFinite(quantityFromQuery) && quantityFromQuery > 0
      ? quantityFromQuery
      : 1,
  )
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [id_type, setIdType] = useState<IdType | "">("")
  const [id_number, setIdNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [identityConsent, setIdentityConsent] = useState(false)
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [zip, setZip] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState("")

  const idempotencyKey = useRef<string | null>(null)
  const resetIdempotencyKey = () => {
    idempotencyKey.current = null
  }

  useEffect(() => {
    const accessToken = window.localStorage.getItem("restub_access_token")
    setIsAuthenticated(Boolean(accessToken))
    setAuthChecked(true)
  }, [])

  useEffect(() => {
    if (!listingIdFromQuery) {
      setListingError(
        "Checkout requires a backend listing ID. Start from a listing detail page.",
      )
      setListingLoading(false)
      return
    }

    const controller = new AbortController()
    let active = true
    setListing(null)
    setListingLoading(true)
    setListingError("")

    void fetchListing(listingIdFromQuery)
      .unwrap()
      .then((nextListing) => {
        if (controller.signal.aborted) return
        if (!active) return
        setListing(nextListing)
        setListingError("")
        setQty((currentQty) => {
          if (currentQty > nextListing.quantity)
            return nextListing.quantity || 1
          return currentQty > 0 ? currentQty : 1
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (!active) return
        setListingError(
          error instanceof Error
            ? error.message
            : "The selected listing could not be loaded.",
        )
      })
      .finally(() => {
        if (!controller.signal.aborted && active) setListingLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [fetchListing, listingIdFromQuery])

  const priceEach = listing?.price ?? 0
  const subtotal = priceEach * qty
  const fees = Math.round(subtotal * 0.13)
  const total = subtotal + fees
  const isPackage = isTicketPackage(listing?.ticketType)

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ")

  const formatExpiry = (v: string) =>
    v.replace(/\D/g, "")
      .slice(0, 4)
      .replace(/(\d{2})(?=\d)/, "$1/")

  const validateContact = () => {
    const nextErrors: Record<string, string> = {}
    if (!firstName.trim()) nextErrors.firstName = "First name is required"
    if (!lastName.trim()) nextErrors.lastName = "Last name is required"
    if (!/^\S+@\S+\.\S+$/.test(customerEmail.trim())) {
      nextErrors.customerEmail = "A valid email is required"
    }
    if (!/^\+234[789]\d{9}$/.test(normalizeNigerianPhone(phone))) {
      nextErrors.phone = "Enter a valid Nigerian phone number"
    }
    return nextErrors
  }

  const validateGuestKyc = () => {
    const next: Record<string, string> = {}
    if (!id_type) next.id_type = "ID type is required"
    if (!id_number.trim()) next.id_number = "ID number is required"
    else if (!/^\d{11}$/.test(id_number.trim()))
      next.id_number = "Enter a valid 11-digit number"
    if (!isValidDateOfBirth(dateOfBirth)) {
      next.dateOfBirth = "Enter a valid date of birth"
    }
    if (!identityConsent)
      next.identityConsent = "Consent is required for identity verification"
    return next
  }

  const validatePayment = () => {
    const nextErrors: Record<string, string> = {}
    if (!cardName.trim()) nextErrors.cardName = "Name on card is required"
    if (cardNumber.replace(/\s/g, "").length < 16) {
      nextErrors.cardNumber = "Enter a valid 16-digit card number"
    }
    if (expiry.length < 5) nextErrors.expiry = "Enter a valid expiry date"
    if (cvv.length < 3) nextErrors.cvv = "Enter a valid CVV"
    if (!zip.trim()) nextErrors.zip = "Billing ZIP is required"
    return nextErrors
  }

  const handleDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!listingIdFromQuery) {
      setSubmitError(
        "Checkout requires a backend listing ID. Start from a listing detail page.",
      )
      return
    }
    const contactErrors = validateContact()
    const kycErrors = !isAuthenticated ? validateGuestKyc() : {}
    const nextErrors = { ...contactErrors, ...kycErrors }
    setErrors(nextErrors)
    if (!authChecked || Object.keys(nextErrors).length > 0) return
    setLoading(true)
    setSubmitError("")

    try {
      const payload = {
        listingId: listingIdFromQuery,
        quantity: qty,
        email: customerEmail.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: normalizeNigerianPhone(phone),
        currency: "NGN",
        ...(!isAuthenticated && id_type
          ? {
              identityType: id_type,
              identifier: id_number.trim(),
              date_of_birth: dateOfBirth,
              identityConsent: true,
            }
          : {}),
      }
      if (!idempotencyKey.current) {
        idempotencyKey.current =
          typeof globalThis.crypto !== "undefined" &&
          typeof globalThis.crypto.randomUUID === "function"
            ? globalThis.crypto.randomUUID()
            : `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`
      }
      const response = await submitCheckout({
        payload,
        idempotencyKey: idempotencyKey.current,
      }).unwrap()

      if (typeof window !== "undefined") {
        window.localStorage.setItem("restub_email", customerEmail.trim())
      }

      idempotencyKey.current = null
      setIdNumber("")
      setDateOfBirth("")
      setIdType("")
      setIdentityConsent(false)
      const confirmationQuery = new URLSearchParams({
        orderId: response.order.id,
      })
      if (response.verification?.status === "pending") {
        confirmationQuery.set("status", "verification-pending")
        confirmationQuery.set("expiresAt", response.verification.expiresAt)
        router.push(`/checkout/confirmation?${confirmationQuery.toString()}`)
        return
      }

      const checkoutUrl =
        response.checkoutUrl ?? response.payment?.authorizationUrl ?? null
      if (checkoutUrl) {
        const hostedCheckout = new URL(checkoutUrl)
        if (hostedCheckout.protocol !== "https:") {
          throw new Error(
            "The payment provider returned an invalid checkout URL.",
          )
        }
        window.location.assign(hostedCheckout.toString())
        return
      }

      router.push(
        `/checkout/success?orderId=${encodeURIComponent(response.order.id)}`,
      )
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          "Checkout could not be completed. Please try again.",
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  if (!listingIdFromQuery) {
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        <header
          className="bg-white border-b"
          style={{ borderColor: "#E8E9EB" }}
        >
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
            <BrandLogo width={120} height={28} />
          </div>
        </header>
        <main className="max-w-xl mx-auto px-6 py-16 text-center">
          <p className="text-[14px] text-[#292B2F]">
            Checkout requires a backend listing ID. Start from a listing detail
            page.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-[13px] underline text-[#111111]"
          >
            Browse listings
          </Link>
        </main>
      </div>
    )
  }

  if (listingLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-16 text-center text-[14px] text-[#292B2F]">
          Loading checkout details…
        </main>
      </div>
    )
  }

  if (listingError || !listing) {
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        <Header />
        <main className="max-w-xl mx-auto px-6 py-16 text-center">
          <p className="text-[14px] text-[#292B2F]">
            {listingError || "The selected listing could not be loaded."}
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-[13px] underline text-[#111111]"
          >
            Back to listings
          </Link>
        </main>
      </div>
    )
  }

  const orderRef = `RC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <header className="bg-white border-b" style={{ borderColor: "#E8E9EB" }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <BrandLogo width={120} height={28} />
          {step < 3 && (
            <>
              <span
                className="w-px h-4 mx-2"
                style={{ backgroundColor: "#E8E9EB" }}
              />
              <div className="flex items-center gap-3">
                {STEPS.slice(0, 2).map((label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 transition-colors"
                      style={
                        index < step
                          ? { backgroundColor: "#111111", color: "#FAFAF7" }
                          : index === step
                            ? { backgroundColor: "#111111", color: "#FAFAF7" }
                            : { backgroundColor: "#E8E9EB", color: "#292B2F" }
                      }
                    >
                      {index < step ? "✓" : index + 1}
                    </div>
                    <span
                      className="text-[12px] font-medium hidden sm:inline"
                      style={{ color: index <= step ? "#111111" : "#292B2F" }}
                    >
                      {label}
                    </span>
                    {index < 2 && (
                      <span className="text-[#E8E9EB] mx-1 hidden sm:inline">
                        ›
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {step === 2 ? (
          <div className="max-w-md mx-auto text-center py-12">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              ✓
            </div>
            <h1 className="text-2xl font-bold mb-2 text-[#111111]">
              Order confirmed
            </h1>
            <p className="text-[14px] mb-2 text-[#292B2F]">
              Your tickets are on their way to your inbox.
            </p>
            <p className="font-mono-data text-[12px] mb-8 text-[#292B2F]">
              Order ref: {orderRef}
            </p>

            <div
              className="border rounded-lg overflow-hidden mb-8 text-left"
              style={{ borderColor: "#E8E9EB" }}
            >
              <div
                className="bg-white p-5 border-b"
                style={{ borderColor: "#E8E9EB" }}
              >
                <p className="text-[11px] font-medium tracking-wide uppercase mb-1 text-[#292B2F]">
                  Ticket listing
                </p>
                <p className="text-[15px] font-semibold text-[#111111]">
                  {listing.title}
                </p>
                <p className="text-[13px] mt-0.5 text-[#292B2F]">
                  {listing.quantity} {isPackage ? "packages" : "tickets"}{" "}
                  available · {formatNaira(listing.price)} per{" "}
                  {isPackage ? "package" : "ticket"}
                </p>
                <p className="mt-1 text-[12px] text-[#292B2F]">
                  {listing.ticketCategory} ·{" "}
                  {
                    LISTING_TICKET_TYPE_LABELS[
                      listing.ticketType ?? "general_admission"
                    ]
                  }
                  {isPackage && listing.ticketDetails?.includedAdmissions
                    ? ` · ${listing.ticketDetails.includedAdmissions} admissions per package`
                    : ""}
                </p>
              </div>
              <div className="bg-white p-5 space-y-2">
                {[
                  {
                    label: "Quantity",
                    value: `${qty} ${isPackage ? "package" : "ticket"}${
                      qty > 1 ? "s" : ""
                    }`,
                  },
                  {
                    label: "Total paid",
                    value: formatNaira(total),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[13px]">
                    <span className="text-[#292B2F]">{label}</span>
                    <span className="font-medium font-mono-data text-[#111111]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/account"
              className="inline-block w-full py-3 rounded-lg text-[14px] font-semibold text-center"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              View my order
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
            <div>
              {step === 0 && (
                <div>
                  <h1 className="text-xl font-bold mb-6 text-[#111111]">
                    Review your order
                  </h1>

                  <div
                    className="bg-white border rounded-lg p-5 mb-4"
                    style={{ borderColor: "#E8E9EB" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium tracking-wide uppercase mb-0.5 text-[#292B2F]">
                          Ticket listing
                        </p>
                        <p className="text-[15px] font-semibold leading-tight text-[#111111]">
                          {listing.title}
                        </p>
                        <p className="text-[13px] mt-1 text-[#292B2F]">
                          {listing.description}
                        </p>
                        <p className="mt-2 text-[12px] text-[#292B2F]">
                          {listing.ticketCategory} ·{" "}
                          {
                            LISTING_TICKET_TYPE_LABELS[
                              listing.ticketType ?? "general_admission"
                            ]
                          }
                          {isPackage &&
                          listing.ticketDetails?.includedAdmissions
                            ? ` · ${listing.ticketDetails.includedAdmissions} admissions per package`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono-data text-[15px] font-semibold text-[#111111]">
                          {formatNaira(listing.price)}
                        </p>
                        <p className="text-[11px] text-[#292B2F]">
                          per {isPackage ? "package" : "ticket"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="bg-white border rounded-lg p-5 mb-4"
                    style={{ borderColor: "#E8E9EB" }}
                  >
                    <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-4 text-[#111111]">
                      {isPackage ? "Packages" : "Tickets"}
                    </h2>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          resetIdempotencyKey()
                          setQty((current) => Math.max(1, current - 1))
                        }}
                        className="rounded-lg border px-3 py-2 text-[18px] leading-none"
                        style={{ borderColor: "#E8E9EB", color: "#111111" }}
                      >
                        −
                      </button>
                      <span className="text-[14px] font-medium min-w-[3ch] text-center text-[#111111]">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          resetIdempotencyKey()
                          setQty((current) =>
                            Math.min(listing.quantity, current + 1),
                          )
                        }}
                        className="rounded-lg border px-3 py-2 text-[18px] leading-none"
                        style={{ borderColor: "#E8E9EB", color: "#111111" }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-3 rounded-lg text-[14px] font-semibold"
                    style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
                  >
                    Continue to Contact Details
                  </button>
                </div>
              )}

              {step === 1 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1.5 text-[13px] font-medium mb-6 hover:opacity-70 transition-opacity text-[#292B2F]"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M9 11L5 7L9 3"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back to review
                  </button>

                  <h1 className="text-xl font-bold mb-6 text-[#111111]">
                    Contact Details
                  </h1>

                  <form onSubmit={handleDetails} className="space-y-4">
                    <div
                      className="bg-white border rounded-lg p-5"
                      style={{ borderColor: "#E8E9EB" }}
                    >
                      <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-4 text-[#111111]">
                        Contact details
                      </h2>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[12px] font-medium mb-1.5 text-[#111111]">
                            First name
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(event) => {
                              resetIdempotencyKey()
                              setFirstName(event.target.value)
                            }}
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px]"
                            style={{
                              backgroundColor: "#FAFAF7",
                              borderColor: errors.firstName
                                ? "#292B2F"
                                : "#E8E9EB",
                              color: "#111111",
                            }}
                          />
                          {errors.firstName && (
                            <p className="text-[11px] mt-1 text-[#292B2F]">
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium mb-1.5 text-[#111111]">
                            Last name
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(event) => {
                              resetIdempotencyKey()
                              setLastName(event.target.value)
                            }}
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px]"
                            style={{
                              backgroundColor: "#FAFAF7",
                              borderColor: errors.lastName
                                ? "#292B2F"
                                : "#E8E9EB",
                              color: "#111111",
                            }}
                          />
                          {errors.lastName && (
                            <p className="text-[11px] mt-1 text-[#292B2F]">
                              {errors.lastName}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[12px] font-medium mb-1.5 text-[#111111]">
                            Email address
                          </label>
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(event) => {
                              resetIdempotencyKey()
                              setCustomerEmail(event.target.value)
                            }}
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px]"
                            style={{
                              backgroundColor: "#FAFAF7",
                              borderColor: errors.customerEmail
                                ? "#292B2F"
                                : "#E8E9EB",
                              color: "#111111",
                            }}
                          />
                          {errors.customerEmail && (
                            <p className="text-[11px] mt-1 text-[#292B2F]">
                              {errors.customerEmail}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[12px] font-medium mb-1.5 text-[#111111]">
                            Phone number
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(event) => {
                              resetIdempotencyKey()
                              setPhone(event.target.value)
                            }}
                            className="w-full border rounded-lg px-4 py-2.5 text-[14px]"
                            style={{
                              backgroundColor: "#FAFAF7",
                              borderColor: errors.phone ? "#292B2F" : "#E8E9EB",
                              color: "#111111",
                            }}
                          />
                          {errors.phone && (
                            <p className="text-[11px] mt-1 text-[#292B2F]">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {!authChecked ? (
                      <p className="text-[13px] text-[#292B2F]">
                        Checking account…
                      </p>
                    ) : (
                      !isAuthenticated && (
                        <div
                          className="bg-white border rounded-lg p-5"
                          style={{ borderColor: "#E8E9EB" }}
                        >
                          <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-4 text-[#111111]">
                            KYC details
                          </h2>
                          <p className="text-[13px] mb-4 text-[#292B2F]">
                            For escrow and fraud prevention purposes, we require
                            identity verification for checkout. Please provide
                            your ID details below.
                          </p>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label
                                htmlFor="id_type"
                                className="block text-[12px] font-medium mb-1.5 text-[#111111]"
                              >
                                ID Type
                              </label>

                              <div className="relative">
                                <select
                                  id="id_type"
                                  value={id_type}
                                  onChange={(event) => {
                                    const value = event.target.value
                                    if (value === "bvn" || value === "nin") {
                                      resetIdempotencyKey()
                                      setIdType(value)
                                    }
                                  }}
                                  className="w-full appearance-none border rounded-lg px-4 py-2.5 pr-10 text-[14px]"
                                  style={{
                                    backgroundColor: "#FAFAF7",
                                    borderColor: errors.id_type
                                      ? "#292B2F"
                                      : "#E8E9EB",
                                    color: id_type ? "#111111" : "#8A8D91",
                                  }}
                                >
                                  <option value="" disabled>
                                    Select ID type
                                  </option>
                                  {ID_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                      {t.label}
                                    </option>
                                  ))}
                                </select>

                                {}
                                <svg
                                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#111111"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </div>

                              {errors.id_type && (
                                <p className="text-[11px] mt-1 text-[#292B2F]">
                                  {errors.id_type}
                                </p>
                              )}
                            </div>

                            <div className="md:col-span-2">
                              <label
                                htmlFor="date_of_birth"
                                className="block text-[12px] font-medium mb-1.5 text-[#111111]"
                              >
                                Date of birth
                              </label>
                              <input
                                id="date_of_birth"
                                type="date"
                                autoComplete="bday"
                                value={dateOfBirth}
                                onChange={(event) => {
                                  resetIdempotencyKey()
                                  setDateOfBirth(event.target.value)
                                }}
                                className="w-full border rounded-lg px-4 py-2.5 text-[14px]"
                                style={{
                                  backgroundColor: "#FAFAF7",
                                  borderColor: errors.dateOfBirth
                                    ? "#292B2F"
                                    : "#E8E9EB",
                                  color: "#111111",
                                }}
                              />
                              <p className="text-[11px] mt-1 text-[#292B2F]">
                                Enter the date of birth registered to your BVN
                                or NIN.
                              </p>
                              {errors.dateOfBirth && (
                                <p className="text-[11px] mt-1 text-[#292B2F]">
                                  {errors.dateOfBirth}
                                </p>
                              )}
                            </div>

                            <div className="md:col-span-2">
                              <label
                                htmlFor="id_number"
                                className="block text-[12px] font-medium mb-1.5 text-[#111111]"
                              >
                                ID Number
                              </label>
                              <input
                                id="id_number"
                                type="text"
                                autoComplete="off"
                                inputMode="numeric"
                                maxLength={11}
                                value={id_number}
                                onChange={(event) => {
                                  resetIdempotencyKey()
                                  setIdNumber(
                                    event.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 11),
                                  )
                                }}
                                className="w-full border rounded-lg px-4 py-2.5 text-[14px]"
                                style={{
                                  backgroundColor: "#FAFAF7",
                                  borderColor: errors.id_number
                                    ? "#292B2F"
                                    : "#E8E9EB",
                                  color: "#111111",
                                }}
                              />
                              {errors.id_number && (
                                <p className="text-[11px] mt-1 text-[#292B2F]">
                                  {errors.id_number}
                                </p>
                              )}
                            </div>

                            <label
                              className="md:col-span-2 flex items-start gap-2 text-[12px]"
                              style={{ color: "#292B2F" }}
                            >
                              <input
                                type="checkbox"
                                checked={identityConsent}
                                onChange={(event) => {
                                  resetIdempotencyKey()
                                  setIdentityConsent(event.target.checked)
                                }}
                                className="mt-0.5"
                              />
                              <span>
                                I consent to identity verification using these
                                details as part of this guest checkout.
                              </span>
                            </label>
                            {errors.identityConsent && (
                              <p className="md:col-span-2 text-[11px] text-[#292B2F]">
                                {errors.identityConsent}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    {submitError && (
                      <div
                        className="rounded-lg border px-3 py-2 text-[12px]"
                        style={{
                          backgroundColor: "#FAFAF7",
                          borderColor: "#E8E9EB",
                          color: "#292B2F",
                        }}
                      >
                        {submitError}
                      </div>
                    )}

                    {!authChecked ? (
                      <button
                        type="submit"
                        disabled={!authChecked}
                        className="w-full py-3 rounded-lg text-[14px] font-semibold disabled:opacity-60"
                        style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
                      >
                        Checking account…
                      </button>
                    ) : (
                      <div className="space-y-2 text-center">
                        <button
                          type="submit"
                          className="flex min-h-12 w-full items-center justify-center rounded-lg border border-[#E8E9EB] bg-white px-4 py-2"
                        >
                          <img
                            src="https://docs.escrowpay.app/brand/checkout-button/pay-with-escrowpay-dark@2x.png"
                            srcSet="https://docs.escrowpay.app/brand/checkout-button/pay-with-escrowpay-dark@1x.png 1x, https://docs.escrowpay.app/brand/checkout-button/pay-with-escrowpay-dark@2x.png 2x, https://docs.escrowpay.app/brand/checkout-button/pay-with-escrowpay-dark@3x.png 3x"
                            alt=""
                            aria-hidden="true"
                            height="40"
                          />
                        </button>
                        <p className="text-[11px] text-[#8A8D91]">
                          EscrowPay checkout is not configured yet.
                        </p>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            <aside
              className="rounded-lg overflow-hidden sticky top-20"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              <div className="p-5">
                <h2
                  className="text-[11px] font-medium tracking-widest uppercase mb-4"
                  style={{ color: "rgba(250,250,247,0.5)" }}
                >
                  Order Summary
                </h2>
                <div
                  className="mb-4 pb-4 border-b"
                  style={{ borderColor: "rgba(250,250,247,0.1)" }}
                >
                  <p className="text-[13px] font-semibold leading-tight">
                    {listing.title}
                  </p>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: "rgba(250,250,247,0.55)" }}
                  >
                    {listing.status}
                  </p>
                </div>
                <div
                  className="space-y-2 mb-4 pb-4 border-b"
                  style={{ borderColor: "rgba(250,250,247,0.1)" }}
                >
                  {[
                    {
                      label: `${isPackage ? "Packages" : "Tickets"} · ${qty}`,
                      value: formatNaira(subtotal),
                    },
                    {
                      label: "Service fees",
                      value: formatNaira(fees),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between text-[12px]"
                    >
                      <span style={{ color: "rgba(250,250,247,0.6)" }}>
                        {label}
                      </span>
                      <span
                        className="font-mono-data"
                        style={{ color: "rgba(250,250,247,0.8)" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-semibold">Total</span>
                  <span className="font-mono-data text-[16px] font-semibold">
                    {formatNaira(total)}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF7]" />}>
      <CheckoutPageContent />
    </Suspense>
  )
}
