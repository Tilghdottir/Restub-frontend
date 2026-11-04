"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useLogoutMutation } from "../lib/auth/rtk"
import BrandLogo from "./BrandLogo"
import Header from "./Header"

const accountLinks = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/my-listings", label: "Seller workspace" },
  { href: "/account#tickets-heading", label: "My tickets" },
  { href: "/order", label: "Orders" },
]

const profileLinks = [
  { href: "/notification", label: "Notifications" },
  { href: "/payment", label: "Payment methods" },
  { href: "/account/kyc", label: "Identity verification" },
]

export default function AccountSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const [currentHash, setCurrentHash] = useState("")
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
  const isAdminPage = pathname.startsWith("/admin")

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash)
    updateHash()
    window.addEventListener("hashchange", updateHash)
    return () => window.removeEventListener("hashchange", updateHash)
  }, [pathname])

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
              const isTicketLink = link.href === "/account#tickets-heading"
              const active = isTicketLink
                ? pathname === "/account" && currentHash === "#tickets-heading"
                : link.href === "/account"
                  ? pathname === "/account" &&
                    currentHash !== "#tickets-heading"
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-[13px] font-medium ${
                    active
                      ? "bg-[#111111] text-[#FAFAF7]"
                      : "text-[#292B2F] hover:bg-[#F0F0EE]"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            {!isAdminPage ? (
              <details
                className={`rounded-lg ${
                  pathname === "/transaction" ||
                  pathname.startsWith("/payout-account")
                    ? "bg-[#F0F0EE]"
                    : ""
                }`}
                open={
                  pathname === "/transaction" ||
                  pathname.startsWith("/payout-account")
                }
              >
                <summary
                  className={`cursor-pointer rounded-lg px-3 py-2.5 text-[13px] font-medium ${
                    pathname === "/transaction" ||
                    pathname.startsWith("/payout-account")
                      ? "text-[#111111]"
                      : "text-[#292B2F]"
                  }`}
                >
                  Money
                </summary>
                <nav className="mb-1 ml-3 space-y-1 border-l border-[#D1D3D5] pl-2">
                  {[
                    { href: "/transaction", label: "Transactions" },
                    { href: "/payout-account", label: "Payout settings" },
                  ].map((link) => {
                    const active =
                      pathname === link.href ||
                      pathname.startsWith(`${link.href}/`)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-md px-3 py-2.5 text-[13px] font-medium ${
                          active
                            ? "bg-[#111111] text-[#FAFAF7]"
                            : "text-[#292B2F] hover:bg-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>
              </details>
            ) : null}
          </nav>
        </div>
        <div
          className="relative mt-auto border-t px-4 py-4"
          style={{ borderColor: "#E8E9EB" }}
        >
          {isAdminPage && user?.staffRoles.length ? (
            <>
              <div className="flex items-center gap-3 px-2 py-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8E9EB] text-[13px] font-semibold text-[#111111]">
                  {(user.name || user.email).slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#111111]">
                    {user.name}
                  </p>
                  <p className="truncate text-[12px] text-[#292B2F]">
                    {user.email}
                  </p>
                  <p className="truncate text-[12px] text-[#292B2F]">
                    {user.staffRoles.join(" · ")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="mt-1 w-full rounded-md px-3 py-2 text-left text-[13px] font-medium text-[#111111] hover:bg-[#F0F0EE]"
              >
                Sign out
              </button>
            </>
          ) : (
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#F0F0EE] [&::-webkit-details-marker]:hidden">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8E9EB] text-[13px] font-semibold text-[#111111]">
                  {(user?.name || user?.email || "A").slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[13px] font-semibold text-[#111111]">
                    {user?.name || "Account"}
                  </span>
                  <span className="block truncate text-[12px] text-[#292B2F]">
                    {user?.email || "Signed-in account"}
                  </span>
                </span>
                <span aria-hidden="true" className="text-[12px] text-[#292B2F]">
                  ▴
                </span>
              </summary>
              <nav className="absolute bottom-full left-0 z-20 mb-2 grid w-full gap-1 rounded-lg border border-[#E8E9EB] bg-white p-2 shadow-lg">
                {profileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-[13px] text-[#292B2F] hover:bg-[#F0F0EE]"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-md border-t border-[#E8E9EB] px-3 py-2 text-left text-[13px] font-medium text-[#111111] hover:bg-[#F0F0EE]"
                >
                  Sign out
                </button>
              </nav>
            </details>
          )}
        </div>
      </aside>
    </>
  )
}
