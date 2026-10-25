"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "../../components/Header"

export default function CheckoutConfirmationPage() {
  const [orderRef, setOrderRef] = useState("")
  const [status, setStatus] = useState<"verification" | "payment" | "unknown">("unknown")
  const [expiresAt, setExpiresAt] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setOrderRef(params.get("orderId") ?? "")
    const status = params.get("status")
    setStatus(
      status === "verification-pending"
        ? "verification"
        : status === "payment-pending"
          ? "payment"
          : "unknown",
    )
    setExpiresAt(params.get("expiresAt") ?? "")
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />
      <main className="max-w-xl mx-auto px-6 py-16">
        <div
          className="bg-white border rounded-lg p-8 text-center"
          style={{ borderColor: "#E8E9EB" }}
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
            style={{
              backgroundColor: "#111111",
              color: "#FAFAF7",
            }}
          >
            …
          </div>
          <p
            className="text-[11px] font-medium tracking-widest uppercase"
            style={{ color: "#292B2F" }}
          >
            {status === "verification"
              ? "Identity verification pending"
              : status === "payment"
                ? "Payment processing"
                : "Order status not confirmed"}
          </p>
          <h1 className="mt-2 text-3xl font-bold" style={{ color: "#111111" }}>
            {status === "verification"
              ? "We’re reviewing your identity."
              : status === "payment"
                ? "Your payment is being processed."
                : "We can’t confirm your payment yet."}
          </h1>
          <p className="mt-3 text-[14px]" style={{ color: "#292B2F" }}>
            {status === "verification"
              ? "Your listing has been reserved while verification completes. We’ll email you when the order can proceed. No payment has been taken yet."
              : status === "payment"
                ? "The order was received, but the payment provider has not confirmed payment yet. We’ll email you when the order status updates."
                : "A payment-provider redirect or URL parameter is not proof of payment. Check your order or email for the latest backend-confirmed status. "}
            {orderRef && (
              <span className="font-mono-data font-semibold">{orderRef}</span>
            )}
          </p>
          {status === "verification" && expiresAt && (
            <p className="mt-3 text-[12px]" style={{ color: "#292B2F" }}>
              Reservation expires:{" "}
              {Number.isNaN(Date.parse(expiresAt))
                ? "time unavailable"
                : new Date(expiresAt).toLocaleString()}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-[14px] font-semibold"
              style={{
                borderColor: "#E8E9EB",
                color: "#111111",
                backgroundColor: "#FFFFFF",
              }}
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
