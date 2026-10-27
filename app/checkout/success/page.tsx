"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "../../components/Header"
import { useAuth } from "../../hooks/useAuth"
import { useLazyGetOrderDetailQuery } from "../../lib/orders/rtk"

type PaymentResult = "checking" | "confirmed" | "pending" | "cancelled" | "error"

export default function CheckoutSuccessPage() {
  const [fetchOrder] = useLazyGetOrderDetailQuery()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [orderId, setOrderId] = useState("")
  const [result, setResult] = useState<PaymentResult>("checking")

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("orderId") ?? ""
    setOrderId(id)

    if (!id) {
      setResult("error")
      return
    }

    if (authLoading) return

    if (!isAuthenticated) {
      setResult("pending")
      return
    }

    let active = true
    let attempts = 0
    let timer: ReturnType<typeof setTimeout>

    const checkOrder = async () => {
      try {
        const order = await fetchOrder(id).unwrap()
        if (!active) return

        if (order.status === "paid" || order.status === "fulfilled") {
          setResult("confirmed")
          return
        }
        if (order.status === "cancelled") {
          setResult("cancelled")
          return
        }
        attempts += 1
        if (attempts >= 20) {
          setResult("pending")
          return
        }
        timer = setTimeout(checkOrder, 3000)
      } catch {
        if (active) setResult("error")
      }
    }

    void checkOrder()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [authLoading, fetchOrder, isAuthenticated])

  const copy = {
    checking: {
      eyebrow: "Checking payment",
      title: "Confirming your order status.",
      body: "We’re checking the latest order status with ReStub. This can take a few moments.",
    },
    confirmed: {
      eyebrow: "Payment confirmed",
      title: "Your payment has been confirmed.",
      body: "The backend reports this order as paid. Your order reference is",
    },
    pending: {
      eyebrow: "Payment processing",
      title: "Your payment is not confirmed yet.",
      body: "The payment provider returned you to ReStub, but that redirect alone does not confirm payment. Check your email or account for the updated order status.",
    },
    cancelled: {
      eyebrow: "Order cancelled",
      title: "This order was not completed.",
      body: "The backend reports that this order was cancelled. You can return to listings and try again.",
    },
    error: {
      eyebrow: "Status unavailable",
      title: "We couldn’t verify your payment status.",
      body: "No payment success has been assumed. Check your order status or email before trying checkout again.",
    },
  }[result]

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />
      <main className="max-w-xl mx-auto px-6 py-16">
        <div
          className="bg-white border rounded-lg p-8 text-center"
          style={{ borderColor: "#E8E9EB" }}
        >
          <p
            className="text-[11px] font-medium tracking-widest uppercase"
            style={{ color: "#292B2F" }}
          >
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold" style={{ color: "#111111" }}>
            {copy.title}
          </h1>
          <p className="mt-3 text-[14px]" style={{ color: "#292B2F" }}>
            {copy.body}{" "}
            {result === "confirmed" && orderId && (
              <span className="font-mono-data font-semibold">{orderId}</span>
            )}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {result === "confirmed" && (
              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-[14px] font-semibold"
                style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
              >
                View my order
              </Link>
            )}
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
