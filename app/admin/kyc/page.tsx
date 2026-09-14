"use client"

import { useEffect, useState } from "react"
import Header from "../../components/Header"
import { ProtectedRoute } from "../../components/ProtectedRoute"
import { apiClient } from "../../lib/api"
import type { KycCaseSummary } from "../../lib/api-types"

export default function AdminKycPage() {
  const [items, setItems] = useState<KycCaseSummary[]>([])

  useEffect(() => {
    apiClient.getKycCases().then(setItems)
  }, [])

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
              KYC reviews
            </h1>
          </div>

          <div
            className="bg-white border rounded-lg overflow-hidden"
            style={{ borderColor: "#E8E9EB" }}
          >
            <table className="w-full text-left">
              <thead style={{ backgroundColor: "#FAFAF7" }}>
                <tr
                  className="text-[11px] uppercase tracking-wide"
                  style={{ color: "#292B2F" }}
                >
                  <th className="px-5 py-3">Applicant</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="text-[13px] border-t"
                    style={{ borderColor: "#E8E9EB", color: "#111111" }}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">{item.applicant}</p>
                        <p
                          className="font-mono-data text-[11px]"
                          style={{ color: "#292B2F" }}
                        >
                          {item.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2 py-1 rounded-full text-[11px]"
                        style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">{item.risk}</td>
                    <td className="px-5 py-4" style={{ color: "#292B2F" }}>
                      {item.submittedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
