"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "../../components/Header"

export default function CheckoutConfirmationPage() {
  const [orderRef, setOrderRef] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setOrderRef(params.get("orderId") ?? "RC-7F3K9Q")
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
            style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
          >
            ✓
          </div>
          <p
            className="text-[11px] font-medium tracking-widest uppercase"
            style={{ color: "#292B2F" }}
          >
            Order confirmed
          </p>
          <h1 className="mt-2 text-3xl font-bold" style={{ color: "#111111" }}>
            Your tickets are on the way.
          </h1>
          <p className="mt-3 text-[14px]" style={{ color: "#292B2F" }}>
            A confirmation email has been sent and your order reference is{" "}
            <span className="font-mono-data font-semibold">{orderRef}</span>.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/account"
              className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-[14px] font-semibold"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              View my order
            </Link>
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
