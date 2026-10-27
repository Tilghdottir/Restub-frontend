"use client"

import Link from "next/link"
import AccountSidebar from "../../../components/AccountSidebar"
import { useEffect, useState } from "react"
import { useAuth } from "../../../hooks/useAuth"
import { formatNaira } from "../../../lib/money"
import { getApiErrorMessage } from "../../../lib/rtk-api"
import {
  useAcceptOrderDeliveryMutation,
  useGetEscrowOperationStatusQuery,
  useGetOrderDeliveryQuery,
  useGetOrderDetailQuery,
  useReleaseOrderEscrowMutation,
} from "../../../lib/orders/rtk"

export default function PurchaseDetailContent({
  orderId,
}: {
  orderId: string
}) {
  const { data: order, isLoading, error } = useGetOrderDetailQuery(orderId)
  const { user } = useAuth()
  const [acceptDelivery, { isLoading: accepting }] =
    useAcceptOrderDeliveryMutation()
  const [releaseEscrow, { isLoading: releasing }] =
    useReleaseOrderEscrowMutation()
  const [actionError, setActionError] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const canCheckEscrow =
    order?.status === "paid" || order?.status === "fulfilled"
  const {
    data: escrow,
    isFetching: checkingEscrow,
    error: escrowError,
    refetch: refetchEscrow,
  } = useGetEscrowOperationStatusQuery(orderId, {
    skip: !canCheckEscrow,
    refetchOnMountOrArgChange: true,
  })
  const escrowPending = Boolean(
    escrow &&
      (escrow.escrowStatus === "release_pending" ||
        escrow.escrowStatus === "refund_pending" ||
        escrow.releaseStatus === "pending" ||
        escrow.refundStatus === "pending"),
  )
  const isBuyer = Boolean(order && user?.id === order.buyerId)
  const isSeller = Boolean(order && user?.id === order.sellerId)
  const { data: delivery, error: deliveryError } = useGetOrderDeliveryQuery(
    orderId,
    {
      skip:
        !order ||
        !isBuyer ||
        !order.manualDelivery ||
        !order.manualDeliverySubmittedAt,
    },
  )

  useEffect(() => {
    if (!canCheckEscrow || !escrowPending) return
    const interval = setInterval(() => {
      void refetchEscrow()
    }, 5000)
    return () => clearInterval(interval)
  }, [canCheckEscrow, escrowPending, refetchEscrow])

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
        <AccountSidebar />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-[14px]" style={{ color: "#292B2F" }}>
            Loading order details…
          </p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
        <AccountSidebar />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-[14px]" style={{ color: "#292B2F" }}>
            Unable to load order details.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <AccountSidebar />

      <main className="lg:ml-64 max-w-4xl mx-auto px-6 py-8">
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
                  {order.quantity} × {formatNaira(order.unitPrice)}
                </span>
                <span className="font-mono-data">
                  {formatNaira(order.subtotal)}
                </span>
              </div>
            </div>
            <div
              className="mt-4 pt-4 border-t flex justify-between items-center"
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

        {(order.manualDelivery || canCheckEscrow) && (
          <section
            className="mt-6 bg-white border rounded-lg p-6"
            style={{ borderColor: "#E8E9EB" }}
          >
            <h2
              className="text-[16px] font-semibold"
              style={{ color: "#111111" }}
            >
              Delivery and escrow
            </h2>
            {order.manualDelivery && (
              <p className="text-[13px] mt-2" style={{ color: "#292B2F" }}>
                {order.manualDeliveryAcceptedAt
                  ? `Delivery accepted ${new Date(order.manualDeliveryAcceptedAt).toLocaleString()}.`
                  : order.manualDeliverySubmittedAt
                    ? "The seller submitted the tickets. Review the files and accept delivery when satisfied."
                    : "Waiting for the seller to deliver the tickets."}
              </p>
            )}
            {canCheckEscrow && (
              <p className="text-[13px] mt-2" style={{ color: "#292B2F" }}>
                Escrow status:{" "}
                {escrow?.escrowStatus.replace(/_/g, " ") ??
                  (checkingEscrow ? "checking…" : "unavailable")}
                {escrow?.releaseStatus
                  ? ` · Release: ${escrow.releaseStatus.replace(/_/g, " ")}`
                  : ""}
                {escrow?.refundStatus
                  ? ` · Refund: ${escrow.refundStatus.replace(/_/g, " ")}`
                  : ""}
              </p>
            )}
            {escrowError && (
              <p role="alert" className="text-[13px] mt-2 text-red-800">
                {getApiErrorMessage(
                  escrowError,
                  "Unable to load escrow status.",
                )}
              </p>
            )}
            {deliveryError && (
              <p role="alert" className="text-[13px] mt-2 text-red-800">
                {getApiErrorMessage(
                  deliveryError,
                  "Unable to load delivered ticket files.",
                )}
              </p>
            )}
            {delivery?.tickets.map((ticket) => (
              <a
                key={ticket.slotIndex}
                href={ticket.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex mt-3 mr-3 text-[13px] underline underline-offset-2"
                style={{ color: "#111111" }}
              >
                Download ticket {ticket.slotIndex}
              </a>
            ))}
            {actionError && (
              <p role="alert" className="text-[13px] text-red-800 mt-3">
                {actionError}
              </p>
            )}
            {actionMessage && (
              <p role="status" className="text-[13px] text-green-800 mt-3">
                {actionMessage}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              {isBuyer &&
                order.manualDelivery &&
                order.status === "paid" &&
                order.manualDeliverySubmittedAt &&
                !order.manualDeliveryAcceptedAt && (
                  <button
                    type="button"
                    disabled={accepting}
                    onClick={async () => {
                      setActionError("")
                      setActionMessage("")
                      try {
                        await acceptDelivery(order.id).unwrap()
                        setActionMessage("Delivery accepted.")
                      } catch (reason) {
                        setActionError(
                          getApiErrorMessage(
                            reason,
                            "Unable to accept delivery.",
                          ),
                        )
                      }
                    }}
                    className="px-5 py-3 rounded-lg text-[13px] font-semibold disabled:opacity-60"
                    style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
                  >
                    {accepting ? "Accepting…" : "Accept ticket delivery"}
                  </button>
                )}
              {isSeller &&
                canCheckEscrow &&
                escrow?.escrowStatus === "hold" && (
                  <button
                    type="button"
                    disabled={releasing || escrow.releaseStatus === "pending"}
                    onClick={async () => {
                      setActionError("")
                      setActionMessage("")
                      try {
                        await releaseEscrow({ orderId: order.id }).unwrap()
                        setActionMessage(
                          "Release started. The provider may take time to confirm settlement.",
                        )
                      } catch (reason) {
                        setActionError(
                          getApiErrorMessage(
                            reason,
                            "Unable to release escrow.",
                          ),
                        )
                      }
                    }}
                    className="px-5 py-3 rounded-lg text-[13px] font-semibold disabled:opacity-60"
                    style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
                  >
                    {releasing || escrow.releaseStatus === "pending"
                      ? "Release pending…"
                      : "Release escrow"}
                  </button>
                )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
