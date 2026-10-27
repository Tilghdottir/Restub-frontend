"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import ApiErrorNotice from "../components/ApiErrorNotice"
import { formatNaira } from "../lib/money"
import { useGetAccountSummaryQuery } from "../lib/account/rtk"
import { useRequestRefundMutation } from "../lib/account-data/rtk"
import { useGetEscrowOperationStatusQuery } from "../lib/orders/rtk"
import { getApiErrorMessage } from "../lib/rtk-api"

export default function RefundPage() {
  const { data: account, error: accountError } = useGetAccountSummaryQuery()
  const [requestRefund, { isLoading }] = useRequestRefundMutation()
  const [orderId, setOrderId] = useState("")
  const [submittedOrderId, setSubmittedOrderId] = useState("")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const {
    data: escrowStatus,
    error: escrowError,
    refetch: refetchEscrow,
  } = useGetEscrowOperationStatusQuery(submittedOrderId, {
    skip: !submittedOrderId,
  })
  const refundPending = Boolean(
    escrowStatus &&
      (escrowStatus.escrowStatus === "refund_pending" ||
        escrowStatus.refundStatus === "pending"),
  )
  const refundableOrders =
    account?.purchases.filter((order) => order.status === "paid") ?? []
  const selectedOrder =
    refundableOrders.find((order) => order.id === orderId) ??
    refundableOrders[0]

  useEffect(() => {
    if (!submittedOrderId || !refundPending) return
    const interval = setInterval(() => {
      void refetchEscrow()
    }, 5000)
    return () => clearInterval(interval)
  }, [refundPending, refetchEscrow, submittedOrderId])

  return (
    <AccountPageShell eyebrow="Order support" title="Refunds">
      <ApiErrorNotice
        error={accountError}
        fallback="Unable to load your orders."
      />
      <ResourceCard>
        <h2 className="text-[15px] font-semibold" style={{ color: "#111111" }}>
          Request an order refund
        </h2>
        <p className="text-[13px] mt-1 mb-4" style={{ color: "#292B2F" }}>
          Refund requests are checked against the order’s current escrow state.
          Provider refunds may take time to settle.
        </p>
        {refundableOrders.length === 0 ? (
          <p className="text-[13px]" style={{ color: "#292B2F" }}>
            There are no paid orders currently available to request a refund
            for.
          </p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              if (!selectedOrder) return
              setError("")
              setResult("")
              try {
                const response = await requestRefund({
                  orderId: selectedOrder.id,
                }).unwrap()
                setSubmittedOrderId(response.orderId)
                setResult(
                  `Refund operation status: ${response.status.replace(/_/g, " ")}.`,
                )
              } catch (reason) {
                setError(
                  getApiErrorMessage(reason, "Unable to request this refund."),
                )
              }
            }}
          >
            <label className="block text-[12px] font-medium text-[#111111]">
              Paid order
              <select
                value={selectedOrder?.id ?? ""}
                onChange={(event) => setOrderId(event.target.value)}
                className="mt-1.5 w-full border rounded-lg px-4 py-2.5 text-[13px]"
                style={{
                  borderColor: "#E8E9EB",
                  backgroundColor: "#FAFAF7",
                }}
              >
                {refundableOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.eventTitle} · {formatNaira(order.total)}
                  </option>
                ))}
              </select>
            </label>
            {selectedOrder && (
              <p
                className="font-mono-data text-[12px]"
                style={{ color: "#292B2F" }}
              >
                Order {selectedOrder.id} · {formatNaira(selectedOrder.total)}
              </p>
            )}
            {error && (
              <p role="alert" className="text-[13px] text-red-800">
                {error}
              </p>
            )}
            {result && (
              <p role="status" className="text-[13px] text-green-800">
                {result}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading || !selectedOrder}
              className="px-5 py-3 rounded-lg text-[13px] font-semibold disabled:opacity-60"
              style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
            >
              {isLoading ? "Submitting…" : "Submit refund request"}
            </button>
          </form>
        )}
      </ResourceCard>
      {submittedOrderId && (
        <ResourceCard>
          <h2
            className="text-[15px] font-semibold"
            style={{ color: "#111111" }}
          >
            Refund status · {submittedOrderId}
          </h2>
          {escrowError ? (
            <p className="text-[13px] mt-2 text-red-800">
              {getApiErrorMessage(
                escrowError,
                "Unable to refresh the refund status.",
              )}
            </p>
          ) : (
            <p className="text-[13px] mt-2" style={{ color: "#292B2F" }}>
              {escrowStatus
                ? `Escrow: ${escrowStatus.escrowStatus.replace(/_/g, " ")} · Refund: ${escrowStatus.refundStatus?.replace(/_/g, " ") ?? "not reported"}`
                : "Checking the latest provider refund status…"}
            </p>
          )}
        </ResourceCard>
      )}
      <p className="text-[12px]" style={{ color: "#292B2F" }}>
        Refund history is not currently exposed by the payment API. This page
        displays the status returned for each submitted request.
      </p>
    </AccountPageShell>
  )
}
