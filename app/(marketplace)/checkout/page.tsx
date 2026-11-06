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
import BrandLogo from "../../../components/ui/BrandLogo"
import Header from "../../../components/ui/Header"
import CheckoutOrderSummary from "./_components/CheckoutOrderSummary"
import CheckoutOrderConfirmation from "./_components/CheckoutOrderConfirmation"
import CheckoutReviewSection from "./_components/CheckoutReviewSection"
import CheckoutIdentityDetails, {
  type CheckoutIdType,
} from "./_components/CheckoutIdentityDetails"
import CheckoutContactFields from "./_components/CheckoutContactFields"
import { useAuth } from "../../hooks/useAuth"
import { getApiErrorMessage } from "../../../lib/rtk-api"
import { useLazyGetListingByIdQuery } from "../../../lib/listings/rtk"
import { isTicketPackage } from "../../../lib/listings/ticket-types"
import { useSubmitCheckoutMutation } from "../../../lib/orders/rtk"
import type { ListingDetail } from "../../../lib/listings/models"

const STEPS = ["Review", "Contact Details", "Confirmation"] as const
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
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authChecked = !authLoading
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
  const [id_type, setIdType] = useState<CheckoutIdType | "">("")
  const [id_number, setIdNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [identityConsent, setIdentityConsent] = useState(false)
  const [identityRequired, setIdentityRequired] = useState(false)
  const [accountKycRequired, setAccountKycRequired] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState("")

  const idempotencyKey = useRef<string | null>(null)
  const resetIdempotencyKey = () => {
    idempotencyKey.current = null
  }

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
  const total = subtotal
  const isPackage = isTicketPackage(listing?.ticketType)

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

  const handleDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!listingIdFromQuery) {
      setSubmitError(
        "Checkout requires a backend listing ID. Start from a listing detail page.",
      )
      return
    }
    const contactErrors = validateContact()
    const hasGuestIdentityDetails = Boolean(
      id_type || id_number.trim() || dateOfBirth || identityConsent,
    )
    const kycErrors =
      !isAuthenticated && (identityRequired || hasGuestIdentityDetails)
        ? validateGuestKyc()
        : {}
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

      const checkoutUrl = response.checkoutUrl ?? null
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
      const message = getApiErrorMessage(
        error,
        "Checkout could not be completed. Please try again.",
      )
      if (
        /Guest checkout requires BVN or NIN details|Retrying guest checkout verification requires the original identity details and consent/i.test(
          message,
        )
      ) {
        setIdentityRequired(true)
      } else if (
        isAuthenticated &&
        /^Complete EscrowPay identity verification before checkout/i.test(
          message,
        )
      ) {
        setAccountKycRequired(true)
      }
      setSubmitError(message)
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

  if (listing.status !== "published" || listing.quantity < 1) {
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        <Header />
        <main className="max-w-xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-[#111111]">
            This listing is no longer available
          </h1>
          <p className="mt-3 text-[14px] text-[#292B2F]">
            Choose another listing to continue.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block text-[13px] underline text-[#111111]"
          >
            Browse listings
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
          <CheckoutOrderConfirmation
            listing={listing}
            quantity={qty}
            total={total}
            orderReference={orderRef}
          />
        ) : (
          <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
            <div>
              {step === 0 && (
                <CheckoutReviewSection
                  listing={listing}
                  quantity={qty}
                  onQuantityChange={(quantity) => {
                    resetIdempotencyKey()
                    setQty(quantity)
                  }}
                  onContinue={() => setStep(1)}
                />
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
                    <CheckoutContactFields
                      firstName={firstName}
                      lastName={lastName}
                      email={customerEmail}
                      phone={phone}
                      errors={errors}
                      onFirstNameChange={(value) => {
                        resetIdempotencyKey()
                        setFirstName(value)
                      }}
                      onLastNameChange={(value) => {
                        resetIdempotencyKey()
                        setLastName(value)
                      }}
                      onEmailChange={(value) => {
                        resetIdempotencyKey()
                        setCustomerEmail(value)
                      }}
                      onPhoneChange={(value) => {
                        resetIdempotencyKey()
                        setPhone(value)
                      }}
                    />

                    <CheckoutIdentityDetails
                      authChecked={authChecked}
                      isAuthenticated={isAuthenticated}
                      identityRequired={identityRequired}
                      idType={id_type}
                      dateOfBirth={dateOfBirth}
                      idNumber={id_number}
                      identityConsent={identityConsent}
                      errors={errors}
                      onIdTypeChange={(value) => {
                        resetIdempotencyKey()
                        setIdType(value)
                      }}
                      onDateOfBirthChange={(value) => {
                        resetIdempotencyKey()
                        setDateOfBirth(value)
                      }}
                      onIdNumberChange={(value) => {
                        resetIdempotencyKey()
                        setIdNumber(value.replace(/\D/g, "").slice(0, 11))
                      }}
                      onIdentityConsentChange={(value) => {
                        resetIdempotencyKey()
                        setIdentityConsent(value)
                      }}
                    />

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
                        {accountKycRequired && (
                          <Link
                            href="/kyc"
                            className="ml-1 font-semibold underline underline-offset-2"
                          >
                            Complete account verification
                          </Link>
                        )}
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
                          disabled={loading}
                          className="w-full py-3 rounded-lg text-[14px] font-semibold disabled:opacity-60"
                          style={{
                            backgroundColor: "#111111",
                            color: "#FAFAF7",
                          }}
                        >
                          {loading
                            ? "Starting checkout…"
                            : "Continue to secure checkout"}
                        </button>
                        <p className="text-[11px] text-[#8A8D91]">
                          You’ll continue with the payment provider selected for
                          this checkout.
                        </p>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            <CheckoutOrderSummary
              title={listing.title}
              status={listing.status}
              quantity={qty}
              isPackage={isPackage}
              subtotal={subtotal}
              total={total}
            />
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
