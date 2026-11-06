export default function AdminSummaryCard({
  label,
  value,
  loading = false,
  unavailable = false,
  large = false,
}: {
  label: string
  value: number | string | undefined
  loading?: boolean
  unavailable?: boolean
  large?: boolean
}) {
  return (
    <div
      className={`rounded-lg border border-[#E8E9EB] bg-white ${
        large ? "p-5" : "p-4"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#292B2F]">
        {label}
      </p>
      <p
        role={loading ? "status" : undefined}
        className={`font-mono-data font-bold text-[#111111] ${
          large ? "mt-3 text-3xl" : "mt-2 text-2xl font-semibold"
        }`}
      >
        {loading
          ? "Loading…"
          : unavailable || value === undefined
            ? "Unavailable"
            : value}
      </p>
    </div>
  )
}
