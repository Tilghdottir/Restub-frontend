import type { ReactNode } from "react"
import Header from "./Header"
import { ProtectedRoute } from "./ProtectedRoute"

export default function AccountPageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-6">
            <p
              className="text-[11px] font-medium tracking-widest uppercase mb-2"
              style={{ color: "#292B2F" }}
            >
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold" style={{ color: "#111111" }}>
              {title}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

export function ResourceCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-white border rounded-lg p-5"
      style={{ borderColor: "#E8E9EB" }}
    >
      {children}
    </div>
  )
}
