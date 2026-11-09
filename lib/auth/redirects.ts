const LOGIN_PATHS = new Set(["/login", "/admin/login", "/register"])

export function getSafeReturnPath(value: string | null): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return null
  }

  let destination: URL
  try {
    destination = new URL(value, "https://restub.invalid")
  } catch {
    return null
  }

  if (destination.origin !== "https://restub.invalid") return null

  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "")
  if (
    basePath &&
    (destination.pathname === basePath ||
      destination.pathname.startsWith(`${basePath}/`))
  ) {
    destination.pathname = destination.pathname.slice(basePath.length) || "/"
  }

  const normalizedPath = destination.pathname.replace(/\/+$/, "") || "/"
  if (LOGIN_PATHS.has(normalizedPath)) return null

  return `${destination.pathname}${destination.search}${destination.hash}`
}
