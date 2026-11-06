import type {
  TicketOcrResult,
  TicketUploadStatus,
} from "../../../../lib/listings/types"
import TicketUploadSlot from "./TicketUploadSlot"

export default function TicketUploadSection({
  quantity,
  isPackage,
  files,
  verifiedSlots,
  uploadingSlot,
  verifyingSlot,
  failedSlots,
  uploadedSlots,
  statuses,
  ocrSummaries,
  uploadProgress,
  isSubmitting,
  manualReviewSubmitted,
  onFileChange,
  onCancelUpload,
}: {
  quantity: number
  isPackage: boolean
  files: Array<File | null>
  verifiedSlots: number[]
  uploadingSlot: number | null
  verifyingSlot: number | null
  failedSlots: number[]
  uploadedSlots: number[]
  statuses: Record<number, TicketUploadStatus>
  ocrSummaries: Record<number, TicketOcrResult>
  uploadProgress: number
  isSubmitting: boolean
  manualReviewSubmitted: boolean
  onFileChange: (slotIndex: number, file: File | undefined) => void
  onCancelUpload: () => void
}) {
  return (
    <div className="mt-5 border-t pt-4" style={{ borderColor: "#E8E9EB" }}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3
            className="text-[12px] font-semibold"
            style={{ color: "#111111" }}
          >
            Upload ticket evidence
          </h3>
          <p className="mt-1 text-[12px]" style={{ color: "#62656A" }}>
            One private PDF, JPEG, or PNG per {isPackage ? "package" : "ticket"}{" "}
            · Up to 5 MB each
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{
            backgroundColor:
              verifiedSlots.length === quantity ? "#E7F4EC" : "#F0F0ED",
            color: verifiedSlots.length === quantity ? "#22633D" : "#62656A",
          }}
          aria-live="polite"
        >
          {verifiedSlots.length} of {quantity} complete
        </span>
      </div>
      <p className="mb-3 text-[11px]" style={{ color: "#62656A" }}>
        Files stay private and are never shown to buyers. Your listing can be
        published after all files are verified or approved through staff review.
        If the issuer cannot verify a file, you can request staff review for the
        unresolved tickets; issuer-verified tickets remain verified.
      </p>
      <div className="space-y-3">
        {Array.from({ length: quantity }, (_, index) => {
          const slotIndex = index + 1
          return (
            <TicketUploadSlot
              key={slotIndex}
              slotIndex={slotIndex}
              file={files[index] ?? null}
              isPackage={isPackage}
              isVerified={verifiedSlots.includes(slotIndex)}
              isUploading={uploadingSlot === slotIndex}
              isVerifying={verifyingSlot === slotIndex}
              hasUploadFailed={failedSlots.includes(slotIndex)}
              isUploaded={uploadedSlots.includes(slotIndex)}
              ticketStatus={statuses[slotIndex]}
              ocrSummary={ocrSummaries[slotIndex]}
              uploadProgress={uploadProgress}
              isSubmitting={isSubmitting}
              manualReviewSubmitted={manualReviewSubmitted}
              onFileChange={(file) => onFileChange(slotIndex, file)}
              onCancelUpload={onCancelUpload}
            />
          )
        })}
      </div>
    </div>
  )
}
