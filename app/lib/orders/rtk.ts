import type { CheckoutRequest } from "./types"
import {
  acceptOrderDelivery,
  getEscrowOperationStatus,
  getOrderDelivery,
  getOrderDetail,
  releaseOrderEscrow,
  submitCheckout,
} from "./client"
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
    getEscrowOperationStatus:
      builder.query<Awaited<ReturnType<typeof getEscrowOperationStatus>>, string>(
        {
          queryFn: (orderId) =>
            runQuery(() => getEscrowOperationStatus(orderId)),
          providesTags: (_result, _error, orderId) => [
            { type: "Escrow", id: orderId },
          ],
        },
      ),
    getOrderDelivery:
      builder.query<Awaited<ReturnType<typeof getOrderDelivery>>, string>({
        queryFn: (orderId) => runQuery(() => getOrderDelivery(orderId)),
        providesTags: (_result, _error, orderId) => [
          { type: "Order", id: orderId },
        ],
      }),
    acceptOrderDelivery: builder.mutation<void, string>({
      queryFn: (orderId) => runQuery(() => acceptOrderDelivery(orderId)),
      invalidatesTags: (_result, _error, orderId) => [
        { type: "Order", id: orderId },
        { type: "Escrow", id: orderId },
      ],
    }),
    releaseOrderEscrow: builder.mutation<void, {
      orderId: string
      idempotencyKey?: string
    }>({
      queryFn: ({ orderId, idempotencyKey }) =>
        runQuery(() => releaseOrderEscrow(orderId, idempotencyKey)),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Order", id: orderId },
        { type: "Escrow", id: orderId },
        "Transactions",
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
  useGetEscrowOperationStatusQuery,
  useGetOrderDeliveryQuery,
  useAcceptOrderDeliveryMutation,
  useReleaseOrderEscrowMutation,
  useSubmitCheckoutMutation,
} = ordersApi
