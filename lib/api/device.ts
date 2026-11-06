export function createIdempotencyKey(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID()
  }

  return `restub-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return ""

  const storageKey = "restub_device_id"
  const existingId = window.localStorage.getItem(storageKey)
  if (existingId && existingId.length >= 8 && existingId.length <= 128) {
    return existingId
  }

  const deviceId = createIdempotencyKey()
  window.localStorage.setItem(storageKey, deviceId)
  return deviceId
}
