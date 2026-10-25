import { createIdempotencyKey } from "../api/device"
import {
  expectArray,
  expectRecord,
  parseCursorPage,
  requireBoolean,
  requireNumber,
  requireOneOf,
  requireString,
} from "../api/parse"
import { authenticatedRequest } from "../auth/request"
import type {
  DisputeDetail,
  DisputeEvidence,
  DisputeOutcome,
  DisputePage,
  DisputeQueueItem,
  DisputeStatus,
} from "./types"
import { DISPUTE_STATUSES } from "./types"

export async function getDisputes(
  options: {
    limit?: number
    cursor?: string
    status?: DisputeStatus
  } = {},
): Promise<DisputePage> {
  const query = new URLSearchParams({
    limit: String(options.limit ?? 25),
  })
  if (options.cursor) query.set("cursor", options.cursor)
  if (options.status) query.set("status", options.status)
  const page = parseCursorPage(
    await authenticatedRequest<unknown>(
      `/disputes/admin?${query.toString()}`,
      {},
      { unwrapEnvelope: false },
    ),
    "dispute queue",
  )
  return {
    items: page.items.map(parseQueueItem),
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
  }
}

export async function getDisputeDetail(id: string): Promise<DisputeDetail> {
  return parseDisputeDetail(
    await authenticatedRequest<unknown>(`/disputes/${encodeURIComponent(id)}`),
  )
}

export async function getDisputeEvidence(
  id: string,
): Promise<DisputeEvidence[]> {
  const result = expectRecord(
    await authenticatedRequest<unknown>(
      `/disputes/${encodeURIComponent(id)}/evidence`,
    ),
    "dispute evidence response",
  )
  if (requireString(result, "disputeId", "dispute evidence") !== id) {
    throw new Error(
      "Invalid API response: dispute evidence id does not match the requested dispute.",
    )
  }
  return expectArray(result.evidence, "dispute evidence").map((item) => {
    const evidence = expectRecord(item, "dispute evidence item")
    return {
      id: requireString(evidence, "id", "dispute evidence item"),
      slotIndex: requireNumber(evidence, "slotIndex", "dispute evidence item"),
      mimeType: requireString(evidence, "mimeType", "dispute evidence item"),
      url: requireString(evidence, "url", "dispute evidence item"),
      expiresAt: requireString(evidence, "expiresAt", "dispute evidence item"),
    }
  })
}

export async function assignDispute(
  id: string,
  assignedToUserId: string,
): Promise<void> {
  await authenticatedRequest<unknown>(
    `/disputes/${encodeURIComponent(id)}/assignment`,
    {
      method: "PATCH",
      body: JSON.stringify({ assignedToUserId }),
    },
  )
}

export async function escalateDispute(
  id: string,
  reason: string,
): Promise<void> {
  await authenticatedRequest<unknown>(
    `/disputes/${encodeURIComponent(id)}/escalate`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  )
}

export async function resolveDispute(
  id: string,
  outcome: DisputeOutcome,
  note: string,
): Promise<void> {
  await authenticatedRequest<unknown>(
    `/disputes/${encodeURIComponent(id)}/resolve`,
    {
      method: "POST",
      headers: { "idempotency-key": createIdempotencyKey() },
      body: JSON.stringify({ outcome, note }),
    },
  )
}

function parseQueueItem(value: unknown): DisputeQueueItem {
  const item = expectRecord(value, "dispute queue item")
  return {
    id: requireString(item, "id", "dispute queue item"),
    orderId: requireString(item, "orderId", "dispute queue item"),
    status: requireOneOf(
      item,
      "status",
      DISPUTE_STATUSES,
      "dispute queue item",
    ),
    reason: requireString(item, "reason", "dispute queue item"),
    assignedToUserId:
      item.assignedToUserId === null
        ? null
        : requireString(item, "assignedToUserId", "dispute queue item"),
    createdAt: requireString(item, "createdAt", "dispute queue item"),
    updatedAt: requireString(item, "updatedAt", "dispute queue item"),
    slaDueAt: requireString(item, "slaDueAt", "dispute queue item"),
    overdue: requireBoolean(item, "overdue", "dispute queue item"),
    resolutionOutcome:
      item.resolutionOutcome === null
        ? null
        : requireOneOf(
            item,
            "resolutionOutcome",
            ["refund", "uphold"] as const,
            "dispute queue item",
          ),
  }
}

function parseDisputeDetail(value: unknown): DisputeDetail {
  const detail = expectRecord(value, "dispute detail")
  const sla = expectRecord(detail.sla, "dispute SLA")
  const evidenceReferences = expectArray(
    detail.evidenceReferences,
    "dispute evidence references",
  )
  if (!evidenceReferences.every((reference) => typeof reference === "string")) {
    throw new Error(
      "Invalid API response: dispute evidence references must be strings.",
    )
  }
  return {
    ...parseQueueItem(detail),
    openedByUserId: requireString(detail, "openedByUserId", "dispute detail"),
    previousOrderStatus: requireString(
      detail,
      "previousOrderStatus",
      "dispute detail",
    ),
    evidenceReferences,
    escalationReason:
      detail.escalationReason === null
        ? null
        : requireString(detail, "escalationReason", "dispute detail"),
    resolvedAt:
      detail.resolvedAt === null
        ? null
        : requireString(detail, "resolvedAt", "dispute detail"),
    resolutionNote:
      detail.resolutionNote === null
        ? null
        : requireString(detail, "resolutionNote", "dispute detail"),
    resolutionAttempts: requireNumber(
      detail,
      "resolutionAttempts",
      "dispute detail",
    ),
    events: expectArray(detail.events, "dispute events").map((value) => {
      const event = expectRecord(value, "dispute event")
      return {
        id: requireString(event, "id", "dispute event"),
        actorUserId: requireString(event, "actorUserId", "dispute event"),
        type: requireString(event, "type", "dispute event"),
        details: expectRecord(event.details, "dispute event details"),
        createdAt: requireString(event, "createdAt", "dispute event"),
      }
    }),
    sla: {
      overdue: requireBoolean(sla, "overdue", "dispute SLA"),
      dueAt: requireString(sla, "dueAt", "dispute SLA"),
    },
  }
}
