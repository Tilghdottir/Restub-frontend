import type { CheckoutRequest } from "./types"
import { getOrderDetail, submitCheckout } from "./client"
import { rtkApi, runQuery } from "../rtk-api"

const ordersApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderDetail:
      builder.query<Awaited<ReturnType<typeof getOrderDetail>>, string>({
        queryFn: (orderId) => runQuery(() => getOrderDetail(orderId)),
        providesTags: (_result, _error, orderId) => [
          { type: "Order", id: orderId },
        ],
      }),
    submitCheckout:
      builder.mutation<Awaited<ReturnType<typeof submitCheckout>>, {
        payload: CheckoutRequest
        idempotencyKey?: string
      }>({
        queryFn: ({ payload, idempotencyKey }) =>
          runQuery(() => submitCheckout(payload, idempotencyKey)),
        invalidatesTags: [
          "AccountSummary",
          "Order",
          "Listings",
          "Transactions",
        ],
      }),
  }),
})

export const {
  useGetOrderDetailQuery,
  useLazyGetOrderDetailQuery,
  useSubmitCheckoutMutation,
} = ordersApi
