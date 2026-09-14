"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "../../../components/Header"
import { apiClient } from "../../../lib/api"
import type { OrderDetailResponse } from "../../../lib/api-types"

export default function PurchaseDetailContent({
  orderId,
}: {
  orderId: string
}) {
  const [order, setOrder] = useState<OrderDetailResponse | null>(null)

  useEffect(() => {
    void apiClient.getOrderDetail(orderId).then(setOrder)
  }, [orderId])

  if (!order) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-[14px]" style={{ color: "#292B2F" }}>
            Loading order details…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link
            href="/account"
            className="text-[13px] underline underline-offset-2"
            style={{ color: "#111111" }}
          >
            Back to account
          </Link>
          <h1 className="mt-3 text-3xl font-bold" style={{ color: "#111111" }}>
            Order {orderId}
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            className="bg-white border rounded-lg p-6"
            style={{ borderColor: "#E8E9EB" }}
          >
            <p
              className="text-[11px] font-medium tracking-widest uppercase mb-3"
              style={{ color: "#292B2F" }}
            >
              {order.status}
            </p>
            <h2
              className="text-[22px] font-bold mb-2"
              style={{ color: "#111111" }}
            >
              {order.eventTitle}
            </h2>
            <p className="text-[14px]" style={{ color: "#292B2F" }}>
              {order.eventDate} · {order.venue}
            </p>

            <div
              className="mt-6 border-t pt-5"
              style={{ borderColor: "#E8E9EB" }}
            >
              <div className="space-y-3 text-[13px]">
                {[
                  ["Section", order.section],
                  ["Row / Seats", `Row ${order.row} · ${order.seats}`],
                  [
                    "Quantity",
                    `${order.quantity} ticket${order.quantity > 1 ? "s" : ""}`,
                  ],
                  ["Delivery", order.deliveryMethod],
                  ["Placed", new Date(order.createdAt).toLocaleString()],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="flex items-center justify-between gap-4"
                  >
                    <span style={{ color: "#292B2F" }}>{label}</span>
                    <span
                      className="font-mono-data font-medium"
                      style={{ color: "#111111" }}
                    >
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="bg-[#111111] text-[#FAFAF7] rounded-lg p-5 sticky top-20">
            <h2
              className="text-[11px] font-medium tracking-widest uppercase mb-4"
              style={{ color: "rgba(250,250,247,0.5)" }}
            >
              Order total
            </h2>
            <div
              className="space-y-2 text-[12px]"
              style={{ color: "rgba(250,250,247,0.7)" }}
            >
              <div className="flex justify-between">
                <span>
                  {order.quantity} × ${order.unitPrice.toLocaleString()}
                </span>
                <span className="font-mono-data">
                  ${order.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service fees</span>
                <span className="font-mono-data">
                  ${order.fees.toLocaleString()}
                </span>
              </div>
            </div>
            <div
              className="mt-4 pt-4 border-t flex justify-between items-center"
              style={{ borderColor: "rgba(250,250,247,0.08)" }}
            >
              <span className="text-[14px] font-semibold">Total</span>
              <span className="font-mono-data text-[18px] font-bold">
                ${order.total.toLocaleString()}
              </span>
            </div>
            <p
              className="mt-4 text-[11px]"
              style={{ color: "rgba(250,250,247,0.5)" }}
            >
              If something changes, our support team will update you by email.
            </p>
          </aside>
        </div>
      </main>
    </div>
  )
}
