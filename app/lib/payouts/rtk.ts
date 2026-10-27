import type { CreatePayoutAccountRequest } from "./types"
import {
  createPayoutAccount,
  getPayoutAccounts,
  startBachsSellerOnboarding,
} from "./client"
import { rtkApi, runQuery } from "../rtk-api"

const payoutsApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayoutAccounts:
      builder.query<Awaited<ReturnType<typeof getPayoutAccounts>>, void>({
        queryFn: () => runQuery(() => getPayoutAccounts()),
        providesTags: ["PayoutAccounts"],
      }),
    createPayoutAccount:
      builder.mutation<Awaited<ReturnType<typeof createPayoutAccount>>, {
        payload: CreatePayoutAccountRequest
        idempotencyKey?: string
      }>({
        queryFn: ({ payload, idempotencyKey }) =>
          runQuery(() => createPayoutAccount(payload, idempotencyKey)),
        invalidatesTags: ["PayoutAccounts"],
      }),
    startBachsSellerOnboarding:
      builder.mutation<Awaited<ReturnType<typeof startBachsSellerOnboarding>>, {
        idempotencyKey?: string
      } | void>({
        queryFn: (input) =>
          runQuery(() => startBachsSellerOnboarding(input?.idempotencyKey)),
      }),
  }),
})

export const {
  useGetPayoutAccountsQuery,
  useCreatePayoutAccountMutation,
  useStartBachsSellerOnboardingMutation,
} = payoutsApi
