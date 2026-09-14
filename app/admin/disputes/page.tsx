"use client"

import { useEffect, useState } from "react"
import Header from "../../components/Header"
import { ProtectedRoute } from "../../components/ProtectedRoute"
import { apiClient } from "../../lib/api"
import type { DisputeSummary } from "../../lib/api-types"

export default function AdminDisputesPage() {
  const [items, setItems] = useState<DisputeSummary[]>([])

  useEffect(() => {
    apiClient.getDisputes().then(setItems)
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
              Disputes
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
                  <th className="px-5 py-3">Case</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="text-[13px] border-t"
                    style={{ borderColor: "#E8E9EB", color: "#111111" }}
                  >
                    <td className="px-5 py-4 font-mono-data">{item.id}</td>
                    <td className="px-5 py-4">{item.subject}</td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2 py-1 rounded-full text-[11px]"
                        style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">{item.priority}</td>
                    <td className="px-5 py-4" style={{ color: "#292B2F" }}>
                      {item.updatedAt}
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
