import { expect, test } from "@playwright/test"

test("API proxy rejects unknown routes and cross-origin writes", async ({
  request,
}) => {
  const unknownEndpoint = await request.get("/api/not-allowed")
  expect(unknownEndpoint.status()).toBe(404)

  const crossOriginWrite = await request.post("/api/auth/login", {
    headers: { origin: "https://attacker.invalid" },
    data: {},
  })
  expect(crossOriginWrite.status()).toBe(403)
})

test("API proxy rejects request bodies larger than 10 MB", async ({
  request,
}) => {
  const oversizedBody = Buffer.alloc(10 * 1024 * 1024 + 1)
  const response = await request.post("/api/auth/login", {
    headers: {
      origin: "http://localhost:3011",
      "content-type": "application/octet-stream",
    },
    data: oversizedBody,
  })

  expect(response.status()).toBe(413)
})
