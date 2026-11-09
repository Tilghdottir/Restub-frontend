# Restub Frontend

## Run with Docker

Build the production image and start the app on port 3000:

```sh
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://restub.onrender.com/api \
  -t restub-frontend .
docker run --rm -p 3000:3000 \
  -e APP_ORIGIN=http://localhost:3000 \
  restub-frontend
```

Set `NEXT_PUBLIC_ESCROWPAY_CHECKOUT_URL` as a build argument if the checkout integration is enabled. `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_BASE_PATH` are also build-time settings; the default base path is empty, so the container serves the site at `/`.
`APP_ORIGIN` is a runtime setting used to validate writes through the API proxy. Set it to the site's public origin in production (for example, `https://resale.co`); production requests are refused if it is missing or invalid.

## Browser tests

Install Playwright's Chromium browser once, then run the mocked buyer and
seller MVP flows:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

## CI/CD

GitHub Actions builds the Docker image for pull requests and publishes it to GitHub Container Registry on pushes to `main`. The `latest` and commit-SHA tags are published as `ghcr.io/tilghdottir/restub-frontend`.

Optional repository Actions variables:

- `NEXT_PUBLIC_API_BASE_URL` — API origin/path used by the app. Defaults to `https://restub.onrender.com/api`.
- `NEXT_PUBLIC_ESCROWPAY_CHECKOUT_URL` — checkout provider URL, if configured.
- `APP_ORIGIN` — runtime public origin used for API proxy write validation (for example, `https://resale.co`).

After the first publish, configure the GHCR package visibility in GitHub if the image should be publicly pullable.
