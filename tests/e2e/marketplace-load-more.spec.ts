import { expect, test } from "@playwright/test"

function listings(start: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const id = `marketplace-listing-${start + index}`
    return {
      id,
      title: `Marketplace Event ${start + index}`,
      quantity: 2,
      price: 25000,
      status: "published",
    }
  })
}

test("marketplace loads cursor pages and keeps current listings after a page error", async ({
  page,
}) => {
  const requestedCursors: string[] = []
  let finalPageAvailable = false

  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url())
    const pathname = url.pathname.replace(/^.*\/api(?=\/)/, "")

    if (pathname === "/auth/me" || pathname === "/auth/refresh") {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Unauthorized" }),
      })
      return
    }

    if (pathname === "/listings") {
      const cursor = url.searchParams.get("cursor") ?? ""
      requestedCursors.push(cursor)

      if (cursor === "page-2" && !finalPageAvailable) {
        await route.fulfill({ status: 503, body: "Service unavailable" })
        return
      }

      const isFirstPage = cursor === ""
      const isFinalPage = cursor === "page-2"
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: listings(isFirstPage ? 1 : isFinalPage ? 5 : 3, 2),
          meta: {
            pagination: {
              nextCursor: isFirstPage
                ? "page-1"
                : isFinalPage
                  ? null
                  : "page-2",
              hasMore: !isFinalPage,
            },
          },
        }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [] }),
    })
  })

  await page.goto("/")

  const listingLinks = page.locator('a[href^="/listings/"]')
  await expect(listingLinks).toHaveCount(2)
  await page.getByRole("button", { name: "Load more listings" }).click()
  await expect(listingLinks).toHaveCount(4)
  await page.getByRole("button", { name: "Load more listings" }).click()

  await expect(page.locator("p[role=alert]")).toContainText(
    "Unable to load more listings",
  )
  await expect(listingLinks).toHaveCount(4)

  finalPageAvailable = true
  await page.getByRole("button", { name: "Load more listings" }).click()
  await expect(listingLinks).toHaveCount(6)
  await expect(
    page.getByRole("button", { name: "Load more listings" }),
  ).toHaveCount(0)
  expect(requestedCursors).toEqual(["", "page-1", "page-2", "page-2"])
})
