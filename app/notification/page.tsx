"use client"

import { useEffect, useState } from "react"
import AccountPageShell, { ResourceCard } from "../components/AccountPageShell"
import { apiClient } from "../lib/api"
import type { NotificationSummary } from "../lib/api-types"

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationSummary[]>([])
  useEffect(() => {
    void apiClient.getNotifications().then(setNotifications)
  }, [])

  return (
    <AccountPageShell eyebrow="Updates" title="Notifications">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <ResourceCard key={notification.id}>
            <div className="flex gap-3">
              <span
                className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: notification.read ? "#E8E9EB" : "#111111",
                }}
              />
              <div>
                <div className="flex items-center gap-3">
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: "#111111" }}
                  >
                    {notification.title}
                  </p>
                  <span className="text-[11px]" style={{ color: "#292B2F" }}>
                    {notification.createdAt}
                  </span>
                </div>
                <p className="text-[13px] mt-1" style={{ color: "#292B2F" }}>
                  {notification.body}
                </p>
              </div>
            </div>
          </ResourceCard>
        ))}
      </div>
    </AccountPageShell>
  )
}
