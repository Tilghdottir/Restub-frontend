export const DISPUTE_STATUSES = [
  "open",
  "under_review",
  "escalated",
  "resolving",
  "resolution_failed",
  "resolved",
  "dismissed",
] as const

export type DisputeStatus = typeof DISPUTE_STATUSES[number]
export type DisputeOutcome = "refund" | "uphold"

export type DisputeQueueItem = {
  id: string
  orderId: string
  status: DisputeStatus
  reason: string
  assignedToUserId: string | null
  createdAt: string
  updatedAt: string
  slaDueAt: string
  overdue: boolean
  resolutionOutcome: DisputeOutcome | null
}

export type DisputePage = {
  items: DisputeQueueItem[]
  nextCursor: string | null
  hasMore: boolean
}

export type DisputeEvent = {
  id: string
  actorUserId: string
  type: string
  details: Record<string, unknown>
  createdAt: string
}

export type DisputeDetail = DisputeQueueItem & {
  openedByUserId: string
  previousOrderStatus: string
  evidenceReferences: string[]
  escalationReason: string | null
  resolvedAt: string | null
  resolutionNote: string | null
  resolutionAttempts: number
  events: DisputeEvent[]
  sla: {
    overdue: boolean
    dueAt: string
  }
}

export type DisputeEvidence = {
  id: string
  slotIndex: number
  mimeType: string
  url: string
  expiresAt: string
}
