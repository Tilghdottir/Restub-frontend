"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import Header from "./Header"

const accountLinks = [
  { href: "/account", label: "Overview" },
  { href: "/order", label: "Orders" },
  { href: "/ticket", label: "Tickets" },
  { href: "/sell", label: "Sell tickets" },
  { href: "/payment", label: "Payments" },
  { href: "/transaction", label: "Transactions" },
  { href: "/notification", label: "Notifications" },
  { href: "/account/kyc", label: "KYC verification" },
  { href: "/payout-account", label: "Payout account" },
]

export default function AccountSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const links = pathname.startsWith("/admin")
    ? [
        { href: "/admin", label: "Overview" },
        { href: "/admin/disputes", label: "Disputes" },
        { href: "/admin/kyc", label: "KYC reviews" },
      ]
    : accountLinks

  const signOut = () => {
    void import("../lib/api").then(({ apiClient }) =>
      apiClient.logout().finally(() => {
        window.localStorage.removeItem("restub_email")
        router.push("/")
        router.refresh()
      }),
    )
  }

  return (
    <>
      <div className="lg:hidden">
        <Header />
      </div>
      <aside
        className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col border-r bg-white"
        style={{ borderColor: "#E8E9EB" }}
      >
        <div
          className="px-6 h-14 flex items-center border-b"
          style={{ borderColor: "#E8E9EB" }}
        >
          <Link
            href="/"
            className="text-base font-bold tracking-tight"
            style={{ color: "#111111" }}
          >
            resale
            <span className="font-normal" style={{ color: "#292B2F" }}>
              .co
            </span>
          </Link>
        </div>
        <div className="px-4 py-5">
          <p
            className="px-2 text-[10px] uppercase tracking-widest"
            style={{ color: "#292B2F" }}
          >
            Account
          </p>
          <nav className="mt-3 space-y-1">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-[13px] font-medium"
                  style={{
                    backgroundColor: active ? "#111111" : "transparent",
                    color: active ? "#FAFAF7" : "#292B2F",
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div
          className="mt-auto border-t px-6 py-5"
          style={{ borderColor: "#E8E9EB" }}
        >
          <p
            className="truncate text-[12px] font-medium"
            style={{ color: "#111111" }}
          >
            {user?.email || "Signed-in account"}
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-3 text-[12px] underline underline-offset-2"
            style={{ color: "#292B2F" }}
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
