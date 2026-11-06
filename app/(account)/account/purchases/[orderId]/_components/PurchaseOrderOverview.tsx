import { formatNaira } from "../../../../../../lib/money"
import type { OrderDetailResponse } from "../../../../../../lib/orders/models"

export default function PurchaseOrderOverview({
  order,
}: {
  order: OrderDetailResponse
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div
        className="rounded-lg border bg-white p-6"
        style={{ borderColor: "#E8E9EB" }}
      >
        <p
          className="mb-3 text-[11px] font-medium uppercase tracking-widest"
          style={{ color: "#292B2F" }}
        >
          {order.status}
        </p>
        <h2 className="mb-2 text-[22px] font-bold" style={{ color: "#111111" }}>
          {order.eventTitle}
        </h2>
        <p className="text-[14px]" style={{ color: "#292B2F" }}>
          {order.eventDate} · {order.venue}
        </p>

        <div className="mt-6 border-t pt-5" style={{ borderColor: "#E8E9EB" }}>
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

      <aside className="sticky top-20 rounded-lg bg-[#111111] p-5 text-[#FAFAF7]">
        <h2
          className="mb-4 text-[11px] font-medium uppercase tracking-widest"
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
              {order.quantity} × {formatNaira(order.unitPrice)}
            </span>
            <span className="font-mono-data">
              {formatNaira(order.subtotal)}
            </span>
          </div>
        </div>
        <div
          className="mt-4 flex items-center justify-between border-t pt-4"
          style={{ borderColor: "rgba(250,250,247,0.08)" }}
        >
          <span className="text-[14px] font-semibold">Total</span>
          <span className="font-mono-data text-[18px] font-bold">
            {formatNaira(order.total)}
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
  )
}
