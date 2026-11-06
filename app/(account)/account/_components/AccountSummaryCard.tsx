"use client"

import Link from "next/link"
import { ResourceCard } from "../../../../components/account/AccountPageShell"

export default function AccountSummaryCard({
  label,
  value,
  detail,
  href,
}: {
  label: string
  value: string
  detail: string
  href?: string
}) {
  const card = (
    <ResourceCard>
      <p className="text-[11px] uppercase tracking-wide text-[#292B2F]">
        {label}
      </p>
      <p className="mt-2 font-mono-data text-[24px] font-semibold text-[#111111]">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-[#292B2F]">{detail}</p>
    </ResourceCard>
  )

  return href ? (
    <Link href={href} className="block min-w-[180px] snap-start sm:min-w-0">
      {card}
    </Link>
  ) : (
    <div className="min-w-[180px] snap-start sm:min-w-0">{card}</div>
  )
}
