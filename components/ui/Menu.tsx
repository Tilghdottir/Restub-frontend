// components/layout/AccountMenu.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type Props = { onSignOut: () => void | Promise<void> }

export default function AccountMenu({ onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // close on route change
  useEffect(() => setOpen(false), [pathname])

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const item =
    "block w-full rounded-md px-3 py-2 text-left text-sm text-[#292B2F] hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E9EB] bg-white hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#111111]"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="6" r="3" stroke="#111111" strokeWidth="1.5" />
          <path d="M3 15c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-48 rounded-xl border border-[#E8E9EB] bg-white p-1.5 shadow-lg"
        >
          <Link href="/account" role="menuitem" className={item}>
            Profile
          </Link>
          <div className="my-1 border-t border-[#E8E9EB]" />
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={async () => {
              setOpen(false)
              await onSignOut()
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}