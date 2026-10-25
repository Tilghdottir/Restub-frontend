"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "../../components/Header"

export default function CheckoutCancelPage() {
  const [orderId, setOrderId] = useState("")

  useEffect(() => {
    setOrderId(new URLSearchParams(window.location.search).get("orderId") ?? "")
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />
      <main className="max-w-xl mx-auto px-6 py-16">
        <div className="bg-white border rounded-lg p-8 text-center" style={{ borderColor: "#E8E9EB" }}>
          <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: "#292B2F" }}>
            Checkout cancelled
          </p>
          <h1 className="mt-2 text-3xl font-bold" style={{ color: "#111111" }}>
            Payment was not confirmed.
          </h1>
          <p className="mt-3 text-[14px]" style={{ color: "#292B2F" }}>
            You returned from EscrowPay without completing checkout. This redirect does not establish
            the backend order status. Check your account or email before starting another payment.
          </p>
          {orderId && (
            <p className="mt-3 text-[12px]" style={{ color: "#292B2F" }}>
              Order reference: <span className="font-mono-data">{orderId}</span>
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/account"
              className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-[14px] font-semibold"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              Check my orders
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border px-5 py-3 text-[14px] font-semibold"
              style={{ borderColor: "#E8E9EB", color: "#111111", backgroundColor: "#FFFFFF" }}
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
