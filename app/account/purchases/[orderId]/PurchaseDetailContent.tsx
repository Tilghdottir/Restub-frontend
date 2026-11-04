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
  useDeliverManualOrderTicketMutation,
} from "../../../lib/orders/rtk"
import { useOpenDisputeMutation } from "../../../lib/disputes/rtk"
import { getSupportMailto } from "../../../lib/support"

export default function PurchaseDetailContent({
  orderId,
}: {
  orderId: string
}) {
  const {
    data: order,
    isLoading,
    error,
    refetch: refetchOrder,
  } = useGetOrderDetailQuery(orderId)
  const { user } = useAuth()
  const [acceptDelivery, { isLoading: accepting }] =
    useAcceptOrderDeliveryMutation()
  const [releaseEscrow, { isLoading: releasing }] =
    useReleaseOrderEscrowMutation()
  const [deliverTicket] = useDeliverManualOrderTicketMutation()
  const [openDispute, { isLoading: openingDispute }] =
    useOpenDisputeMutation()
  const [actionError, setActionError] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [disputeReason, setDisputeReason] = useState("")
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeError, setDisputeError] = useState("")
  const [disputeMessage, setDisputeMessage] = useState("")
  const [deliveryFiles, setDeliveryFiles] = useState<Record<number, File>>({})
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
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
  const canOpenDispute =
    isBuyer && (order?.status === "paid" || order?.status === "fulfilled")
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
                    ? delivery?.tickets.length === order.quantity
                      ? "Your tickets are ready to download below. Review the files and accept delivery when satisfied."
                      : "The seller submitted the tickets. Secure download links are being prepared."
                    : "Waiting for the seller to deliver the tickets."}
              </p>
            )}
            {isBuyer && !order.manualDelivery && canCheckEscrow && (
              <p className="text-[13px] mt-2" style={{ color: "#292B2F" }}>
                This order uses email delivery. Check the inbox for the address
                used at checkout, including its spam folder, for your ticket.
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
            {isSeller &&
              order.manualDelivery &&
              order.status === "paid" &&
              !order.manualDeliverySubmittedAt && (
                <div className="mt-5 border-t border-[#E8E9EB] pt-4">
                  <h3 className="text-[14px] font-semibold text-[#111111]">
                    Deliver tickets
                  </h3>
                  <p className="mt-1 text-[12px] text-[#292B2F]">
                    Upload a PDF, JPEG, or PNG for each ticket. Files must be 5
                    MB or smaller. The buyer can access them after every ticket
                    is delivered.
                  </p>
                  <div className="mt-3 space-y-3">
                    {Array.from(
                      { length: order.quantity },
                      (_, index) => index + 1,
                    ).map((slot) => {
                      const delivered = order.ticketDeliveries.some(
                        (item) => item.slotIndex === slot && item.deliveredAt,
                      )
                      return (
                        <div
                          key={slot}
                          className="flex flex-col gap-3 rounded-lg border border-[#E8E9EB] p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-[12px] font-medium text-[#111111]">
                              Ticket {slot}
                            </p>
                            {delivered ? (
                              <p className="mt-1 text-[11px] text-[#292B2F]">
                                Delivered
                              </p>
                            ) : (
                              <input
                                type="file"
                                accept="application/pdf,image/jpeg,image/png"
                                aria-label={`Choose ticket ${slot} file`}
                                onChange={(event) => {
                                  const file = event.currentTarget.files?.[0]
                                  setDeliveryFiles((current) => {
                                    const next = { ...current }
                                    if (file) next[slot] = file
                                    else delete next[slot]
                                    return next
                                  })
                                }}
                                className="mt-1 block max-w-full text-[11px] text-[#292B2F]"
                              />
                            )}
                          </div>
                          {!delivered ? (
                            <button
                              type="button"
                              disabled={
                                !deliveryFiles[slot] || uploadingSlot !== null
                              }
                              onClick={async () => {
                                const file = deliveryFiles[slot]
                                if (!file) return
                                setActionError("")
                                setActionMessage("")
                                setUploadingSlot(slot)
                                try {
                                  await deliverTicket({
                                    orderId: order.id,
                                    slotIndex: slot,
                                    file,
                                  }).unwrap()
                                  setDeliveryFiles((current) => {
                                    const next = { ...current }
                                    delete next[slot]
                                    return next
                                  })
                                  await refetchOrder()
                                  setActionMessage(`Ticket ${slot} delivered.`)
                                } catch (reason) {
                                  setActionError(
                                    getApiErrorMessage(
                                      reason,
                                      `Unable to deliver ticket ${slot}.`,
                                    ),
                                  )
                                } finally {
                                  setUploadingSlot(null)
                                }
                              }}
                              className="shrink-0 rounded-lg bg-[#111111] px-4 py-2.5 text-[12px] font-semibold text-[#FAFAF7] disabled:opacity-50"
                            >
                              {uploadingSlot === slot
                                ? "Uploading…"
                                : "Upload ticket"}
                            </button>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
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
        {isBuyer && (
          <section
            className="mt-6 bg-white border rounded-lg p-6"
            style={{ borderColor: "#E8E9EB" }}
          >
            <h2
              className="text-[16px] font-semibold"
              style={{ color: "#111111" }}
            >
              Problem with your ticket?
            </h2>
            {order.status === "disputed" ? (
              <p className="mt-2 text-[13px]" style={{ color: "#292B2F" }}>
                A dispute is already open for this order. Our team will review
                it and follow up by email.
              </p>
            ) : canOpenDispute ? (
              <>
                <p className="mt-2 text-[13px]" style={{ color: "#292B2F" }}>
                  Report a missing, incorrect, or unusable ticket. Opening a
                  dispute pauses order settlement while our team reviews it.
                </p>
                {!showDisputeForm ? (
                  <button
                    type="button"
                    onClick={() => setShowDisputeForm(true)}
                    className="mt-4 rounded-lg border px-4 py-2.5 text-[13px] font-semibold"
                    style={{ borderColor: "#E8E9EB", color: "#111111" }}
                  >
                    Report a ticket problem
                  </button>
                ) : (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={async (event) => {
                      event.preventDefault()
                      setDisputeError("")
                      setDisputeMessage("")
                      try {
                        const dispute = await openDispute({
                          orderId: order.id,
                          reason: disputeReason.trim(),
                        }).unwrap()
                        setShowDisputeForm(false)
                        setDisputeReason("")
                        setDisputeMessage(
                          `Your report was submitted. Reference: ${dispute.id}`,
                        )
                      } catch (reason) {
                        setDisputeError(
                          getApiErrorMessage(
                            reason,
                            "Unable to submit your ticket problem.",
                          ),
                        )
                      }
                    }}
                  >
                    <label className="block text-[12px] font-medium text-[#111111]">
                      What went wrong?
                      <textarea
                        required
                        minLength={1}
                        maxLength={2000}
                        value={disputeReason}
                        onChange={(event) =>
                          setDisputeReason(event.target.value)
                        }
                        rows={4}
                        className="mt-1.5 w-full resize-y rounded-lg border px-3 py-2.5 text-[13px]"
                        style={{
                          borderColor: "#E8E9EB",
                          backgroundColor: "#FAFAF7",
                        }}
                      />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={openingDispute || !disputeReason.trim()}
                        className="rounded-lg px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60"
                        style={{
                          backgroundColor: "#111111",
                          color: "#FAFAF7",
                        }}
                      >
                        {openingDispute ? "Submitting…" : "Submit report"}
                      </button>
                      <button
                        type="button"
                        disabled={openingDispute}
                        onClick={() => {
                          setShowDisputeForm(false)
                          setDisputeReason("")
                          setDisputeError("")
                        }}
                        className="rounded-lg border px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60"
                        style={{ borderColor: "#E8E9EB", color: "#111111" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <p className="mt-2 text-[13px]" style={{ color: "#292B2F" }}>
                Ticket problems can be reported after payment is confirmed.
                Check the order status and your email for updates.
              </p>
            )}
            {disputeError && (
              <p role="alert" className="mt-3 text-[13px] text-red-800">
                {disputeError}
              </p>
            )}
            {disputeMessage && (
              <p role="status" className="mt-3 text-[13px] text-green-800">
                {disputeMessage}
              </p>
            )}
            <p className="mt-4 text-[13px]" style={{ color: "#292B2F" }}>
              Prefer email?{" "}
              <a
                href={getSupportMailto(order.id)}
                className="font-semibold underline underline-offset-2 text-[#111111]"
              >
                Contact buyer support
              </a>
              .
            </p>
          </section>
        )}
      </main>
    </div>
  )
}
