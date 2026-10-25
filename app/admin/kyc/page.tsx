"use client"

import AccountSidebar from "../../components/AccountSidebar"
import ApiErrorNotice from "../../components/ApiErrorNotice"
import { ProtectedRoute } from "../../components/ProtectedRoute"
import { useGetKycCasesQuery } from "../../lib/kyc/rtk"

export default function AdminKycPage() {
  return (
    <ProtectedRoute requiredPermission="kyc:review">
      <AdminKycContent />
    </ProtectedRoute>
  )
}

function AdminKycContent() {
  const {
    data: items = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetKycCasesQuery()

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF7" }}>
      <AccountSidebar />

      <main className="lg:ml-64 max-w-6xl mx-auto px-6 py-8">
        <ApiErrorNotice error={error} fallback="Unable to load KYC reviews." />
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
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="mt-3 rounded-lg border border-[#111111] bg-white px-3 py-2 text-[11px] font-semibold text-[#111111] disabled:opacity-50"
          >
            {isFetching ? "Refreshing…" : "Refresh reviews"}
          </button>
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
                <th className="px-5 py-3">Applicant user ID</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-6 text-[13px] text-[#292B2F]"
                  >
                    Loading KYC reviews…
                  </td>
                </tr>
              ) : items.length === 0 && !error ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-6 text-[13px] text-[#292B2F]"
                  >
                    No KYC reviews are pending.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="text-[13px] border-t"
                    style={{ borderColor: "#E8E9EB", color: "#111111" }}
                  >
                    <td className="px-5 py-4 font-mono-data text-[11px]">
                      {item.applicant}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2 py-1 rounded-full text-[11px]"
                        style={{ backgroundColor: "#E8E9EB", color: "#111111" }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4" style={{ color: "#292B2F" }}>
                      {item.submittedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
