const SUPPORT_EMAIL = "tilghmantechnologiessupport@gmail.com"

export function getSupportMailto(orderId?: string): string {
  const orderReference = orderId?.trim()
  const subject = orderReference
    ? `Ticket support for order ${orderReference}`
    : "ReStub ticket support"
  const body = orderReference
    ? `Hello, I need help with order ${orderReference}.`
    : "Hello, I need help with a ReStub ticket order."
  const query = new URLSearchParams({ subject, body })

  return `mailto:${SUPPORT_EMAIL}?${query.toString()}`
}
