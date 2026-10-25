"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import { useLogoutMutation } from "../lib/auth/rtk"
import BrandLogo from "./BrandLogo"
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
  const { user, hasPermission } = useAuth()
  const [logout] = useLogoutMutation()
  const adminLinks = [
    {
      href: "/admin",
      label: "Overview",
      permission: "platform:read",
    },
    {
      href: "/admin/tickets",
      label: "Ticket verification",
      permission: "tickets:review",
    },
    {
      href: "/admin/events",
      label: "Event catalog",
      permission: "events:manage",
    },
    {
      href: "/admin/disputes",
      label: "Disputes",
      permission: "disputes:resolve",
    },
    {
      href: "/admin/kyc",
      label: "KYC reviews",
      permission: "kyc:review",
    },
  ] as const
  const links = pathname.startsWith("/admin")
    ? adminLinks.filter((link) => hasPermission(link.permission))
    : accountLinks

  const signOut = async () => {
    try {
      await logout().unwrap()
    } catch (error) {
      console.error("Sign-out request failed.", error)
    } finally {
      window.localStorage.removeItem("restub_email")
      router.push("/")
      router.refresh()
    }
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
          <BrandLogo width={120} height={28} />
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
          {pathname.startsWith("/admin") && user?.staffRoles.length ? (
            <p
              className="mt-1 text-[10px] uppercase tracking-wide"
              style={{ color: "#292B2F" }}
            >
              {user.staffRoles.join(" · ")}
            </p>
          ) : null}
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
