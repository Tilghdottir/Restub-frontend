"use client"

import Link from "next/link"
import AccountPageShell, {
  ResourceCard,
} from "../../../components/AccountPageShell"

export default function BachsConnectRetryPage() {
  return (
    <AccountPageShell eyebrow="Seller settings" title="Bachs onboarding">
      <ResourceCard>
        <h2 className="text-[16px] font-semibold" style={{ color: "#111111" }}>
          Continue account setup
        </h2>
        <p className="text-[14px] mt-2" style={{ color: "#292B2F" }}>
          Your onboarding link may have expired. Start again from payout
          settings to get a new secure link.
        </p>
        <Link
          href="/payout-account"
          className="inline-flex mt-5 px-5 py-3 rounded-lg text-[13px] font-semibold"
          style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
        >
          Return to payout settings
        </Link>
      </ResourceCard>
    </AccountPageShell>
  )
}
