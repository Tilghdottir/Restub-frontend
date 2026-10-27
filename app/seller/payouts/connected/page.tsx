"use client"

import Link from "next/link"
import AccountPageShell, {
  ResourceCard,
} from "../../../components/AccountPageShell"

export default function BachsConnectedPage() {
  return (
    <AccountPageShell eyebrow="Seller settings" title="Bachs onboarding">
      <ResourceCard>
        <h2 className="text-[16px] font-semibold" style={{ color: "#111111" }}>
          Onboarding returned to ReStub
        </h2>
        <p className="text-[14px] mt-2" style={{ color: "#292B2F" }}>
          Bachs account activation is confirmed asynchronously. You can return
          to your payout settings while the provider updates your account.
        </p>
        <Link
          href="/payout-account"
          className="inline-flex mt-5 px-5 py-3 rounded-lg text-[13px] font-semibold"
          style={{ backgroundColor: "#111111", color: "#FAFAF7" }}
        >
          View payout settings
        </Link>
      </ResourceCard>
    </AccountPageShell>
  )
}
