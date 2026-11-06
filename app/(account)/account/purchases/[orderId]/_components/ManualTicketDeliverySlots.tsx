import type { OrderDetailResponse } from "../../../../../../lib/orders/models"

export default function ManualTicketDeliverySlots({
  quantity,
  ticketDeliveries,
  files,
  uploadingSlot,
  onFileChange,
  onUpload,
}: {
  quantity: number
  ticketDeliveries: OrderDetailResponse["ticketDeliveries"]
  files: Record<number, File>
  uploadingSlot: number | null
  onFileChange: (slot: number, file?: File) => void
  onUpload: (slot: number) => void
}) {
  return (
    <div className="mt-5 border-t border-[#E8E9EB] pt-4">
      <h3 className="text-[14px] font-semibold text-[#111111]">
        Deliver tickets
      </h3>
      <p className="mt-1 text-[12px] text-[#292B2F]">
        Upload a PDF, JPEG, or PNG for each ticket. Files must be 5 MB or
        smaller. The buyer can access them after every ticket is delivered.
      </p>
      <div className="mt-3 space-y-3">
        {Array.from({ length: quantity }, (_, index) => index + 1).map(
          (slot) => {
            const delivered = ticketDeliveries.some(
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
                    <p className="mt-1 text-[11px] text-[#292B2F]">Delivered</p>
                  ) : (
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      aria-label={`Choose ticket ${slot} file`}
                      onChange={(event) =>
                        onFileChange(slot, event.currentTarget.files?.[0])
                      }
                      className="mt-1 block max-w-full text-[11px] text-[#292B2F]"
                    />
                  )}
                </div>
                {!delivered ? (
                  <button
                    type="button"
                    disabled={!files[slot] || uploadingSlot !== null}
                    onClick={() => onUpload(slot)}
                    className="shrink-0 rounded-lg bg-[#111111] px-4 py-2.5 text-[12px] font-semibold text-[#FAFAF7] disabled:opacity-50"
                  >
                    {uploadingSlot === slot ? "Uploading…" : "Upload ticket"}
                  </button>
                ) : null}
              </div>
            )
          },
        )}
      </div>
    </div>
  )
}
