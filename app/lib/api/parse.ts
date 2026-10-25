export type JsonRecord = Record<string, unknown>

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {}
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function expectRecord(value: unknown, label: string): JsonRecord {
  if (!isRecord(value)) {
    throw new Error(`Invalid API response: expected ${label} to be an object.`)
  }
  return value
}

export function expectArray(value: unknown, label: string): unknown[] {
  const candidate =
    isRecord(value) && "data" in value ? value.data : value
  if (!Array.isArray(candidate)) {
    throw new Error(`Invalid API response: expected ${label} to be an array.`)
  }
  return candidate
}

export function parseCursorPage(
  value: unknown,
  label: string,
): {
  items: unknown[]
  nextCursor: string | null
  hasMore: boolean
} {
  const envelope = expectRecord(value, label)
  if (envelope.success !== true) {
    throw new Error(`Invalid API response: ${label}.success must be true.`)
  }
  const meta = expectRecord(envelope.meta, `${label} metadata`)
  const pagination = expectRecord(meta.pagination, `${label} pagination`)
  const nextCursor = pagination.nextCursor
  if (nextCursor !== null && typeof nextCursor !== "string") {
    throw new Error(
      `Invalid API response: ${label} pagination.nextCursor must be a string or null.`,
    )
  }
  return {
    items: expectArray(envelope.data, `${label} data`),
    nextCursor,
    hasMore: requireBoolean(pagination, "hasMore", `${label} pagination`),
  }
}

export function requireString(
  record: JsonRecord,
  key: string,
  label: string,
): string {
  const value = record[key]
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid API response: ${label}.${key} must be a non-empty string.`)
  }
  return value
}

export function requireNumber(
  record: JsonRecord,
  key: string,
  label: string,
): number {
  const value = record[key]
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid API response: ${label}.${key} must be a finite number.`)
  }
  return value
}

export function requireBoolean(
  record: JsonRecord,
  key: string,
  label: string,
): boolean {
  const value = record[key]
  if (typeof value !== "boolean") {
    throw new Error(`Invalid API response: ${label}.${key} must be a boolean.`)
  }
  return value
}

export function requireNullableString(
  record: JsonRecord,
  key: string,
  label: string,
): string | null {
  const value = record[key]
  if (value !== null && typeof value !== "string") {
    throw new Error(
      `Invalid API response: ${label}.${key} must be a string or null.`,
    )
  }
  return value
}

export function requireOneOf<const T extends readonly string[]>(
  record: JsonRecord,
  key: string,
  values: T,
  label: string,
): T[number] {
  const value = record[key]
  if (typeof value !== "string" || !values.includes(value)) {
    throw new Error(
      `Invalid API response: ${label}.${key} must be one of ${values.join(", ")}.`,
    )
  }
  return value
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

export function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}
