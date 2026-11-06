"use client"

import { formatNaira } from "../../../../lib/money"

export default function CheckoutOrderSummary({
  title,
  status,
  quantity,
  isPackage,
  subtotal,
  total,
}: {
  title: string
  status: string
  quantity: number
  isPackage: boolean
  subtotal: number
  total: number
}) {
  return (
    <aside
      className="sticky top-20 overflow-hidden rounded-lg"
      style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
    >
      <div className="p-5">
        <h2
          className="mb-4 text-[11px] font-medium tracking-widest uppercase"
          style={{ color: "rgba(250,250,247,0.5)" }}
        >
          Order Summary
        </h2>
        <div
          className="mb-4 border-b pb-4"
          style={{ borderColor: "rgba(250,250,247,0.1)" }}
        >
          <p className="text-[13px] leading-tight font-semibold">{title}</p>
          <p
            className="mt-0.5 text-[11px]"
            style={{ color: "rgba(250,250,247,0.55)" }}
          >
            {status}
          </p>
        </div>
        <div
          className="mb-4 space-y-2 border-b pb-4"
          style={{ borderColor: "rgba(250,250,247,0.1)" }}
        >
          <div className="flex justify-between text-[12px]">
            <span style={{ color: "rgba(250,250,247,0.6)" }}>
              Order amount · {quantity} {isPackage ? "package(s)" : "ticket(s)"}
            </span>
            <span
              className="font-mono-data"
              style={{ color: "rgba(250,250,247,0.8)" }}
            >
              {formatNaira(subtotal)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold">Total</span>
          <span className="font-mono-data text-[16px] font-semibold">
            {formatNaira(total)}
          </span>
        </div>
        <p
          className="mt-3 text-[11px]"
          style={{ color: "rgba(250,250,247,0.55)" }}
        >
          The order amount is based on the listing price. Your payment provider
          may add its own processing fee before payment.
        </p>
      </div>
    </aside>
  )
}
