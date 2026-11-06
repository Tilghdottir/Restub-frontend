"use client"

import type {
  TicketOcrResult,
  TicketUploadStatus,
} from "../../../../lib/listings/types"

function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function TicketUploadSlot({
  slotIndex,
  file,
  isPackage,
  isVerified,
  isUploading,
  isVerifying,
  hasUploadFailed,
  isUploaded,
  ticketStatus,
  ocrSummary,
  uploadProgress,
  isSubmitting,
  manualReviewSubmitted,
  onFileChange,
  onCancelUpload,
}: {
  slotIndex: number
  file: File | null
  isPackage: boolean
  isVerified: boolean
  isUploading: boolean
  isVerifying: boolean
  hasUploadFailed: boolean
  isUploaded: boolean
  ticketStatus: TicketUploadStatus | undefined
  ocrSummary: TicketOcrResult | undefined
  uploadProgress: number
  isSubmitting: boolean
  manualReviewSubmitted: boolean
  onFileChange: (file: File | undefined) => void
  onCancelUpload: () => void
}) {
  const isProcessing = ticketStatus === "processing"
  const isReviewPending = ticketStatus === "manual_review_pending"
  const isReviewApproved = ticketStatus === "manual_review_approved"
  const isReviewRejected = ticketStatus === "manual_review_rejected"
  const inputId = `ticket-file-${slotIndex}`
  const statusLabel = isReviewApproved
    ? "Review approved"
    : isVerified
      ? "Issuer verified"
      : isReviewPending
        ? "Under manual review"
        : isReviewRejected
          ? "Review rejected — replace file"
          : isProcessing
            ? "Verification in progress"
            : isUploading
              ? `Uploading · ${uploadProgress}%`
              : isVerifying
                ? "Verifying ticket…"
                : hasUploadFailed
                  ? isUploaded
                    ? "Verification failed"
                    : "Upload failed"
                  : isUploaded
                    ? "Uploaded · ready to verify"
                    : file
                      ? "Ready to upload"
                      : "File required"
  const statusColor = isVerified
    ? "#22633D"
    : isReviewRejected
      ? "#A03B32"
      : isReviewPending || isProcessing
        ? "#6A5318"
        : hasUploadFailed
          ? "#A03B32"
          : "#62656A"

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "#E8E9EB" }}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span
          className="text-[12px] font-semibold"
          style={{ color: "#111111" }}
        >
          {isPackage ? "Package" : "Ticket"} {slotIndex}
        </span>
        <span
          className="text-[11px] font-medium"
          style={{ color: statusColor }}
          aria-live="polite"
        >
          {statusLabel}
        </span>
      </div>
      <label
        htmlFor={inputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          if (
            isSubmitting ||
            manualReviewSubmitted ||
            isVerified ||
            isProcessing
          ) {
            return
          }
          onFileChange(event.dataTransfer.files[0])
        }}
        className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed px-3 py-3 transition-colors ${
          isVerified || manualReviewSubmitted || isProcessing
            ? "cursor-not-allowed opacity-70"
            : "hover:border-[#62656A]"
        }`}
        style={{
          borderColor: hasUploadFailed ? "#D59A94" : "#C9CBCD",
          backgroundColor: "#FAFAF7",
        }}
      >
        <span className="min-w-0">
          <span
            className="block truncate text-[12px] font-medium"
            style={{ color: "#111111" }}
          >
            {file?.name ??
              (isReviewApproved
                ? "Approved by staff"
                : isVerified
                  ? "Issuer verified"
                  : "Drop a file here or browse")}
          </span>
          <span
            className="mt-0.5 block text-[11px]"
            style={{ color: "#62656A" }}
          >
            {file
              ? formatFileSize(file.size)
              : isReviewApproved
                ? "Approved through manual review"
                : isVerified
                  ? "Issuer-verified ticket"
                  : "PDF, JPEG, or PNG · Maximum 5 MB"}
          </span>
        </span>
        <span
          className="shrink-0 text-[11px] font-semibold underline underline-offset-2"
          style={{ color: "#111111" }}
        >
          {isVerified
            ? isReviewApproved
              ? "Approved"
              : "Verified"
            : file
              ? "Replace"
              : "Browse"}
        </span>
        <input
          id={inputId}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          disabled={
            isSubmitting || manualReviewSubmitted || isVerified || isProcessing
          }
          onChange={(event) => {
            onFileChange(event.currentTarget.files?.[0])
            event.currentTarget.value = ""
          }}
          className="sr-only"
        />
      </label>

      {isUploading || isVerifying ? (
        <div className="mt-2" aria-live="polite">
          {isUploading ? (
            <>
              <div
                className="h-1.5 overflow-hidden rounded-full"
                role="progressbar"
                aria-label={`Uploading ${file?.name ?? `ticket ${slotIndex}`}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress}
                style={{ backgroundColor: "#E8E9EB" }}
              >
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundColor: "#111111",
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px]" style={{ color: "#62656A" }}>
                  Uploading securely…
                </span>
                <button
                  type="button"
                  onClick={onCancelUpload}
                  className="text-[11px] font-medium underline underline-offset-2"
                  style={{ color: "#111111" }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p className="text-[11px]" style={{ color: "#62656A" }}>
              Checking ticket with the issuing partner…
            </p>
          )}
        </div>
      ) : null}
      {hasUploadFailed ? (
        <p className="mt-2 text-[11px]" style={{ color: "#A03B32" }}>
          {isUploaded
            ? "We couldn’t verify this file. Replace it or retry the upload."
            : "The upload didn’t finish. Retry this file."}
        </p>
      ) : null}
      {ocrSummary ? (
        <p className="mt-2 text-[11px] text-[#62656A]">
          {"status" in ocrSummary ? (
            ocrSummary.status === "disabled" ? (
              "OCR screening is disabled."
            ) : ocrSummary.status === "not_run" ? (
              "OCR screening has not run yet."
            ) : (
              "OCR screening signals are unavailable for this file."
            )
          ) : (
            <>
              Screening signals: {Math.round(ocrSummary.confidence)}% confidence
              · {ocrSummary.characterCount} characters · event-name match:{" "}
              {ocrSummary.eventNameMatch ?? "not reported"}
            </>
          )}{" "}
          {"status" in ocrSummary &&
          ocrSummary.status !== "disabled" &&
          ocrSummary.status !== "not_run"
            ? "Staff may inspect the uploaded ticket directly."
            : "Screening signals do not confirm that a ticket is valid, authentic, or unused."}
        </p>
      ) : null}
    </div>
  )
}
