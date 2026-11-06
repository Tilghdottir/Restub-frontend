"use client"

import type {
  EscrowOperationStatus,
  OrderDeliveryResponse,
  OrderDetailResponse,
} from "../../../../../../lib/orders/models"
import { getApiErrorMessage } from "../../../../../../lib/rtk-api"
import ManualTicketDeliverySlots from "./ManualTicketDeliverySlots"

export default function PurchaseDeliveryEscrow({
  order,
  isBuyer,
  isSeller,
  canCheckEscrow,
  escrow,
  checkingEscrow,
  escrowError,
  delivery,
  deliveryError,
  deliveryFiles,
  uploadingSlot,
  actionError,
  actionMessage,
  accepting,
  releasing,
  onFileChange,
  onUpload,
  onAcceptDelivery,
  onReleaseEscrow,
}: {
  order: OrderDetailResponse
  isBuyer: boolean
  isSeller: boolean
  canCheckEscrow: boolean
  escrow: EscrowOperationStatus | undefined
  checkingEscrow: boolean
  escrowError: unknown
  delivery: OrderDeliveryResponse | undefined
  deliveryError: unknown
  deliveryFiles: Record<number, File>
  uploadingSlot: number | null
  actionError: string
  actionMessage: string
  accepting: boolean
  releasing: boolean
  onFileChange: (slot: number, file?: File) => void
  onUpload: (slot: number) => void
  onAcceptDelivery: () => void
  onReleaseEscrow: () => void
}) {
  return (
    <section
      className="mt-6 rounded-lg border bg-white p-6"
      style={{ borderColor: "#E8E9EB" }}
    >
      <h2 className="text-[16px] font-semibold text-[#111111]">
        Delivery and escrow
      </h2>
      {order.manualDelivery ? (
        <p className="mt-2 text-[13px] text-[#292B2F]">
          {order.manualDeliveryAcceptedAt
            ? `Delivery accepted ${new Date(order.manualDeliveryAcceptedAt).toLocaleString()}.`
            : order.manualDeliverySubmittedAt
              ? delivery?.tickets.length === order.quantity
                ? "Your tickets are ready to download below. Review the files and accept delivery when satisfied."
                : "The seller submitted the tickets. Secure download links are being prepared."
              : "Waiting for the seller to deliver the tickets."}
        </p>
      ) : null}
      {isBuyer && !order.manualDelivery && canCheckEscrow ? (
        <p className="mt-2 text-[13px] text-[#292B2F]">
          This order uses email delivery. Check the inbox for the address used
          at checkout, including its spam folder, for your ticket.
        </p>
      ) : null}
      {canCheckEscrow ? (
        <p className="mt-2 text-[13px] text-[#292B2F]">
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
      ) : null}
      {escrowError ? (
        <p role="alert" className="mt-2 text-[13px] text-red-800">
          {getApiErrorMessage(escrowError, "Unable to load escrow status.")}
        </p>
      ) : null}
      {deliveryError ? (
        <p role="alert" className="mt-2 text-[13px] text-red-800">
          {getApiErrorMessage(
            deliveryError,
            "Unable to load delivered ticket files.",
          )}
        </p>
      ) : null}
      {delivery?.tickets.map((ticket) => (
        <a
          key={ticket.slotIndex}
          href={ticket.url}
          target="_blank"
          rel="noreferrer"
          className="mr-3 mt-3 inline-flex text-[13px] underline underline-offset-2 text-[#111111]"
        >
          Download ticket {ticket.slotIndex}
        </a>
      ))}
      {isSeller &&
      order.manualDelivery &&
      order.status === "paid" &&
      !order.manualDeliverySubmittedAt ? (
        <ManualTicketDeliverySlots
          quantity={order.quantity}
          ticketDeliveries={order.ticketDeliveries}
          files={deliveryFiles}
          uploadingSlot={uploadingSlot}
          onFileChange={onFileChange}
          onUpload={onUpload}
        />
      ) : null}
      {actionError ? (
        <p role="alert" className="mt-3 text-[13px] text-red-800">
          {actionError}
        </p>
      ) : null}
      {actionMessage ? (
        <p role="status" className="mt-3 text-[13px] text-green-800">
          {actionMessage}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        {isBuyer &&
        order.manualDelivery &&
        order.status === "paid" &&
        order.manualDeliverySubmittedAt &&
        !order.manualDeliveryAcceptedAt ? (
          <button
            type="button"
            disabled={accepting}
            onClick={onAcceptDelivery}
            className="rounded-lg px-5 py-3 text-[13px] font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
          >
            {accepting ? "Accepting…" : "Accept ticket delivery"}
          </button>
        ) : null}
        {isSeller && canCheckEscrow && escrow?.escrowStatus === "hold" ? (
          <button
            type="button"
            disabled={releasing || escrow.releaseStatus === "pending"}
            onClick={onReleaseEscrow}
            className="rounded-lg px-5 py-3 text-[13px] font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
          >
            {releasing || escrow.releaseStatus === "pending"
              ? "Release pending…"
              : "Release escrow"}
          </button>
        ) : null}
      </div>
    </section>
  )
}
