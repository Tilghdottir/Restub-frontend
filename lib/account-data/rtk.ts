import {
  getNotifications,
  getDashboardTickets,
  getPayments,
  getTickets,
  requestRefund,
} from "./client"
import { rtkApi, runQuery } from "../rtk-api"

const accountDataApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<Awaited<ReturnType<typeof getTickets>>, void>({
      queryFn: () => runQuery(() => getTickets()),
      providesTags: ["Tickets"],
    }),
    getDashboardTickets:
      builder.query<Awaited<ReturnType<typeof getDashboardTickets>>, void>({
        queryFn: () => runQuery(() => getDashboardTickets()),
        providesTags: ["Tickets", "Listings", "Order"],
      }),
    getPayments:
      builder.query<Awaited<ReturnType<typeof getPayments>>, string | undefined>(
        {
          queryFn: (cursor) => runQuery(() => getPayments(cursor)),
          providesTags: ["PaymentMethods", "Transactions"],
        },
      ),
    getNotifications:
      builder.query<Awaited<ReturnType<typeof getNotifications>>, void>({
        queryFn: () => runQuery(() => getNotifications()),
        providesTags: ["Notifications"],
      }),
    requestRefund: builder.mutation<Awaited<ReturnType<typeof requestRefund>>, {
      orderId: string
      idempotencyKey?: string
    }>({
      queryFn: ({ orderId, idempotencyKey }) =>
        runQuery(() => requestRefund(orderId, idempotencyKey)),
      invalidatesTags: ["Refunds", "Order", "Escrow", "Transactions"],
    }),
  }),
})

export const {
  useGetTicketsQuery,
  useGetDashboardTicketsQuery,
  useGetPaymentsQuery,
  useGetNotificationsQuery,
  useLazyGetPaymentsQuery,
  useRequestRefundMutation,
} = accountDataApi
