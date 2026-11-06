import type { FormEvent } from "react"

export default function PurchaseTicketProblem({
  orderStatus,
  canOpenDispute,
  showForm,
  reason,
  submitting,
  error,
  message,
  supportMailto,
  onShowForm,
  onReasonChange,
  onSubmit,
  onCancel,
}: {
  orderStatus: string
  canOpenDispute: boolean
  showForm: boolean
  reason: string
  submitting: boolean
  error: string
  message: string
  supportMailto: string
  onShowForm: () => void
  onReasonChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  return (
    <section
      className="mt-6 rounded-lg border bg-white p-6"
      style={{ borderColor: "#E8E9EB" }}
    >
      <h2 className="text-[16px] font-semibold" style={{ color: "#111111" }}>
        Problem with your ticket?
      </h2>
      {orderStatus === "disputed" ? (
        <p className="mt-2 text-[13px]" style={{ color: "#292B2F" }}>
          A dispute is already open for this order. Our team will review it and
          follow up by email.
        </p>
      ) : canOpenDispute ? (
        <>
          <p className="mt-2 text-[13px]" style={{ color: "#292B2F" }}>
            Report a missing, incorrect, or unusable ticket. Opening a dispute
            pauses order settlement while our team reviews it.
          </p>
          {!showForm ? (
            <button
              type="button"
              onClick={onShowForm}
              className="mt-4 rounded-lg border px-4 py-2.5 text-[13px] font-semibold"
              style={{ borderColor: "#E8E9EB", color: "#111111" }}
            >
              Report a ticket problem
            </button>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={onSubmit}>
              <label className="block text-[12px] font-medium text-[#111111]">
                What went wrong?
                <textarea
                  required
                  minLength={1}
                  maxLength={2000}
                  value={reason}
                  onChange={(event) => onReasonChange(event.target.value)}
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
                  disabled={submitting || !reason.trim()}
                  className="rounded-lg px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60"
                  style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
                >
                  {submitting ? "Submitting…" : "Submit report"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={onCancel}
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
          Ticket problems can be reported after payment is confirmed. Check the
          order status and your email for updates.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-[13px] text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-[13px] text-green-800">
          {message}
        </p>
      )}
      <p className="mt-4 text-[13px]" style={{ color: "#292B2F" }}>
        Prefer email?{" "}
        <a
          href={supportMailto}
          className="font-semibold underline underline-offset-2 text-[#111111]"
        >
          Contact buyer support
        </a>
        .
      </p>
    </section>
  )
}
