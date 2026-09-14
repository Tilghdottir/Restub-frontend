"use client"

import Link from "next/link"
import Header from "../components/Header"
import { ProtectedRoute } from "../components/ProtectedRoute"

const stats = [
  { label: "Open disputes", value: "12", tone: "#111111" },
  { label: "Pending KYC", value: "8", tone: "#292B2F" },
  { label: "Revenue today", value: "$18.4k", tone: "#111111" },
  { label: "Active sellers", value: "1,240", tone: "#292B2F" },
]

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
        <Header />

        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-6">
            <p
              className="text-[11px] font-medium tracking-widest uppercase mb-2"
              style={{ color: "#292B2F" }}
            >
              Admin
            </p>
            <h1 className="text-3xl font-bold" style={{ color: "#111111" }}>
              Operations overview
            </h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white border rounded-lg p-5"
                style={{ borderColor: "#E8E9EB" }}
              >
                <p
                  className="text-[11px] uppercase tracking-wide"
                  style={{ color: "#292B2F" }}
                >
                  {stat.label}
                </p>
                <p
                  className="mt-3 text-3xl font-bold"
                  style={{ color: "#111111" }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div
              className="bg-white border rounded-lg p-5"
              style={{ borderColor: "#E8E9EB" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-[12px] font-semibold uppercase tracking-wide"
                  style={{ color: "#111111" }}
                >
                  Quick links
                </h2>
              </div>
              <div className="space-y-3">
                <Link
                  href="/admin/disputes"
                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-[13px] font-medium"
                  style={{ borderColor: "#E8E9EB", color: "#111111" }}
                >
                  <span>Dispute queue</span>
                  <span style={{ color: "#292B2F" }}>→</span>
                </Link>
                <Link
                  href="/admin/kyc"
                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-[13px] font-medium"
                  style={{ borderColor: "#E8E9EB", color: "#111111" }}
                >
                  <span>KYC review</span>
                  <span style={{ color: "#292B2F" }}>→</span>
                </Link>
              </div>
            </div>

            <div
              className="bg-white border rounded-lg p-5"
              style={{ borderColor: "#E8E9EB" }}
            >
              <h2
                className="text-[12px] font-semibold uppercase tracking-wide mb-4"
                style={{ color: "#111111" }}
              >
                Recent activity
              </h2>
              <ul
                className="space-y-3 text-[13px]"
                style={{ color: "#292B2F" }}
              >
                <li
                  className="flex justify-between gap-4 border-b pb-2"
                  style={{ borderColor: "#E8E9EB" }}
                >
                  <span>Transfer verification</span>
                  <span className="font-mono-data">10 min ago</span>
                </li>
                <li
                  className="flex justify-between gap-4 border-b pb-2"
                  style={{ borderColor: "#E8E9EB" }}
                >
                  <span>Seller payout approved</span>
                  <span className="font-mono-data">1 hr ago</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Updated delivery SLA</span>
                  <span className="font-mono-data">Today</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
