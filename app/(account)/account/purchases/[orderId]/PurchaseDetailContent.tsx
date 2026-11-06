"use client"

import Link from "next/link"
import AccountSidebar from "../../../../../components/account/AccountSidebar"
import { useEffect, useState } from "react"
import { useAuth } from "../../../../hooks/useAuth"
import { formatNaira } from "../../../../../lib/money"
import { getApiErrorMessage } from "../../../../../lib/rtk-api"
import {
  useAcceptOrderDeliveryMutation,
  useGetEscrowOperationStatusQuery,
  useGetOrderDeliveryQuery,
  useGetOrderDetailQuery,
  useReleaseOrderEscrowMutation,
  useDeliverManualOrderTicketMutation,
} from "../../../../../lib/orders/rtk"
import { useOpenDisputeMutation } from "../../../../../lib/disputes/rtk"
import { getSupportMailto } from "../../../../../lib/support"
import PurchaseOrderOverview from "./_components/PurchaseOrderOverview"
import PurchaseTicketProblem from "./_components/PurchaseTicketProblem"
import ManualTicketDeliverySlots from "./_components/ManualTicketDeliverySlots"

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
  const [openDispute, { isLoading: openingDispute }] = useOpenDisputeMutation()
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
  const submitTicketProblem = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (!order) return
    setDisputeError("")
    setDisputeMessage("")
    try {
      const dispute = await openDispute({
        orderId: order.id,
        reason: disputeReason.trim(),
      }).unwrap()
      setShowDisputeForm(false)
      setDisputeReason("")
      setDisputeMessage(`Your report was submitted. Reference: ${dispute.id}`)
    } catch (reason) {
      setDisputeError(
        getApiErrorMessage(reason, "Unable to submit your ticket problem."),
      )
    }
  }
  const uploadDeliveryTicket = async (slot: number) => {
    const file = deliveryFiles[slot]
    if (!file || !order) return
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
        getApiErrorMessage(reason, `Unable to deliver ticket ${slot}.`),
      )
    } finally {
      setUploadingSlot(null)
    }
  }
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

        <PurchaseOrderOverview order={order} />

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
                <ManualTicketDeliverySlots
                  quantity={order.quantity}
                  ticketDeliveries={order.ticketDeliveries}
                  files={deliveryFiles}
                  uploadingSlot={uploadingSlot}
                  onFileChange={(slot, file) =>
                    setDeliveryFiles((current) => {
                      const next = { ...current }
                      if (file) next[slot] = file
                      else delete next[slot]
                      return next
                    })
                  }
                  onUpload={(slot) => void uploadDeliveryTicket(slot)}
                />
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
          <PurchaseTicketProblem
            orderStatus={order.status}
            canOpenDispute={canOpenDispute}
            showForm={showDisputeForm}
            reason={disputeReason}
            submitting={openingDispute}
            error={disputeError}
            message={disputeMessage}
            supportMailto={getSupportMailto(order.id)}
            onShowForm={() => setShowDisputeForm(true)}
            onReasonChange={setDisputeReason}
            onSubmit={submitTicketProblem}
            onCancel={() => {
              setShowDisputeForm(false)
              setDisputeReason("")
              setDisputeError("")
            }}
          />
        )}
      </main>
    </div>
  )
}
