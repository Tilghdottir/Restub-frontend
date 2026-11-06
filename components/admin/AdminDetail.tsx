export default function AdminDetail({
  label,
  value,
  compact = false,
}: {
  label: string
  value: string
  compact?: boolean
}) {
  return (
    <div className="min-w-0">
      <p
        className={`font-medium uppercase tracking-wide text-[#292B2F] ${
          compact ? "text-[10px]" : "text-[11px]"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 break-all text-[#111111] ${
          compact ? "text-[12px]" : "text-[13px]"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
