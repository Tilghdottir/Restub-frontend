import { expect, test, type Page, type Route } from "@playwright/test"

const listing = {
  id: "mvp-listing",
  title: "Lagos Music Festival — General Admission",
  description: "One general admission ticket for the Lagos Music Festival.",
  quantity: 3,
  price: 25000,
  status: "published",
  ticketCategory: "General Admission",
  ticketType: "general_admission",
}

const sellerProfile = {
  sub: "mvp-seller",
  email: "seller@example.com",
  customerType: "individual",
  permissions: [],
}

async function fulfillApi(
  route: Route,
  data: unknown,
  status = 200,
): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(
      status >= 400
        ? { success: false, message: "Unauthorized" }
        : { success: true, data },
    ),
  })
}

async function mockApi(
  page: Page,
  handleRequest: (
    route: Route,
    pathname: string,
    method: string,
  ) => Promise<void>,
): Promise<void> {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url())
    const pathname = url.pathname.replace(/^.*\/api(?=\/)/, "")
    await handleRequest(route, pathname, route.request().method())
  })
}

test("buyer completes checkout and sees backend-confirmed payment", async ({
  page,
}) => {
  let checkoutPayload: Record<string, unknown> | undefined
  let checkoutIdempotencyKey: string | undefined

  await mockApi(page, async (route, pathname, method) => {
    if (pathname === "/auth/me") {
      await fulfillApi(route, {
        sub: "mvp-buyer",
        email: "buyer@example.com",
        customerType: "individual",
        permissions: [],
      })
      return
    }

    if (pathname === `/listings/${listing.id}` && method === "GET") {
      await fulfillApi(route, listing)
      return
    }

    if (pathname === "/orders/checkout" && method === "POST") {
      checkoutPayload = (route
        .request()
        .postDataJSON() as Record<string, unknown>)
      checkoutIdempotencyKey = route.request().headers()["idempotency-key"]
      await fulfillApi(route, {
        order: {
          id: "mvp-order",
          buyerId: null,
          buyerEmail: "buyer@example.com",
          sellerId: "mvp-seller",
          listingId: listing.id,
          quantity: 1,
          manualDelivery: false,
          manualDeliverySubmittedAt: null,
          manualDeliveryAcceptedAt: null,
          totalAmount: listing.price,
          status: "pending",
          createdAt: "2026-11-06T12:00:00.000Z",
          updatedAt: "2026-11-06T12:00:00.000Z",
        },
      })
      return
    }

    if (pathname === "/orders/mvp-order" && method === "GET") {
      await fulfillApi(route, {
        id: "mvp-order",
        buyerId: "mvp-buyer",
        sellerId: "mvp-seller",
        listingId: listing.id,
        eventTitle: listing.title,
        quantity: 1,
        unitPrice: listing.price,
        subtotal: listing.price,
        totalAmount: listing.price,
        status: "paid",
        manualDelivery: false,
        manualDeliverySubmittedAt: null,
        manualDeliveryAcceptedAt: null,
        createdAt: "2026-11-06T12:00:00.000Z",
      })
      return
    }

    await fulfillApi(route, [])
  })

  await page.goto(`/checkout/${listing.id}/`)

  await expect(
    page.getByRole("heading", { name: "Review your order" }),
  ).toBeVisible()
  await expect(
    page.getByText(listing.title, { exact: true }).first(),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "Continue to Contact Details" })
    .click()
  await expect(
    page.getByRole("heading", { name: "Contact Details", exact: true }),
  ).toBeVisible()

  const fields = page.getByRole("textbox")
  await fields.nth(0).fill("Maya")
  await fields.nth(1).fill("Buyer")
  await fields.nth(2).fill("buyer@example.com")
  await fields.nth(3).fill("08012345678")
  await page
    .getByRole("button", { name: "Continue to secure checkout" })
    .click()

  await expect(
    page.getByRole("heading", {
      name: "Your payment has been confirmed.",
    }),
  ).toBeVisible()
  expect(checkoutPayload).toMatchObject({
    listingId: listing.id,
    quantity: 1,
    firstName: "Maya",
    lastName: "Buyer",
    email: "buyer@example.com",
    phone: "+2348012345678",
    currency: "NGN",
  })
  expect(checkoutIdempotencyKey).toBeTruthy()
})

test("seller signs in, creates a draft listing, and reaches ticket upload", async ({
  page,
}) => {
  let listingPayload: Record<string, unknown> | undefined
  let listingIdempotencyKey: string | undefined

  await mockApi(page, async (route, pathname, method) => {
    if (pathname === "/auth/me") {
      await fulfillApi(route, sellerProfile)
      return
    }
    if (
      pathname === "/events/partners" ||
      pathname.startsWith("/events/partners/search")
    ) {
      await fulfillApi(route, [])
      return
    }
    if (pathname === "/kyc/me") {
      await fulfillApi(route, { status: "verified" })
      return
    }
    if (pathname === "/payout-accounts/me") {
      await fulfillApi(route, [])
      return
    }
    if (pathname === "/listings" && method === "POST") {
      listingPayload = (route
        .request()
        .postDataJSON() as Record<string, unknown>)
      listingIdempotencyKey = route.request().headers()["idempotency-key"]
      await fulfillApi(route, {
        ...listingPayload,
        id: "mvp-draft-listing",
        status: "draft",
      })
      return
    }

    await fulfillApi(route, [])
  })

  await page.goto("/sell")
  await expect(
    page.getByRole("heading", { name: "List your tickets" }),
  ).toBeVisible()
  await page.getByLabel("Select ticket partner").selectOption("__manual__")
  await page.getByLabel("Partner name").fill("MVP Partner")
  const partnerSearch = page.waitForResponse((response) => {
    const url = new URL(response.url())
    return (
      url.pathname.endsWith("/events/partners/search") &&
      url.searchParams.get("q") === "https://partner.example"
    )
  })
  await page
    .getByLabel("Partner website (optional)")
    .fill("https://partner.example")
  await partnerSearch
  await page.getByLabel("Event name").fill("MVP Live")
  await page
    .getByLabel("Event ticket page URL")
    .fill("https://partner.example/mvp-live")

  await page.getByRole("button", { name: "Continue to ticket uploads" }).click()

  await expect(page.getByText("Upload and screen tickets")).toBeVisible()
  await expect(
    page.getByText(/Draft saved\. Add the ticket files now/),
  ).toBeVisible()
  expect(listingPayload).toMatchObject({
    title: "MVP Live — General Admission",
    eventName: "MVP Live",
    partnerName: "MVP Partner",
    quantity: 1,
    price: 0,
    priceConfirmed: false,
  })
  expect(listingIdempotencyKey).toBeTruthy()
})
